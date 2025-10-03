import request from 'supertest';
import express from 'express';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { requireOwnership } from '../../../src/middleware/ownership.js';

// Stub modèle (évite import réel & DB)
const mockFind = vi.fn();
const MockLibraryModel: any = { name: 'Library', findByPk: (id: any) => mockFind(id) };

function buildApp() {
  const app = express();
  app.use(express.json());
  // injection user depuis headers
  const injectUser = (req: any, _res: any, next: any) => {
    const uid = req.headers['x-user-id'] ? Number(req.headers['x-user-id']) : 10;
    const roles = (req.headers['x-roles'] as string)?.split(',').filter(Boolean) || [];
    req.user = { id_user: uid, roles };
    next();
  };

  app.put('/libraries/:id',
    injectUser,
    requireOwnership({ model: MockLibraryModel, idLocation: 'params', idKey: 'id', ownerField: 'id_user', attachAs: 'library' }),
    (req: any, res) => res.json({ success: true, updated: true, id: req.params.id })
  );

  app.delete('/libraries/:id',
    injectUser,
    requireOwnership({ model: MockLibraryModel, idLocation: 'params', idKey: 'id', ownerField: 'id_user', attachAs: 'library' }),
    (_req: any, res) => res.status(204).end()
  );

  return app;
}

describe('Libraries Ownership Minimal', () => {
  let app: express.Application;

  beforeEach(() => {
    vi.clearAllMocks();
    app = buildApp();
  });

  it('autorise propriétaire (PUT)', async () => {
    mockFind.mockResolvedValue({ id: 5, id_user: 10 });
    const r = await request(app).put('/libraries/5').set('x-user-id','10').send({ name: 'Nouv' });
    expect(r.status).toBe(200);
  });

  it('403 si non propriétaire (PUT)', async () => {
    mockFind.mockResolvedValue({ id: 6, id_user: 77 });
    const r = await request(app).put('/libraries/6').set('x-user-id','10').send({ name: 'X' });
    expect(r.status).toBe(403);
  });

  it('bypass admin (PUT)', async () => {
    mockFind.mockResolvedValue({ id: 7, id_user: 77 });
    const r = await request(app).put('/libraries/7').set('x-user-id','50').set('x-roles','admin').send({ name: 'Admin' });
    expect(r.status).toBe(200);
  });

  it('404 si ressource absente (DELETE)', async () => {
    mockFind.mockResolvedValue(null);
    const r = await request(app).delete('/libraries/123').set('x-user-id','10');
    expect(r.status).toBe(404);
  });

  it('403 delete si non propriétaire', async () => {
    mockFind.mockResolvedValue({ id: 8, id_user: 99 });
    const r = await request(app).delete('/libraries/8').set('x-user-id','10');
    expect(r.status).toBe(403);
  });

  it('delete propriétaire OK', async () => {
    mockFind.mockResolvedValue({ id: 9, id_user: 10 });
    const r = await request(app).delete('/libraries/9').set('x-user-id','10');
    expect(r.status).toBe(204);
  });

  it('delete admin bypass OK', async () => {
    mockFind.mockResolvedValue({ id: 10, id_user: 500 });
    const r = await request(app).delete('/libraries/10').set('x-user-id','42').set('x-roles','admin');
    expect(r.status).toBe(204);
  });
});
