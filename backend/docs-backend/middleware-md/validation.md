
# Middleware : validation

## Problème résolu

Comment garantir que les données reçues dans les requêtes API sont conformes, sûres et exploitables ?

## Mécanisme technique

Ce middleware utilise Zod pour valider la structure et le type des données reçues (body, params, query). Il renvoie une erreur explicite en cas de données invalides et stocke les données validées pour les contrôleurs. Des helpers simplifient l’intégration dans les routes.

## Exemple de code

```ts
import { ZodSchema } from 'zod';
export const validateBody = (schema: ZodSchema) => validateSchema(schema, ValidationType.BODY);
export const validateParams = (schema: ZodSchema) => validateSchema(schema, ValidationType.PARAMS);
export const validateQuery = (schema: ZodSchema) => validateSchema(schema, ValidationType.QUERY);
```

## Avantages

- Protège contre les données corrompues ou malveillantes.
- Centralise la validation et la documentation des schémas.
- Facilite l’évolution du modèle de données.
