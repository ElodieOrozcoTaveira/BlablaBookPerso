# 🔄 Migration des Scripts de Test

## ⚠️ ATTENTION : Scripts Déplacés

Les scripts de test ont été **réorganisés** et déplacés vers `scripts-testing/` pour une meilleure organisation.

### 📍 Nouveaux emplacements

| Ancien emplacement | Nouveau emplacement | Description |
|-------------------|-------------------|-------------|
| `fix-duplicate-imports.sh` | `scripts-testing/fixes/fix-duplicate-imports.sh` | Correction imports en double |
| `fix-test-mocks.sh` | `scripts-testing/fixes/fix-test-mocks.sh` | Correction des mocks |
| `test-permission-middleware.js` | `scripts-testing/runners/run-permission-tests.js` | Tests permissions RBAC |
| `tmp-run-tests.sh` | `scripts-testing/runners/run-vitest-debug.sh` | Debug vitest avec trace |
| `scripts-dev/testing/test-author-actions.sh` | `scripts-testing/integration/test-author-actions.sh` | Tests actions auteur |
| `scripts-dev/testing/security.js` | `scripts-testing/integration/test-security.js` | Tests de sécurité |
| `scripts-dev/testing/integration-openlibrary.ts` | `scripts-testing/integration/test-openlibrary.ts` | Tests OpenLibrary |

### 🚀 Utilisation Recommandée

```bash
# Lancer tous les tests (recommandé)
./scripts-testing/run-all.sh

# Lancer seulement les tests unitaires
./scripts-testing/runners/run-unit-tests.sh

# Lancer seulement les tests d'intégration  
./scripts-testing/runners/run-integration-tests.sh

# Nettoyer l'environnement
./scripts-testing/fixes/clean-test-environment.sh
```

### 📁 Nouvelle Structure

```
scripts-testing/
├── README.md                    # Documentation complète
├── run-all.sh                   # Script principal (nouveau)
├── fixes/                       # Scripts de correction
│   ├── clean-test-environment.sh (nouveau)
│   ├── fix-duplicate-imports.sh
│   └── fix-test-mocks.sh
├── runners/                     # Scripts d'exécution
│   ├── run-unit-tests.sh       (nouveau)
│   ├── run-integration-tests.sh (nouveau)
│   ├── run-permission-tests.js
│   └── run-vitest-debug.sh
└── integration/                 # Tests d'intégration API
    ├── test-author-actions.sh
    ├── test-book-actions.sh     (nouveau)
    ├── test-openlibrary.ts
    └── test-security.js
```

### ✅ Avantages de la Nouvelle Organisation

1. **📂 Structure claire** : Séparation logique par type de script
2. **🔧 Scripts unifiés** : Un point d'entrée principal (`run-all.sh`)
3. **📖 Documentation** : README détaillé dans `scripts-testing/`
4. **🧹 Nettoyage** : Script de nettoyage d'environnement
5. **⚡ Performance** : Scripts optimisés avec gestion d'erreurs

### 🔗 Documentation Complète

Consultez `scripts-testing/README.md` pour la documentation complète et les exemples d'utilisation.

---
**💡 Conseil** : Utilisez `./scripts-testing/run-all.sh` pour une validation complète du projet !
