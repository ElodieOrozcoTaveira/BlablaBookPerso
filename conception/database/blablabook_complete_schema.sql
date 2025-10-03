-- =====================================
-- BLABLABOOK DATABASE SCHEMA
-- =====================================
-- Script SQL complet basé sur le MPD V2
-- Compatible PostgreSQL/MySQL
-- Généré depuis l'analyse du fichier blablabook-mpd-V2.drawio
--
-- Tables principales : 15 tables identifiées
-- Date de génération : 2025-08-01
-- =====================================

SET foreign_key_checks = 0; -- MySQL
-- DROP SCHEMA IF EXISTS blablabook CASCADE; -- PostgreSQL

-- =====================================
-- 1. TABLE ROLE
-- =====================================
-- Gestion des rôles utilisateurs (admin, user, etc.)

CREATE TABLE IF NOT EXISTS role (
    id_role INTEGER PRIMARY KEY AUTO_INCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    created_at DATE NOT NULL DEFAULT (CURRENT_DATE)
);

-- =====================================
-- 2. TABLE PERMISSION
-- =====================================
-- Gestion des permissions système

CREATE TABLE IF NOT EXISTS permission (
    id_permission INTEGER PRIMARY KEY AUTO_INCREMENT,
    label TEXT NOT NULL UNIQUE,
    action TEXT NULL
);

-- =====================================
-- 3. TABLE ROLE_PERMISSION
-- =====================================
-- Table de liaison Many-to-Many entre roles et permissions

CREATE TABLE IF NOT EXISTS role_permission (
    id_permission_role INTEGER PRIMARY KEY AUTO_INCREMENT,
    id_role INTEGER NOT NULL,
    id_permission INTEGER NOT NULL,
    UNIQUE KEY unique_role_permission (id_role, id_permission)
);

-- =====================================
-- 4. TABLE USER
-- =====================================
-- Utilisateurs de l'application

CREATE TABLE IF NOT EXISTS user (
    id_user INTEGER PRIMARY KEY AUTO_INCREMENT,
    id_role INTEGER NOT NULL,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    connected_at DATE NOT NULL DEFAULT (CURRENT_DATE),
    created_at DATE NOT NULL DEFAULT (CURRENT_DATE),
    deleted_at DATE NULL
);

-- =====================================
-- 5. TABLE USER_ROLE
-- =====================================
-- Table de liaison Many-to-Many entre users et roles

CREATE TABLE IF NOT EXISTS user_role (
    id_user_role INTEGER PRIMARY KEY AUTO_INCREMENT,
    id_user INTEGER NOT NULL,
    id_role INTEGER NOT NULL,
    UNIQUE KEY unique_user_role (id_user, id_role)
);

-- =====================================
-- 6. TABLE LIBRARY
-- =====================================
-- Bibliothèques personnelles des utilisateurs

CREATE TABLE IF NOT EXISTS library (
    id_library INTEGER PRIMARY KEY AUTO_INCREMENT,
    id_user INTEGER NOT NULL,
    name TEXT NOT NULL UNIQUE,
    created_at DATE NOT NULL DEFAULT (CURRENT_DATE),
    updated_at DATE NOT NULL DEFAULT (CURRENT_DATE),
    deleted_at DATE NOT NULL DEFAULT (CURRENT_DATE) -- Attention: vérifier si doit être NULL par défaut
);

-- =====================================
-- 7. TABLE READING_LIST
-- =====================================
-- Listes de lecture dans les bibliothèques

CREATE TABLE IF NOT EXISTS reading_list (
    id_reading_list INTEGER PRIMARY KEY AUTO_INCREMENT,
    id_library INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT NULL,
    statut BOOLEAN NOT NULL,
    created_at DATE NOT NULL DEFAULT (CURRENT_DATE),
    updated_at DATE NOT NULL DEFAULT (CURRENT_DATE),
    deleted_at DATE NULL
);

