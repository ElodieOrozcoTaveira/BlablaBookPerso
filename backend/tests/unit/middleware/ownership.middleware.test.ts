import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireOwnership } from '../../../src/middleware/ownership.js';

function makeReq(partial: any = {}) {
  return {
    params: {},
    body: {},
    query: {},
    user: { id_user: 10, roles: [] },
    ...partial
  } as any;
}

function makeRes() {
  const res: any = {};
  res.statusCode = 200;
  res.body = undefined;
  res.status = vi.fn().mockImplementation((code: number) => { res.statusCode = code; return res; });
  res.json = vi.fn().mockImplementation((payload: any) => { res.body = payload; return res; });
  return res;
}

describe('middleware/ownership', () => {
  let auditEvents: any[];
  let model: any;

  beforeEach(() => {
    auditEvents = [];
    model = {
      findByPk: vi.fn()
    };
  });

  it('autorise le propriétaire (cas simple)', async () => {
    model.findByPk.mockResolvedValue({ id: 1, id_user: 10 });
    const mw = requireOwnership({ model, idKey: 'id', attachAs: 'resource', ownerField: 'id_user', audit: e => auditEvents.push(e) });
    const req = makeReq({ params: { id: 1 } });
    const res = makeRes();
    const next = vi.fn();

    await mw(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.resource).toBeDefined();
  const last = auditEvents[auditEvents.length - 1];
  expect(last?.result).toBe('allow-owner');
  });

  it('bloque si identifiant manquant', async () => {
    const mw = requireOwnership({ model, idKey: 'id', attachAs: 'resource' });
    const req = makeReq();
    const res = makeRes();
    const next = vi.fn();

    await mw(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.body?.error).toMatch(/id manquant/);
  });

  it('retourne 404 si ressource absente', async () => {
    model.findByPk.mockResolvedValue(null);
    const mw = requireOwnership({ model, idKey: 'id', attachAs: 'resource' });
    const req = makeReq({ params: { id: 42 } });
    const res = makeRes();
    const next = vi.fn();

    await mw(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('403 si pas propriétaire', async () => {
    model.findByPk.mockResolvedValue({ id: 2, id_user: 99 });
    const mw = requireOwnership({ model, idKey: 'id', attachAs: 'resource' });
    const req = makeReq({ params: { id: 2 } });
    const res = makeRes();
    const next = vi.fn();

    await mw(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('bypass admin', async () => {
    model.findByPk.mockResolvedValue({ id: 3, id_user: 99 });
    const mw = requireOwnership({ model, idKey: 'id', attachAs: 'resource' });
    const req = makeReq({ params: { id: 3 }, user: { id_user: 50, roles: ['admin'] } });
    const res = makeRes();
    const next = vi.fn();

    await mw(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.resource).toBeDefined();
  });

  it('utilise resourceLoader + ownerResolver indirect', async () => {
    const fakeResource = { id: 7, id_library: 5 };
    const libraryOwner = 10; // même que req.user.id_user
    const mw = requireOwnership({
      model, // non utilisé car resourceLoader fourni
      idKey: 'entryId',
      attachAs: 'entry',
      resourceLoader: vi.fn().mockResolvedValue(fakeResource),
      ownerResolver: vi.fn().mockResolvedValue(libraryOwner),
    });
    const req = makeReq({ params: { entryId: 7 } });
    const res = makeRes();
    const next = vi.fn();

    await mw(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.entry).toEqual(fakeResource);
  });

  it('ownerResolver indirect refuse si mismatch', async () => {
    const fakeResource = { id: 8, id_library: 5 };
    const mw = requireOwnership({
      model,
      idKey: 'entryId',
      attachAs: 'entry',
      resourceLoader: vi.fn().mockResolvedValue(fakeResource),
      ownerResolver: vi.fn().mockResolvedValue(999), // autre user
    });
    const req = makeReq({ params: { entryId: 8 } });
    const res = makeRes();
    const next = vi.fn();

    await mw(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
