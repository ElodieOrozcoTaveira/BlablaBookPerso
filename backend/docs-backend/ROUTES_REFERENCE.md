# Référence des Routes API

Format: `METHODE /api/...` — Description courte — (Auth / Permissions / Ownership / Statut implémentation)

Légende:

- Auth: 🔐 requiert session (middleware `authenticateToken`)
- Perm: 🎫 permission(s) explicites via `requirePermission`
- Own: 👑 vérification ownership (middleware `requireOwnership`)
- WIP: fonctionnalité non implémentée (501)

## Auth & Session

| Route | Description | Sécurité | Statut |
|-------|-------------|----------|--------|
| GET /api/auth/csrf-token | Génère un token CSRF à inclure dans les requêtes mutatives | Public | ✅ |
| POST /api/auth/login | Connexion utilisateur (création session) | Public (rate limit) | ✅ |
| POST /api/auth/logout | Déconnexion / destruction session | 🔐 | ✅ |
| GET /api/auth/me | Statut session + infos basiques | Public (renvoie authenticated=false si non connecté) | ✅ |
| GET /api/auth/debug/permissions | Debug: rôles & permissions de l'utilisateur courant | 🔐 | ✅ |
| GET /api/auth/test/admin | Test accès ADMIN | 🔐 🎫 ADMIN | ✅ (debug) |
| GET /api/auth/test/user-management | Test accès gestion utilisateurs | 🔐 🎫 ADMIN_USERS | ✅ (debug) |
| GET /api/auth/test/multiple-permissions | Test multi-permissions (CREATE & UPDATE) | 🔐 🎫 CREATE+UPDATE | ✅ (debug) |

## Utilisateurs

| Route | Description | Sécurité | Statut |
|-------|-------------|----------|--------|
| POST /api/users/register | Inscription utilisateur | Public | ✅ |
| POST /api/users/login | Redirection informative vers /api/auth/login | Public | ✅ |
| GET /api/users | Liste utilisateurs filtrable | 🔐 🎫 ADMIN_USERS | ✅ |
| GET /api/users/:id | Profil public d'un utilisateur | Public | ✅ |
| GET /api/users/:id/stats | Statistiques utilisateur | 🔐 🎫 VIEW_USER_STATS | ✅ |
| GET /api/users/me/profile | Mon profil complet | 🔐 | ✅ |
| PUT /api/users/me/profile | Mise à jour complète profil | 🔐 | ✅ |
| PATCH /api/users/me/profile | MAJ partielle profil | 🔐 | ✅ |
| POST /api/users/me/change-password | Changement mot de passe | 🔐 | ✅ |
| DELETE /api/users/me | Suppression compte personnel | 🔐 | ✅ |

## Auteurs

| Route | Description | Sécurité | Statut |
|-------|-------------|----------|--------|
| GET /api/authors | Recherche & pagination auteurs | Public | ✅ |
| GET /api/authors/:id | Détails auteur | Public | ✅ |
| GET /api/authors/:id/bio | Bio seule | Public | ✅ |
| GET /api/authors/:id/avatar | URLs d'avatars | Public | ✅ |
| GET /api/authors/:id/avatar/:size | Avatar taille spécifique | Public | ✅ |
| POST /api/authors | Créer un auteur | 🔐 🎫 CREATE_AUTHOR | ✅ |
| PUT /api/authors/:id | Mise à jour complète | 🔐 🎫 UPDATE_AUTHOR | ✅ |
| PATCH /api/authors/:id | Mise à jour partielle | 🔐 🎫 UPDATE_AUTHOR | ✅ |
| DELETE /api/authors/:id | Supprimer un auteur | 🔐 🎫 DELETE_AUTHOR | ✅ |

## Livres

