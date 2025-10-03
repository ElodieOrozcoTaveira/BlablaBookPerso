import { Router } from 'express';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permission.js';
import {
    createUserSchema,
    updateProfileSchema,
    patchProfileSchema,
    changePasswordSchema,
    loginSchema,
    userParamsSchema,
    userSearchSchema
} from '../validation/user.zod.js';
import {
    getAllUsers,
    getUserById,
    getMyProfile,
    updateMyProfile,
    patchMyProfile,
    changeMyPassword,
    deleteMyAccount,
    getUserStats,
    registerUser
} from '../controllers/user.controller.js';

const router = Router();

// Routes publiques (inscription et connexion)
// POST /api/users/register - Inscription
router.post('/register', validateBody(createUserSchema), registerUser);

// POST /api/users/login - Connexion (redirige vers /auth/login)
router.post('/login', (req, res) => {
    res.status(301).json({
        success: false,
        message: 'Utilisez /api/auth/login pour vous connecter',
        redirect: '/api/auth/login'
    });
});

// Routes protegees (necessitent authentification)
// GET /api/users - Lister tous les utilisateurs (admin/moderation)
router.get('/', 
    authenticateToken,
    requirePermission('ADMIN_USERS'),
    validateQuery(userSearchSchema), 
    getAllUsers
);

// GET /api/users/:id - Profil public d'un utilisateur
router.get('/:id', validateParams(userParamsSchema), getUserById);

// GET /api/users/:id/stats - Statistiques d'un utilisateur
router.get('/:id/stats', 
    authenticateToken,
    requirePermission('VIEW_USER_STATS'),
    validateParams(userParamsSchema), 
    getUserStats
);

// Routes du profil personnel (authentification requise)
// GET /api/users/me/profile - Mon profil complet
router.get('/me/profile', authenticateToken, getMyProfile);

// PUT /api/users/me/profile - Modifier mon profil
router.put('/me/profile', 
    authenticateToken,
    validateBody(updateProfileSchema), 
    updateMyProfile
);

// PATCH /api/users/me/profile - Modification partielle de mon profil
router.patch('/me/profile', 
    authenticateToken,
    validateBody(patchProfileSchema),
    patchMyProfile
);

// POST /api/users/me/change-password - Changer mon mot de passe
router.post('/me/change-password', 
    authenticateToken,
    validateBody(changePasswordSchema),
    changeMyPassword
);

// DELETE /api/users/me - Supprimer mon compte
router.delete('/me', authenticateToken, deleteMyAccount);

export default router;