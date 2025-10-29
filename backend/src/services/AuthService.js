import { User } from "../models/User.js";
import { PasswordService } from "./PasswordService.js";
import { Op } from "sequelize";
// Erreurs métier personnalisées
export class AuthError extends Error {
    code;
    statusCode;
    constructor(message, code, statusCode = 400) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = "AuthError";
    }
}
export class AuthService {
    /**
     *  Inscription d'un nouvel utilisateur
     */
    static async registerUser(userData) {
        const { firstname, lastname, username, email, password } = userData;
        // 1. Validation de l'email unique
        const existingUser = await User.findOne({
            where: {
                email: email.toLowerCase(),
            },
        });
        if (existingUser) {
            throw new AuthError("Un utilisateur avec cet email existe déjà", "USER_ALREADY_EXISTS", 409);
        }
        // 2. Validation du nom d'utilisateur unique
        const existingUsername = await User.findOne({
            where: {
                username: username,
            },
        });
        if (existingUsername) {
            throw new AuthError("Ce nom d'utilisateur est déjà pris", "USERNAME_TAKEN", 409);
        }
        // 3. Validation des règles métier du mot de passe
        if (!PasswordService.validatePasswordStrength(password)) {
            throw new AuthError("Le mot de passe ne respecte pas les critères de sécurité", "WEAK_PASSWORD", 400);
        }
        // 4. Hachage sécurisé du mot de passe
        const hashedPassword = await PasswordService.hashPassword(password);
        // 5. Création de l'utilisateur
        const newUser = await User.create({
            firstname,
            lastname,
            username,
            email: email.toLowerCase(),
            password: hashedPassword,
        });
        // 6. Retour des données utilisateur (sans le mot de passe)
        return {
            id: newUser.dataValues.id,
            email: newUser.dataValues.email,
            username: newUser.dataValues.username,
            firstname: newUser.dataValues.firstname,
            lastname: newUser.dataValues.lastname,
            createdAt: newUser.dataValues.created_at, // Utilise le nom de colonne réel
        };
    }
    /**
     * Authentification d'un utilisateur
     */
    static async authenticateUser(credentials) {
        const { email, password } = credentials;
        // 1. Recherche de l'utilisateur par email
        const user = await User.findOne({
            where: {
                email: email.toLowerCase(),
            },
        });
        if (!user) {
            // Message volontairement vague pour la sécurité
            throw new AuthError("Email ou mot de passe incorrect", "INVALID_CREDENTIALS", 401);
        }
        // 2. Vérification du mot de passe
        const isPasswordValid = await PasswordService.verifyPassword(password, user.dataValues.password);
        if (!isPasswordValid) {
            // Message volontairement vague pour la sécurité
            throw new AuthError("Email ou mot de passe incorrect", "INVALID_CREDENTIALS", 401);
        }
        // 3. Retour des données utilisateur authentifié
        return {
            id: user.dataValues.id,
            email: user.dataValues.email,
            username: user.dataValues.username,
            firstname: user.dataValues.firstname,
            lastname: user.dataValues.lastname,
        };
    }
    /**
     *Récupération des informations utilisateur par ID
     */
    static async getUserById(userId) {
        const user = await User.findByPk(userId, {
            attributes: [
                "id",
                "email",
                "username",
                "firstname",
                "lastname",
                "created_at", // Utilise le nom de colonne réel dans la BDD
            ],
        });
        if (!user) {
            return null;
        }
        return {
            id: user.dataValues.id,
            email: user.dataValues.email,
            username: user.dataValues.username,
            firstname: user.dataValues.firstname,
            lastname: user.dataValues.lastname,
            createdAt: user.dataValues.created_at, // Utilise le nom de colonne réel
        };
    }
    /**
     * Validation d'existence d'un email
     */
    static async checkEmailExists(email) {
        const user = await User.findOne({
            where: {
                email: email.toLowerCase(),
            },
            attributes: ["id"],
        });
        return !!user;
    }
    /**
     * Validation d'existence d'un nom d'utilisateur
     */
    static async checkUsernameExists(username) {
        const user = await User.findOne({
            where: {
                username: username,
            },
            attributes: ["id"],
        });
        return !!user;
    }
    /**
     * Mise à jour du mot de passe d'un utilisateur
     */
    static async updateUserPassword(userId, newPassword) {
        // 1. Validation du mot de passe
        if (!PasswordService.validatePasswordStrength(newPassword)) {
            throw new AuthError("Le nouveau mot de passe ne respecte pas les critères de sécurité", "WEAK_PASSWORD", 400);
        }
        // 2. Hachage du nouveau mot de passe
        const hashedPassword = await PasswordService.hashPassword(newPassword);
        // 3. Mise à jour en base
        const [updatedRows] = await User.update({ password: hashedPassword }, { where: { id: userId } });
        if (updatedRows === 0) {
            throw new AuthError("Utilisateur non trouvé", "USER_NOT_FOUND", 404);
        }
    }
    /**
     * Statistiques utilisateur (pour admin)
     */
    static async getUserStats() {
        // Nombre total d'utilisateurs
        const totalUsers = await User.count();
        // Nouveaux utilisateurs ce mois
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const newUsersThisMonth = await User.count({
            where: {
                created_at: {
                    // Utilise le nom de colonne réel dans la BDD
                    [Op.gte]: startOfMonth,
                },
            },
        });
        // TODO: Implémenter la logique des utilisateurs actifs
        // basée sur la dernière connexion ou activité
        const activeUsers = totalUsers; // Placeholder
        return {
            totalUsers,
            newUsersThisMonth,
            activeUsers,
        };
    }
}
//# sourceMappingURL=AuthService.js.map