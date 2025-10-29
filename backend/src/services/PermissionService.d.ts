/**
 * SERVICE DES PERMISSIONS
 *
 * Contient toute la logique métier liée aux permissions du système
 * Indépendant du protocole HTTP (réutilisable partout)
 */
export interface PermissionData {
    id: number;
    label: string;
    action?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface CreatePermissionData {
    label: string;
    action?: string;
}
export interface UpdatePermissionData {
    label?: string;
    action?: string;
}
export interface PermissionSearchFilters {
    search?: string;
    limit?: number;
    offset?: number;
}
export declare class PermissionError extends Error {
    code: string;
    statusCode: number;
    constructor(message: string, code: string, statusCode?: number);
}
export declare class PermissionService {
    /**
     * Créer une nouvelle permission
     */
    static createPermission(permissionData: CreatePermissionData): Promise<PermissionData>;
    /**
     * Récupérer toutes les permissions avec filtres optionnels
     */
    static getAllPermissions(filters?: PermissionSearchFilters): Promise<{
        permissions: PermissionData[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    /**
     * Récupérer une permission par ID
     */
    static getPermissionById(permissionId: number): Promise<PermissionData | null>;
    /**
     * Récupérer une permission par libellé
     */
    static getPermissionByLabel(permissionLabel: string): Promise<PermissionData | null>;
    /**
     * Mettre à jour une permission
     */
    static updatePermission(permissionId: number, updateData: UpdatePermissionData): Promise<PermissionData>;
    /**
     * Supprimer une permission
     */
    static deletePermission(permissionId: number): Promise<void>;
    /**
     * Rechercher des permissions par libellé ou action
     */
    static searchPermissions(searchTerm: string, limit?: number): Promise<PermissionData[]>;
    /**
     * Statistiques des permissions
     */
    static getPermissionStats(): Promise<{
        totalPermissions: number;
        permissionsWithAction: number;
        permissionsWithoutAction: number;
    }>;
    /**
     * Vérifier si une permission existe
     */
    static permissionExists(permissionId: number): Promise<boolean>;
    /**
     * Récupérer toutes les permissions par ordre alphabétique
     */
    static getPermissionsAlphabetically(): Promise<PermissionData[]>;
    /**
     * Récupérer les permissions par catégorie d'action
     */
    static getPermissionsByActionCategory(category: string): Promise<PermissionData[]>;
}
//# sourceMappingURL=PermissionService.d.ts.map