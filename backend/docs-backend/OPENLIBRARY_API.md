# API OpenLibrary - Documentation Frontend

## 🎯 Nouvelles Routes Disponibles

### 📖 Book Excerpts - Extraits de Livre

**GET** `/api/openlibrary/book/:isbn/excerpts`

Récupère les extraits, table des matières et informations ebook d'un livre via son ISBN.

**Path Parameters:**

- `isbn` (requis) : ISBN du livre (minimum 10 caractères)

**Exemple:**

```bash
GET /api/openlibrary/book/9780451524935/excerpts
```

**Réponse:**

```json
{
  "success": true,
  "data": {
    "isbn": "9780451524935",
    "title": "Nineteen Eighty-Four",
    "authors": [
      {
        "name": "George Orwell",
        "url": "https://openlibrary.org/authors/OL118077A/George_Orwell"
      }
    ],
    "excerpts": [
      {
        "text": "It was a bright cold day in April, and the clocks were striking thirteen.",
        "comment": "first sentence"
      }
    ],
    "table_of_contents": [
      {
        "title": "Chapter 1",
        "pagenum": "1",
        "level": 0
      }
    ],
    "ebooks": [
      {
        "preview_url": "https://archive.org/details/...",
        "availability": "restricted",
        "formats": {}
      }
    ],
    "has_excerpts": true,
    "has_ebooks": true,
    "has_table_of_contents": true
  },
  "meta": {
    "isbn": "9780451524935",
    "excerpts_count": 1,
    "ebooks_count": 1,
    "source": "OpenLibrary"
  },
  "message": "1 extrait(s) trouvé(s) pour ISBN 9780451524935"
}
```

---

### 📈 Trending Books - Livres Populaires

**GET** `/api/openlibrary/trending`

Récupère les livres actuellement tendances sur OpenLibrary.

**Query Parameters:**

- `period` (optionnel) : `'now' | 'today' | 'week' | 'month' | 'year' | 'all'` - Défaut: `'now'`
- `limit` (optionnel) : `number` - Nombre de résultats (défaut: 20)

**Exemple:**

```bash
GET /api/openlibrary/trending?period=week&limit=10
```

**Réponse:**

```json
{
  "success": true,
  "data": [
    {
      "open_library_key": "/works/OL123456W",
      "title": "The Great Gatsby",
      "authors": ["F. Scott Fitzgerald"],
      "publication_year": 1925,
      "cover_url": "https://covers.openlibrary.org/b/id/12345-M.jpg",
      "subjects": ["fiction", "american literature"],
      "lending": "available",
      "edition_count": 150
    }
  ],
  "meta": {
    "period": "week",
    "total_returned": 10,
    "source": "OpenLibrary"
  }
}
```

---

### 📚 Books by Subject - Livres par Catégorie

**GET** `/api/openlibrary/subjects/:subject`

Récupère les livres d'une catégorie/sujet spécifique.

**Path Parameters:**

- `subject` (requis) : Nom du sujet (ex: `fiction`, `science_fiction`, `romance`)

**Query Parameters:**

- `limit` (optionnel) : `number` - Nombre de résultats (défaut: 20)
- `offset` (optionnel) : `number` - Décalage pour pagination (défaut: 0)

**Exemple:**

```bash
GET /api/openlibrary/subjects/science_fiction?limit=15&offset=20
```

**Réponse:**

```json
{
  "success": true,
  "data": [
    {
      "open_library_key": "/works/OL789123W",
      "title": "Dune",
      "authors": ["Frank Herbert"],
      "publication_year": 1965,
      "cover_url": "https://covers.openlibrary.org/b/id/67890-M.jpg",
      "subjects": ["science fiction", "fantasy"],
      "lending": "available",
      "edition_count": 200
    }
  ],
  "meta": {
    "subject": "science_fiction",
    "total_works": 45123,
    "returned": 15,
    "offset": 20,
    "limit": 15,
    "source": "OpenLibrary"
  }
}
```

---

## 📋 Sujets Populaires Disponibles

### Fiction

