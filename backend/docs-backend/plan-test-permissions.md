# Plan de test & Plan d’action Rôles / Permissions / Import Lazy

Ce document combine: (1) le plan d’action technique priorisé, (2) la check‑list des tests fonctionnels et de sécurité, (3) l’avancement.

## Légende avancement

- [ ] Non démarré  | [~] En cours  | [x] Terminé  | [!] Bloquant / à décider

---

## 0. Décisions & Pré‑requis

- [x] Décision: supprimer `AUTHOR_WRITE` et utiliser CREATE_AUTHOR / UPDATE_AUTHOR / DELETE_AUTHOR
- [x] Décision: auto‑confirm des imports quand action = library (OUI)
- [x] Décision: conserver schéma actuel `id_*` (normalisation DTO différée post-MVP)

Note: Migration future possible vers `id` générique + éventuels `public_id` opaques; hors scope MVP.

---

## 1. Assainissement Permissions (Étape 0)

- [x] Ajouter permissions manquantes au seed: CREATE_GENRE / UPDATE_GENRE / DELETE_GENRE / CREATE_BOOK / UPDATE_BOOK / DELETE_BOOK
- [x] Retirer ou ajouter proprement `AUTHOR_WRITE` (supprimée)
- [x] Mettre à jour AVAILABLE_PERMISSIONS (déjà aligné)
- [x] Corriger résumé seed (affiche 19 permissions)
- [ ] Script vérification diff (config vs DB) (optionnel, à faire si besoin)

### Validation Permissions Seed

- [x] Après reseed: debug permissions admin inclut nouvelles permissions (à revalider via endpoint debug)
- [x] User normal n’obtient pas de nouvelles permissions inattendues

Note: seed rendu idempotent (findOrCreate sur rôles, permissions, users, genres, auteurs, livres, libraries, reading_list, rates, notices).

---

## 2. Import Lazy pour actions utilisateur (Étape 1)

- [x] Étendre schéma reading-list: accepter `open_library_key` si `id_book` absent
- [x] Implémenter import lazy dans addBookToReadingList
- [x] Politique: confirmer immédiatement l’import (status=confirmed)
- [x] Étendre createRate (import lazy si livre absent via open_library_key)
- [x] Étendre createNotice idem
- [x] Ajouter logs de traçabilité (source=library/rate/review) (JSON structuré evt=book_*)
- [x] Tests manuels + unit (library + rate + notice sur livre inexistant)

### Validation Import Lazy

- [x] Livre créé avec import_status=confirmed après ajout library
- [~] Auteurs/genres auto-populés (OK quand metadata distante fournie; à compléter pour genres manquants edge cases)
- [x] Pas de duplication livre sur import concurrent (verrou in-memory + double-check)

---

## 3. Ownership Middleware (Étape 2)

- [x] Créer middleware générique `requireOwnership`
- [x] Remplacer vérifs inline (library, rate, notice, reading-list PUT/DELETE)
- [x] POST reading-list: ownership middleware réintégré (fin Option D)
- [x] Ajouter tests négatifs middleware (403, 404, admin bypass, ownerResolver indirect)

### Validation

- [x] Tous les contrôleurs sensibles utilisent middleware (POST reading-list inclus)

---

## 4. Refactor Services (Étape 3)

- [x] Créer RateService
- [x] Créer NoticeService
- [x] Créer ReadingListService
- [x] Déplacer pagination/where dans services (logique transposée dans chaque service)
- [x] Mutualiser pagination (helper buildPagination)
- [~] Uniformiser ApiResponse / PaginatedResponse (normalisation partielle: helper pagination + ajout kind erreurs; reste mapping contrôleurs complet)

### Sous-tâches restantes

- [~] Normaliser structure d'erreurs (kind/code/message) côté services (kind ajouté; reste enum + mapping contrôleurs)
- [ ] Envisager suppression des fallbacks controllers après adaptation des tests

---

## 5. Tests RBAC & Ownership (Étape 4)

### Ressources & Permissions

Note clarification: dans cette section le statut reflète la combinaison (a) protections RBAC présentes dans le code ET (b) couverture de tests granulaire (succès + refus). Interprétation:

- [x] = protections en place + tests succès + tests refus couvrant CRUD (selon ressource) ✅
- [~] = protections présentes mais couverture tests incomplète (souvent uniquement scénarios refus 403, il manque les scénarios succès 2xx) ⚠️
- [ ] = ni protections complètes, ni tests (ou à planifier)

