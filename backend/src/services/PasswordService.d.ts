/**
 * Hachage et vérification des mots de passe
 * Utilise Argon2 (recommandé par l'OWASP)
 */
declare class PasswordService {
    /**
     * Hache un mot de passe avec Argon2
     * @param password - Le mot de passe en clair
     * @returns Le hash du mot de passe
     */
    static hashPassword(password: string): Promise<string>;
    /**
     * Vérifie un mot de passe contre son hash
     * @param password - Le mot de passe en clair
     * @param hash - Le hash stocké en base
     * @returns true si le mot de passe correspond, sinon false
     */
    static verifyPassword(password: string, hash: string): Promise<boolean>;
    /**
     * Valide la complexité d'un mot de passe
     * @param password - Le mot de passe à valider
     * @returns true si valide, false sinon
     */
    static validatePasswordStrength(password: string): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Génère un mot de passe temporaire sécurisé
     * @param length - Longueur du mot de passe (défaut: 12)
     * @returns Un mot de passe temporaire
     */
    static generateTemporaryPassword(length?: number): string;
}
export { PasswordService };
//# sourceMappingURL=PasswordService.d.ts.map