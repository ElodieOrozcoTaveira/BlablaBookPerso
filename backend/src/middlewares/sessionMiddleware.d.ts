import session from "express-session";
import type { Request, Response, NextFunction } from "express";
/**
 * Configuration des sessions
 */
export declare const sessionConfig: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
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
export declare const requireAuth: (req: SessionRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware optionnel - vérifie si l'utilisateur est connecté
 */
export declare const optionalAuth: (req: SessionRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware pour vérifier les rôles
 */
export declare const requireRole: (roles: string[]) => (req: SessionRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=sessionMiddleware.d.ts.map