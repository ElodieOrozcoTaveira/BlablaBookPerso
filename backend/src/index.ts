// Import du framework Express pour créer le serveur web
import express from "express";
import cors from "cors";
import helmet from "helmet";

// Import des middlewares
import { sessionConfig } from "./middlewares/sessionMiddleware.js";
import apiRoutes from "./routes/index.js";

// Chargement des variables d'environnement
import { sequelize } from "./db/sequelize.js";

// Création de l'application Express
const app = express();

// Définition du port d'écoute
const port = process.env.PORT || 3000;

/**
 * CONFIGURATION DES MIDDLEWARES DE SÉCURITÉ (SIMPLE)
 */

// Protection basique des en-têtes HTTP avec Helmet
app.use(helmet());

// CORS pour permettre les requêtes depuis le frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true, // Important pour les cookies de session (withCrédentials dans authstore)
  })
);

// Middleware pour parser les requêtes JSON (simple)
app.use(express.json({ limit: "10mb" }));

// Middleware pour parser les données de formulaire
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Configuration des sessions avec Redis
app.use(sessionConfig);

/**
 * CONFIGURATION DES ROUTES
 */

// Routes API principales
app.use("/api", apiRoutes);

// Route de santé pour vérifier que le serveur fonctionne
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "🚀 Serveur BlablaBook en fonctionnement !",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Route pour les routes non trouvées (middleware catch-all)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route non trouvée",
    path: req.originalUrl,
    availableRoutes: {
      api: "/api",
      health: "/health",
      auth: "/api/auth/*",
      users: "/api/users/*",
    },
  });
});

/**
 * DÉMARRAGE DU SERVEUR
 */
async function startServer() {
  try {
    // Test de la connexion à la base de données
    console.log("🔌 Connexion à la base de données...");
    await sequelize.authenticate();
    console.log("✅ Base de données connectée avec succès !");

    // Démarrage du serveur
    app.listen(port, () => {
      console.log(`🌐 Serveur BlablaBook démarré sur http://localhost:${port}`);
      console.log(`📚 API disponible sur http://localhost:${port}/api`);
      console.log(`🩺 Health check sur http://localhost:${port}/health`);
      console.log(
        `🗄️ Base de données : ${process.env.DB_NAME}@${process.env.DB_HOST}`
      );
    });
  } catch (error) {
    console.error("❌ Erreur lors du démarrage du serveur:", error);
    process.exit(1);
  }
}

// Démarrage du serveur
startServer();
