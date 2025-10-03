import request from 'supertest';
import express from 'express';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { mockAuthenticateToken, mockRequirePermission } from '../../utils/auth-mocks.js';

// Variante passing (par défaut)
vi.mock('../../../src/middleware/auth.js', () => ({
  authenticateToken: mockAuthenticateToken()
}));
// On va remplacer dynamiquement le mock permission selon scénario
let permissionShouldPass = true;
vi.mock('../../../src/middleware/permission.js', () => ({
  requirePermission: (label: string) => (req: any, res: any, next: any) => {
    if (permissionShouldPass) return next();
    return res.status(403).json({ error: 'Insufficient permissions', required: label });
  }
}));

// Controllers export (mock simplifié)
const mockExportMyData = vi.fn(async (req: any, res: any) => {
  res.json({ success: true, scope: 'me', data: { userId: req.session?.userId } });
});
const mockExportSystemStats = vi.fn(async (req: any, res: any) => {
  res.json({ success: true, scope: 'stats', data: { users: 10 } });
});
vi.mock('../../../src/controllers/export.controller.js', () => ({
  exportMyData: mockExportMyData,
  exportSystemStats: mockExportSystemStats
}));

describe('Export Routes RBAC', () => {
  let app: express.Application;
  beforeEach(async () => {
    vi.clearAllMocks();
    permissionShouldPass = true;
    app = express();
    app.use(express.json());
    const { default: exportRoutes } = await import('../../../src/routes/export.js');
    app.use('/export', exportRoutes);
  });

  it('GET /export/me -> 200 avec permission EXPORT', async () => {
    const res = await request(app).get('/export/me');
    expect(res.status).toBe(200);
    expect(res.body.scope).toBe('me');
    expect(mockExportMyData).toHaveBeenCalled();
  });

  it('GET /export/stats -> 200 avec ADMIN + EXPORT', async () => {
    const res = await request(app).get('/export/stats');
    expect(res.status).toBe(200);
    expect(res.body.scope).toBe('stats');
    expect(mockExportSystemStats).toHaveBeenCalled();
  });

  it('GET /export/me -> 403 si permission EXPORT absente', async () => {
    permissionShouldPass = false;
    const res = await request(app).get('/export/me');
    expect(res.status).toBe(403);
    expect(mockExportMyData).not.toHaveBeenCalled();
  });
});
