import { Router } from "express";
// Import du contrôleur
import { LibraryController } from "../controllers/LibraryController.js";
// Import des middlewares
import { requireAuth, } from "../middlewares/sessionMiddleware.js";
// Création du routeur pour les bibliothèques
const router = Router();
/**
 * ROUTES DES BIBLIOTHÈQUES
 *
 * Routes disponibles :
 * - POST /api/libraries → Créer une nouvelle bibliothèque
 * - GET /api/libraries → Récupérer toutes les bibliothèques de l'utilisateur
 * - GET /api/libraries/stats → Récupérer les statistiques des bibliothèques
 * - GET /api/libraries/:id → Récupérer une bibliothèque par ID
 * - PUT /api/libraries/:id → Mettre à jour une bibliothèque
 * - DELETE /api/libraries/:id → Supprimer une bibliothèque
 *
 * Toutes les routes nécessitent une authentification (session valide)
 */
/**
 * POST /api/libraries
 * Créer une nouvelle bibliothèque
 * Body: { name: string }
 */
router.post("/", requireAuth, async (req, res) => {
    try {
        await LibraryController.createLibrary(req, res);
    }
    catch (error) {
        console.error("❌ Erreur lors de la création de la bibliothèque:", error);
        res.status(500).json({
            success: false,
            message: "Erreur interne du serveur lors de la création de la bibliothèque",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
});
/**
 * GET /api/libraries
 * Récupérer toutes les bibliothèques de l'utilisateur connecté
 * Query params optionnels: ?search=terme
 */
router.get("/", requireAuth, async (req, res) => {
    try {
        await LibraryController.getUserLibraries(req, res);
    }
    catch (error) {
        console.error("❌ Erreur lors de la récupération des bibliothèques:", error);
        res.status(500).json({
            success: false,
            message: "Erreur interne du serveur lors de la récupération des bibliothèques",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
});
/**
 * GET /api/libraries/stats
 * Récupérer les statistiques des bibliothèques de l'utilisateur
 * IMPORTANT: Cette route doit être avant /:id pour éviter les conflits
 */
router.get("/stats", requireAuth, async (req, res) => {
    try {
        await LibraryController.getLibraryStats(req, res);
    }
    catch (error) {
        console.error("❌ Erreur lors de la récupération des statistiques:", error);
        res.status(500).json({
            success: false,
            message: "Erreur interne du serveur lors de la récupération des statistiques",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
});
/**
 * GET /api/libraries/:id
 * Récupérer une bibliothèque spécifique par ID
 */
router.get("/:id", requireAuth, async (req, res) => {
    try {
        await LibraryController.getLibraryById(req, res);
    }
    catch (error) {
        console.error("❌ Erreur lors de la récupération de la bibliothèque:", error);
        res.status(500).json({
            success: false,
            message: "Erreur interne du serveur lors de la récupération de la bibliothèque",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
});
/**
 * PUT /api/libraries/:id
 * Mettre à jour une bibliothèque
 * Body: { name: string }
 */
router.put("/:id", requireAuth, async (req, res) => {
    try {
        await LibraryController.updateLibrary(req, res);
    }
    catch (error) {
        console.error("❌ Erreur lors de la mise à jour de la bibliothèque:", error);
        res.status(500).json({
            success: false,
            message: "Erreur interne du serveur lors de la mise à jour de la bibliothèque",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
});
/**
 * DELETE /api/libraries/:id
 * Supprimer une bibliothèque (soft delete)
 */
router.delete("/:id", requireAuth, async (req, res) => {
    try {
        await LibraryController.deleteLibrary(req, res);
    }
    catch (error) {
        console.error("❌ Erreur lors de la suppression de la bibliothèque:", error);
        res.status(500).json({
            success: false,
            message: "Erreur interne du serveur lors de la suppression de la bibliothèque",
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
});
export default router;
//# sourceMappingURL=library.js.map