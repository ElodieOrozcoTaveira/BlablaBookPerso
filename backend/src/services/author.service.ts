import { Op } from 'sequelize';
import Author from '../models/Author.js';
import { CreateAuthorInput, UpdateAuthorInput, AuthorSearchQuery } from '../validation/author.zod.js';
import { OpenLibraryService } from './openlibrary.service.js';

export class AuthorService {

    public async create(authorData: CreateAuthorInput): Promise<Author> {
        try {
            console.log(`Creation auteur: "${authorData.name}"`);
            
            const author = await Author.create(authorData);
            
            console.log(`Auteur cree avec succes: ID ${author.get('id_author')}`);
            return author;
            
        } catch (error) {
            console.error('Erreur creation auteur:', error);
            throw error;
        }
    }

    public async findById(id: number): Promise<Author | null> {
        try {
            const author = await Author.findByPk(id);
            
            if (!author) {
                console.log(`Auteur non trouve: ID ${id}`);
                return null;
            }
            
            console.log(`Auteur trouve: "${author.get('name')}"`);
            return author;
            
        } catch (error) {
            console.error(`Erreur recherche auteur ID ${id}:`, error);
            throw error;
        }
    }

    public async findAll(query: any) {
        try {
            const { page = 1, limit = 20, query: searchTerm, name, birth_year, death_year } = query as AuthorSearchQuery;
            const offset = (page - 1) * limit;

            const where: Record<string, any> = {};

            // Priorite: name > query pour eviter les conflits
            const finalSearchTerm = name || searchTerm;
            if (finalSearchTerm) {
                where['name'] = { [Op.iLike]: `%${finalSearchTerm}%` };
                console.log(`Recherche auteur par nom: "${finalSearchTerm}"`);
            }

            if (birth_year) {
                where['birth_year'] = birth_year;
                console.log(`Filtre par annee naissance: ${birth_year}`);
            }

            if (death_year) {
                where['death_year'] = death_year;
                console.log(`Filtre par annee deces: ${death_year}`);
            }

            const { rows: authors, count: total } = await Author.findAndCountAll({
                where,
                limit,
                offset,
                order: [['name', 'ASC']]
            });
            
            const totalPages = Math.ceil(total / limit);
            
            console.log(`Recherche auteurs: ${authors.length}/${total} resultats (page ${page}/${totalPages})`);
            
            return {
                authors,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            };
            
        } catch (error) {
            console.error('Erreur recherche auteurs:', error);
            throw error;
        }
    }

    public async update(id: number, updateData: UpdateAuthorInput): Promise<Author | null> {
        try {
            const author = await Author.findByPk(id);
            if (!author) {
                console.log(`Auteur a mettre a jour non trouve: ID ${id}`);
                return null;
            }
            
            console.log(`Mise a jour auteur: "${author.get('name')}"`);
            
            // Filtre les valeurs undefined
            const cleanData = Object.fromEntries(
                Object.entries(updateData).filter(([, value]) => value !== undefined)
            );
            
            await author.update(cleanData);
            await author.reload();
            
            console.log(`Auteur mis a jour avec succes: ID ${id}`);
            return author;
            
        } catch (error) {
            console.error(`Erreur mise a jour auteur ID ${id}:`, error);
            throw error;
        }
    }

