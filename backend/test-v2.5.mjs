import sequelize from './src/config/database.js';
import './src/models/associations.js';
import Book from './src/models/Book.js';
import User from './src/models/User.js';
import Author from './src/models/Author.js';

async function testSync() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connection established');
        
        const tables = await sequelize.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' ORDER BY table_name;');
        console.log('📋 Existing tables:', tables[0].map(t => t.table_name));
        
        // Test basic model operations
        console.log('📚 Testing Book model...');
        const bookCount = await Book.count();
        console.log('   Book count:', bookCount);
        
        console.log('👤 Testing User model...');
        const userCount = await User.count();
        console.log('   User count:', userCount);
        
        console.log('✍️ Testing Author model...');
        const authorCount = await Author.count();
        console.log('   Author count:', authorCount);
        
        // Test new fields exist
        console.log('🔍 Testing new v2.5 fields...');
        const user = await User.findOne();
        if (user) {
            console.log('   User has avatar_url field:', 'avatar_url' in user.dataValues);
        }
        
        const book = await Book.findOne();
        if (book) {
            console.log('   Book has import_status field:', 'import_status' in book.dataValues);
            console.log('   Book has imported_by field:', 'imported_by' in book.dataValues);
        }
        
        console.log('✅ Sequelize/SQL v2.5 synchronization test passed!');
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
        throw error;
    } finally {
        await sequelize.close();
    }
}

testSync();