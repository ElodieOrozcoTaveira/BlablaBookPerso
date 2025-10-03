// Factory automatique pour generer toutes les routes avec leurs permissions
import { Router } from 'express';
import { createCRUDRoutes, RouteMetadata, createRouteMiddleware } from '../middleware/route-metadata.js';
import { RESOURCE_PERMISSIONS, getResourceConfig } from '../config/permissions.js';

// Import des controleurs
import * as authorController from '../controllers/author.controller.js';
import * as genreController from '../controllers/genre.controller.js';
import * as bookController from '../controllers/book.controller.js';
import * as libraryController from '../controllers/library.controller.js';
import * as noticeController from '../controllers/notice.controller.js';
import * as userController from '../controllers/user.controller.js';

// Import des validations
import {
    createAuthorSchema,
    updateAuthorSchema, 
    authorParamsSchema,
    authorSearchSchema
} from '../validation/author.zod.js';

import {
    createGenreSchema,
    updateGenreSchema,
    genreParamsSchema, 
    genreSearchSchema
} from '../validation/genre.zod.js';

import {
    createLibrarySchema,
    updateLibrarySchema,
    libraryParamsSchema,
    librarySearchSchema
} from '../validation/library.zod.js';

import {
    createNoticeSchema,
    updateNoticeSchema,
    noticeParamsSchema,
    noticeSearchSchema
} from '../validation/notice.zod.js';

/**
 * Configuration des ressources avec leurs controleurs et validations
 */
const RESOURCE_CONFIGS = {
    authors: {
        controller: authorController,
        validation: {
            create: createAuthorSchema,
            update: updateAuthorSchema,
            params: authorParamsSchema,
            search: authorSearchSchema
        }
    },
    
    genres: {
        controller: genreController,
        validation: {
            create: createGenreSchema,
            update: updateGenreSchema,
            params: genreParamsSchema,
            search: genreSearchSchema
        }
    },
    
    libraries: {
        controller: libraryController,
        validation: {
            create: createLibrarySchema,
            update: updateLibrarySchema,
            params: libraryParamsSchema,
            search: librarySearchSchema
        }
    },
    
    notices: {
        controller: noticeController,
        validation: {
            create: createNoticeSchema,
            update: updateNoticeSchema,
            params: noticeParamsSchema,
            search: noticeSearchSchema
        }
    }
};

/**
 * Factory pour creer automatiquement un router avec permissions
 */
export function createResourceRouter(resourceName: keyof typeof RESOURCE_CONFIGS) {
    const config = RESOURCE_CONFIGS[resourceName];
    const permissions = getResourceConfig(resourceName);
    
    if (!config || !permissions) {
        throw new Error(`Configuration manquante pour la ressource: ${resourceName}`);
    }
    
    const router = createCRUDRoutes({
        resource: resourceName,
        controller: config.controller,
        validation: config.validation,
        permissions: {
            read: permissions.read,
            create: typeof permissions.create === 'string' ? permissions.create : undefined,
            update: typeof permissions.update === 'string' ? permissions.update : undefined,
            delete: typeof permissions.delete === 'string' ? permissions.delete : undefined
        }
    });

    // Ajouter les routes spécifiques si nécessaire
    addCustomRoutes(router, resourceName, config);
    
    return router;
}

/**
 * Ajouter les routes personnalisees selon la ressource
 */
function addCustomRoutes(router: Router, resourceName: string, config: any) {
    switch (resourceName) {
        case 'libraries':
            // GET /me/all - Mes bibliotheques
            const myLibrariesMetadata: RouteMetadata = {
                method: 'GET',
                path: '/me/all',
                resource: 'libraries',
                isPublic: false,
                controller: config.controller.getMyLibraries
            };
            router.get('/me/all', ...createRouteMiddleware(myLibrariesMetadata));
            break;
            
        case 'notices':
            // GET /me/all - Mes avis
            const myNoticesMetadata: RouteMetadata = {
                method: 'GET',
                path: '/me/all',
                resource: 'notices',
                isPublic: false,
                controller: config.controller.getMyNotices
            };
            router.get('/me/all', ...createRouteMiddleware(myNoticesMetadata));
            
            // GET /book/:book_id - Avis d'un livre
            const bookNoticesMetadata: RouteMetadata = {
                method: 'GET',
                path: '/book/:book_id',
                resource: 'notices',
                isPublic: true,
                validation: {
                    params: config.validation.params,
                    query: config.validation.search
                },
                controller: config.controller.getNoticesByBook
            };
            router.get('/book/:book_id', ...createRouteMiddleware(bookNoticesMetadata));
            break;
    }
}

/**
 * Cree tous les routers automatiquement
 */
export function createAllRouters() {
    return {
        authors: createResourceRouter('authors'),
        genres: createResourceRouter('genres'), 
        libraries: createResourceRouter('libraries'),
        notices: createResourceRouter('notices')
    };
}