-- =====================================
-- 8. TABLE GENRE
-- =====================================
-- Genres littéraires

CREATE TABLE IF NOT EXISTS genre (
    id_genre INTEGER PRIMARY KEY AUTO_INCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT NULL,
    created_at DATE NOT NULL DEFAULT (CURRENT_DATE)
);

-- =====================================
-- 9. TABLE AUTHOR
-- =====================================
-- Auteurs des livres

CREATE TABLE IF NOT EXISTS author (
    id_author INTEGER PRIMARY KEY AUTO_INCREMENT,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL,
    biography TEXT NULL,
    birth_date DATE NULL,
    death_date DATE NULL,
    nationality TEXT NULL,
    created_at DATE NOT NULL DEFAULT (CURRENT_DATE)
);

-- =====================================
-- 10. TABLE BOOK
-- =====================================
-- Livres de la base de données

CREATE TABLE IF NOT EXISTS book (
    id_book INTEGER PRIMARY KEY AUTO_INCREMENT,
    isbn TEXT UNIQUE,
    title TEXT NOT NULL,
    image BOOLEAN NOT NULL DEFAULT FALSE,
    summary TEXT NULL,
    nb_pages TEXT NULL, -- Attention: devrait probablement être INTEGER
    published_at DATE NULL
);

-- =====================================
-- 11. TABLE BOOK_GENRE
-- =====================================
-- Table de liaison Many-to-Many entre books et genres

CREATE TABLE IF NOT EXISTS book_genre (
    id_book_genre INTEGER PRIMARY KEY AUTO_INCREMENT,
    id_book INTEGER NOT NULL,
    id_genre INTEGER NOT NULL,
    UNIQUE KEY unique_book_genre (id_book, id_genre)
);

-- =====================================
-- 12. TABLE BOOK_AUTHOR
-- =====================================
-- Table de liaison Many-to-Many entre books et authors

CREATE TABLE IF NOT EXISTS book_author (
    id_book_author INTEGER PRIMARY KEY AUTO_INCREMENT,
    id_book INTEGER NOT NULL,
    id_author INTEGER NOT NULL,
    UNIQUE KEY unique_book_author (id_book, id_author)
);

-- =====================================
-- 13. TABLE BOOK_LIBRARY
-- =====================================
-- Table de liaison Many-to-Many entre books et libraries

CREATE TABLE IF NOT EXISTS book_library (
    id_book_library INTEGER PRIMARY KEY AUTO_INCREMENT,
    id_book INTEGER NOT NULL,
    id_library INTEGER NOT NULL,
    statut TEXT NULL,
    added_at DATE NOT NULL DEFAULT (CURRENT_DATE),
    UNIQUE KEY unique_book_library (id_book, id_library)
);

-- =====================================
-- 14. TABLE BOOK_IN_LIST
-- =====================================
-- Table de liaison Many-to-Many entre books et reading_lists

CREATE TABLE IF NOT EXISTS book_in_list (
    id_book_in_list INTEGER PRIMARY KEY AUTO_INCREMENT,
    id_book INTEGER NOT NULL,
    id_reading_list INTEGER NOT NULL,
    added_at DATE NOT NULL DEFAULT (CURRENT_DATE),
    UNIQUE KEY unique_book_in_list (id_book, id_reading_list)
);

-- =====================================
-- 15. TABLE NOTICE
-- =====================================
-- Avis/critiques des utilisateurs sur les livres

CREATE TABLE IF NOT EXISTS notice (
    id_notice INTEGER PRIMARY KEY AUTO_INCREMENT,
    id_user INTEGER NOT NULL,
    id_book INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATE NOT NULL DEFAULT (CURRENT_DATE),
    updated_at DATE NOT NULL DEFAULT (CURRENT_DATE),
    UNIQUE KEY unique_user_book_notice (id_user, id_book)
);

-- =====================================
-- 16. TABLE RATE
-- =====================================
-- Notes des utilisateurs sur les livres

