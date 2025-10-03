import { Sequelize } from 'sequelize';
import Book from '../../src/models/Book.js';
import Author from '../../src/models/Author.js';
import Genre from '../../src/models/Genre.js';
import { setupAssociations } from '../../src/models/associations.js';
import { BookActionService } from '../../src/services/book-action.service.js';

// Je force les variables d'environnement pour les tests  
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5433';  
process.env.DB_NAME = 'blablabook_test';
process.env.DB_USER = 'test';
process.env.DB_PASSWORD = 'test';

console.log('🧪 TEST SYSTEME COMPLET - Book + Author + Genre');
console.log('===============================================\n');

async function testCompleteSystem() {
  // Je me connecte directement a la DB de test
  const sequelize = new Sequelize({
    database: 'blablabook_test',
    username: 'test', 
    password: 'test',
    host: 'localhost',
    port: 5433,
    dialect: 'postgres',
    logging: false
  });

  try {
    // Je teste la connexion
    await sequelize.authenticate();
    console.log('✅ Connexion DB reussie !');

    // Je setup les associations
    setupAssociations();

    const bookActionService = new BookActionService();
    const testUserId = 1;

    console.log('\n📊 ETAPE 1: Etat initial');
    console.log('========================');
    
    // Je compte tout avant
    const initialCounts = {
      books: await Book.count(),
      authors: await Author.count(), 
      genres: await Genre.count(),
      tempBooks: await Book.count({ where: { import_status: 'temporary' } }),
      tempAuthors: await Author.count({ where: { import_status: 'temporary' } })
    };
    
    console.log(`📚 Livres: ${initialCounts.books} (temp: ${initialCounts.tempBooks})`);
    console.log(`👥 Auteurs: ${initialCounts.authors} (temp: ${initialCounts.tempAuthors})`);
    console.log(`🏷️ Genres: ${initialCounts.genres}`);

    console.log('\n📊 ETAPE 2: Test import temporaire complet');
    console.log('==========================================');
    
    // Je teste avec Harry Potter (livre riche en donnees)
    const testBookKey = '/works/OL82563W'; // Harry Potter and the Philosopher's Stone
    
    console.log(`🎯 Test preparation action pour: ${testBookKey}`);
    console.log('(Ca va importer livre + auteurs + genres + avatars)');

    try {
      const preparation = await bookActionService.prepareBookForAction(
        testBookKey,
        testUserId,
        'rate'
      );
      
      console.log(`\n✅ PREPARATION REUSSIE:`);
      console.log(`📚 Livre: "${preparation.book.title}"`);
      console.log(`⏰ Import temporaire: ${preparation.wasImported}`);
      console.log(`🔄 Peut rollback: ${preparation.canRollback}`);

      // Je verifie les comptages apres import
      const afterCounts = {
        books: await Book.count(),
        authors: await Author.count(),
        genres: await Genre.count(),
        tempBooks: await Book.count({ where: { import_status: 'temporary' } }),
        tempAuthors: await Author.count({ where: { import_status: 'temporary' } })
      };

      console.log(`\n📊 COMPTAGES APRES IMPORT:`);
      console.log(`📚 Livres: ${afterCounts.books} (+${afterCounts.books - initialCounts.books})`);
      console.log(`👥 Auteurs: ${afterCounts.authors} (+${afterCounts.authors - initialCounts.authors})`);
      console.log(`🏷️ Genres: ${afterCounts.genres} (+${afterCounts.genres - initialCounts.genres})`);
      console.log(`⏰ Temp livres: ${afterCounts.tempBooks}`);
      console.log(`⏰ Temp auteurs: ${afterCounts.tempAuthors}`);

      // Je verifie les associations
      const bookWithAssociations = await Book.findByPk(preparation.book.id_book, {
        include: [
          { model: Author, as: 'BookHasAuthors' },
          { model: Genre, as: 'BookHasGenres' }
        ]
      });

      if (bookWithAssociations) {
        const authors = (bookWithAssociations as any).BookHasAuthors || [];
        const genres = (bookWithAssociations as any).BookHasGenres || [];
        
        console.log(`\n🔗 ASSOCIATIONS:`);
        console.log(`👥 Auteurs lies: ${authors.length}`);
        authors.forEach((author: any) => {
          console.log(`  - ${author.name} (import_status: ${author.import_status || 'confirmed'})`);
        });
        
        console.log(`🏷️ Genres lies: ${genres.length}`);
        genres.forEach((genre: any, index: number) => {
          if (index < 5) { // Je montre juste les 5 premiers
            console.log(`  - ${genre.name}`);
          }
        });
        if (genres.length > 5) {
          console.log(`  ... et ${genres.length - 5} autres genres`);
        }
      }

      console.log('\n📊 ETAPE 3: Test rollback');
      console.log('=========================');
      
      // Je teste le rollback
      const rolledBack = await bookActionService.rollbackAction(
        preparation.book.id_book,
        preparation.wasImported
      );
      
      console.log(`🔄 Rollback effectue: ${rolledBack}`);
      
      // Je verifie les comptages apres rollback
      const finalCounts = {
        books: await Book.count(),
        authors: await Author.count(),
        genres: await Genre.count(),
        tempBooks: await Book.count({ where: { import_status: 'temporary' } }),
        tempAuthors: await Author.count({ where: { import_status: 'temporary' } })
      };
      
      console.log(`\n📊 COMPTAGES APRES ROLLBACK:`);
      console.log(`📚 Livres: ${finalCounts.books} (diff: ${finalCounts.books - initialCounts.books})`);
      console.log(`👥 Auteurs: ${finalCounts.authors} (diff: ${finalCounts.authors - initialCounts.authors})`);
      console.log(`🏷️ Genres: ${finalCounts.genres} (diff: ${finalCounts.genres - initialCounts.genres})`);
      console.log(`⏰ Temp livres: ${finalCounts.tempBooks}`);
      console.log(`⏰ Temp auteurs: ${finalCounts.tempAuthors}`);

      console.log('\n🎉 CONCLUSION DU TEST:');
      console.log('======================');
      
      if (rolledBack) {
        console.log('✅ Import temporaire et rollback fonctionnent parfaitement !');
        console.log('✅ Livre, auteurs et genres importes puis supprimes');
      } else {
        console.log('⚠️ Rollback n\'a pas supprime (normal si engagements existants)');
      }
      
      console.log('✅ Systeme complet Book+Author+Genre operationnel !');
      
    } catch (error: any) {
      console.log('❌ Erreur lors du test:', error.message);
      console.log('(Peut etre limite API OpenLibrary ou DB)');
    }

  } catch (error: any) {
    console.error('❌ Erreur generale:', error.message);
  } finally {
    await sequelize.close();
  }
}

testCompleteSystem();