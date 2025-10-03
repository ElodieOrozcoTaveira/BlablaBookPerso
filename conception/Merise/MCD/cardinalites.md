# Cardinalités des Relations - MCD BlaBlaBook V3

Ce document détaille toutes les relations du Modèle Conceptuel de Données (MCD) V3 de BlaBlaBook avec leurs cardinalités et leurs explications.

---

## 1. Relations du système RBAC (Role-Based Access Control)

### PERMISSION 0-N < DETENIR > 0-N ROLE

**Explication :**

- **Du côté PERMISSION :** Une permission peut être détenue par 0 à N rôles (une permission peut ne pas être assignée ou être assignée à plusieurs rôles)
- **Du côté ROLE :** Un rôle peut détenir 0 à N permissions (un rôle peut n'avoir aucune permission ou avoir plusieurs permissions)

**Exemple concret :** La permission "CREATE" peut être détenue par les rôles "ADMIN" et "MODERATOR", tandis que le rôle "ADMIN" peut détenir les permissions "CREATE", "READ", "UPDATE", "DELETE".

### ROLE 0-N < AVOIR > 0-N UTILISATEUR

**Explication :**

- **Du côté ROLE :** Un rôle peut être attribué à 0 à N utilisateurs (un rôle peut ne pas être assigné ou être assigné à plusieurs utilisateurs)
- **Du côté UTILISATEUR :** Un utilisateur peut avoir 0 à N rôles (un utilisateur peut n'avoir aucun rôle ou avoir plusieurs rôles)

**Exemple concret :** Un utilisateur peut avoir les rôles "USER" et "MODERATOR" simultanément, et le rôle "ADMIN" peut être attribué à plusieurs utilisateurs.

---

## 2. Relations de gestion des bibliothèques et listes

### UTILISATEUR 1-N < POSSEDER > 1-1 BIBLIOTHEQUE

**Explication :**

- **Du côté UTILISATEUR :** Un utilisateur possède au minimum 1 bibliothèque et peut posséder plusieurs bibliothèques
- **Du côté BIBLIOTHEQUE :** Une bibliothèque est possédée par exactement 1 utilisateur (propriété exclusive)

**Exemple concret :** Chaque utilisateur a au moins une bibliothèque personnelle par défaut, mais peut créer d'autres bibliothèques thématiques comme "Science-Fiction" ou "Romans historiques". Chaque bibliothèque appartient exclusivement à un seul utilisateur.

### BIBLIOTHEQUE 0-N < INCLURE > 1-1 LISTE_LECTURE

**Explication :**

- **Du côté BIBLIOTHEQUE :** Une bibliothèque peut inclure 0 à N listes de lecture (une bibliothèque peut ne pas avoir de liste ou en avoir plusieurs)
- **Du côté LISTE_LECTURE :** Une liste de lecture est incluse dans exactement 1 bibliothèque (appartenance exclusive)

**Exemple concret :** Une bibliothèque "Science-Fiction" peut contenir plusieurs listes comme "Classiques SF" et "Nouvelles découvertes", mais chaque liste appartient à une seule bibliothèque.

---

## 3. Relations avec les livres

### BIBLIOTHEQUE 0-N < DISPOSER > 0-N LIVRE

**Explication :**

- **Du côté BIBLIOTHEQUE :** Une bibliothèque peut disposer de 0 à N livres (une bibliothèque peut être vide ou contenir plusieurs livres)
- **Du côté LIVRE :** Un livre peut être disposé dans 0 à N bibliothèques (un livre peut ne pas être dans une bibliothèque ou être dans plusieurs bibliothèques d'utilisateurs différents)

**Exemple concret :** Le livre "1984" peut être présent dans les bibliothèques de plusieurs utilisateurs, et une bibliothèque "Dystopies" peut contenir plusieurs livres.

### LISTE_LECTURE 0-N < CONTENIR > 0-N LIVRE

**Explication :**

- **Du côté LISTE_LECTURE :** Une liste de lecture peut contenir 0 à N livres (une liste peut être vide ou contenir plusieurs livres)
- **Du côté LIVRE :** Un livre peut être contenu dans 0 à N listes de lecture (un livre peut ne pas être dans une liste ou être dans plusieurs listes)

**Exemple concret :** Une liste "À lire cet été" peut contenir plusieurs livres, et le livre "Dune" peut être présent dans les listes "SF Épique" et "Classiques incontournables" de différents utilisateurs.

---

## 4. Relations avec les auteurs et genres

### LIVRE 1-N < ECRIRE > 0-N AUTEUR

**Explication :**

- **Du côté LIVRE :** Un livre est écrit par au minimum 1 auteur et peut être écrit par plusieurs auteurs
- **Du côté AUTEUR :** Un auteur peut écrire 0 à N livres (un auteur peut ne pas avoir écrit de livre référencé dans le système ou en avoir écrit plusieurs)

**Exemple concret :** Le livre "The Talisman" a été co-écrit par Stephen King et Peter Straub, tandis que Stephen King a écrit de nombreux autres livres seul.

### LIVRE 1-N < APPARTIENT > 0-N GENRE

**Explication :**

- **Du côté LIVRE :** Un livre appartient au minimum à 1 genre et peut appartenir à plusieurs genres
- **Du côté GENRE :** Un genre peut concerner 0 à N livres (un nouveau genre peut ne pas encore avoir de livres, ou concerner de nombreux livres)

**Exemple concret :** Le livre "The Martian" appartient aux genres "Science-Fiction" et "Aventure", tandis que le genre "Fantasy" peut contenir de nombreux livres différents.

---

## 5. Relations d'évaluation et critique

### UTILISATEUR 0-N < REDIGER > 1-1 AVIS

**Explication :**

- **Du côté UTILISATEUR :** Un utilisateur peut rédiger 0 à N avis (un utilisateur peut ne pas rédiger d'avis ou en rédiger plusieurs)
- **Du côté AVIS :** Un avis est rédigé par exactement 1 utilisateur (chaque avis a un auteur unique)

**Exemple concret :** Un utilisateur passionné peut rédiger des avis sur tous les livres qu'il lit, tandis qu'un utilisateur discret peut ne jamais écrire d'avis. Chaque avis est signé par un seul utilisateur.

### AVIS 1-1 < COMPORTER > 0-N LIVRE

**Explication :**

- **Du côté AVIS :** Un avis comporte exactement 1 livre (chaque avis concerne un livre spécifique)
- **Du côté LIVRE :** Un livre peut comporter 0 à N avis (un livre peut ne pas avoir d'avis ou en avoir plusieurs de différents utilisateurs)

**Exemple concret :** L'avis "Excellent thriller psychologique" porte exclusivement sur le livre "Gone Girl", mais "Gone Girl" peut avoir plusieurs avis de différents lecteurs.

---

## 6. Relations avec les notes

### UTILISATEUR 0-N < ATTRIBUER > 1-1 NOTE

**Explication :**

- **Du côté UTILISATEUR :** Un utilisateur peut attribuer 0 à N notes (un utilisateur peut ne jamais noter ou noter plusieurs éléments)
- **Du côté NOTE :** Une note est attribuée par exactement 1 utilisateur (chaque note a un attributeur unique)

**Exemple concret :** Un utilisateur peut attribuer des notes à plusieurs livres ou listes qu'il a consultés, mais chaque note de "4 étoiles" est attribuée par un utilisateur spécifique.

### NOTE 0-1 < POSSEDER > 0-N LIVRE

**Explication :**

- **Du côté NOTE :** Une note peut posséder 0 à 1 livre (une note peut ne pas concerner de livre spécifique ou concerner un seul livre)
- **Du côté LIVRE :** Un livre peut posséder 0 à N notes (un livre peut ne pas avoir de note ou avoir plusieurs notes de différents utilisateurs)

**Exemple concret :** Une note peut être générale (non liée à un livre) ou porter sur "1984" spécifiquement, tandis que "1984" peut recevoir plusieurs notes de différents lecteurs.

### LISTE_LECTURE 0-N < RECEVOIR > 0-1 NOTE

**Explication :**

- **Du côté LISTE_LECTURE :** Une liste de lecture peut recevoir 0 à N notes (une liste peut ne pas être notée ou recevoir plusieurs notes de différents utilisateurs)
- **Du côté NOTE :** Une note peut être reçue par 0 à 1 liste de lecture (une note peut ne pas concerner de liste spécifique ou concerner une seule liste)

**Exemple concret :** Une liste publique "Mes coups de cœur 2024" peut recevoir plusieurs notes d'autres utilisateurs qui l'apprécient, tandis qu'une note peut être générale ou spécifiquement attribuée à cette liste.

### NOTE 0-1 < ATTRIBUER > 0-N LISTE_LECTURE

**Explication :**

- **Du côté NOTE :** Une note peut être attribuée à 0 à 1 liste de lecture (une note peut ne pas concerner de liste ou concerner une seule liste)
- **Du côté LISTE_LECTURE :** Une liste de lecture peut recevoir 0 à N notes (une liste peut ne pas avoir de note ou en avoir plusieurs)

**Exemple concret :** Une note "5 étoiles" peut être attribuée spécifiquement à la liste "Classiques français", tandis que cette liste peut recevoir plusieurs notes de différents utilisateurs.

### UTILISATEUR 0-N < RECEVOIR > 1-1 NOTE

**Explication :**

- **Du côté UTILISATEUR :** Un utilisateur peut recevoir 0 à N notes (un utilisateur peut ne pas recevoir de note sur son profil ou en recevoir plusieurs)
- **Du côté NOTE :** Une note est reçue par exactement 1 utilisateur (chaque note de profil concerne un utilisateur spécifique)

**Exemple concret :** Un utilisateur très actif peut recevoir plusieurs notes pour la qualité de ses avis et listes, et chaque note évalue spécifiquement ce profil utilisateur.

---

## Résumé des cardinalités

| Relation | Entité 1 | Cardinalité 1 | Relation | Cardinalité 2 | Entité 2 |
|----------|----------|---------------|----------|---------------|----------|
| DETENIR | PERMISSION | 0-N | ↔ | 0-N | ROLE |
| AVOIR | ROLE | 0-N | ↔ | 0-N | UTILISATEUR |
| POSSEDER | UTILISATEUR | 1-N | → | 1-1 | BIBLIOTHEQUE |
| INCLURE | BIBLIOTHEQUE | 0-N | → | 1-1 | LISTE_LECTURE |
| DISPOSER | BIBLIOTHEQUE | 0-N | ↔ | 0-N | LIVRE |
| CONTENIR | LISTE_LECTURE | 0-N | ↔ | 0-N | LIVRE |
| ECRIRE | LIVRE | 1-N | ↔ | 0-N | AUTEUR |
| APPARTIENT | LIVRE | 1-N | ↔ | 0-N | GENRE |
| REDIGER | UTILISATEUR | 0-N | → | 1-1 | AVIS |
| COMPORTER | AVIS | 1-1 | ↔ | 0-N | LIVRE |
| ATTRIBUER | UTILISATEUR | 0-N | → | 1-1 | NOTE |
| POSSEDER | NOTE | 0-1 | ↔ | 0-N | LIVRE |
| RECEVOIR | LISTE_LECTURE | 0-N | ← | 0-1 | NOTE |
| ATTRIBUER | NOTE | 0-1 | → | 0-N | LISTE_LECTURE |
| RECEVOIR | UTILISATEUR | 0-N | ← | 1-1 | NOTE |

**Légende :**

- `→` : Relation unidirectionnelle
- `↔` : Relation bidirectionnelle
- `←` : Relation inverse

---

## Notes importantes

1. **Contrainte métier** : Chaque utilisateur doit posséder au minimum une bibliothèque (cardinalité 1-N côté utilisateur)

2. **Unicité des appartenances** : Chaque bibliothèque et liste de lecture appartient à un seul utilisateur (cardinalités 1-1)

3. **Flexibilité des contenus** : Les livres peuvent être partagés entre plusieurs bibliothèques et listes (cardinalités 0-N)

4. **Système de notation flexible** : Les notes peuvent s'appliquer aux livres, aux listes de lecture ou aux profils utilisateurs avec des cardinalités différentes selon le contexte

5. **Traçabilité** : Chaque avis et note est rattachée à un utilisateur unique pour assurer la responsabilité du contenu

6. **Optionalité des évaluations** : Les notes sur les listes et livres sont optionnelles, permettant une grande flexibilité dans l'évaluation du contenu
