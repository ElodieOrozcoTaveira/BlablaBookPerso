# Stack expliquée

## Winston en une phrase

  Winston est une bibliothèque de logging professionnelle pour Node.js qui remplace les
  console.log() basiques.

  Pourquoi c'est mieux que console.log :

  1. Niveaux de log :
    - error : erreurs critiques
    - warn : avertissements
    - info : informations générales
    - debug : détails techniques
  2. Destinations multiples :
    - Console (terminal)
    - Fichiers (pour garder un historique)
    - Base de données
    - Services externes (Slack, email...)
  3. Format structuré :
  // Console.log basique
  console.log("User login failed");

  // Winston professionnel
  logger.error("User login failed", {
    userId: 123,
    ip: "192.168.1.1",
    timestamp: "2024-01-15T10:30:00Z"
  });
  4. Sécurité :
    - Horodatage automatique
    - Rotation des fichiers (évite les gros fichiers)
    - Filtrage sensible (peut masquer les mots de passe)

  En gros : Winston = console.log vitaminé pour les vrais projets !

## Pool c'est la gestion intelligente des connexions DB

  Explication des valeurs :

  pool: {
    max: 10,        // Maximum 10 connexions simultanées à la DB
    min: 0,         // Minimum 0 connexions (peut descendre à 0 si pas d'activité)
    acquire: 30000, // Timeout: 30 secondes max pour obtenir une connexion
    idle: 10000     // Timeout: 10 secondes d'inactivité avant fermeture automatique
  }

En fait, 10 connexions c'est souvent suffisant !

  Pourquoi :

  →  Une connexion DB est réutilisée par plein de requêtes HTTP.
  →  Exemple : 100 utilisateurs simultanés
 seulement 3-5 connexions DB utilisées
  →  Les requêtes sont rapides (millisecondes), donc les connexions se libèrent vite
  
  Comparaison :
  
  →  Petit projet/MVP : 5-10 connexions
  →  App moyenne : 10-20 connexions
  →  Grosse app : 50-100 connexions
  →  Netflix/Facebook : 1000+ connexions
  
  PostgreSQL par défaut accepte :

  →  100 connexions simultanées max par défaut
  →  Si on met max: 50 et qu'on a 5 serveurs → 250 connexions → ERREUR !

### Evite les attaques DDOS

Attaque DDoS classique :

  1. Attaquant envoie 10 000 requêtes simultanées
  2. Sans pool → 10 000 connexions DB ouvertes
  3. PostgreSQL plante (limite à ~100-200 connexions)
  4. Ton app est HS ! 💥

  Avec pool max: 10 :

  1. Attaquant envoie 10 000 requêtes
  2. Pool n'ouvre que 10 connexions max
  3. Les autres requêtes attendent ou timeout (30s)
  4. DB survit ! ✅

  Mais attention : Ce n'est qu'une couche de protection !

  Defense en profondeur contre DDoS :

  → ✅ Pool DB : limite connexions (déjà fait)
  → ✅ Rate limiting : max X requêtes/min par IP (on va le faire)
  → ✅ Nginx reverse proxy : premier filtre
  → ✅ Cloudflare/AWS : protection upstream

## Helmet.. ça fait quoi?

Helmet ajoute automatiquement des headers de sécurité HTTP pour protéger contre :

  1 - Injection (XSS)

  → Content-Security-Policy : bloque l'exécution de scripts malicieux
  → X-XSS-Protection : active la protection XSS du navigateur

  2 - Security Misconfiguration

  → X-Frame-Options: DENY : empêche le clickjacking (iframe malicieuses)
  → X-Content-Type-Options: nosniff : empêche MIME sniffing attacks
  → X-Powered-By : SUPPRIME cet header (cache la techno utilisée)
  
  3 - Vulnerable Components

  → Strict-Transport-Security : force HTTPS (si configuré)
  → Referrer-Policy : contrôle les informations de référent

  4 - Security Logging Failures

  → Headers pour améliorer le monitoring sécuritaire

  Exemple concret d'attaque bloquée :
  !-- Sans Helmet : ça marche (DANGER !)

  ```js
  <script>alert('XSS Attack!')</script>
  ```

  !-- Avec Helmet : BLOQUÉ par CSP !

