-- =====================================================
-- BLABLABOOK - SCHEMA DE BASE DE DONNEES V2.5
-- =====================================================
-- Version: 2.5 - Synchronise avec modeles Sequelize
-- Base sur: Modeles Sequelize backend/src/models/
-- SGBD: PostgreSQL
-- Hachage mot de passe: Argon2 (recommande)
-- Fonctionnalites: Import temporaire Open Library
-- =====================================================

BEGIN;

-- Suppression des vues d'abord (dependances)
DROP VIEW IF EXISTS v_active_users;
DROP VIEW IF EXISTS v_books_complete;


-- Suppression des tables dans l'ordre inverse des dependances (sans CASCADE pour securite)
-- Tables de liaison (aucune dependance vers elles)
DROP TABLE IF EXISTS USER_ROLE;
DROP TABLE IF EXISTS ROLE_PERMISSION;
DROP TABLE IF EXISTS BOOK_AUTHOR;
DROP TABLE IF EXISTS BOOK_GENRE;

-- Tables dependantes (ont des FK vers d'autres tables)
DROP TABLE IF EXISTS READING_LIST;     -- FK vers LIBRARY + BOOK
DROP TABLE IF EXISTS RATE;             -- FK vers USER + BOOK
DROP TABLE IF EXISTS NOTICE;           -- FK vers USER + BOOK

-- Tables intermediaires
DROP TABLE IF EXISTS LIBRARY;          -- FK vers USER

-- Tables principales (referencees par d'autres)
DROP TABLE IF EXISTS BOOK;             -- Reference par BOOK_AUTHOR, BOOK_GENRE, RATE, NOTICE, READING_LIST
DROP TABLE IF EXISTS AUTHOR;           -- Reference par BOOK_AUTHOR
DROP TABLE IF EXISTS GENRE;            -- Reference par BOOK_GENRE
DROP TABLE IF EXISTS PERMISSION;       -- Reference par ROLE_PERMISSION
DROP TABLE IF EXISTS ROLE;             -- Reference par USER_ROLE, ROLE_PERMISSION
DROP TABLE IF EXISTS "USER";           -- Reference par LIBRARY, RATE, NOTICE, USER_ROLE

-- Suppression des anciennes tables qui pourraient exister (V1)
DROP TABLE IF EXISTS BOOK_LIBRARY;
DROP TABLE IF EXISTS BOOK_IN_LIST;

-- =====================================================
-- 1. SYSTEME D'AUTHENTIFICATION ET AUTORISATION
-- =====================================================

-- Table des utilisateurs (adaptee du modele User.ts)
CREATE TABLE "USER" (
    id_user SERIAL PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,        -- Adapte: 50 vs 100 dans ancien schema
    lastname VARCHAR(50) NOT NULL,         -- Adapte: 50 vs 100 dans ancien schema
    username VARCHAR(30) NOT NULL UNIQUE, -- Adapte: 30 vs 50 dans ancien schema
    email VARCHAR(100) NOT NULL UNIQUE,    -- Adapte: 100 vs 255 dans ancien schema
    password VARCHAR(255) NOT NULL,        -- Hash Argon2 du mot de passe
    avatar_url TEXT NULL,                  -- Avatar utilisateur
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL              -- Soft delete - NULL si actif
);

-- Table des roles (adaptee du modele Role.ts)
CREATE TABLE "ROLE" (
    id_role SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- Pas d'updated_at selon le modele
);

-- Table des permissions (adaptee du modele Permission.ts)
CREATE TABLE "PERMISSION" (
    id_permission SERIAL PRIMARY KEY,
    label VARCHAR(50) NOT NULL UNIQUE,
    action TEXT NULL                       -- Description de l'action autorisee
    -- Pas de timestamps selon le modele
);

-- =====================================================
-- 2. GESTION DES CONTENUS LITTERAIRES
-- =====================================================

-- Table des auteurs (adaptee du modele Author.ts + Open Library)
CREATE TABLE "AUTHOR" (
    id_author SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,            -- Un seul champ nom (personal_name d'Open Library)
    bio TEXT NULL,                         -- MODIFIe: "bio" comme dans Open Library (pas "biography")
    birth_date DATE NULL,                  -- MODIFIe: Date complete au lieu de birth_year
    death_date DATE NULL,                  -- MODIFIe: Date complete au lieu de death_year
    avatar_url TEXT NULL,                  -- Avatar auteur depuis Open Library
    needs_enrichment BOOLEAN DEFAULT TRUE, -- Flag pour forcer enrichissement depuis Open Library
    open_library_key VARCHAR(50) NULL UNIQUE, -- Cle Open Library pour import automatique
    -- Nouveaux champs pour gestion import temporaire
    import_status VARCHAR(20) DEFAULT 'confirmed' CHECK (import_status IN ('temporary', 'confirmed')),
    imported_by INT NULL REFERENCES "USER"(id_user),
    imported_at TIMESTAMP NULL,
    imported_reason VARCHAR(20) NULL CHECK (imported_reason IN ('author_search', 'book_import', 'user_interest')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- CONTRAINTE CHECK: Verifie que la date de deces est posterieure a la naissance
    -- Accepte: auteur vivant (death_date NULL), naissance inconnue, ou deces >= naissance
    CHECK (death_date IS NULL OR birth_date IS NULL OR death_date >= birth_date)
);

-- Table des genres (adaptee du modele Genre.ts)
CREATE TABLE "GENRE" (
    id_genre SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,      -- Adapte: 50 vs 100 dans ancien schema
    description TEXT NULL,                 -- Nouveau champ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des livres (adaptee du modele Book.ts + Open Library)
CREATE TABLE "BOOK" (
    id_book SERIAL PRIMARY KEY,
    isbn VARCHAR(13) NULL UNIQUE,          -- MODIFIe: NULL car souvent absent dans Open Library
    title TEXT NOT NULL,                   -- TEXT pour supporter les titres longs
    description TEXT NULL,                 -- Renomme de 'summary', souvent absent dans Open Library
    -- CONTRAINTE CHECK: Annee de publication entre -3000 (premiers ecrits) et annee suivante
    publication_year INT NULL CHECK (publication_year >= -3000 AND publication_year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
    -- CONTRAINTE CHECK: Accepte NULL (Open Library sans info) OU nombre > 0 (livre valide)
    -- Rejette: 0 pages (impossible) et nombres negatifs (absurde)
    page_count INT NULL CHECK (page_count IS NULL OR page_count > 0), -- Renomme de 'nb_pages'
    language VARCHAR(10) NULL DEFAULT 'en', -- MODIFIe: 'en' par defaut (Open Library = 'eng')
    cover_url VARCHAR(500) NULL,           -- Nouveau champ
    cover_local VARCHAR(255) NULL,         -- Nouveau champ
    open_library_key VARCHAR(100) NULL UNIQUE, -- Nouveau champ - IMPORTANT pour import
    -- Nouveaux champs pour gestion import temporaire
    import_status VARCHAR(20) DEFAULT 'confirmed' CHECK (import_status IN ('temporary', 'confirmed')),
    imported_by INT NULL REFERENCES "USER"(id_user),
    imported_at TIMESTAMP NULL,
    imported_reason VARCHAR(20) NULL CHECK (imported_reason IN ('rate', 'review', 'library', 'search')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. BIBLIOTHEQUES ET LISTES PERSONNELLES
-- =====================================================

-- Table des bibliotheques (adaptee du modele Library.ts)
CREATE TABLE "LIBRARY" (
    id_library SERIAL PRIMARY KEY,
    id_user INT NOT NULL,
    name VARCHAR(100) NOT NULL,            -- Adapte: 100 vs 200 dans ancien schema, sans UNIQUE
    description TEXT NULL,                 -- Nouveau champ
    is_public BOOLEAN NOT NULL DEFAULT FALSE, -- Nouveau champ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL              -- Soft delete - NULL si active
);

-- Table des listes de lecture (adaptee du modele ReadingList.ts)
-- ATTENTION: Structure completement differente - devient une table de liaison
CREATE TABLE "READING_LIST"(
    id_reading_list SERIAL PRIMARY KEY,
    id_library INT NOT NULL,
    id_book INT NOT NULL,
    -- CONTRAINTE CHECK: Statut de lecture limite aux valeurs valides uniquement
    -- Empeche les erreurs de saisie et garantit la coherence des donnees
    reading_status VARCHAR(20) NOT NULL DEFAULT 'to_read' 
        CHECK (reading_status IN ('to_read', 'reading', 'read', 'abandoned')),
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    finished_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_library, id_book)           -- Un livre ne peut etre qu'une fois dans une bibliotheque
);

-- =====================================================
-- 4. EVALUATIONS ET CRITIQUES
-- =====================================================

-- Table des avis (adaptee du modele Notice.ts)
CREATE TABLE "NOTICE" (
    id_notice SERIAL PRIMARY KEY,
    id_user INT NOT NULL,
    id_book INT NOT NULL,
    title VARCHAR(100) NULL,               -- Nouveau champ  a implementer pour V.x
    content TEXT NOT NULL,                 -- Renomme de 'comment', avec validation longueur
    is_spoiler BOOLEAN NOT NULL DEFAULT FALSE, -- Nouveau champ a implementer pour V.x
    is_public BOOLEAN NOT NULL DEFAULT TRUE,   -- Nouveau champ a implementer pour V.x
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- CONTRAINTE CHECK: Avis entre 10 et 2000 caracteres pour qualite des critiques
    -- Empeche les avis trop courts (spam) et trop longs (lisibilite)
    CHECK (char_length(content) >= 10 AND char_length(content) <= 2000) -- Validation longueur
);

-- Table des notes (adaptee du modele Rate.ts)
CREATE TABLE "RATE" (
    id_rate SERIAL PRIMARY KEY,
    id_user INT NOT NULL,
    id_book INT NOT NULL,
    -- CONTRAINTE CHECK: Note entre 1 et 5 etoiles (systeme classique de notation)
    -- Empeche les notes impossibles (0, negatif, >5) et garantit coherence UI
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5), -- Renomme de 'rate'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_user, id_book)              -- Un utilisateur ne peut noter qu'une fois un livre
);

-- =====================================================
-- 5. TABLES DE LIAISON (MANY-TO-MANY)
-- =====================================================

-- Liaison utilisateurs-roles (adaptee du modele UserRole.ts)
CREATE TABLE "USER_ROLE" (
    id_user_role SERIAL PRIMARY KEY,
    id_user INT NOT NULL,
    id_role INT NOT NULL,
    UNIQUE (id_user, id_role)
    -- Pas de timestamps selon le modele
);

-- Liaison roles-permissions (adaptee du modele RolePermission.ts)
CREATE TABLE "ROLE_PERMISSION" (
    id_role_permission SERIAL PRIMARY KEY,  -- Renomme de id_permission_role pour coherence
    id_role INT NOT NULL,
    id_permission INT NOT NULL,
    UNIQUE (id_role, id_permission)
    -- Pas de timestamps selon le modele
);

-- Liaison livres-auteurs (adaptee du modele BookAuthor.ts)
CREATE TABLE "BOOK_AUTHOR" (
    id_book_author SERIAL PRIMARY KEY,
    id_book INT NOT NULL,
    id_author INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Pas d'updated_at selon le modele
    UNIQUE (id_book, id_author)
);

-- Liaison livres-genres (adaptee du modele BookGenre.ts)
CREATE TABLE "BOOK_GENRE" (
    id_book_genre SERIAL PRIMARY KEY,
    id_book INT NOT NULL,
    id_genre INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Pas d'updated_at selon le modele
    UNIQUE (id_book, id_genre)
);

-- =====================================================
-- 6. CONTRAINTES D'INTEGRITE REFERENTIELLE
-- =====================================================

-- Contraintes pour LIBRARY
ALTER TABLE "LIBRARY" 
ADD CONSTRAINT fk_library_user 
FOREIGN KEY (id_user) REFERENCES "USER"(id_user) ON DELETE CASCADE;

-- Contraintes pour READING_LIST
ALTER TABLE "READING_LIST" 
ADD CONSTRAINT fk_reading_list_library 
FOREIGN KEY (id_library) REFERENCES "LIBRARY"(id_library) ON DELETE CASCADE,
ADD CONSTRAINT fk_reading_list_book 
FOREIGN KEY (id_book) REFERENCES "BOOK"(id_book) ON DELETE CASCADE;

-- Contraintes pour NOTICE
ALTER TABLE "NOTICE" 
ADD CONSTRAINT fk_notice_user 
FOREIGN KEY (id_user) REFERENCES "USER"(id_user) ON DELETE CASCADE,
ADD CONSTRAINT fk_notice_book 
FOREIGN KEY (id_book) REFERENCES "BOOK"(id_book) ON DELETE RESTRICT;

-- Contraintes pour RATE
ALTER TABLE "RATE" 
ADD CONSTRAINT fk_rate_user 
FOREIGN KEY (id_user) REFERENCES "USER"(id_user) ON DELETE CASCADE,
ADD CONSTRAINT fk_rate_book 
FOREIGN KEY (id_book) REFERENCES "BOOK"(id_book) ON DELETE RESTRICT;

-- Contraintes pour USER_ROLE
ALTER TABLE "USER_ROLE" 
ADD CONSTRAINT fk_user_role_user 
FOREIGN KEY (id_user) REFERENCES "USER"(id_user) ON DELETE CASCADE,
ADD CONSTRAINT fk_user_role_role 
FOREIGN KEY (id_role) REFERENCES "ROLE"(id_role) ON DELETE CASCADE;

-- Contraintes pour ROLE_PERMISSION
ALTER TABLE "ROLE_PERMISSION" 
ADD CONSTRAINT fk_role_permission_role 
FOREIGN KEY (id_role) REFERENCES "ROLE"(id_role) ON DELETE CASCADE,
ADD CONSTRAINT fk_role_permission_permission 
FOREIGN KEY (id_permission) REFERENCES "PERMISSION"(id_permission) ON DELETE CASCADE;

-- Contraintes pour BOOK_AUTHOR
ALTER TABLE "BOOK_AUTHOR" 
ADD CONSTRAINT fk_book_author_book 
FOREIGN KEY (id_book) REFERENCES "BOOK"(id_book) ON DELETE CASCADE,
ADD CONSTRAINT fk_book_author_author 
FOREIGN KEY (id_author) REFERENCES "AUTHOR"(id_author) ON DELETE CASCADE;

-- Contraintes pour BOOK_GENRE
ALTER TABLE "BOOK_GENRE" 
ADD CONSTRAINT fk_book_genre_book 
FOREIGN KEY (id_book) REFERENCES "BOOK"(id_book) ON DELETE CASCADE,
ADD CONSTRAINT fk_book_genre_genre 
FOREIGN KEY (id_genre) REFERENCES "GENRE"(id_genre) ON DELETE CASCADE;

-- =====================================================
-- 7. INDEX POUR LES PERFORMANCES
-- =====================================================

-- Index sur les cles etrangeres les plus utilisees
CREATE INDEX idx_library_user ON "LIBRARY"(id_user);
CREATE INDEX idx_reading_list_library ON "READING_LIST"(id_library);
CREATE INDEX idx_reading_list_book ON "READING_LIST"(id_book);
CREATE INDEX idx_notice_user ON "NOTICE"(id_user);
CREATE INDEX idx_notice_book ON "NOTICE"(id_book);
CREATE INDEX idx_rate_user ON "RATE"(id_user);
CREATE INDEX idx_rate_book ON "RATE"(id_book);

-- Index pour les recherches frequentes
CREATE INDEX idx_book_title ON "BOOK"(title);
CREATE INDEX idx_book_isbn ON "BOOK"(isbn);
CREATE INDEX idx_user_username ON "USER"(username);
CREATE INDEX idx_user_email ON "USER"(email);
CREATE INDEX idx_author_name ON "AUTHOR"(name);
CREATE INDEX idx_genre_name ON "GENRE"(name);

-- Index composites pour les jointures
CREATE INDEX idx_book_author_composite ON "BOOK_AUTHOR"(id_book, id_author);
CREATE INDEX idx_book_genre_composite ON "BOOK_GENRE"(id_book, id_genre);
CREATE INDEX idx_user_role_composite ON "USER_ROLE"(id_user, id_role);
CREATE INDEX idx_role_permission_composite ON "ROLE_PERMISSION"(id_role, id_permission);

-- Index pour le soft delete
CREATE INDEX idx_user_active ON "USER"(id_user) WHERE deleted_at IS NULL;
CREATE INDEX idx_library_active ON "LIBRARY"(id_library) WHERE deleted_at IS NULL;

-- Index pour les dates et statuts
CREATE INDEX idx_notice_created ON "NOTICE"(created_at);
CREATE INDEX idx_rate_created ON "RATE"(created_at);
CREATE INDEX idx_user_created ON "USER"(created_at);
CREATE INDEX idx_reading_status ON "READING_LIST"(reading_status);

-- Index pour la gestion des imports temporaires
CREATE INDEX idx_book_import_status ON "BOOK"(import_status);
CREATE INDEX idx_book_imported_at ON "BOOK"(imported_at);
CREATE INDEX idx_author_import_status ON "AUTHOR"(import_status);
CREATE INDEX idx_author_open_library_key ON "AUTHOR"(open_library_key);
CREATE INDEX idx_book_open_library_key ON "BOOK"(open_library_key);

-- =====================================================
-- 8. TRIGGERS POUR LA MAINTENANCE AUTOMATIQUE
-- =====================================================

-- Fonction pour mettre a jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- TRIGGER = "Declencheur" = Code qui s'execute automatiquement quand  quelque chose arrive dans la base.(dans notre cas, ca cree un update automatique de la colonne updated_at)
-- Triggers pour les tables avec updated_at
CREATE TRIGGER tr_author_updated_at
    BEFORE UPDATE ON "AUTHOR"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_genre_updated_at
    BEFORE UPDATE ON "GENRE"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_book_updated_at
    BEFORE UPDATE ON "BOOK"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_library_updated_at
    BEFORE UPDATE ON "LIBRARY"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_reading_list_updated_at
    BEFORE UPDATE ON "READING_LIST"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_notice_updated_at
    BEFORE UPDATE ON "NOTICE"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_rate_updated_at
    BEFORE UPDATE ON "RATE"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. DONNEES D'INITIALISATION
-- =====================================================

-- Insertion des roles par defaut (MVP - V1)
INSERT INTO "ROLE" (name, description) VALUES
('admin', 'Administrateur systeme avec tous les droits'),
('user', 'Utilisateur standard');
-- Roles pour versions futures (V.x) :
-- ('moderator', 'Moderateur pouvant gerer le contenu'),  
-- ('premium', 'Utilisateur premium avec fonctionnalites avancees');

-- Insertion des permissions de base
INSERT INTO "PERMISSION" (label, action) VALUES
('CREATE', 'Creer du contenu'),
('READ', 'Lire le contenu'),
('UPDATE', 'Modifier le contenu'),
('DELETE', 'Supprimer le contenu'),
('MODERATE', 'Moderer le contenu'),
('ADMIN', 'Administration systeme'),
('EXPORT', 'Exporter des donnees'),
('IMPORT', 'Importer des donnees');

-- Attribution des permissions aux roles (MVP - V1)
INSERT INTO "ROLE_PERMISSION" (id_role, id_permission) VALUES
-- Admin : toutes les permissions
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8),
-- User : creation, lecture, modification (ses propres contenus)
(2, 1), (2, 2), (2, 3);

-- Permissions pour versions futures (V.x) :
-- Moderator : creation, lecture, modification, moderation
-- (3, 1), (3, 2), (3, 3), (3, 5),
-- Premium : creation, lecture, modification, export
-- (4, 1), (4, 2), (4, 3), (4, 7);

-- Les genres seront crees automatiquement lors des imports Open Library
-- Cela permet une base de genres dynamique et exhaustive directement depuis la source
-- Plus de 200+ genres possibles : Fantasy, Magic, Wizardry, England, Friendship, etc.

-- =====================================================
-- 10. VUES UTILES POUR L'APPLICATION (Adaptees)
-- =====================================================

-- Vue des utilisateurs actifs avec leurs roles (adaptee)
CREATE VIEW "v_active_users" AS
SELECT 
    u.id_user,
    u.username,
    u.email,
    u.firstname,
    u.lastname,
    u.created_at,
    STRING_AGG(r.name, ',') as roles
FROM "USER" u
LEFT JOIN "USER_ROLE" ur ON u.id_user = ur.id_user
LEFT JOIN "ROLE" r ON ur.id_role = r.id_role
WHERE u.deleted_at IS NULL
GROUP BY u.id_user;

-- Vue des livres avec auteurs et genres (adaptee)
CREATE VIEW "v_books_complete" AS
SELECT 
    b.id_book,
    b.isbn,
    b.title,
    b.description,        -- Adapte: etait summary
    b.page_count,         -- Adapte: etait nb_pages
    b.publication_year,   -- Adapte: etait published_at
    b.language,           -- Nouveau champ adapte pour OL
    b.cover_url,          -- Nouveau champ adapte pour OL
    b.cover_local,        -- Nouveau champ adapte pour OL
    b.open_library_key,   -- Nouveau champ adapte pour OL
    STRING_AGG(DISTINCT a.name, ',') as authors, -- Adapte: etait firstname + lastname
    STRING_AGG(DISTINCT g.name, ',') as genres,
    AVG(r.rating) as average_rating,             -- Adapte: etait rate
    COUNT(DISTINCT r.id_rate) as rating_count,
    COUNT(DISTINCT n.id_notice) as review_count
FROM "BOOK" b
LEFT JOIN "BOOK_AUTHOR" ba ON b.id_book = ba.id_book
LEFT JOIN "AUTHOR" a ON ba.id_author = a.id_author
LEFT JOIN "BOOK_GENRE" bg ON b.id_book = bg.id_book
LEFT JOIN "GENRE" g ON bg.id_genre = g.id_genre
LEFT JOIN "RATE" r ON b.id_book = r.id_book
LEFT JOIN "NOTICE" n ON b.id_book = n.id_book
GROUP BY b.id_book;

COMMIT;

-- =====================================================
-- NOTES D'IMPLEMENTATION V2.5
-- =====================================================

/*
CHANGEMENTS MAJEURS PAR RAPPORT a LA V1 :

STRUCTURE :
- USER : Ajout de l'avatar_url pour les profils utilisateur, gestion du soft delete, unicite sur email et username, timestamps automatiques.
- AUTHOR : Fusion des champs prenom/nom en un seul champ 'name', ajout bio, birth_date, death_date, avatar_url, gestion d'enrichissement et import Open Library, tracabilite des imports.
- BOOK : Renommage des champs (summary->description, nb_pages->page_count, published_at->publication_year), ajout language, cover_url, cover_local, open_library_key, gestion des imports temporaires, tracabilite.
- LIBRARY : Ajout du champ is_public pour la visibilite, description, nom limite a 100 caracteres, gestion du soft delete.
- READING_LIST : Table de liaison entre bibliotheque et livre, ajout du statut de lecture, timestamps, unicite par bibliotheque/livre.
- NOTICE : Renommage comment->content, ajout title, is_spoiler, is_public, validation de la longueur du contenu.
- RATE : Renommage rate->rating, suppression de l'id de liste de lecture, validation stricte de la note.
- Suppression des anciennes tables BOOK_LIBRARY et BOOK_IN_LIST (remplacees par READING_LIST).

GESTION IMPORTS TEMPORAIRES :
- Systeme d'import intelligent depuis Open Library : auteurs et livres importes temporairement puis confirmes lors d'action utilisateur.
- Nettoyage automatique des imports non confirmes.
- Tracabilite complete des imports : qui, quand, pourquoi, statut.

SECURITE :
- Utilisation d'Argon2 pour hasher les mots de passe cote application (stockage securise, resistant aux attaques par force brute).
- Validation des emails cote application avec Zod (schemas TypeScript, controle du format et unicite en base).
- Gestion de l'authentification via des sessions stockees dans Redis (scalabilite, centralisation, expiration automatique).
- Protection de toutes les communications par des connexions securisees (SSL/TLS) entre client, backend et base de donnees.

PERFORMANCE :
- Utilisation des index crees pour optimiser les requetes (sur les cles etrangeres, champs de recherche, statuts, dates).
- Surveillance des requetes lentes avec EXPLAIN et ajustement des index si besoin.
- Consideration du partitionnement pour les grandes tables et la gestion des imports massifs.

MAINTENANCE :
- Implementation d'une purge periodique des donnees soft-deleted pour garder la base propre.
- Surveillance de la croissance de la base de donnees et l'utilisation des index.
- Sauvegarde reguliere de la base et tests de restauration.
*/