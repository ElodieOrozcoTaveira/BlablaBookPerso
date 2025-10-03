# Entity Relationship Diagram (ERD) - BlaBlaBook

Ce document présente le diagramme ERD de l'application BlaBlaBook basé sur la documentation du projet (MCD V3, MPD V2, et dictionnaire des données).

---

## Diagramme ERD

```mermaid
erDiagram
    USER {
        int id_user PK
        string firstname
        string lastname
        string username UK
        string email UK
        string password
        date connected_at
        date created_at
        date deleted_at
    }
    
    ROLE {
        int id_role PK
        string name UK
        string description
        date created_at
    }
    
    PERMISSION {
        int id_permission PK
        string label UK
        string action
    }
    
    LIBRARY {
        int id_library PK
        int id_user FK
        string name UK
        date created_at
        date updated_at
        date deleted_at
    }
    
    READING_LIST {
        int id_reading_list PK
        int id_library FK
        string name
        string description
        boolean statut
        date created_at
        date updated_at
        date deleted_at
    }
    
    BOOK {
        int id_book PK
        string isbn UK
        string title
        boolean image
        string summary
        int nb_pages
        date published_at
    }
    
    AUTHOR {
        int id_author PK
        string firstname
        string lastname
    }
    
    GENRE {
        int id_genre PK
        string name UK
    }
    
    NOTICE {
        int id_notice PK
        int id_user FK
        int id_book FK
        string comment
        date published_at
        date updated_at
    }
    
    RATE {
        int id_rate PK
        int id_user FK
        int id_book FK
        int id_reading_list FK
        int rate
        date published_at
        date updated_at
    }
    
    USER_ROLE {
        int id_user_role PK
        int id_user FK
        int id_role FK
    }
    
    ROLE_PERMISSION {
        int id_permission_role PK
        int id_role FK
        int id_permission FK
    }
    
    BOOK_LIBRARY {
        int id_book_library PK
        int id_library FK
        int id_book FK
        date created_at
    }
    
    BOOK_IN_LIST {
        int id_book_in_list PK
        int id_reading_list FK
        int id_book FK
    }
    
    BOOK_AUTHOR {
        int id_book_author PK
        int id_book FK
        int id_author FK
    }
    
    BOOK_GENRE {
        int id_book_genre PK
        int id_book FK
        int id_genre FK
    }

    
    USER ||--o{ USER_ROLE : "0..N users can have 0..N roles"
    ROLE ||--o{ USER_ROLE : "0..N roles can be assigned to 0..N users"
    
    ROLE ||--o{ ROLE_PERMISSION : "0..N roles can have 0..N permissions"
    PERMISSION ||--o{ ROLE_PERMISSION : "0..N permissions can be held by 0..N roles"
    
    USER ||--|| LIBRARY : "1..N users own 1..1 library"
    LIBRARY ||--o{ READING_LIST : "0..N libraries include 1..1 reading_list"
    
    LIBRARY ||--o{ BOOK_LIBRARY : "0..N libraries contain 0..N books"
    BOOK ||--o{ BOOK_LIBRARY : "0..N books are in 0..N libraries"
    
    READING_LIST ||--o{ BOOK_IN_LIST : "0..N reading_lists contain 0..N books"
    BOOK ||--o{ BOOK_IN_LIST : "0..N books are in 0..N reading_lists"
    
    BOOK ||--|| BOOK_AUTHOR : "1..N books are written by 0..N authors"
    AUTHOR ||--o{ BOOK_AUTHOR : "0..N authors write 1..N books"
    
    BOOK ||--|| BOOK_GENRE : "1..N books belong to 0..N genres"
    GENRE ||--o{ BOOK_GENRE : "0..N genres categorize 1..N books"
    
    USER ||--o{ NOTICE : "0..N users write 1..1 notice"
    BOOK ||--o{ NOTICE : "0..N books have 1..1 notice"
    
    USER ||--o{ RATE : "0..N users give 1..1 rate"
    BOOK ||--o{ RATE : "0..N books receive 0..1 rate"
    READING_LIST ||--o{ RATE : "0..N reading_lists receive 0..1 rate"
```

---

## Description des entités

### Entités principales

| **Entité** | **Description** | **Clé primaire** |
|------------|-----------------|------------------|
| **USER** | Utilisateurs de l'application | id_user |
| **ROLE** | Rôles du système RBAC | id_role |
| **PERMISSION** | Permissions du système | id_permission |
| **LIBRARY** | Bibliothèques personnelles | id_library |
| **READING_LIST** | Listes de lecture thématiques | id_reading_list |
| **BOOK** | Informations sur les livres | id_book |
| **AUTHOR** | Auteurs des livres | id_author |
| **GENRE** | Genres littéraires | id_genre |
| **NOTICE** | Avis/critiques sur les livres | id_notice |
| **RATE** | Notes numériques | id_rate |

