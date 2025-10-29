import { beforeAll, afterAll, beforeEach } from "@jest/globals";
import { sequelize } from "../src/db/sequelize.js";
/**
 * CONFIGURATION GLOBALE DES TESTS
 */
beforeAll(async () => {
    // Connexion à la base de données de test
    try {
        await sequelize.authenticate();
        console.log("🔌 Base de données de test connectée");
    }
    catch (error) {
        console.error("❌ Erreur connexion BDD test:", error);
        throw error;
    }
});
beforeEach(async () => {
    // Nettoyer la base entre chaque test (optionnel)
    // await sequelize.sync({ force: true });
});
afterAll(async () => {
    // Fermer la connexion après tous les tests
    await sequelize.close();
    console.log("🔌 Connexion BDD fermée");
});
//# sourceMappingURL=setup.js.map