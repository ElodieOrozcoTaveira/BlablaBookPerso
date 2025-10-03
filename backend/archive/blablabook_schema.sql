-- =====================================================
-- BLABLABOOK - SCHEMA DE BASE DE DONNeES
-- =====================================================
-- Version: 2.0
-- Base sur: MPD V2 (blablabook-mpd-V2.drawio)
-- SGBD: PostgreSQL
-- Hachage mot de passe: Argon2 (recommande)
-- =====================================================

BEGIN;

-- Suppression des vues d'abord (dépendances)
DROP VIEW IF EXISTS v_active_users;
DROP VIEW IF EXISTS v_books_complete;

-- Suppression des tables si elles existent (ordre inverse des dependances)
DROP TABLE IF EXISTS BOOK_IN_LIST;
DROP TABLE IF EXISTS BOOK_LIBRARY;
DROP TABLE IF EXISTS BOOK_AUTHOR;
DROP TABLE IF EXISTS BOOK_GENRE;
DROP TABLE IF EXISTS RATE;
DROP TABLE IF EXISTS NOTICE;
DROP TABLE IF EXISTS USER_ROLE;
DROP TABLE IF EXISTS ROLE_PERMISSION;
DROP TABLE IF EXISTS READING_LIST;
DROP TABLE IF EXISTS LIBRARY;
DROP TABLE IF EXISTS BOOK;
DROP TABLE IF EXISTS AUTHOR;
DROP TABLE IF EXISTS GENRE;
DROP TABLE IF EXISTS PERMISSION;
DROP TABLE IF EXISTS ROLE;
DROP TABLE IF EXISTS "USER";

-- =====================================================
-- 1. SYSTEME D'AUTHENTIFICATION ET AUTORISATION
-- =====================================================

-- Table des utilisateurs
CREATE TABLE "USER" (
    id_user SERIAL PRIMARY KEY,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL, -- Hash Argon2 du mot de passe
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL -- Soft delete - NULL si actif
); -- Comptes utilisateurs avec authentification Argon2

-- Table des roles
CREATE TABLE "ROLE" (
    id_role SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); -- Roles du systeme RBAC

-- Table des permissions
CREATE TABLE "PERMISSION" (
    id_permission SERIAL PRIMARY KEY,
    label VARCHAR(50) NOT NULL UNIQUE,
    action TEXT NULL -- Description de l action autorisee
); -- Permissions granulaires du systeme

-- =====================================================
-- 2. GESTION DES CONTENUS LITTERAIRES
-- =====================================================

-- Table des auteurs
CREATE TABLE "AUTHOR" (
    id_author SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL, -- Nom complet de l'auteur
    bio TEXT NULL, -- Biographie de l'auteur
    birth_date DATE NULL, -- Date de naissance
    death_date DATE NULL, -- Date de décès (si applicable)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); -- Repertoire des auteurs de livres

-- Table des genres
CREATE TABLE "GENRE" (
    id_genre SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL, -- Description du genre
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); -- Classification des genres litteraires

-- Table des livres
CREATE TABLE "BOOK" (
    id_book SERIAL PRIMARY KEY,
    isbn VARCHAR(20) NULL UNIQUE, -- Code ISBN-10 ou ISBN-13
    title VARCHAR(500) NOT NULL,
    description TEXT NULL, -- Description du livre
    publication_year INT NULL CHECK (publication_year > 0),
    page_count INT NULL CHECK (page_count > 0),
    language VARCHAR(50) NULL,
    cover_url VARCHAR(500) NULL,
    cover_local VARCHAR(500) NULL,
    open_library_key VARCHAR(50) NULL UNIQUE,
    published_at DATE NULL
); -- Catalogue des livres de l application

-- =====================================================
-- 3. BIBLIOTHeQUES ET LISTES PERSONNELLES
-- =====================================================

-- Table des bibliotheques
CREATE TABLE LIBRARY (
    id_library SERIAL PRIMARY KEY,
    id_user INT NOT NULL,
    name VARCHAR(200) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL -- Soft delete - NULL si active
); -- Bibliotheques personnelles des utilisateurs

-- Table des listes de lecture
CREATE TABLE READING_LIST (
    id_reading_list SERIAL PRIMARY KEY,
    id_library INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT NULL,
    genre VARCHAR(100) NULL, -- Categorie thematique de la liste
    statut BOOLEAN NOT NULL DEFAULT TRUE, -- TRUE=active, FALSE=inactive
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL -- Soft delete - NULL si active
); -- Listes de lecture thematiques

