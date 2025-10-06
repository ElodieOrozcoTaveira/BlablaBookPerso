// Import du framework Express pour créer le serveur web
import express from "express";

// Création de l'application Express
const app = express();

// Définition du port d'écoute : utilise la variable d'environnement PORT ou 3000 par défaut
const port = process.env.PORT || 3000;

// Middleware pour parser automatiquement les requêtes JSON en objets JavaScript
app.use(express.json());

// Route GET sur la racine '/' qui renvoie un message de bienvenue
app.get("/", (req, res) => {
  // Envoi d'une réponse simple au client
  res.send("Hello World!");
});

// Démarrage du serveur sur le port spécifié
app.listen(port, () => {
  // Message de confirmation affiché dans la console une fois le serveur démarré
  console.log(`Server is running on http://localhost:${port}`);
});
