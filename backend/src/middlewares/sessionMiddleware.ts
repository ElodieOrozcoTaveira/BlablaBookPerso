import session from "express-session";
import RedisStore from "connect-redis";
import { createClient } from "redis";
import type { Request, Response, NextFunction } from "express";

/**
 * CONFIGURATION DES SESSIONS AVEC REDIS
 */

// Configuration du client Redis
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://redis:6379",
});

// Connexion à Redis
redisClient.connect().catch(console.error);

// Configuration du store Redis pour les sessions
const redisStore = new RedisStore({
  client: redisClient,
  prefix: "blablabook:sess:",
});

/**
 * Configuration des sessions
 */
export const sessionConfig = session({
  store: redisStore,
  name: "blablabook_session", // Nom du cookie
  secret: process.env.SESSION_SECRET || "the_book_of_eli",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production", // HTTPS uniquement en production
    httpOnly: true, // Protection XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 heures
    sameSite: "lax", // Protection CSRF + meilleure UX que "strict"
  },
});

/**
 * Interface pour étendre Request avec session utilisateur
 */
export interface SessionRequest extends Request {
  session: session.Session & {
    user?: {
      id: number;
      email: string;
      username: string;
      firstname: string;
      lastname: string;
      roles?: string[];
    };
  };
}

/**
 * Middleware pour vérifier l'authentification par session
 */
export const requireAuth = (
  req: SessionRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.session.user) {
    res.status(401).json({
      success: false,
      message: "Authentification requise",
      code: "NOT_AUTHENTICATED",
    });
    return;
  }

  next();
};

/**
 * Middleware optionnel - vérifie si l'utilisateur est connecté
 */
export const optionalAuth = (
  req: SessionRequest,
  res: Response,
  next: NextFunction
): void => {
  // Rien à faire, req.session.user sera undefined si pas connecté
  next();
};

/**
 * Middleware pour vérifier les rôles
 */
export const requireRole = (roles: string[]) => {
  return (req: SessionRequest, res: Response, next: NextFunction): void => {
    if (!req.session.user) {
      res.status(401).json({
        success: false,
        message: "Authentification requise",
        code: "NOT_AUTHENTICATED",
      });
      return;
    }

    const userRoles = req.session.user.roles || [];
    const hasRole = roles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      res.status(403).json({
        success: false,
        message: `Rôle requis: ${roles.join(" ou ")}`,
        code: "INSUFFICIENT_PERMISSIONS",
      });
      return;
    }

    next();
  };
};
