import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface CSRFRequest extends Request {
    csrfToken?: () => string;
}

// Generate CSRF token
export const generateCSRFToken = (req: Request, res: Response): string => {
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set cookie with same token (double submit pattern)
    res.cookie('_csrf-token', token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 4 * 60 * 60 * 1000,
    });
    
    return token;
};

// Validate CSRF token (double submit cookie pattern)
const validateCSRFToken = (req: Request): boolean => {
    const cookieToken = req.cookies['_csrf-token'];
    const headerToken = req.headers['x-csrf-token'] || req.body._csrf;
    
    // Both cookie and header must exist and match
    return cookieToken && headerToken && cookieToken === headerToken;
};

/**
 * CSRF protection middleware
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
    // Skip GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }
    
    // Skip test route and token generation
    if (req.path === '/api/auth/csrf-token' || req.path === '/api/test-login') {
        return next();
    }
    
    // Validate token
    if (!validateCSRFToken(req)) {
        return res.status(403).json({
            success: false,
            error: 'CSRF_TOKEN_INVALID',
            message: 'Invalid or missing CSRF token'
        });
    }
    
    next();
};

/**
 * CSRF token generator (alias for compatibility)
 */
export const csrfTokenGenerator = generateCSRFToken;

/**
 * Conditional CSRF middleware
 */
export const conditionalCsrfProtection = (req: Request, res: Response, next: NextFunction) => {
    // Skip CSRF in test mode with header
    if (process.env.NODE_ENV === 'test' && req.headers['x-skip-csrf'] === 'true') {
        return next();
    }
    
    // Add csrfToken function to request for compatibility
    (req as CSRFRequest).csrfToken = () => generateCSRFToken(req, res);
    
    // Apply CSRF protection
    csrfProtection(req, res, next);
};

/**
 * CSRF error handler
 */
export const handleCsrfError = (error: any, req: Request, res: Response, next: NextFunction) => {
    // Handle CSRF errors
    if (error && error.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({
            success: false,
            error: 'CSRF_TOKEN_INVALID',
            message: 'Invalid or missing CSRF token'
        });
    }
    next(error);
};

export default {
    csrfProtection,
    csrfTokenGenerator,
    handleCsrfError,
    conditionalCsrfProtection
};