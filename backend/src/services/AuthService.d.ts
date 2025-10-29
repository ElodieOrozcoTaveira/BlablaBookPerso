/**
 SERVICE D'AUTHENTIFICATION
 *
 * Contient toute la logique métier liée à l'authentification
 * Indépendant du protocole HTTP (réutilisable partout)
 */
export interface UserLogin {
    email: string;
    password: string;
}
export interface UserRegistration {
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
}
export interface UserData {
    id: number;
    email: string;
    username: string;
    firstname: string;
    lastname: string;
    createdAt?: Date;
}
export declare class AuthError extends Error {
    code: string;
    statusCode: number;
    constructor(message: string, code: string, statusCode?: number);
}
export declare class AuthService {
    /**
     *  Inscription d'un nouvel utilisateur
     */
    static registerUser(userData: UserRegistration): Promise<UserData>;
    /**
     * Authentification d'un utilisateur
     */
    static authenticateUser(credentials: UserLogin): Promise<UserData>;
    /**
     *Récupération des informations utilisateur par ID
     */
    static getUserById(userId: number): Promise<UserData | null>;
    /**
     * Validation d'existence d'un email
     */
    static checkEmailExists(email: string): Promise<boolean>;
    /**
     * Validation d'existence d'un nom d'utilisateur
     */
    static checkUsernameExists(username: string): Promise<boolean>;
    /**
     * Mise à jour du mot de passe d'un utilisateur
     */
    static updateUserPassword(userId: number, newPassword: string): Promise<void>;
    /**
     * Statistiques utilisateur (pour admin)
     */
    static getUserStats(): Promise<{
        totalUsers: number;
        newUsersThisMonth: number;
        activeUsers: number;
    }>;
}
//# sourceMappingURL=AuthService.d.ts.map