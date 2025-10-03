import express from 'express';
import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { requirePermission } from '../../../src/middleware/permission.js';

// mock findByPk via override global (évite hoisting vi.mock + import circulaire)
const findByPkMock = vi.fn();

// Helper pour fabriquer un user avec un ensemble de permissions
function makeUserWithPermissions(perms: string[]) {
  return {
    id_user: 42,
    getRoles: async () => [{
      getPermissions: async () => perms.map(p => ({ label: p }))
    }]
  } as any;
}

describe('middleware requirePermission (RBAC)', () => {
  let app: express.Application;
  // session de test injectée avant le middleware
  let testSession: any;

  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).__TEST_MODEL_OVERRIDES = {
      User: { Model: { findByPk: findByPkMock } }
    };
    app = express();
    app.use(express.json());
    testSession = undefined;
  });

  function mountRoute(mw: any, handler = (req: any, res: any) => res.json({ ok: true, granted: req.userPermissions })) {
    app.post('/test', (req: any, _res, next) => { // inject session avant middleware
      if (testSession) {
        req.session = testSession;
      }
      next();
    }, mw, handler);
  }

  it('401 si pas authentifié', async () => {
    mountRoute(requirePermission('CREATE_AUTHOR'));
    const res = await request(app).post('/test').send({});
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  it('403 si authentifié mais permission absente', async () => {
    findByPkMock.mockResolvedValue(makeUserWithPermissions(['UPDATE_AUTHOR']));
    testSession = { isAuthenticated: true, userId: 42, email: 'u@test.com' };
    mountRoute(requirePermission('CREATE_AUTHOR'));
    const res = await request(app).post('/test');
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Insufficient permissions');
    expect(res.body.required).toContain('CREATE_AUTHOR');
    expect(res.body.granted).not.toContain('CREATE_AUTHOR');
  });

  it('200 si permission unique présente', async () => {
    findByPkMock.mockResolvedValue(makeUserWithPermissions(['CREATE_AUTHOR','UPDATE_AUTHOR']));
    testSession = { isAuthenticated: true, userId: 42, email: 'admin@test.com' };
    mountRoute(requirePermission('CREATE_AUTHOR'));
    const res = await request(app).post('/test');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.granted).toContain('CREATE_AUTHOR');
  });

  it('403 si multi-permissions et une manque', async () => {
    findByPkMock.mockResolvedValue(makeUserWithPermissions(['CREATE_AUTHOR']));
    testSession = { isAuthenticated: true, userId: 42, email: 'admin@test.com' };
    mountRoute(requirePermission(['CREATE_AUTHOR','UPDATE_AUTHOR']));
    const res = await request(app).post('/test');
    expect(res.status).toBe(403);
    expect(res.body.required).toEqual(['CREATE_AUTHOR','UPDATE_AUTHOR']);
  });

  it('200 si multi-permissions toutes présentes', async () => {
    findByPkMock.mockResolvedValue(makeUserWithPermissions(['CREATE_AUTHOR','UPDATE_AUTHOR','DELETE_AUTHOR']));
    testSession = { isAuthenticated: true, userId: 42, email: 'admin@test.com' };
    mountRoute(requirePermission(['CREATE_AUTHOR','UPDATE_AUTHOR']));
    const res = await request(app).post('/test');
    expect(res.status).toBe(200);
    expect(res.body.granted).toEqual(expect.arrayContaining(['CREATE_AUTHOR','UPDATE_AUTHOR']));
  });
});
