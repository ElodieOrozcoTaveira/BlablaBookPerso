import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import { initializeRedis } from './config/redis.js';
import dateFormatterMiddleware from './middleware/dateFormatter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRateLimit, corsOptions, helmetOptions } from './middleware/security.js';
import { initializeSessionMiddleware, sessionMiddleware } from './middleware/session.js';
import { conditionalCsrfProtection, handleCsrfError } from './middleware/csrf.js';
import { validateBody, validateParams, validateQuery } from './middleware/validation.js';
import { setupAssociations } from './models/associations.js';
import apiRoutes from './routes/index.js';
import { bookParamsSchema, bookSearchSchema, createBookSchema } from './validation/book.zod.js';

// Charger les variables d'environnement en premier
config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

  // 0. SETUP REDIS ET SEQUELIZE
  const startServer = async () => {
    try {
      // Connexion Redis
      await initializeRedis();
      
      // Setup associations Sequelize
      setupAssociations();
      
    } catch (error) {
      console.error('❌ Failed to initialize server:', error);
      process.exit(1);
    }
  };

  // 1. SECURITE EN PREMIER (ordre important !)
  app.use(helmetOptions);           // Protection headers
  app.use(cors(corsOptions));       // CORS policy

  // 2. SESSIONS REDIS (AVANT parsing et routes)
 app.use(initializeSessionMiddleware);
 app.use(sessionMiddleware);

  // 3. PARSING (AFTER sessions)
  app.use(express.json());
  app.use(cookieParser());

  // 4. CSRF PROTECTION (AFTER sessions and parsing)
  app.use(conditionalCsrfProtection);

    // Middleware custom
    app.use(dateFormatterMiddleware);

    // Routes
    app.get('/', (_req, res) => {
      res.send('Hello bablabook!');
    });

    app.use('/api', apiRoutes);

    // Endpoint de test pour login utilisateur (pour tests d'intégration)
    app.post('/api/test-login', async (req, res) => {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email requis' });
      // Cherche l'utilisateur en base
      const User = (await import('./models/User.js')).default;
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
      // Crée la session
      if (!req.session) return res.status(500).json({ error: 'Session non initialisée' });
      req.session.userId = user.id_user;
      req.session.email = user.email;
      req.session.username = user.username;
      req.session.isAuthenticated = true;
      req.session.loginTime = new Date();
      req.session.lastActivity = new Date();
      // Log session et headers pour debug
      console.log('[TEST-LOGIN] Session:', req.session);
      res.on('finish', () => {
        console.log('[TEST-LOGIN] Headers envoyés:', res.getHeaders());
      });
      return res.json({ success: true, user: { id_user: user.id_user, email: user.email, username: user.username } });
    });

  // Health check route
  app.get('/health', (req, res) => {
    res.json({ message: 'Server is running' });
  });

  // Route test securite
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

  // Route test erreur
  app.get('/test-error', (req, res, next) => {
    next(new Error('Erreur de test generee !'));
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
    // CSRF error handler (BEFORE general error handler)
    app.use(handleCsrfError);
    
    app.use(errorHandler);

  
  // Export de l'app pour les tests
  export { app };
  
  // Ne demarre le serveur que si ce n'est pas un test
  if (process.env.NODE_ENV !== 'test') {
    startServer().then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Server securise sur http://localhost:${PORT}`);
      });
    });
  } else if (process.env.NODE_ENV === 'test') {
    // Pour les tests, juste setup sans connexion Redis
    setupAssociations();
  }