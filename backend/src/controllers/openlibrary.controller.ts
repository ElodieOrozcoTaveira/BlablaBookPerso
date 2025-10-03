import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { OpenLibraryService } from '../services/openlibrary.service.js';
import Book from '../models/Book.js';
import Author from '../models/Author.js';
import Genre from '../models/Genre.js';
import { TypedRequest, AuthenticatedRequest } from '../types/express.js';
import axios from 'axios';

/**
 * Recherche de livres dans Open Library
 */
export const searchBooks = async (
    req: TypedRequest<{}, {
        query?: string;
        genre?: string;
        limit?: number;
    }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { query, genre, limit = 20 } = req.query;
        
        if (!query && !genre) {
            res.status(400).json({
                success: false,
                message: 'Parametre query ou genre requis'
            });
            return;
        }
        
        const openLibraryService = new OpenLibraryService();
        
        let results;
        if (genre && !query) {
            // Recherche par genre uniquement
            results = await openLibraryService.searchBooksByGenre(genre, limit);
        } else if (query && !genre) {
            // Recherche simple
            results = await openLibraryService.searchBooks(query, limit);
        } else {
            // Recherche avancee
            results = await openLibraryService.searchBooksAdvanced({
                title: query,
                genre,
                limit
            });
        }
        
        // Je formate les resultats pour l'API
        const formattedBooks = results.docs.map(book => ({
            open_library_key: book.key,
            title: book.title,
            authors: book.author_name || [],
            publication_year: book.first_publish_year,
            isbn: book.isbn?.[0],
            cover_url: book.cover_i ? openLibraryService.getCoverUrl(book.cover_i, 'M') : null,
            genres: book.subject || []
        }));
        
        res.json({
            success: true,
            data: formattedBooks,
            pagination: {
                total: results.num_found,
                page: 1,
                limit,
                totalPages: Math.ceil(results.num_found / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Recherche avancee dans Open Library
 */
export const searchBooksAdvanced = async (
    req: TypedRequest<{}, {
        title?: string;
        author?: string;
        genre?: string;
        isbn?: string;
        language?: string;
        publishedAfter?: number;
        publishedBefore?: number;
        limit?: number;
    }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const searchOptions = req.query;
        
        if (Object.keys(searchOptions).length === 0) {
            res.status(400).json({
                success: false,
                message: 'Au moins un critere de recherche requis'
            });
            return;
        }
        
        const openLibraryService = new OpenLibraryService();
        const results = await openLibraryService.searchBooksAdvanced(searchOptions);
        
        const formattedBooks = results.docs.map(book => ({
            open_library_key: book.key,
            title: book.title,
            authors: book.author_name || [],
            publication_year: book.first_publish_year,
            isbn: book.isbn?.[0],
            cover_url: book.cover_i ? openLibraryService.getCoverUrl(book.cover_i, 'M') : null,
            genres: book.subject || []
        }));
        
        res.json({
            success: true,
            data: formattedBooks,
            pagination: {
                total: results.num_found,
                page: 1,
                limit: searchOptions.limit || 20,
                totalPages: Math.ceil(results.num_found / (searchOptions.limit || 20))
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Recupere les details d'un livre depuis Open Library
 */
export const getBookDetails = async (
    req: TypedRequest<{ workKey: string }, {}>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const workKey = (req.params as { workKey: string }).workKey;
        
        const openLibraryService = new OpenLibraryService();
        const bookDetails = await openLibraryService.getBookDetails(workKey);
        
        const formattedBook = {
            open_library_key: bookDetails.key,
            title: bookDetails.title,
            description: openLibraryService.extractDescription(bookDetails.description),
            publication_year: openLibraryService.extractPublicationYear(bookDetails.first_publish_date),
            cover_url: bookDetails.covers?.[0] ? openLibraryService.getCoverUrl(bookDetails.covers[0], 'M') : null,
            subjects: bookDetails.subjects || [],
            authors_keys: bookDetails.authors?.map(a => a.author?.key) || []
        };
        
        res.json({
            success: true,
            data: formattedBook
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Recupere les details d'un auteur depuis Open Library  
 */
export const getAuthorDetails = async (
    req: TypedRequest<{ authorKey: string }, {}>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authorKey = (req.params as { authorKey: string }).authorKey;
        
        
        const openLibraryService = new OpenLibraryService();
        const authorDetails = await openLibraryService.getAuthorDetails(authorKey);
        
        const formattedAuthor = {
            open_library_key: authorDetails.key,
            name: authorDetails.name,
            bio: openLibraryService.extractDescription(authorDetails.bio),
            birth_date: authorDetails.birth_date,
            death_date: authorDetails.death_date,
            photo_url: authorDetails.photos?.[0] ? openLibraryService.getAuthorPhotoUrl(authorDetails.photos[0], 'M') : null
        };
        
        res.json({
            success: true,
            data: formattedAuthor
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Importe un livre depuis Open Library dans la base locale
 */
export const importBook = async (
    req: AuthenticatedRequest<{ open_library_key: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Utilisateur non authentifie'
            });
            return;
        }
        
        const { open_library_key } = req.body;
        
        if (!open_library_key) {
            res.status(400).json({
                success: false,
                message: 'Cle Open Library requise'
            });
            return;
        }
        
        // Verifie si le livre existe deja
        const existingBook = await Book.findOne({
            where: { open_library_key }
        });
        
        if (existingBook) {
            res.status(409).json({
                success: false,
                message: 'Livre deja importe',
                data: existingBook
            });
            return;
        }
        
        // Recupere les details depuis Open Library
        const openLibraryService = new OpenLibraryService();
        const bookDetails = await openLibraryService.getBookDetails(open_library_key);
        
        // Verifier que les donnees obligatoires sont presentes
        if (!bookDetails.title) {
            res.status(400).json({
                success: false,
                message: 'Titre du livre non disponible dans Open Library'
            });
            return;
        }
        
        // Je cree le livre en base
        const bookData: any = {
            title: bookDetails.title,
            description: openLibraryService.extractDescription(bookDetails.description),
            publication_year: openLibraryService.extractPublicationYear(bookDetails.first_publish_date),
            open_library_key,
            language: 'en' // Par defaut, on pourra ameliorer plus tard
        };
        
        const newBook = await Book.create(bookData);
        const bookId = newBook.get('id_book') as number;
        
        // Telecharger et traiter la couverture si disponible
        if (bookDetails.covers?.[0]) {
            console.log(`Traitement couverture pour livre ${bookId}`);
            const processedCover = await openLibraryService.downloadAndProcessCover(
                bookDetails.covers[0], 
                bookId
            );
            
            if (processedCover) {
                // Mettre a jour le livre avec l'URL des images traitees
                await newBook.update({ cover_url: processedCover });
                console.log(`Couverture mise a jour pour livre ${bookId}`);
            } else {
                console.log(`Impossible de traiter la couverture pour livre ${bookId}`);
            }
        }
        
        // Retourne le livre avec ses relations
        const bookWithRelations = await Book.findByPk(newBook.id_book, {
            include: [
                { model: Author, as: 'BookHasAuthors', through: { attributes: [] } },
                { model: Genre, as: 'BookHasGenres', through: { attributes: [] } }
            ]
        });
        
        res.status(201).json({
            success: true,
            data: bookWithRelations,
            message: 'Livre importe avec succes depuis Open Library'
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * Importe un auteur depuis Open Library dans la base locale
 */
export const importAuthor = async (
    req: AuthenticatedRequest<{ author_key: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Utilisateur non authentifie'
            });
            return;
        }
        
        const { author_key } = req.body;
        
        if (!author_key) {
            res.status(400).json({
                success: false,
                message: 'Cle auteur Open Library requise'
            });
            return;
        }
        
        // Verifie si l'auteur existe deja (on pourrait ajouter un champ open_library_key aux auteurs)
        const existingAuthor = await Author.findOne({
            where: { name: { [Op.iLike]: `%${author_key.split('/').pop()}%` } }
        });
        
        if (existingAuthor) {
            res.status(409).json({
                success: false,
                message: 'Auteur potentiellement deja present',
                data: existingAuthor
            });
            return;
        }
        
        // Recupere les details depuis Open Library
        const openLibraryService = new OpenLibraryService();
        const authorDetails = await openLibraryService.getAuthorDetails(author_key);
        
        // Je cree l'auteur en base
        const authorData = {
            name: authorDetails.name,
            bio: openLibraryService.extractDescription(authorDetails.bio),
            birth_date: authorDetails.birth_date ? new Date(authorDetails.birth_date) : undefined,
            death_date: authorDetails.death_date ? new Date(authorDetails.death_date) : undefined
        };
        
        const newAuthor = await Author.create(authorData);
        
        res.status(201).json({
            success: true,
            data: newAuthor,
            message: 'Auteur importe avec succes depuis Open Library'
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * Récupère les livres trending d'OpenLibrary
 */
export const getTrendingBooks = async (
    req: TypedRequest<{}, {
        period?: 'now' | 'today' | 'week' | 'month' | 'year' | 'all';
        limit?: number;
    }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { period = 'now', limit = 20 } = req.query;
        
        // URL OpenLibrary trending
        const trendingUrl = `https://openlibrary.org/trending/${period}.json`;
        
        const response = await axios.get(trendingUrl, {
            timeout: 10000,
            headers: {
                'User-Agent': 'BlaBlaBook/1.0 (contact@blablabook.com)'
            }
        });
        
        // Formater les résultats pour l'API
        const trendingBooks = response.data.works?.slice(0, limit).map((work: any) => ({
            open_library_key: work.key,
            title: work.title,
            authors: work.authors || [],
            publication_year: work.first_publish_year,
            cover_url: work.cover_id ? `https://covers.openlibrary.org/b/id/${work.cover_id}-M.jpg` : null,
            subjects: work.subject || [],
            lending: work.availability?.status,
            edition_count: work.edition_count
        })) || [];
        
        res.json({
            success: true,
            data: trendingBooks,
            meta: {
                period,
                total_returned: trendingBooks.length,
                source: 'OpenLibrary'
            }
        });
        
    } catch (error) {
        console.error('Trending books error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch trending books',
            message: 'Unable to retrieve trending books from OpenLibrary'
        });
    }
};

/**
 * Récupère les livres par sujet d'OpenLibrary
 */
export const getBooksBySubject = async (
    req: TypedRequest<{ subject: string }, {
        limit?: number;
        offset?: number;
    }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const subject = (req.params as { subject: string }).subject;
    
    try {
        const { limit = 20, offset = 0 } = req.query;
        
        // Validation du sujet
        if (!subject || subject.length < 2) {
            res.status(400).json({
                success: false,
                message: 'Subject parameter is required and must be at least 2 characters'
            });
            return;
        }
        
        // URL OpenLibrary subjects
        const subjectUrl = `https://openlibrary.org/subjects/${encodeURIComponent(subject)}.json?limit=${limit}&offset=${offset}`;
        
        const response = await axios.get(subjectUrl, {
            timeout: 10000,
            headers: {
                'User-Agent': 'BlaBlaBook/1.0 (contact@blablabook.com)'
            }
        });
        
        // Formater les résultats
        const subjectBooks = response.data.works?.map((work: any) => ({
            open_library_key: work.key,
            title: work.title,
            authors: work.authors?.map((a: any) => a.name) || [],
            publication_year: work.first_publish_year,
            cover_url: work.cover_id ? `https://covers.openlibrary.org/b/id/${work.cover_id}-M.jpg` : null,
            subjects: work.subject || [],
            lending: work.availability?.status,
            edition_count: work.edition_count
        })) || [];
        
        res.json({
            success: true,
            data: subjectBooks,
            meta: {
                subject: response.data.name || subject,
                total_works: response.data.work_count || 0,
                returned: subjectBooks.length,
                offset,
                limit,
                source: 'OpenLibrary'
            }
        });
        
    } catch (error) {
        console.error(`Subject books error for ${subject}:`, error);
        
        if ((error as any).response?.status === 404) {
            res.status(404).json({
                success: false,
                error: 'Subject not found',
                message: `The subject '${subject}' was not found in OpenLibrary`
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch books by subject',
                message: 'Unable to retrieve books from OpenLibrary'
            });
        }
    }
};

/**
 * Récupère les extraits et informations détaillées d'un livre par ISBN
 */
export const getBookExcerpts = async (
    req: TypedRequest<any, { isbn: string }>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { isbn } = req.params;
        
        // Validation de l'ISBN
        if (!isbn || isbn.length < 10) {
            res.status(400).json({
                success: false,
                message: 'ISBN valide requis (minimum 10 caractères)'
            });
            return;
        }

        const openLibraryService = new OpenLibraryService();
        const bookData = await openLibraryService.getBookExcerpts(isbn);

        res.json({
            success: true,
            data: {
                isbn,
                title: bookData.title,
                authors: bookData.authors,
                excerpts: bookData.excerpts,
                table_of_contents: bookData.tableOfContents,
                ebooks: bookData.ebooks,
                has_excerpts: bookData.excerpts.length > 0,
                has_ebooks: bookData.ebooks.length > 0,
                has_table_of_contents: bookData.tableOfContents.length > 0
            },
            meta: {
                isbn,
                excerpts_count: bookData.excerpts.length,
                ebooks_count: bookData.ebooks.length,
                source: 'OpenLibrary'
            },
            message: `${bookData.excerpts.length} extrait(s) trouvé(s) pour ISBN ${isbn}`
        });
    } catch (error) {
        next(error);
    }
};