-- =====================================================
-- 4. EVALUATIONS ET CRITIQUES
-- =====================================================

-- Table des avis
CREATE TABLE NOTICE (
    id_notice SERIAL PRIMARY KEY,
    id_user INT NOT NULL,
    id_book INT NOT NULL,
    comment TEXT NOT NULL,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
); -- Avis et critiques des utilisateurs sur les livres

-- Table des notes
CREATE TABLE RATE (
    id_rate SERIAL PRIMARY KEY,
    id_user INT NOT NULL,
    id_book INT NOT NULL,
    id_reading_list INT NULL, -- Note optionnelle sur une liste
    rate INT NOT NULL CHECK (rate >= 1 AND rate <= 5), -- Note de 1 a 5 etoiles
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL
); -- Systeme de notation 1-5 etoiles

-- =====================================================
-- 5. TABLES DE LIAISON (MANY-TO-MANY)
-- =====================================================

-- Liaison utilisateurs-roles (systeme RBAC)
CREATE TABLE USER_ROLE (
    id_user_role SERIAL PRIMARY KEY,
    id_user INT NOT NULL,
    id_role INT NOT NULL,
    UNIQUE (id_user, id_role)
); -- Attribution des roles aux utilisateurs

-- Liaison roles-permissions (systeme RBAC)
CREATE TABLE ROLE_PERMISSION (
    id_permission_role SERIAL PRIMARY KEY,
    id_role INT NOT NULL,
    id_permission INT NOT NULL,
    UNIQUE (id_role, id_permission)
); -- Permissions attribuees aux roles

-- Liaison livres-bibliotheques
CREATE TABLE BOOK_LIBRARY (
    id_book_library SERIAL PRIMARY KEY,
    id_library INT NOT NULL,
    id_book INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_library, id_book)
); -- Livres presents dans les bibliotheques

-- Liaison livres-listes de lecture
CREATE TABLE BOOK_IN_LIST (
    id_book_in_list SERIAL PRIMARY KEY,
    id_reading_list INT NOT NULL,
    id_book INT NOT NULL,
    UNIQUE (id_reading_list, id_book)
); -- Livres presents dans les listes de lecture

-- Liaison livres-auteurs
CREATE TABLE BOOK_AUTHOR (
    id_book_author SERIAL PRIMARY KEY,
    id_book INT NOT NULL,
    id_author INT NOT NULL,
    UNIQUE (id_book, id_author)
); -- Auteurs des livres (relation N:N)

-- Liaison livres-genres
CREATE TABLE BOOK_GENRE (
    id_book_genre SERIAL PRIMARY KEY,
    id_book INT NOT NULL,
    id_genre INT NOT NULL,
    UNIQUE (id_book, id_genre)
); -- Genres des livres (relation N:N)

-- =====================================================
-- 6. CONTRAINTES D'INTEGRITE REFERENTIELLE
-- =====================================================

-- Contraintes pour LIBRARY
ALTER TABLE LIBRARY 
ADD CONSTRAINT fk_library_user 
FOREIGN KEY (id_user) REFERENCES "USER"(id_user) ON DELETE CASCADE;

-- Contraintes pour READING_LIST
ALTER TABLE READING_LIST 
ADD CONSTRAINT fk_reading_list_library 
FOREIGN KEY (id_library) REFERENCES LIBRARY(id_library) ON DELETE CASCADE;

-- Contraintes pour NOTICE
ALTER TABLE NOTICE 
ADD CONSTRAINT fk_notice_user 
FOREIGN KEY (id_user) REFERENCES "USER"(id_user) ON DELETE CASCADE,
ADD CONSTRAINT fk_notice_book 
FOREIGN KEY (id_book) REFERENCES BOOK(id_book) ON DELETE RESTRICT;

-- Contraintes pour RATE
ALTER TABLE RATE 
ADD CONSTRAINT fk_rate_user 
FOREIGN KEY (id_user) REFERENCES "USER"(id_user) ON DELETE CASCADE,
ADD CONSTRAINT fk_rate_book 
FOREIGN KEY (id_book) REFERENCES BOOK(id_book) ON DELETE RESTRICT,
ADD CONSTRAINT fk_rate_reading_list 
FOREIGN KEY (id_reading_list) REFERENCES READING_LIST(id_reading_list) ON DELETE SET NULL;

-- Contraintes pour USER_ROLE
ALTER TABLE USER_ROLE 
ADD CONSTRAINT fk_user_role_user 
FOREIGN KEY (id_user) REFERENCES "USER"(id_user) ON DELETE CASCADE,
ADD CONSTRAINT fk_user_role_role 
FOREIGN KEY (id_role) REFERENCES ROLE(id_role) ON DELETE CASCADE;

