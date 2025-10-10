import { Router } from "express";
import type { Request, Response } from "express";

// Import des sous-routeurs
import authRouter from "./auth.js";
import userRouter from "./user.js";
import booksRouter from "./books.js";
import libraryRouter from "./library.js";
import authorsRouter from "./authors.js";
import rolesRouter from "./roles.js";
import genresRouter from "./genres.js";
import noticesRouter from "./notices.js";
import permissionsRouter from "./permissions.js";
import ratesRouter from "./rates.js";
import readingListsRouter from "./readingLists.js";

// Création du routeur principal
const router = Router();

/**
 * ROUTEUR PRINCIPAL DE L'API REST BlablaBook
 *
 * Structure des routes :
 * - /api/auth/* → Authentification (register, login, logout)
 * - /api/books/* → Gestion des livres (CRUD) [TODO]
 * - /api/authors/* → Gestion des auteurs (CRUD) ✅
 * - /api/genres/* → Gestion des genres (CRUD) ✅
 * - /api/roles/* → Gestion des rôles (CRUD) ✅
 * - /api/permissions/* → Gestion des permissions (CRUD) ✅
 * - /api/notices/* → Gestion des avis (CRUD) ✅
 * - /api/rates/* → Gestion des notes (CRUD) ✅
 * - /api/reading-lists/* → Gestion des listes de lecture (CRUD) ✅
 * - /api/libraries/* → Gestion des bibliothèques utilisateur
 * - /api/users/* → Gestion des utilisateurs (profil, etc.) [TODO]
 */

// Routes d'authentification
router.use("/auth", authRouter);

// Routes des utilisateurs
router.use("/users", userRouter);

// Routes des livres
router.use("/books", booksRouter);

// Routes des bibliothèques
router.use("/libraries", libraryRouter);

// Routes des auteurs
router.use("/authors", authorsRouter);

// Routes des rôles
router.use("/roles", rolesRouter);

// Routes des genres
router.use("/genres", genresRouter);

// Routes des permissions
router.use("/permissions", permissionsRouter);

// Routes des avis
router.use("/notices", noticesRouter);

// Routes des notes
router.use("/rates", ratesRouter);

// Routes des listes de lecture
router.use("/reading-lists", readingListsRouter);

// TODO: Ajouter les autres routes quand elles seront implémentées
// router.use("/role-permissions", rolePermissionsRouter);
// router.use("/user-roles", userRolesRouter);

/**
 * Route de test pour vérifier que l'API fonctionne
 */
router.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "🚀 API BlablaBook fonctionnelle !",
    version: "1.0.0",
    routes: {
      authentication: "/api/auth/*",
      users: "/api/users/*",
      books: "/api/books/*",
      health: "/api/health",
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