### Tables de liaison (Many-to-Many)

| **Table** | **Description** | **Entités liées** |
|-----------|-----------------|-------------------|
| **USER_ROLE** | Attribution des rôles aux utilisateurs | USER ↔ ROLE |
| **ROLE_PERMISSION** | Attribution des permissions aux rôles | ROLE ↔ PERMISSION |
| **BOOK_LIBRARY** | Livres dans les bibliothèques | BOOK ↔ LIBRARY |
| **BOOK_IN_LIST** | Livres dans les listes de lecture | BOOK ↔ READING_LIST |
| **BOOK_AUTHOR** | Auteurs des livres | BOOK ↔ AUTHOR |
| **BOOK_GENRE** | Genres des livres | BOOK ↔ GENRE |

---

## Cardinalités et règles métier

### Système RBAC

- **USER ↔ ROLE** : Un utilisateur peut avoir plusieurs rôles, un rôle peut être attribué à plusieurs utilisateurs
- **ROLE ↔ PERMISSION** : Un rôle peut avoir plusieurs permissions, une permission peut être attribuée à plusieurs rôles

### Gestion des contenus

- **USER → LIBRARY** : Un utilisateur possède au minimum 1 bibliothèque (contrainte métier)
- **LIBRARY → READING_LIST** : Une bibliothèque peut contenir plusieurs listes, chaque liste appartient à une seule bibliothèque
- **LIBRARY ↔ BOOK** : Relation many-to-many permettant le partage de livres entre bibliothèques
- **READING_LIST ↔ BOOK** : Relation many-to-many permettant aux livres d'être dans plusieurs listes

### Métadonnées des livres

- **BOOK ↔ AUTHOR** : Un livre a au moins un auteur, un auteur peut écrire plusieurs livres
- **BOOK ↔ GENRE** : Un livre appartient à au moins un genre, un genre peut contenir plusieurs livres

### Évaluations

- **USER → NOTICE** : Un utilisateur peut rédiger plusieurs avis, chaque avis a un seul auteur
- **BOOK ← NOTICE** : Un livre peut avoir plusieurs avis, chaque avis concerne un seul livre
- **USER → RATE** : Un utilisateur peut donner plusieurs notes
- **BOOK/READING_LIST ← RATE** : Les notes peuvent s'appliquer aux livres ou aux listes

---

## Contraintes d'intégrité

### Clés étrangères avec CASCADE DELETE

- `LIBRARY.id_user → USER.id_user`
- `READING_LIST.id_library → LIBRARY.id_library`
- `NOTICE.id_user → USER.id_user`
- `RATE.id_user → USER.id_user`

### Clés étrangères avec RESTRICT DELETE

- `NOTICE.id_book → BOOK.id_book`
- `RATE.id_book → BOOK.id_book`

### Contraintes d'unicité

- `USER.username` et `USER.email`
- `ROLE.name`
- `PERMISSION.label`
- `BOOK.isbn`
- `LIBRARY.name`
- `GENRE.name`

### Contraintes de validation

- `RATE.rate` : CHECK (rate >= 1 AND rate <= 5)
- `BOOK.nb_pages` : CHECK (nb_pages > 0)

---

## Notes techniques

### Soft Delete

Les entités suivantes supportent la suppression logique via `deleted_at` :

- USER
- LIBRARY
- READING_LIST

### Timestamps automatiques

Toutes les entités principales incluent :

- `created_at` : Date de création
- `updated_at` : Date de dernière modification (si applicable)

### Indexation recommandée

Pour optimiser les performances :

```sql
-- Index sur les clés étrangères fréquemment utilisées
CREATE INDEX idx_notice_user ON NOTICE(id_user);
CREATE INDEX idx_notice_book ON NOTICE(id_book);
CREATE INDEX idx_rate_user ON RATE(id_user);
CREATE INDEX idx_rate_book ON RATE(id_book);
CREATE INDEX idx_library_user ON LIBRARY(id_user);
```

---

## Légende

| **Symbole** | **Signification** |
|-------------|-------------------|
| `PK` | Clé primaire (Primary Key) |
| `FK` | Clé étrangère (Foreign Key) |
| `UK` | Clé unique (Unique Key) |
| `||--||` | Relation un-à-un |
| `||--o{` | Relation un-à-plusieurs |
| `}o--o{` | Relation plusieurs-à-plusieurs |