### Helmet COEP

Cross-Origin Embedder Policy (COEP) contrôle si ta page peut embarquer des ressources
  d'autres domaines.

  Par défaut, Helmet met COEP en mode strict :
  Cross-Origin-Embedder-Policy: require-corp

  Problème avec ton projet :
  → Tu vas utiliser l'API Google Books (domaine externe)
  → Tu pourrais intégrer des images de couvertures depuis Amazon, etc.
  → En mode strict → ÇA BLOQUE ! ❌

  Exemple concret :
  // Ça marcherait pas avec COEP strict :
  fetch('<https://www.googleapis.com/books/v1/volumes?q=javascript>')
  // → BLOCKED by COEP

  Solutions :

  1. crossOriginEmbedderPolicy: false → Désactive complètement (plus simple)
  2. Configuration fine → Autoriser certains domaines

  Pour un MVP, l'option 1 est OK. En production on peut affiner.

## CORS en quelques lignes

🌐 Par défaut : Les navigateurs bloquent les appels entre domaines différents

  🔓 CORS : Autorise spécifiquement certains domaines à accéder à ton API
  🛡️ Protection : Empêche les sites malicieux d'utiliser ton navigateur pour attaquer
  📋 Configuration : Tu définis QUI peut accéder + COMMENT (GET, POST...)
  ⚖️ Limitation : Protège seulement les navigateurs, pas contre les attaques directes
  En gros : CORS = liste d'invités pour ton API ! 🎉

## ZOD en quelques lignes

🔍 Validation : Vérifie que les données respectent le format attendu (email valide, mot de passe assez long...)

  🛡️ Sécurité : Bloque les données malicieuses AVANT qu'elles atteignent ta DB
  ✅ TypeScript-first : Génère automatiquement les types TypeScript depuis tes validations
  📋 Déclaratif : Tu décris ce que tu veux, Zod fait le reste
  🚫 Anti-injection : Empêche SQL injection, XSS, et autres attaques par input

  Exemple concret :
  const userSchema = z.object({
    email: z.string().email(),           // DOIT être un email
    password: z.string().min(8),         // DOIT faire 8+ caractères
    age: z.number().min(18)              // DOIT être 18+
  });

  // ✅ Valide : { email: "<test@test.com>", password: "12345678", age: 25 }
  // ❌ Invalide : { email: "invalid", password: "123", age: 15 }

## URP concretement

on créé des roles dans ROLE (values), on créé des permissions dans PERMISSION (values), on attribut ces values à un USER.

Exemple concret :
  -- 1. Créer les rôles
  INSERT INTO ROLE (name, description) VALUES ('admin', 'Administrateur');
  INSERT INTO ROLE (name, description) VALUES ('user', 'Utilisateur');

  -- 2. Créer les permissions
  INSERT INTO PERMISSION (label, action) VALUES ('DELETE', 'Supprimer');
  INSERT INTO PERMISSION (label, action) VALUES ('READ', 'Lire');

  -- 3. ATTRIBUER : Admin peut tout, User peut juste lire
  INSERT INTO ROLE_PERMISSION (id_role, id_permission) VALUES (1, 1); --
  admin  DELETE
  INSERT INTO ROLE_PERMISSION (id_role, id_permission) VALUES (1, 2); --
  admin  READ  
  INSERT INTO ROLE_PERMISSION (id_role, id_permission) VALUES (2, 2); --
  user  READ only