-- Contraintes pour ROLE_PERMISSION
ALTER TABLE ROLE_PERMISSION 
ADD CONSTRAINT fk_role_permission_role 
FOREIGN KEY (id_role) REFERENCES ROLE(id_role) ON DELETE CASCADE,
ADD CONSTRAINT fk_role_permission_permission 
FOREIGN KEY (id_permission) REFERENCES PERMISSION(id_permission) ON DELETE CASCADE;

-- Contraintes pour BOOK_LIBRARY
ALTER TABLE BOOK_LIBRARY 
ADD CONSTRAINT fk_book_library_library 
FOREIGN KEY (id_library) REFERENCES LIBRARY(id_library) ON DELETE CASCADE,
ADD CONSTRAINT fk_book_library_book 
FOREIGN KEY (id_book) REFERENCES BOOK(id_book) ON DELETE CASCADE;

-- Contraintes pour BOOK_IN_LIST
ALTER TABLE BOOK_IN_LIST 
ADD CONSTRAINT fk_book_in_list_reading_list 
FOREIGN KEY (id_reading_list) REFERENCES READING_LIST(id_reading_list) ON DELETE CASCADE,
ADD CONSTRAINT fk_book_in_list_book 
FOREIGN KEY (id_book) REFERENCES BOOK(id_book) ON DELETE CASCADE;

-- Contraintes pour BOOK_AUTHOR
ALTER TABLE BOOK_AUTHOR 
ADD CONSTRAINT fk_book_author_book 
FOREIGN KEY (id_book) REFERENCES BOOK(id_book) ON DELETE CASCADE,
ADD CONSTRAINT fk_book_author_author 
FOREIGN KEY (id_author) REFERENCES AUTHOR(id_author) ON DELETE CASCADE;

-- Contraintes pour BOOK_GENRE
ALTER TABLE BOOK_GENRE 
ADD CONSTRAINT fk_book_genre_book 
FOREIGN KEY (id_book) REFERENCES BOOK(id_book) ON DELETE CASCADE,
ADD CONSTRAINT fk_book_genre_genre 
FOREIGN KEY (id_genre) REFERENCES GENRE(id_genre) ON DELETE CASCADE;

-- =====================================================
-- 7. INDEX POUR LES PERFORMANCES
-- =====================================================

-- Index sur les cles etrangeres les plus utilisees
CREATE INDEX idx_library_user ON LIBRARY(id_user);
CREATE INDEX idx_reading_list_library ON READING_LIST(id_library);
CREATE INDEX idx_notice_user ON NOTICE(id_user);
CREATE INDEX idx_notice_book ON NOTICE(id_book);
CREATE INDEX idx_rate_user ON RATE(id_user);
CREATE INDEX idx_rate_book ON RATE(id_book);
CREATE INDEX idx_rate_reading_list ON RATE(id_reading_list);

-- Index pour les recherches frequentes
CREATE INDEX idx_book_title ON BOOK(title);
CREATE INDEX idx_book_isbn ON BOOK(isbn);
CREATE INDEX idx_user_username ON "USER"(username);
CREATE INDEX idx_user_email ON "USER"(email);
CREATE INDEX idx_author_lastname ON AUTHOR(lastname);
CREATE INDEX idx_genre_name ON GENRE(name);

-- Index composites pour les jointures
CREATE INDEX idx_book_library_composite ON BOOK_LIBRARY(id_library, id_book);
CREATE INDEX idx_book_in_list_composite ON BOOK_IN_LIST(id_reading_list, id_book);
CREATE INDEX idx_book_author_composite ON BOOK_AUTHOR(id_book, id_author);
CREATE INDEX idx_book_genre_composite ON BOOK_GENRE(id_book, id_genre);

-- Index pour le soft delete
CREATE INDEX idx_user_active ON "USER"(id_user) WHERE deleted_at IS NULL;
CREATE INDEX idx_library_active ON LIBRARY(id_library) WHERE deleted_at IS NULL;
CREATE INDEX idx_reading_list_active ON READING_LIST(id_reading_list) WHERE deleted_at IS NULL;

-- Index pour les dates
CREATE INDEX idx_notice_published ON NOTICE(published_at);
CREATE INDEX idx_rate_published ON RATE(published_at);
CREATE INDEX idx_user_created ON "USER"(created_at);

-- =====================================================
-- 8. DONNeES D'INITIALISATION
-- =====================================================

