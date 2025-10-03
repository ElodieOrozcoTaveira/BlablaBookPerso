# Blablabook - Architecture, Design Pattern et Choix Techniques

## 1. Architecture Globale

Blablabook est une application web fullstack, découpée en plusieurs services :

- **Frontend** : React + Vite (TypeScript)
- **Backend** : Node.js + Express (TypeScript)
- **Base de données** : PostgreSQL
- **Session store** : Redis
- **Orchestration** : Docker Compose

L'architecture suit le modèle MVC côté backend, avec une séparation claire entre routes, contrôleurs, services, modèles et middlewares.

## 2. Design Pattern

- **MVC (Model-View-Controller)** :
  - Models : Sequelize, mapping des tables et validation côté application
  - Controllers : logique métier, gestion des requêtes
  - Services : abstraction des appels externes (Open Library, gestion d'images, etc.)
  - Middlewares : validation, sécurité, gestion des permissions
- **Repository Pattern** : accès aux données via des services dédiés
- **Dependency Injection** : modules et services injectés pour faciliter les tests et la maintenance
- **Soft Delete** : gestion des suppressions logiques pour la traçabilité

## 3. Choix de Technologies

- **TypeScript** : typage fort, sécurité et maintenabilité
- **Sequelize** : ORM pour PostgreSQL, synchronisation avec le schéma SQL
- **Zod** : validation des données côté application
- **Argon2** : hashage sécurisé des mots de passe
- **Redis** : stockage des sessions, rapidité et scalabilité
- **Docker Compose** : orchestration des services pour le développement et la production
- **Vite** : build rapide et moderne pour le frontend

## 4. Choix de Conception

- **Séparation stricte des responsabilités** : chaque couche a un rôle précis
- **Validation systématique** : Zod pour les schémas, vérification en base pour l'unicité
- **Gestion des imports Open Library** : enrichissement automatique, traçabilité, nettoyage des imports temporaires
- **Gestion des permissions et rôles** : RBAC, tables de liaison, vues SQL pour l'administration
- **Indexation et optimisation** : index sur les champs stratégiques, triggers pour la maintenance

## 5. Pourquoi Redis Session ?

- **Performance** : Redis est extrêmement rapide pour lire/écrire des sessions
- **Scalabilité** : stockage centralisé, plusieurs instances backend peuvent accéder aux mêmes sessions
- **Expiration automatique** : gestion native de la durée de vie des sessions
- **Sécurité** : isolation des données de session, pas de stockage en base principale
- **Simplicité** : intégration facile avec Express, configuration claire dans Docker

## Sécurité côté backend

Nous utilisons plusieurs couches de sécurité pour protéger l'API et les données :

- **Argon2** pour le hashage des mots de passe
- **Zod** pour la validation des données côté application
- **Redis** pour le stockage des sessions
- **SSL/TLS** pour le chiffrement des communications
- **RBAC** pour la gestion des rôles et permissions

### Middleware de sécurité

- **Helmet** : Ajoute des headers HTTP pour protéger contre les attaques courantes (XSS, clickjacking, sniffing, etc.)
- **CORS** : Contrôle les origines autorisées à accéder à l'API, limitant les risques liés aux requêtes cross-origin
- **Rate limiting** : Limite le nombre de requêtes par utilisateur/IP pour éviter les abus et les attaques par force brute

Les tokens d'authentification ne sont pas utilisés, le choix s'est porté sur la session Redis pour la gestion des utilisateurs connectés.

## Lazy Import

Le lazy import est un mécanisme d'optimisation qui évite l'import massif et préventif de données externes (OpenLibrary).

### Problème résolu

**Sans lazy import** : À chaque recherche, tous les livres trouvés sont importés immédiatement en base de données, ce qui provoque :

- **Surcharge de la BDD** : Milliers de livres inutiles stockés
- **Ralentissements** : Requêtes lentes, timeouts
- **Coût infrastructure** : Espace disque et mémoire gaspillés
- **Pollution des données** : Livres jamais consultés par les utilisateurs

### Mécanisme technique (Lazy Import)

**Avec lazy import** : L'import est déclenché uniquement au moment de l'**action utilisateur** (clic sur "Noter" ou "Laisser un avis").

#### 1. Trigger d'import automatisé

```sql
-- Dans la conception BDD, un trigger surveille les actions utilisateur
TRIGGER lazy_import_on_user_action 
WHEN user_clicks_note_or_review()
THEN import_book_to_temp_storage()
```

#### 2. **Cache Redis temporaire**

L'import temporaire est stocké dans **Redis** et lié à la **session utilisateur** :

```typescript
// Cache Redis avec clé de session
redis.setex(`temp_import:${sessionId}:${bookId}`, 3600, bookData);
```

#### 3. **Gestion du cycle de vie**

- **Si l'utilisateur finalise** son avis → Import confirmé en BDD définitive
- **Si l'utilisateur abandonne** → Suppression automatique à la fin de session
- **Nettoyage automatique** → Purge des imports temporaires expirés

#### 4. **Avantages du système**

- **BDD propre** : Seuls les livres réellement utilisés sont persistés
- **Performance** : Pas de surcharge préventive
- **Réactivité** : Import en arrière-plan, utilisateur non bloqué
- **Économies** : Réduction drastique du stockage et des appels API

Ce choix garantit une base de données légère, des performances optimales et une expérience utilisateur fluide, tout en évitant le gaspillage de ressources.

## Ownership

L'ownership (propriété des ressources) est un système de sécurité granulaire qui contrôle l'accès aux données en fonction du propriétaire.

### Problème de sécurité résolu

**Sans ownership** : Tous les utilisateurs authentifiés peuvent modifier toutes les données, ce qui provoque :

- **Failles de sécurité** : Un utilisateur peut supprimer les bibliothèques d'autrui
- **Perte de données** : Modifications/suppressions accidentelles ou malveillantes
- **Non-conformité RGPD** : Impossible de tracer qui a accès à quelles données
- **Chaos collaboratif** : Pas de responsabilité individuelle sur les contenus

### Mécanisme technique (Ownership)

**Avec ownership** : Chaque ressource (bibliothèque, avis, import, avatar) est **liée à son propriétaire** au niveau base de données.

#### 1. **Colonnes de propriété dans la BDD**

```sql
-- Chaque table sensible contient une référence au propriétaire
ALTER TABLE libraries ADD COLUMN owner_id INTEGER REFERENCES users(id_user);
ALTER TABLE rates ADD COLUMN owner_id INTEGER REFERENCES users(id_user);
ALTER TABLE reading_lists ADD COLUMN owner_id INTEGER REFERENCES users(id_user);
```

#### 2.  **Middleware de vérification automatique**

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

#### 3. **Application au niveau des routes**

```typescript
// Seul le propriétaire peut modifier/supprimer sa ressource
router.delete('/libraries/:id', authenticateToken, checkOwnership('library'), deleteLibrary);
router.put('/rates/:id', authenticateToken, checkOwnership('rate'), updateRate);
```

#### 4. **Audit automatique**

Chaque action est tracée avec :

- **Qui** : `user_id` du propriétaire
- **Quoi** : Type d'action (CREATE, UPDATE, DELETE)
- **Quand** : `created_at`, `updated_at`
- **Pourquoi** : Context de l'action (import, manual, etc.)

#### 5. **Gestion RGPD intégrée**

- **Droit à l'oubli** : Suppression sélective des données d'un utilisateur
- **Portabilité** : Export des données appartenant à un utilisateur spécifique
- **Consentement** : Traçabilité de qui a autorisé quoi

### Avantages du système

- **Sécurité renforcée** : Isolation totale des données entre utilisateurs
- **Conformité légale** : Respect automatique du RGPD
- **Responsabilisation** : Chaque utilisateur est responsable de ses données
- **Audit complet** : Traçabilité complète des actions
- **Collaboration sécurisée** : Partage contrôlé possible via permissions

Ce système garantit qu'un utilisateur ne peut jamais accéder, modifier ou supprimer les données d'un autre utilisateur, tout en permettant une collaboration sécurisée quand nécessaire.

## 6. Avantages et Limites

### Avantages

- Architecture modulaire, facile à maintenir et à faire évoluer
- Sécurité renforcée (Argon2, validation, SSL/TLS)
- Scalabilité (Redis, Docker)
- Traçabilité et audit (soft delete, imports, logs)

### Limites

- Redis session = API non strictement RESTful (état côté serveur)
- Partitionnement non encore mis en place (prévu pour la montée en charge)
- Nécessité de surveiller la croissance des données et la performance

## 7. Conclusion

Blablabook s'appuie sur des choix techniques modernes et robustes, adaptés à une application collaborative, évolutive et sécurisée. Chaque décision (techno, design, architecture) vise la simplicité, la performance et la maintenabilité.

---

Pour toute question sur l'architecture ou les choix techniques, voir le dossier `Docs/` ou contacter l'équipe technique.
