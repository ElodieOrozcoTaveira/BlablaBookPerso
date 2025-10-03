import { Request, Response } from 'express';
import { AuthorService } from '../services/author.service.js';

interface AuthenticatedRequest extends Request {
    session: Request['session'] & {
        user?: {
            id: number;
            username: string;
            role: string;
        };
    };
}

/**
 * Contrôleur pour les actions temporaires sur les auteurs
 * Suit le meme modele que BookActionController
 */
export class AuthorActionController {
    
    /**
     * Je prepare un auteur pour une action utilisateur
     * L'auteur est importe temporairement s'il n'existe pas
     */
    public static async prepareAction(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { open_library_key } = req.body;
            const userId = req.session.user?.id;

            if (!userId) {
                res.status(401).json({ error: 'Utilisateur non authentifié' });
                return;
            }

            if (!open_library_key) {
                res.status(400).json({ error: 'La clé OpenLibrary est requise' });
                return;
            }

            console.log(`Preparation action auteur: ${open_library_key} par utilisateur ${userId}`);

            const authorService = new AuthorService();
            const result = await authorService.prepareAuthorForAction(
                open_library_key,
                userId,
                'author_search'
            );

            res.json({
                success: true,
                data: {
                    author: result.author,
                    wasImported: result.wasImported,
                    canRollback: result.canRollback
                }
            });

        } catch (error: any) {
            console.error('❌ Erreur preparation action auteur:', error);
            res.status(500).json({ 
                error: 'Erreur lors de la préparation de l\'action auteur',
                details: error.message 
            });
        }
    }

    /**
     * Je confirme l'import temporaire d'un auteur
     */
    public static async commitAction(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { author_id } = req.body;
            const userId = req.session.user?.id;

            if (!userId) {
                res.status(401).json({ error: 'Utilisateur non authentifié' });
                return;
            }

            if (!author_id) {
                res.status(400).json({ error: 'L\'ID de l\'auteur est requis' });
                return;
            }

            console.log(`Confirmation action auteur ID: ${author_id} par utilisateur ${userId}`);

            const authorService = new AuthorService();
            await authorService.confirmAuthorImport(author_id, userId);

            res.json({
                success: true,
                message: 'Import auteur confirmé avec succès'
            });

        } catch (error: any) {
            console.error('❌ Erreur confirmation action auteur:', error);
            res.status(500).json({ 
                error: 'Erreur lors de la confirmation de l\'action auteur',
                details: error.message 
            });
        }
    }

    /**
     * J'annule l'import temporaire d'un auteur (rollback)
     */
    public static async rollbackAction(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { author_id } = req.body;
            const userId = req.session.user?.id;

            if (!userId) {
                res.status(401).json({ error: 'Utilisateur non authentifié' });
                return;
            }

            if (!author_id) {
                res.status(400).json({ error: 'L\'ID de l\'auteur est requis' });
                return;
            }

            console.log(`🔄 Rollback action auteur ID: ${author_id} par utilisateur ${userId}`);

            const authorService = new AuthorService();
            const wasDeleted = await authorService.rollbackAuthorImport(author_id, userId);

            res.json({
                success: true,
                message: wasDeleted 
                    ? 'Import auteur annulé (auteur supprimé)'
                    : 'Import auteur confirmé car utilisé par des livres',
                wasDeleted
            });

        } catch (error: any) {
            console.error('❌ Erreur rollback action auteur:', error);
            res.status(500).json({ 
                error: 'Erreur lors de l\'annulation de l\'action auteur',
                details: error.message 
            });
        }
    }
}
