
# Middleware : Auto-auth

## Problème résolu

**Sans auto-auth** : Les tests automatisés ou scripts internes nécessitent une authentification manuelle, ce qui provoque :

- **Perte de temps** : Connexion manuelle à chaque test ou script
- **Complexité** : Difficulté à simuler des rôles ou des utilisateurs spécifiques
- **Risque d'erreur** : Oubli d'authentification ou de configuration

## Mécanisme technique (Auto-auth)

**Avec auto-auth** :

1. Injection automatique d'un utilisateur ou d'un rôle dans la requête
2. Simulation d'une session ou d'un token valide
3. Bypass des étapes de login pour les environnements de test ou de script

### Exemple d'utilisation

```ts
// Middleware auto-auth pour les tests
export function autoAuth(req, res, next) {
    req.user = { id_user: 1, role: 'admin' };
    next();
}

// Application sur une route de test
router.get('/test', autoAuth, (req, res) => {
    res.json({ user: req.user });
});
```

## Avantages du système

- **Gain de temps** : Tests et scripts automatisés sans login manuel
- **Flexibilité** : Simulation de n'importe quel rôle ou utilisateur
- **Sécurité** : Jamais activé en production

Ce middleware est utile uniquement pour les environnements de développement, de test ou de maintenance automatisée.