CREATE TABLE IF NOT EXISTS rate (
    id_rate INTEGER PRIMARY KEY AUTO_INCREMENT,
    id_user INTEGER NOT NULL,
    id_book INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at DATE NOT NULL DEFAULT (CURRENT_DATE),
    updated_at DATE NOT NULL DEFAULT (CURRENT_DATE),
    UNIQUE KEY unique_user_book_rate (id_user, id_book)
);

-- =====================================
-- FOREIGN KEY CONSTRAINTS
-- =====================================

-- Role_Permission constraints
ALTER TABLE role_permission 
ADD CONSTRAINT fk_role_permission_role 
    FOREIGN KEY (id_role) REFERENCES role(id_role) 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE role_permission 
ADD CONSTRAINT fk_role_permission_permission 
    FOREIGN KEY (id_permission) REFERENCES permission(id_permission) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- User constraints
ALTER TABLE user 
ADD CONSTRAINT fk_user_role 
    FOREIGN KEY (id_role) REFERENCES role(id_role) 
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- User_Role constraints
ALTER TABLE user_role 
ADD CONSTRAINT fk_user_role_user 
    FOREIGN KEY (id_user) REFERENCES user(id_user) 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE user_role 
ADD CONSTRAINT fk_user_role_role 
    FOREIGN KEY (id_role) REFERENCES role(id_role) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Library constraints
ALTER TABLE library 
ADD CONSTRAINT fk_library_user 
    FOREIGN KEY (id_user) REFERENCES user(id_user) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Reading_List constraints
ALTER TABLE reading_list 
ADD CONSTRAINT fk_reading_list_library 
    FOREIGN KEY (id_library) REFERENCES library(id_library) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Book_Genre constraints
ALTER TABLE book_genre 
ADD CONSTRAINT fk_book_genre_book 
    FOREIGN KEY (id_book) REFERENCES book(id_book) 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE book_genre 
ADD CONSTRAINT fk_book_genre_genre 
    FOREIGN KEY (id_genre) REFERENCES genre(id_genre) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Book_Author constraints
ALTER TABLE book_author 
ADD CONSTRAINT fk_book_author_book 
    FOREIGN KEY (id_book) REFERENCES book(id_book) 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE book_author 
ADD CONSTRAINT fk_book_author_author 
    FOREIGN KEY (id_author) REFERENCES author(id_author) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Book_Library constraints
ALTER TABLE book_library 
ADD CONSTRAINT fk_book_library_book 
    FOREIGN KEY (id_book) REFERENCES book(id_book) 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE book_library 
ADD CONSTRAINT fk_book_library_library 
    FOREIGN KEY (id_library) REFERENCES library(id_library) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Book_In_List constraints
ALTER TABLE book_in_list 
ADD CONSTRAINT fk_book_in_list_book 
    FOREIGN KEY (id_book) REFERENCES book(id_book) 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE book_in_list 
ADD CONSTRAINT fk_book_in_list_reading_list 
    FOREIGN KEY (id_reading_list) REFERENCES reading_list(id_reading_list) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Notice constraints
ALTER TABLE notice 
ADD CONSTRAINT fk_notice_user 
    FOREIGN KEY (id_user) REFERENCES user(id_user) 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE notice 
ADD CONSTRAINT fk_notice_book 
    FOREIGN KEY (id_book) REFERENCES book(id_book) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Rate constraints
ALTER TABLE rate 
ADD CONSTRAINT fk_rate_user 
    FOREIGN KEY (id_user) REFERENCES user(id_user) 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE rate 
ADD CONSTRAINT fk_rate_book 
    FOREIGN KEY (id_book) REFERENCES book(id_book) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- =====================================
-- INDEXES FOR PERFORMANCE
-- =====================================

-- User indexes
CREATE INDEX idx_user_email ON user(email);
CREATE INDEX idx_user_username ON user(username);
CREATE INDEX idx_user_role ON user(id_role);
CREATE INDEX idx_user_deleted_at ON user(deleted_at);

