import express from 'express';
import request from 'supertest';
import { describe, beforeAll, beforeEach, it, expect, vi } from 'vitest';
import { requirePermission } from '../../../src/middleware/permission.js';

const findByPkMock = vi.fn();

function userWith(perms: string[]) {
  return {
    id_user: 555,
    getRoles: async () => [{
      getPermissions: async () => perms.map(p => ({ label: p }))
    }]
  } as any;
}

describe('RBAC route minimal DELETE /authors/:id (DELETE_AUTHOR)', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.delete('/authors/:id',
      (req: any, _res, next) => {
        if ((globalThis as any).__RBAC_TEST_SESSION) {
          req.session = (globalThis as any).__RBAC_TEST_SESSION;
        }
        next();
      },
      requirePermission('DELETE_AUTHOR'),
      (req: any, res) => res.status(200).json({ ok: true, deletedId: req.params.id, userPermissions: req.userPermissions })
    );
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).__TEST_MODEL_OVERRIDES = { User: { Model: { findByPk: findByPkMock } } };
  });

  it('401 si non authentifié', async () => {
    (globalThis as any).__RBAC_TEST_SESSION = undefined;
    const res = await request(app).delete('/authors/7');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  it('403 si authentifié sans DELETE_AUTHOR', async () => {
    (globalThis as any).__RBAC_TEST_SESSION = { isAuthenticated: true, userId: 555, email: 'u@test.com' };
    findByPkMock.mockResolvedValue(userWith(['UPDATE_AUTHOR']));
    const res = await request(app).delete('/authors/7');
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Insufficient permissions');
    expect(res.body.required).toContain('DELETE_AUTHOR');
  });

  it('200 si authentifié avec DELETE_AUTHOR', async () => {
    (globalThis as any).__RBAC_TEST_SESSION = { isAuthenticated: true, userId: 555, email: 'admin@test.com' };
    findByPkMock.mockResolvedValue(userWith(['DELETE_AUTHOR','UPDATE_AUTHOR']));
    const res = await request(app).delete('/authors/7');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.deletedId).toBe('7');
    expect(res.body.userPermissions).toContain('DELETE_AUTHOR');
  });
});
