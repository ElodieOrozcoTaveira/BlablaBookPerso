# Cardinalités du MCD BlaBlaBook 📊

## 🔗 Relations et Cardinalités

| Relation | Entité 1 | Cardinalité 1 | Entité 2 | Cardinalité 2 | Signification Métier |
|----------|----------|---------------|----------|---------------|---------------------|
| **avoir** | UTILISATEUR | 0-N | ROLE | 0-N | Gestion flexible des rôles utilisateurs |
| **posséder** | ROLE | 0-N | PERMISSION | 0-N | Système de permissions modulaire |
| **gérer** | UTILISATEUR | 1-1 | BIBLIOTHEQUE | 0-N | Bibliothèque personnelle unique |
| **décrire** | LIVRE | 1-1 | BIBLIOTHEQUE | 0-N | Livre référencé dans plusieurs bibliothèques |
| **écrire** | UTILISATEUR | 1-1 | AVIS | 0-N | Propriété des avis pour modération |
| **concerner** | LIVRE | 1-1 | AVIS | 0-N | Avis spécifiques à un livre |
| **créer** | UTILISATEUR | 1-1 | LISTE_LECTURE | 0-N | Propriété des listes personnelles |
| **contenir** | LISTE_LECTURE | 0-N | LIVRE | 0-N | Flexibilité collections thématiques |
| **effectuer** | UTILISATEUR | 0-1 | AUDIT | 0-N | Traçabilité actions utilisateurs |

## 📋 Détails des Relations

### Relations d'Autorisation (RBAC)

#### avoir : 0N UTILISATEUR ↔ 0N ROLE

- **Lecture** : Un utilisateur peut avoir 0 à N rôles, un rôle peut être attribué à 0 à N utilisateurs
- **Justification** :
  - ✅ Un utilisateur peut n'avoir aucun rôle temporairement (compte en attente)
  - ✅ Un utilisateur peut avoir plusieurs rôles (USER + MODERATOR)
  - ✅ Un rôle peut n'être attribué à personne (rôle en préparation)
  - ✅ Un rôle peut être partagé par plusieurs utilisateurs

#### posséder : 0N ROLE ↔ 0N PERMISSION

- **Lecture** : Un rôle peut posséder 0 à N permissions, une permission peut appartenir à 0 à N rôles
- **Justification** :
  - ✅ Un rôle peut être créé sans permissions (configuration progressive)
  - ✅ Un rôle typique a plusieurs permissions (lecture, écriture, suppression)
  - ✅ Une permission peut n'être attribuée à aucun rôle (permission en préparation)
  - ✅ Une permission peut être partagée entre plusieurs rôles

### Relations Métier Bibliothèque

#### gérer : 1-1 UTILISATEUR ↔ 0N BIBLIOTHEQUE

- **Lecture** : Un utilisateur gère exactement 1 bibliothèque, une entrée bibliothèque appartient à 1 seul utilisateur
- **Justification** :
  - ✅ Chaque utilisateur a sa propre bibliothèque personnelle
  - ✅ Une entrée bibliothèque (statut, notes, evaluation, progression, dates) appartient à un seul utilisateur
  - ✅ Un utilisateur peut avoir 0 à N livres dans sa bibliothèque

#### décrire : 1-1 LIVRE ↔ 0N BIBLIOTHEQUE

- **Lecture** : Un livre peut être dans 0 à N bibliothèques personnelles, chaque entrée bibliothèque concerne 1 seul livre
- **Justification** :
  - ✅ Un livre peut n'être dans aucune bibliothèque personnelle
  - ✅ Un livre populaire peut être dans plusieurs bibliothèques utilisateurs
  - ✅ Chaque entrée BIBLIOTHEQUE fait référence à un seul livre

### Relations de Contenu

#### écrire : 1-1 UTILISATEUR ↔ 0N AVIS

- **Lecture** : Un utilisateur peut écrire 0 à N avis, chaque avis est écrit par 1 seul utilisateur
- **Justification** :
  - ✅ Un utilisateur peut ne jamais écrire d'avis
  - ✅ Un utilisateur actif peut écrire plusieurs avis sur différents livres
  - ✅ Chaque avis a un auteur unique pour la responsabilité et la modération

#### concerner : 1-1 LIVRE ↔ 0N AVIS

- **Lecture** : Un livre peut recevoir 0 à N avis, chaque avis concerne 1 seul livre
- **Justification** :
  - ✅ Un livre peut n'avoir aucun avis (nouveau livre)
  - ✅ Un livre populaire peut avoir de nombreux avis
  - ✅ Chaque avis porte sur un livre spécifique

### Relations de Collection

#### créer : 1-1 UTILISATEUR ↔ 0N LISTE_LECTURE

- **Lecture** : Un utilisateur peut créer 0 à N listes de lecture, chaque liste appartient à 1 seul utilisateur
- **Justification** :
  - ✅ Un utilisateur peut ne créer aucune liste (utilise seulement sa bibliothèque)
  - ✅ Un utilisateur organisé peut créer plusieurs listes thématiques
  - ✅ Chaque liste a un propriétaire unique pour la gestion des droits

#### contenir : 0N LISTE_LECTURE ↔ 0N LIVRE

- **Lecture** : Une liste peut contenir 0 à N livres, un livre peut être dans 0 à N listes
- **Justification** :
  - ✅ Une liste peut être vide (en préparation)
  - ✅ Une liste typique contient plusieurs livres
  - ✅ Un livre peut n'être dans aucune liste
  - ✅ Un livre populaire peut être dans plusieurs listes différentes

### Relations d'Audit

#### effectuer : 0-1 UTILISATEUR ↔ 0N AUDIT

- **Lecture** : Un utilisateur peut générer 0 à N entrées d'audit, chaque entrée d'audit peut être liée à 0 ou 1 utilisateur
- **Justification** :
  - ✅ Un utilisateur peut ne pas avoir d'actions tracées (nouveau compte)
  - ✅ Un utilisateur actif génère de nombreuses entrées d'audit
  - ✅ Une entrée d'audit peut ne pas être liée à un utilisateur (action système)
  - ✅ Une entrée d'audit est liée à au maximum 1 utilisateur

## 🎯 Règles de Gestion

### RG-CARD-01 : Bibliothèque Personnelle

- Chaque utilisateur a **exactement une** bibliothèque (cardinalité 1-1)
- Cette bibliothèque peut contenir **zéro ou plusieurs** livres
- **Implémentation** : La relation passe par BIBLIOTHEQUE avec attributs (statut, notes, evaluation, progression, date_ajout, date_modification)

### RG-CARD-02 : Propriété du Contenu

- Chaque avis, liste de lecture appartient à **un seul** utilisateur (cardinalité 1-1)
- **Justification** : Responsabilité légale et modération
- **Exception** : Possibilité future de listes collaboratives (cardinalité N-N)

### RG-CARD-03 : Flexibilité RBAC

- Relations **Many-to-Many** pour UTILISATEUR-ROLE et ROLE-PERMISSION
- **Avantage** : Évolutivité du système de permissions
- **Contrainte** : Un utilisateur doit avoir au moins un rôle (règle applicative)

### RG-CARD-04 : Audit Partiel

- Cardinalité **0-1** pour UTILISATEUR dans l'audit
- **Raison** : Actions système sans utilisateur spécifique
- **Exemples** : Maintenance automatique, imports de données
