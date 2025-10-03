import { BookActionService } from './src/services/book-action.service.js';
import sequelize from './src/config/database.js';
import { setupAssociations } from './src/models/associations.js';
import User from './src/models/User.js';
import Book from './src/models/Book.js';
import Author from './src/models/Author.js';
import * as argon2 from 'argon2';

// Configure associations
setupAssociations();

async function testImportSystem() {
    try {
        console.log('🔄 Testing temporary import system...');
        
        // 1. Créer ou récupérer un utilisateur de test
        console.log('👤 Creating/finding test user...');
        const hashedPassword = await argon2.hash('test123');
        const [user, created] = await User.findOrCreate({
            where: { username: 'testuser' },
            defaults: {
                firstname: 'Test',
                lastname: 'User', 
                username: 'testuser',
                email: 'test@example.com',
                password: hashedPassword
            }
        });
        console.log('   User', created ? 'created' : 'found', 'with ID:', user.id_user);
        
        // 2. Test import temporaire d'un livre
        console.log('📚 Testing temporary book import...');
        const bookActionService = new BookActionService();
        
        // Livre de test (Open Library key réelle)
        const testOpenLibraryKey = '/works/OL45804W'; // The Hobbit
        
        const bookPreparation = await bookActionService.prepareBookForAction(
            testOpenLibraryKey,
            user.id_user,
            'rate'
        );
        
        console.log('   Book preparation result:');
        console.log('   - Was imported:', bookPreparation.wasImported);
        console.log('   - Can rollback:', bookPreparation.canRollback);
        console.log('   - Book title:', bookPreparation.book.title);
        console.log('   - Import status:', bookPreparation.book.import_status);
        console.log('   - Imported by:', bookPreparation.book.imported_by);
        
        // 3. Test confirmation d'import
        console.log('⭐ Testing import confirmation with rating...');
        await bookActionService.commitAction({
            bookId: bookPreparation.book.id_book,
            userId: user.id_user,
            action: 'rate',
            data: { rating: 5 },
            wasImported: bookPreparation.wasImported
        });
        
        // Vérifier que le statut a changé
        await bookPreparation.book.reload();
        console.log('   Import status after commit:', bookPreparation.book.import_status);
        
        // 4. Test rollback (avec un nouveau livre)
        console.log('🔄 Testing rollback system...');
        const testKey2 = '/works/OL362427W'; // Another test book
        
        const bookPreparation2 = await bookActionService.prepareBookForAction(
            testKey2,
            user.id_user,
            'review'
        );
        
        console.log('   Second book imported temporarily');
        console.log('   - Title:', bookPreparation2.book.title);
        
        // Rollback sans commit
        const rolledBack = await bookActionService.rollbackAction(
            bookPreparation2.book.id_book,
            bookPreparation2.wasImported
        );
        
        console.log('   Rollback successful:', rolledBack);
        
        // 5. Test cleanup des imports temporaires anciens
        console.log('🧹 Testing cleanup system...');
        const cleanedUp = await bookActionService.cleanupTemporaryImports(0); // 0 minutes = tous
        console.log('   Cleaned up imports:', cleanedUp);
        
        console.log('✅ Temporary import system test completed successfully!');
        
    } catch (error) {
        console.error('❌ Import system test failed:', error.message);
        console.error(error.stack);
        throw error;
    } finally {
        await sequelize.close();
    }
}

testImportSystem();