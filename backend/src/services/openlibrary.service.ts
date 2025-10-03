import axios from 'axios';
import { ImageService } from './image.service.js';

// Types pour l'API Open Library
interface OpenLibraryWork {
    key: string;
    title: string;
    description?: string | { value: string };
    covers?: number[];
    authors?: { author: { key: string } }[];
    first_publish_date?: string;
    subjects?: string[];
}

interface OpenLibraryAuthor {
    key: string;
    name: string;
    bio?: string | { value: string };
    birth_date?: string;
    death_date?: string;
    photos?: number[];
}

interface OpenLibraryEdition {
    key: string;
    isbn_10?: string[];
    isbn_13?: string[];
    title: string;
    number_of_pages?: number;
    languages?: { key: string }[];
    covers?: number[];
    publish_date?: string;
}

interface OpenLibrarySearchResult {
    docs: Array<{
        key: string;
        title: string;
        author_name?: string[];
        first_publish_year?: number;
        isbn?: string[];
        cover_i?: number;
        subject?: string[];
    }>;
    num_found: number;
}

export class OpenLibraryService {
    private readonly baseUrl = 'https://openlibrary.org';
    
    /**
     * Recherche de livres par titre, auteur ou ISBN
     */
    async searchBooks(query: string, limit = 20): Promise<OpenLibrarySearchResult> {
        try {
            const response = await axios.get(`${this.baseUrl}/search.json`, {
                params: {
                    q: query,
                    limit,
                    fields: 'key,title,author_name,author_key,first_publish_year,isbn,cover_i,subject'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur recherche Open Library:', error);
            throw new Error('Impossible de rechercher dans Open Library');
        }
    }

    /**
     * Recherche de livres par auteur specifique
     */
    async searchBooksByAuthor(authorName: string, limit = 50): Promise<OpenLibrarySearchResult> {
        try {
            console.log(`Recherche Open Library par auteur: "${authorName}"`);
            const response = await axios.get(`${this.baseUrl}/search.json`, {
                params: {
                    author: authorName,
                    limit,
                    fields: 'key,title,author_name,author_key,first_publish_year,isbn,cover_i,subject'
                }
            });
            console.log(`Open Library auteur: ${response.data.docs.length} livres trouves pour "${authorName}"`);
            return response.data;
        } catch (error) {
            console.error(`Erreur recherche auteur "${authorName}" Open Library:`, error);
            throw new Error(`Impossible de rechercher l'auteur ${authorName} dans Open Library`);
        }
    }

    /**
     * Recherche de livres par genre/sujet
     */
    async searchBooksByGenre(genre: string, limit = 20): Promise<OpenLibrarySearchResult> {
        try {
            const response = await axios.get(`${this.baseUrl}/search.json`, {
                params: {
                    subject: genre,
                    limit,
                    fields: 'key,title,author_name,author_key,first_publish_year,isbn,cover_i,subject'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur recherche par genre Open Library:', error);
            throw new Error('Impossible de rechercher par genre dans Open Library');
        }
    }

    /**
     * Recherche avancée avec filtres multiples
     */
    async searchBooksAdvanced(options: {
        title?: string;
        author?: string;
        genre?: string;
        isbn?: string;
        language?: string;
        publishedAfter?: number;
        publishedBefore?: number;
        limit?: number;
    }): Promise<OpenLibrarySearchResult> {
        const { limit = 20, ...filters } = options;
        const queryParts: string[] = [];
        
        if (filters.title) queryParts.push(`title:"${filters.title}"`);
        if (filters.author) queryParts.push(`author:"${filters.author}"`);
        if (filters.genre) queryParts.push(`subject:"${filters.genre}"`);
        if (filters.isbn) queryParts.push(`isbn:${filters.isbn}`);
        if (filters.language) queryParts.push(`language:${filters.language}`);
        if (filters.publishedAfter) queryParts.push(`first_publish_year:[${filters.publishedAfter} TO *]`);
        if (filters.publishedBefore) queryParts.push(`first_publish_year:[* TO ${filters.publishedBefore}]`);
        
        if (queryParts.length === 0) {
            throw new Error('Au moins un critère de recherche est requis');
        }
        
        const query = queryParts.join(' AND ');
        
        try {
            const response = await axios.get(`${this.baseUrl}/search.json`, {
                params: {
                    q: query,
                    limit,
                    fields: 'key,title,author_name,author_key,first_publish_year,isbn,cover_i,subject'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur recherche avancée Open Library:', error);
            throw new Error('Impossible d\'effectuer la recherche avancée');
        }
    }

    /**
     * Recupere les details d'un livre par sa cle Open Library
     */
    async getBookDetails(workKey: string): Promise<OpenLibraryWork> {
        try {
            const response = await axios.get(`${this.baseUrl}${workKey}.json`);
            return response.data;
        } catch (error) {
            console.error('Erreur recuperation livre:', error);
            throw new Error('Livre non trouve dans Open Library');
        }
    }

    /**
     * Recupere les details d'un auteur
     */
    async getAuthorDetails(authorKey: string): Promise<OpenLibraryAuthor> {
        try {
            if (!authorKey) {
                throw new Error('Cle auteur manquante');
            }
            
            // Extraire l'ID de l'auteur de la clé complète
            let authorId;
            if (authorKey.startsWith('/authors/')) {
                // Format: /authors/OL26320A -> OL26320A
                authorId = authorKey.replace('/authors/', '');
            } else if (authorKey.startsWith('authors/')) {
                // Format: authors/OL26320A -> OL26320A  
                authorId = authorKey.replace('authors/', '');
            } else {
                // Format direct: OL26320A
                authorId = authorKey;
            }
            
            const url = `${this.baseUrl}/authors/${authorId}.json`;
            console.log(`Requete Open Library auteur: ${url}`);
            
            const response = await axios.get(url, {
                timeout: 10000, // 10s timeout
                validateStatus: (status) => status < 400
            });
            
            console.log(`Auteur Open Library recu: "${response.data.name}"`);
            return response.data;
        } catch (error) {
            console.error('Erreur recuperation auteur:', error);
            throw new Error('Auteur non trouve dans Open Library');
        }
    }

    /**
     * Genere l'URL de couverture depuis l'ID de couverture
     */
    getCoverUrl(coverId: number, size: 'S' | 'M' | 'L' = 'M'): string {
        return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
    }

    /**
     * Genere l'URL de photo d'auteur
     */
    getAuthorPhotoUrl(photoId: number, size: 'S' | 'M' | 'L' = 'M'): string {
        return `https://covers.openlibrary.org/a/id/${photoId}-${size}.jpg`;
    }

    /**
     * Extrait l'ISBN le plus approprie d'un livre
     */
    getBestISBN(edition: OpenLibraryEdition): string | null {
        // Prefere ISBN-13, puis ISBN-10
        if (edition.isbn_13 && edition.isbn_13.length > 0) {
            return edition.isbn_13[0];
        }
        if (edition.isbn_10 && edition.isbn_10.length > 0) {
            return edition.isbn_10[0];
        }
        return null;
    }

    /**
     * Extrait la description d'un objet Open Library
     */
    extractDescription(description: string | { value: string } | undefined): string | undefined {
        if (!description) return undefined;
        if (typeof description === 'string') return description;
        return description.value;
    }

    /**
     * Convertit une date de publication Open Library en ann�e
     */
    extractPublicationYear(publishDate?: string): number | undefined {
        if (!publishDate) return undefined;
        const match = publishDate.match(/\d{4}/);
        return match ? parseInt(match[0]) : undefined;
    }

    /**
     * Recupere les editions d'un livre
     */
    async getBookEditions(workKey: string, limit = 10): Promise<OpenLibraryEdition[]> {
        try {
            const response = await axios.get(`${this.baseUrl}${workKey}/editions.json`, {
                params: { limit }
            });
            return response.data.entries || [];
        } catch (error) {
            console.error('Erreur recuperation editions:', error);
            return [];
        }
    }

    /**
     * Telecharge et traite une image de couverture depuis Open Library
     */
    async downloadAndProcessCover(coverId: number, bookId: number): Promise<string | null> {
        try {
            console.log(`Telechargement couverture Open Library: ${coverId} pour livre ${bookId}`);
            
            // Telecharger l'image en haute qualite
            const coverUrl = this.getCoverUrl(coverId, 'L');
            const response = await axios.get(coverUrl, {
                responseType: 'arraybuffer',
                timeout: 10000, // 10s timeout
                maxRedirects: 5, // Suivre les redirections vers archive.org
                validateStatus: (status) => status < 400 // Accepter les redirections
            });
            
            if (response.status !== 200) {
                console.log(`Erreur HTTP ${response.status} pour couverture ${coverId}`);
                return null;
            }
            
            const buffer = Buffer.from(response.data);
            
            // Valider que c'est bien une image
            const imageService = new ImageService();
            const isValid = await imageService.validateImage(buffer);
            
            if (!isValid) {
                console.log(`Image invalide pour couverture ${coverId}`);
                return null;
            }
            
            // Traiter l'image (creer toutes les tailles) avec cache coverId
            const processedImages = await imageService.processImage(buffer, 'book', bookId, coverId);
            
            console.log(`Couverture traitee avec succes: livre ${bookId}`);
            return processedImages; // JSON string avec toutes les tailles
            
        } catch (error) {
            console.error(`Erreur traitement couverture ${coverId}:`, error);
            return null;
        }
    }

    /**
     * Telecharge et traite une photo d'auteur depuis Open Library
     */
    async downloadAndProcessAuthorPhoto(photoId: number, authorId: number): Promise<string | null> {
        try {
            console.log(`Telechargement photo auteur Open Library: ${photoId} pour auteur ${authorId}`);
            
            // Telecharger la photo en haute qualite
            const photoUrl = this.getAuthorPhotoUrl(photoId, 'L');
            const response = await axios.get(photoUrl, {
                responseType: 'arraybuffer',
                timeout: 10000,
                maxRedirects: 5, // Suivre les redirections vers archive.org
                validateStatus: (status) => status < 400 // Accepter les redirections
            });
            
            if (response.status !== 200) {
                console.log(`Erreur HTTP ${response.status} pour photo auteur ${photoId}`);
                return null;
            }
            
            const buffer = Buffer.from(response.data);
            
            // Valider que c'est bien une image
            const imageService = new ImageService();
            const isValid = await imageService.validateImage(buffer);
            
            if (!isValid) {
                console.log(`Photo auteur invalide pour ${photoId}`);
                return null;
            }
            
            // Traiter la photo d'auteur avec cache photoId
            const processedImages = await imageService.processImage(buffer, 'author', authorId, photoId);
            
            console.log(`Photo auteur traitee avec succes: auteur ${authorId}`);
            return processedImages;
            
        } catch (error) {
            console.error(`Erreur traitement photo auteur ${photoId}:`, error);
            return null;
        }
    }

    /**
     * Recupere les infos d'une image avant telechargement
     */
    async getImageInfo(imageUrl: string): Promise<{ size?: number; type?: string } | null> {
        try {
            const response = await axios.head(imageUrl, { timeout: 5000 });
            
            return {
                size: response.headers['content-length'] ? parseInt(response.headers['content-length']) : undefined,
                type: response.headers['content-type']
            };
            
        } catch (error) {
            console.error('Erreur recuperation infos image:', error);
            return null;
        }
    }

    /**
     * Recupere les extraits, table des matières et infos ebook d'un livre par ISBN
     */
    async getBookExcerpts(isbn: string): Promise<{
        excerpts: Array<{ text: string; comment: string }>;
        tableOfContents: Array<{ title: string; pagenum: string; level: number }>;
        ebooks: Array<{ preview_url: string; availability: string; formats: any }>;
        title?: string;
        authors?: Array<{ name: string; url: string }>;
    }> {
        try {
            console.log(`Récupération extraits OpenLibrary pour ISBN: ${isbn}`);
            
            const response = await axios.get(`${this.baseUrl}/api/books`, {
                params: {
                    bibkeys: `ISBN:${isbn}`,
                    jscmd: 'data',
                    format: 'json'
                },
                timeout: 10000
            });
            
            const bookKey = `ISBN:${isbn}`;
            const bookData = response.data[bookKey];
            
            if (!bookData) {
                console.log(`Aucune donnée trouvée pour ISBN: ${isbn}`);
                return {
                    excerpts: [],
                    tableOfContents: [],
                    ebooks: []
                };
            }
            
            console.log(`Extraits trouvés pour "${bookData.title}": ${bookData.excerpts?.length || 0}`);
            
            return {
                excerpts: bookData.excerpts || [],
                tableOfContents: bookData.table_of_contents || [],
                ebooks: bookData.ebooks || [],
                title: bookData.title,
                authors: bookData.authors || []
            };
            
        } catch (error) {
            console.error(`Erreur récupération extraits ISBN ${isbn}:`, error);
            return {
                excerpts: [],
                tableOfContents: [],
                ebooks: []
            };
        }
    }
}

