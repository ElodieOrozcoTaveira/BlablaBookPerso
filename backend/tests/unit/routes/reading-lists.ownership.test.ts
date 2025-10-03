import request from 'supertest';
import express from 'express';
import { vi, describe, beforeEach, it, expect } from 'vitest';

const mockRLFind = vi.fn();
const mockLibFind = vi.fn();

beforeEach(() => {
  (globalThis as any).__TEST_MODEL_OVERRIDES = {
    ReadingList: { findByPk: mockRLFind },
    Library: { findByPk: mockLibFind }
  };
});

vi.mock('../../../src/middleware/auth.js', () => ({
  authenticateToken: () => (req: any, _res: any, next: any) => {
    const uid = req.headers['x-user-id'] ? Number(req.headers['x-user-id']) : 10;
    const roles = (req.headers['x-roles'] as string)?.split(',').filter(Boolean) || [];
    req.user = { id_user: uid, roles };
    next();
  }
}));

vi.mock('../../../src/middleware/validation.js', () => ({
  validateBody: () => (_req: any, _res: any, next: any) => next(),
  validateParams: () => (_req: any, _res: any, next: any) => next(),
  validateQuery: () => (_req: any, _res: any, next: any) => next()
}));

vi.mock('../../../src/middleware/permission.js', () => ({
  requirePermission: () => (_req:any,_res:any,next:any)=> next()
}));

const mockUpdateStatus = vi.fn((req:any,res:any)=> res.json({ success:true, id: req.params.id, status: 'DONE' }));
const mockRemove = vi.fn((req:any,res:any)=> res.status(204).end());

vi.mock('../../../src/controllers/reading-list.controller.js', () => ({
  addBookToReadingList: vi.fn(),
  getReadingList: vi.fn(),
  updateReadingStatus: mockUpdateStatus,
  removeBookFromReadingList: mockRemove,
  getMyReadingStats: vi.fn()
}));

describe('ReadingLists Ownership Wiring (indirect)', () => {
  let app: express.Application;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    const { default: routes } = await import('../../../src/routes/reading-lists.js');
    app.use('/reading-lists', routes);
  });

  it('autorise propriétaire via ownerResolver (library)', async () => {
    mockRLFind.mockResolvedValue({ id: 11, id_library: 5 });
    mockLibFind.mockResolvedValue({ id_library:5, id_user: 10 });
    const r = await request(app)
      .put('/reading-lists/11')
      .set('x-user-id','10')
      .send({ status: 'DONE' });
    expect(r.status).toBe(200);
    expect(mockUpdateStatus).toHaveBeenCalled();
  });

  it('403 si library owner différent', async () => {
    mockRLFind.mockResolvedValue({ id: 12, id_library: 6 });
    mockLibFind.mockResolvedValue({ id_library:6, id_user: 777 });
    const r = await request(app)
      .put('/reading-lists/12')
      .set('x-user-id','10')
      .send({ status: 'DONE' });
    expect(r.status).toBe(403);
    expect(mockUpdateStatus).not.toHaveBeenCalled();
  });

  it('bypass admin', async () => {
    mockRLFind.mockResolvedValue({ id: 13, id_library: 7 });
    mockLibFind.mockResolvedValue({ id_library:7, id_user: 999 });
    const r = await request(app)
      .put('/reading-lists/13')
      .set('x-user-id','50')
      .set('x-roles','admin')
      .send({ status: 'DONE' });
    expect(r.status).toBe(200);
    expect(mockUpdateStatus).toHaveBeenCalled();
  });

  it('404 si entry absente', async () => {
    mockRLFind.mockResolvedValue(null);
    const r = await request(app)
      .delete('/reading-lists/99')
      .set('x-user-id','10');
    expect(r.status).toBe(404);
    expect(mockRemove).not.toHaveBeenCalled();
  });
});
