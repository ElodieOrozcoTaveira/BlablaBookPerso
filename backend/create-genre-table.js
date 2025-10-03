import { Sequelize } from 'sequelize';

console.log('🔧 CREATION TABLE GENRE');
console.log('========================\n');

async function createGenreTable() {
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
    
    // Je cree la table GENRE manuellement
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "GENRE" (
        "id_genre" SERIAL PRIMARY KEY,
        "name" VARCHAR(100) NOT NULL UNIQUE,
        "description" TEXT,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('✅ Table GENRE creee !');
    
    // Je cree aussi la table BOOK_GENRE pour les associations many-to-many
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "BOOK_GENRE" (
        "id_book" INTEGER REFERENCES "BOOK"("id_book") ON DELETE CASCADE,
        "id_genre" INTEGER REFERENCES "GENRE"("id_genre") ON DELETE CASCADE,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY ("id_book", "id_genre")
      );
    `);
    
    console.log('✅ Table BOOK_GENRE creee !');
    
    // Je verifie les nouvelles tables
    const [results] = await sequelize.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;");
    console.log('\n📊 Tables existantes:');
    results.forEach(row => console.log(`  - ${row.tablename}`));

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

createGenreTable();