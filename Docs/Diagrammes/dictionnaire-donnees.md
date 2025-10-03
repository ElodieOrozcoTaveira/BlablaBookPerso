# Dictionnaire des Données - BlaBlaBook

## 0. Contexte technique

Ce dictionnaire des données a été conçu pour une utilisation avec l'ORM **Sequelize** (Node.js). Les types de données et contraintes sont optimisés pour cette technologie :

- **Types simplifiés** : Privilégiation de TEXT sur VARCHAR pour la flexibilité
- **Contraintes ORM** : Validation côté application plutôt que base de données
- **Dates** : Type DATE géré automatiquement par Sequelize (timestamps inclus)
- **JSON natif** : Support des colonnes JSON pour les données complexes

---

## 1. Vue d'ensemble

### 1.1 Entités du système

| Code | Libellé | Description |
|------|---------|-------------|
| USER | Utilisateur | Comptes utilisateurs de l'application |
| ROLE | Rôle | Rôles du système RBAC |
| PERMISSION | Permission | Permissions du système RBAC |
| BOOK | Livre | Informations sur les livres |
| LIBRARY | Bibliothèque | Bibliothèques personnelles des utilisateurs |
| READING_LIST | Liste de lecture | Collections thématiques de livres |
| NOTICE | Avis | Avis/critiques sur les livres |
| RATE | Note | Notes numériques attribuées aux livres |
| AUTHOR | Auteur | Informations sur les auteurs de livres |
| GENRE | Genre | Genres littéraires |

### 1.2 Tables de relations

| Code | Libellé | Entité 1 | Entité 2 | Description |
|------|---------|----------|----------|-------------|
| USER_ROLE | Utilisateur-Rôle | USER | ROLE | Attribution des rôles aux utilisateurs |
| ROLE_PERMISSION | Rôle-Permission | ROLE | PERMISSION | Attribution des permissions aux rôles |
| BOOK_LIBRARY | Livre-Bibliothèque | BOOK | LIBRARY | Livres dans les bibliothèques |
| BOOK_IN_LIST | Livre-Liste | BOOK | READING_LIST | Livres dans les listes de lecture |
| BOOK_AUTHOR | Livre-Auteur | BOOK | AUTHOR | Auteurs des livres |
| BOOK_GENRE | Livre-Genre | BOOK | GENRE | Genres des livres |

---

## 2. Description des entités

### USER

| Code | Libellé | Type | Taille | Contraintes | Commentaire |
|------|---------|------|--------|-------------|-------------|
| id_user | ID utilisateur | INTEGER | - | PK, AUTO_INCREMENT, NOT NULL | Clé primaire |
| firstname | Prénom | TEXT | - | NOT NULL | Prénom de l'utilisateur |
| lastname | Nom | TEXT | - | NOT NULL | Nom de famille |
| username | Nom d'utilisateur | TEXT | - | UNIQUE, NOT NULL | Identifiant unique |
| email | Email | TEXT | - | UNIQUE, NOT NULL | Adresse email |
| password | Mot de passe | TEXT | - | NOT NULL | Hash du mot de passe |
| connected_at | Date connexion | DATE | - | NOT NULL, DEFAULT CURRENT_DATE | Dernière connexion |
| created_at | Date création | DATE | - | NOT NULL, DEFAULT CURRENT_DATE | Date de création |
| deleted_at | Date suppression | DATE | - | NULL | Date de suppression (soft delete) |

**Domaines de valeurs :**

- username : Identifiant unique de l'utilisateur
- email : Adresse email valide
- password : Hash argon2 ou similaire

### ROLE

| Code | Libellé | Type | Taille | Contraintes | Commentaire |
|------|---------|------|--------|-------------|-------------|
| id_role | ID rôle | INTEGER | - | PK, AUTO_INCREMENT, NOT NULL | Clé primaire |
| name | Nom | TEXT | - | UNIQUE, NOT NULL | Nom du rôle |
| description | Description | TEXT | - | NOT NULL | Description du rôle |
| created_at | Date création | DATE | - | NOT NULL, DEFAULT CURRENT_DATE | Date de création |

