import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Express } from 'express';

//configuration helmet
export const helmetOptions = helmet({
  contentSecurityPolicy: {
    //Bloque les scripts malveillants
    directives: {
      defaultSrc: ["'self'"], //Par défaut, seules les  ressources du même domaine sont autorisées
      styleSrc: ["'self'", "'unsafe-inline'"], //CSS depuis ton  domaine + styles inline (nécessaire pour certains  frameworks)
      imgSrc: ["'self'", 'data:', 'https'], //Permet les images locales et HTTPS
      connectSrc: ["'self'", 'https://openlibrary.org'], //Requetes AJAX/fetch uniquement vers notre domaine
      fontSrc: ["'self'"], //Police uniquement depuis notre domaine
      objectSrc: ["'none'"], //Bloque les objets, embeds
      mediaSrc: ["'self'"], //Audio/vidéo uniquement depuis ton domaine
      frameSrc: ["'none'"], //Bloque les iframes (protection contre le clickjacking)
    },
  },
  crossOriginEmbedderPolicy: false, // Pour pouvoir appeler open library
});

//configuration cors
export const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? ['https://blablabook.com', 'https://www.blablabook.com']
      : [
          'http://localhost:5173', // Le front
          'http://127.0.0.1:5173', // Alternative front
        ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

//Configuration rate limiting

// Rate limiting pour auth - Configuration dynamique selon environnement
export const authRateLimit = rateLimit({
  windowMs:
    process.env.NODE_ENV === 'development' ? 1 * 60 * 1000 : 15 * 60 * 1000, // 1min en dev, 15min en prod
  max: process.env.NODE_ENV === 'development' ? 1000 : 5, // Permissif en dev, strict en prod
  message: {
    error: 'Trop de tentatives de connexion, reessayez dans 15 minutes.',
    status: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting pour tests (très permissif)
export const testAuthRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute seulement
  max: 1000, // 1000 tentatives max (très permissif pour les tests)
  message: {
    error: 'Please try again in 1 minute', // Message plus court pour les tests
    status: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting strict pour exports (données sensibles)
export const exportRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: process.env.NODE_ENV === 'test' ? 100 : 10, // 10 exports/heure en prod, 100 en test
  message: {
    error:
      "Limite d'exports atteinte. Veuillez patienter avant de faire un nouvel export.",
    status: 429,
    retryAfter: 3600, // 1 heure en secondes
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip si c'est un admin (optionnel - plus de flexibilité pour les admins)
  skip: (req: any) => {
    return req.user?.permissions?.includes('ADMIN') || false;
  },
});
