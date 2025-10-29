import { UserService, UserError } from "../services/UserService.js";
/**
 * CONTRÔLEUR UTILISATEUR
 *
 * Orchestre les requêtes HTTP et délègue la logique métier au service
 */
export class UserController {
    /**
     * GET /api/users
     * Récupère tous les utilisateurs (avec pagination)
     */
    static async getAllUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            // Délégation au service
            const result = await UserService.getAllUsers(page, limit);
            res.status(200).json({
                success: true,
                data: result.users,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit),
                },
            });
        }
        catch (error) {
            if (error instanceof UserError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    code: error.code,
                });
                return;
            }
            console.error("❌ Erreur getAllUsers:", error);
            res.status(500).json({
                success: false,
                message: "Erreur interne lors de la récupération des utilisateurs",
            });
        }
    }
    /**
     * GET /api/users/:id
     * Récupère un utilisateur par son ID
     */
    static async getUserById(req, res) {
        try {
            // 🔧 CORRECTION TypeScript : Vérification que l'ID existe
            if (!req.params.id) {
                res.status(400).json({
                    success: false,
                    message: "ID utilisateur manquant",
                });
                return;
            }
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) {
                res.status(400).json({
                    success: false,
                    message: "ID utilisateur invalide",
                });
                return;
            }
            // Délégation au service
            const user = await UserService.getUserById(userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: "Utilisateur non trouvé",
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            if (error instanceof UserError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    code: error.code,
                });
                return;
            }
            console.error("❌ Erreur getUserById:", error);
            res.status(500).json({
                success: false,
                message: "Erreur interne lors de la récupération de l'utilisateur",
            });
        }
    }
    /**
     * PUT /api/users/profile
     * Met à jour le profil de l'utilisateur connecté
     */
    static async updateProfile(req, res) {
        try {
            const sessionUser = req.session.user;
            if (!sessionUser) {
                res.status(401).json({
                    success: false,
                    message: "Session invalide",
                });
                return;
            }
            const updateData = req.body;
            // Délégation au service
            const updatedUser = await UserService.updateUserProfile(sessionUser.id, updateData);
            // Mise à jour de la session
            req.session.user = {
                id: updatedUser.id,
                email: updatedUser.email,
                username: updatedUser.username,
                firstname: updatedUser.firstname,
                lastname: updatedUser.lastname,
            };
            res.status(200).json({
                success: true,
                message: "Profil mis à jour avec succès",
                data: updatedUser,
            });
        }
        catch (error) {
            if (error instanceof UserError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    code: error.code,
                });
                return;
            }
            console.error("❌ Erreur updateProfile:", error);
            res.status(500).json({
                success: false,
                message: "Erreur interne lors de la mise à jour du profil",
            });
        }
    }
    /**
     * DELETE /api/users/:id
     * Supprime un utilisateur (admin seulement)
     */
    static async deleteUser(req, res) {
        try {
            //  Vérification que l'ID existe
            if (!req.params.id) {
                res.status(400).json({
                    success: false,
                    message: "ID utilisateur manquant",
                });
                return;
            }
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) {
                res.status(400).json({
                    success: false,
                    message: "ID utilisateur invalide",
                });
                return;
            }
            // Délégation au service
            await UserService.deleteUser(userId);
            res.status(200).json({
                success: true,
                message: "Utilisateur supprimé avec succès",
            });
        }
        catch (error) {
            if (error instanceof UserError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                    code: error.code,
                });
                return;
            }
            console.error("❌ Erreur deleteUser:", error);
            res.status(500).json({
                success: false,
                message: "Erreur interne lors de la suppression",
            });
        }
    }
}
//# sourceMappingURL=UserController.js.map