**Domaines de valeurs :**

- name : USER, MODERATOR, ADMIN

### PERMISSION

| Code | Libellé | Type | Taille | Contraintes | Commentaire |
|------|---------|------|--------|-------------|-------------|
| id_permission | ID permission | INTEGER | - | PK, AUTO_INCREMENT, NOT NULL | Clé primaire |
| label | Libellé | TEXT | - | UNIQUE, NOT NULL | Nom de la permission |
| action | Action | TEXT | - | NULL | Description de la permission |

**Domaines de valeurs :**

- label : CREATE, READ, UPDATE, DELETE, MODERATE

### BOOK

| Code | Libellé | Type | Taille | Contraintes | Commentaire |
|------|---------|------|--------|-------------|-------------|
| id_book | ID livre | INTEGER | - | PK, AUTO_INCREMENT, NOT NULL | Clé primaire |
| isbn | Code ISBN | TEXT | - | UNIQUE, NULL | Code ISBN du livre |
| title | Titre | TEXT | - | NOT NULL | Titre du livre |
| image | Image disponible | BOOLEAN | - | NOT NULL, DEFAULT FALSE | Indicateur de présence d'image |
| summary | Résumé | TEXT | - | NULL | Résumé du livre |
| nb_pages | Nombre de pages | INTEGER | - | NULL | Nombre de pages |
| published_at | Date publication | DATE | - | NULL | Date de publication |

**Domaines de valeurs :**

- isbn : Code ISBN-10 ou ISBN-13 (optionnel)
- title : Titre complet du livre
- nb_pages : Nombre entier positif

### LIBRARY

| Code | Libellé | Type | Taille | Contraintes | Commentaire |
|------|---------|------|--------|-------------|-------------|
| id_library | ID bibliothèque | INTEGER | - | PK, AUTO_INCREMENT, NOT NULL | Clé primaire |
| id_user | ID utilisateur | INTEGER | - | FK, NOT NULL | Référence USER |
| name | Nom | TEXT | - | UNIQUE, NOT NULL | Nom de la bibliothèque |
| created_at | Date création | DATE | - | NOT NULL, DEFAULT CURRENT_DATE | Date de création |
| updated_at | Date modification | DATE | - | NOT NULL, DEFAULT CURRENT_DATE | Date de modification |
| deleted_at | Date suppression | DATE | - | NULL | Date de suppression |

**Domaines de valeurs :**

- name : Nom personnalisé de la bibliothèque

### READING_LIST

| Code | Libellé | Type | Taille | Contraintes | Commentaire |
|------|---------|------|--------|-------------|-------------|
| id_reading_list | ID liste | INTEGER | - | PK, AUTO_INCREMENT, NOT NULL | Clé primaire |
| id_library | ID bibliothèque | INTEGER | - | FK, NOT NULL | Référence LIBRARY |
| name | Nom | TEXT | - | NOT NULL | Nom de la liste |
| description | Description | TEXT | - | NULL | Description de la liste |
| statut | Statut | BOOLEAN | - | NOT NULL | Statut actif/inactif |
| created_at | Date création | DATE | - | NOT NULL, DEFAULT CURRENT_DATE | Date de création |
| updated_at | Date modification | DATE | - | NOT NULL, DEFAULT CURRENT_DATE | Date de modification |
| deleted_at | Date suppression | DATE | - | NULL | Date de suppression |

**Domaines de valeurs :**

- statut : true (active), false (inactive)

### NOTICE

| Code | Libellé | Type | Taille | Contraintes | Commentaire |
|------|---------|------|--------|-------------|-------------|
| id_notice | ID avis | INTEGER | - | PK, AUTO_INCREMENT, NOT NULL | Clé primaire |
| id_user | ID utilisateur | INTEGER | - | FK, NOT NULL | Référence USER |
| id_book | ID livre | INTEGER | - | FK, NOT NULL | Référence BOOK |
| comment | Commentaire | TEXT | - | NOT NULL | Texte de l'avis |
| published_at | Date publication | DATE | - | NOT NULL, DEFAULT CURRENT_DATE | Date de publication |
| updated_at | Date modification | DATE | - | NULL | Date de modification |

