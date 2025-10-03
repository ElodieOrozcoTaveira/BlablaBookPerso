import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server.js';
import { resetAndSeed } from './utils/test-seed-helpers.js';
import { loginAs } from './utils/test-auth-helpers.js';

/**
 * Tests d'intégration RBAC export:
 * - /api/export/me (EXPORT requis)
 * - /api/export/stats (ADMIN + EXPORT requis)
 */
describe('Integration Export Permissions', () => {
  let adminCookie: string[] = [];
  let userCookie: string[] = [];
  let noPermCookie: string[] = [];

  beforeAll(async () => {
    await resetAndSeed();
    adminCookie = await loginAs('admin');
    userCookie = await loginAs('user');
  // user2 n'a pas les permissions EXPORT/ADMIN via seed
  noPermCookie = await loginAs('user2');
  });

  it('GET /api/export/me - 200 admin & user possédant EXPORT, 401 anonyme', async () => {
    const anon = await request(app).get('/api/export/me');
    expect(anon.status).toBe(401);

    const adminRes = await request(app).get('/api/export/me').set('Cookie', adminCookie);
    expect(adminRes.status).toBe(200);
    expect(adminRes.body).toHaveProperty('data');

    const userRes = await request(app).get('/api/export/me').set('Cookie', userCookie);
    expect(userRes.status).toBe(200);

    const noPermRes = await request(app).get('/api/export/me').set('Cookie', noPermCookie);
    expect([403,401]).toContain(noPermRes.status); // selon seed
  });

  it('GET /api/export/stats - 200 admin, 403 user/noPerm, 401 anon', async () => {
    const anon = await request(app).get('/api/export/stats');
    expect(anon.status).toBe(401);

    const adminRes = await request(app).get('/api/export/stats').set('Cookie', adminCookie);
    expect(adminRes.status).toBe(200);

    const userRes = await request(app).get('/api/export/stats').set('Cookie', userCookie);
    expect([403,401]).toContain(userRes.status);

    const noPermRes = await request(app).get('/api/export/stats').set('Cookie', noPermCookie);
    expect([403,401]).toContain(noPermRes.status);
  });
});
