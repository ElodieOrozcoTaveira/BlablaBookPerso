
# Middleware : errorHandler

## Problème résolu

**Sans gestion centralisée des erreurs** : Les exceptions non capturées provoquent des crashs, des fuites d'information ou des réponses incohérentes.

- **Crash serveur** : Erreurs non gérées qui stoppent l'application
- **Fuite d'information** : Stack trace ou détails techniques exposés aux utilisateurs
- **Réponses non standardisées** : Impossible de traiter les erreurs côté frontend

## Mécanisme technique (errorHandler)

**Avec le middleware errorHandler** :

1. Interception de toutes les erreurs (techniques, validation, métier)
2. Log de l'erreur côté serveur (console, fichier, service externe)
3. Renvoi d'une réponse structurée selon le type d'erreur
4. Masquage des détails techniques en production

### Exemple d'utilisation

```ts
// Middleware global Express
export function errorHandler(error, req, res, next) {
    console.error('Erreur capturée:', error);
    if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Données invalides', details: error.issues });
    }
    if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: 'Erreur de validation BDD', details: error.message });
    }
    const status = error.status || 500;
    const message = process.env.NODE_ENV === 'production' ? 'Erreur interne du serveur' : error.message;
    res.status(status).json({ error: message });
}

// Application dans Express
app.use(errorHandler);
```

## Avantages du système

- **Robustesse** : Aucun crash non géré
- **Sécurité** : Détails techniques masqués en production
- **Clarté** : Réponses d'erreur standardisées pour le frontend
- **Audit** : Log des erreurs pour analyse et correction

Ce middleware est indispensable pour toute API ou application nécessitant une gestion fiable et sécurisée des erreurs.
