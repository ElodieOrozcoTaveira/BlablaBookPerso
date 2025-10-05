import { Sequelize } from 'sequelize';
import 'dotenv/config';

// Vérification que DB_URL est défini
if (!process.env.DB_URL) {
    throw new Error('DB_URL environment variable is not defined');
}

// Création de l'instance de connexion de sequelize
const client = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    define: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
});

export { client };