-- Library indexes
CREATE INDEX idx_library_user ON library(id_user);
CREATE INDEX idx_library_name ON library(name);
CREATE INDEX idx_library_deleted_at ON library(deleted_at);

-- Reading_List indexes
CREATE INDEX idx_reading_list_library ON reading_list(id_library);
CREATE INDEX idx_reading_list_statut ON reading_list(statut);
CREATE INDEX idx_reading_list_deleted_at ON reading_list(deleted_at);

-- Book indexes
CREATE INDEX idx_book_isbn ON book(isbn);
CREATE INDEX idx_book_title ON book(title(255)); -- MySQL limitation
CREATE INDEX idx_book_published_at ON book(published_at);

-- Author indexes
CREATE INDEX idx_author_lastname ON author(lastname(255)); -- MySQL limitation
CREATE INDEX idx_author_nationality ON author(nationality(255)); -- MySQL limitation

-- Genre indexes
CREATE INDEX idx_genre_name ON genre(name(255)); -- MySQL limitation

-- Notice indexes
CREATE INDEX idx_notice_user ON notice(id_user);
CREATE INDEX idx_notice_book ON notice(id_book);
CREATE INDEX idx_notice_created_at ON notice(created_at);

-- Rate indexes
CREATE INDEX idx_rate_user ON rate(id_user);
CREATE INDEX idx_rate_book ON rate(id_book);
CREATE INDEX idx_rate_rating ON rate(rating);
CREATE INDEX idx_rate_created_at ON rate(created_at);

-- Junction table indexes
CREATE INDEX idx_role_permission_role ON role_permission(id_role);
CREATE INDEX idx_role_permission_permission ON role_permission(id_permission);

CREATE INDEX idx_user_role_user ON user_role(id_user);
CREATE INDEX idx_user_role_role ON user_role(id_role);

CREATE INDEX idx_book_genre_book ON book_genre(id_book);
CREATE INDEX idx_book_genre_genre ON book_genre(id_genre);

CREATE INDEX idx_book_author_book ON book_author(id_book);
CREATE INDEX idx_book_author_author ON book_author(id_author);

CREATE INDEX idx_book_library_book ON book_library(id_book);
CREATE INDEX idx_book_library_library ON book_library(id_library);
CREATE INDEX idx_book_library_statut ON book_library(statut(255)); -- MySQL limitation

CREATE INDEX idx_book_in_list_book ON book_in_list(id_book);
CREATE INDEX idx_book_in_list_reading_list ON book_in_list(id_reading_list);

SET foreign_key_checks = 1; -- MySQL

-- =====================================
-- NOTES IMPORTANTES
-- =====================================
-- 
-- 1. CORRECTIONS NÉCESSAIRES :
--    - library.deleted_at : vérifier si doit être NULL par défaut au lieu de CURRENT_DATE
--    - book.nb_pages : devrait probablement être INTEGER au lieu de TEXT
--    - Vérifier les contraintes de suppression (CASCADE vs RESTRICT)
--
-- 2. AMÉLIORATIONS POSSIBLES :
--    - Ajouter des triggers pour updated_at automatique
--    - Ajouter des contraintes CHECK pour les emails
--    - Ajouter des contraintes de longueur pour les champs TEXT
--    - Considérer l'ajout de champs comme 'slug' pour les URLs
--
-- 3. DONNÉES DE TEST :
--    - Insérer des rôles par défaut (admin, user)
--    - Insérer des permissions de base
--    - Créer un utilisateur administrateur par défaut
--
-- 4. COMPATIBILITÉ :
--    - Ce script est optimisé pour MySQL
--    - Pour PostgreSQL : remplacer AUTO_INCREMENT par SERIAL
--    - Pour PostgreSQL : remplacer CURRENT_DATE par NOW()::DATE
--    - Pour PostgreSQL : supprimer les limitations (255) sur les indexes TEXT
--
-- =====================================