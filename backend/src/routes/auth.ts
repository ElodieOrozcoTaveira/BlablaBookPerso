import express from 'express';

const router = express.Router();

// Authentication routes (placeholder for Better Auth integration)
router.post('/register', (req, res) => {
  res.json({
    success: false,
    message: 'Authentication routes will be handled by Better Auth'
  });
});

router.post('/login', (req, res) => {
  res.json({
    success: false,
    message: 'Authentication routes will be handled by Better Auth'
  });
});

router.post('/logout', (req, res) => {
  res.json({
    success: false,
    message: 'Authentication routes will be handled by Better Auth'
  });
});

export default router;