-- Insertion des roles par defaut
INSERT INTO ROLE (name, description) VALUES
('admin', 'Administrateur systeme avec tous les droits'),
('moderator', 'Moderateur pouvant gerer le contenu'),
('user', 'Utilisateur standard'),
('premium', 'Utilisateur premium avec fonctionnalites avancees');

-- Insertion des permissions de base
INSERT INTO PERMISSION (label, action) VALUES
('CREATE', 'Creer du contenu'),
('READ', 'Lire le contenu'),
('UPDATE', 'Modifier le contenu'),
('DELETE', 'Supprimer le contenu'),
('MODERATE', 'Moderer le contenu'),
('ADMIN', 'Administration systeme'),
('EXPORT', 'Exporter des donnees'),
('IMPORT', 'Importer des donnees');

-- Attribution des permissions aux roles
INSERT INTO ROLE_PERMISSION (id_role, id_permission) VALUES
-- Admin : toutes les permissions
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8),
-- Moderator : creation, lecture, modification, moderation
(2, 1), (2, 2), (2, 3), (2, 5),
-- User : creation, lecture, modification (ses propres contenus)
(3, 1), (3, 2), (3, 3),
-- Premium : creation, lecture, modification, export
(4, 1), (4, 2), (4, 3), (4, 7);

-- Insertion des genres litteraires de base
INSERT INTO GENRE (name) VALUES
('Fiction'),
('Non-fiction'),
('Science-fiction'),
('Fantasy'),
('Romance'),
('Thriller'),
('Mystery'),
('Biography'),
('History'),
('Philosophy');

-- =====================================================
-- 9. TRIGGERS POUR LA MAINTENANCE AUTOMATIQUE
-- =====================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour LIBRARY
CREATE TRIGGER tr_library_updated_at
    BEFORE UPDATE ON LIBRARY
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour READING_LIST
CREATE TRIGGER tr_reading_list_updated_at
    BEFORE UPDATE ON READING_LIST
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour NOTICE
CREATE TRIGGER tr_notice_updated_at
    BEFORE UPDATE ON NOTICE
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. VUES UTILES POUR L'APPLICATION
-- =====================================================

-- Vue des utilisateurs actifs avec leurs roles
CREATE VIEW v_active_users AS
SELECT 
    u.id_user,
    u.username,
    u.email,
    u.firstname,
    u.lastname,
    u.created_at,
    STRING_AGG(r.name, ',') as roles
FROM "USER" u
LEFT JOIN USER_ROLE ur ON u.id_user = ur.id_user
LEFT JOIN ROLE r ON ur.id_role = r.id_role
WHERE u.deleted_at IS NULL
GROUP BY u.id_user;

-- Vue des livres avec auteurs et genres
CREATE VIEW v_books_complete AS
SELECT 
    b.id_book,
    b.isbn,
    b.title,
    b.summary,
    b.nb_pages,
    b.published_at,
    STRING_AGG(DISTINCT CONCAT(a.firstname, ' ', a.lastname), ',') as authors,
    STRING_AGG(DISTINCT g.name, ',') as genres,
    AVG(r.rate) as average_rating,
    COUNT(DISTINCT r.id_rate) as rating_count,
    COUNT(DISTINCT n.id_notice) as review_count
FROM BOOK b
LEFT JOIN BOOK_AUTHOR ba ON b.id_book = ba.id_book
LEFT JOIN AUTHOR a ON ba.id_author = a.id_author
LEFT JOIN BOOK_GENRE bg ON b.id_book = bg.id_book
LEFT JOIN GENRE g ON bg.id_genre = g.id_genre
LEFT JOIN RATE r ON b.id_book = r.id_book
LEFT JOIN NOTICE n ON b.id_book = n.id_book
GROUP BY b.id_book;


COMMIT;


-- =====================================================
-- NOTES D'IMPLEMENTATION
-- =====================================================

/*
Securite :
- Utilisez Argon2 pour hasher les mots de passe cote application
- Implementez la validation des emails cote application
- Configurez des connexions securisees (SSL/TLS)

PERFORMANCE :
- Utilisez les index crees pour optimiser les requetes
- Surveillez les requetes lentes avec EXPLAIN
- Considerez le partitioning pour les grandes tables

MAINTENANCE :
- Implementez une purge periodique des donnees soft-deleted
- Surveillez la croissance de la base de donnees
- Sauvegardez regulierement

EXTENSIBILITE :
- Le systeme de roles/permissions permet une extension facile
- Les tables de liaison supportent les relations complexes
- La structure permet l'ajout de nouvelles fonctionnalites
*/