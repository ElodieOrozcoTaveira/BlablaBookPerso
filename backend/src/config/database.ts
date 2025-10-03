import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger .env.test quand NODE_ENV=test (utile pour la CI locale)
if (process.env.NODE_ENV === 'test') {
    dotenv.config({ path: join(__dirname, '../../.env.test'), override: true });
} else {
    dotenv.config();
}

// guard UNIT_NO_DB: je saute l initialisation reelle de la connexion pour les tests unitaires
const unitNoDb = process.env['UNIT_NO_DB'] === '1';

const sequelize = new Sequelize({
    database: process.env['DB_NAME'],
    username: process.env['DB_USER'],
    password: process.env['DB_PASSWORD'],
    host: process.env['DB_HOST'] || 'db',
    port: process.env['DB_PORT'] ? Number(process.env['DB_PORT']) : undefined,
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
    if (unitNoDb) {
        // guard UNIT_NO_DB: je ne tente pas d authentification
        return false;
    }
    try {
        await sequelize.authenticate();
        console.log('[Sequelize] Connection has been established successfully.');
        return true;
    } catch (error) {
        console.error('[Sequelize] Unable to connect to the database:', error);
        return false;
    }
};

if (!unitNoDb) {
    sequelize.authenticate()
      .then(() => console.log('Connexion à la base réussie !'))
      .catch((err) => console.error('Erreur de connexion :', err));
} else {
    // guard UNIT_NO_DB: je desactive authenticate pour eviter le bruit de logs
}

export default sequelize;