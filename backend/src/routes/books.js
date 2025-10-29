import { Router } from "express";
// Import des contrôleurs
import { BookController } from "../controllers/BookController.js";
// Import des middlewares
import { requireAuth } from "../middlewares/sessionMiddleware.js";
// Création du router pour les livres
const router = Router();
/**
 * ROUTES DES LIVRES
 *
 * Routes disponibles:
 * - GET /api/books/search?q=query → Recherche sur OpenLibrary
 * - GET /api/books/isbn/:isbn → Recherche par ISBN
 * - GET /api/books/openlibrary/:id → Détails d'un livre OpenLibrary
 * - POST /api/books/save → Sauvegarder un livre d'OpenLibrary
 * - GET /api/books/library → Ma bibliothèque
 * - PUT /api/books/library/:id/status → Changer le statut d'un livre
 */
/**
 * GET /api/books/search
 * Recherche de livres sur OpenLibrary
 * Paramètres: ?q=titre&limit=20
 */
router.get("/search", BookController.searchOpenLibrary);
/**
 * GET /api/books/isbn/:isbn
 * Recherche par ISBN sur OpenLibrary
 */
router.get("/isbn/:isbn", BookController.searchByISBN);
/**
 * GET /api/books/openlibrary/:path(.*)
 * Récupère les détails d'un livre OpenLibrary
 * Exemple: GET /api/books/openlibrary/works/OL82563W
 */
router.get("/openlibrary/:type/:id", BookController.getOpenLibraryDetails);
/**
 * POST /api/books/save
 * Sauvegarde un livre d'OpenLibrary dans la bibliothèque utilisateur
 * Body: { openLibraryId: string, status?: 'to_read'|'reading'|'read' }
 */
router.post("/save", requireAuth, BookController.saveBookFromOpenLibrary);
/**
 * Routes de bibliothèque utilisateur (à implémenter plus tard)
 */
/**
 * Routes de bibliothèque utilisateur
 */
router.get("/library", requireAuth, BookController.getUserLibrary);
router.post("/library/add", requireAuth, BookController.addBookToLibrary);
router.put("/status/:id", requireAuth, BookController.updateBookStatus);
export default router;
//# sourceMappingURL=books.js.map