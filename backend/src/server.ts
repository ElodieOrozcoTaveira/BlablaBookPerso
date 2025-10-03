import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import session from 'express-session';
import { initializeSession } from './config/redis.js';
import dateFormatterMiddleware from './middleware/dateFormatter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRateLimit, corsOptions, helmetOptions } from './middleware/security.js';
import { validateBody, validateParams, validateQuery } from './middleware/validation.js';
import { setupAssociations } from './models/associations.js';
import apiRoutes from './routes/index.js';
import { bookParamsSchema, bookSearchSchema, createBookSchema } from './validation/book.zod.js';

// Charger les variables d'environnement en premier
config();

const app = express();

const PORT = Number(process.env.PORT) || 3000;

// 0. CONNEXION REDIS ET SETUP SEQUELIZE + démarrage serveur
const startServer = async () => {
  try {
    // Initialiser la config de session Redis et l'ajouter au middleware Express
    const sessionConfig = await initializeSession();
    app.use(session(sessionConfig));

    // Setup associations Sequelize
    setupAssociations();

    // Middleware de sécurité
    app.use(helmetOptions);           // Protection headers
    app.use(cors(corsOptions));       // CORS policy

    // Parsing JSON (après session)
    app.use(express.json());

    // Middleware custom
    app.use(dateFormatterMiddleware);

    // Routes
    app.get('/', (_req, res) => {
      res.send('Hello bablabook!');
    });

    app.use('/api', apiRoutes);

    // Autres routes tests (rate limit, sécurité, validation, etc.)
    app.get('/test-security', (req, res) => {
      res.json({
        message: 'Securite active !',
        headers: {
          cors: req.get('Origin') || 'Pas d\'origine',
          userAgent: req.get('User-Agent')?.substring(0, 50)
        }
      });
    });

    app.post('/test-rate-limit', authRateLimit, (_req, res) => {
      res.json({ message: 'Tentative de connexion OK' });
    });

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

    app.get('/test-error', (_req, _res, next) => {
      const error = new Error('Erreur de test');
      (error as any).status = 418;
      next(error);
    });

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
          isNumber: Number.isInteger(req.params.id)
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

    // Handler d'erreur (toujours en dernier)
    app.use(errorHandler);

    // Démarrage du serveur
    app.listen(PORT, () => {
      console.log(`🚀 Server sécurisé sur http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Failed to initialize server:', error);
    process.exit(1);
  }
};

// Export de l'app pour les tests
export { app };

// Ne démarre le serveur que si ce fichier est le point d'entrée principal
if (process.env.NODE_ENV !== 'test' && import.meta.url === `file://${process.argv[1]}`) {
  startServer();
} else if (process.env.NODE_ENV === 'test') {
  // Pour les tests, setup sans connexion Redis
  setupAssociations();
}
