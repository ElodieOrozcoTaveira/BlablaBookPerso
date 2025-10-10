import { Router } from "express";
import { RateController } from "../controllers/RateController.js";
import { requireAuth } from "../middlewares/sessionMiddleware.js";

/**
 * ROUTES DES NOTES
 *
 * Définit toutes les routes liées aux notes/évaluations (1-5 étoiles)
 * Toutes les routes nécessitent une authentification
 */

const router = Router();

// Middleware d'authentification pour toutes les routes
router.use(requireAuth);

// ROUTES SPÉCIALES (doivent être avant les routes avec paramètres)
/**
 * GET /api/rates/stats - Statistiques des notes
 */
router.get("/stats", RateController.getRateStats);

/**
 * GET /api/rates/recent - Notes récentes
 * Query params: limit (number)
 */
router.get("/recent", RateController.getRecentRates);

/**
 * GET /api/rates/user/:userId/book/:bookId - Note d'un utilisateur pour un livre
 */
router.get("/user/:userId/book/:bookId", RateController.getUserRateForBook);

/**
 * GET /api/rates/book/:bookId/average - Moyenne des notes pour un livre
 */
router.get("/book/:bookId/average", RateController.getBookAverageRate);

// ROUTES PRINCIPALES CRUD
/**
 * POST /api/rates - Créer une nouvelle note
 * Body: { userId: number, bookId: number, readingListId?: number, rate: number }
 */
router.post("/", RateController.createRate);

/**
 * GET /api/rates - Récupérer toutes les notes avec filtres
 * Query params: userId, bookId, readingListId, minRate, maxRate, limit, offset
 */
router.get("/", RateController.getAllRates);

/**
 * GET /api/rates/:id - Récupérer une note par ID
 */
router.get("/:id", RateController.getRateById);

/**
 * PUT /api/rates/:id - Mettre à jour une note
 * Body: { rate?: number }
 */
router.put("/:id", RateController.updateRate);

/**
 * DELETE /api/rates/:id - Supprimer une note
 */
router.delete("/:id", RateController.deleteRate);

/**
 * GET /api/rates/:id/exists - Vérifier si une note existe
 */
router.get("/:id/exists", RateController.checkRateExists);

export default router;
