import { Router } from "express";
import { RoleController } from "../controllers/RoleController.js";
import { requireAuth, } from "../middlewares/sessionMiddleware.js";
// Création du routeur pour les rôles
const router = Router();
/**
 * ROUTES DES RÔLES
 *
 * Routes disponibles :
 * - POST /api/roles → Créer un nouveau rôle (admin)
 * - GET /api/roles → Récupérer tous les rôles avec filtres
 * - GET /api/roles/search → Rechercher des rôles
 * - GET /api/roles/stats → Statistiques des rôles (admin)
 * - GET /api/roles/default → Récupérer les rôles par défaut
 * - GET /api/roles/name/:name → Récupérer un rôle par nom
 * - GET /api/roles/:id → Récupérer un rôle par ID
 * - PUT /api/roles/:id → Modifier un rôle (admin)
 * - DELETE /api/roles/:id → Supprimer un rôle (admin)
 */
/**
 * GET /api/roles/search
 * Rechercher des rôles par nom ou description
 * Accessible aux administrateurs uniquement
 */
router.get("/search", requireAuth, 
// TODO: Ajouter un middleware checkAdminRole
async (req, res) => {
    try {
        await RoleController.searchRoles(req, res);
    }
    catch (error) {
        console.error("❌ Erreur lors de la recherche de rôles:", error);
        res.status(500).json({
            success: false,
            message: "Erreur interne du serveur lors de la recherche",
        });
    }
});
/**
 * GET /api/roles/stats
 * Récupérer les statistiques des rôles
 * Accessible aux administrateurs uniquement
 */
router.get("/stats", requireAuth, 
// TODO: Ajouter un middleware checkAdminRole
async (req, res) => {
    try {
        await RoleController.getRoleStats(req, res);
    }
    catch (error) {
        console.error("❌ Erreur lors de la récupération des statistiques:", error);
        res.status(500).json({
            success: false,
            message: "Erreur interne du serveur lors de la récupération des statistiques",
        });
    }
});
/**
 * GET /api/roles/default
 * Récupérer les rôles par défaut du système
 * Accessible aux administrateurs uniquement
 */
router.get("/default", requireAuth, 
// TODO: Ajouter un middleware checkAdminRole
async (req, res) => {
    try {
        await RoleController.getDefaultRoles(req, res);
    }
    catch (error) {
        console.error("❌ Erreur lors de la récupération des rôles par défaut:", error);
        res.status(500).json({
            success: false,
            message: "Erreur interne du serveur lors de la récupération des rôles par défaut",
        });
    }
});
/**
 * GET /api/roles/name/:name
 * Récupérer un rôle par nom
 * Accessible aux administrateurs uniquement
 */
router.get("/name/:name", requireAuth, 
// TODO: Ajouter un middleware checkAdminRole
async (req, res) => {
    try {
        await RoleController.getRoleByName(req, res);
    }
    catch (error) {
        console.error("❌ Erreur lors de la récupération du rôle:", error);
        res.status(500).json({
            success: false,
            message: "Erreur interne du serveur lors de la récupération",
        });
    }
});
/**
 * POST /api/roles
 * Créer un nouveau rôle
 * Accessible aux administrateurs uniquement
 */
router.post("/", requireAuth, 
// TODO: Ajouter un middleware checkAdminRole
async (req, res) => {
    try {
        await RoleController.createRole(req, res);
    }
    catch (error) {
        console.error("❌ Erreur lors de la création du rôle:", error);
        res.status(500).json({
            success: false,
            message: "Erreur interne du serveur lors de la création",
        });
    }
});
/**
 * GET /api/roles
 * Récupérer tous les rôles avec filtres optionnels
 * Accessible aux administrateurs uniquement
 */
router.get("/", requireAuth, 
// TODO: Ajouter un middleware checkAdminRole
async (req, res) => {
    try {
        await RoleController.getAllRoles(req, res);
    }
    catch (error) {
        console.error("❌ Erreur lors de la récupération des rôles:", error);
        res.status(500).json({
            success: false,
            message: "Erreur interne du serveur lors de la récupération",
        });
    }
});
/**
 * GET /api/roles/:id
 * Récupérer un rôle par ID
 * Accessible aux administrateurs uniquement
 */
router.get("/:id", requireAuth, 
// TODO: Ajouter un middleware checkAdminRole
async (req, res) => {
    try {
        await RoleController.getRoleById(req, res);
    }
    catch (error) {
        console.error("❌ Erreur lors de la récupération du rôle:", error);
        res.status(500).json({
            success: false,
            message: "Erreur interne du serveur lors de la récupération",
        });
    }
});
/**
 * PUT /api/roles/:id
 * Modifier un rôle
 * Accessible aux administrateurs uniquement
 */
router.put("/:id", requireAuth, 
// TODO: Ajouter un middleware checkAdminRole
async (req, res) => {
    try {
        await RoleController.updateRole(req, res);
    }
    catch (error) {
        console.error("❌ Erreur lors de la modification du rôle:", error);
        res.status(500).json({
            success: false,
            message: "Erreur interne du serveur lors de la modification",
        });
    }
});
/**
 * DELETE /api/roles/:id
 * Supprimer un rôle
 * Accessible aux administrateurs uniquement
 */
router.delete("/:id", requireAuth, 
// TODO: Ajouter un middleware checkAdminRole
async (req, res) => {
    try {
        await RoleController.deleteRole(req, res);
    }
    catch (error) {
        console.error("❌ Erreur lors de la suppression du rôle:", error);
        res.status(500).json({
            success: false,
            message: "Erreur interne du serveur lors de la suppression",
        });
    }
});
export default router;
//# sourceMappingURL=roles.js.map