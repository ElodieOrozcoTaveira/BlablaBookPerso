# 🛠️ Scripts de Développement - BlaBlaBook Backend

## 📋 Vue d'Ensemble des Scripts

### 🚀 Développement
```bash
npm run dev                 # Serveur développement avec hot reload
npm run dev:test           # Serveur de test (port différent)
npm run build              # Compilation TypeScript
```

### 🗄️ Base de Données
```bash
npm run dev:db:create      # Créer/Synchroniser les tables
npm run dev:db:seed        # Insérer données de développement
npm run dev:db:reset       # Reset complet + seed
```

### 🧪 Tests
```bash
npm run test:vitest        # Tests avec Vitest
npm run test:unit          # Tests unitaires uniquement
npm run test:integration   # Tests d'intégration uniquement
npm run test:lazy          # Tests lazy import spécifiques
npm run coverage:vitest    # Coverage de code
```

### 🔍 Qualité Code
```bash
npm run lint               # Linter ESLint
npm run lint:fix           # Auto-correction ESLint
npm run typecheck          # Vérification types TypeScript
```

### 🔧 Utilitaires
```bash
npm run dev:user:create           # Créer utilisateur de test
npm run dev:test:security         # Tests sécurité manuels
npm run dev:test:openlib          # Test OpenLibrary API
npm run dev:test:integration-openlib  # Tests intégration OpenLibrary
```

### 🏗️ Infrastructure
```bash
npm run infra:wait-db      # Attendre que la DB soit prête
```

---

## 📁 Structure des Scripts

```
scripts-dev/
├── database/           # Scripts base de données
│   ├── create.ts      # Création tables
│   ├── seed.ts        # Données de test
│   └── reset.ts       # Reset + seed
├── testing/           # Scripts de test manuel
│   ├── security.js    # Tests sécurité
│   ├── openlibrary.ts # Test API OpenLibrary
│   └── integration-openlibrary.ts
└── utilities/         # Outils développement
    └── create-test-user.ts
```

---

## 🗄️ Scripts Base de Données

### `npm run dev:db:create`
Synchronise les modèles Sequelize avec la base de données.

```typescript
// scripts-dev/database/create.ts
import { sequelize } from '../../../config/database.js';

await sequelize.sync({ force: false, alter: true });
console.log('✅ Tables créées/synchronisées');
```

**Utilisation:**
- Première installation
- Après modification de modèles
- Mise à jour schéma DB

### `npm run dev:db:seed`
Insère des données de développement.

```typescript
// scripts-dev/database/seed.ts
- Crée utilisateurs de test (admin, user, moderator)
- Insère genres populaires
- Crée livres et auteurs d'exemple
- Configure permissions et rôles
```

**Données créées:**
- **Admin**: `admin@blablabook.com` / `Admin123@`
- **User**: `user@blablabook.com` / `User123@`
- **Genres**: Fiction, Science-fiction, Romance, etc.
- **Livres**: Exemples avec couvertures
- **Permissions**: Configuration RBAC complète

### `npm run dev:db:reset`
Reset complet + seed (⚠️ Destructif).

```bash
# Supprime toutes les tables
# Recrée le schéma
# Insère les données de seed
```

---

## 🧪 Scripts de Test

### Tests Automatisés
```bash
# Tous les tests
npm run test:vitest

# Par catégorie
npm run test:unit           # Controllers, services, validation
npm run test:integration    # Workflows E2E avec DB
npm run test:lazy          # Tests lazy import spécifiques

# Avec couverture
npm run coverage:vitest
```

### Tests Manuels

#### `npm run dev:test:security`
Test manuel des endpoints sécurisés.

```javascript
// scripts-dev/testing/security.js
- Test rate limiting
- Test permissions RBAC
- Test validation des données
- Test authentification
```

#### `npm run dev:test:openlib`
Test direct de l'API OpenLibrary.

```typescript
// scripts-dev/testing/openlibrary.ts
- Test recherche livres
- Test trending
- Test subjects
- Test import livres/auteurs
```

---

## 🔧 Scripts Utilitaires

### `npm run dev:user:create`
Assistant interactif de création d'utilisateur.

```typescript
// scripts-dev/utilities/create-test-user.ts
✓ Prompt email, nom, username
✓ Génération mot de passe sécurisé
✓ Attribution rôle (Admin/User/Moderator)
✓ Vérification unicité
```

**Exemple d'usage:**
```bash
npm run dev:user:create

? Email: test@example.com
? Prénom: John
? Nom: Doe
? Username: johndoe
? Rôle: User
✅ Utilisateur créé avec succès
```

---

## 🏗️ Scripts Infrastructure

### `npm run infra:wait-db`
Attend que PostgreSQL soit accessible (Docker).

```bash
# scripts-infra/wait-for-db.sh
while ! pg_isready -h $DB_HOST -p $DB_PORT; do
  echo "⏳ Attente PostgreSQL..."
  sleep 2
done
echo "✅ PostgreSQL prêt"
```

**Usage:** Dans docker-compose pour synchroniser démarrage.

---

## ⚙️ Configuration Scripts

### Variables d'Environnement
```bash
# Développement
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
LOG_LEVEL=DEBUG

# Test
NODE_ENV=test  
DB_PORT=5433
LOG_LEVEL=WARN
```

### Fichiers Config
- `.env` - Développement local
- `.env.test` - Tests automatisés
- `tsconfig.json` - Configuration TypeScript
- `vitest.config.ts` - Configuration tests

---

## 🔄 Workflow de Développement Typique

### Nouveau Feature
```bash
# 1. Setup environnement
npm run dev:db:create
npm run dev:db:seed

# 2. Développement avec hot reload
npm run dev

# 3. Tests pendant développement
npm run test:vitest:watch

# 4. Validation avant commit
npm run lint
npm run typecheck
npm run test:vitest
```

### Debug Database
```bash
# Reset si problèmes
npm run dev:db:reset

# Créer utilisateur spécifique
npm run dev:user:create

# Vérifier données
psql -h localhost -p 5432 -U bobby blablabook
```

### Tests API
```bash
# Test sécurité manuel
npm run dev:test:security

# Test OpenLibrary
npm run dev:test:openlib

# Tests complets
npm run test:integration
```

---

## 🆘 Dépannage Scripts

### Problèmes Courants

**"Tables don't exist"**
```bash
npm run dev:db:create
```

**"No test users"**
```bash
npm run dev:db:seed
# ou
npm run dev:user:create
```

**"TypeScript errors"**
```bash
npm run typecheck
npm run lint:fix
```

**"Database connection error"**
```bash
# Vérifier Docker
docker compose ps
docker compose logs db

# Attendre DB prête
npm run infra:wait-db
```

**"Redis connection error"**
```bash
# Vérifier Redis
docker compose logs redis
redis-cli ping
```

---

## 🎯 Bonnes Pratiques

### Avant Chaque Développement
1. `npm run dev:db:create` (si nouveaux modèles)
2. `npm run dev` (serveur développement)
3. `npm run test:vitest:watch` (tests en continu)

### Avant Chaque Commit
1. `npm run lint:fix`
2. `npm run typecheck`
3. `npm run test:vitest`

### Après Pull/Merge
1. `npm install` (si nouvelles dépendances)
2. `npm run dev:db:create` (si modèles modifiés)
3. `npm run dev:db:seed` (si seed modifié)

---

**💡 Astuce**: Utilisez `npm run` sans arguments pour voir tous les scripts disponibles.