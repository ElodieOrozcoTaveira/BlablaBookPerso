import { Router } from "express";
import { NoticeController } from "../controllers/NoticeController.js";
import { requireAuth } from "../middlewares/sessionMiddleware.js";

/**
 * ROUTES DES AVIS
 *
 * Définit toutes les routes liées aux avis des utilisateurs
 * Toutes les routes nécessitent une authentification
 */

const router = Router();

// Middleware d'authentification pour toutes les routes
router.use(requireAuth);

// ROUTES SPÉCIALES (doivent être avant les routes avec paramètres)
/**
 * GET /api/notices/search - Rechercher des avis
 * Query params: q (string), limit (number)
 */
router.get("/search", NoticeController.searchNotices);

/**
 * GET /api/notices/stats - Statistiques des avis
 */
router.get("/stats", NoticeController.getNoticeStats);

/**
 * GET /api/notices/recent - Avis récents
 * Query params: limit (number)
 */
router.get("/recent", NoticeController.getRecentNotices);

// ROUTES PRINCIPALES CRUD
/**
 * POST /api/notices - Créer un nouvel avis
 * Body: { comment: string }
 */
router.post("/", NoticeController.createNotice);

/**
 * GET /api/notices - Récupérer tous les avis avec filtres
 * Query params: search (string), limit (number), offset (number)
 */
router.get("/", NoticeController.getAllNotices);

/**
 * GET /api/notices/:id - Récupérer un avis par ID
 */
router.get("/:id", NoticeController.getNoticeById);

/**
 * PUT /api/notices/:id - Mettre à jour un avis
 * Body: { comment?: string }
 */
router.put("/:id", NoticeController.updateNotice);

/**
 * DELETE /api/notices/:id - Supprimer un avis
 */
router.delete("/:id", NoticeController.deleteNotice);

/**
 * GET /api/notices/:id/exists - Vérifier si un avis existe
 */
router.get("/:id/exists", NoticeController.checkNoticeExists);

export default router;
