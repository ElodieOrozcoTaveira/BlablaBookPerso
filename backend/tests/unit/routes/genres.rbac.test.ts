// Test RBAC minimal genres (401 / 403 / 201)
import request from 'supertest';
import express from 'express';
import { describe, beforeAll, it, expect, vi, beforeEach } from 'vitest';
import { requirePermission } from '../../../src/middleware/permission.js';

// Mock findByPk (aucune vraie requete DB)
const findByPkMock = vi.fn();

function userWith(perms: string[]) {
    return {
        id_user: 1001,
        getRoles: async () => [{
            getPermissions: async () => perms.map(p => ({ label: p }))
        }]
    } as any;
}

describe('RBAC route minimal POST /genres (CREATE_GENRE)', () => {
    let app: express.Application;

    beforeAll(() => {
        app = express();
        app.use(express.json());

        app.post(
            '/genres',
            (req: any, _res, next) => {
                if ((globalThis as any).__RBAC_TEST_SESSION) {
                    req.session = (globalThis as any).__RBAC_TEST_SESSION;
                }
                next();
            },
            requirePermission('CREATE_GENRE'),
            (req: any, res) => res.status(201).json({ ok: true, userPermissions: req.userPermissions })
        );
    });

    beforeEach(() => {
        vi.clearAllMocks();
        (globalThis as any).__TEST_MODEL_OVERRIDES = { User: { Model: { findByPk: findByPkMock } } };
    });

    it('401 si non authentifie', async () => {
        (globalThis as any).__RBAC_TEST_SESSION = undefined;
        findByPkMock.mockReset();
        const res = await request(app).post('/genres').send({ name: 'Fantastique' });
        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Authentication required');
    });

    it('403 si authentifie sans CREATE_GENRE', async () => {
        (globalThis as any).__RBAC_TEST_SESSION = { isAuthenticated: true, userId: 1001, email: 'u@test.com' };
        findByPkMock.mockResolvedValue(userWith(['UPDATE_GENRE']));
        const res = await request(app).post('/genres').send({ name: 'Polar' });
        expect(res.status).toBe(403);
        expect(res.body.error).toBe('Insufficient permissions');
        expect(res.body.required).toContain('CREATE_GENRE');
    });

    it('201 si authentifie avec CREATE_GENRE', async () => {
        (globalThis as any).__RBAC_TEST_SESSION = { isAuthenticated: true, userId: 1001, email: 'admin@test.com' };
        findByPkMock.mockResolvedValue(userWith(['CREATE_GENRE', 'UPDATE_GENRE']));
        const res = await request(app).post('/genres').send({ name: 'SF' });
        expect(res.status).toBe(201);
        expect(res.body.ok).toBe(true);
        expect(res.body.userPermissions).toContain('CREATE_GENRE');
    });
});
