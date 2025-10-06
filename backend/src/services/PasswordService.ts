import argon2 from "argon2";

/**
 * Service pour gérer le hachage et la vérification des mots de passe
 * Utilise Argon2 (recommandé par l'OWASP)
 */
class PasswordService {
  /**
   * Hache un mot de passe avec Argon2
   * @param password - Le mot de passe en clair
   * @returns Le hash du mot de passe
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      // Configuration Argon2 (paramètres sécurisés)
      const hash = await argon2.hash(password, {
        type: argon2.argon2id, // Version la plus sécurisée
        memoryCost: 2 ** 16, // 64 MB de mémoire
        timeCost: 3, // 3 itérations
        parallelism: 1, // 1 thread
      });

      return hash;
    } catch (error) {
      console.error("Erreur lors du hachage du mot de passe:", error);
      throw new Error("Impossible de hasher le mot de passe");
    }
  }

  /**
   * Vérifie un mot de passe contre son hash
   * @param password - Le mot de passe en clair
   * @param hash - Le hash stocké en base
   * @returns true si le mot de passe correspond, false sinon
   */
  static async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch (error) {
      console.error("Erreur lors de la vérification du mot de passe:", error);
      return false;
    }
  }

  /**
   * Valide la complexité d'un mot de passe
   * @param password - Le mot de passe à valider
   * @returns true si valide, false sinon
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Longueur minimale
    if (password.length < 8) {
      errors.push("Le mot de passe doit contenir au moins 8 caractères");
    }

    // Au moins une majuscule
    if (!/[A-Z]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins une majuscule");
    }

    // Au moins une minuscule
    if (!/[a-z]/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins une minuscule");
    }

    // Au moins un chiffre
    if (!/\d/.test(password)) {
      errors.push("Le mot de passe doit contenir au moins un chiffre");
    }

    // Au moins un caractère spécial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push(
        "Le mot de passe doit contenir au moins un caractère spécial"
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Génère un mot de passe temporaire sécurisé
   * @param length - Longueur du mot de passe (défaut: 12)
   * @returns Un mot de passe temporaire
   */
  static generateTemporaryPassword(length: number = 12): string {
    const charset =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";

    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
  }
}

export { PasswordService };
