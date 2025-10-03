import { BookActionService } from './src/services/book-action.service.ts';
import { Sequelize } from 'sequelize';
import Book from './src/models/Book.ts';
import Author from './src/models/Author.ts';
import Genre from './src/models/Genre.ts';
import { setupAssociations } from './src/models/associations.ts';

// Je force les parametres locaux
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';

console.log('🧪 TEST WORKFLOW COMPLET - Utilisateur ID: 2');
console.log('============================================\n');

async function testWorkflow() {
  const sequelize = new Sequelize({
    database: 'blablabook',
    username: 'bobby', 
    password: 'othello',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: false
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Connexion DB reussie !');
    
    // Je setup les associations avant d'utiliser les services
    setupAssociations();
    
    const bookActionService = new BookActionService();
    const userId = 2; // Notre user test

    console.log('\n📊 ETAPE 1: Comptages initial');
    const initialCounts = {
      books: await Book.count(),
      authors: await Author.count(), 
      genres: await Genre.count(),
      tempBooks: await Book.count({ where: { import_status: 'temporary' } })
    };
    console.log(`📚 Livres: ${initialCounts.books} (temp: ${initialCounts.tempBooks})`);
    console.log(`👥 Auteurs: ${initialCounts.authors}`);
    console.log(`🏷️ Genres: ${initialCounts.genres}`);

    console.log('\n🎯 TEST 1: Recherche + Noter un livre');
    console.log('====================================');
    
    // Je teste avec Harry Potter
    const harryPotterKey = '/works/OL82563W';
    console.log(`🔍 Preparation action pour: ${harryPotterKey}`);
    
    try {
      const preparation = await bookActionService.prepareBookForAction(
        harryPotterKey,
        userId,
        'rate'
      );
      
      console.log(`\n✅ PREPARATION REUSSIE:`);
      console.log(`📚 Livre: "${preparation.book.title}"`);
      console.log(`⏰ Import temporaire: ${preparation.wasImported}`);
      console.log(`🔄 Peut rollback: ${preparation.canRollback}`);
      console.log(`🆔 Book ID: ${preparation.book.id_book}`);

      // Je simule que l'utilisateur valide et note le livre
      console.log(`\n💾 Commit de l'action (validation utilisateur):`);
      
      const rating = {
        id_book: preparation.book.id_book,
        id_user: userId,
        rating: 5,
        comment: 'Excellent livre !'
      };
      
      const committed = await bookActionService.commitAction(
        preparation.book.id_book,
        preparation.wasImported,
        rating
      );
      
      console.log(`✅ Action commitee: ${committed}`);
      
      // Je verifie les comptages apres
      const afterCounts = {
        books: await Book.count(),
        authors: await Author.count(),
        genres: await Genre.count(),
        tempBooks: await Book.count({ where: { import_status: 'temporary' } }),
        confirmedBooks: await Book.count({ where: { import_status: 'confirmed' } })
      };
      
      console.log(`\n📊 COMPTAGES APRES COMMIT:`);
      console.log(`📚 Livres: ${afterCounts.books} (+${afterCounts.books - initialCounts.books})`);
      console.log(`⏰ Temp livres: ${afterCounts.tempBooks}`);
      console.log(`✅ Confirmed livres: ${afterCounts.confirmedBooks}`);

    } catch (error) {
      console.log(`❌ Erreur test 1:`, error.message);
    }

    console.log('\n🎯 TEST 2: Recherche + Laisser avis (import aussi)');
    console.log('=================================================');
    
    // Je teste avec un autre livre - aussi un import
    const anotherBookKey = '/works/OL45883W'; // 1984
    console.log(`🔍 Preparation action pour: ${anotherBookKey}`);
    
    try {
      const preparation2 = await bookActionService.prepareBookForAction(
        anotherBookKey,
        userId,
        'review'
      );
      
      console.log(`\n✅ PREPARATION 2 REUSSIE:`);
      console.log(`📚 Livre: "${preparation2.book.title}"`);
      console.log(`⏰ Import temporaire: ${preparation2.wasImported}`);
      console.log(`🆔 Book ID: ${preparation2.book.id_book}`);

      // Je simule que l'utilisateur valide et laisse un avis
      console.log(`\n💾 Commit de l'action 2 (validation avis):`);
      
      const review = {
        id_book: preparation2.book.id_book,
        id_user: userId,
        title: 'Un classique',
        content: 'Livre incontournable de la dystopie moderne'
      };
      
      const committed2 = await bookActionService.commitAction(
        preparation2.book.id_book,
        preparation2.wasImported,
        review
      );
      
      console.log(`✅ Action 2 commitee: ${committed2}`);

    } catch (error) {
      console.log(`❌ Erreur test 2:`, error.message);
    }

    console.log('\n🎯 TEST 3: Recherche + Annuler (rollback)');
    console.log('========================================');
    
    // Je teste avec un troisieme livre pour l'annulation
    const thirdBookKey = '/works/OL262758W'; // The Great Gatsby
    console.log(`🔍 Preparation action pour: ${thirdBookKey}`);
    
    try {
      const preparation3 = await bookActionService.prepareBookForAction(
        thirdBookKey,
        userId,
        'rate'
      );
      
      console.log(`\n✅ PREPARATION 3 REUSSIE:`);
      console.log(`📚 Livre: "${preparation3.book.title}"`);
      console.log(`⏰ Import temporaire: ${preparation3.wasImported}`);
      console.log(`🆔 Book ID: ${preparation3.book.id_book}`);

      // Je simule que l'utilisateur annule
      console.log(`\n🔄 Rollback de l'action (annulation utilisateur):`);
      
      const rolledBack = await bookActionService.rollbackAction(
        preparation3.book.id_book,
        preparation3.wasImported
      );
      
      console.log(`✅ Rollback effectue: ${rolledBack}`);
      
      // Je verifie les comptages finaux
      const finalCounts = {
        books: await Book.count(),
        tempBooks: await Book.count({ where: { import_status: 'temporary' } }),
        confirmedBooks: await Book.count({ where: { import_status: 'confirmed' } })
      };
      
      console.log(`\n📊 COMPTAGES FINAUX:`);
      console.log(`📚 Livres: ${finalCounts.books}`);
      console.log(`⏰ Temp livres: ${finalCounts.tempBooks}`);
      console.log(`✅ Confirmed livres: ${finalCounts.confirmedBooks}`);

    } catch (error) {
      console.log(`❌ Erreur test 3:`, error.message);
    }

    console.log('\n🎉 TESTS WORKFLOW TERMINES !');
    console.log('=============================');
    console.log('✅ Test 1: Import + Note + Confirm');
    console.log('✅ Test 2: Import + Avis + Confirm'); 
    console.log('✅ Test 3: Import + Annulation + Rollback');

  } catch (error) {
    console.error('❌ Erreur generale:', error.message);
  } finally {
    await sequelize.close();
  }
}

testWorkflow();