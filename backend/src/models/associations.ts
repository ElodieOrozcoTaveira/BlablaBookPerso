import User from './User.js';
import Library from './Library.js';
import Book from './Book.js';
import Author from './Author.js';
import Genre from './Genre.js';
import BookAuthor from './BookAuthor.js';
import BookGenre from './BookGenre.js';
import ReadingList from './ReadingList.js';
import Notice from './Notice.js';
import Rate from './Rate.js';
import Role from './Role.js';
import Permission from './Permission.js';
import UserRole from './UserRole.js';
import RolePermission from './RolePermission.js';

// Configuration de toutes les associations Sequelize
let associationsSetup = false;
export const setupAssociations = () => {
    if (associationsSetup) {
        console.log('⚠️ Associations déjà configurées, skip...');
        return;
    }
    
    console.log('🔗 Configuration des associations Sequelize...');
    associationsSetup = true;
    
    // User <-> Library (One-to-Many)
    User.hasMany(Library, {
        foreignKey: 'id_user',
        as: 'UserHasLibraries'
    });
    Library.belongsTo(User, {
        foreignKey: 'id_user',
        as: 'LibraryBelongsToUser'
    });

    // Book <-> Author (Many-to-Many via BookAuthor)
    Book.belongsToMany(Author, {
        through: BookAuthor,
        foreignKey: 'id_book',
        otherKey: 'id_author',
        as: 'BookHasAuthors'
    });
    Author.belongsToMany(Book, {
        through: BookAuthor,
        foreignKey: 'id_author',
        otherKey: 'id_book',
        as: 'AuthorHasBooks'
    });

    // Book <-> Genre (Many-to-Many via BookGenre)
    Book.belongsToMany(Genre, {
        through: BookGenre,
        foreignKey: 'id_book',
        otherKey: 'id_genre',
        as: 'BookHasGenres'
    });
    Genre.belongsToMany(Book, {
        through: BookGenre,
        foreignKey: 'id_genre',
        otherKey: 'id_book',
        as: 'GenreHasBooks'
    });

    // Library <-> Book (Many-to-Many via ReadingList)
    Library.belongsToMany(Book, {
        through: ReadingList,
        foreignKey: 'id_library',
        otherKey: 'id_book',
        as: 'LibraryHasBooks'
    });
    Book.belongsToMany(Library, {
        through: ReadingList,
        foreignKey: 'id_book',
        otherKey: 'id_library',
        as: 'BookInLibraries'
    });

    // Direct associations pour ReadingList (OK car ce n'est pas juste une table de jonction)
    ReadingList.belongsTo(Library, {
        foreignKey: 'id_library',
        as: 'ReadingListBelongsToLibrary'
    });
    ReadingList.belongsTo(Book, {
        foreignKey: 'id_book',
        as: 'ReadingListBelongsToBook'
    });

    // User <-> Rate (One-to-Many)
    User.hasMany(Rate, {
        foreignKey: 'id_user',
        as: 'UserHasRatings'
    });
    Rate.belongsTo(User, {
        foreignKey: 'id_user',
        as: 'RateBelongsToUser'
    });

    // Book <-> Rate (One-to-Many)
    Book.hasMany(Rate, {
        foreignKey: 'id_book',
        as: 'BookHasRatings'
    });
    Rate.belongsTo(Book, {
        foreignKey: 'id_book',
        as: 'RateBelongsToBook'
    });

    // User <-> Notice (One-to-Many)
    User.hasMany(Notice, {
        foreignKey: 'id_user',
        as: 'UserHasNotices'
    });
    Notice.belongsTo(User, {
        foreignKey: 'id_user',
        as: 'NoticeBelongsToUser'
    });

    // Book <-> Notice (One-to-Many)
    Book.hasMany(Notice, {
        foreignKey: 'id_book',
        as: 'BookHasNotices'
    });
    Notice.belongsTo(Book, {
        foreignKey: 'id_book',
        as: 'NoticeBelongsToBook'
    });

    // User <-> Role (Many-to-Many via UserRole)
    User.belongsToMany(Role, {
        through: UserRole,
        foreignKey: 'id_user',
        otherKey: 'id_role',
        as: 'Roles'
    });
    Role.belongsToMany(User, {
        through: UserRole,
        foreignKey: 'id_role',
        otherKey: 'id_user',
        as: 'Users'
    });

    // Role <-> Permission (Many-to-Many via RolePermission)
    Role.belongsToMany(Permission, {
        through: RolePermission,
        foreignKey: 'id_role',
        otherKey: 'id_permission',
        as: 'Permissions'
    });
    Permission.belongsToMany(Role, {
        through: RolePermission,
        foreignKey: 'id_permission',
        otherKey: 'id_role',
        as: 'Roles'
    });

    // ❌ SUPPRIMÉ: Les associations directes sur les tables de jonction créent des boucles infinies
    // quand on utilise déjà belongsToMany !
    // BookAuthor.belongsTo(Book, ...) 
    // BookAuthor.belongsTo(Author, ...)
    // BookGenre.belongsTo(Book, ...)
    // BookGenre.belongsTo(Genre, ...)
    // UserRole.belongsTo(User, ...)
    // UserRole.belongsTo(Role, ...)
    // RolePermission.belongsTo(Role, ...)
    // RolePermission.belongsTo(Permission, ...)

    console.log('✅ Associations Sequelize configurées avec succès !');
};

// Export de tous les modèles pour faciliter l'import
export {
    User,
    Library,
    Book,
    Author,
    Genre,
    BookAuthor,
    BookGenre,
    ReadingList,
    Notice,
    Rate,
    Role,
    Permission,
    UserRole,
    RolePermission
};