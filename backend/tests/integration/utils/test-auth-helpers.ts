import request from 'supertest';
import { app } from '../../../src/server.js';

// mapping simple type->credentials d'après seed
const USERS: Record<string, { email: string; password: string }> = {
  admin: { email: 'admin@blablabook.com', password: 'password123' },
  user: { email: 'john@example.com', password: 'password123' },
  user2: { email: 'jane@example.com', password: 'password123' },
  admin1: { email: 'admin1@test.com', password: 'Adminpass123!' },
  user1: { email: 'user1@test.com', password: 'Userpass123!' }
};

export async function loginAs(kind: string): Promise<string[]> {
  const creds = USERS[kind];
  if (!creds) throw new Error('Unknown user kind ' + kind);
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: creds.email, password: creds.password });
  if (res.status !== 200) throw new Error('Login failed for ' + kind + ' status=' + res.status);
  const raw = res.headers['set-cookie'];
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}
