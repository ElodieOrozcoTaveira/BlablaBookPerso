import { Router } from "express";
import { GenreController } from "../controllers/GenreController.js";
import { requireAuth } from "../middlewares/sessionMiddleware.js";
/**
 * ROUTES DES GENRES
 *
 * Définit toutes les routes liées aux genres
 * Toutes les routes nécessitent une authentification
 */
const router = Router();
// Middleware d'authentification pour toutes les routes
router.use(requireAuth);
// ROUTES SPÉCIALES (doivent être avant les routes avec paramètres)
/**
 * GET /api/genres/search - Rechercher des genres
 * Query params: q (string), limit (number)
 */
router.get("/search", GenreController.searchGenres);
/**
 * GET /api/genres/stats - Statistiques des genres
 */
router.get("/stats", GenreController.getGenreStats);
/**
 * GET /api/genres/popular - Genres populaires
 * Query params: limit (number)
 */
router.get("/popular", GenreController.getPopularGenres);
/**
 * GET /api/genres/alphabetical - Genres par ordre alphabétique
 */
router.get("/alphabetical", GenreController.getGenresAlphabetically);
/**
 * GET /api/genres/by-name/:name - Récupérer un genre par son nom
 */
router.get("/by-name/:name", GenreController.getGenreByName);
// ROUTES PRINCIPALES CRUD
/**
 * POST /api/genres - Créer un nouveau genre
 * Body: { name: string }
 */
router.post("/", GenreController.createGenre);
/**
 * GET /api/genres - Récupérer tous les genres avec filtres
 * Query params: search (string), limit (number), offset (number)
 */
router.get("/", GenreController.getAllGenres);
/**
 * GET /api/genres/:id - Récupérer un genre par ID
 */
router.get("/:id", GenreController.getGenreById);
/**
 * PUT /api/genres/:id - Mettre à jour un genre
 * Body: { name?: string }
 */
router.put("/:id", GenreController.updateGenre);
/**
 * DELETE /api/genres/:id - Supprimer un genre
 */
router.delete("/:id", GenreController.deleteGenre);
/**
 * GET /api/genres/:id/exists - Vérifier si un genre existe
 */
router.get("/:id/exists", GenreController.checkGenreExists);
export default router;
//# sourceMappingURL=genres.js.map