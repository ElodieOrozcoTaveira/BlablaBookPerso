
# Middleware : Authentification

## Problème de sécurité résolu

**Sans middleware d'authentification** : Les routes sensibles sont accessibles à tous, ce qui provoque :

- **Fuite de données** : Accès non autorisé à des informations privées
- **Actions malveillantes** : Modification ou suppression de ressources par des utilisateurs non identifiés
- **Non-respect des permissions** : Impossible de restreindre l'accès selon le rôle

## Mécanisme technique (Auth)

**Avec le middleware d'authentification** :

1. Vérification de la présence d'une session ou d'un token JWT
2. Décodage et validation du token ou de la session
3. Injection de l'utilisateur authentifié dans `req.user`
4. Blocage de la requête si l'utilisateur n'est pas authentifié

### Exemple d'utilisation

```ts
// Middleware d'authentification
export function authenticateToken(req, res, next) {

    const token = req.headers['authorization'];
        if (!token) return res.status(401).json({ error: 'Non authentifié' });
// ... vérification du token ...
    req.user = decodedUser;
    next();
}

// Application sur une route protégée
router.get('/profile', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

```

## Avantages du système

- **Sécurité** : Accès strictement réservé aux utilisateurs authentifiés
- **Traçabilité** : Toutes les actions sont liées à un utilisateur
- **Personnalisation** : Réponses et permissions adaptées à chaque utilisateur
- **Protection des données** : Empêche les accès non autorisés

Ce middleware est indispensable pour toute API ou application nécessitant une gestion des utilisateurs et des permissions.
