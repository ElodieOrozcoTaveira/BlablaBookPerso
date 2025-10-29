/**
 * SERVICE UTILISATEUR
 *
 * Contient la logique métier pour la gestion des utilisateurs
 */ export interface UserProfile {
    id: number;
    email: string;
    username: string;
    firstname: string;
    lastname: string;
    createdAt: Date;
}
export interface UpdateUserData {
    username?: string;
    firstname?: string;
    lastname?: string;
    email?: string;
}
export declare class UserError extends Error {
    code: string;
    statusCode: number;
    constructor(message: string, code: string, statusCode?: number);
}
export declare class UserService {
    /**
     * Récupérer tous les utilisateurs (avec pagination)
     */
    static getAllUsers(page?: number, limit?: number): Promise<{
        users: UserProfile[];
        total: number;
    }>;
    /**
     * Récupérer un utilisateur par ID
     */
    static getUserById(userId: number): Promise<UserProfile | null>;
    /**
     * Mettre à jour le profil utilisateur
     */
    static updateUserProfile(userId: number, updateData: UpdateUserData): Promise<UserProfile>;
    /**
     * Supprimer un utilisateur
     */
    static deleteUser(userId: number): Promise<void>;
}
//# sourceMappingURL=UserService.d.ts.map