Si ton intention initiale était juste de suivre l’implémentation des protections (indépendamment des tests), on peut dupliquer la vue en deux sous-tableaux (Implémentation vs Tests). Dis-moi si tu préfères ce découpage et j’adapte.

- [x] Users: ADMIN_USERS / VIEW_USER_STATS (tests intégration + minimal 401/403/200 RBAC)
- [x] Authors: CREATE_AUTHOR / UPDATE_AUTHOR / DELETE_AUTHOR (tests unit RBAC create/update/delete 401/403/2xx)
- [x] Genres: CREATE_GENRE / UPDATE_GENRE / DELETE_GENRE (tests minimal 401/403/201 ajoutés + succès CRUD ailleurs)
- [x] Books: CREATE_BOOK / UPDATE_BOOK / DELETE_BOOK (tests minimal 401/403/201 ajoutés + succès CRUD ailleurs)
- [~] Export: EXPORT / ADMIN (routes protégées, tests unit permission partiels, ajouter intégration + cas 403 user stats system)
- [ ] Import (si endpoints futurs): IMPORT
- [~] Lazy import scenarios (library, rate, notice) (tests unit services partiels OK; E2E à ajouter)

### Cas RBAC

- [x] Admin accès /api/users (200)
- [x] User refus /api/users (403)
- [x] Admin auteurs CRUD testé (create/update/delete)
- [x] User refus create author (403)
- [x] Genres CRUD admin OK (201/200 déjà couverts + tests RBAC minimal)
- [x] User refus create genre (403 couvert)
- [x] Books CRUD admin OK (201/200 déjà couverts + tests RBAC minimal)
- [x] User refus create book (403 couvert)

### Ownership

- [x] User A modifie sa library (200)
- [x] User B modifie library A (403)
- [x] Admin modifie library A (200)
- [x] Idem rate (update/delete)
- [x] Idem notice (update/delete)
- [x] Reading list entry cross-user (403)
- [x] POST reading-list ownership (middleware actif)

### Lazy Import

- [x] Ajout book inexistant via reading list crée le livre
- [x] Rate sur open_library_key inexistant crée le livre (test unitaire service: création + confirm import temporary)
- [x] Notice sur open_library_key inexistant crée le livre (test unitaire service)

### Export

- [x] User exportMyData (200)
- [x] User accès exportSystemStats (403) 
- [x] Admin exportSystemStats (200)

---

## 6. Endpoints Utilisateur (Étape 5)

- [x] PATCH /api/users/me/profile (partial update)
- [x] POST /api/users/me/change-password (vérif ancien + hash)
- [x] Tests change-password (mauvais ancien / succès)

---

## 7. Sécurité & Observabilité (Étape 6)

- [ ] Rate limit dédié export
- [ ] LOG_LEVEL env variable
- [ ] Audit JSON structuré (permission middleware)
- [ ] Réduction des logs verbeux en prod

---

## 8. Export Durci (Étape 7)

- [ ] Whitelist stricte attributs
- [ ] Hash / checksum export JSON
- [ ] Compression conditionnelle (gzip)
- [ ] Tests multi-format (json/csv/xml)

---

## 9. Imports Temporaires Avancés (Étape 8)

- [ ] Ajouter last_accessed sur Book
- [ ] Mettre à jour lors de prepare/commit
- [ ] cleanup: condition (temporary + age > X + aucun engagement)
- [ ] Test cleanup (avec / sans engagement)

---

## 10. Documentation (Étape 9)

- [ ] Diagramme séquence import lazy
- [ ] Tableau rôle → permissions
- [ ] Guide ajout permission
- [ ] Section sécurité (rate limits, audit)

---

## 11. Optimisations (Étape 10)

- [ ] Cache permissions (TTL + invalidation)
- [ ] Chargement unique roles+permissions (éviter N+1)
- [ ] Index DB (vérifier rate/notice/reading_list composites)
- [ ] Metrics import lazy (compteur)

---

## 12. Tests d’Authentification de Base

- [ ] Login Admin (`admin1@test.com`)
- [ ] Login User (`test-final-success@example.com`)
- [ ] Session cookie persistante
- [ ] Déconnexion (si endpoint) / invalidation session

---

## 13. Matrice Résultats Attendus (Résumé)

