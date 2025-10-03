# Tests RBAC (Permissions & Routes Minimales)

Ce dossier contient des tests unitaires ciblés sur le middleware `requirePermission` appliqué à des routes **minimales** (sans charger tout le router métier ni la base de données). Objectif : obtenir un feedback rapide (quelques millisecondes) sur les statuts 401 / 403 / 200 des principales permissions CRUD.

## Principes

1. **Isolation** : on construit une mini‑app Express par fichier de test avec uniquement la route et la chaîne RBAC nécessaire.
2. **Injection de session** : on simule `authenticateToken` via un middleware inline qui copie `__RBAC_TEST_SESSION` dans `req.session`.
3. **Pas de DB réelle** : on exporte `UNIT_NO_DB=1` pour que `tests/setup.ts` saute le sync/seed.
4. **Override modèle User** : on positionne `global.__TEST_MODEL_OVERRIDES.User.Model.findByPk` vers un mock retournant un objet utilisateur possédant `getRoles()/getPermissions()`.
5. **Aucune modification du middleware** : on exerce le vrai `requirePermission`, y compris sa récupération asynchrone des permissions.

## Fichiers clés

| Fichier | Couvre | Permissions | Résultats testés |
|---------|--------|-------------|------------------|
| `authors.rbac.test.ts` | POST /authors | CREATE_AUTHOR | 401 / 403 / 201 |
| `authors.update.rbac.test.ts` | PUT /authors/:id | UPDATE_AUTHOR | 401 / 403 / 200 |
| `authors.delete.rbac.test.ts` | DELETE /authors/:id | DELETE_AUTHOR | 401 / 403 / 200 |

Pattern réutilisable


```ts
app.post('/resource',
  (req, _res, next) => { if (global.__RBAC_TEST_SESSION) req.session = global.__RBAC_TEST_SESSION; next(); },
  requirePermission('PERM_NAME'),
  (req, res) => res.status(201).json({ ok: true, userPermissions: req.userPermissions })
);
```

Mock utilisateur :

```ts
const findByPkMock = vi.fn();
global.__TEST_MODEL_OVERRIDES = { User: { Model: { findByPk: findByPkMock } } };
findByPkMock.mockResolvedValue({
  id_user: 1,
  getRoles: async () => [{ getPermissions: async () => perms.map(p => ({ label: p })) }]
});
```

## Commandes d’exécution rapides

```bash
# Tous les tests RBAC auteurs
UNIT_NO_DB=1 npx vitest run tests/unit/routes/authors.*.rbac.test.ts

# Un seul fichier
UNIT_NO_DB=1 npx vitest run tests/unit/routes/authors.update.rbac.test.ts
```

## Avantages

- Feedback rapide (< 1s pour l’ensemble auteurs CRUD)
- Zéro dépendance au seed
- Facile à dupliquer pour Books / Genres / etc.

## Prochaines extensions suggérées

- Factoriser un helper `buildRbacTestRoute(permission)` pour réduire la duplication
- Couvrir `CREATE_GENRE`, `CREATE_BOOK`, etc. avec le même pattern
- Ajouter un test multi‑permissions (ex: route factice nécessitant `['CREATE_AUTHOR','UPDATE_AUTHOR']`)
- Introduire un mode STRICT vérifiant qu’aucune requête SQL n’a été émise (compteur de mocks)

---

_Ce README documente la stratégie afin que d’autres membres puissent rapidement ajouter des tests RBAC cohérents et rapides._