**Domaines de valeurs :**

- comment : Texte libre de l'avis utilisateur

### RATE

| Code | Libellé | Type | Taille | Contraintes | Commentaire |
|------|---------|------|--------|-------------|-------------|
| id_rate | ID note | INTEGER | - | PK, AUTO_INCREMENT, NOT NULL | Clé primaire |
| id_user | ID utilisateur | INTEGER | - | FK, NOT NULL | Référence USER |
| id_book | ID livre | INTEGER | - | FK, NOT NULL | Référence BOOK |
| id_reading_list | ID liste | INTEGER | - | FK, NULL | Référence READING_LIST |
| rate | Note | INTEGER | - | NOT NULL, CHECK (rate >= 1 AND rate <= 5) | Note de 1 à 5 |
| published_at | Date publication | DATE | - | NOT NULL, DEFAULT CURRENT_DATE | Date de publication |
| updated_at | Date modification | DATE | - | NULL | Date de modification |

**Domaines de valeurs :**

- rate : Entier de 1 à 5 étoiles

### AUTHOR

| Code | Libellé | Type | Taille | Contraintes | Commentaire |
|------|---------|------|--------|-------------|-------------|
| id_author | ID auteur | INTEGER | - | PK, AUTO_INCREMENT, NOT NULL | Clé primaire |
| firstname | Prénom | TEXT | - | NULL | Prénom de l'auteur |
| lastname | Nom | TEXT | - | NOT NULL | Nom de famille |

**Domaines de valeurs :**

- firstname : Prénom de l'auteur (optionnel)
- lastname : Nom de famille de l'auteur (obligatoire)

### GENRE

| Code | Libellé | Type | Taille | Contraintes | Commentaire |
|------|---------|------|--------|-------------|-------------|
| id_genre | ID genre | INTEGER | - | PK, AUTO_INCREMENT, NOT NULL | Clé primaire |
| name | Nom | TEXT | - | UNIQUE, NOT NULL | Nom du genre |

**Domaines de valeurs :**

- name : Fiction, Non-fiction, Science-fiction, Romance, Thriller, Fantasy, etc.

---

## 3. Tables de relations

### USER_ROLE (Utilisateur - Rôle)

| Code | Libellé | Type | Taille | Contraintes | Commentaire |
|------|---------|------|--------|-------------|-------------|
| id_user_role | ID relation | INTEGER | - | PK, AUTO_INCREMENT, NOT NULL | Clé primaire |
| id_user | ID utilisateur | INTEGER | - | FK, NOT NULL | Référence USER |
| id_role | ID rôle | INTEGER | - | FK, NOT NULL | Référence ROLE |

### ROLE_PERMISSION (Rôle - Permission)

| Code | Libellé | Type | Taille | Contraintes | Commentaire |
|------|---------|------|--------|-------------|-------------|
| id_permission_role | ID relation | INTEGER | - | PK, AUTO_INCREMENT, NOT NULL | Clé primaire |
| id_role | ID rôle | INTEGER | - | FK, NOT NULL | Référence ROLE |
| id_permission | ID permission | INTEGER | - | FK, NOT NULL | Référence PERMISSION |

### BOOK_LIBRARY (Livre - Bibliothèque)

| Code | Libellé | Type | Taille | Contraintes | Commentaire |
|------|---------|------|--------|-------------|-------------|
| id_book_library | ID relation | INTEGER | - | PK, AUTO_INCREMENT, NOT NULL | Clé primaire |
| id_library | ID bibliothèque | INTEGER | - | FK, NOT NULL | Référence LIBRARY |
| id_book | ID livre | INTEGER | - | FK, NOT NULL | Référence BOOK |
| created_at | Date ajout | DATE | - | NOT NULL, DEFAULT CURRENT_DATE | Date d'ajout |

### BOOK_IN_LIST (Livre - Liste de lecture)

| Code | Libellé | Type | Taille | Contraintes | Commentaire |
|------|---------|------|--------|-------------|-------------|
| id_book_in_list | ID relation | INTEGER | - | PK, AUTO_INCREMENT, NOT NULL | Clé primaire |
| id_reading_list | ID liste | INTEGER | - | FK, NOT NULL | Référence READING_LIST |
| id_book | ID livre | INTEGER | - | FK, NOT NULL | Référence BOOK |

