import { Op } from 'sequelize';
import Book from '../models/Book.js';
import Author from '../models/Author.js';
import Genre from '../models/Genre.js';
import BookAuthor from '../models/BookAuthor.js';
import { CreateBookInput, UpdateBookInput, BookSearchQuery } from '../validation/book.zod.js';
import { OpenLibraryService } from './openlibrary.service.js';
import { AuthorService } from './author.service.js';

export class BookService {

    public async create(bookData: CreateBookInput): Promise<Book> {
        try {
            const { author_ids, genre_ids, ...data } = bookData;
            
            console.log(`Creation livre: "${data.title}"`);
            
            // Creer le livre d'abord
            const book = await Book.create(data);
            
            // Gestion des relations Many-to-Many
            if (author_ids && author_ids.length > 0) {
                await book.setBookHasAuthors(author_ids);
                console.log(`Relations auteurs ajoutees: ${author_ids.length} auteurs`);
            }
            if (genre_ids && genre_ids.length > 0) {
                await book.setBookHasGenres(genre_ids);
                console.log(`Relations genres ajoutees: ${genre_ids.length} genres`);
            }
            
            console.log(`Livre cree avec succes: ID ${book.get('id_book')}`);
            return book;
            
        } catch (error) {
            console.error('Erreur creation livre:', error);
            throw error;
        }
    }

    public async findById(id: number): Promise<Book | null> {
        try {
            const book = await Book.findByPk(id, {
                include: [
                    { model: Author, as: 'BookHasAuthors', through: { attributes: [] } },
                    { model: Genre, as: 'BookHasGenres', through: { attributes: [] } }
                ]
            });
            
            if (!book) {
                console.log(`Livre non trouve: ID ${id}`);
                return null;
            }
            
            console.log(`Livre trouve: "${book.get('title')}"`);
            return book;
            
        } catch (error) {
            console.error(`Erreur recherche livre ID ${id}:`, error);
            throw error;
        }
    }

