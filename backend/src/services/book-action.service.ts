import { Transaction, Op } from 'sequelize'
import sequelize from '../config/database.js'
import Book from '../models/Book.js'
import Author from '../models/Author.js'
import Genre from '../models/Genre.js'
import BookAuthor from '../models/BookAuthor.js'
import BookGenre from '../models/BookGenre.js'
import Rate from '../models/Rate.js'
import Notice from '../models/Notice.js'
import { OpenLibraryService } from './openlibrary.service.js'
import { AuthorService } from './author.service.js'

// Fonction de mapping des types d'action vers les raisons d'import
function mapActionTypeToImportReason(actionType: string): 'rate' | 'review' | 'library' | 'search' {
    switch (actionType) {
        case 'add_rate':
        case 'update_rate':
            return 'rate'
        case 'add_note':
        case 'add_review':
        case 'update_review':
            return 'review'
        case 'add_to_library':
        case 'add_to_reading_list':
            return 'library'
        default:
            return 'search'
    }
}

interface BookActionData {
    bookId: number
    userId: number
    action: 'rate' | 'review'
    data: {
        rating?: number
        content?: string
        title?: string
    }
    wasImported: boolean
}

interface BookPreparation {
    book: Book
    wasImported: boolean
    canRollback: boolean
}

export class BookActionService {
    // Je cree un verrou in-memory pour eviter les imports concurrents du meme livre
    // Pour un cluster multi-process, il faut migrer vers un lock distribue
    private static inProgress: Set<string> = new Set()

    // Etape 1: Je prepare un livre pour une action utilisateur
    // Si le livre n'existe pas, je l'importe temporairement
    public async prepareBookForAction(
        open_library_key: string,
        userId: number,
        actionType: string = 'search'
    ): Promise<BookPreparation> {
        const startTs = Date.now()
        const reason = mapActionTypeToImportReason(actionType)
        console.log(JSON.stringify({ evt: 'book_prepare_start', open_library_key, actionType, reason, userId, ts: startTs }))

        // J'attends si un import identique est deja en cours
        while (BookActionService.inProgress.has(open_library_key)) {
            await new Promise(res => setTimeout(res, 15))
        }

        // Je verifie si le livre existe deja
        let book = await Book.findOne({
            where: { open_library_key },
            include: [
                { model: Author, as: 'BookHasAuthors' },
                { model: Genre, as: 'BookHasGenres' }
            ]
        })

        let wasImported = false

        if (!book) {
            if (!book) {
                BookActionService.inProgress.add(open_library_key)
                try {
                    console.log(JSON.stringify({ evt: 'book_import_temp_start', open_library_key, userId, reason }))
                    book = await this.importBookTemporarily(open_library_key, userId, reason)
                    wasImported = true
                    console.log(JSON.stringify({ evt: 'book_import_temp_done', open_library_key, id_book: book.id_book, duration_ms: Date.now() - startTs }))
                } finally {
                    BookActionService.inProgress.delete(open_library_key)
                }
            }
        }

        console.log(JSON.stringify({ evt: 'book_prepare_end', open_library_key, id_book: book.id_book, wasImported, duration_ms: Date.now() - startTs }))
        return {
            book,
            wasImported,
            canRollback: wasImported
        }
    }

    // Etape 2: Je confirme l'action utilisateur
    // Je cree la note ou la review et je confirme l'import si necessaire
    public async commitAction(actionData: BookActionData): Promise<void> {
        console.log(`Je confirme l'action ${actionData.action} sur livre ${actionData.bookId}`)

        await sequelize.transaction(async (t: Transaction) => {
            if (actionData.action === 'rate' && actionData.data.rating) {
                await Rate.create({
                    id_user: actionData.userId,
                    id_book: actionData.bookId,
                    rating: actionData.data.rating
                }, { transaction: t })
                console.log(`J'ai cree le rating: ${actionData.data.rating}/5`)
            }

            if (actionData.action === 'review' && actionData.data.content) {
                await Notice.create({
                    id_user: actionData.userId,
                    id_book: actionData.bookId,
                    content: actionData.data.content,
                    title: actionData.data.title || undefined,
                    is_public: true,
                    is_spoiler: false
                }, { transaction: t })
                console.log(`J'ai cree la review`)
            }

            if (actionData.wasImported) {
                await Book.update({
                    import_status: 'confirmed'
                }, {
                    where: { id_book: actionData.bookId },
                    transaction: t
                })
                console.log(`J'ai confirme l'import pour livre ${actionData.bookId}`)
            }
        })
    }