-- Scénario : Blog avec 2 rôles
  USER "Alice" (ID=1) est ADMIN (ID=1)
  USER "Bob" (ID=2) est USER (ID=2)

  -- Alice peut TOUT :
  ROLE ADMIN a permissions : CREATE, READ, UPDATE, DELETE
  -- Bob peut juste lire :
  ROLE USER a permissions : READ

  -- En pratique :
  Alice veut supprimer un article → CHECK permission DELETE → ✅ AUTORISÉ
  Bob veut supprimer un article → CHECK permission DELETE → ❌ REFUSÉ

## Graceful shutdown Quesako??

Le graceful shutdown sert à :

  1 Éviter la corruption de données

  // Sans graceful shutdown - DANGER ⚠️
  // Ctrl+C → process.exit() immédiat
  // → Connexions DB coupées brutalement
  // → Transactions en cours perdues
  // → Risque de corruption

  // Avec graceful shutdown - SÉCURISÉ ✅
  // SIGINT → Fermeture propre des connexions
  // → Transactions terminées ou rollback
  // → Pool fermé proprement

  2 Libérer les ressources système

  → Pool de connexions PostgreSQL : Sans .end(), les connexions restent ouvertes
  → Handles de fichiers : Logs, sockets, etc.
  → Mémoire : Éviter les memory leaks

  3 Éviter les erreurs en cascade

## Sans graceful shutdown

  FATAL: too many connections for role "solobook"

## PostgreSQL refuse les nouvelles connexions

### Avec graceful shutdown

  Connexions fermées proprement → Pas de saturation

  4 Signaux système que ça écoute :

  → SIGINT : Ctrl+C en développement
  → SIGTERM : kill ou Docker/Kubernetes stop
  → Processus parent : PM2, systemd, etc.

  En résumé : Le graceful shutdown évite de laisser des connexions zombies et assure que
  l'application se ferme proprement sans corrompre les données.

### Graceful analogie

Imagine ton app comme un restaurant :

  Sans graceful shutdown (BRUTAL) :

  Tu fermes le restaurant → Tu coupes l'électricité d'un coup
  → Les clients mangent dans le noir
  → Les cuisiniers laissent tout brûler
  → La caisse reste ouverte
  → CHAOS TOTAL !

  Avec graceful shutdown (PROPRE) :

  Tu fermes le restaurant → Tu dis "On ferme dans 5 minutes"
  → Les clients finissent leur repas
  → Les cuisiniers éteignent les feux
  → Tu fermes la caisse
  → Tu éteins les lumières APRÈS

  Pour ton app :

  → Sans : Tu fais Ctrl+C → PostgreSQL dit "WTF, où sont passées mes connexions ?!"
  → Avec : Tu fais Ctrl+C → "Attends, je ferme mes connexions proprement, puis j'arrête"

  C'est juste être poli avec PostgreSQL au lieu de lui claquer la porte au nez ! 😄

  En gros : éviter de faire planter la base quand tu arrêtes ton serveur.

SIGINT (Signal Interrupt)

  → Origine : Utilisateur (Ctrl+C dans le terminal)
  → But : Interruption interactive par l'utilisateur
  → Comportement : Signal "poli" - demande au process d'arrêter
  → Exemple : Tu appuies sur Ctrl+C pour arrêter ton serveur de dev

  SIGTERM (Signal Terminate)

  → Origine : Système (Docker, PM2, systemd, etc.)
  → But : Arrêt programmé par le système
  → Comportement : Signal "poli" - demande au process d'arrêter proprement
  → Exemple : Docker stop, restart de service, déploiement

  Pourquoi les deux ?

  // Ctrl+C par l'utilisateur
  process.on('SIGINT', async () => {
    logger.info('🛑 User requested shutdown (Ctrl+C)...');
    await gracefulShutdown();
  });

  // Arrêt système (Docker, PM2, etc.)
  process.on('SIGTERM', async () => {
    logger.info('🛑 System requested shutdown...');
    await gracefulShutdown();
  });

  Donc :

  → SIGINT : Quand tu fais Ctrl+C en dev
  → SIGTERM : Quand Docker/PM2 redémarre ton serveur en production