    public async findAll(query: any) {
        try {
            const { page = 1, limit = 20, query: searchQuery, isbn, publication_year, searchType = 'title', author, genre } = query as BookSearchQuery;
            
            console.log(`=== RECHERCHE HYBRIDE ===`);
            console.log(`SearchType: "${searchType}", Query: "${searchQuery}", Author: "${author}", Genre: "${genre}", ISBN: "${isbn}", Annee: ${publication_year}`);
            
            // ETAPE 1: Rechercher dans notre DB locale
            const localResults = await this.searchLocalBooks({
                searchType,
                query: searchQuery,
                author,
                genre,
                isbn,
                publication_year,
                limit: Math.min(limit, 50) // Limite raisonnable pour local
            });
            
            console.log(`Resultats locaux: ${localResults.length} livres`);
            
            let allBooks = [...localResults];
            let needsOpenLibrary = false;
            
            // ETAPE 2: Si pas assez de resultats ET on a une recherche
            const searchTerm = searchQuery || author || genre;
            if (localResults.length < limit && searchTerm) {
                needsOpenLibrary = true;
                console.log(`Pas assez de resultats locaux, recherche Open Library...`);
                
                try {
                    const openLibraryService = new OpenLibraryService();
                    let openLibResults;
                    
                    // Rechercher sur Open Library selon le type
                    if (searchType === 'author' || author) {
                        console.log(`Recherche Open Library par auteur: "${author || searchQuery || ''}"`);
                        openLibResults = await openLibraryService.searchBooksByAuthor(
                            author || searchQuery || '', 
                            limit - localResults.length
                        );
                    } else if (searchType === 'genre' || genre) {
                        console.log(`Recherche Open Library par genre: "${genre || searchQuery || ''}"`);
                        openLibResults = await openLibraryService.searchBooksByGenre(
                            genre || searchQuery || '', 
                            limit - localResults.length
                        );
                    } else {
                        // Par defaut recherche generale (titre)
                        openLibResults = await openLibraryService.searchBooks(
                            searchQuery || '', 
                            limit - localResults.length
                        );
                    }
                    
                    console.log(`Open Library: ${openLibResults.docs.length} resultats trouves`);
                    
                    // ETAPE 3: Importer automatiquement les nouveaux livres
                    for (const openLibBook of openLibResults.docs) {
                        try {
                            // Verifier si deja importe
                            const existingBook = await Book.findOne({
                                where: { open_library_key: openLibBook.key }
                            });
                            
                            if (!existingBook) {
                                console.log(`Import automatique: "${openLibBook.title}"`);
                                
                                // Importer le livre avec image
                                const importedBook = await this.importFromOpenLibrary(openLibBook);
                                if (importedBook) {
                                    allBooks.push(importedBook);
                                }
                            } else {
                                console.log(`Livre deja importe: "${openLibBook.title}"`);
                                allBooks.push(existingBook);
                            }
                        } catch (error) {
                            console.error(`Erreur import livre "${openLibBook.title}":`, error);
                        }
                    }
                } catch (error) {
                    console.error('Erreur recherche Open Library:', error);
                }
            }
            
            // ETAPE 4: Pagination sur les resultats combines
            const offset = (page - 1) * limit;
            const paginatedBooks = allBooks.slice(offset, offset + limit);
            const total = allBooks.length;
            const totalPages = Math.ceil(total / limit);
            
            console.log(`=== RESULTATS FINAUX ===`);
            console.log(`Total: ${total} livres (${localResults.length} locaux + ${allBooks.length - localResults.length} Open Library)`);
            console.log(`Page ${page}/${totalPages}: ${paginatedBooks.length} livres retournes`);
            
            return {
                books: paginatedBooks,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                },
                meta: {
                    source: needsOpenLibrary ? 'hybrid' : 'local',
                    localCount: localResults.length,
                    importedCount: allBooks.length - localResults.length
                }
            };
            
        } catch (error) {
            console.error('Erreur recherche hybride:', error);
            throw error;
        }
    }

    public async update(id: number, updateData: UpdateBookInput): Promise<Book | null> {
        try {
            const { author_ids, genre_ids, ...data } = updateData;
            
            const book = await Book.findByPk(id);
            if (!book) {
                console.log(`Livre a mettre a jour non trouve: ID ${id}`);
                return null;
            }
            
            console.log(`Mise a jour livre: "${book.get('title')}"`);
            
            // Mettre a jour les champs du livre
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([, value]) => value !== undefined)
            );
            await book.update(cleanData);
            
            // Gestion des relations Many-to-Many
            if (author_ids !== undefined) {
                await book.setBookHasAuthors(author_ids);
                console.log(`Relations auteurs mises a jour: ${author_ids.length} auteurs`);
            }
            if (genre_ids !== undefined) {
                await book.setBookHasGenres(genre_ids);
                console.log(`Relations genres mises a jour: ${genre_ids.length} genres`);
            }
            
            // Recharger avec les relations
            await book.reload({
                include: [
                    { model: Author, as: 'BookHasAuthors', through: { attributes: [] } },
                    { model: Genre, as: 'BookHasGenres', through: { attributes: [] } }
                ]
            });
            
            console.log(`Livre mis a jour avec succes: ID ${id}`);
            return book;
            
        } catch (error) {
            console.error(`Erreur mise a jour livre ID ${id}:`, error);
            throw error;
        }
    }

    public async delete(id: number): Promise<boolean> {
        try {
            const book = await Book.findByPk(id);
            
            if (!book) {
                console.log(`Livre a supprimer non trouve: ID ${id}`);
                return false;
            }
            
            const title = book.get('title');
            
            // Les relations Many-to-Many sont supprimees automatiquement
            await book.destroy();
            
            console.log(`Livre supprime: "${title}" (ID ${id})`);
            return true;
            
        } catch (error) {
            console.error(`Erreur suppression livre ID ${id}:`, error);
            throw error;
        }
    }

    // ======= METHODES HELPER POUR LA LOGIQUE HYBRIDE =======

    private async searchLocalBooks(searchParams: {
        searchType?: string;
        query?: string;
        author?: string;
        genre?: string;
        isbn?: string;  
        publication_year?: number;
        limit: number;
    }): Promise<Book[]> {
        const where: Record<string, any> = {};
        let include: any[] = [
            { model: Author, as: 'BookHasAuthors', through: { attributes: [] } },
            { model: Genre, as: 'BookHasGenres', through: { attributes: [] } }
        ];

        // Recherche selon le type specifie
        if (searchParams.searchType === 'title' && searchParams.query) {
            where['title'] = { [Op.iLike]: `%${searchParams.query}%` };
        } else if (searchParams.searchType === 'author' && (searchParams.author || searchParams.query)) {
            // Recherche par auteur via jointure
            include[0] = {
                model: Author,
                as: 'BookHasAuthors',
                through: { attributes: [] },
                where: {
                    name: { [Op.iLike]: `%${searchParams.author || searchParams.query}%` }
                },
                required: true // INNER JOIN pour filtrer
            };
        } else if (searchParams.searchType === 'genre' && (searchParams.genre || searchParams.query)) {
            // Recherche par genre via jointure
            include[1] = {
                model: Genre,
                as: 'BookHasGenres',
                through: { attributes: [] },
                where: {
                    name: { [Op.iLike]: `%${searchParams.genre || searchParams.query}%` }
                },
                required: true // INNER JOIN pour filtrer
            };
        } else if (searchParams.query) {
            // Recherche generale dans le titre par defaut
            where['title'] = { [Op.iLike]: `%${searchParams.query}%` };
        }

        // Filtres additionnels
        if (searchParams.isbn) {
            where['isbn'] = { [Op.iLike]: `%${searchParams.isbn}%` };
        }
        if (searchParams.publication_year) {
            where['publication_year'] = searchParams.publication_year;
        }

        const books = await Book.findAll({
            where,
            include,
            limit: searchParams.limit,
            order: [['created_at', 'DESC']]
        });

        console.log(`Recherche locale (${searchParams.searchType}): ${books.length} resultats`);
        return books;
    }

    private async importFromOpenLibrary(openLibBook: any): Promise<Book | null> {
        try {
            const openLibraryService = new OpenLibraryService();
            
            // Recuperer les details complets du livre
            const bookDetails = await openLibraryService.getBookDetails(openLibBook.key);
            
            // Creer le livre en base
            const bookData: any = {
                title: bookDetails.title,
                description: openLibraryService.extractDescription(bookDetails.description),
                publication_year: openLibraryService.extractPublicationYear(bookDetails.first_publish_date),
                isbn: openLibBook.isbn?.[0] || undefined,
                open_library_key: openLibBook.key,
                language: 'en'
            };
            
            const newBook = await Book.create(bookData);
            const bookId = newBook.get('id_book') as number;
            
            console.log(`Livre importe: "${bookDetails.title}" (ID ${bookId})`);
            
            // Importer et associer les auteurs
            await this.importAndAssociateAuthors(openLibBook, bookId);
            
            // Traiter la couverture si disponible (asynchrone pour ne pas bloquer)
            if (bookDetails.covers?.[0]) {
                this.processBookCoverAsync(bookDetails.covers[0], bookId, newBook)
                    .catch(error => console.error(`Erreur traitement couverture livre ${bookId}:`, error));
            }
            
            // Recharger avec relations pour retourner un livre complet
            await newBook.reload({
                include: [
                    { model: Author, as: 'BookHasAuthors', through: { attributes: [] } },
                    { model: Genre, as: 'BookHasGenres', through: { attributes: [] } }
                ]
            });
            
            return newBook;
            
        } catch (error) {
            console.error(`Erreur import Open Library "${openLibBook.title}":`, error);
            return null;
        }
    }

    private async processBookCoverAsync(coverId: number, bookId: number, book: Book): Promise<void> {
        try {
            console.log(`Traitement couverture asynchrone: livre ${bookId}`);
            
            const openLibraryService = new OpenLibraryService();
            const processedCover = await openLibraryService.downloadAndProcessCover(coverId, bookId);
            
            if (processedCover) {
                await book.update({ cover_url: processedCover });
                console.log(`Couverture mise a jour pour livre ${bookId}`);
            } else {
                console.log(`Impossible de traiter la couverture pour livre ${bookId}`);
            }
        } catch (error) {
            console.error(`Erreur traitement couverture asynchrone ${bookId}:`, error);
        }
    }

    private async importAndAssociateAuthors(openLibBook: any, bookId: number): Promise<void> {
        try {
            console.log(`=== DEBUG AUTEURS LIVRE ${bookId} ===`);
            console.log(`author_name:`, openLibBook.author_name);
            console.log(`author_key:`, openLibBook.author_key);
            
            if (!openLibBook.author_name || !openLibBook.author_key) {
                console.log(`Pas d'auteurs a importer pour le livre ${bookId}`);
                return;
            }

            const authorService = new AuthorService();
            const authorIds: number[] = [];

            // Traiter chaque auteur
            for (let i = 0; i < openLibBook.author_name.length; i++) {
                const authorName = openLibBook.author_name[i];
                const authorKey = openLibBook.author_key[i];

                if (authorName && authorKey) {
                    try {
                        const author = await authorService.findOrCreateByOpenLibraryKey(authorName, authorKey);
                        authorIds.push(author.get('id_author') as number);
                        console.log(`Auteur associe au livre ${bookId}: "${authorName}"`);
                    } catch (error) {
                        console.error(`Erreur import auteur "${authorName}":`, error);
                    }
                }
            }

            // Associer les auteurs au livre
            if (authorIds.length > 0) {
                console.log(`Tentative association auteurs au livre ${bookId}:`, authorIds);
                
                // Utilisation directe du modèle BookAuthor pour eviter les problemes d'association
                for (const authorId of authorIds) {
                    try {
                        await BookAuthor.create({
                            id_book: bookId,
                            id_author: authorId
                        });
                        console.log(`Association creee: Livre ${bookId} <-> Auteur ${authorId}`);
                    } catch (error) {
                        console.error(`Erreur association livre ${bookId} <-> auteur ${authorId}:`, error);
                    }
                }
                
                console.log(`Relations auteurs ajoutees au livre ${bookId}: ${authorIds.length} auteurs`);
            } else {
                console.log(`Aucun auteur a associer au livre ${bookId}`);
            }

        } catch (error) {
            console.error(`Erreur import auteurs livre ${bookId}:`, error);
        }
    }
}