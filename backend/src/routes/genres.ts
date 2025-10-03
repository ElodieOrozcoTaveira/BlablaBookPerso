import { Router } from 'express';
import {
  createGenre,
  getAllGenres,
  getGenreById,
  updateGenre,
  deleteGenre
} from '../controllers/genre.controller.js';
import {
  validateBody,
  validateParams,
  validateQuery,
  validateAll
} from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  createGenreSchema,
  updateGenreSchema,
  genreParamsSchema,
  genreSearchSchema
} from '../validation/genre.zod.js';

const router = Router();

// Routes publiques (lecture)
// GET /api/genres - Recherche et pagination de genres
router.get('/',
  validateQuery(genreSearchSchema),  // Valide ?query=fantasy&page=1&limit=20
  getAllGenres
);

// GET /api/genres/:id - Details d'un genre specifique
router.get('/:id',
  validateParams(genreParamsSchema), // Valide l'ID en parametre
  getGenreById
);

// Routes protegees (authentification requise)
// POST /api/genres - Creer un nouveau genre
router.post('/',
  authenticateToken,
  validateBody(createGenreSchema),   // Valide les donnees de creation
  createGenre
);

// PUT /api/genres/:id - Mettre a jour un genre
router.put('/:id',
  authenticateToken,
  validateAll({                      // Valide params ET body
    params: genreParamsSchema,
    body: updateGenreSchema
  }),
  updateGenre
);

// PATCH /api/genres/:id - Mise a jour partielle (meme traitement que PUT)
router.patch('/:id',
  authenticateToken,
  validateAll({
    params: genreParamsSchema,
    body: updateGenreSchema
  }),
  updateGenre
);

// DELETE /api/genres/:id - Supprimer un genre
router.delete('/:id',
  authenticateToken,
  validateParams(genreParamsSchema),
  deleteGenre
);

export default router;