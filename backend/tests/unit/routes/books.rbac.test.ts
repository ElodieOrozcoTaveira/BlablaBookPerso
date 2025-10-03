import request from 'supertest';
import express from 'express';
import { describe, beforeAll, it, expect, vi, beforeEach } from 'vitest';
import { requirePermission } from '../../../src/middleware/permission.js';

const findByPkMock = vi.fn();

function userWith(perms: string[]) {
  return {
    id_user: 1002,
    getRoles: async () => [{ getPermissions: async () => perms.map(p => ({ label: p })) }]
  } as any;
}

describe('RBAC route minimal POST /books (CREATE_BOOK)', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    app.post('/books',
      (req: any, _res, next) => {
        if ((globalThis as any).__RBAC_TEST_SESSION) {
          req.session = (globalThis as any).__RBAC_TEST_SESSION;
        }
        next();
      },
      requirePermission('CREATE_BOOK'),
      (req: any, res) => res.status(201).json({ ok: true, userPermissions: req.userPermissions })
    );
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).__TEST_MODEL_OVERRIDES = { User: { Model: { findByPk: findByPkMock } } };
  });

  it('401 si non authentifié', async () => {
    (globalThis as any).__RBAC_TEST_SESSION = undefined;
    findByPkMock.mockReset();
    const res = await request(app).post('/books').send({ title: 'T' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });

  it('403 si authentifié sans CREATE_BOOK', async () => {
    (globalThis as any).__RBAC_TEST_SESSION = { isAuthenticated: true, userId: 1002, email: 'u@test.com' };
    findByPkMock.mockResolvedValue(userWith(['UPDATE_BOOK']));
    const res = await request(app).post('/books').send({ title: 'X' });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Insufficient permissions');
    expect(res.body.required).toContain('CREATE_BOOK');
  });

  it('201 si authentifié avec CREATE_BOOK', async () => {
    (globalThis as any).__RBAC_TEST_SESSION = { isAuthenticated: true, userId: 1002, email: 'admin@test.com' };
    findByPkMock.mockResolvedValue(userWith(['CREATE_BOOK','UPDATE_BOOK']));
    const res = await request(app).post('/books').send({ title: 'Y' });
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.userPermissions).toContain('CREATE_BOOK');
  });
});