## Better Auth

### Coté Back

Better Auth - Le "portier automatique" de notre app 🛡️

  Analogie : L'hôtel de luxe

  Better Auth = Le système complet de l'hôtel :
  → Réception : Enregistre les clients (sign-up), vérifie les identités (sign-in)
  → Cartes magnétiques : Crée et distribue les badges d'accès (cookies de session)
  → Système central : Base de données des clients, validité des cartes, historique
  → Portiers : Vérifient les badges à chaque étage (validation automatique)

  Ce que Better Auth fait dans notre app :

  🏨 Installation automatique (déjà fait) :

  // Better Auth s'installe comme un "système clé en main"
  export const auth = betterAuth({
    database: pool,           // Il gère ses propres tables
    emailAndPassword: true,   // Réception avec email/password
    session: { expiresIn: 7*24*3600 }, // Cartes valables 7 jours
  });

  🎫 Routes automatiques créées :

  → POST /auth/sign-up → "Je veux une chambre" (inscription)
  → POST /auth/sign-in → "Voici mes papiers" (connexion)
  → POST /auth/sign-out → "Je rends ma carte" (déconnexion)

  🍪 Gestion automatique des cookies :

  // L'utilisateur se connecte
  fetch('/auth/sign-in', {
    body: { email: <user@test.com>, password: 'password123' }
  })
  // → Better Auth crée automatiquement le cookie 'solobook_session'
  // → Le navigateur l'envoie dans TOUTES les requêtes suivantes

  🔍 Notre middleware = "Contrôleur d'étage" :

  // Nous, on ajoute juste les "permissions spéciales"
  const session = await auth.api.getSession(); // "Cette carte est-elle valide ?"
  // + On ajoute : "Ce client a-t-il accès à la piscine privée ?" (permissions)

  Résultat :

  Better Auth = 95% du travail d'authentificationNous = 5% pour ajouter nos règles métier
  (rôles/permissions)

### Coté Front

Frontend Better Auth = L'app mobile des clients 📱

  🎫 Interface de réservation :

  // Composants pré-faits = écrans de l'app mobile

  ```html
  <SignIn />     // "Se connecter à mon compte hôtel"
  <SignUp />     // "Créer un compte client"  
  <Profile />    // "Mon profil voyageur"
```

  🔄 Synchronisation automatique :

  ```js
  const { user, signIn, signOut } = useAuth()
  ```

  // L'app sait automatiquement :
  // - Si je suis connecté à l'hôtel
  // - Quel type de chambre j'ai (mes permissions)
  // - Mes services inclus (mes rôles)

  🍪 Gestion transparente des badges :
  → L'app stocke automatiquement ma carte d'accès (cookie)
  → L'envoie automatiquement à chaque service que j'utilise
  → Se reconnecte automatiquement quand je rouvre l'app

  Workflow complet :

  Client → Ouvre l'app mobileApp Frontend → "Avez-vous une réservation ?" (vérifie session)Système
   Hôtel (Backend) → "Oui, chambre 205, accès piscine" (retourne permissions)App Frontend →
  Affiche interface personnalisée avec mes accès

  Résultat : L'app mobile sait exactement qui je suis et ce que je peux faire, sans que j'aie à re-saisir mes infos ! 🎯

  Frontend = L'interface intuitive qui cache toute la complexité du système hôtel

### Back + Front

Better Auth front + back = Combo ultra-solide 🚀

Pourquoi c'est si puissant :

🔄 Synchronisation parfaite :
  → Le client frontend et le serveur backend "parlent le même langage"
  → Pas de problèmes de compatibilité cookies/sessions
  → Gestion automatique des refresh tokens, expiration, etc.

