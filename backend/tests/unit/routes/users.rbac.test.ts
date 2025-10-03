import request from 'supertest';
import express from 'express';
import { describe, beforeAll, beforeEach, it, expect, vi } from 'vitest';
import { requirePermission } from '../../../src/middleware/permission.js';

// Mock findByPk (pas de vraie DB)
const findByPkMock = vi.fn();

function userWith(perms: string[]) {
  return {
    id_user: 777,
    getRoles: async () => [{
      getPermissions: async () => perms.map(p => ({ label: p }))
    }]
  } as any;
}

describe('RBAC minimal Users (ADMIN_USERS & VIEW_USER_STATS)', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Injection de session (simule authenticateToken)
    const injectSession = (req: any, _res: any, next: any) => {
      if ((globalThis as any).__RBAC_TEST_SESSION) {
        req.session = (globalThis as any).__RBAC_TEST_SESSION;
      }
      next();
    };

    // Route GET /users protégée par ADMIN_USERS
    app.get('/users', injectSession, requirePermission('ADMIN_USERS'), (req: any, res) => {
      res.status(200).json({ ok: true, userPermissions: req.userPermissions });
    });

    // Route GET /users/:id/stats protégée par VIEW_USER_STATS
    app.get('/users/:id/stats', injectSession, requirePermission('VIEW_USER_STATS'), (req: any, res) => {
      res.status(200).json({ ok: true, target: req.params.id, userPermissions: req.userPermissions });
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).__TEST_MODEL_OVERRIDES = { User: { Model: { findByPk: findByPkMock } } };
  });

  // --- /users (ADMIN_USERS) ---
  it('GET /users -> 401 si non authentifié', async () => {
    (globalThis as any).__RBAC_TEST_SESSION = undefined;
    findByPkMock.mockReset();
    const res = await request(app).get('/users');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  it('GET /users -> 403 sans permission ADMIN_USERS', async () => {
    (globalThis as any).__RBAC_TEST_SESSION = { isAuthenticated: true, userId: 777, email: 'user@test.com' };
    findByPkMock.mockResolvedValue(userWith(['VIEW_USER_STATS']));
    const res = await request(app).get('/users');
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Insufficient permissions');
    expect(res.body.required).toContain('ADMIN_USERS');
  });

  it('GET /users -> 200 avec ADMIN_USERS', async () => {
    (globalThis as any).__RBAC_TEST_SESSION = { isAuthenticated: true, userId: 777, email: 'admin@test.com' };
    findByPkMock.mockResolvedValue(userWith(['ADMIN_USERS','VIEW_USER_STATS']));
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.userPermissions).toContain('ADMIN_USERS');
  });

  // --- /users/:id/stats (VIEW_USER_STATS) ---
  it('GET /users/:id/stats -> 401 si non authentifié', async () => {
    (globalThis as any).__RBAC_TEST_SESSION = undefined;
    findByPkMock.mockReset();
    const res = await request(app).get('/users/42/stats');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  it('GET /users/:id/stats -> 403 sans VIEW_USER_STATS', async () => {
    (globalThis as any).__RBAC_TEST_SESSION = { isAuthenticated: true, userId: 777, email: 'user@test.com' };
    findByPkMock.mockResolvedValue(userWith(['ADMIN_USERS']));
    const res = await request(app).get('/users/42/stats');
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Insufficient permissions');
    expect(res.body.required).toContain('VIEW_USER_STATS');
  });

  it('GET /users/:id/stats -> 200 avec VIEW_USER_STATS', async () => {
    (globalThis as any).__RBAC_TEST_SESSION = { isAuthenticated: true, userId: 777, email: 'admin@test.com' };
    findByPkMock.mockResolvedValue(userWith(['ADMIN_USERS','VIEW_USER_STATS']));
    const res = await request(app).get('/users/42/stats');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.target).toBe('42');
    expect(res.body.userPermissions).toContain('VIEW_USER_STATS');
  });
});
