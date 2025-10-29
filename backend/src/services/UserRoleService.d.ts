/**
 * SERVICE DES RÔLES UTILISATEURS
 *
 * Gère l'association entre les utilisateurs et leurs rôles (RBAC)
 * Table de liaison pour le système de contrôle d'accès basé sur les rôles
 */
export interface UserRoleData {
    id: number;
    userId: number;
    roleId: number;
    assignedAt?: Date;
}
export interface CreateUserRoleData {
    userId: number;
    roleId: number;
}
export declare class UserRoleError extends Error {
    code: string;
    statusCode: number;
    constructor(message: string, code: string, statusCode?: number);
}
export declare class UserRoleService {
    /**
     * Assigner un rôle à un utilisateur
     */
    static assignRoleToUser(data: CreateUserRoleData): Promise<UserRoleData>;
    /**
     * Retirer un rôle d'un utilisateur
     */
    static removeRoleFromUser(userId: number, roleId: number): Promise<void>;
    /**
     * Récupérer tous les rôles d'un utilisateur
     */
    static getUserRoles(userId: number): Promise<UserRoleData[]>;
    /**
     * Récupérer tous les utilisateurs qui ont un rôle donné
     */
    static getRoleUsers(roleId: number): Promise<UserRoleData[]>;
    /**
     * Vérifier si un utilisateur a un rôle spécifique
     */
    static userHasRole(userId: number, roleId: number): Promise<boolean>;
    /**
     * Remplacer tous les rôles d'un utilisateur
     */
    static replaceUserRoles(userId: number, roleIds: number[]): Promise<UserRoleData[]>;
}
//# sourceMappingURL=UserRoleService.d.ts.map