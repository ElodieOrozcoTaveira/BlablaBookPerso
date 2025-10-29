import { sequelize } from "../db/sequelize.js";

// Import de tous les modèles pour les créer à partir du script de création de tables

// Import des associations pour créer les relations
import "../models/association.js";

/**
 * Script pour créer toutes les tables de la base de données, Sequelize va synchroniser les modèles avec la BDD
 */
async function createTables() {
  try {
    console.log("Connexion à la base de données 🏁...");

    // Test de la connexion
    await sequelize.authenticate();
    console.log("✅ Connexion réussie !");

    console.log("📝 Création des tables...");

    await sequelize.sync({
      force: true, //Supprime et recrée les tables
      alter: true, // Modifie les tables existantes
    });

    console.log(" Tables créées avec succès !😃");
    console.log(" Tables disponibles👌");
  } catch (error) {
    console.error("❌ Erreur lors de la création des tables :", error);
  } finally {
    // Fermeture de la connexion
    await sequelize.close();
    console.log("🔒 Connexion fermée.");
  }
}

// Exécution du script
createTables();
