import { Router } from 'express';
import { createAuthor, getAllAuthors, getAuthorById, updateAuthor, deleteAuthor, getAuthorBio, getAuthorAvatar, getAuthorAvatarBySize } from '../controllers/author.controller.js';
import { validateBody, validateParams, validateQuery, validateAll } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permission.js';
import { createAuthorSchema, updateAuthorSchema, authorParamsSchema, authorAvatarParamsSchema, authorSearchSchema } from '../validation/author.zod.js';

const router = Router();

// Routes publiques (lecture)
// GET /api/authors - Recherche et pagination d'auteurs
router.get('/',
  validateQuery(authorSearchSchema),
  getAllAuthors
);

// GET /api/authors/:id - Details d'un auteur specifique
router.get('/:id',
  validateParams(authorParamsSchema), // Valide l'ID en parametre
  getAuthorById
);

// Routes specialisees pour bio et avatar (publiques)
// GET /api/authors/:id/bio - Retourne seulement la bio de l'auteur
router.get('/:id/bio',
  validateParams(authorParamsSchema),
  getAuthorBio
);

// GET /api/authors/:id/avatar - Retourne les URLs d'avatar disponibles
router.get('/:id/avatar',
  validateParams(authorParamsSchema),
  getAuthorAvatar
);

// GET /api/authors/:id/avatar/:size - Redirige vers l'avatar de la taille specifiee
router.get('/:id/avatar/:size',
  validateParams(authorAvatarParamsSchema),
  getAuthorAvatarBySize
);

// Routes protegees (authentification requise)
// POST /api/authors - Creer un nouvel auteur
router.post('/',
  authenticateToken,
  requirePermission('CREATE_AUTHOR'),
  validateBody(createAuthorSchema),   // Valide les donnees de creation
  createAuthor
);

// PUT /api/authors/:id - Mettre a jour un auteur
router.put('/:id',
  authenticateToken,
  requirePermission('UPDATE_AUTHOR'),
  validateAll({                       // Valide params ET body
    params: authorParamsSchema,
    body: updateAuthorSchema
  }),
  updateAuthor
);

// PATCH /api/authors/:id - Mise a jour partielle (meme traitement que PUT)
router.patch('/:id',
    authenticateToken,
    requirePermission('UPDATE_AUTHOR'),
  validateAll({
    params: authorParamsSchema,
    body: updateAuthorSchema
  }),
  updateAuthor
);

// DELETE /api/authors/:id - Supprimer un auteur
router.delete('/:id',
  authenticateToken,
  requirePermission('DELETE_AUTHOR'),
  validateParams(authorParamsSchema),
  deleteAuthor
);

export default router;