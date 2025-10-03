/// <reference types="jest" />

// J'importe les outils de test Jest pour organiser et executer mes tests
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
// J'importe la connexion a ma base de donnees Sequelize
import sequelize from '../../src/config/database.js';
// J'importe la fonction qui configure toutes les relations entre mes modeles
import { setupAssociations } from '../../src/models/associations.js';

// J'importe tous mes modeles Sequelize que je veux tester
import User from '../../src/models/User.js';
import Author from '../../src/models/Author.js';
import Book from '../../src/models/Book.js';
import Genre from '../../src/models/Genre.js';
import Library from '../../src/models/Library.js';
import Notice from '../../src/models/Notice.js';
import Rate from '../../src/models/Rate.js';
import Role from '../../src/models/Role.js';
import Permission from '../../src/models/Permission.js';
import UserRole from '../../src/models/UserRole.js';
import RolePermission from '../../src/models/RolePermission.js';
import BookAuthor from '../../src/models/BookAuthor.js';
import BookGenre from '../../src/models/BookGenre.js';
import ReadingList from '../../src/models/ReadingList.js';

// Je cree une suite de tests pour verifier que tous mes modeles Sequelize fonctionnent correctement
describe('Modeles Sequelize', () => {
    
    

    // Cette fonction s'execute AVANT CHAQUE test individuel pour nettoyer les donnees
    beforeEach(async () => {
        // Je vide toutes les tables pour que chaque test parte d'une base propre
        await User.destroy({ where: {}, force: true }); // force: true pour ignorer le soft delete
        await Author.destroy({ where: {} });
        await Book.destroy({ where: {} });
        await Genre.destroy({ where: {} });
        await Library.destroy({ where: {} });
        await Notice.destroy({ where: {} });
        await Rate.destroy({ where: {} });
        await Role.destroy({ where: {} });
        await Permission.destroy({ where: {} });
    });

    // Je teste le modele User pour m'assurer qu'il fonctionne correctement
    describe('Modele User', () => {
        // Je teste la creation d'un utilisateur avec des donnees valides
        it('devrait creer un utilisateur valide', async () => {
            // Je cree un nouvel utilisateur avec toutes les donnees requises
            const user = await User.create({
                firstname: 'John',
                lastname: 'Doe',
                username: 'johndoe',
                email: 'john.doe@example.com',
                password: 'hashedpassword123'
            });

            // Je verifie que l'utilisateur a bien ete cree avec un ID auto-genere
            expect(user.id_user).toBeDefined();
            // Je verifie que toutes les donnees ont ete sauvegardees correctement
            expect(user.firstname).toBe('John');
            expect(user.lastname).toBe('Doe');
            expect(user.username).toBe('johndoe');
            expect(user.email).toBe('john.doe@example.com');
            // Je verifie que la date de creation a ete automatiquement ajoutee
            expect(user.created_at).toBeDefined();
        });

        // Je teste que la contrainte d'unicite sur l'email fonctionne bien
        it('devrait echouer avec un email deja existant', async () => {
            // Je cree un premier utilisateur
            await User.create({
                firstname: 'John',
                lastname: 'Doe',
                username: 'johndoe1',
                email: 'john.doe@example.com',
                password: 'hashedpassword123'
            });

            // Je tente de creer un deuxieme utilisateur avec le meme email
            // Je m'attends a ce que ca echoue car l'email doit etre unique
            await expect(User.create({
                firstname: 'Jane',
                lastname: 'Doe',
                username: 'janedoe',
                email: 'john.doe@example.com', // Email duplique - doit echouer
                password: 'hashedpassword456'
            })).rejects.toThrow();
        });
    });

    // Je teste le modele Author avec ses champs specifiques (nom, bio, dates)
    describe('Modele Author', () => {
        // Je teste la creation d'un auteur avec toutes ses informations
        it('devrait creer un auteur avec toutes les informations', async () => {
            // Je cree un auteur avec nom, bio et dates de naissance/deces
            const author = await Author.create({
                name: 'Victor Hugo',
                bio: 'Ecrivain francais du XIXe siecle',
                birth_date: new Date('1802-02-26'),
                death_date: new Date('1885-05-22')
            });

            // Je verifie que l'auteur a bien ete cree avec un ID auto-genere
            expect(author.id_author).toBeDefined();
            // Je verifie que toutes les donnees ont ete sauvegardees
            expect(author.name).toBe('Victor Hugo');
            expect(author.bio).toBe('Ecrivain francais du XIXe siecle');
            // Je verifie le format des dates (PostgreSQL peut les retourner en string ou Date)
            expect(author.birth_date?.toString()).toBe('1802-02-26');
            expect(author.death_date?.toString()).toBe('1885-05-22');
        });

        // Je teste le cas ou quelqu'un essaie de mettre une date de deces avant la naissance
        it('devrait echouer si death_date < birth_date', async () => {
            // MAINTENANT: J'ai ajoute une validation personnalisee dans le modele Author
            // Cette validation doit maintenant empecher la creation d'un auteur avec dates incoherentes
            await expect(Author.create({
                name: 'Test Author',
                birth_date: new Date('1900-01-01'),
                death_date: new Date('1850-01-01') // Date incoherente - doit maintenant echouer
            })).rejects.toThrow('La date de deces ne peut pas être anterieure a la date de naissance');
        });

        // Je teste qu'un auteur peut etre vivant (pas de date de deces)
        it('devrait permettre un auteur vivant (death_date = null)', async () => {
            // Je cree un auteur sans date de deces (= encore vivant)
            const author = await Author.create({
                name: 'Auteur Vivant',
                birth_date: new Date('1980-01-01')
                // death_date omis volontairement = null par defaut
            });

            // Je verifie que death_date est bien null pour un auteur vivant
            expect(author.death_date).toBeNull();
        });
    });

    // Je teste le modele Book avec ses champs specifiques (ISBN, titre, etc.)
    describe('Modele Book', () => {
        // Je teste la creation d'un livre avec un ISBN
        it('devrait creer un livre avec ISBN', async () => {
            // Je cree un livre avec toutes les informations possibles
            const book = await Book.create({
                isbn: '9782070413119',
                title: 'Les Miserables',
                description: 'Roman de Victor Hugo',
                publication_year: 1862,
                page_count: 1232,
                language: 'fr'
            });

            // Je verifie que le livre a bien ete cree avec un ID auto-genere
            expect(book.id_book).toBeDefined();
            // Je verifie que toutes les donnees ont ete sauvegardees
            expect(book.isbn).toBe('9782070413119');
            expect(book.title).toBe('Les Miserables');
            expect(book.publication_year).toBe(1862);
        });

        // Je teste qu'un livre peut exister sans ISBN (important pour Open Library)
        it('devrait permettre un livre sans ISBN', async () => {
            // Beaucoup de livres dans Open Library n'ont pas d'ISBN
            const book = await Book.create({
                title: 'Livre sans ISBN',
                description: 'Un livre sans ISBN'
            });

            // Je verifie que l'ISBN est bien null et que le livre est cree quand meme
            expect(book.isbn).toBeNull();
            expect(book.title).toBe('Livre sans ISBN');
        });

        // Je teste que la contrainte d'unicite sur l'ISBN fonctionne
        it('devrait echouer avec un ISBN duplique', async () => {
            // Je cree un premier livre avec un ISBN
            await Book.create({
                isbn: '9782070413119',
                title: 'Premier livre'
            });

            // Je tente de creer un deuxieme livre avec le meme ISBN
            // Ca doit echouer car l'ISBN doit etre unique
            await expect(Book.create({
                isbn: '9782070413119', // ISBN duplique - doit echouer
                title: 'Deuxieme livre'
            })).rejects.toThrow();
        });
    });

    describe('Modele Genre', () => {
        it('devrait creer un genre valide', async () => {
            const genre = await Genre.create({
                name: 'Fantasy',
                description: 'Romans de fantasy et magie'
            });

            expect(genre.id_genre).toBeDefined();
            expect(genre.name).toBe('Fantasy');
            expect(genre.description).toBe('Romans de fantasy et magie');
        });

        it('devrait echouer avec un nom duplique', async () => {
            await Genre.create({
                name: 'Fantasy',
                description: 'Premier genre'
            });

            await expect(Genre.create({
                name: 'Fantasy', // Nom duplique
                description: 'Deuxieme genre'
            })).rejects.toThrow();
        });
    });

    describe('Modele Rate', () => {
        let user: any, book: any;

        beforeEach(async () => {
            user = await User.create({
                firstname: 'John',
                lastname: 'Doe',
                username: 'johndoe',
                email: 'john.doe@example.com',
                password: 'hashedpassword123'
            });

            book = await Book.create({
                title: 'Test Book',
                description: 'Un livre de test'
            });
        });

        it('devrait creer une note valide', async () => {
            const rate = await Rate.create({
                id_user: user.id_user,
                id_book: book.id_book,
                rating: 4
            });

            expect(rate.id_rate).toBeDefined();
            expect(rate.rating).toBe(4);
        });

        it('devrait echouer avec une note invalide', async () => {
            await expect(Rate.create({
                id_user: user.id_user,
                id_book: book.id_book,
                rating: 6 // > 5
            })).rejects.toThrow();

            await expect(Rate.create({
                id_user: user.id_user,
                id_book: book.id_book,
                rating: 0 // < 1
            })).rejects.toThrow();
        });

        it('devrait echouer si un utilisateur note deux fois le même livre', async () => {
            await Rate.create({
                id_user: user.id_user,
                id_book: book.id_book,
                rating: 4
            });

            await expect(Rate.create({
                id_user: user.id_user,
                id_book: book.id_book, // Même user + même livre
                rating: 5
            })).rejects.toThrow();
        });
    });

    // Je teste toutes les associations Many-to-Many entre mes modeles
    describe('Associations', () => {
        // Je declare des variables pour stocker mes objets de test
        let user: any, book: any, author: any, genre: any, library: any;

        // Avant chaque test d'association, je cree les objets de base dont j'ai besoin
        beforeEach(async () => {
            // Je cree un utilisateur de test
            user = await User.create({
                firstname: 'John',
                lastname: 'Doe',
                username: 'johndoe',
                email: 'john.doe@example.com',
                password: 'hashedpassword123'
            });

            // Je cree un auteur de test
            author = await Author.create({
                name: 'Victor Hugo'
            });

            // Je cree un genre de test
            genre = await Genre.create({
                name: 'Romance'
            });

            // Je cree un livre de test
            book = await Book.create({
                title: 'Les Miserables',
                description: 'Roman de Victor Hugo'
            });

            // Je cree une bibliotheque de test liee a l'utilisateur
            library = await Library.create({
                id_user: user.id_user,
                name: 'Ma bibliotheque',
                description: 'Ma collection personnelle',
                is_public: false
            });
        });

        // Je teste l'association Many-to-Many entre Book et Author via BookAuthor
        it('devrait associer un livre a un auteur', async () => {
            // Je cree l'association dans la table de liaison BookAuthor
            await BookAuthor.create({
                id_book: book.id_book,
                id_author: author.id_author
            });

            // Je recupere le livre avec ses auteurs associes
            const bookWithAuthors = await Book.findByPk(book.id_book, {
                include: [{ association: 'BookHasAuthors' }]
            }) as any;

            // Je verifie que le livre a bien 1 auteur associe
            expect(bookWithAuthors?.BookHasAuthors).toHaveLength(1);
            // Je verifie que c'est le bon auteur
            expect(bookWithAuthors?.BookHasAuthors[0].name).toBe('Victor Hugo');
        });

        // Je teste l'association Many-to-Many entre Book et Genre via BookGenre
        it('devrait associer un livre a un genre', async () => {
            // Je cree l'association dans la table de liaison BookGenre
            await BookGenre.create({
                id_book: book.id_book,
                id_genre: genre.id_genre
            });

            // Je recupere le livre avec ses genres associes
            const bookWithGenres = await Book.findByPk(book.id_book, {
                include: [{ association: 'BookHasGenres' }]
            }) as any;

            // Je verifie que le livre a bien 1 genre associe
            expect(bookWithGenres?.BookHasGenres).toHaveLength(1);
            // Je verifie que c'est le bon genre
            expect(bookWithGenres?.BookHasGenres[0].name).toBe('Romance');
        });

        // Je teste l'association Many-to-Many entre Library et Book via ReadingList
        it('devrait ajouter un livre a une liste de lecture', async () => {
            // Je cree l'association dans la table de liaison ReadingList
            await ReadingList.create({
                id_library: library.id_library,
                id_book: book.id_book,
                reading_status: 'to_read', // Statut: a lire
                added_at: new Date()
            });

            // Je recupere la bibliotheque avec ses livres associes
            const libraryWithBooks = await Library.findByPk(library.id_library, {
                include: [{ association: 'LibraryHasBooks' }]
            }) as any;

            // Je verifie que la bibliotheque a bien 1 livre
            expect(libraryWithBooks?.LibraryHasBooks).toHaveLength(1);
            // Je verifie que c'est le bon livre
            expect(libraryWithBooks?.LibraryHasBooks[0].title).toBe('Les Miserables');
        });
    });

    // Je teste le systeme de roles et permissions pour la securite de l'application
    describe('Roles et Permissions', () => {
        // Je teste l'association Many-to-Many entre Role et Permission via RolePermission
        it('devrait creer des roles et permissions', async () => {
            // Je cree un role administrateur
            const role = await Role.create({
                name: 'admin',
                description: 'Administrateur systeme'
            });

            // Je cree une permission pour creer du contenu
            const permission = await Permission.create({
                label: 'CREATE',
                action: 'Creer du contenu'
            });

            // Je lie le role a la permission via la table de liaison RolePermission
            await RolePermission.create({
                id_role: role.id_role,
                id_permission: permission.id_permission
            });

            // Je recupere le role avec toutes ses permissions associees
            const roleWithPermissions = await Role.findByPk(role.id_role, {
                include: [{ association: 'Permissions' }]
            }) as any;

            // Je verifie que le role a bien 1 permission
            expect(roleWithPermissions?.Permissions).toHaveLength(1);
            // Je verifie que c'est la bonne permission
            expect(roleWithPermissions?.Permissions[0].label).toBe('CREATE');
        });

        // Je teste l'association Many-to-Many entre User et Role via UserRole
        it('devrait associer un utilisateur a un role', async () => {
            // Je cree un utilisateur de test
            const user = await User.create({
                firstname: 'John',
                lastname: 'Doe',
                username: 'johndoe',
                email: 'john.doe@example.com',
                password: 'hashedpassword123'
            });

            // Je cree un role utilisateur standard
            const role = await Role.create({
                name: 'user',
                description: 'Utilisateur standard'
            });

            // Je lie l'utilisateur au role via la table de liaison UserRole
            await UserRole.create({
                id_user: user.id_user,
                id_role: role.id_role
            });

            // Je recupere l'utilisateur avec tous ses roles associes
            const userWithRoles = await User.findByPk(user.id_user, {
                include: [{ association: 'Roles' }]
            }) as any;

            // Je verifie que l'utilisateur a bien 1 role
            expect(userWithRoles?.Roles).toHaveLength(1);
            // Je verifie que c'est le bon role
            expect(userWithRoles?.Roles[0].name).toBe('user');
        });
    });
});