import request from 'supertest';
import express from 'express';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { mockAuthenticateToken } from '../../utils/auth-mocks.js';

// Mock findByPk via override global
const mockFindByPk = vi.fn();
beforeEach(() => {
  (globalThis as any).__TEST_MODEL_OVERRIDES = {
    Notice: { findByPk: mockFindByPk }
  };
});

// Mock auth middleware pour injecter req.user différemment selon header
vi.mock('../../../src/middleware/auth.js', () => ({
  // Le vrai middleware est directement (req,res,next) => {...}
  authenticateToken: (req: any, _res: any, next: any) => {
    const uid = req.headers['x-user-id'] ? Number(req.headers['x-user-id']) : 10;
    const roles = (req.headers['x-roles'] as string)?.split(',').filter(Boolean) || [];
    req.user = { id_user: uid, roles };
    next();
  }
}));

// Mock validations -> no-op
vi.mock('../../../src/middleware/validation.js', () => ({
  validateBody: () => (_req: any, _res: any, next: any) => next(),
  validateParams: () => (_req: any, _res: any, next: any) => next(),
  validateQuery: () => (_req: any, _res: any, next: any) => next()
}));

// Mock permission -> no-op
vi.mock('../../../src/middleware/permission.js', () => ({
  requirePermission: () => (_req: any, _res: any, next: any) => next()
}));

// Mock controller update/delete pour vérifier qu'ils sont atteints
const mockUpdate = vi.fn((req:any,res:any)=> res.json({ success:true, updated: true, id: req.params.id }));
const mockDelete = vi.fn((req:any,res:any)=> res.status(204).end());
const mockGet = vi.fn((req:any,res:any)=> res.json({ success:true, id: req.params.id }));

vi.mock('../../../src/controllers/notice.controller.js', () => ({
  createNotice: vi.fn(),
  getAllNotices: vi.fn(),
  getNoticeById: mockGet,
  updateNotice: mockUpdate,
  deleteNotice: mockDelete,
  getMyNotices: vi.fn(),
  getNoticesByBook: vi.fn()
}));

describe('Notices Ownership Wiring', () => {
  let app: express.Application;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    // Debug ownership activable via env TEST_OWNERSHIP_DEBUG=1 (pas forcé par défaut)
    if (process.env.TEST_OWNERSHIP_DEBUG === '1') {
      app.use((req: any, res: any, next: any) => {
        // eslint-disable-next-line no-console
        console.log('[test-debug][in]', req.method, req.url);
        res.on('finish', () => {
          // eslint-disable-next-line no-console
          console.log('[test-debug][out]', req.method, req.url, res.statusCode);
        });
        next();
      });
    }
    const { default: routes } = await import('../../../src/routes/notices.js');
    app.use('/notices', routes);
  });

  it('autorise le propriétaire pour update', async () => {
    mockFindByPk.mockResolvedValue({ id: 5, id_user: 10 });
    const r = await request(app)
      .put('/notices/5')
      .set('x-user-id','10')
      .send({ content: 'x'});
  expect(r.status).toBe(200);
  expect(mockUpdate).toHaveBeenCalledTimes(1);
  // l'id param route arrive en string -> matcher souple
  expect(mockFindByPk).toHaveBeenCalledWith('5');
  });

  it('refuse 403 si non propriétaire', async () => {
    mockFindByPk.mockResolvedValue({ id: 6, id_user: 99 });
    const r = await request(app)
      .put('/notices/6')
      .set('x-user-id','10')
      .send({ content: 'x'});
  expect(r.status).toBe(403);
  expect(mockUpdate).not.toHaveBeenCalled();
  expect(mockFindByPk).toHaveBeenCalledWith('6');
  });

  it('bypass admin même si non propriétaire', async () => {
    mockFindByPk.mockResolvedValue({ id: 7, id_user: 99 });
    const r = await request(app)
      .put('/notices/7')
      .set('x-user-id','55')
      .set('x-roles','admin')
      .send({ content: 'x'});
  expect(r.status).toBe(200);
  expect(mockUpdate).toHaveBeenCalledTimes(1); // reset entre tests donc 1
  expect(mockFindByPk).toHaveBeenCalledWith('7');
  });

  it('404 si ressource absente', async () => {
    mockFindByPk.mockResolvedValue(null);
    const r = await request(app)
      .delete('/notices/123')
      .set('x-user-id','10');
  expect(r.status).toBe(404);
  expect(mockDelete).not.toHaveBeenCalled();
  expect(mockFindByPk).toHaveBeenCalledWith('123');
  });
});
