import sequelize from '../../src/config/database.js';
import User from '../../src/models/User.js';
import Author from '../../src/models/Author.js';
import Genre from '../../src/models/Genre.js';
import Book from '../../src/models/Book.js';
import Library from '../../src/models/Library.js';
import ReadingList from '../../src/models/ReadingList.js';
import Rate from '../../src/models/Rate.js';
import Notice from '../../src/models/Notice.js';
import Role from '../../src/models/Role.js';
import Permission from '../../src/models/Permission.js';
import RolePermission from '../../src/models/RolePermission.js';
import UserRole from '../../src/models/UserRole.js';
import * as argon2 from 'argon2';
import dotenv from 'dotenv';

// Import des associations
import '../../src/models/associations.js';

dotenv.config();

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');

    // Verifier la connexion
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // S'assurer que le schéma est créé (dev only). Crée les tables manquantes.
    console.log('🛠️ Synchronizing models (creating missing tables if any)...');
    await sequelize.sync();
    console.log('✅ Schema sync complete');

        // 1. Creer les roles de base (selon blablabook_schema_v2.5.sql)
        console.log('👥 Creating roles...');

        const [adminRole] = await Role.findOrCreate({
            where: { name: 'admin' },
            defaults: {
                name: 'admin',
                description: 'Administrateur systeme avec tous les droits',
            }
        });

        const [userRole] = await Role.findOrCreate({
            where: { name: 'user' },
            defaults: {
                name: 'user',
                description: 'Utilisateur standard',
            }
        });

        // 2. Creer des permissions de base (selon blablabook_schema_v2.5.sql)
        console.log('🔐 Creating permissions...');

        const permissionData = [
            // Permissions generiques
            { label: 'CREATE', action: 'Creer du contenu' },
            { label: 'READ', action: 'Lire le contenu' },
            { label: 'UPDATE', action: 'Modifier le contenu' },
            { label: 'DELETE', action: 'Supprimer le contenu' },
            { label: 'MODERATE', action: 'Moderer le contenu' },

            // Permissions specifiques existantes
            { label: 'ADMIN_USERS', action: 'Administrer les utilisateurs' },
            { label: 'VIEW_USER_STATS', action: 'Voir les statistiques utilisateurs' },
            { label: 'CREATE_AUTHOR', action: 'Creer des auteurs' },
            { label: 'UPDATE_AUTHOR', action: 'Modifier des auteurs' },
            { label: 'DELETE_AUTHOR', action: 'Supprimer des auteurs' },

            // Nouvelles permissions ressources Genre
            { label: 'CREATE_GENRE', action: 'Creer des genres' },
            { label: 'UPDATE_GENRE', action: 'Modifier des genres' },
            { label: 'DELETE_GENRE', action: 'Supprimer des genres' },

            // Nouvelles permissions ressources Book
            { label: 'CREATE_BOOK', action: 'Creer des livres' },
            { label: 'UPDATE_BOOK', action: 'Modifier des livres' },
            { label: 'DELETE_BOOK', action: 'Supprimer des livres' },

            // Administration systeme / operations transverses
            { label: 'ADMIN', action: 'Administration systeme' },
            { label: 'EXPORT', action: 'Exporter des donnees' },
            { label: 'IMPORT', action: 'Importer des donnees' },
        ];

        // Créer les permissions individuellement avec findOrCreate
        const permissions = [];
        for (const permData of permissionData) {
            const [permission] = await Permission.findOrCreate({
                where: { label: permData.label },
                defaults: permData
            });
            permissions.push(permission);
        }

        // 3. Creer les associations roles-permissions (selon blablabook_schema_v2.5.sql)
        console.log('🔗 Creating role-permission associations...');

        // Vérifier que nous avons bien tous les objets nécessaires
        console.log('Admin role ID:', adminRole.get('id_role'));
        console.log('User role ID:', userRole.get('id_role'));
        console.log('Permissions count:', permissions.length);
        console.log('First permission ID:', permissions[0].get('id_permission'));

        // Admin: toutes les permissions
        for (const p of permissions) {
            await RolePermission.findOrCreate({
                where: { id_role: adminRole.get('id_role'), id_permission: p.get('id_permission') },
                defaults: { id_role: adminRole.get('id_role') as number, id_permission: p.get('id_permission') as number }
            });
        }

    // User: permissions generiques minimales (CREATE, READ, UPDATE)
    const userAllowed = ['CREATE', 'READ', 'UPDATE'];
        for (const label of userAllowed) {
            const perm = permissions.find(p => p.get('label') === label);
            if (perm) {
                await RolePermission.findOrCreate({
                    where: { id_role: userRole.get('id_role'), id_permission: perm.get('id_permission') },
                    defaults: { id_role: userRole.get('id_role') as number, id_permission: perm.get('id_permission') as number }
                });
            }
        }

        // 4. Creer des utilisateurs de test (idempotent)
        console.log('👤 Ensuring test users...');

        const defaultPassword = 'password123';
        const userSpecs: Array<{ firstname: string; lastname: string; username: string; email: string; rawPassword?: string; roleHint?: 'admin'|'user'; }> = [
            { firstname: 'Admin', lastname: 'User', username: 'admin', email: 'admin@blablabook.com', roleHint: 'admin', rawPassword: defaultPassword },
            { firstname: 'John', lastname: 'Doe', username: 'johndoe', email: 'john@example.com', roleHint: 'user', rawPassword: defaultPassword },
            { firstname: 'Jane', lastname: 'Smith', username: 'janesmith', email: 'jane@example.com', roleHint: 'user', rawPassword: defaultPassword },
            // NOTE: Les comptes admin1 / user1 ne sont plus seedés ici pour éviter de lier la fixture métier au besoin strict de tests.
            // Ils sont désormais créés dynamiquement dans tests/utils/test-users.ts (voir tests/setup.ts) afin de garder le seeder "métier" propre.
        ];

        const users: User[] = [];
        for (const spec of userSpecs) {
            const passwordHash = await argon2.hash(spec.rawPassword || defaultPassword);
            const { rawPassword, roleHint, ...publicFields } = spec;
            const [u] = await User.findOrCreate({
                where: { username: spec.username },
                defaults: {
                    ...publicFields,
                    password: passwordHash,
                    connected_at: new Date(),
                    created_at: new Date(),
                }
            });
            users.push(u);
        }

        // 5. Associer les utilisateurs aux roles (idempotent)
        console.log('🔗 Ensuring user-role associations...');

        const userRoleLinks: Array<{ userIndex: number; role: Role }> = [
            { userIndex: 0, role: adminRole },      // admin
            { userIndex: 1, role: userRole },       // johndoe
            { userIndex: 2, role: userRole },       // janesmith
        ];
        for (const link of userRoleLinks) {
            await UserRole.findOrCreate({
                where: { id_user: users[link.userIndex].get('id_user'), id_role: link.role.get('id_role') },
                defaults: { id_user: users[link.userIndex].get('id_user') as number, id_role: link.role.get('id_role') as number }
            });
        }

        // Rôle spécifique test pour donner EXPORT uniquement à l'utilisateur "user" (john) sans l'accorder à user2
        if (process.env.NODE_ENV === 'test') {
            const [exporterRole] = await Role.findOrCreate({
                where: { name: 'exporter' },
                defaults: { name: 'exporter', description: 'Role de test pour permission EXPORT' }
            });
            const exportPerm = permissions.find(p => p.get('label') === 'EXPORT');
            if (exportPerm) {
                await RolePermission.findOrCreate({
                    where: { id_role: exporterRole.get('id_role'), id_permission: exportPerm.get('id_permission') },
                    defaults: { id_role: exporterRole.get('id_role') as number, id_permission: exportPerm.get('id_permission') as number }
                });
            }
            // Assign to john only (users[1])
            await UserRole.findOrCreate({
                where: { id_user: users[1].get('id_user'), id_role: exporterRole.get('id_role') },
                defaults: { id_user: users[1].get('id_user') as number, id_role: exporterRole.get('id_role') as number }
            });
        }

        // 6. Creer des genres (idempotent)
        console.log('📚 Ensuring genres...');
        const genreNames = ['Science-Fiction', 'Fantasy', 'Romance', 'Thriller', 'Mystery'];
        const genres: Genre[] = [];
        for (const name of genreNames) {
            const [g] = await Genre.findOrCreate({ where: { name }, defaults: { name } });
            genres.push(g);
        }

        // 7. Creer des auteurs (idempotent)
        console.log('✍️ Ensuring authors...');
        const authorSpecs = [
            { name: 'J.R.R. Tolkien', bio: 'Auteur britannique celebre pour Le Seigneur des Anneaux', birth_date: new Date('1892-01-03'), death_date: new Date('1973-09-02') },
            { name: 'George Orwell', bio: 'ecrivain britannique connu pour 1984', birth_date: new Date('1903-06-25'), death_date: new Date('1950-01-21') },
            { name: 'Agatha Christie', bio: 'Romanciere britannique, reine du crime', birth_date: new Date('1890-09-15'), death_date: new Date('1976-01-12') },
        ];
        const authors: Author[] = [];
        for (const spec of authorSpecs) {
            const [a] = await Author.findOrCreate({ where: { name: spec.name }, defaults: spec });
            authors.push(a);
        }

        // 8. Creer des livres (idempotent)
        console.log('📖 Ensuring books...');
        const bookSpecs = [
            { isbn: '9780007149247', title: "Le Seigneur des Anneaux : La Communaute de l'Anneau", description: 'Premier tome de la trilogie epique de Tolkien', publication_year: 1954, page_count: 423, language: 'français' },
            { isbn: '9780451524935', title: '1984', description: 'Roman dystopique sur la surveillance totalitaire', publication_year: 1949, page_count: 328, language: 'français' },
            { isbn: '9780062073488', title: "Le Crime de l'Orient-Express", description: 'Enquête de Hercule Poirot dans un train', publication_year: 1934, page_count: 256, language: 'français' },
        ];
        const books: Book[] = [];
        for (const spec of bookSpecs) {
            const [b] = await Book.findOrCreate({ where: { isbn: spec.isbn }, defaults: spec });
            books.push(b);
        }

        // 9. Creer des bibliotheques (idempotent)
        console.log('🏛️ Ensuring libraries...');
        const librarySpecs = [
            { id_user: users[1].get('id_user') as number, name: 'Ma Collection Fantasy', description: 'Mes livres de fantasy preferes', is_public: true },
            { id_user: users[2].get('id_user') as number, name: 'Classiques Litteraires', description: 'Collection de grands classiques', is_public: true },
        ];
        const libraries: Library[] = [];
        for (const spec of librarySpecs) {
            const [l] = await Library.findOrCreate({ where: { name: spec.name, id_user: spec.id_user }, defaults: spec });
            libraries.push(l);
        }

    // 10. Creer des listes de lecture (idempotent)
    console.log('📋 Ensuring reading lists...');

        // Récupération sûre des IDs (évite le problème de shadowing des champs publics)
        const lib1Id = libraries[0].getDataValue('id_library');
        const lib2Id = libraries[1].getDataValue('id_library');
        const book1Id = books[0].getDataValue('id_book');
        const book2Id = books[1].getDataValue('id_book');

        const readingListSpecs = [
            { id_library: lib1Id, id_book: book1Id, reading_status: 'read' as 'read', added_at: new Date() },
            { id_library: lib2Id, id_book: book2Id, reading_status: 'reading' as 'reading', added_at: new Date() },
        ];
        const readingLists: ReadingList[] = [];
        for (const spec of readingListSpecs) {
            const [rl] = await ReadingList.findOrCreate({ where: { id_library: spec.id_library, id_book: spec.id_book }, defaults: spec });
            readingLists.push(rl);
        }

    // 11. Creer des evaluations (idempotent)
    console.log('⭐ Ensuring ratings...');

        const ratingSpecs = [
            { id_user: users[1].getDataValue('id_user'), id_book: book1Id, rating: 5 },
            { id_user: users[2].getDataValue('id_user'), id_book: book2Id, rating: 4 },
        ];
        const ratings: Rate[] = [];
        for (const spec of ratingSpecs) {
            const [r] = await Rate.findOrCreate({ where: { id_user: spec.id_user, id_book: spec.id_book }, defaults: spec });
            ratings.push(r);
        }

    // 12. Creer des avis/commentaires (idempotent)
    console.log('💬 Ensuring notices...');

        const noticeSpecs = [
            { id_user: users[1].getDataValue('id_user'), id_book: book1Id, content: "Un chef-d'œuvre absolu de la fantasy ! L'univers de Tolkien est d'une richesse incroyable.", is_spoiler: false, is_public: true },
            { id_user: users[2].getDataValue('id_user'), id_book: book2Id, content: "Roman prophetique qui resonne encore aujourd'hui. Orwell avait vu juste.", is_spoiler: false, is_public: true },
        ];
        const notices: Notice[] = [];
        for (const spec of noticeSpecs) {
            const [n] = await Notice.findOrCreate({ where: { id_user: spec.id_user, id_book: spec.id_book }, defaults: spec });
            notices.push(n);
        }

    console.log('✅ Database seeding completed successfully!');
    console.log('📊 Summary (idempotent):');
    console.log('  - 2 roles ensured (admin, user)');
    console.log(`  - ${permissions.length} permissions ensured (${permissionData.map(p => p.label).join(', ')})`);
    console.log('  - Role-permission associations ensured (idempotent)');
        console.log(`  - ${users.length} users ensured`);
        console.log(`  - ${authors.length} authors ensured`);
        console.log(`  - ${genres.length} genres ensured`);
        console.log(`  - ${books.length} books ensured`);
        console.log(`  - ${libraries.length} libraries ensured`);
        console.log(`  - ${readingLists.length} reading list entries ensured`);
        console.log(`  - ${ratings.length} ratings ensured`);
        console.log(`  - ${notices.length} notices ensured`);
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
