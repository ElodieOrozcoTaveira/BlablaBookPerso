import express from 'express';
import request from 'supertest';
import { describe, beforeAll, beforeEach, it, expect, vi } from 'vitest';
import { requirePermission } from '../../../src/middleware/permission.js';

// Mock findByPk via override
const findByPkMock = vi.fn();

function userWith(perms: string[]) {
  return {
    id_user: 777,
    getRoles: async () => [{
      getPermissions: async () => perms.map(p => ({ label: p }))
    }]
  } as any;
}

describe('RBAC route minimal PUT /authors/:id (UPDATE_AUTHOR)', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.put('/authors/:id',
      (req: any, _res, next) => {
        if ((globalThis as any).__RBAC_TEST_SESSION) {
          req.session = (globalThis as any).__RBAC_TEST_SESSION;
        }
        next();
      },
      requirePermission('UPDATE_AUTHOR'),
      (req: any, res) => res.status(200).json({ ok: true, updatedId: req.params.id, userPermissions: req.userPermissions })
    );
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).__TEST_MODEL_OVERRIDES = { User: { Model: { findByPk: findByPkMock } } };
  });

  it('401 si non authentifié', async () => {
    (globalThis as any).__RBAC_TEST_SESSION = undefined;
    const res = await request(app).put('/authors/42').send({ name: 'X' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  it('403 si authentifié sans UPDATE_AUTHOR', async () => {
    (globalThis as any).__RBAC_TEST_SESSION = { isAuthenticated: true, userId: 777, email: 'u@test.com' };
    findByPkMock.mockResolvedValue(userWith(['CREATE_AUTHOR']));
    const res = await request(app).put('/authors/42').send({ name: 'Y' });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Insufficient permissions');
    expect(res.body.required).toContain('UPDATE_AUTHOR');
  });

  it('200 si authentifié avec UPDATE_AUTHOR', async () => {
    (globalThis as any).__RBAC_TEST_SESSION = { isAuthenticated: true, userId: 777, email: 'admin@test.com' };
    findByPkMock.mockResolvedValue(userWith(['UPDATE_AUTHOR','CREATE_AUTHOR']));
    const res = await request(app).put('/authors/42').send({ name: 'Z' });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.updatedId).toBe('42');
    expect(res.body.userPermissions).toContain('UPDATE_AUTHOR');
  });
});