    // Etape 3: J'annule l'action (rollback)
    // Je supprime le livre importe temporairement si pas d'autres engagements
    public async rollbackAction(bookId: number, wasImported: boolean): Promise<boolean> {
        if (!wasImported) {
            console.log(`Pas de rollback necessaire - le livre existait deja`)
            return false
        }

        console.log(`Je tente le rollback pour livre ${bookId}`)

        let rolledBack = false

        await sequelize.transaction(async (t: Transaction) => {
            const hasOtherEngagements = await this.checkOtherEngagements(bookId, t)

            if (!hasOtherEngagements) {
                await BookAuthor.destroy({
                    where: { id_book: bookId },
                    transaction: t
                })

                await BookGenre.destroy({
                    where: { id_book: bookId },
                    transaction: t
                })

                await Book.destroy({
                    where: {
                        id_book: bookId,
                        import_status: 'temporary'
                    },
                    transaction: t
                })

                console.log(`J'ai supprime le livre ${bookId} (rollback)`)
                rolledBack = true
            } else {
                console.log(`Je ne peux pas faire le rollback - livre ${bookId} a d'autres engagements`)
                await Book.update({
                    import_status: 'confirmed'
                }, {
                    where: { id_book: bookId },
                    transaction: t
                })
            }
        })

        return rolledBack
    }

    // J'importe temporairement un livre depuis OpenLibrary
    private async importBookTemporarily(
        open_library_key: string,
        userId: number,
        reason: string
    ): Promise<Book> {
        console.log(`J'importe temporairement: ${open_library_key}`)

        return await sequelize.transaction(async (t: Transaction) => {
            const openLibraryService = new OpenLibraryService()
            const bookData = await openLibraryService.getBookDetails(open_library_key)

            if (!bookData) {
                throw new Error(`Je ne peux pas recuperer les donnees du livre ${open_library_key}`)
            }

            const description = typeof bookData.description === 'string'
                ? bookData.description
                : bookData.description?.value

            const book = await Book.create({
                title: bookData.title || 'Titre inconnu',
                description,
                publication_year: bookData.first_publish_date
                    ? parseInt(bookData.first_publish_date.split('-')[0])
                    : undefined,
                page_count: undefined,
                cover_url: bookData.covers?.[0]
                    ? `https://covers.openlibrary.org/b/id/${bookData.covers[0]}-L.jpg`
                    : undefined,
                open_library_key: open_library_key,
                import_status: 'temporary',
                imported_by: userId,
                imported_at: new Date(),
                imported_reason: mapActionTypeToImportReason(reason)
            }, { transaction: t })

            if (bookData.authors && bookData.authors.length > 0) {
                const authorIds = []

                for (const authorData of bookData.authors) {
                    const authorService = new AuthorService()
                    const authorKey = authorData.author.key
                    const author = await authorService.findOrCreateByOpenLibraryKey(
                        'Auteur inconnu',
                        authorKey
                    )
                    authorIds.push(author.id_author)

                    this.processAuthorAvatarIfAvailable(author, authorKey)
                        .catch((error: any) => console.error(`Erreur avatar auteur ${author.id_author}:`, error))
                }

                const bookAuthorData = authorIds.map(authorId => ({
                    id_book: book.id_book,
                    id_author: authorId
                }))

                await BookAuthor.bulkCreate(bookAuthorData, { transaction: t })
                console.log(`J'ai lie ${authorIds.length} auteurs au livre`)
            }

            if (bookData.subjects && bookData.subjects.length > 0) {
                const genreIds = []

                const prioritizedSubjects = this.prioritizeSubjects(bookData.subjects)
                const selectedSubjects = prioritizedSubjects.slice(0, 15)
                console.log(`Je traite ${selectedSubjects.length} genres priorises sur ${bookData.subjects.length} disponibles`)

                for (const subject of selectedSubjects) {
                    const normalizedGenreName = this.normalizeGenreName(subject)

                    if (normalizedGenreName) {
                        const [genre] = await Genre.findOrCreate({
                            where: { name: normalizedGenreName },
                            defaults: {
                                name: normalizedGenreName,
                                description: `Genre importe depuis OpenLibrary`
                            },
                            transaction: t
                        })

                        genreIds.push(genre.id_genre)
                    }
                }

                if (genreIds.length > 0) {
                    const bookGenreData = genreIds.map(genreId => ({
                        id_book: book.id_book,
                        id_genre: genreId
                    }))

                    await BookGenre.bulkCreate(bookGenreData, { transaction: t })
                    console.log(`J'ai lie ${genreIds.length} genres au livre`)
                } else {
                    console.log(`Aucun genre valide trouve pour ce livre`)
                }
            } else {
                console.log(`Aucun genre disponible dans OpenLibrary pour ce livre`)
            }

            console.log(`J'ai termine l'import temporaire: "${book.title}"`)
            return book
        })
    }

    // Je verifie s'il y a d'autres engagements utilisateur sur ce livre
    private async checkOtherEngagements(bookId: number, transaction: Transaction): Promise<boolean> {
        const [rateCount, noticeCount] = await Promise.all([
            Rate.count({
                where: { id_book: bookId },
                transaction
            }),
            Notice.count({
                where: { id_book: bookId },
                transaction
            })
        ])

        return (rateCount + noticeCount) > 0
    }

