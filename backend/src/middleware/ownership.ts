import { Request, Response, NextFunction } from 'express';
import { ModelStatic } from 'sequelize';

interface OwnershipOptions {
  model: ModelStatic<any>;
  idLocation?: 'params' | 'body' | 'query';
  idKey: string;              // ex: 'id_library'
  ownerField?: string;        // ex: 'id_user'
  attachAs?: string;          // ex: 'library'
  allowAdminBypass?: boolean; // default true
  isAdmin?: (req: Request) => boolean;
  notFoundStatus?: number;    // default 404
  forbiddenStatus?: number;   // default 403
  missingIdStatus?: number;   // default 400
  audit?: (evt: OwnershipAuditEvent) => void;
  resourceLoader?: (id: string | number, req: Request) => Promise<any | null>; // surcharge pour chargement custom
  ownerResolver?: (resource: any, req: Request) => Promise<number | undefined> | number | undefined; // derive owner id
}

export interface OwnershipAuditEvent {
  type: 'ownership_check';
  resource: string;
  id: string | number | undefined;
  result: 'allow-owner' | 'allow-admin' | 'deny-forbidden' | 'deny-not-found' | 'deny-missing-id';
  userId?: number;
  ts: number;
}

/**
 * Middleware générique pour vérifier la propriété d'une ressource.
 * - Charge la ressource via findByPk.
 * - 404 si absente.
 * - 403 si non propriétaire (et pas admin).
 * - Attache la ressource sur req[attachAs].
 */
export function requireOwnership(opts: OwnershipOptions) {
  const {
    model,
    idLocation = 'params',
    idKey,
    ownerField = 'id_user',
    attachAs,
    allowAdminBypass = true,
    isAdmin = (req: any) => Array.isArray(req.user?.roles) && req.user.roles.includes('admin'),
    notFoundStatus = 404,
    forbiddenStatus = 403,
    missingIdStatus = 400,
  audit,
  resourceLoader,
  ownerResolver
  } = opts;

  const resourceName = attachAs || idKey;

  return async function ownershipMiddleware(req: any, res: Response, next: NextFunction) {
    const ts = Date.now();
    try {
      const container = (req as any)[idLocation] || {};
      const rawId = container[idKey];
      if (!rawId) {
        audit?.({ type: 'ownership_check', resource: resourceName, id: rawId, result: 'deny-missing-id', userId: req.user?.id_user, ts });
        return res.status(missingIdStatus).json({ success: false, error: `${idKey} manquant` });
      }

  // Support de surcharge modèle pour tests unitaires (injection __TEST_MODEL_OVERRIDES)
  const overrides = (globalThis as any).__TEST_MODEL_OVERRIDES;
  const hasOverride = !!(overrides && overrides[model.name] && overrides[model.name].findByPk);
  if (process.env.TEST_OWNERSHIP_DEBUG) {
    // eslint-disable-next-line no-console
    console.log(`[ownership][debug] model=${model.name} rawId=${rawId} hasOverride=${hasOverride}`);
  }
  let instance: any;
  if (resourceLoader) {
    instance = await resourceLoader(rawId, req);
  } else if (hasOverride) {
    // Appel direct de la fonction mockée pour conserver son contexte
    instance = await overrides[model.name].findByPk(rawId);
  } else {
    instance = await (model as any).findByPk(rawId);
  }
      if (!instance) {
        audit?.({ type: 'ownership_check', resource: resourceName, id: rawId, result: 'deny-not-found', userId: req.user?.id_user, ts });
        return res.status(notFoundStatus).json({ success: false, error: `${idKey} introuvable` });
      }

      const userId = req.user?.id_user;
  const ownerId = ownerResolver ? await ownerResolver(instance, req) : instance[ownerField];
      if (allowAdminBypass && isAdmin(req)) {
        req[resourceName] = instance;
        audit?.({ type: 'ownership_check', resource: resourceName, id: rawId, result: 'allow-admin', userId, ts });
        return next();
      }

  if (ownerId !== userId) {
        audit?.({ type: 'ownership_check', resource: resourceName, id: rawId, result: 'deny-forbidden', userId, ts });
        return res.status(forbiddenStatus).json({ success: false, error: 'Accès interdit' });
      }

      req[resourceName] = instance;
      audit?.({ type: 'ownership_check', resource: resourceName, id: rawId, result: 'allow-owner', userId, ts });
      return next();
    } catch (error: any) {
      return next(error);
    }
  };
}

export default requireOwnership;
