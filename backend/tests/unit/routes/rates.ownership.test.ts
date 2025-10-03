import request from 'supertest';
import express from 'express';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { requireOwnership } from '../../../src/middleware/ownership.js';

const mockFind = vi.fn();
const MockRateModel: any = { name: 'Rate', findByPk: (id:any) => mockFind(id) };

function buildApp() {
  const app = express();
  app.use(express.json());
  const injectUser = (req:any,_res:any,next:any) => {
    const uid = req.headers['x-user-id'] ? Number(req.headers['x-user-id']) : 10;
    const roles = (req.headers['x-roles'] as string)?.split(',').filter(Boolean) || [];
    req.user = { id_user: uid, roles };
    next();
  };
  app.put('/rates/:id', injectUser, requireOwnership({ model: MockRateModel, idLocation:'params', idKey:'id', ownerField:'id_user', attachAs:'rate' }), (req:any,res)=> res.json({ success:true, updated:true, id:req.params.id }));
  app.delete('/rates/:id', injectUser, requireOwnership({ model: MockRateModel, idLocation:'params', idKey:'id', ownerField:'id_user', attachAs:'rate' }), (_req:any,res)=> res.status(204).end());
  return app;
}

describe('Rates Ownership Minimal', () => {
  let app: express.Application;
  beforeEach(() => {
    vi.clearAllMocks();
    app = buildApp();
  });

  it('update propriétaire OK', async () => {
    mockFind.mockResolvedValue({ id: 5, id_user: 10 });
    const r = await request(app).put('/rates/5').set('x-user-id','10').send({ value:4 });
    expect(r.status).toBe(200);
  });
  it('update 403 non propriétaire', async () => {
    mockFind.mockResolvedValue({ id: 6, id_user: 77 });
    const r = await request(app).put('/rates/6').set('x-user-id','10').send({ value:3 });
    expect(r.status).toBe(403);
  });
  it('update admin bypass', async () => {
    mockFind.mockResolvedValue({ id: 7, id_user: 77 });
    const r = await request(app).put('/rates/7').set('x-user-id','42').set('x-roles','admin').send({ value:5 });
    expect(r.status).toBe(200);
  });
  it('delete 404 absent', async () => {
    mockFind.mockResolvedValue(null);
    const r = await request(app).delete('/rates/123').set('x-user-id','10');
    expect(r.status).toBe(404);
  });
  it('delete 403 non propriétaire', async () => {
    mockFind.mockResolvedValue({ id: 8, id_user: 99 });
    const r = await request(app).delete('/rates/8').set('x-user-id','10');
    expect(r.status).toBe(403);
  });
  it('delete propriétaire OK', async () => {
    mockFind.mockResolvedValue({ id: 9, id_user: 10 });
    const r = await request(app).delete('/rates/9').set('x-user-id','10');
    expect(r.status).toBe(204);
  });
  it('delete admin bypass OK', async () => {
    mockFind.mockResolvedValue({ id: 10, id_user: 500 });
    const r = await request(app).delete('/rates/10').set('x-user-id','42').set('x-roles','admin');
    expect(r.status).toBe(204);
  });
});