| Route | Description | Sécurité | Statut |
|-------|-------------|----------|--------|
| GET /api/books | Recherche & pagination livres | Public | ✅ |
| GET /api/books/:id | Détails livre (relations) | Public | ✅ |
| GET /api/books/:id/cover-info | Métadonnées images de couverture | Public | ✅ |
| POST /api/books | Créer un livre + relations | 🔐 🎫 CREATE_BOOK | ✅ |
| PUT /api/books/:id | Mise à jour complète livre | 🔐 🎫 UPDATE_BOOK | ✅ |
| PATCH /api/books/:id | Mise à jour partielle livre | 🔐 🎫 UPDATE_BOOK | ✅ |
| DELETE /api/books/:id | Supprimer livre | 🔐 🎫 DELETE_BOOK | ✅ |

## Genres

| Route | Description | Sécurité | Statut |
|-------|-------------|----------|--------|
| GET /api/genres | Recherche & pagination genres | Public | ✅ |
| GET /api/genres/:id | Détails genre | Public | ✅ |
| POST /api/genres | Créer genre | 🔐 🎫 CREATE_GENRE | ✅ |
| PUT /api/genres/:id | Mise à jour complète | 🔐 🎫 UPDATE_GENRE | ✅ |
| PATCH /api/genres/:id | Mise à jour partielle | 🔐 🎫 UPDATE_GENRE | ✅ |
| DELETE /api/genres/:id | Supprimer genre | 🔐 🎫 DELETE_GENRE | ✅ |

## Bibliothèques

| Route | Description | Sécurité | Statut |
|-------|-------------|----------|--------|
| GET /api/libraries | Liste bibliothèques (filtrable) | Public | ✅ |
| GET /api/libraries/:id | Détails bibliothèque | Public | ✅ |
| POST /api/libraries | Créer bibliothèque | 🔐 | ✅ |
| PUT /api/libraries/:id | Mettre à jour (propriétaire) | 🔐 🎫 UPDATE_LIBRARY 👑 | ✅ |
| DELETE /api/libraries/:id | Supprimer (propriétaire) | 🔐 🎫 DELETE_LIBRARY 👑 | ✅ |
| PATCH /api/libraries/:id | MAJ partielle (non implémenté) | 🔐 WIP | :x: |
| POST /api/libraries/:id/add-book | Ajouter livre à collection (lazy import possible) | 🔐 👑 | ✅ | NNNEEEWWW
| GET /api/libraries/me/all | Mes bibliothèques | 🔐 | ✅ |

## Reading Lists

| Route | Description | Sécurité | Statut |
|-------|-------------|----------|--------|
| POST /api/reading-lists | Ajouter livre à liste lecture (transition owned→to_read) | 🔐 👑 (sur library cible) | ✅ (integration) | NNNEEEWWW
| GET /api/reading-lists/library/:library_id | Voir contenu liste lecture | Public | ✅ |
| PUT /api/reading-lists/:id | MAJ statut lecture | 🔐 🎫 UPDATE_READING_LIST 👑 | ✅ |
| DELETE /api/reading-lists/:id | Retirer livre (retour à owned dans collection) | 🔐 🎫 DELETE_READING_LIST 👑 | ✅ | NNNEEEWWW
| PATCH /api/reading-lists/:id | MAJ partielle (WIP) | 🔐 WIP | ❌ (non implémenté) |
| GET /api/reading-lists/me/stats | Mes stats lecture | 🔐 | ✅ |

## Reading List Collections (Listes Nommées)

| Route | Description | Sécurité | Statut |
|-------|-------------|----------|--------|
| POST /api/reading-list-collections | Créer une liste de lecture nommée | 🔐 | ✅ | NNNEEEWWW
| GET /api/reading-list-collections/me | Mes listes de lecture créées | 🔐 | ✅ | NNNEEEWWW
| GET /api/reading-list-collections/:id | Détails liste (public si is_public=true) | Public/🔐 conditionnelle | ✅ | NNNEEEWWW
| PUT /api/reading-list-collections/:id | Mettre à jour liste (propriétaire) | 🔐 👑 | ✅ | NNNEEEWWW
| DELETE /api/reading-list-collections/:id | Supprimer liste (livres → owned) | 🔐 👑 | ✅ | NNNEEEWWW
| POST /api/reading-list-collections/:id/add-book | Ajouter livre à collection (lazy import possible) | 🔐 👑 | ✅ | NNNEEEWWW

