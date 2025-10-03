import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

// Types pour identifier oe appliquer la validation
export enum ValidationType {
    BODY = 'body',
    PARAMS = 'params', 
    QUERY = 'query'
}

// Interface pour Request typé avec validation
interface TypedRequest<Body = any, Params = Record<string, any>, Query = any> extends Request<Params, any, Body, Query, Record<string, any>> {
    body: Body;
    params: Params;
    query: Query;
}

// Middleware generique de validation Zod
// S'integre dans la stack: Helmet → CORS → Authentication → Validation → Controller
export const validateSchema = <
    B = any,
    P = Record<string, any>,
    Q = any
>(
    schema: ZodSchema<any>,
    type: ValidationType = ValidationType.BODY
) => {
    return async (req: TypedRequest<B, P, Q>, res: Response, next: NextFunction) => {
        try {
            // Selectionne la partie de la requete e valider
            let dataToValidate;
            switch (type) {
                case ValidationType.BODY:
                    dataToValidate = req.body;
                    break;
                case ValidationType.PARAMS:
                    dataToValidate = req.params;
                    break;
                case ValidationType.QUERY:
                    dataToValidate = req.query;
                    break;
                default:
                    dataToValidate = req.body;
            }

            // Validation avec Zod (parse + transform automatique)
            const validatedData = await schema.parseAsync(dataToValidate);
            
            // Remplace les donnees par les donnees validees/transformees
            // L'authentification a déjà été vérifiée par le middleware auth
            switch (type) {
                case ValidationType.BODY:
                    req.body = validatedData;
                    break;
                case ValidationType.PARAMS:
                    req.params = validatedData;
                    break;
                case ValidationType.QUERY:
                    req.query = validatedData;
                    break;
            }

            next();
        } catch (error) {
            // Les erreurs Zod sont automatiquement gerees par errorHandler.ts
            next(error);
        }
    };
};

// Helpers simplifiés pour l'usage dans les routes
export const validateBody = (schema: ZodSchema) => 
    validateSchema(schema, ValidationType.BODY);

export const validateParams = (schema: ZodSchema) => 
    validateSchema(schema, ValidationType.PARAMS);

export const validateQuery = (schema: ZodSchema) => 
    validateSchema(schema, ValidationType.QUERY);

// Middleware compose pour valider plusieurs parties en une fois
export const validateAll = (schemas: {
    body?: ZodSchema;
    params?: ZodSchema;
    query?: ZodSchema;
}) => {
    return [
        ...(schemas.params ? [validateParams(schemas.params)] : []),
        ...(schemas.query ? [validateQuery(schemas.query)] : []),
        ...(schemas.body ? [validateBody(schemas.body)] : [])
    ];
};