    public async delete(id: number): Promise<boolean> {
        try {
            const author = await Author.findByPk(id);
            
            if (!author) {
                console.log(`Auteur a supprimer non trouve: ID ${id}`);
                return false;
            }
            
            const name = author.get('name');
            
            await author.destroy();
            
            console.log(`Auteur supprime: "${name}" (ID ${id})`);
            return true;
            
        } catch (error) {
            console.error(`Erreur suppression auteur ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Cree ou retrouve un auteur par sa cle Open Library
     */
    public async findOrCreateByOpenLibraryKey(authorName: string, openLibraryKey: string): Promise<Author> {
        try {
            // D'abord chercher par cle Open Library
            let author = await Author.findOne({
                where: { open_library_key: openLibraryKey }
            });

            if (author) {
                console.log(`Auteur trouve par cle Open Library: "${author.get('name')}" (${openLibraryKey})`);
                
                // Verifier si l'auteur a besoin d'enrichissement
                if (author.get('needs_enrichment')) {
                    console.log(`Auteur necessite enrichissement, requete Open Library...`);
                    console.log(`DEBUG: openLibraryKey recu = "${openLibraryKey}"`);
                    console.log(`DEBUG: author.get('open_library_key') = "${author.get('open_library_key')}"`);
                    await this.enrichAuthorWithOpenLibraryData(author, openLibraryKey);
                    await author.reload(); // Recharger pour avoir les nouvelles donnees
                }
                
                return author;
            }

            // Sinon chercher par nom (au cas ou il existerait sans cle)
            author = await Author.findOne({
                where: { 
                    name: { [Op.iLike]: authorName.trim() },
                    open_library_key: { [Op.is]: null as any }
                }
            });

            if (author) {
                // Mettre a jour avec la cle Open Library et recuperer les details
                await this.enrichAuthorWithOpenLibraryData(author, openLibraryKey);
                console.log(`Auteur existant enrichi avec donnees Open Library: "${authorName}" (${openLibraryKey})`);
                return author;
            }

            // Creer un nouveau auteur avec les donnees Open Library
            author = await this.createAuthorFromOpenLibrary(authorName, openLibraryKey);
            console.log(`Nouvel auteur cree depuis Open Library: "${authorName}" (${openLibraryKey})`);
            return author;

        } catch (error) {
            console.error(`Erreur creation/recherche auteur Open Library "${authorName}":`, error);
            throw error;
        }
    }

    /**
     * Recherche les livres d'un auteur depuis Open Library
     */
    public async searchAuthorBooks(authorName: string, limit = 30): Promise<any[]> {
        try {
            console.log(`Recherche livres de l'auteur: "${authorName}"`);
            
            const openLibraryService = new OpenLibraryService();
            const results = await openLibraryService.searchBooksByAuthor(authorName, limit);
            
            console.log(`Livres trouves pour "${authorName}": ${results.docs.length}`);
            return results.docs;
            
        } catch (error) {
            console.error(`Erreur recherche livres auteur "${authorName}":`, error);
            return [];
        }
    }

    /**
     * Enrichit un auteur existant avec les donnees Open Library
     */
    private async enrichAuthorWithOpenLibraryData(author: Author, openLibraryKey: string): Promise<void> {
        try {
            const openLibraryService = new OpenLibraryService();
            
            // Recuperer les details de l'auteur depuis Open Library
            const authorDetails = await openLibraryService.getAuthorDetails(openLibraryKey);
            
            const updateData: any = {
                open_library_key: openLibraryKey,
                bio: openLibraryService.extractDescription(authorDetails.bio),
                needs_enrichment: false // Marquer comme enrichi
            };

            // Traiter les dates si disponibles
            if (authorDetails.birth_date) {
                updateData.birth_date = this.parseOpenLibraryDate(authorDetails.birth_date);
            }
            if (authorDetails.death_date) {
                updateData.death_date = this.parseOpenLibraryDate(authorDetails.death_date);
            }

            // Mettre a jour l'auteur
            await author.update(updateData);

            // NOTE: je ne traite plus l'avatar automatiquement
            // Les avatars seront traites seulement lors d'actions utilisateur (coherence avec la nouvelle strategie)

        } catch (error) {
            console.error(`Erreur enrichissement auteur ${openLibraryKey}:`, error);
        }
    }

    /**
     * Cree un nouvel auteur avec les donnees Open Library
     */
    private async createAuthorFromOpenLibrary(authorName: string, openLibraryKey: string): Promise<Author> {
        try {
            const openLibraryService = new OpenLibraryService();
            
            // Recuperer les details de l'auteur depuis Open Library
            const authorDetails = await openLibraryService.getAuthorDetails(openLibraryKey);
            
            const authorData: any = {
                name: authorName.trim(),
                open_library_key: openLibraryKey,
                bio: openLibraryService.extractDescription(authorDetails.bio),
                needs_enrichment: false // Nouveaux auteurs sont enrichis immediatement
            };

            // Traiter les dates si disponibles
            if (authorDetails.birth_date) {
                authorData.birth_date = this.parseOpenLibraryDate(authorDetails.birth_date);
            }
            if (authorDetails.death_date) {
                authorData.death_date = this.parseOpenLibraryDate(authorDetails.death_date);
            }

            // Creer l'auteur
            const author = await Author.create(authorData);
            const authorId = author.get('id_author') as number;

            // NOTE: je ne traite plus l'avatar automatiquement
            // Les avatars seront traites seulement lors d'actions utilisateur (coherence avec la nouvelle strategie)

            return author;

        } catch (error) {
            console.error(`Erreur creation auteur depuis Open Library "${authorName}":`, error);
            
            // Fallback : creer un auteur basique sans les details Open Library
            return await Author.create({
                name: authorName.trim(),
                open_library_key: openLibraryKey,
                needs_enrichment: true // Marquer pour enrichissement ulterieur
            });
        }
    }

    /**
     * Traite l'avatar d'un auteur (appele explicitement depuis BookActionService)
     */
    public async processAuthorAvatarAsync(photoId: number, authorId: number, author: Author): Promise<void> {
        try {
            console.log(`Traitement avatar asynchrone: auteur ${authorId}`);
            
            const openLibraryService = new OpenLibraryService();
            const processedAvatar = await openLibraryService.downloadAndProcessAuthorPhoto(photoId, authorId);
            
            if (processedAvatar) {
                await author.update({ avatar_url: processedAvatar });
                console.log(`Avatar mis a jour pour auteur ${authorId}`);
            } else {
                console.log(`Impossible de traiter l'avatar pour auteur ${authorId}`);
            }
        } catch (error) {
            console.error(`Erreur traitement avatar asynchrone ${authorId}:`, error);
        }
    }

    /**
     * Parse une date Open Library (format variable : YYYY, DD MMM YYYY, etc.)
     */
    private parseOpenLibraryDate(dateStr: string): Date | null {
        try {
            if (!dateStr || dateStr.trim() === '') return null;
            
            // Extraire l'année au minimum
            const yearMatch = dateStr.match(/\d{4}/);
            if (!yearMatch) return null;
            
            const year = parseInt(yearMatch[0]);
            
            // Essayer de parser la date complete
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                // Fallback : juste l'année
                return new Date(`${year}-01-01`);
            }
            
            return date;
            
        } catch (error) {
            console.error(`Erreur parsing date Open Library "${dateStr}":`, error);
            return null;
        }
    }

