// Configuration centralisée des permissions par ressource
export const RESOURCE_PERMISSIONS = {
    // Ressources avec permissions administratives
    authors: {
        read: true, // Public
        create: 'CREATE_AUTHOR',
        update: 'UPDATE_AUTHOR',
        delete: 'DELETE_AUTHOR'
    },
    
    genres: {
        read: true, // Public
        create: 'CREATE_GENRE',
        update: 'UPDATE_GENRE',
        delete: 'DELETE_GENRE'
    },
    
    books: {
        read: true, // Public
        create: 'CREATE_BOOK',
        update: 'UPDATE_BOOK',
        delete: 'DELETE_BOOK'
    },
    
    // Ressources avec propriété utilisateur
    libraries: {
        read: true, // Public (seules les publiques sont visibles)
        create: false, // Authentifié seulement
        update: false, // Propriétaire seulement (via ownership middleware)
        delete: false, // Propriétaire seulement (via ownership middleware)
        ownershipRequired: true
    },
    
    notices: {
        read: true, // Public
        create: false, // Authentifié seulement
        update: false, // Propriétaire seulement
        delete: false, // Propriétaire seulement
        ownershipRequired: true
    },
    
    'reading-lists': {
        read: false, // Authentifié pour voir les siennes
        create: false, // Authentifié seulement
        update: false, // Propriétaire seulement
        delete: false, // Propriétaire seulement
        ownershipRequired: true
    },
    
    // Ressources administratives
    users: {
        read: false, // Authentifié pour son profil
        create: 'ADMIN_USERS',
        update: 'ADMIN_USERS',
        delete: 'ADMIN_USERS',
        adminOnly: true
    },
    
    rates: {
        read: true, // Public
        create: false, // Authentifié seulement
        update: false, // Propriétaire seulement
        delete: false, // Propriétaire seulement
        ownershipRequired: true
    }
} as const;

/**
 * Type helper pour les permissions de ressource
 */
export type ResourcePermission = keyof typeof RESOURCE_PERMISSIONS;

/**
 * Fonction utilitaire pour obtenir la configuration d'une ressource
 */
export function getResourceConfig(resource: string) {
    return RESOURCE_PERMISSIONS[resource as ResourcePermission];
}

/**
 * Liste des permissions disponibles dans le système
 */
export const AVAILABLE_PERMISSIONS = [
    // CRUD de base
    'CREATE',
    'READ', 
    'UPDATE',
    'DELETE',
    
    // Gestion de contenu
    'CREATE_AUTHOR',
    'UPDATE_AUTHOR', 
    'DELETE_AUTHOR',
    'CREATE_GENRE',
    'UPDATE_GENRE',
    'DELETE_GENRE',
    'CREATE_BOOK',
    'UPDATE_BOOK',
    'DELETE_BOOK',
    // Ressources à ownership explicite (mises à jour / suppressions explicites)
    'UPDATE_LIBRARY',
    'DELETE_LIBRARY',
    'UPDATE_NOTICE',
    'DELETE_NOTICE',
    'UPDATE_RATE',
    'DELETE_RATE',
    'UPDATE_READING_LIST',
    'DELETE_READING_LIST',
    
    // Administration
    'ADMIN_USERS',
    'VIEW_USER_STATS',
    'MODERATE',
    'ADMIN',
    
    // Fonctionnalités spéciales  
    'EXPORT',
    'IMPORT'
] as const;

export type Permission = typeof AVAILABLE_PERMISSIONS[number];
