import request from 'supertest';
import express from 'express';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { mockAuthenticateToken, mockRequirePermission } from '../../utils/auth-mocks.js';

vi.mock('../../../src/middleware/auth.js', () => ({
  authenticateToken: mockAuthenticateToken()
}));
vi.mock('../../../src/middleware/permission.js', () => ({
  requirePermission: mockRequirePermission(false)
}));

const mockCreateGenre = vi.fn();
const mockUpdateGenre = vi.fn();
const mockDeleteGenre = vi.fn();
const mockGetAllGenres = vi.fn();
const mockGetGenreById = vi.fn();

vi.mock('../../../src/controllers/genre.controller.js', () => ({
  createGenre: mockCreateGenre,
  updateGenre: mockUpdateGenre,
  deleteGenre: mockDeleteGenre,
  getAllGenres: mockGetAllGenres,
  getGenreById: mockGetGenreById
}));

describe('RBAC Denied - Genre Routes', () => {
  let app: express.Application;
  beforeEach(async () => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    const { default: genreRoutes } = await import('../../../src/routes/genres.js');
    app.use('/genres', genreRoutes);
  });

  it('POST /genres -> 403 si permission CREATE_GENRE manquante', async () => {
    const response = await request(app).post('/genres').send({ name: 'X' });
    expect(response.status).toBe(403);
    expect(mockCreateGenre).not.toHaveBeenCalled();
  });

  it('PUT /genres/1 -> 403 si permission UPDATE_GENRE manquante', async () => {
    const response = await request(app).put('/genres/1').send({ name: 'Y' });
    expect(response.status).toBe(403);
    expect(mockUpdateGenre).not.toHaveBeenCalled();
  });

  it('DELETE /genres/1 -> 403 si permission DELETE_GENRE manquante', async () => {
    const response = await request(app).delete('/genres/1');
    expect(response.status).toBe(403);
    expect(mockDeleteGenre).not.toHaveBeenCalled();
  });
});
