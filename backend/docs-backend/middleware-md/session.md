
# Middleware : session

## Problème résolu

Comment assurer la persistance, la sécurité et la scalabilité des sessions utilisateur dans une API moderne ?

## Mécanisme technique

Ce middleware utilise Redis comme store pour les sessions Express, ce qui permet une gestion rapide, scalable et centralisée. Les sessions sont configurées pour être sécurisées (cookie httpOnly, secure, sameSite strict, expiration adaptée). Des middlewares complémentaires gèrent l’initialisation, la validation, le nettoyage et la destruction des sessions.

## Exemple de code

```ts
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import redisClient from '../config/redis.js';

export const sessionConfig = {
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || 'the_book_of_eli',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    name: 'blablabook.sid',
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 4 * 60 * 60 * 1000,
    }
};

export const sessionMiddleware = session(sessionConfig);
```

## Avantages

- Sessions persistantes et sécurisées.
- Scalabilité grâce à Redis.
- Configuration flexible et adaptée à la production.
