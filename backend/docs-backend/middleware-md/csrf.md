
# Middleware : CSRF

## Problème de sécurité résolu

**Sans protection CSRF** : Un attaquant peut forcer un utilisateur authentifié à exécuter des actions à son insu (ex : suppression de compte, transfert de fonds).

- **Vol d'identité** : Actions malveillantes réalisées via le navigateur de la victime
- **Modification non consentie** : Changement de données sans accord
- **Risque sur les formulaires** : Toute action POST/PUT/DELETE est vulnérable

## Mécanisme technique (CSRF)

**Avec le middleware CSRF** :

1. Génération d'un jeton CSRF unique à chaque session utilisateur
2. Transmission du jeton au frontend (cookie ou header)
3. Vérification du jeton à chaque requête sensible
4. Blocage de la requête si le jeton est absent ou invalide

### Exemple d'utilisation

```ts
// Middleware CSRF (exemple avec csrf-csrf)
import csrf from 'csrf-csrf';
app.use(csrf());

// Frontend : inclure le jeton CSRF dans chaque requête POST
fetch('/api/action', {
    method: 'POST',
    headers: { 'x-csrf-token': csrfToken },
    body: JSON.stringify(data)
});
```

## Avantages du système

- **Sécurité** : Empêche les attaques CSRF sur toutes les routes sensibles
- **Conformité** : Respect des recommandations OWASP
- **Simplicité** : Intégration transparente avec le frontend
- **Traçabilité** : Toute action critique est validée par l'utilisateur

Ce middleware est indispensable pour toute API ou application web acceptant des requêtes authentifiées et des modifications de données.