🛡️ Sécurité enterprise-grade :
  → CSRF protection automatique
  → Rate limiting intégré
  → Session fixation protection
  → Cookies sécurisés (httpOnly, sameSite, secure)

📱 UX transparente :
  → Auto-login si session valide
  → Logout automatique si session expirée
  → États de connexion synchronisés partout
  → Redirections intelligentes

## Sequelize OP

Op.or est un opérateur Sequelize qui permet de créer une condition OU dans une requête SQL.

  Syntaxe :
  where: {
    [Op.or]: [
      { condition1 },
      { condition2 },
      { condition3 }
    ]
  }

  Exemples concrets :

  1. Recherche dans plusieurs champs :
  where: {
    [Op.or]: [
      { title: { [Op.iLike]: '%recherche%' } },
      { content: { [Op.iLike]: '%recherche%' } }
    ]
  }
  → SQL: WHERE title ILIKE '%recherche%' OR content ILIKE '%recherche%'

  2. Conditions sur différents champs :
  where: {
    [Op.or]: [
      { is_public: true },
      { id_user: 123 }
    ]
  }
  → SQL: WHERE is_public = true OR id_user = 123

  3. Combinaison avec AND :
  where: {
    status: 'active',  // AND implicite
    [Op.or]: [
      { role: 'admin' },
      { role: 'moderator' }
    ]
  }
  → SQL: WHERE status = 'active' AND (role = 'admin' OR role = 'moderator')

  Dans nos controllers :
  → Notice/Library : Montrer les éléments publics OU ceux de l'utilisateur connecté
  → Recherche : Chercher dans le titre OU dans le contenu
  → Permissions : Accès si public OU si propriétaire

  C'est l'équivalent du || en JavaScript mais pour les requêtes SQL !

## Private async.. on en parle?

private async combine deux concepts TypeScript/JavaScript :

  private

  → Visibilité : La méthode n'est accessible QUE depuis l'intérieur de la classe
  → Encapsulation : Cache les détails d'implémentation

```ts
  export class OpenLibraryService {
      // PUBLIC - accessible depuis l'extérieur
      
      async searchBooks(query: string) {
          return await this.searchLocalBooks(query); // ✅ OK depuis l'intérieur
      }


      // PRIVATE - accessible SEULEMENT depuis l'intérieur de la classe
      
      ```ts
      private async searchLocalBooks(query: string) {
          // Logique interne
      }      
  }
```

  // Utilisation :

```ts
  const service = new OpenLibraryService();
  service.searchBooks("test");           // ✅ OK - méthode publique
  service.searchLocalBooks("test");      // ❌ ERREUR - méthode privée
```

  async

  → Asynchrone : La méthode retourne une Promise
  → await : Peut utiliser await à l'intérieur

```js
  private async searchLocalBooks(query: string) {
      // Peut utiliser await pour les opérations asynchrones
      const results = await Book.findAll({...});
      return results;
  }
```

  Pourquoi private async ensemble ?

```js
  class OpenLibraryService {
      // API publique simple
      async searchBooks(query: string) {
          const local = await this.searchLocalBooks(query);    // Étape 1
          if (!local.length) {
              const remote = await this.searchOpenLibrary(query); // Étape 2  
              return await this.saveNewBooks(remote);             // Étape 3
          }
          return local;
      }
     

      // Détails d'implémentation cachés
      
      private async searchLocalBooks(query: string) { /* ... */ }
      private async searchOpenLibrary(query: string) { /* ... */ }
      private async saveNewBooks(books: any[]) { /* ... */ }
  }
  ```

  Avantages :

  → Interface claire : Seule searchBooks() est exposée
  → Flexibilité : Je peux changer l'implémentation interne sans casser le code qui utilise la classe
  → Réutilisation : Les méthodes privées peuvent être appelées par plusieurs méthodes publiques

  C'est du design pattern : exposer une API simple et cacher la complexité !

## Multer il gere.. les photos

Multer est un middleware Node.js qui gère les uploads de fichiers dans les formulaires HTML.

  Le problème sans Multer :

  Quand un utilisateur envoie un fichier via un formulaire :

```html
  <form enctype="multipart/form-data">
    <input type="file" name="cover" />
  </form>
