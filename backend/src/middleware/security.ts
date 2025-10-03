import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Express } from 'express';


//configuration helmet
export const helmetOptions = helmet({
    contentSecurityPolicy: { //Bloque les scripts malveillants
        directives: {
            defaultSrc: ["'self'"],//Par défaut, seules les  ressources du même domaine sont autorisées
            styleSrc: ["'self'", "'unsafe-inline'"],//CSS depuis ton  domaine + styles inline (nécessaire pour certains  frameworks)
            imgSrc: ["'self'", "data:", "https"],//Permet les images locales et HTTPS
            connectSrc: ["'self'", "https://openlibrary.org"],//Requetes AJAX/fetch uniquement vers notre domaine
            fontSrc: ["'self'"],//Police uniquement depuis notre domaine
            objectSrc: ["'none'"],//Bloque les objets, embeds
            mediaSrc: ["'self'"],//Audio/vidéo uniquement depuis ton domaine
            frameSrc: ["'none'"],//Bloque les iframes (protection contre le clickjacking)
        }
    },
    crossOriginEmbedderPolicy: false, // Pour pouvoir appeler open library
});

//configuration cors
export const corsOptions = {
      origin: process.env.NODE_ENV === 'production'
          ? ['https://blablabook.com', 'https://www.blablabook.com']
          : [
              'http://localhost:3000',    // Le front
              'http://127.0.0.1:3000',    // Alternative front
              
          ],
      credentials: true,
      optionsSuccessStatus: 200,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  };



  //Configuration rate limiting

  // Rate limiting strict pour auth (anti brute-force)
  export const authRateLimit = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes  
      max: 5, // 5 tentatives max
      message: {
          error: 'Trop de tentatives de connexion, reessayez dans 15 minutes.',
          status: 429
      },
      standardHeaders: true,
      legacyHeaders: false
  });
