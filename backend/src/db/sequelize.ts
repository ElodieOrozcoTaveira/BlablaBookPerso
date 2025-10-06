import { Sequelize } from "sequelize";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Équivalent de __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charge le .env depuis la racine du projet
config({ path: path.resolve(__dirname, "../../../.env") });

// Vérification que les variables DB sont définies
if (
  !process.env.DB_HOST ||
  !process.env.DB_USER ||
  !process.env.DB_PASSWORD ||
  !process.env.DB_NAME
) {
  throw new Error(
    "Database environment variables (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) are not defined"
  );
}

// Création de l'instance de connexion de sequelize avec variables séparées
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),//parseInt permet de transformer "5432" en string car les variables d'env sont toujours des strings
    dialect: "postgres",
    define: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

export { sequelize };
