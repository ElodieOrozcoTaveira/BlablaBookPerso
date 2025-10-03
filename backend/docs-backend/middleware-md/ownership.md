
# Middleware : Ownership

## Problème de sécurité résolu

**Sans ownership** : Tous les utilisateurs authentifiés peuvent modifier toutes les données, ce qui provoque :

- **Failles de sécurité** : Un utilisateur peut supprimer les bibliothèques d'autrui
- **Perte de données** : Modifications/suppressions accidentelles ou malveillantes
- **Non-conformité RGPD** : Impossible de tracer qui a accès à quelles données
- **Chaos collaboratif** : Pas de responsabilité individuelle sur les contenus

## Mécanisme technique (Ownership)

**Avec ownership** : Chaque ressource (bibliothèque, avis, import, avatar) est **liée à son propriétaire** au niveau base de données.

### 1. Colonnes de propriété dans la BDD

```sql
-- Chaque table sensible contient une référence au propriétaire
ALTER TABLE libraries ADD COLUMN owner_id INTEGER REFERENCES users(id_user);
ALTER TABLE rates ADD COLUMN owner_id INTEGER REFERENCES users(id_user);
ALTER TABLE reading_lists ADD COLUMN owner_id INTEGER REFERENCES users(id_user);
```

### 2. Middleware de vérification automatique

```typescript
// Middleware qui vérifie avant chaque action CRUD
export const checkOwnership = (resource: string) => {
        return async (req, res, next) => {
        const resourceId = req.params.id;
        const userId = req.user.id_user;
    
        const resource = await findResourceById(resourceId);
    if (resource.owner_id !== userId) {
        return res.status(403).json({ error: 'Accès interdit' });
    }
        next();
    };
};
```

### 3. Application au niveau des routes

```typescript
// Seul le propriétaire peut modifier/supprimer sa ressource
router.delete('/libraries/:id', authenticateToken, checkOwnership('library'), deleteLibrary);
router.put('/rates/:id', authenticateToken, checkOwnership('rate'), updateRate);
```

### 4. Audit automatique

Chaque action est tracée avec :

- **Qui** : `user_id` du propriétaire
- **Quoi** : Type d'action (CREATE, UPDATE, DELETE)
- **Quand** : `created_at`, `updated_at`
- **Pourquoi** : Context de l'action (import, manual, etc.)

### 5. Gestion RGPD intégrée

- **Droit à l'oubli** : Suppression sélective des données d'un utilisateur
- **Portabilité** : Export des données appartenant à un utilisateur spécifique
- **Consentement** : Traçabilité de qui a autorisé quoi

## Avantages du système

- **Sécurité renforcée** : Isolation totale des données entre utilisateurs
- **Conformité légale** : Respect automatique du RGPD
- **Responsabilisation** : Chaque utilisateur est responsable de ses données
- **Audit complet** : Traçabilité complète des actions
- **Collaboration sécurisée** : Partage contrôlé possible via permissions

Ce système garantit qu'un utilisateur ne peut jamais accéder, modifier ou supprimer les données d'un autre utilisateur, tout en permettant une collaboration sécurisée quand nécessaire.
