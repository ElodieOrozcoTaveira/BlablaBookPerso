import request from 'supertest';
import express from 'express';
import { describe, beforeAll, it, expect, vi, beforeEach } from 'vitest';
import { requirePermission } from '../../../src/middleware/permission.js';

// Mock findByPk via override (on ne veut AUCUNE vraie requête DB ici)
const findByPkMock = vi.fn();

function userWith(perms: string[]) {
  return {
    id_user: 999,
    getRoles: async () => [{
      getPermissions: async () => perms.map(p => ({ label: p }))
    }]
  } as any;
}

describe('RBAC route minimal POST /authors (CREATE_AUTHOR)', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Route minimale reproduisant la chaîne: (injection session) -> requirePermission('CREATE_AUTHOR') -> handler
    app.post('/authors',
      // injection session depuis variable globale (simule authenticateToken réel)
      (req: any, _res, next) => {
        if ((globalThis as any).__RBAC_TEST_SESSION) {
          req.session = (globalThis as any).__RBAC_TEST_SESSION;
        }
        next();
      },
      requirePermission('CREATE_AUTHOR'),
      (req: any, res) => res.status(201).json({ ok: true, userPermissions: req.userPermissions })
    );
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).__TEST_MODEL_OVERRIDES = { User: { Model: { findByPk: findByPkMock } } };
  });

  it('401 si non authentifié (pas de session)', async () => {
    (globalThis as any).__RBAC_TEST_SESSION = undefined;
    findByPkMock.mockReset();
    const res = await request(app).post('/authors').send({ name: 'X' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  it('403 si authentifié sans permission CREATE_AUTHOR', async () => {
    (globalThis as any).__RBAC_TEST_SESSION = { isAuthenticated: true, userId: 999, email: 'u@test.com' };
    findByPkMock.mockResolvedValue(userWith(['UPDATE_AUTHOR']));
    const res = await request(app).post('/authors').send({ name: 'Y' });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Insufficient permissions');
    expect(res.body.required).toContain('CREATE_AUTHOR');
  });

  it('201 si authentifié avec CREATE_AUTHOR', async () => {
    (globalThis as any).__RBAC_TEST_SESSION = { isAuthenticated: true, userId: 999, email: 'admin@test.com' };
    findByPkMock.mockResolvedValue(userWith(['CREATE_AUTHOR','UPDATE_AUTHOR']));
    const res = await request(app).post('/authors').send({ name: 'Z' });
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.userPermissions).toContain('CREATE_AUTHOR');
  });
});
