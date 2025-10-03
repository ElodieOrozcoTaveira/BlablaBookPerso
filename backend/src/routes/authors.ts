import { Router } from 'express';
import { createAuthor, getAllAuthors, getAuthorById, updateAuthor, deleteAuthor } from '../controllers/author.controller.js';
import { validateBody, validateParams, validateQuery, validateAll } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permission.js';
import { createAuthorSchema, updateAuthorSchema, authorParamsSchema, authorSearchSchema } from '../validation/author.zod.js';

const router = Router();

// Routes publiques (lecture)
// GET /api/authors - Recherche et pagination d'auteurs
router.get('/',
  validateQuery(authorSearchSchema),  // Valide ?query=tolkien&page=1&limit=20
  getAllAuthors
);

// GET /api/authors/:id - Details d'un auteur specifique
router.get('/:id',
  validateParams(authorParamsSchema), // Valide l'ID en parametre
  getAuthorById
);

// Routes protegees (authentification requise)
// POST /api/authors - Creer un nouvel auteur
router.post('/',
  authenticateToken,
  requirePermission('CREATE_AUTHOR', 'authors'),
  validateBody(createAuthorSchema),   // Valide les donnees de creation
  createAuthor
);

// PUT /api/authors/:id - Mettre a jour un auteur
router.put('/:id',
  authenticateToken,
  requirePermission('UPDATE_AUTHOR', 'authors'),
  validateAll({                       // Valide params ET body
    params: authorParamsSchema,
    body: updateAuthorSchema
  }),
  updateAuthor
);

// PATCH /api/authors/:id - Mise a jour partielle (meme traitement que PUT)
router.patch('/:id',
    authenticateToken,
    requirePermission('UPDATE_AUTHOR', 'authors'),
  validateAll({
    params: authorParamsSchema,
    body: updateAuthorSchema
  }),
  updateAuthor
);

// DELETE /api/authors/:id - Supprimer un auteur
router.delete('/:id',
  authenticateToken,
  requirePermission('DELETE_AUTHOR', 'authors'),
  validateParams(authorParamsSchema),
  deleteAuthor
);

export default router;