import { Router } from 'express';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
    createNoticeSchema,
    updateNoticeSchema,
    noticeParamsSchema,
    noticeSearchSchema
} from '../validation/notice.zod';
import {
    createNotice,
    getAllNotices,
    getNoticeById,
    updateNotice,
    deleteNotice,
    getMyNotices,
    getNoticesByBook
} from '../controllers/notice.controller';
import { idParamSchema } from '../validation/common.zod';

const router = Router();

// Routes publiques
// GET /api/notices - Lister tous les avis (filtrables)
router.get('/', validateQuery(noticeSearchSchema), getAllNotices);

// GET /api/notices/:id - Voir un avis specifique
router.get('/:id', validateParams(noticeParamsSchema), getNoticeById);

// Routes protegees (necessitent authentification - TODO: ajouter auth middleware)
// POST /api/notices - Creer un nouvel avis
router.post('/', validateBody(createNoticeSchema), createNotice);

// PUT /api/notices/:id - Modifier un avis (seulement proprietaire)
router.put('/:id', 
    validateParams(noticeParamsSchema), 
    validateBody(updateNoticeSchema), 
    updateNotice
);

// DELETE /api/notices/:id - Supprimer un avis (seulement proprietaire)
router.delete('/:id', validateParams(noticeParamsSchema), deleteNotice);

// Routes du profil personnel
// GET /api/notices/me/all - Mes avis
router.get('/me/all', getMyNotices);

// Routes specifiques aux livres
// GET /api/notices/book/:book_id - Avis d'un livre specifique
router.get('/book/:book_id', 
    validateParams(idParamSchema), 
    validateQuery(noticeSearchSchema), 
    getNoticesByBook
);

export default router;