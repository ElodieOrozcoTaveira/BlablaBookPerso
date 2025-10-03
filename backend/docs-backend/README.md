# 📚 BlaBlaBook Backend API

> API HTTP complète avec sessions pour la plateforme de partage de critiques de livres BlaBlaBook

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- Docker & Docker Compose (recommandé)

### Installation & Démarrage

```bash
# Cloner le projet
git clone <repository-url>
cd blablabook/backend

# Installer les dépendances
npm install

# Configuration environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# Démarrer avec Docker (recommandé)
docker compose -f ../docker-compose.dev.yml up -d

# OU démarrer en local
npm run dev
```

**🌐 API disponible sur:** `http://localhost:3000/api`

---

## 📋 Fonctionnalités

### 🔐 Authentification & Autorisation
- Inscription/Connexion utilisateurs
- Sessions Redis sécurisées (stateful)
- Système RBAC (Admin/Moderator/User)
- Permissions granulaires par endpoint

### 📚 Gestion des Livres
- CRUD complet livres, auteurs, genres
- Import depuis OpenLibrary API
- Upload et traitement d'images de couverture
- Recherche avancée et filtrage

### 👥 Fonctionnalités Sociales
- Bibliothèques personnelles (publiques/privées)
- Critiques et notes (1-5 étoiles)
- Listes de lecture collaboratives
- Actions sur livres (favoris, lu, etc.)

### 📊 Découverte & Tendances
- Livres trending OpenLibrary
- Navigation par genres/sujets
- Recommandations basées sur l'activité

### 🛡️ Sécurité & Observabilité
- Rate limiting configurable
- Logs d'audit JSON structurés
- Validation stricte des données
- Export RGPD utilisateur

---

## 🏗️ Architecture

### Paradigme: API HTTP Stateful
```
Client ←→ Express.js (Sessions Redis) ←→ PostgreSQL
         │
         └── OpenLibrary API (externe)
```

**Choix architectural:**
- **Sessions serveur** (non-RESTful) pour sécurité renforcée
- **Stateful** : État d'authentification côté serveur
- **Cookies sécurisés** pour transport session ID

```
src/
├── controllers/     # Logique métier des endpoints
├── middleware/      # Auth, permissions, validation, sécurité
├── models/          # Modèles Sequelize (PostgreSQL)
├── routes/          # Définition des routes Express
├── services/        # Services externes (OpenLibrary, images)
├── validation/      # Schémas Zod de validation
├── types/           # Types TypeScript
├── utils/           # Utilitaires (pagination, etc.)
└── config/          # Configuration DB, permissions
```

### Stack Technique
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js (API HTTP)
- **Authentification**: Sessions Redis (stateful)
- **Base de données**: PostgreSQL + Sequelize ORM
- **Validation**: Zod
- **Tests**: Vitest
- **Images**: Sharp (redimensionnement)

---

## 🔌 Endpoints Principaux

### Authentification (Stateful)
```bash
POST /api/auth/register     # Inscription + création session
POST /api/auth/login        # Connexion + création session
POST /api/auth/logout       # Déconnexion + suppression session
GET  /api/auth/profile      # Profil utilisateur (session requise)
```

### Livres & Auteurs
```bash
GET    /api/books           # Liste des livres
POST   /api/books           # Créer livre (auth + permissions)
GET    /api/books/:id       # Détails livre
PUT    /api/books/:id       # Modifier livre (auth + permissions)
DELETE /api/books/:id       # Supprimer livre (auth + permissions)

GET    /api/authors         # Liste des auteurs
POST   /api/authors         # Créer auteur (auth + permissions)
```

### Bibliothèques & Critiques
```bash
GET    /api/libraries       # Mes bibliothèques (session requise)
POST   /api/libraries       # Créer bibliothèque (session requise)
GET    /api/notices         # Critiques
POST   /api/notices         # Écrire critique (session requise)
```

### OpenLibrary (Proxy externe)
```bash
GET /api/openlibrary/trending              # Livres tendances (public)
GET /api/openlibrary/subjects/fiction      # Livres par genre (public)
GET /api/openlibrary/search/books          # Recherche (public)
POST /api/openlibrary/import/book          # Import (session requise)
```

**📖 Documentation complète:** Voir `OPENLIBRARY_API.md`

---

## 🧪 Tests

### Lancer les Tests
```bash
# Tous les tests
npm run test:vitest

# Tests unitaires uniquement
npm run test:unit

# Tests d'intégration
npm run test:integration

# Tests avec couverture
npm run coverage:vitest

# Mode watch (développement)
npm run test:vitest:watch
```