    /**
     * Recupere uniquement la bio d'un auteur
     */
    public async getBio(id: number): Promise<string | null> {
        try {
            const author = await Author.findByPk(id);
            if (!author) {
                return null;
            }
            
            return author.get('bio') as string || null;
            
        } catch (error) {
            console.error(`Erreur recuperation bio auteur ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Recupere les URLs d'avatar d'un auteur (thumb et small seulement)
     */
    public async getAvatar(id: number): Promise<{ thumb?: string; small?: string } | null> {
        try {
            const author = await Author.findByPk(id);
            if (!author) {
                return null;
            }
            
            const avatarUrl = author.get('avatar_url') as string;
            if (!avatarUrl) {
                return null;
            }
            
            const avatarData = JSON.parse(avatarUrl);
            
            // Garder seulement thumb et small pour les auteurs
            return {
                thumb: avatarData.thumb || null,
                small: avatarData.small || null
            };
            
        } catch (error) {
            console.error(`Erreur recuperation avatar auteur ID ${id}:`, error);
            return null;
        }
    }

    /**
     * Recupere l'URL d'avatar pour une taille specifique
     */
    public async getAvatarBySize(id: number, size: 'thumb' | 'small'): Promise<string | null> {
        try {
            const avatarData = await this.getAvatar(id);
            if (!avatarData) {
                return null;
            }
            
            return avatarData[size] || null;
            
        } catch (error) {
            console.error(`Erreur recuperation avatar ${size} auteur ID ${id}:`, error);
            return null;
        }
    }

    // ===========================================
    // NOUVELLES METHODES D'IMPORT TEMPORAIRE
    // ===========================================

    /**
     * Je prepare un auteur pour une action utilisateur (comme BookActionService)
     * Si l'auteur n'existe pas, je l'importe temporairement
     */
    public async prepareAuthorForAction(
        open_library_key: string,
        userId: number,
        reason: 'author_search' | 'book_import' | 'user_interest' = 'author_search'
    ): Promise<{ author: Author; wasImported: boolean; canRollback: boolean }> {
        console.log(`🔍 Je prepare l'auteur ${open_library_key} pour action ${reason}`);
        
        // Je verifie si l'auteur existe deja
        let author = await Author.findOne({ 
            where: { open_library_key }
        });
        
        let wasImported = false;
        
        if (!author) {
            // J'importe temporairement l'auteur
            console.log(`📥 J'importe temporairement l'auteur ${open_library_key}`);
            author = await this.importAuthorTemporarily(open_library_key, userId, reason);
            wasImported = true;
        }
        
        return {
            author,
            wasImported,
            canRollback: wasImported
        };
    }

    /**
     * Je confirme l'import temporaire d'un auteur
     */
    public async confirmAuthorImport(authorId: number, userId: number): Promise<void> {
        try {
            const author = await Author.findByPk(authorId);
            
            if (!author) {
                throw new Error('Auteur non trouve');
            }

            if (author.import_status === 'confirmed') {
                return; // Deja confirme
            }

            if (author.imported_by !== userId) {
                throw new Error('Seul l\'importateur peut confirmer');
            }

            await author.update({
                import_status: 'confirmed',
                imported_reason: undefined // Plus besoin apres confirmation
            });

            console.log(`✅ Import auteur confirme: ${author.name} (ID: ${authorId})`);
            
        } catch (error) {
            console.error('❌ Erreur confirmation import auteur:', error);
            throw error;
        }
    }

    /**
     * J'annule l'import temporaire d'un auteur (rollback)
     */
    public async rollbackAuthorImport(authorId: number, userId: number): Promise<boolean> {
        try {
            const author = await Author.findByPk(authorId);
            
            if (!author) {
                throw new Error('Auteur non trouve');
            }

            if (author.import_status === 'confirmed') {
                throw new Error('Impossible d\'annuler un import confirme');
            }

            if (author.imported_by !== userId) {
                throw new Error('Seul l\'importateur peut annuler');
            }

            // Je verifie si l'auteur est utilise par des livres
            const hasBookUsage = await this.checkAuthorBookUsage(authorId);
            
            if (hasBookUsage) {
                // Je confirme plutot que supprimer si utilise
                await this.confirmAuthorImport(authorId, userId);
                console.log(`⚠️ Auteur ${authorId} utilise par des livres - confirme au lieu de supprimer`);
                return false;
            }

            // Je supprime l'auteur temporaire
            await author.destroy();
            console.log(`🗑️ Import auteur annule: ${author.name} (ID: ${authorId})`);
            
            return true;
            
        } catch (error) {
            console.error('❌ Erreur annulation import auteur:', error);
            throw error;
        }
    }

    /**
     * J'importe temporairement un auteur depuis OpenLibrary
     */
    private async importAuthorTemporarily(
        open_library_key: string,
        userId: number,
        reason: string
    ): Promise<Author> {
        console.log(`📥 J'importe temporairement l'auteur: ${open_library_key}`);
        
        try {
            // Je recupere les donnees depuis OpenLibrary
            const openLibraryService = new OpenLibraryService();
            const authorData = await openLibraryService.getAuthorDetails(open_library_key);
            
            if (!authorData) {
                throw new Error(`Je ne peux pas recuperer les donnees de l'auteur ${open_library_key}`);
            }

            // Je cree l'auteur avec flag temporaire
            const author = await Author.create({
                name: authorData.name || 'Auteur inconnu',
                bio: openLibraryService.extractDescription(authorData.bio),
                birth_date: authorData.birth_date ? this.parseOpenLibraryDate(authorData.birth_date) || undefined : undefined,
                death_date: authorData.death_date ? this.parseOpenLibraryDate(authorData.death_date) || undefined : undefined,
                open_library_key: open_library_key,
                
                // Metadonnees d'import temporaire
                import_status: 'temporary',
                imported_by: userId,
                imported_at: new Date(),
                imported_reason: reason as any,
                needs_enrichment: false // Deja enrichi lors de l'import
            });

            // Je traite l'avatar si disponible
            if (authorData.photos && authorData.photos.length > 0) {
                this.processAuthorAvatarAsync(authorData.photos[0], author.id_author, author)
                    .catch((error: any) => console.error(`Erreur avatar auteur ${author.id_author}:`, error));
            }

            console.log(`✅ J'ai termine l'import temporaire auteur: "${author.name}"`);
            return author;
            
        } catch (error: any) {
            console.error(`❌ Erreur import temporaire auteur ${open_library_key}:`, error.message || error);
            throw new Error(`Impossible d'importer temporairement l'auteur: ${error.message}`);
        }
    }

    /**
     * Je verifie si un auteur est utilise par des livres
     */
    private async checkAuthorBookUsage(authorId: number): Promise<boolean> {
        try {
            // Import dynamique pour eviter les dependances circulaires
            const { default: BookAuthor } = await import('../models/BookAuthor.js');
            
            const bookCount = await BookAuthor.count({
                where: { id_author: authorId }
            });

            return bookCount > 0;
            
        } catch (error) {
            console.error(`Erreur verification usage auteur ${authorId}:`, error);
            return false; // En cas d'erreur, on suppose que l'auteur n'est pas utilise
        }
    }
}