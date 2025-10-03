import { Router } from 'express';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permission.js';
import { requireOwnership } from '../middleware/ownership.js';
import Notice from '../models/Notice.js';
import {
    createNoticeSchema,
    updateNoticeSchema,
    noticeParamsSchema,
    noticeSearchSchema
} from '../validation/notice.zod.js';
import {
    createNotice,
    getAllNotices,
    getNoticeById,
    updateNotice,
    deleteNotice,
    getMyNotices,
    getNoticesByBook
} from '../controllers/notice.controller.js';
import { idParamSchema } from '../validation/common.zod.js';

const router = Router();

// Routes publiques
// GET /api/notices - Lister tous les avis (filtrables)
router.get('/', validateQuery(noticeSearchSchema), getAllNotices);

// GET /api/notices/:id - Voir un avis specifique
router.get('/:id', validateParams(noticeParamsSchema), getNoticeById);

// Routes protegees (authentification requise)
// POST /api/notices - Creer un nouvel avis
router.post('/', 
    authenticateToken,
    validateBody(createNoticeSchema), 
    createNotice
);

// PUT /api/notices/:id - Modifier un avis (seulement proprietaire)
router.put('/:id', 
    authenticateToken,
    validateParams(noticeParamsSchema), 
    validateBody(updateNoticeSchema),
    requirePermission('UPDATE_NOTICE'),
    // Import statique pour éviter soucis de top-level await en tests
    requireOwnership({ model: Notice, idLocation: 'params', idKey: 'id', ownerField: 'id_user', attachAs: 'notice' }),
    updateNotice
);

// DELETE /api/notices/:id - Supprimer un avis (seulement proprietaire)
router.delete('/:id', 
    authenticateToken,
    validateParams(noticeParamsSchema),
    requirePermission('DELETE_NOTICE'),
    // Import statique pour éviter soucis de top-level await en tests
    requireOwnership({ model: Notice, idLocation: 'params', idKey: 'id', ownerField: 'id_user', attachAs: 'notice' }),
    deleteNotice
);

// PATCH /api/notices/:id - Modification partielle d'un avis
router.patch('/:id', 
    authenticateToken,
    validateParams(noticeParamsSchema), 
    (req, res) => {
        res.status(501).json({
            success: false,
            message: 'Modification partielle avis - Fonctionnalite a implementer'
        });
    }
);

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