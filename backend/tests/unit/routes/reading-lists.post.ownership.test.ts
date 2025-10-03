import request from 'supertest';
import express from 'express';
import { vi, describe, beforeEach, it, expect } from 'vitest';

const mockLibraryFind = vi.fn();
const mockReadingCreate = vi.fn();

vi.mock('../../../src/models/Library.js', () => ({ default: { findByPk: mockLibraryFind } }));
vi.mock('../../../src/models/ReadingList.js', () => ({ default: { findOne: vi.fn().mockResolvedValue(null), create: mockReadingCreate } }));
vi.mock('../../../src/models/Book.js', () => ({ default: { findByPk: vi.fn().mockResolvedValue({ id_book: 99 }) } }));

vi.mock('../../../src/middleware/auth.js', () => ({ authenticateToken: () => (req:any,_res:any,next:any)=>{ req.user={ id_user:10, roles:[]}; next(); } }));
vi.mock('../../../src/middleware/validation.js', () => ({ validateBody: ()=> (_r:any,_s:any,n:any)=>n(), validateParams: ()=> (_r:any,_s:any,n:any)=>n(), validateQuery: ()=> (_r:any,_s:any,n:any)=>n() }));
vi.mock('../../../src/middleware/permission.js', () => ({
  requirePermission: () => (_req:any,_res:any,next:any)=> next()
}));

// Simplifier requireOwnership pour ce test (tester wiring POST) -> on laisse réel, mais il utilisera Library mocké

vi.mock('../../../src/services/book-action.service.js', () => ({ BookActionService: class { async prepareBookForAction(){ return { book: { id_book: 99, import_status: 'confirmed', update: async()=>{} } }; } } }));

describe('POST /reading-lists ownership', () => {
  let app: express.Application;
  beforeEach(async () => {
    vi.clearAllMocks();
    mockLibraryFind.mockResolvedValue({ id_library: 5, id_user: 10 });
    mockReadingCreate.mockResolvedValue({ id_library:5, id_book:99, reading_status:'to_read' });
    app = express();
    app.use(express.json());
    const { default: routes } = await import('../../../src/routes/reading-lists.js');
    app.use('/reading-lists', routes);
  });

  it('accepte si propriétaire', async () => {
    const r = await request(app).post('/reading-lists').send({ id_library:5, id_book:99, reading_status:'to_read' });
    expect(r.status).toBe(201);
    expect(mockReadingCreate).toHaveBeenCalled();
  });

  it('refuse 403 si non propriétaire', async () => {
    mockLibraryFind.mockResolvedValue({ id_library: 6, id_user: 999 });
    const r = await request(app).post('/reading-lists').send({ id_library:6, id_book:99 });
    expect(r.status).toBe(403);
  });

  it('404 si bibliothèque inexistante', async () => {
    mockLibraryFind.mockResolvedValue(null);
    const r = await request(app).post('/reading-lists').send({ id_library:7, id_book:99 });
    expect(r.status).toBe(404);
  });
});
