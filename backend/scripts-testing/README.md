# 🧪 Scripts de Test - BlaBlaBook Backend

Ce dossier contient tous les scripts utilitaires pour le testing du projet BlaBlaBook.

## 📁 Structure des dossiers

```
scripts-testing/
├── README.md                           # Ce fichier
├── run-all.sh                         # Script principal pour tout lancer
├── fixes/                             # Scripts de correction des tests
│   ├── fix-duplicate-imports.sh       # Corrige les imports en double
│   ├── fix-test-mocks.sh             # Corrige les mocks des tests
│   └── clean-test-environment.sh      # Nettoie l'environnement de test
├── runners/                           # Scripts d'exécution des tests
│   ├── run-unit-tests.sh             # Lance les tests unitaires
│   ├── run-integration-tests.sh      # Lance les tests d'intégration
│   ├── run-permission-tests.mjs      # Teste les permissions RBAC
│   └── run-vitest-debug.sh           # Debug vitest avec trace
└── integration/                       # Scripts d'intégration API
    ├── test-author-actions.sh         # Teste les nouvelles actions auteur
    ├── test-book-actions.sh           # Teste les actions livre
    ├── test-openlibrary.mjs           # Teste l'intégration OpenLibrary
    └── test-security.mjs              # Tests de sécurité réalistes
```

## 🚀 Utilisation

### Script principal
```bash
# Lance tous les tests avec nettoyage automatique
./scripts-testing/run-all.sh
```

### Scripts de correction
```bash
# Corrige les imports en double dans les tests
./scripts-testing/fixes/fix-duplicate-imports.sh

# Corrige les mocks des tests
./scripts-testing/fixes/fix-test-mocks.sh

# Nettoie l'environnement de test
./scripts-testing/fixes/clean-test-environment.sh
```

### Scripts d'exécution
```bash
# Tests unitaires seulement
./scripts-testing/runners/run-unit-tests.sh

# Tests d'intégration seulement  
./scripts-testing/runners/run-integration-tests.sh

# Tests de permissions RBAC
node ./scripts-testing/runners/run-permission-tests.mjs

# Debug vitest avec trace des requires
./scripts-testing/runners/run-vitest-debug.sh
```

### Scripts d'intégration
```bash
# Teste les nouvelles actions auteur
./scripts-testing/integration/test-author-actions.sh

# Teste l'intégration OpenLibrary
node ./scripts-testing/integration/test-openlibrary.mjs

# Tests de sécurité réalistes
node ./scripts-testing/integration/test-security.mjs
```

## 📋 Description des scripts

| Script | Description | Usage |
|--------|-------------|-------|
| **fix-duplicate-imports.sh** | Supprime les imports en double dans les fichiers de test | Maintenance |
| **fix-test-mocks.sh** | Unifie et corrige les mocks d'authentification | Maintenance |
| **run-permission-tests.mjs** | Teste le middleware de permissions RBAC | Sécurité |
| **run-vitest-debug.sh** | Lance vitest avec trace pour débugger les imports | Debug |
| **test-author-actions.sh** | Teste les endpoints d'actions auteur (API) | Intégration |
| **test-openlibrary.mjs** | Teste l'intégration avec l'API OpenLibrary | Intégration |
| **test-security.mjs** | Tests de sécurité avec authentification réelle | Sécurité |

## 🔧 Maintenance

Ces scripts sont conçus pour :
- ✅ **Corriger automatiquement** les problèmes récurrents de tests
- ✅ **Débugger facilement** les erreurs d'imports et de mocks
- ✅ **Tester l'intégration** avec les API externes
- ✅ **Vérifier la sécurité** avec des tests réalistes
- ✅ **Organiser clairement** tous les utilitaires de test

## 📖 Notes importantes

1. **Ordre d'exécution recommandé** :
   - Fixes → Runners → Integration

2. **Pré-requis** :
   - Docker environnement démarré (`docker-compose -f docker-compose.dev.yml up -d`)
   - Base de données seedée
   - API accessible sur `http://localhost:3000`

3. **Debugging** :
   - Utilisez `run-vitest-debug.sh` pour tracer les problèmes d'imports
   - Consultez les logs dans `/tmp/vitest_run.log`
