# Gestion des Exceptions et des Erreurs

## Fonctionnement du middleware de gestion des erreurs

Le middleware `errorHandler` centralise la gestion des exceptions dans l’API Express. Il doit être placé en dernier dans la chaîne des middlewares.

### Principes

- Toutes les erreurs (techniques, validation, métier) sont interceptées et loguées côté serveur.
- Les erreurs de validation (Zod) et de base de données (Sequelize) sont renvoyées avec un code HTTP 400 et des détails explicites sur le champ et le message.
- Les erreurs personnalisées (404, 403, etc.) utilisent le code HTTP adapté.
- En production, les détails techniques sont masqués : seul un message générique est renvoyé pour éviter toute fuite d’information sensible.
- La réponse d’erreur est toujours structurée :

```json
{
  "success": false,
  "error": "Message d'erreur",
  "details": [ ... ] // si applicable
}
```

### Types d’erreurs gérées

- **Validation** : schémas Zod, contraintes Sequelize
- **Authentification** : session expirée, accès non autorisé
- **Permissions** : accès refusé selon le rôle ou l’ownership
- **Technique** : base de données, dépendances externes, timeout
- **Import** : lazy import, données corrompues ou incomplètes

### Bonnes pratiques

- Utiliser des codes d’erreur HTTP adaptés (400, 401, 403, 404, 500…)
- Ne jamais exposer de stack trace ou d’informations internes en production
- Documenter les principaux cas d’erreur dans l’API (README ou OpenAPI)
- Surveiller et auditer les logs d’erreur pour anticiper les incidents

---
Ce middleware garantit la robustesse, la sécurité et la clarté des réponses d’erreur pour les utilisateurs et les développeurs.
