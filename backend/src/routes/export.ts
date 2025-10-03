// Routes d'export avec permissions EXPORT
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permission.js';
import { exportRateLimit } from '../middleware/security.js';
import { exportMyData, exportSystemStats } from '../controllers/export.controller.js';

const router = Router();

// ========================================
// ROUTES D'EXPORT UTILISATEUR 
// ========================================

// GET /api/export/me - Export de toutes mes données (RGPD)
router.get('/me',
    exportRateLimit,
    authenticateToken,
    requirePermission('EXPORT'),
    exportMyData
);

// ========================================
// ROUTES D'EXPORT ADMINISTRATEUR
// ========================================

// GET /api/export/stats - Export des statistiques système
router.get('/stats',
    exportRateLimit,
    authenticateToken,
    requirePermission('ADMIN'),
    requirePermission('EXPORT'),
    exportSystemStats
);

// GET /api/export/admin/all - Export complet (future implémentation)
router.get('/admin/all',
    exportRateLimit,
    authenticateToken,
    requirePermission('ADMIN'),
    requirePermission('EXPORT'),
    (req, res) => {
        res.status(501).json({
            error: 'Not implemented',
            message: 'Export complet système non encore implémenté',
            planned_features: [
                'Export de tous les utilisateurs',
                'Export de tous les livres',
                'Export de toutes les bibliothèques',
                'Export des logs d\'audit',
                'Format ZIP avec multiple fichiers'
            ]
        });
    }
);

export default router;