### BOOK_AUTHOR (Livre - Auteur)

| Code | Libellé | Type | Taille | Contraintes | Commentaire |
|------|---------|------|--------|-------------|-------------|
| id_book_author | ID relation | INTEGER | - | PK, AUTO_INCREMENT, NOT NULL | Clé primaire |
| id_book | ID livre | INTEGER | - | FK, NOT NULL | Référence BOOK |
| id_author | ID auteur | INTEGER | - | FK, NOT NULL | Référence AUTHOR |

### BOOK_GENRE (Livre - Genre)

| Code | Libellé | Type | Taille | Contraintes | Commentaire |
|------|---------|------|--------|-------------|-------------|
| id_book_genre | ID relation | INTEGER | - | PK, AUTO_INCREMENT, NOT NULL | Clé primaire |
| id_book | ID livre | INTEGER | - | FK, NOT NULL | Référence BOOK |
| id_genre | ID genre | INTEGER | - | FK, NOT NULL | Référence GENRE |

---

## 4. Contraintes d'intégrité

### 4.1 Contraintes référentielles

**Clés étrangères principales :**

- LIBRARY.id_user → USER.id_user (CASCADE DELETE)
- READING_LIST.id_library → LIBRARY.id_library (CASCADE DELETE)
- NOTICE.id_user → USER.id_user (CASCADE DELETE)
- NOTICE.id_book → BOOK.id_book (RESTRICT DELETE)
- RATE.id_user → USER.id_user (CASCADE DELETE)
- RATE.id_book → BOOK.id_book (RESTRICT DELETE)

### 4.2 Contraintes fonctionnelles

**Contraintes d'unicité :**

- **UK_USER_USERNAME** : UNIQUE(username)
  - *Un nom d'utilisateur unique dans le système*

- **UK_USER_EMAIL** : UNIQUE(email)
  - *Un email unique par utilisateur*

- **UK_ROLE_NAME** : UNIQUE(name)
  - *Un nom de rôle unique*

- **UK_PERMISSION_LABEL** : UNIQUE(label)
  - *Un libellé de permission unique*

- **UK_BOOK_ISBN** : UNIQUE(isbn)
  - *Un code ISBN unique par livre*

- **UK_LIBRARY_NAME** : UNIQUE(name)
  - *Un nom de bibliothèque unique*

- **UK_GENRE_NAME** : UNIQUE(name)
  - *Un nom de genre unique*

**Contraintes de validation :**

- **CK_RATE_VALUE** : CHECK (rate >= 1 AND rate <= 5)
  - *La note doit être comprise entre 1 et 5*

- **CK_BOOK_PAGES** : CHECK (nb_pages > 0)
  - *Le nombre de pages doit être positif*

### 4.3 Implémentation Sequelize

```javascript
// Exemple pour la table RATE
const Rate = sequelize.define('Rate', {
  id_rate: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rate: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  }
});

// Exemple de contrainte d'unicité composite
const BookLibrary = sequelize.define('BookLibrary', {
  // ... définitions des colonnes
}, {
  indexes: [
    {
      unique: true,
      fields: ['id_library', 'id_book'],
      name: 'uk_library_book'
    }
  ]
});
```

---

## 5. Notes d'implémentation

### 5.1 Index recommandés

Pour optimiser les performances :

```sql
-- Index sur les clés étrangères fréquemment utilisées
CREATE INDEX idx_notice_user ON NOTICE(id_user);
CREATE INDEX idx_notice_book ON NOTICE(id_book);
CREATE INDEX idx_rate_user ON RATE(id_user);
CREATE INDEX idx_rate_book ON RATE(id_book);
CREATE INDEX idx_library_user ON LIBRARY(id_user);
```

### 5.2 Triggers suggérés

```sql
-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_library_timestamp 
BEFORE UPDATE ON LIBRARY
FOR EACH ROW SET NEW.updated_at = CURRENT_DATE;
```
