
# Middleware : route-metadata

## Problème résolu

Comment centraliser la gestion des métadonnées (description, permissions, tags, validation) pour chaque route afin de faciliter la documentation, la sécurité et la génération dynamique ?

## Mécanisme technique

Ce middleware permet d’associer à chaque route un objet de métadonnées (méthode, chemin, permissions, validation, etc.). Une factory génère automatiquement la chaîne de middlewares (validation, authentification, autorisation, contrôle propriétaire, controller) selon la configuration. Les métadonnées servent à générer la documentation et à filtrer dynamiquement les routes.

## Exemple de code

```ts
interface RouteMetadata {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    path: string;
    permission?: string;
    resource: string;
    isPublic?: boolean;
    isOwnerOnly?: boolean;
    validation?: { body?: z.ZodSchema; params?: z.ZodSchema; query?: z.ZodSchema };
    controller: Function;
}

function createRouteMiddleware(metadata: RouteMetadata) {
    const middlewares = [];
    if (metadata.validation?.query) middlewares.push(validateQuery(metadata.validation.query));
    if (metadata.validation?.params) middlewares.push(validateParams(metadata.validation.params));
    if (metadata.validation?.body) middlewares.push(validateBody(metadata.validation.body));
    if (!metadata.isPublic) {
        middlewares.push(authenticateToken);
        if (metadata.permission) middlewares.push(requirePermission(metadata.permission));
        if (metadata.isOwnerOnly) middlewares.push(createOwnershipMiddleware(metadata.resource));
    }
    middlewares.push(metadata.controller);
    return middlewares;
}
```

## Avantages

- Centralise la configuration des routes et leur documentation.
- Permet la génération automatique de la documentation API.
- Facilite la gestion dynamique et la sécurisation des routes.

---

A developper dans une V1.x
