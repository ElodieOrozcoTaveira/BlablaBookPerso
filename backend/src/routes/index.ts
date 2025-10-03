import express from 'express';

const router = express.Router();

// Main routes index
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'BlaBlaBook API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/user',
      books: '/api/books',
      libraries: '/api/libraries',
      readingLists: '/api/reading-lists',
      notices: '/api/notices',
      rates: '/api/rates',
      authors: '/api/authors',
      genres: '/api/genres',
      upload: '/api/upload'
    }
  });
});

export default router;