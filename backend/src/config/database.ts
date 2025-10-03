import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
    database: process.env['DB_NAME'],
    username: process.env['DB_USER'],
    password: process.env['DB_PASSWORD'],
    host: process.env['DB_HOST'] || 'db',
    dialect: 'postgres',
    dialectOptions: {
        ssl: process.env['NODE_ENV'] === 'production' ? {require: true, rejectUnauthorized: false} : false
    },
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: (msg) => {
        console.log(`[Sequelize] ${msg}`);
    }
});

export const testConnection = async (): Promise<boolean> => {

    try {
        await sequelize.authenticate();
        console.log('[Sequelize] Connection has been established successfully.');
        return true;
    } catch (error) {
        console.error('[Sequelize] Unable to connect to the database:', error);
        return false;
    }
};

sequelize.authenticate()
  .then(() => console.log('Connexion à la base réussie !'))
  .catch((err) => console.error('Erreur de connexion :', err));

export default sequelize;