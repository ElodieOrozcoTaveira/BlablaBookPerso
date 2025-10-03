import 'express-session';

// Extension des types Express Session
declare module 'express-session' {
    interface SessionData {
        userId?: number;
        email?: string;
        username?: string;
        isAuthenticated?: boolean;
        loginTime?: Date;
        lastActivity?: Date;
        // Extension pour les actions livre
        pendingBookAction?: {
            bookId: number;
            wasImported: boolean;
            timestamp: number;
            open_library_key: string;
        };
    }
}

// Interface pour l'utilisateur en session (minimal securise)
export interface SessionUser {
    userId: number;
    email: string;
    username: string;
    isAuthenticated: true;
    loginTime: Date;
    lastActivity: Date;
}

// Type guard pour verifier qu'une session est authentifiee
export function isAuthenticatedSession(session: any): session is SessionUser {
    return session?.isAuthenticated === true && 
           typeof session?.userId === 'number' && 
           typeof session?.email === 'string';
}

export default SessionUser;