| Endpoint | Admin | User | Anonyme |
|----------|-------|------|---------|
| GET /api/users | 200 | 403 | 401 |
| POST /api/authors | 201 | 403 | 401 |
| POST /api/genres | 201 | 403 | 401 |
| POST /api/books | 201 | 403 | 401 |
| GET /api/libraries | 200 | 200 | 200 (publiques) |
| POST /api/libraries | 201 | 201 | 401 |
| PUT /api/libraries/:own | 200 | 200 | 401 |
| PUT /api/libraries/:other | 200 | 403 | 401 |
| POST /api/reading-list (lazy) | 201 | 201 | 401 |
| POST /api/rates (lazy) | 201 | 201 | 401 |
| POST /api/notices (lazy) | 201 | 201 | 401 |
| GET /api/export/my-data | 200 | 200 | 401 |
| GET /api/export/system-stats | 200 | 403 | 401 |

---

## 14. Outils / Commandes Utiles

- `curl` + cookies + `jq`
- Endpoint debug permissions: `/api/auth/debug/permissions`
- Scripts DB: reset / seed

---

## 15. État actuel (snapshot rapide)

- [x] Permissions auteurs testées (CRUD admin / refus user) (routes minimales RBAC unitaires)
- [x] Middleware RBAC stable (magic methods OK)
- [x] Plan étendu formalisé (ce document)
- [x] Seed aligné + idempotent (Étape 0 terminé)
- [x] Lazy import branché sur reading list / rate / notice (Étape 1 terminé)
- [x] Middleware ownership déployé (PUT/DELETE) + tests unitaires
- [x] POST reading-list via ownership middleware
- [x] Ownership minimal libraries & rates (mini‑routes sans DB, cas owner / 403 / admin / 404 / delete)
- [x] Services Rate / Notice / ReadingList extraits (Étape 3 partielle achevée)
- [x] Guard UNIT_NO_DB empêche authenticate (silence logs ECONNREFUSED)
- [x] Helper pagination mutualisé
- [x] Tests unitaires services (Rate, Notice, ReadingList)
	- Ajout: tests ciblés lazy import Rate/Notice (import temporary confirmé, déjà confirmé, conflit, bypass id_book direct, propagation erreur)
- [~] Normalisation erreurs (kind présent, mapping contrôleurs à venir)
[x] Tests ownership routes Notice (update/delete) verts (wiring + bypass admin + 404 + 403)

---

## 16. Prochaines Actions Immédiates (focus)

- [x] Valider décisions (AUTHOR_WRITE retiré, auto-confirm adopté, DTO: XOR id_book/open_library_key)
- [x] Implémenter Étape 0 (seed + permissions)
- [x] Étape 1 réalisée (reading list + rate + notice lazy import + tests)
- [x] Étape 3 (extraction services + pagination + tests services) complétée
- [x] Ajouter tests RBAC success pour genres (create/update/delete 201/200)
- [x] Ajouter tests RBAC success pour books (create/update/delete 201/200)
- [x] Ajouter tests RBAC denied/success users (ADMIN_USERS / VIEW_USER_STATS)
- [ ] Normaliser structure d'erreurs services + mapping contrôleurs (enum + adapter contrôleurs)
- [ ] Mode STRICT (optionnel) pour détecter toute requête DB en UNIT_NO_DB
- [ ] Documentation Service Layer
- [ ] Préparer nettoyage fallbacks controllers (post refonte tests)

---

## Polish / Post-MVP (superflu à différer)

Ces éléments apportent de la valeur mais ne sont pas nécessaires au MVP fonctionnel.

- Normaliser structure d'erreurs (enum ErrorKind, mapper contrôleurs générique)
- Suppression des fallbacks legacy dans update/delete (après adaptation tests)
- Mode STRICT (UNIT_NO_DB_STRICT) pour interdire toute requête DB en tests unitaires
- Documentation détaillée Service Layer (guide contributeur, conventions)
- Script diff permissions (détection divergence config vs DB en CI)
- LibraryService (centraliser futures opérations avancées bibliothèques)
- Externalisation / i18n des messages (dictionnaire + clés)
- Tests edge cases pagination (page > totalPages, limit extrêmes) et services (multi-filtres, performances)
- Optimisations performances (cache permissions, N+1 roles/permissions, indexes additionnels)
- Metrics & audit enrichis (compteurs lazy import, histogrammes durées)
- Internationalisation export (formats multiples + compression conditionnelle)
- Nettoyage final messages / homogénéisation wording
