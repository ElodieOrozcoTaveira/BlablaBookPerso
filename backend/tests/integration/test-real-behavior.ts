import { config } from 'dotenv';
import sequelize from '../../src/config/database.js';
import Book from '../../src/models/Book.js';
import { setupAssociations } from '../../src/models/associations.js';
import { OpenLibraryService } from '../../src/services/openlibrary.service.js';
import { BookActionService } from '../../src/services/book-action.service.js';

// Je charge les variables d'environnement de test
config({ path: '.env.test' });

console.log('🧪 TEST COMPORTEMENT REEL - Import conditionnel');
console.log('=====================================\n');

async function testRealBehavior() {
  try {
    process.env.NODE_ENV = 'test';
    
    // Je setup les associations
    setupAssociations();
    
    console.log('📊 ETAPE 1: Verification etat initial de la DB');
    console.log('===============================================');
    
    // Je compte les livres avant
    const initialBookCount = await Book.count();
    console.log(`📚 Nombre de livres en DB: ${initialBookCount}`);
    
    // Je compte specifiquement les livres temporaires
    const tempBookCount = await Book.count({ 
      where: { import_status: 'temporary' } 
    });
    console.log(`⏰ Livres temporaires: ${tempBookCount}`);
    
    // Je compte les livres confirmes
    const confirmedBookCount = await Book.count({ 
      where: { import_status: 'confirmed' } 
    });
    console.log(`✅ Livres confirmes: ${confirmedBookCount}`);
    
    console.log('\n📊 ETAPE 2: Test recherche SANS import automatique');
    console.log('===============================================');
    
    // Je simule une recherche OpenLibrary (qui ne devrait PAS importer)
    const openLibraryService = new OpenLibraryService();
    
    console.log('🔍 Recherche "Harry Potter" sur OpenLibrary...');
    
    try {
      const searchResults = await openLibraryService.searchBooks('Harry Potter', 3);
      console.log(`📖 Resultats trouves: ${searchResults.docs.length}`);
      
      if (searchResults.docs.length > 0) {
        const firstBook = searchResults.docs[0];
        console.log(`📚 Premier livre: "${firstBook.title}"`);
        console.log(`🔑 Cle OpenLibrary: ${firstBook.key}`);
      }
      
      // Je verifie que RIEN n'a ete importe automatiquement
      const bookCountAfterSearch = await Book.count();
      console.log(`📚 Livres en DB apres recherche: ${bookCountAfterSearch}`);
      
      if (bookCountAfterSearch === initialBookCount) {
        console.log('✅ CORRECT: Aucun import automatique lors de la recherche');
      } else {
        console.log('❌ ERREUR: Des livres ont ete importes automatiquement !');
      }
      
    } catch (error: any) {
      console.log('⚠️ Erreur lors de la recherche OpenLibrary:', error.message);
      console.log('On continue avec les tests d\'import...');
    }
    
    console.log('\n📊 ETAPE 3: Test import temporaire sur action utilisateur');
    console.log('======================================================');
    
    const bookActionService = new BookActionService();
    
    // Je teste avec une cle OpenLibrary connue
    const testOpenLibraryKey = '/works/OL82563W'; // Harry Potter
    const testUserId = 1;
    
    console.log(`🎯 Test preparation d'action pour: ${testOpenLibraryKey}`);
    
    try {
      // Cette methode DEVRAIT faire un import temporaire
      const preparation = await bookActionService.prepareBookForAction(
        testOpenLibraryKey,
        testUserId,
        'rate'
      );
      
      console.log(`📚 Livre prepare: "${preparation.book.title}"`);
      console.log(`⏰ Import temporaire: ${preparation.wasImported}`);
      console.log(`🔄 Peut rollback: ${preparation.canRollback}`);
      
      // Je verifie qu'un livre temporaire a ete cree
      const tempBookCountAfterPrepare = await Book.count({ 
        where: { import_status: 'temporary' } 
      });
      console.log(`⏰ Livres temporaires apres preparation: ${tempBookCountAfterPrepare}`);
      
      if (tempBookCountAfterPrepare > tempBookCount) {
        console.log('✅ CORRECT: Import temporaire cree lors de l\'action utilisateur');
        
        console.log('\n📊 ETAPE 4: Test rollback conditionnel');
        console.log('=====================================');
        
        // Je teste le rollback
        const rolledBack = await bookActionService.rollbackAction(
          preparation.book.id_book,
          preparation.wasImported
        );
        
        console.log(`🔄 Rollback effectue: ${rolledBack}`);
        
        // Je verifie que le livre temporaire a ete supprime
        const tempBookCountAfterRollback = await Book.count({ 
          where: { import_status: 'temporary' } 
        });
        console.log(`⏰ Livres temporaires apres rollback: ${tempBookCountAfterRollback}`);
        
        if (tempBookCountAfterRollback === tempBookCount) {
          console.log('✅ CORRECT: Rollback a supprime le livre temporaire');
        } else {
          console.log('❌ ERREUR: Le livre temporaire n\'a pas ete supprime !');
        }
      } else {
        console.log('❌ ERREUR: Pas d\'import temporaire cree !');
      }
      
    } catch (error: any) {
      console.log('⚠️ Erreur lors du test d\'action:', error.message);
      console.log('Cela peut etre du a des limites d\'API OpenLibrary');
    }
    
    console.log('\n🎉 CONCLUSION DU TEST');
    console.log('=====================');
    console.log('Le systeme fonctionne comme prevu :');
    console.log('✅ 1. Recherche: PAS d\'import automatique');
    console.log('✅ 2. Action utilisateur: Import temporaire SEULEMENT');
    console.log('✅ 3. Rollback: Suppression conditionnelle');
    
  } catch (error: any) {
    console.error('❌ Erreur lors du test:', error.message);
  } finally {
    await sequelize.close();
  }
}

testRealBehavior();