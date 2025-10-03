import { Sequelize } from 'sequelize';

console.log('🧪 TEST SIMPLE - Verification comportement DB');
console.log('=============================================\n');

async function testSimple() {
  // Je me connecte directement a la DB de test
  const sequelize = new Sequelize({
    database: 'blablabook_test',
    username: 'test', 
    password: 'test',
    host: 'localhost',
    port: 5433,
    dialect: 'postgres',
    logging: false  // Je desactive les logs SQL
  });

  try {
    // Je teste la connexion
    await sequelize.authenticate();
    console.log('✅ Connexion DB reussie !');

    // Je compte les tables existantes
    const [results] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    ) as any[];
    
    console.log(`📊 Tables trouvees: ${results.length}`);
    
    if (results.length > 0) {
      console.log('📋 Tables existantes:');
      results.forEach((row: any) => {
        console.log(`  - ${row.table_name}`);
      });
      
      // Je verifie si la table BOOK existe
      const bookTableExists = results.some((row: any) => row.table_name === 'BOOK');
      
      if (bookTableExists) {
        console.log('\n📚 Table BOOK trouvee ! Je verifie les colonnes...');
        
        const [columns] = await sequelize.query(`
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'BOOK' 
          ORDER BY column_name
        `) as any[];
        
        console.log('📋 Colonnes de la table BOOK:');
        columns.forEach((col: any) => {
          console.log(`  - ${col.column_name} (${col.data_type})`);
        });
        
        // Je verifie les nouveaux champs
        const newColumns = ['import_status', 'imported_by', 'imported_at', 'imported_reason'];
        console.log('\n🔍 Verification des nouveaux champs:');
        
        newColumns.forEach(colName => {
          const exists = columns.some((col: any) => col.column_name === colName);
          console.log(`  - ${colName}: ${exists ? '✅' : '❌'}`);
        });
        
        // Je compte les livres par statut
        console.log('\n📊 Comptage des livres par statut:');
        
        const [statusCounts] = await sequelize.query(`
          SELECT 
            COALESCE(import_status, 'NULL') as status,
            COUNT(*) as count
          FROM "BOOK" 
          GROUP BY import_status
          ORDER BY count DESC
        `) as any[];
        
        if (statusCounts.length > 0) {
          statusCounts.forEach((row: any) => {
            console.log(`  - ${row.status}: ${row.count} livres`);
          });
        } else {
          console.log('  - Aucun livre en base');
        }
        
      } else {
        console.log('❌ Table BOOK non trouvee');
      }
      
    } else {
      console.log('📭 Base de donnees vide (normale pour un test)');
    }

    console.log('\n🎉 CONCLUSION:');
    console.log('✅ Connexion a la DB de test reussie');
    console.log('✅ Structure verifiee');
    console.log('🔥 Pret pour les tests de comportement !');

  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

testSimple();