
# Middleware : permission

## Problème résolu

Comment garantir que l’utilisateur possède les permissions nécessaires pour accéder à une route ou effectuer une action sensible ?

## Mécanisme technique

Ce middleware RBAC vérifie les permissions de l’utilisateur en fonction de ses rôles (via Sequelize). Il interroge la base pour récupérer les rôles et permissions, compare avec celles requises par la route, et bloque l’accès si besoin. Un log d’audit Zero Trust est généré à chaque tentative (succès ou échec).

## Exemple de code

```ts
export function requirePermission(requiredPermissions: string | string[]) {
    const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
    return async (req, res, next) => {
// Bypass pour tests
        if (process.env.TEST_PERM_BYPASS === '1') return next();
        if (!req.session?.isAuthenticated || !req.session?.userId) {
// Log audit refus
    return res.status(401).json({ error: 'Authentication required' });
    }
    const userPermissions = await getUserPermissions(req.session.userId);
    const hasAllPermissions = permissions.every(p => userPermissions.includes(p));
// Log audit
        if (hasAllPermissions) {
        req.userPermissions = userPermissions;
            next();
    } else {
            return res.status(403).json({ error: 'Insufficient permissions', required: permissions });
    }
    };
}
```

## Avantages

- Sécurise l’accès aux routes et opérations sensibles.
- Centralise la gestion des permissions et rôles.
- Génère des logs d’audit pour conformité et analyse.
