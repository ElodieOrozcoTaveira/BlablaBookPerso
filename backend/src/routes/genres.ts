import { Router } from 'express';
import {
  createGenre,
  getAllGenres,
  getGenreById,
  updateGenre,
  deleteGenre
} from '../controllers/genre.controller';
import {
  validateBody,
  validateParams,
  validateQuery,
  validateAll
} from '../middleware/validation';
import {
  createGenreSchema,
  updateGenreSchema,
  genreParamsSchema,
  genreSearchSchema
} from '../validation/genre.zod';

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

// Routes protegees (ecriture) - necessiteront auth middleware plus tard
// POST /api/genres - Creer un nouveau genre
router.post('/',
  validateBody(createGenreSchema),   // Valide les donnees de creation
  createGenre
);

// PUT /api/genres/:id - Mettre a jour un genre
router.put('/:id',
  validateAll({                      // Valide params ET body
    params: genreParamsSchema,
    body: updateGenreSchema
  }),
  updateGenre
);

// PATCH /api/genres/:id - Mise a jour partielle (meme traitement que PUT)
router.patch('/:id',
  validateAll({
    params: genreParamsSchema,
    body: updateGenreSchema
  }),
  updateGenre
);

// DELETE /api/genres/:id - Supprimer un genre
router.delete('/:id',
  validateParams(genreParamsSchema),
  deleteGenre
);

export default router;