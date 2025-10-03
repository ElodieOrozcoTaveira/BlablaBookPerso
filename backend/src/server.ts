import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import session from 'express-session';
import redisClient, { sessionConfig } from './config/redis.js';
import dateFormatterMiddleware from './middleware/dateFormatter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRateLimit, corsOptions, helmetOptions } from './middleware/security.js';
import { sessionMiddleware } from './middleware/session.js';
import { validateBody, validateParams, validateQuery } from './middleware/validation.js';
import { setupAssociations } from './models/associations.js';
import apiRoutes from './routes/index.js';
import { bookParamsSchema, bookSearchSchema, createBookSchema } from './validation/book.zod.js';

// Charger les variables d'environnement en premier
config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Fonction d'initialisation du serveur (connexion Redis + associations Sequelize)
const startServer = async () => {
  try {
    await redisClient.connect();
    console.log('🔴 Redis connected for sessions');
    setupAssociations();
  } catch (error) {
    console.error('❌ Failed to initialize server:', error);
    process.exit(1);
  }
};

// 1. Sécurité en premier (ordre important !)
app.use(helmetOptions);           // Protection headers
app.use(cors(corsOptions));       // Politique CORS

// 2. Sessions Redis (avant parsing et routes)
app.use(sessionMiddleware);       // Middleware custom pour session (si tu en as besoin)
app.use(session(sessionConfig));  // Middleware express-session avec Redis

// 3. Parsing (après sessions)
app.use(express.json());

// 4. Middlewares custom
app.use(dateFormatterMiddleware);

// 5. Routes principales
app.get('/', (_req, res) => {
  res.send('Hello bablabook!');
});

app.use('/api', apiRoutes);

// Route test sécurité
app.get('/test-security', (req, res) => {
  res.json({
    message: 'Sécurité active !',
    headers: {
      cors: req.get('Origin') || 'Pas d\'origine',
      userAgent: req.get('User-Agent')?.substring(0, 50) || 'Unknown'
    }
  });
});

// Route test rate limiting (simule login)
app.post('/test-rate-limit', authRateLimit, (_req, res) => {
  res.json({ message: 'Tentative de connexion OK' });
});

// Route test dates
app.get('/test-dates', (_req, res) => {
  res.json({
    author: {
      name: 'Victor Hugo',
      birth_date: new Date('1802-02-26'),
      death_date: new Date('1885-05-22'),
      created_at: new Date()
    },
    books: [
      {
        title: 'Les Miserables',
        birth_date: null,
        created_at: new Date()
      }
    ]
  });
});

// Route test erreur
app.get('/test-error', (_req, _res, next) => {
  const error = new Error('Erreur de test');
  (error as any).status = 418;
  next(error);
});

// Routes test validation Zod

app.post('/test-validation-body', validateBody(createBookSchema), (req, res) => {
  res.json({
    success: true,
    message: 'Validation body OK !',
    validatedData: req.body,
    transforms: {
      authorIds: Array.isArray(req.body.author_ids) ? 'Array OK' : 'Not array',
      publicationYear: typeof req.body.publication_year
    }
  });
});

app.get('/test-validation-params/:id', validateParams(bookParamsSchema), (req, res) => {
  res.json({
    success: true,
    message: 'Validation params OK !',
    originalId: req.params.id,
    type: typeof req.params.id,
    isNumber: Number.isInteger(Number(req.params.id))
  });
});

app.get('/test-validation-query', validateQuery(bookSearchSchema), (req, res) => {
  res.json({
    success: true,
    message: 'Validation query OK !',
    validatedQuery: req.query,
    transforms: {
      page: typeof req.query.page,
      limit: typeof req.query.limit,
      publicationYear: typeof req.query.publication_year
    }
  });
});

// 6. Gestion des erreurs (dernier middleware)
app.use(errorHandler);

// Export de l'app pour les tests
export { app };

// Démarrage du serveur uniquement si on est pas en test
if (process.env.NODE_ENV !== 'test' && import.meta.url === `file://${process.argv[1]}`) {
  startServer().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server sécurisé sur http://localhost:${PORT}`);
    });
  });
} else if (process.env.NODE_ENV === 'test') {
  // Pour les tests, setup associations sans connexion Redis
  setupAssociations();
}
