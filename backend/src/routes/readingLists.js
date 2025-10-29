import { Router } from "express";
import { ReadingListController } from "../controllers/ReadingListController.js";
import { requireAuth } from "../middlewares/sessionMiddleware.js";
/**
 * ROUTES DES LISTES DE LECTURE
 *
 * Définit toutes les routes liées aux listes de lecture thématiques
 * Toutes les routes nécessitent une authentification
 */
const router = Router();
// Middleware d'authentification pour toutes les routes
router.use(requireAuth);
// ROUTES SPÉCIALES (doivent être avant les routes avec paramètres)
/**
 * GET /api/reading-lists/search - Rechercher des listes de lecture
 * Query params: q (string), userId (number), limit (number)
 */
router.get("/search", ReadingListController.searchReadingLists);
/**
 * GET /api/reading-lists/stats - Statistiques des listes de lecture
 */
router.get("/stats", ReadingListController.getReadingListStats);
/**
 * GET /api/reading-lists/user/:userId - Listes de lecture d'un utilisateur
 * Query params: includeInactive (boolean)
 */
router.get("/user/:userId", ReadingListController.getUserReadingLists);
// ROUTES PRINCIPALES CRUD
/**
 * POST /api/reading-lists - Créer une nouvelle liste de lecture
 * Body: { libraryId: number, userId: number, name: string, description?: string, genre?: string, statut?: boolean }
 */
router.post("/", ReadingListController.createReadingList);
/**
 * GET /api/reading-lists - Récupérer toutes les listes de lecture avec filtres
 * Query params: userId, libraryId, genre, statut, search, limit, offset
 */
router.get("/", ReadingListController.getAllReadingLists);
/**
 * GET /api/reading-lists/:id - Récupérer une liste de lecture par ID
 */
router.get("/:id", ReadingListController.getReadingListById);
/**
 * PUT /api/reading-lists/:id - Mettre à jour une liste de lecture
 * Body: { name?: string, description?: string, genre?: string, statut?: boolean }
 */
router.put("/:id", ReadingListController.updateReadingList);
/**
 * DELETE /api/reading-lists/:id - Supprimer une liste de lecture (soft delete)
 */
router.delete("/:id", ReadingListController.deleteReadingList);
/**
 * PATCH /api/reading-lists/:id/toggle - Activer/désactiver une liste de lecture
 */
router.patch("/:id/toggle", ReadingListController.toggleReadingListStatus);
/**
 * GET /api/reading-lists/:id/exists - Vérifier si une liste de lecture existe
 */
router.get("/:id/exists", ReadingListController.checkReadingListExists);
export default router;
//# sourceMappingURL=readingLists.js.map