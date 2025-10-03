import { Router } from 'express';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import {
    createUserSchema,
    updateProfileSchema,
    changePasswordSchema,
    loginSchema,
    userParamsSchema,
    userSearchSchema
} from '../validation/user.zod';
import {
    getAllUsers,
    getUserById,
    getMyProfile,
    updateMyProfile,
    deleteMyAccount,
    getUserStats
} from '../controllers/user.controller';

const router = Router();

// Routes publiques (pour l'auth - TODO: integrer Better Auth)
// POST /api/users/register - Inscription
router.post('/register', validateBody(createUserSchema), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Inscription - TODO: integrer Better Auth'
    });
});

// POST /api/users/login - Connexion
router.post('/login', validateBody(loginSchema), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Connexion - TODO: integrer Better Auth'
    });
});

// Routes protegees (necessitent authentification - TODO: ajouter auth middleware)
// GET /api/users - Lister tous les utilisateurs (admin/moderation)
router.get('/', validateQuery(userSearchSchema), getAllUsers);

// GET /api/users/:id - Profil public d'un utilisateur
router.get('/:id', validateParams(userParamsSchema), getUserById);

// GET /api/users/:id/stats - Statistiques d'un utilisateur
router.get('/:id/stats', validateParams(userParamsSchema), getUserStats);

// Routes du profil personnel (necessitent authentification)
// GET /api/users/me/profile - Mon profil complet
router.get('/me/profile', getMyProfile);

// PUT /api/users/me/profile - Modifier mon profil
router.put('/me/profile', validateBody(updateProfileSchema), updateMyProfile);

// POST /api/users/me/change-password - Changer mon mot de passe
router.post('/me/change-password', validateBody(changePasswordSchema), (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Changement de mot de passe - TODO: implementer'
    });
});

// DELETE /api/users/me - Supprimer mon compte
router.delete('/me', deleteMyAccount);

export default router;