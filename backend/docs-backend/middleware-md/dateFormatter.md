
# Middleware : DateFormatter

## Problème résolu

**Sans formatage des dates** : Les dates sont incohérentes entre le backend, le frontend et la base de données, ce qui provoque :

- **Erreurs d'affichage** : Dates mal interprétées ou affichées différemment selon le client
- **Bugs de conversion** : Problèmes de fuseau horaire, format local vs. UTC
- **Difficulté de tri et de filtrage** : Impossible de comparer ou trier correctement

## Mécanisme technique (DateFormatter)

**Avec le middleware dateFormatter** :

1. Conversion des dates reçues en format standard (ISO 8601 ou UTC)
2. Formatage des dates avant envoi au frontend ou à la base
3. Gestion des fuseaux horaires si besoin

### Exemple d'utilisation

```ts
// Middleware de formatage des dates
export function dateFormatter(req, res, next) {
    if (req.body.date) {
        req.body.date = new Date(req.body.date).toISOString();
    }
    next();
}

// Application sur une route
router.post('/event', dateFormatter, (req, res) => {
// La date est maintenant au format ISO
    res.json({ date: req.body.date });
});
```

## Avantages du système

- **Cohérence** : Dates uniformes sur toute la stack
- **Interopérabilité** : Facilité d'intégration avec d'autres systèmes
- **Fiabilité** : Moins de bugs liés aux conversions
- **Lisibilité** : Dates claires pour les utilisateurs et les développeurs

Ce middleware est essentiel pour toute API ou application manipulant des dates, événements ou historiques.
