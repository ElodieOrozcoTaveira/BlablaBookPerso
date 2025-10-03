import request from 'supertest';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { app } from '../../src/server.js';
import sequelize from '../../src/config/database.js';
import Book from '../../src/models/Book.js';
import Notice from '../../src/models/Notice.js';

// Mock OpenLibraryService pour réponse stable
vi.mock('../../src/services/openlibrary.service.js', () => ({
  OpenLibraryService: vi.fn().mockImplementation(() => ({
    getBookDetails: async (key: string) => ({
      key,
      title: 'Livre importé',
      description: 'Desc test',
      covers: [12345],
      authors: [{ author: { key: '/authors/OL1A' } }],
      first_publish_date: '2020-01-01',
      subjects: ['Test', 'Roman']
    })
  }))
}));


const TEST_KEY = '/works/OLTEST';
const TEST_USER_EMAIL = 'user1@test.com';

// Helper pour créer un utilisateur et obtenir le cookie de session
async function getSessionCookie() {
  // D'abord créer l'utilisateur s'il n'existe pas
  await request(app)
    .post('/api/users/register')
    .send({
      firstname: 'Test',
      lastname: 'User',
      username: 'testuser1',
      email: TEST_USER_EMAIL,
      password: 'TestPassword123@'
    });
  
  // Puis se connecter via test-login
  const res = await request(app)
    .post('/api/test-login')
    .send({ email: TEST_USER_EMAIL });
    
  let cookie: string | undefined;
  const setCookie = res.headers['set-cookie'];
  if (Array.isArray(setCookie)) {
    cookie = setCookie.find((c: string) => c.startsWith('blablabook.sid'));
  } else if (typeof setCookie === 'string') {
    cookie = setCookie;
  }
  expect(cookie).toBeDefined();
  return cookie!;
}

describe('Lazy import notice (intégration)', () => {
  let sessionCookie: string;
  let testUserId: number;

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    sessionCookie = await getSessionCookie();
    // Récupère l’id user pour vérification
    const User = (await import('../../src/models/User.js')).default;
    const user = await User.findOne({ where: { email: TEST_USER_EMAIL } });
  expect(user).not.toBeNull();
  testUserId = user ? user.id_user : 0;
  });

  it('crée le livre et la notice via open_library_key', async () => {
    expect(await Book.findOne({ where: { open_library_key: TEST_KEY } })).toBeNull();

    const res = await request(app)
      .post('/api/notices')
      .set('Cookie', sessionCookie)
      .send({ open_library_key: TEST_KEY, content: 'Ma note', title: 'Titre test' });
    expect(res.status).toBe(201);
    expect(res.body.notice).toBeDefined();

    const book = await Book.findOne({ where: { open_library_key: TEST_KEY } });
    expect(book).not.toBeNull();
    expect(book?.import_status).toBe('confirmed');
    expect(book?.title).toBe('Livre importé');

    const notice = await Notice.findOne({ where: { id_book: book?.id_book, id_user: testUserId } });
    expect(notice).not.toBeNull();
    expect(notice?.content).toBe('Ma note');
  });

  it('ne crée pas de doublon sur second POST', async () => {
    await request(app)
      .post('/api/notices')
      .set('Cookie', sessionCookie)
      .send({ open_library_key: TEST_KEY, content: 'Première note', title: 'Titre1' });
    await request(app)
      .post('/api/notices')
      .set('Cookie', sessionCookie)
      .send({ open_library_key: TEST_KEY, content: 'Seconde note', title: 'Titre2' });
    const books = await Book.findAll({ where: { open_library_key: TEST_KEY } });
    expect(books.length).toBe(1);
    const notices = await Notice.findAll({ where: { id_book: books[0].id_book } });
    expect(notices.length).toBe(2);
  });
});
