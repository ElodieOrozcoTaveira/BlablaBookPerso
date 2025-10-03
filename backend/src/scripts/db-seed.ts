import sequelize from '../config/database.js';
import User from '../models/User.js';
import Author from '../models/Author.js';
import Genre from '../models/Genre.js';
import Book from '../models/Book.js';
import Library from '../models/Library.js';
import ReadingList from '../models/ReadingList.js';
import Rate from '../models/Rate.js';
import Notice from '../models/Notice.js';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';
import RolePermission from '../models/RolePermission.js';
import UserRole from '../models/UserRole.js';
import * as argon2 from 'argon2';
import dotenv from 'dotenv';

// Import des associations
import '../models/associations';

dotenv.config();

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');

        // Verifier la connexion
        await sequelize.authenticate();
        console.log('✅ Database connection established');

        // 1. Creer les roles de base (selon blablabook_schema_v2.sql)
        console.log('👥 Creating roles...');

        const adminRole = await Role.create({
            name: 'admin',
            description: 'Administrateur systeme avec tous les droits',
        });

        const userRole = await Role.create({
            name: 'user',
            description: 'Utilisateur standard',
        });

        // 2. Creer des permissions de base (selon blablabook_schema_v2.sql)
        console.log('🔐 Creating permissions...');

        const permissions = await Permission.bulkCreate([
            // Permissions generiques
            { label: 'CREATE', action: 'Creer du contenu' },
            { label: 'READ', action: 'Lire le contenu' },
            { label: 'UPDATE', action: 'Modifier le contenu' },
            { label: 'DELETE', action: 'Supprimer le contenu' },
            { label: 'MODERATE', action: 'Moderer le contenu' },
            
            // Permissions specifiques utilisees dans les routes
            { label: 'ADMIN_USERS', action: 'Administrer les utilisateurs' },
            { label: 'VIEW_USER_STATS', action: 'Voir les statistiques utilisateurs' },
            { label: 'CREATE_AUTHOR', action: 'Creer des auteurs' },
            { label: 'UPDATE_AUTHOR', action: 'Modifier des auteurs' },
            { label: 'DELETE_AUTHOR', action: 'Supprimer des auteurs' },
            { label: 'ADMIN', action: 'Administration systeme' },
            { label: 'EXPORT', action: 'Exporter des donnees' },
            { label: 'IMPORT', action: 'Importer des donnees' },
        ]);

        // 3. Creer les associations roles-permissions (selon blablabook_schema_v2.sql)
        console.log('🔗 Creating role-permission associations...');

        const rolePermissions = await RolePermission.bulkCreate([
            // Admin : toutes les permissions
            { id_role: adminRole.id_role, id_permission: permissions[0].id_permission }, // CREATE
            { id_role: adminRole.id_role, id_permission: permissions[1].id_permission }, // READ
            { id_role: adminRole.id_role, id_permission: permissions[2].id_permission }, // UPDATE
            { id_role: adminRole.id_role, id_permission: permissions[3].id_permission }, // DELETE
            { id_role: adminRole.id_role, id_permission: permissions[4].id_permission }, // MODERATE
            { id_role: adminRole.id_role, id_permission: permissions[5].id_permission }, // ADMIN_USERS
            { id_role: adminRole.id_role, id_permission: permissions[6].id_permission }, // VIEW_USER_STATS
            { id_role: adminRole.id_role, id_permission: permissions[7].id_permission }, // CREATE_AUTHOR
            { id_role: adminRole.id_role, id_permission: permissions[8].id_permission }, // UPDATE_AUTHOR
            { id_role: adminRole.id_role, id_permission: permissions[9].id_permission }, // DELETE_AUTHOR
            { id_role: adminRole.id_role, id_permission: permissions[10].id_permission }, // ADMIN
            { id_role: adminRole.id_role, id_permission: permissions[11].id_permission }, // EXPORT
            { id_role: adminRole.id_role, id_permission: permissions[12].id_permission }, // IMPORT

            // User : permissions de base (pas d'admin ni d'auteur management)
            { id_role: userRole.id_role, id_permission: permissions[0].id_permission }, // CREATE
            { id_role: userRole.id_role, id_permission: permissions[1].id_permission }, // READ
            { id_role: userRole.id_role, id_permission: permissions[2].id_permission }, // UPDATE
        ]);

        // 4. Creer des utilisateurs de test
        console.log('👤 Creating test users...');

        const hashedPassword = await argon2.hash('password123');

        const users = await User.bulkCreate([
            {
                firstname: 'Admin',
                lastname: 'User',
                username: 'admin',
                email: 'admin@blablabook.com',
                password: hashedPassword,
                connected_at: new Date(),
                created_at: new Date(),
            },
            {
                firstname: 'John',
                lastname: 'Doe',
                username: 'johndoe',
                email: 'john@example.com',
                password: hashedPassword,
                connected_at: new Date(),
                created_at: new Date(),
            },
            {
                firstname: 'Jane',
                lastname: 'Smith',
                username: 'janesmith',
                email: 'jane@example.com',
                password: hashedPassword,
                connected_at: new Date(),
                created_at: new Date(),
            },
        ]);

        // 5. Associer les utilisateurs aux roles
        console.log('🔗 Creating user-role associations...');
        
        await UserRole.bulkCreate([
            { id_user: users[0].id_user, id_role: adminRole.id_role }, // Admin user -> admin role
            { id_user: users[1].id_user, id_role: userRole.id_role },  // Jane -> user role  
            { id_user: users[2].id_user, id_role: userRole.id_role },  // John -> user role
        ]);

        // 6. Creer des genres
        console.log('📚 Creating genres...');

        const genres = await Genre.bulkCreate([
            { name: 'Science-Fiction' },
            { name: 'Fantasy' },
            { name: 'Romance' },
            { name: 'Thriller' },
            { name: 'Mystere' },
        ]);

        // 6. Creer des auteurs
        console.log('✍️ Creating authors...');

        const authors = await Author.bulkCreate([
            {
                name: 'J.R.R. Tolkien',
                bio: 'Auteur britannique celebre pour Le Seigneur des Anneaux',
                birth_date: new Date('1892-01-03'),
                death_date: new Date('1973-09-02'),
            },
            {
                name: 'George Orwell',
                bio: 'ecrivain britannique connu pour 1984',
                birth_date: new Date('1903-06-25'),
                death_date: new Date('1950-01-21'),
            },
            {
                name: 'Agatha Christie',
                bio: 'Romanciere britannique, reine du crime',
                birth_date: new Date('1890-09-15'),
                death_date: new Date('1976-01-12'),
            },
        ]);

        // 7. Creer des livres
        console.log('📖 Creating books...');

        const books = await Book.bulkCreate([
            {
                isbn: '9780007149247',
                title: "Le Seigneur des Anneaux : La Communaute de l'Anneau",
                description: 'Premier tome de la trilogie epique de Tolkien',
                publication_year: 1954,
                page_count: 423,
                language: 'français',
            },
            {
                isbn: '9780451524935',
                title: '1984',
                description: 'Roman dystopique sur la surveillance totalitaire',
                publication_year: 1949,
                page_count: 328,
                language: 'français',
            },
            {
                isbn: '9780062073488',
                title: "Le Crime de l'Orient-Express",
                description: 'Enquête de Hercule Poirot dans un train',
                publication_year: 1934,
                page_count: 256,
                language: 'français',
            },
        ]);

        // 8. Creer des bibliotheques
        console.log('🏛️ Creating libraries...');

        const libraries = await Library.bulkCreate([
            {
                id_user: users[1].id_user,
                name: 'Ma Collection Fantasy',
                description: 'Mes livres de fantasy preferes',
                is_public: true,
            },
            {
                id_user: users[2].id_user,
                name: 'Classiques Litteraires',
                description: 'Collection de grands classiques',
                is_public: true,
            },
        ]);

        // 9. Creer des listes de lecture
        console.log('📋 Creating reading lists...');

        const readingLists = await ReadingList.bulkCreate([
            {
                id_library: libraries[0].id_library,
                id_book: books[0].id_book,
                reading_status: 'read',
                added_at: new Date(),
            },
            {
                id_library: libraries[1].id_library,
                id_book: books[1].id_book,
                reading_status: 'reading',
                added_at: new Date(),
            },
        ]);

        // 10. Creer des evaluations
        console.log('⭐ Creating ratings...');

        const ratings = await Rate.bulkCreate([
            {
                id_user: users[1].id_user,
                id_book: books[0].id_book,
                rating: 5,
            },
            {
                id_user: users[2].id_user,
                id_book: books[1].id_book,
                rating: 4,
            },
        ]);

        // 11. Creer des avis/commentaires
        console.log('💬 Creating notices...');

        const notices = await Notice.bulkCreate([
            {
                id_user: users[1].id_user,
                id_book: books[0].id_book,
                content:
                    "Un chef-d'œuvre absolu de la fantasy ! L'univers de Tolkien est d'une richesse incroyable.",
                is_spoiler: false,
                is_public: true,
            },
            {
                id_user: users[2].id_user,
                id_book: books[1].id_book,
                content:
                    "Roman prophetique qui resonne encore aujourd'hui. Orwell avait vu juste.",
                is_spoiler: false,
                is_public: true,
            },
        ]);

        console.log('✅ Database seeding completed successfully!');
        console.log('📊 Summary:');
        console.log('  - 2 roles created (admin, user)');
        console.log(
            '  - 8 permissions created (CREATE, READ, UPDATE, DELETE, MODERATE, ADMIN, EXPORT, IMPORT)'
        );
        console.log(`  - ${rolePermissions.length} role-permission associations created`);
        console.log(`  - ${users.length} users created`);
        console.log(`  - ${authors.length} authors created`);
        console.log(`  - ${genres.length} genres created`);
        console.log(`  - ${books.length} books created`);
        console.log(`  - ${libraries.length} libraries created`);
        console.log(`  - ${readingLists.length} reading list entries created`);
        console.log(`  - ${ratings.length} ratings created`);
        console.log(`  - ${notices.length} notices created`);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
}

// Executer le seeding si le script est appele directement
// En ES modules, on utilise import.meta.url au lieu de require.main
if (import.meta.url === `file://${process.argv[1]}`) {
    seedDatabase()
        .then(() => {
            console.log('🎉 Seeding process completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Seeding failed:', error);
            process.exit(1);
        });
}

export { seedDatabase };
