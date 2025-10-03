
# Middleware : security

## Problème résolu

Comment protéger l’API contre les attaques courantes (XSS, brute force, clickjacking, etc.) et garantir la sécurité des échanges ?

## Mécanisme technique

Ce middleware combine plusieurs protections :

- Helmet pour ajouter des headers HTTP de sécurité (CSP, frameguard, etc.)
- CORS pour limiter les origines autorisées et sécuriser les échanges cross-domain
- Rate limiting pour limiter les abus (tentatives de connexion, export de données, etc.)
La configuration est adaptée selon l’environnement (dev/test/prod).

## Exemple de code

```ts
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

export const helmetOptions = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https'],
            connectSrc: ["'self'", 'https://openlibrary.org'],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
});

export const corsOptions = {
        origin: process.env.NODE_ENV === 'production'
        ? ['https://blablabook.com', 'https://www.blablabook.com']
        : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

export const authRateLimit = rateLimit({
    windowMs: process.env.NODE_ENV === 'development' ? 1 * 60 * 1000 : 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'development' ? 1000 : 5,
    message: { error: 'Trop de tentatives de connexion, reessayez dans 15 minutes.', status: 429 },
});
```

## Avantages

- Protection multi-couches contre les attaques courantes.
- Configuration flexible selon l’environnement.
- Sécurisation des headers, des origines et des accès.
