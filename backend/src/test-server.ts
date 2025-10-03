import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { config } from 'dotenv';
import dateFormatterMiddleware from './middleware/dateFormatter.js';
import { helmetOptions, corsOptions, authRateLimit } from './middleware/security.js';
import { errorHandler } from './middleware/errorHandler.js';
import { validateBody, validateParams, validateQuery } from './middleware/validation.js';
import { createBookSchema, bookParamsSchema, bookSearchSchema } from './validation/book.zod.js';
import apiRoutes from './routes/index.js';
import { setupAssociations } from './models/associations.js';

config();

const app = express();

// Setup associations pour les tests
setupAssociations();

// 1. SECURITE EN PREMIER (ordre important !)
app.use(helmetOptions);           // Protection headers
app.use(cors(corsOptions));       // CORS policy

// 2. SESSIONS REDIS (AVANT parsing et routes) - version test sans Redis
app.use(session({
  secret: process.env.SESSION_SECRET || 'test-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// 3. PARSING (APR�S sessions)
app.use(express.json());

// 4. MIDDLEWARES CUSTOM
app.use(dateFormatterMiddleware);

// 5. ROUTES
app.get('/', (req, res) => {
  res.send('Hello bablabook!');
});

// Routes API principales
app.use('/api', apiRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Route test s�curit�
app.get('/test-security', (req, res) => {
  res.json({
    message: 'Securite active !',
    headers: {
      cors: req.get('Origin') || 'Pas d\'origine',
      userAgent: req.get('User-Agent')?.substring(0, 50)
    }
  });
});

// Route test rate limiting (simule login)
app.post('/test-rate-limit', authRateLimit, (req, res) => {
  res.json({ message: 'Tentative de connexion OK' });
});

// Route test dates (ton code existant)
app.get('/test-dates', (req, res) => {
  res.json({
    author: {
      name: 'Victor Hugo',
      created_at: new Date() // Reste en format timestamp
    },
    books: [
      {
        title: 'Les Miserables',
        birth_date: null, // Doit rester null
        created_at: new Date()
      }
    ]
  });
});

// Route test erreur
app.get('/test-error', (req, res, next) => {
  next(new Error('Erreur de test g�n�r�e !'));
});

// Routes test validation Zod
app.post('/test-validation-body', 
    validateBody(createBookSchema),
    (req, res) => {
        res.json({
            success: true,
            message: 'Validation body OK !',
            validatedData: req.body,
            transforms: {
                authorIds: Array.isArray(req.body.author_ids) ? 'Array OK' : 'Not array',
                publicationYear: typeof req.body.publication_year
            }
        });
    }
);

app.get('/test-validation-params/:id',
  validateParams(bookParamsSchema),
  (req, res) => {
    res.json({
      success: true,
      message: 'Validation params OK !',
      originalId: req.params.id,
      type: typeof req.params.id,
      isNumber: Number.isInteger(Number(req.params.id))
    });
  }
);

app.get('/test-validation-query',
    validateQuery(bookSearchSchema), 
    (req, res) => {
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
    }
);

// 5. ERROR HANDLER EN DERNIER !
app.use(errorHandler);

// Export de l'app pour les tests
export { app };