    // Je nettoie les imports temporaires anciens
    public async cleanupTemporaryImports(olderThanMinutes: number = 60): Promise<number> {
        console.log(`Je nettoie les imports temporaires > ${olderThanMinutes}min`)

        const cutoffDate = new Date(Date.now() - olderThanMinutes * 60 * 1000)

        const deleted = await Book.destroy({
            where: {
                import_status: 'temporary',
                imported_at: {
                    [Op.lt]: cutoffDate
                }
            }
        })

        console.log(`J'ai supprime ${deleted} imports temporaires`)
        return deleted
    }

    // Je traite l'avatar d'un auteur si disponible dans OpenLibrary
    private async processAuthorAvatarIfAvailable(author: Author, authorKey: string): Promise<void> {
        try {
            console.log(`Je traite l'avatar pour auteur ${author.id_author} (${authorKey})`)

            const openLibraryService = new OpenLibraryService()
            const authorDetails = await openLibraryService.getAuthorDetails(authorKey)

            if (authorDetails.photos && authorDetails.photos.length > 0) {
                const authorService = new AuthorService()
                await authorService.processAuthorAvatarAsync(
                    authorDetails.photos[0],
                    author.id_author,
                    author
                )
                console.log(`Avatar traite pour auteur ${author.id_author}`)
            } else {
                console.log(`Pas d'avatar disponible pour auteur ${author.id_author}`)
            }

        } catch (error: any) {
            console.error(`Erreur traitement avatar auteur ${author.id_author}:`, error.message || error)
        }
    }

    // Je normalise le nom d'un genre pour la base de donnees
    private normalizeGenreName(subject: string): string | null {
        try {
            let normalized = subject.trim()

            if (normalized.length < 3) {
                return null
            }

            if (normalized.length > 50) {
                return null
            }

            const blacklist = [
                'fiction', 'non-fiction', 'literature', 'books', 'reading',
                'classic', 'general', 'miscellaneous', 'other', 'various',
                'collection', 'anthology', 'series'
            ]

            if (blacklist.includes(normalized.toLowerCase())) {
                return null
            }

            normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase()

            return normalized

        } catch (error: any) {
            console.error(`Erreur normalisation genre "${subject}":`, error.message || error)
            return null
        }
    }

    // Je priorise les subjects d'OpenLibrary pour garder les plus pertinents
    private prioritizeSubjects(subjects: string[]): string[] {
        try {
            const scoredSubjects = subjects.map(subject => ({
                subject,
                score: this.calculateSubjectScore(subject.toLowerCase())
            }))

            return scoredSubjects
                .sort((a, b) => b.score - a.score)
                .map(item => item.subject)

        } catch (error: any) {
            console.error('Erreur priorisation subjects:', error.message || error)
            return subjects
        }
    }

    // Je calcule le score de pertinence d'un subject
    private calculateSubjectScore(subject: string): number {
        let score = 0

        const literaryGenres = [
            'fantasy', 'science fiction', 'sci-fi', 'romance', 'thriller', 'mystery',
            'horror', 'adventure', 'drama', 'comedy', 'historical fiction',
            'biography', 'autobiography', 'memoir', 'poetry', 'philosophy',
            'crime', 'detective', 'western', 'dystopian', 'utopian'
        ]
        if (literaryGenres.some(genre => subject.includes(genre))) {
            score += 100
        }

        const targetAudience = [
            'juvenile', 'young adult', 'children', 'kids', 'teen', 'adult',
            'picture book', 'middle grade', 'early reader'
        ]
        if (targetAudience.some(audience => subject.includes(audience))) {
            score += 80
        }

        const majorThemes = [
            'magic', 'love', 'friendship', 'family', 'school', 'war', 'death',
            'coming of age', 'survival', 'quest', 'revenge', 'betrayal',
            'good vs evil', 'hero', 'villain', 'kingdom', 'empire'
        ]
        if (majorThemes.some(theme => subject.includes(theme))) {
            score += 70
        }

        const categories = [
            'historical', 'contemporary', 'urban', 'epic', 'dark', 'light',
            'classic', 'modern', 'traditional', 'experimental'
        ]
        if (categories.some(cat => subject.includes(cat))) {
            score += 50
        }

        const narrativeElements = [
            'magic system', 'dragons', 'wizards', 'knights', 'princess', 'prince',
            'vampire', 'werewolf', 'alien', 'robot', 'time travel', 'space'
        ]
        if (narrativeElements.some(element => subject.includes(element))) {
            score += 40
        }

        const placesAndTimes = [
            'england', 'america', 'france', 'japan', 'medieval', 'victorian',
            '19th century', '20th century', 'future', 'past', 'present'
        ]
        if (placesAndTimes.some(place => subject.includes(place))) {
            score += 20
        }

        const genericTerms = [
            'fiction', 'literature', 'books', 'reading', 'stories', 'novel',
            'collection', 'series', 'volume', 'edition', 'translation'
        ]
        if (genericTerms.some(term => subject.includes(term))) {
            score -= 30
        }

        if (subject.length <= 20 && subject.split(' ').length <= 3) {
            score += 10
        }

        if (subject.length > 40) {
            score -= 20
        }

        return Math.max(0, score)
    }
}
