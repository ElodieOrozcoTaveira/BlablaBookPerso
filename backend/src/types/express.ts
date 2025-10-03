import { Request } from 'express';

// Extension typee de Request Express pour une meilleure type safety
// Utilise les generics natifs d'Express pour typer Body, Params et Query
// Permet d'eviter les castings "as any" et les erreurs de typage
//
// Usage dans les controllers:
// req: TypedRequest<CreateUserInput, UserParams, SearchQuery>
//
// - Body: donnees du corps de la requete (POST/PUT/PATCH)
// - Params: parametres de route (/users/:id)  
// - Query: parametres de query string (?page=1&limit=20)
export type TypedRequest<
    Body = any,
    Params extends Record<string, any> = Record<string, any>,
    Query = any
> = Request<Params, any, Body, Query, Record<string, any>>;

// Extension pour les requêtes authentifiees
export type AuthenticatedRequest<
    Body = any,
    Params extends Record<string, any> = Record<string, any>,
    Query = any
> = TypedRequest<Body, Params, Query> & {
    user?: {
        id_user: number;
        email: string;
        username: string;
    };
};

// Interface pour les reponses API standardisees
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// Interface pour les reponses avec pagination
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}