/**
 * SERVICE DES PERMISSIONS DE RÔLES
 *
 * Gère l'association entre les rôles et leurs permissions (RBAC)
 * Table de liaison pour le système de contrôle d'accès basé sur les rôles
 */
export interface RolePermissionData {
    id: number;
    roleId: number;
    permissionId: number;
}
export interface CreateRolePermissionData {
    roleId: number;
    permissionId: number;
}
export declare class RolePermissionError extends Error {
    code: string;
    statusCode: number;
    constructor(message: string, code: string, statusCode?: number);
}
export declare class RolePermissionService {
    /**
     * Assigner une permission à un rôle
     */
    static assignPermissionToRole(data: CreateRolePermissionData): Promise<RolePermissionData>;
    /**
     * Retirer une permission d'un rôle
     */
    static removePermissionFromRole(roleId: number, permissionId: number): Promise<void>;
    /**
     * Récupérer toutes les permissions d'un rôle
     */
    static getRolePermissions(roleId: number): Promise<RolePermissionData[]>;
    /**
     * Récupérer tous les rôles qui ont une permission donnée
     */
    static getPermissionRoles(permissionId: number): Promise<RolePermissionData[]>;
}
//# sourceMappingURL=RolePermissionService.d.ts.map