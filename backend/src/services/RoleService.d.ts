/**
 * SERVICE DES RÔLES
 *
 * Contient toute la logique métier liée aux rôles
 * Indépendant du protocole HTTP (réutilisable partout)
 */
export interface RoleData {
    id: number;
    name: string;
    description: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface CreateRoleData {
    name: string;
    description: string;
}
export interface UpdateRoleData {
    name?: string;
    description?: string;
}
export interface RoleSearchFilters {
    search?: string;
    limit?: number;
    offset?: number;
}
export declare class RoleError extends Error {
    code: string;
    statusCode: number;
    constructor(message: string, code: string, statusCode?: number);
}
export declare class RoleService {
    /**
     * Créer un nouveau rôle
     */
    static createRole(roleData: CreateRoleData): Promise<RoleData>;
    /**
     * Récupérer tous les rôles avec filtres optionnels
     */
    static getAllRoles(filters?: RoleSearchFilters): Promise<{
        roles: RoleData[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    /**
     * Récupérer un rôle par ID
     */
    static getRoleById(roleId: number): Promise<RoleData | null>;
    /**
     * Récupérer un rôle par nom
     */
    static getRoleByName(roleName: string): Promise<RoleData | null>;
    /**
     * Mettre à jour un rôle
     */
    static updateRole(roleId: number, updateData: UpdateRoleData): Promise<RoleData>;
    /**
     * Supprimer un rôle
     */
    static deleteRole(roleId: number): Promise<void>;
    /**
     * Rechercher des rôles par nom
     */
    static searchRoles(searchTerm: string, limit?: number): Promise<RoleData[]>;
    /**
     * Statistiques des rôles
     */
    static getRoleStats(): Promise<{
        totalRoles: number;
        systemRoles: number;
        customRoles: number;
        rolesWithUsers: number;
    }>;
    /**
     * Vérifier si un rôle existe
     */
    static roleExists(roleId: number): Promise<boolean>;
    /**
     * Récupérer les rôles par défaut du système
     */
    static getDefaultRoles(): Promise<RoleData[]>;
}
//# sourceMappingURL=RoleService.d.ts.map