## Notes (Rates)

| Route | Description | Sécurité | Statut |
|-------|-------------|----------|--------|
| GET /api/rates | Liste notes | Public | ✅ |
| GET /api/rates/:id | Détail note | Public | ✅ |
| POST /api/rates | Créer note (lazy import livre possible) | 🔐 | ✅ (integration) |
| PUT /api/rates/:id | Mettre à jour note | 🔐 🎫 UPDATE_RATE 👑 | ✅ |
| DELETE /api/rates/:id | Supprimer note | 🔐 🎫 DELETE_RATE 👑 | ✅ |
| PATCH /api/rates/:id | MAJ partielle (WIP) | 🔐 WIP | ❌ (non implémenté) |
| GET /api/rates/me/all | Mes notes | Public (à sécuriser ?) | ✅ (expose) |
| GET /api/rates/me/book/:book_id | Ma note pour un livre | Public (à sécuriser ?) | ✅ (expose) |
| GET /api/rates/book/:book_id | Notes d'un livre + moyenne | Public | ✅ |

## Avis (Notices)

| Route | Description | Sécurité | Statut |
|-------|-------------|----------|--------|
| GET /api/notices | Liste avis | Public | ✅ |
| GET /api/notices/:id | Détail avis (inclut User + Book) | Public | ✅ |
| POST /api/notices | Créer avis (lazy import livre possible) | 🔐 | ✅ (integration) |
| PUT /api/notices/:id | Mettre à jour avis | 🔐 🎫 UPDATE_NOTICE 👑 | ✅ |
| DELETE /api/notices/:id | Supprimer avis | 🔐 🎫 DELETE_NOTICE 👑 | ✅ |
| PATCH /api/notices/:id | MAJ partielle (WIP) | 🔐 WIP | ❌ (non implémenté) |
| GET /api/notices/me/all | Mes avis (inclut Book) | Public (à sécuriser ?) | ✅ (expose) |
| GET /api/notices/book/:book_id | Avis d'un livre | Public | ✅ |

## Export

| Route | Description | Sécurité | Statut |
|-------|-------------|----------|--------|
| GET /api/export/me | Export RGPD de mes données | 🔐 🎫 EXPORT | ✅ (integration) |
| GET /api/export/stats | Export stats système | 🔐 🎫 ADMIN + EXPORT | ✅ (integration) |
| GET /api/export/admin/all | Export complet (non implémenté) | 🔐 🎫 ADMIN + EXPORT WIP | :x: |

## Uploads & Médias

| Route | Description | Sécurité | Statut |
|-------|-------------|----------|--------|
| GET /api/uploads/covers | Liste covers (placeholder) | Public WIP | :x: |
| GET /api/uploads/covers/:book_id/:size | Serving optimisé d'images (thumb/small/medium) | Public | ✅ |
| POST /api/uploads/book/:book_id/cover | Upload cover livre | 🔐 | ✅ |
| DELETE /api/uploads/book/:book_id/cover | Supprimer cover livre | 🔐 | ✅ |
| PATCH /api/uploads/book/:book_id/cover | MAJ partielle cover (WIP) | 🔐 WIP | :x: |
| POST /api/uploads/user/avatar | Upload avatar utilisateur | 🔐 | ✅ |
| DELETE /api/uploads/user/avatar | Supprimer avatar | 🔐 | ✅ |
| PATCH /api/uploads/user/avatar | MAJ partielle avatar (WIP) | 🔐 WIP | :x: |
| GET /api/uploads/me | Lister mes images | 🔐 | ✅ |

## Divers / Diagnostic