- `fiction` - Fiction générale
- `science_fiction` - Science-fiction
- `fantasy` - Fantasy
- `mystery` - Mystère/Policier
- `romance` - Romance
- `historical_fiction` - Fiction historique
- `children_fiction` - Fiction jeunesse

### Non-Fiction

- `nonfiction` - Non-fiction générale
- `biography` - Biographies
- `history` - Histoire
- `science` - Sciences
- `business` - Business
- `psychology` - Psychologie
- `self_help` - Développement personnel
- `health` - Santé
- `travel` - Voyage
- `religion` - Religion

### Spécialisés

- `textbooks` - Manuels scolaires
- `reference` - Référence
- `education` - Éducation
- `technology` - Technologie
- `art` - Art
- `music` - Musique

---

## 🔧 Routes Existantes (Inchangées)

### Recherche

- **GET** `/api/openlibrary/search/books` - Recherche simple
- **GET** `/api/openlibrary/search/books/advanced` - Recherche avancée

### Détails

- **GET** `/api/openlibrary/books/:workKey` - Détails d'un livre
- **GET** `/api/openlibrary/authors/:authorKey` - Détails d'un auteur

### Import (Authentifié)

- **POST** `/api/openlibrary/import/book` - Importer un livre
- **POST** `/api/openlibrary/import/author` - Importer un auteur

---

## 💡 Cas d'Usage Frontend

### Prévisualisation Livre avec Extraits

```javascript
// Récupérer les extraits d'un livre par ISBN
const response = await fetch('/api/openlibrary/book/9780451524935/excerpts');
const { data: bookPreview } = await response.json();

// Afficher l'extrait dans un modal ou aperçu
if (bookPreview.has_excerpts) {
  const firstExcerpt = bookPreview.excerpts[0];
  // Afficher: firstExcerpt.text + firstExcerpt.comment
}
```

### Section "Top du Moment"

```javascript
// Récupérer les trending de la semaine
const response = await fetch('/api/openlibrary/trending?period=week&limit=8');
const { data: trendingBooks } = await response.json();

// Afficher en carousel/grid
```

### Page Catégories

```javascript
// Récupérer les livres de science-fiction
const response = await fetch('/api/openlibrary/subjects/science_fiction?limit=20');
const { data: scifiBooks, meta } = await response.json();

// Pagination avec meta.total_works
const totalPages = Math.ceil(meta.total_works / meta.limit);
```

### Navigation par Genre

```javascript
// Genres populaires pour menu
const genres = [
  { key: 'fiction', label: 'Fiction' },
  { key: 'science_fiction', label: 'Science-Fiction' },
  { key: 'fantasy', label: 'Fantasy' },
  { key: 'romance', label: 'Romance' }
];
```

---

## ⚡ Performance & Cache

- **Timeout**: 10 secondes par requête
- **Source**: Données directement depuis OpenLibrary (pas de BDD)
- **Cache recommandé**: Frontend peut cacher 1-2h
- **Rate limiting**: OpenLibrary applique ses propres limites

---

## 🚨 Gestion d'Erreurs

### Erreurs Possibles

**400 - Bad Request**

```json
{
  "success": false,
  "message": "Subject parameter is required and must be at least 2 characters"
}
```

**404 - Subject Not Found**

```json
{
  "success": false,
  "error": "Subject not found",
  "message": "The subject 'inexistant' was not found in OpenLibrary"
}
```

**500 - Service Error**

```json
{
  "success": false,
  "error": "Failed to fetch trending books",
  "message": "Unable to retrieve trending books from OpenLibrary"
}
```

---

## 📱 Responsive Design

### Suggestions d'Affichage

- **Mobile**: 2-3 livres par ligne, scroll horizontal
- **Tablet**: 4-5 livres par ligne  
- **Desktop**: 6-8 livres par ligne

### Images de Couverture

- URL format: `https://covers.openlibrary.org/b/id/{cover_id}-{size}.jpg`
- Tailles: `S` (small), `M` (medium), `L` (large)
- Fallback: Image placeholder si `cover_url` null

---

**🔗 Base URL**: Toutes les routes sont préfixées par `/api`
**📧 Support**: contact@blablabook.com