```

  Express ne sait pas traiter les données multipart/form-data par défaut. Le fichier arrive en "morceaux"
  binaires qu'il faut reconstituer.

  Ce que fait Multer :

```js
  // SANS Multer - req.file n'existe pas
  app.post('/upload', (req, res) => {
      console.log(req.file); // ❌ undefined
  });

  // AVEC Multer - req.file est disponible
  const upload = multer({ dest: 'uploads/' });
  app.post('/upload', upload.single('cover'), (req, res) => {
      console.log(req.file); // ✅ { filename, size, mimetype, buffer, ... }
  });
```

  Configuration Multer typique :

```js
  const upload = multer({
      storage: multer.memoryStorage(), // Garde en mémoire (pas sur disque)
      limits: {
          fileSize: 5 * 1024 * 1024 // 5MB max
      },
      fileFilter: (req, file, cb) => {
          // Accepter seulement images
          if (file.mimetype.startsWith('image/')) {
              cb(null, true);
          } else {
              cb(new Error('Seules les images sont autorisées'));
          }
      }
  });
```

  Dans notre cas :

  Multer récupère le fichier → on le passe à Sharp pour conversion WebP → on sauvegarde où on veut.

## FS et Sharp le duo photo

fs (File System) :

  Rôle : Gestion des fichiers et dossiers sur le disque

  import fs from 'fs';

```js
  // Vérifier si un dossier existe
  if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true }); // Créer le dossier
  }

  // Supprimer un fichier
  fs.unlinkSync(filepath); // Supprimer book-123-thumb.webp

  // Lire un fichier (si besoin)
  const buffer = fs.readFileSync('/path/to/image.jpg');
```

  Dans notre code :

  → Créer le dossier /uploads/covers/ s'il n'existe pas
  → Supprimer les anciennes covers lors d'un remplacement
  → Vérifier l'existence de fichiers

sharp (Image Processing) :

  Rôle : Traitement et manipulation d'images

```js
  import sharp from 'sharp';

  await sharp(imageBuffer)
      .resize(400, 600, { fit: 'cover' })    // Redimensionner
      .webp({ quality: 80 })                 // Convertir en WebP
      .toFile('/path/output.webp');          // Sauvegarder

  // Obtenir des métadonnées
  const metadata = await sharp(buffer).metadata();
  // { width: 1920, height: 1080, format: 'jpeg', size: 245760 }
```

  Dans notre code :
  
  → Redimensionner les images (4 tailles différentes)
  → Convertir JPEG/PNG → WebP
  → Optimiser la qualité/compression
  → Valider que c'est bien une image
  → Extraire les métadonnées (largeur, hauteur, format)

  Collaboration fs + sharp :

```js
  // 1. Sharp traite l'image en mémoire
    const processedBuffer = await sharp(originalBuffer)
      .resize(300, 450)
      .webp({ quality: 80 })
      .toBuffer(); // Garde en mémoire

  // 2. fs l'écrit sur le disque
  fs.writeFileSync('/uploads/covers/book-123-medium.webp', processedBuffer);

  // OU directement :
  await sharp(originalBuffer)
      .resize(300, 450)
      .webp({ quality: 80 })
      .toFile('/uploads/covers/book-123-medium.webp'); // Sharp + fs en une fois
```

  Résumé :

  → fs = gestionnaire de fichiers (créer/supprimer/vérifier)
  → sharp = laboratoire photo (redimensionner/convertir/optimiser)

  C'est comme avoir un photographe (sharp) qui traite les photos et un archiviste (fs) qui les range dans
  les bons dossiers !
  