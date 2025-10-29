import { User } from "../models/User.js";
// Erreurs métier spécifiques
export class UserError extends Error {
    code;
    statusCode;
    constructor(message, code, statusCode = 400) {
        super(message);
        this.name = "UserError";
        this.code = code; // Assignation explicite pour éviter l'erreur ESLint
        this.statusCode = statusCode; // Assignation explicite pour éviter l'erreur ESLint
    }
}
export class UserService {
    /**
     * Récupérer tous les utilisateurs (avec pagination)
     */
    static async getAllUsers(page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            const { rows: users, count: total } = await User.findAndCountAll({
                attributes: { exclude: ["password"] },
                order: [["createdAt", "DESC"]],
                limit,
                offset,
            });
            return {
                users: users.map((user) => ({
                    id: user.dataValues.id,
                    email: user.dataValues.email,
                    username: user.dataValues.username,
                    firstname: user.dataValues.firstname,
                    lastname: user.dataValues.lastname,
                    createdAt: user.dataValues.createdAt,
                })),
                total,
            };
        }
        catch (error) {
            console.error("❌ UserService.getAllUsers:", error);
            throw new UserError("Erreur lors de la récupération des utilisateurs", "FETCH_USERS_ERROR", 500);
        }
    }
    /**
     * Récupérer un utilisateur par ID
     */
    static async getUserById(userId) {
        try {
            const user = await User.findByPk(userId, {
                attributes: { exclude: ["password"] },
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
                createdAt: user.dataValues.createdAt,
            };
        }
        catch (error) {
            console.error("❌ UserService.getUserById:", error);
            throw new UserError("Erreur lors de la récupération de l'utilisateur", "FETCH_USER_ERROR", 500);
        }
    }
    /**
     * Mettre à jour le profil utilisateur
     */
    static async updateUserProfile(userId, updateData) {
        try {
            // Vérifier que l'utilisateur existe
            const user = await User.findByPk(userId);
            if (!user) {
                throw new UserError("Utilisateur non trouvé", "USER_NOT_FOUND", 404);
            }
            // Vérifier l'unicité de l'email si modifié
            if (updateData.email && updateData.email !== user.dataValues.email) {
                const existingUser = await User.findOne({
                    where: { email: updateData.email },
                });
                if (existingUser) {
                    throw new UserError("Cet email est déjà utilisé", "EMAIL_ALREADY_EXISTS", 400);
                }
            }
            // Vérifier l'unicité du username si modifié
            if (updateData.username &&
                updateData.username !== user.dataValues.username) {
                const existingUser = await User.findOne({
                    where: { username: updateData.username },
                });
                if (existingUser) {
                    throw new UserError("Ce nom d'utilisateur est déjà pris", "USERNAME_ALREADY_EXISTS", 400);
                }
            }
            // Mise à jour
            await user.update(updateData);
            return {
                id: user.dataValues.id,
                email: user.dataValues.email,
                username: user.dataValues.username,
                firstname: user.dataValues.firstname,
                lastname: user.dataValues.lastname,
                createdAt: user.dataValues.createdAt,
            };
        }
        catch (error) {
            if (error instanceof UserError) {
                throw error;
            }
            console.error("❌ UserService.updateUserProfile:", error);
            throw new UserError("Erreur lors de la mise à jour", "UPDATE_USER_ERROR", 500);
        }
    }
    /**
     * Supprimer un utilisateur
     */
    static async deleteUser(userId) {
        try {
            const user = await User.findByPk(userId);
            if (!user) {
                throw new UserError("Utilisateur non trouvé", "USER_NOT_FOUND", 404);
            }
            await user.destroy();
        }
        catch (error) {
            if (error instanceof UserError) {
                throw error;
            }
            console.error("❌ UserService.deleteUser:", error);
            throw new UserError("Erreur lors de la suppression", "DELETE_USER_ERROR", 500);
        }
    }
}
//# sourceMappingURL=UserService.js.map