### Couverture Actuelle
- **211 fichiers de test**
- **85 fichiers source** couverts
- Tests unitaires: Controllers, Services, Validation
- Tests d'intégration: Workflows E2E complets avec sessions
- Tests sécurité: Permissions, Rate limiting, Auth flows

---

## 🔧 Scripts de Développement

```bash
# Développement
npm run dev                 # Serveur avec hot reload
npm run dev:test           # Serveur de test

# Base de données
npm run dev:db:create      # Créer les tables
npm run dev:db:seed        # Données de test
npm run dev:db:reset       # Reset complet

# Qualité code
npm run lint               # ESLint
npm run lint:fix           # Auto-fix ESLint
npm run typecheck          # Vérification TypeScript
npm run build              # Compilation

# Utilitaires
npm run dev:user:create    # Créer utilisateur test
npm run dev:test:security  # Test sécurité manuel
```

---

## 🌍 Variables d'Environnement

### `.env` (Développement)
```env
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blablabook
DB_USER=your_user
DB_PASSWORD=your_password

# Redis (Sessions)
REDIS_URL=redis://localhost:6379

# Sessions sécurisées
SESSION_SECRET=your-super-secret-key

# Logging
LOG_LEVEL=DEBUG
NODE_ENV=development
```

### `.env.test` (Tests)
```env
# Configuration spécifique aux tests
NODE_ENV=test
DB_NAME=blablabook_test
DB_PORT=5433
REDIS_URL=redis://localhost:6380
LOG_LEVEL=WARN
```

---

## 🚀 Déploiement

### Production avec Docker
```bash
# Build image
docker build -t blablabook-backend .

# Run avec docker-compose
docker compose -f docker-compose.prod.yml up -d
```

### Variables Production
```env
NODE_ENV=production
LOG_LEVEL=INFO
SESSION_SECRET=<strong-random-secret-256-bits>
DB_HOST=<production-db-host>
REDIS_URL=<production-redis-url>
```

### Considerations Stateful
- **Sticky sessions** si multiple instances
- **Redis cluster** pour haute disponibilité
- **Session TTL** configuré selon besoins

---

## 📊 Monitoring & Logs

### Logs d'Audit
Tous les accès aux permissions sont loggés au format JSON:
```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "level": "AUDIT",
  "action": "AUTHZ_GRANTED",
  "userId": 123,
  "email": "user@example.com",
  "resource": "/api/books",
  "granted": true
}
```

### Health Check
```bash
GET /api/health
```
Retourne le statut de l'API et la version.

---

## 🤝 Contribution

### Standards de Code
- **TypeScript strict** activé
- **ESLint** pour la cohérence
- **Tests obligatoires** pour nouvelles features
- **Convention**: Camel case, JSDoc pour fonctions publiques

### Workflow Git
```bash
# Nouvelle feature
git checkout -b feature/nouvelle-fonctionnalite
# ... développement + tests ...
git commit -m "feat: ajouter nouvelle fonctionnalité"

# Tests avant push
npm run test:vitest
npm run lint
npm run typecheck
```

### Ajouter un Endpoint
1. Créer/modifier controller dans `src/controllers/`
2. Ajouter route dans `src/routes/`
3. Ajouter middleware auth/permissions si nécessaire
4. Valider avec schéma Zod dans `src/validation/`
5. Écrire tests unitaires + intégration avec sessions
6. Documenter dans README ou fichier dédié

---

## 🆘 Dépannage

### Problèmes Courants

**Sessions perdues**
```bash
# Vérifier Redis
redis-cli ping
redis-cli keys "sess:*"

# Logs session
docker compose logs redis
```

**Base de données non accessible**
```bash
# Vérifier Docker
docker compose ps

# Logs DB
docker compose logs db
```

**Tests qui échouent**
```bash
# Reset DB test
docker compose -f ../docker-compose.test.yml down
docker compose -f ../docker-compose.test.yml up -d

# Variables d'environnement
cat .env.test
```

---

## 📞 Support

- **Issues**: GitHub Issues du projet
- **Documentation API**: `/OPENLIBRARY_API.md`
- **Tests**: `/README.test.md`
- **Architecture**: `/stackChoices.md`

---

## 📈 Versions

- **v1.0.0**: MVP complet avec authentification par sessions
- **v1.1.0**: Intégration OpenLibrary trending/subjects
- **v1.2.0**: Export RGPD et audit logs avancés

---

**🏆 Statut: Production Ready** | **⚡ Performance: Optimisé** | **🔒 Sécurité: Sessions sécurisées**