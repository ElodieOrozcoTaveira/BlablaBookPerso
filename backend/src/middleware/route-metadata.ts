// Systeme de metadonnees automatiques pour les routes RBAC
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticateToken } from './auth.js';
import { requirePermission } from './permission.js';
import { validateBody, validateParams, validateQuery, validateAll } from './validation.js';
import { AuthenticatedRequest } from '../types/express.js';

/**
 * Interface pour les metadonnees de route
 */
interface RouteMetadata {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    path: string;
    permission?: string;
    resource: string;
    isPublic?: boolean;
    isOwnerOnly?: boolean; // Pour les routes ou seul le proprietaire peut modifier
    validation?: {
        body?: z.ZodSchema;
        params?: z.ZodSchema;
        query?: z.ZodSchema;
    };
    controller: Function;
}

/**
 * Factory pour creer automatiquement les middlewares d'une route
 */
function createRouteMiddleware(metadata: RouteMetadata) {
    const middlewares: Array<any> = [];

// 1. Validation (toujours en premier)
    if (metadata.validation?.query) {
        middlewares.push(validateQuery(metadata.validation.query));
    }
    if (metadata.validation?.params) {
        middlewares.push(validateParams(metadata.validation.params));
    }
    if (metadata.validation?.body && metadata.validation?.params) {
        middlewares.push(
            validateAll({
                params: metadata.validation.params,
                body: metadata.validation.body
            })
        );
    } else if (metadata.validation?.body) {
        middlewares.push(validateBody(metadata.validation.body));
    }

// 2. Authentification (si route protegee)
    if (!metadata.isPublic) {
        middlewares.push(authenticateToken);

// 3. Autorisation (si permission requise)
        if (metadata.permission) {
            middlewares.push(requirePermission(metadata.permission));
        }

// 4. Middleware proprietaire (si isOwnerOnly)
        if (metadata.isOwnerOnly) {
            middlewares.push(createOwnershipMiddleware(metadata.resource));
        }
    }

// 5. Controller (toujours en dernier)
    middlewares.push(metadata.controller);

    return middlewares;
}

/**
 * Middleware pour verifier la propriete d'une ressource
 */
function createOwnershipMiddleware(resource: string) {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id_user;
            const resourceId = req.params.id;

// Import dynamique du modele selon la ressource
            let item: any;

            switch (resource.toLowerCase()) {
                case 'libraries':
                    const LibraryModel = (await import('../models/Library.js')).default;
                    item = await LibraryModel.findByPk(resourceId);
                    if (item && item.id_user !== userId) {
                        return res.status(403).json({
                            error: 'Access denied',
                            message: 'You can only modify your own libraries',
                            resource
                        });
                    }
                    break;
                case 'notices':
                    const NoticeModel = (await import('../models/Notice.js')).default;
                    item = await NoticeModel.findByPk(resourceId);
                    if (item && item.id_user !== userId) {
                        return res.status(403).json({
                            error: 'Access denied',
                            message: 'You can only modify your own notices',
                            resource
                        });
                    }
                    break;
                case 'reading-lists':
                    const ReadingListModel = (await import('../models/ReadingList.js')).default;
                    item = await ReadingListModel.findByPk(resourceId);
                    if (item && item.id_user !== userId) {
                        return res.status(403).json({
                            error: 'Access denied',
                            message: 'You can only modify your own reading lists',
                            resource
                        });
                    }
                    break;
                default:
                    return next();
            }

            if (!item) {
                return res.status(404).json({
                    error: 'Resource not found',
                    resource,
                    id: resourceId
                });
            }

            next();
        } catch (error) {
            console.error('Ownership verification error:', error);
            res.status(500).json({
                error: 'Ownership verification failed'
            });
        }
    };
}

/**
 * Helper pour creer automatiquement les routes CRUD standard
 */
function createCRUDRoutes(config: {
    resource: string;
    controller: any;
    validation: {
        create?: z.ZodSchema;
        update?: z.ZodSchema;
        params?: z.ZodSchema;
        search?: z.ZodSchema;
    };
    permissions?: {
        create?: string;
        update?: string;
        delete?: string;
        read?: boolean;
    };
}) {
    const router = Router();
    const { resource, controller, validation, permissions } = config;

// GET /resource - Liste (configurable public/prive)
    if (permissions?.read !== undefined) {
        const getListMetadata: RouteMetadata = {
            method: 'GET',
            path: '/',
            resource,
            isPublic: permissions.read,
            validation: { query: validation.search },
            controller:
                controller.getAll ||
                controller.getAllGenres ||
                controller.getAllAuthors ||
                controller.getAllBooks
        };
        router.get('/', ...createRouteMiddleware(getListMetadata));
    }

// GET /resource/:id - Detail (configurable public/prive)
    if (permissions?.read !== undefined) {
        const getByIdMetadata: RouteMetadata = {
            method: 'GET',
            path: '/:id',
            resource,
            isPublic: permissions.read,
            validation: { params: validation.params },
            controller:
                controller.getById ||
                controller.getGenreById ||
                controller.getAuthorById ||
                controller.getBookById
        };
        router.get('/:id', ...createRouteMiddleware(getByIdMetadata));
    }

// POST /resource - Creation
    if (permissions?.create) {
        const createMetadata: RouteMetadata = {
            method: 'POST',
            path: '/',
            resource,
            permission: permissions.create,
            validation: { body: validation.create },
            controller:
                controller.create ||
                controller.createGenre ||
                controller.createAuthor ||
                controller.createBook
        };
        router.post('/', ...createRouteMiddleware(createMetadata));
    }

    // PUT /resource/:id - Modification complete
    if (permissions?.update) {
        const updateMetadata: RouteMetadata = {
            method: 'PUT',
            path: '/:id',
            resource,
            permission: permissions.update,
            validation: {
                params: validation.params,
                body: validation.update
            },
            controller:
                controller.update ||
                controller.updateGenre ||
                controller.updateAuthor ||
                controller.updateBook
        };
        router.put('/:id', ...createRouteMiddleware(updateMetadata));
    }

// PATCH /resource/:id - Modification partielle (meme logique que PUT)
    if (permissions?.update) {
        const patchMetadata: RouteMetadata = {
            method: 'PATCH',
            path: '/:id',
            resource,
            permission: permissions.update,
            validation: {
                params: validation.params,
                body: validation.update
            },
            controller:
                controller.update ||
                controller.updateGenre ||
                controller.updateAuthor ||
                controller.updateBook
        };
        router.patch('/:id', ...createRouteMiddleware(patchMetadata));
    }

// DELETE /resource/:id - Suppression
    if (permissions?.delete) {
        const deleteMetadata: RouteMetadata = {
            method: 'DELETE',
            path: '/:id',
            resource,
            permission: permissions.delete,
            validation: { params: validation.params },
            controller:
                controller.delete ||
                controller.deleteGenre ||
                controller.deleteAuthor ||
                controller.deleteBook
        };
        router.delete('/:id', ...createRouteMiddleware(deleteMetadata));
    }

    return router;
}

export {
    RouteMetadata,
    createRouteMiddleware,
    createCRUDRoutes,
    createOwnershipMiddleware
};
