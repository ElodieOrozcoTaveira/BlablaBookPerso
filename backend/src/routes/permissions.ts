import { Router } from "express";
import { PermissionController } from "../controllers/PermissionController.js";
import { requireAuth } from "../middlewares/sessionMiddleware.js";

/**
 * ROUTES DES PERMISSIONS
 *
 * Définit toutes les routes liées aux permissions du système
 * Toutes les routes nécessitent une authentification
 * TODO: Ajouter la vérification des permissions admin
 */

const router = Router();

// Middleware d'authentification pour toutes les routes
router.use(requireAuth);

// ROUTES SPÉCIALES (doivent être avant les routes avec paramètres)
/**
 * GET /api/permissions/search - Rechercher des permissions
 * Query params: q (string), limit (number)
 */
router.get("/search", PermissionController.searchPermissions);

/**
 * GET /api/permissions/stats - Statistiques des permissions
 */
router.get("/stats", PermissionController.getPermissionStats);

/**
 * GET /api/permissions/alphabetical - Permissions par ordre alphabétique
 */
router.get("/alphabetical", PermissionController.getPermissionsAlphabetically);

/**
 * GET /api/permissions/by-label/:label - Récupérer une permission par libellé
 */
router.get("/by-label/:label", PermissionController.getPermissionByLabel);

/**
 * GET /api/permissions/by-category/:category - Permissions par catégorie d'action
 */
router.get(
  "/by-category/:category",
  PermissionController.getPermissionsByActionCategory
);

// ROUTES PRINCIPALES CRUD
/**
 * POST /api/permissions - Créer une nouvelle permission
 * Body: { label: string, action?: string }
 * TODO: Vérifier les permissions admin
 */
router.post("/", PermissionController.createPermission);

/**
 * GET /api/permissions - Récupérer toutes les permissions avec filtres
 * Query params: search (string), limit (number), offset (number)
 */
router.get("/", PermissionController.getAllPermissions);

/**
 * GET /api/permissions/:id - Récupérer une permission par ID
 */
router.get("/:id", PermissionController.getPermissionById);

/**
 * PUT /api/permissions/:id - Mettre à jour une permission
 * Body: { label?: string, action?: string }
 * TODO: Vérifier les permissions admin
 */
router.put("/:id", PermissionController.updatePermission);

/**
 * DELETE /api/permissions/:id - Supprimer une permission
 * TODO: Vérifier les permissions admin
 */
router.delete("/:id", PermissionController.deletePermission);

/**
 * GET /api/permissions/:id/exists - Vérifier si une permission existe
 */
router.get("/:id/exists", PermissionController.checkPermissionExists);

export default router;
