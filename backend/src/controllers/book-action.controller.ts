import { Request, Response } from 'express';
import { BookActionService } from '../services/book-action.service.js';
import { AuthenticatedRequest } from '../types/express.js';
import '../types/session.js'; // Import des types de session etendus

export class BookActionController {
    private bookActionService = new BookActionService();

    // Etape 1: je prepare le livre pour une action (import temporaire si necessaire)
    public prepareBookAction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const { open_library_key, action_type } = req.body;
            const userId = req.user?.id_user;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Authentification requise'
                });
                return;
            }

            if (!open_library_key || !action_type) {
                res.status(400).json({
                    success: false,
                    error: 'open_library_key et action_type sont requis'
                });
                return;
            }

            console.log(`🎯 Je prepare l'action ${action_type} pour ${open_library_key}`);

            // Je prepare le livre (import temporaire si necessaire)
            const preparation = await this.bookActionService.prepareBookForAction(
                open_library_key,
                userId,
                action_type
            );

            // Je stocke l'etat en session pour le rollback eventuel
            req.session.pendingBookAction = {
                bookId: preparation.book.id_book,
                wasImported: preparation.wasImported,
                timestamp: Date.now(),
                open_library_key
            };

            console.log(`✅ Livre prepare: ${preparation.book.title} (wasImported: ${preparation.wasImported})`);

            res.json({
                success: true,
                data: {
                    book: {
                        id_book: preparation.book.id_book,
                        title: preparation.book.title,
                        description: preparation.book.description,
                        cover_url: preparation.book.cover_url,
                        publication_year: preparation.book.publication_year,
                        open_library_key: preparation.book.open_library_key,
                        BookHasAuthors: (preparation.book as any).BookHasAuthors
                    },
                    wasImported: preparation.wasImported,
                    canRollback: preparation.canRollback,
                    sessionId: req.sessionID
                },
                message: preparation.wasImported ? 
                    'Livre importe temporairement et pret pour action' :
                    'Livre existant pret pour action'
            });

        } catch (error: any) {
            console.error('Erreur preparation livre:', error);
            
            res.status(500).json({
                success: false,
                error: 'Impossible de preparer le livre pour action',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    };

    // Etape 2: je confirme l'action utilisateur (note/review)
    public commitBookAction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const { action, rating, content, title } = req.body;
            const userId = req.user?.id_user;
            const pendingAction = req.session.pendingBookAction;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Authentification requise'
                });
                return;
            }

            if (!pendingAction) {
                res.status(400).json({
                    success: false,
                    error: 'Aucune action en attente. Appelez /prepare-action d\'abord'
                });
                return;
            }

            // Je verifie que la session n'a pas expire (30 minutes max)
            const sessionAge = Date.now() - pendingAction.timestamp;
            if (sessionAge > 30 * 60 * 1000) {
                delete req.session.pendingBookAction;
                res.status(400).json({
                    success: false,
                    error: 'Session expiree. Relancez la preparation'
                });
                return;
            }

            console.log(`✅ Je confirme l'action ${action} sur livre ${pendingAction.bookId}`);

            // Je confirme l'action
            await this.bookActionService.commitAction({
                bookId: pendingAction.bookId,
                userId,
                action,
                data: { rating, content, title },
                wasImported: pendingAction.wasImported
            });

            // Je nettoie la session
            delete req.session.pendingBookAction;

            res.json({
                success: true,
                data: {
                    bookId: pendingAction.bookId,
                    action,
                    wasImported: pendingAction.wasImported
                },
                message: `${action} enregistre avec succes${pendingAction.wasImported ? ' (livre ajoute a la base)' : ''}`
            });

        } catch (error: any) {
            console.error('Erreur confirmation action:', error);
            
            res.status(500).json({
                success: false,
                error: 'Impossible d\'enregistrer l\'action',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    };

    // Etape 3: j'annule l'action (rollback si import temporaire)
    public rollbackBookAction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const pendingAction = req.session.pendingBookAction;

            if (!pendingAction) {
                res.status(400).json({
                    success: false,
                    error: 'Aucune action a annuler'
                });
                return;
            }

            console.log(`🔄 J'annule l'action pour livre ${pendingAction.bookId}`);

            // Je tente le rollback
            const rolledBack = await this.bookActionService.rollbackAction(
                pendingAction.bookId,
                pendingAction.wasImported
            );

            // Je nettoie la session
            delete req.session.pendingBookAction;

            res.json({
                success: true,
                data: {
                    bookId: pendingAction.bookId,
                    wasImported: pendingAction.wasImported,
                    rolledBack
                },
                message: rolledBack ? 
                    'Action annulee et import supprime' :
                    'Action annulee (livre conserve car autres engagements)'
            });

        } catch (error: any) {
            console.error('Erreur rollback action:', error);
            
            res.status(500).json({
                success: false,
                error: 'Impossible d\'annuler l\'action',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    };

    // Je nettoie les imports temporaires anciens (route admin)
    public cleanupTemporaryImports = async (req: Request, res: Response): Promise<void> => {
        try {
            const { olderThanMinutes = 60 } = req.query;

            console.log(`🧹 Je nettoie les imports temporaires > ${olderThanMinutes}min`);

            const deleted = await this.bookActionService.cleanupTemporaryImports(
                Number(olderThanMinutes)
            );

            res.json({
                success: true,
                data: {
                    deletedCount: deleted,
                    olderThanMinutes: Number(olderThanMinutes)
                },
                message: `${deleted} imports temporaires supprimes`
            });

        } catch (error: any) {
            console.error('Erreur cleanup imports:', error);
            
            res.status(500).json({
                success: false,
                error: 'Impossible de nettoyer les imports temporaires',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    };
}