| Route | Description | Sécurité |
|-------|-------------|----------|
| (Plusieurs endpoints /api/auth/test/*) | Tests de permissions / debug | 🔐 selon cas |

## Observations & TODO Sécurité

- Endpoints `GET /api/rates/me/*` et `GET /api/notices/me/all` exposés sans auth: vérifier intention (probablement à sécuriser ✅ TODO).
- Endpoints PATCH/partiels retournent 501: à implémenter ou masquer avant production.
- Multiplication de `requirePermission` en série (ADMIN puis EXPORT) sur export avancé: OK mais peut être refactoré en un tableau unique.
- Ownership combiné à permission (ex: UPDATE_LIBRARY + ownership) renforce sécurité: pattern cohérent.

## Workflow Bibliothèques & Reading Lists

### Nouveau concept implémenté (août 2025)

**Bibliothèque = Collection permanente** vs **Reading List = Playlist temporaire** vs **Reading List Collections = Listes nommées**

#### 1. Ajouter un livre à ma collection
```bash
POST /api/libraries/:id/add-book
{"id_book": 7} # ou {"open_library_key": "OL123456W"}
→ Status: "owned" (livre dans ma collection)
```

#### 2. Mettre en liste de lecture (bibliothèque)
```bash
POST /api/reading-lists
{"id_library": 7, "id_book": 7, "reading_status": "to_read"}  
→ Transition: "owned" → "to_read" (même entrée DB)
```

#### 3. Créer une liste nommée
```bash
POST /api/reading-list-collections
{"name": "Mes livres d'été", "description": "...", "is_public": false}
→ Crée une collection nommée
```

#### 4. Ajouter livre à liste nommée
```bash
POST /api/reading-list-collections/:id/add-book
{"id_book": 7, "reading_status": "to_read"}
→ Crée entrée séparée avec id_reading_list_collection
```

#### 5. Supprimer liste nommée
```bash
DELETE /api/reading-list-collections/:id
→ Livres retournent en "owned" dans bibliothèque
```

**Statuts ReadingList**: `owned` | `to_read` | `reading` | `read` | `abandoned`

**Architecture**: 
- Un livre peut être dans **UNE** bibliothèque (collection permanente)
- Un livre peut être dans **PLUSIEURS** listes nommées (références multiples)
- Supprimer une liste nommée ne supprime jamais le livre de la bibliothèque

### Lazy Import OpenLibrary

Les routes suivantes supportent l'import automatique depuis OpenLibrary:
- `POST /api/libraries/:id/add-book` → Ajoute à la collection
- `POST /api/reading-lists` → Transition owned→to_read ou import direct
- `POST /api/reading-list-collections/:id/add-book` → Import + ajout à liste nommée
- `POST /api/rates` → Import + notation
- `POST /api/notices` → Import + avis

## Ajouts Futurs Proposés

- Normalisation réponses 501 -> code d'erreur interne
- Sécuriser * /me/all endpoints (rates, notices) si nécessaire
- Regrouper documentation permissions (table rôle → permissions) dans docs.

## Réponses Enrichies (Includes)

Certaines routes incluent automatiquement les données relationnelles pour éviter des requêtes multiples :

### Avis (Notices)

- `GET /api/notices/:id` : inclut User (id_user, username, avatar_url) + Book (id_book, title, cover_url)
- `GET /api/notices/me/all` : inclut Book (id_book, title, cover_url)

### Images de couverture

- `GET /api/books/:id/cover-info` : métadonnées complètes des images
- `GET /api/uploads/covers/:book_id/:size` : serving direct optimisé

**Exemple de réponse enrichie (Notice) :**

```json
{
  "success": true,
  "data": {
    "id_notice": 123,
    "title": "Excellent livre !",
    "content": "Je recommande vivement...",
    "NoticeBelongsToUser": {
      "id_user": 45,
      "username": "bookworm",
      "avatar_url": "/uploads/avatars/user-45.jpg"
    },
    "NoticeBelongsToBook": {
      "id_book": 67,
      "title": "1984",
      "cover_url": "/uploads/covers/book-67.jpg"
    }
  }
}
```

**Exemple métadonnées images :**

```json
{
  "success": true,
  "data": {
    "hasImages": true,
    "formats": ["webp"],
    "sizes": {
      "thumb": "/uploads/covers/book-123-thumb.webp",
      "small": "/uploads/covers/book-123-small.webp", 
      "medium": "/uploads/covers/book-123-medium.webp"
    },
    "aspectRatio": "5:8",
    "optimized": true
  }
}
```

---
