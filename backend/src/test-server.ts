import express from 'express';
import cors from 'cors';


const app = express();

// Middleware basique
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));



// Route de test
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server running',
    timestamp: new Date().toISOString()
  });
});

// Simple route pour tester
app.get('/', (req, res) => {
  res.send('Test Server');
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`🔐 Better Auth available at http://localhost:${PORT}/api/auth`);
});
