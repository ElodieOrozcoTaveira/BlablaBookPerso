import { sequelize } from "../db/sequelize.js";

// Import des modèles
import { User } from "../models/User.js";
import { Role } from "../models/Role.js";
import { Permissions } from "../models/Permissions.js";
import { Authors } from "../models/Authors.js";
import { Genre } from "../models/Genre.js";
import { Books } from "../models/Books.js";
import { Library } from "../models/Library.js";
import { ReadingList } from "../models/ReadingList.js";

// Import des services
import { PasswordService } from "../services/PasswordService.js";

// Import des associations
import "../models/association.js";

/**
 * Ce script permet d' insérer des données de test dans la base de données
 * Mais il supprime aussi toutes les données existantes
 */
async function seedTables() {
  try {
    console.log("🚀 Connexion à la base de données...");
    await sequelize.authenticate();
    console.log("✅ Connexion réussie !");

    console.log("🗑️  Suppression des données existantes...");
    // Force sync pour nettoyer et recréer les tables
    await sequelize.sync({ force: true });

    console.log("🌱 Insertion des données de test...");

    // === 1. RÔLES ET PERMISSIONS ===
    console.log("   📝 Création des rôles et permissions...");

    const permissions = await Permissions.bulkCreate([
      { label: "CREATE", action: "Créer du contenu" },
      { label: "READ", action: "Lire le contenu" },
      { label: "UPDATE", action: "Modifier le contenu" },
      { label: "DELETE", action: "Supprimer le contenu" },
      { label: "MODERATE", action: "Modérer le contenu" },
      { label: "ADMIN", action: "Administration système" },
    ]);

    const roles = await Role.bulkCreate([
      {
        name: "admin",
        description: "Administrateur système avec tous les droits",
      },
      { name: "moderator", description: "Modérateur pouvant gérer le contenu" },
      { name: "user", description: "Utilisateur standard" },
      {
        name: "premium",
        description: "Utilisateur premium avec fonctionnalités avancées",
      },
    ]);

    // === 2. GENRES LITTÉRAIRES ===
    console.log("   📚 Création des genres...");

    const genres = await Genre.bulkCreate([
      { name: "Fiction" },
      { name: "Science-fiction" },
      { name: "Fantasy" },
      { name: "Romance" },
      { name: "Thriller" },
      { name: "Mystery" },
      { name: "Biography" },
      { name: "History" },
      { name: "Philosophy" },
      { name: "Non-fiction" },
    ]);

    // === 3. AUTEURS ===
    console.log("   ✍️  Création des auteurs...");

    const authors = await Authors.bulkCreate([
      { firstname: "J.K.", lastname: "Rowling" },
      { firstname: "George", lastname: "Orwell" },
      { firstname: "Agatha", lastname: "Christie" },
      { firstname: "Stephen", lastname: "King" },
      { firstname: "Isaac", lastname: "Asimov" },
      { firstname: "J.R.R.", lastname: "Tolkien" },
      { firstname: "Jane", lastname: "Austen" },
      { firstname: "Victor", lastname: "Hugo" },
      { firstname: null, lastname: "Molière" }, // Certains auteurs n'ont qu'un nom
      { firstname: "Albert", lastname: "Camus" },
    ]);

    // === 4. LIVRES ===
    console.log("   📖 Création des livres...");

    const books = await Books.bulkCreate([
      {
        title: "Harry Potter à l'école des sorciers",
        isbn: "9782070541270",
        summary:
          "Harry Potter découvre qu'il est un sorcier le jour de ses 11 ans.",
        nb_pages: 320,
        published_at: "1997-06-26",
        image: true,
      },
      {
        title: "1984",
        isbn: "9782070368228",
        summary:
          "Dans un monde totalitaire, Winston Smith remet en question le système.",
        nb_pages: 408,
        published_at: "1949-06-08",
        image: true,
      },
      {
        title: "Le Seigneur des Anneaux - La Communauté de l'Anneau",
        isbn: "9782070612888",
        summary: "Frodon hérite d'un anneau magique et doit le détruire.",
        nb_pages: 576,
        published_at: "1954-07-29",
        image: true,
      },
      {
        title: "Fondation",
        isbn: "9782070415359",
        summary: "Hari Seldon prédit la chute de l'Empire Galactique.",
        nb_pages: 280,
        published_at: "1951-05-01",
        image: false,
      },
      {
        title: "Les Misérables",
        isbn: "9782070409228",
        summary: "L'histoire de Jean Valjean dans la France du 19e siècle.",
        nb_pages: 1488,
        published_at: "1862-04-03",
        image: true,
      },
    ]);

    // === 5. UTILISATEURS ===
    console.log("   👥 Création des utilisateurs...");

    // Hashage des mots de passe pour chaque utilisateur
    const adminPassword = await PasswordService.hashPassword("Admin123!");
    const alicePassword = await PasswordService.hashPassword("Alice123!");
    const bobPassword = await PasswordService.hashPassword("Bob123!");
    const claraPassword = await PasswordService.hashPassword("Clara123!");

    const users = await User.bulkCreate([
      {
        firstname: "Admin",
        lastname: "System",
        username: "admin",
        email: "admin@blablabook.com",
        password: adminPassword,
        connected_at: new Date(),
      },
      {
        firstname: "Alice",
        lastname: "Martin",
        username: "alice_books",
        email: "alice@example.com",
        password: alicePassword,
        connected_at: new Date(),
      },
      {
        firstname: "Bob",
        lastname: "Durand",
        username: "bob_reader",
        email: "bob@example.com",
        password: bobPassword,
        connected_at: new Date(),
      },
      {
        firstname: "Clara",
        lastname: "Dubois",
        username: "clara_fantasy",
        email: "clara@example.com",
        password: claraPassword,
        connected_at: new Date(),
      },
    ]);

    // === 6. BIBLIOTHÈQUES ===
    console.log("   📚 Création des bibliothèques...");

    const libraries = await Library.bulkCreate([
      { name: "Ma bibliothèque principale" }, // Alice
      { name: "Livres de science-fiction" }, // Alice
      { name: "Mes lectures" }, // Bob
      { name: "Fantasy et magie" }, // Clara
      { name: "Bibliothèque admin" }, // Admin
    ]);

    // === 7. LISTES DE LECTURE ===
    console.log("   📝 Création des listes de lecture...");

    await ReadingList.bulkCreate([
      {
        name: "À lire absolument",
        description: "Ma liste de livres prioritaires",
        genre: "Fiction",
        statut: true,
      },
      {
        name: "Science-fiction classique",
        description: "Les grands classiques du genre",
        genre: "Science-fiction",
        statut: true,
      },
      {
        name: "Fantasy épique",
        description: "Pour les amateurs de mondes fantastiques",
        genre: "Fantasy",
        statut: true,
      },
      {
        name: "Livres terminés",
        description: "Mes lectures achevées",
        genre: null,
        statut: false,
      },
    ]);

    console.log("🎉 Données de test insérées avec succès !");
    console.log("📊 Résumé :");
    console.log(`   • ${roles.length} rôles créés`); //permet de loger les données insérées des roles
    console.log(`   • ${permissions.length} permissions créées`); //permet de loger les données insérées des permissions
    console.log(`   • ${genres.length} genres créés`); //permet de loger les données insérées des genres
    console.log(`   • ${authors.length} auteurs créés`); //permet de loger les données insérées des auteurs
    console.log(`   • ${books.length} livres créés`); //permet de loger les données insérées des livres
    console.log(`   • ${users.length} utilisateurs créés`); //permet de loger les données insérées des utilisateurs
    console.log(`   • ${libraries.length} bibliothèques créées`); //permet de loger les données insérées des bibliotheques
  } catch (error) {
    console.error("❌ Erreur lors de l'insertion des données :", error);
  } finally {
    await sequelize.close();
    console.log("🔒 Connexion fermée.");
  }
}

// Exécution du script
seedTables();
