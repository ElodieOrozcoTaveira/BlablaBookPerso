# 🛡️ Guide CSRF pour l'equipe Frontend (React TSX + Axios)

## 🚨 IMPORTANT : Changements requis côté frontend

La protection CSRF a été activée sur le backend. **Toutes vos requêtes POST/PUT/PATCH/DELETE doivent maintenant inclure un token CSRF**, sinon elles seront rejetées avec une erreur 403.

---

## 🎯 Ce qui change pour vous

### ❌ Avant (ne fonctionne plus)

```javascript
// Cette requête va échouer maintenant !
await axios.post('/api/auth/login', {
  email: 'user@example.com',
  password: 'Password123!'
});
// Erreur 403: "Invalid or missing CSRF token"
```

### ✅ Après (obligatoire)

```javascript
// Solution recommandée : Intercepteur Axios (configuration une seule fois)
axios.interceptors.request.use(async (config) => {
  // Ajouter automatiquement le token CSRF sur toutes les requêtes modifiantes
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    const { data } = await axios.get('/api/auth/csrf-token');
    config.headers['x-csrf-token'] = data.csrfToken;
  }
  return config;
});

// Puis utilisation normale (le token est ajouté automatiquement)
await axios.post('/api/auth/login', {
  email: 'user@example.com', 
  password: 'Password123!'
});
```

---

## 🔧 Guide d'implémentation

### 1. Endpoint pour récupérer le token

```js
GET /api/auth/csrf-token
```

**Réponse :**

```js
{
  "success": true,
  "csrfToken": "abc123def456...",
  "message": "CSRF token generated"
}
```

### 2. ÉTAPES DÉTAILLÉES pour configurer Axios

#### 🔧 Etape 1 : Creer le fichier de configuration Axios

**Creez un nouveau fichier :** `src/api/axiosConfig.ts`

```typescript
// src/api/axiosConfig.ts
import axios from 'axios';

// Configuration de base
axios.defaults.baseURL = 'http://localhost:3000';
axios.defaults.withCredentials = true; // Important pour les cookies

// Intercepteur pour ajouter automatiquement le token CSRF
axios.interceptors.request.use(async (config) => {
  // Ajouter le token CSRF pour toutes les requêtes modifiantes
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    try {
      const { data } = await axios.get('/api/auth/csrf-token');
      config.headers['x-csrf-token'] = data.csrfToken;
      console.log('✅ Token CSRF ajouté à la requête');
    } catch (error) {
      console.error('❌ Erreur récupération token CSRF:', error);
      throw error;
    }
  }
  return config;
});

// Intercepteur pour gérer les erreurs CSRF
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403 && 
        error.response?.data?.error === 'CSRF_TOKEN_INVALID') {
      console.error('❌ Token CSRF invalide !');
      alert('Session expirée, veuillez recharger la page');
    }
    return Promise.reject(error);
  }
);

export default axios;
```

#### 🔧 Etape 2 : Importer cette configuration dans votre App

**Dans votre fichier principal (`src/index.tsx`) :**

```tsx
// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './api/axiosConfig'; // ← AJOUTER CETTE LIGNE
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### 🔧 Etape 3 : Utiliser Axios dans vos composants React

**Dans vos composants React TSX :**

```tsx
// Importer axios normalement
import axios from 'axios';

// Le token CSRF sera automatiquement ajoute !
```

### 3. Exemples CONCRETS d'utilisation (après configuration)

#### 🔐 **Authentification - Dans votre composant de Login**

**Fichier :** `src/components/LoginForm.tsx`

```tsx
import React, { useState } from 'react';
import axios from 'axios';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Le token CSRF est automatiquement ajoute !
      const response = await axios.post('/api/auth/login', {
        email: formData.email,
        password: formData.password
      });
      
      console.log('✅ Login reussi:', response.data);
      // Redirection ou mise a jour du state
      
    } catch (error: any) {
      console.error('❌ Erreur login:', error.response?.data);
      alert('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      console.log('✅ Logout reussi');
      // Redirection vers login
    } catch (error) {
      console.error('❌ Erreur logout:', error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder="Email"
        required
      />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleInputChange}
        placeholder="Mot de passe"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
      <button type="button" onClick={handleLogout}>
        Deconnexion
      </button>
    </form>
  );
};

export default LoginForm;
```

#### 👤 **Utilisateurs - Dans votre composant d'Inscription**

**Fichier :** `src/components/RegisterForm.tsx`

```tsx
import React, { useState } from 'react';
import axios from 'axios';

interface RegisterFormData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  username: string;
}

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    username: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Token CSRF ajoute automatiquement
      const response = await axios.post('/api/users/register', formData);
      
      console.log('✅ Inscription reussie:', response.data);
      alert('Inscription reussie !');
      
    } catch (error: any) {
      console.error('❌ Erreur inscription:', error.response?.data);
      alert(`Erreur: ${error.response?.data?.message}`);
    }
  };
  
  const handleUpdateProfile = async () => {
    try {
      await axios.put('/api/users/me/profile', {
        firstname: formData.firstname,
        lastname: formData.lastname
      });
      
      console.log('✅ Profil mis a jour');
      alert('Profil mis a jour !');
      
    } catch (error) {
      console.error('❌ Erreur mise a jour:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          name="firstname"
          value={formData.firstname}
          onChange={handleInputChange}
          placeholder="Prenom"
          required
        />
        <input
          type="text"
          name="lastname"
          value={formData.lastname}
          onChange={handleInputChange}
          placeholder="Nom"
          required
        />
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          placeholder="Nom d'utilisateur"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Mot de passe"
          required
        />
        <button type="submit">S'inscrire</button>
      </form>
      
      <button onClick={handleUpdateProfile}>
        Mettre a jour le profil
      </button>
    </div>
  );
};

export default RegisterForm;
```

#### 📚 **Livres - Dans votre composant de gestion des livres**

**Fichier :** `src/components/BookManager.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Book {
  id: number;
  title: string;
  isbn: string;
  publication_year: number | null;
  author_ids: number[];
}

interface NewBookData {
  title: string;
  isbn: string;
  publication_year: number | null;
  author_ids: number[];
}

const BookManager: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [newBook, setNewBook] = useState<NewBookData>({
    title: '',
    isbn: '',
    publication_year: null,
    author_ids: []
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBook(prev => ({
      ...prev,
      [name]: name === 'publication_year' ? (value ? parseInt(value) : null) : value
    }));
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Token CSRF automatiquement ajoute
      const response = await axios.post('/api/books', newBook);
      
      console.log('✅ Livre cree:', response.data);
      setBooks(prev => [...prev, response.data.book]);
      
      // Reset du formulaire
      setNewBook({ title: '', isbn: '', publication_year: null, author_ids: [] });
      
    } catch (error: any) {
      console.error('❌ Erreur creation livre:', error.response?.data);
      alert('Erreur lors de la creation du livre');
    }
  };
  
  const handleUpdateBook = async (bookId: number, updatedData: Partial<Book>) => {
    try {
      const response = await axios.put(`/api/books/${bookId}`, updatedData);
      
      console.log('✅ Livre modifie:', response.data);
      // Mettre a jour la liste locale
      setBooks(prev => 
        prev.map(book => 
          book.id === bookId ? response.data.book : book
        )
      );
      
    } catch (error) {
      console.error('❌ Erreur modification livre:', error);
    }
  };
  
  const handleDeleteBook = async (bookId: number) => {
    if (!window.confirm('Etes-vous sur de vouloir supprimer ce livre ?')) return;
    
    try {
      await axios.delete(`/api/books/${bookId}`);
      
      console.log('✅ Livre supprime');
      // Retirer de la liste locale
      setBooks(prev => prev.filter(book => book.id !== bookId));
      
    } catch (error) {
      console.error('❌ Erreur suppression livre:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleCreateBook}>
        <input
          type="text"
          name="title"
          value={newBook.title}
          onChange={handleInputChange}
          placeholder="Titre du livre"
          required
        />
        <input
          type="text"
          name="isbn"
          value={newBook.isbn}
          onChange={handleInputChange}
          placeholder="ISBN"
        />
        <input
          type="number"
          name="publication_year"
          value={newBook.publication_year || ''}
          onChange={handleInputChange}
          placeholder="Annee de publication"
        />
        <button type="submit">Creer le livre</button>
      </form>
      
      <div>
        {books.map(book => (
          <div key={book.id}>
            <h3>{book.title}</h3>
            <p>ISBN: {book.isbn}</p>
            <p>Annee: {book.publication_year}</p>
            <button onClick={() => handleUpdateBook(book.id, { title: 'Titre modifie' })}>
              Modifier
            </button>
            <button onClick={() => handleDeleteBook(book.id)}>
              Supprimer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookManager;
```

**⭐ Notes et 📝 Avis :**

```tsx
// Ajouter une note
await axios.post('/api/rates', {
  book_id: 123,
  rate: 4.5,
  comment: 'Excellent livre !'
});

// Creer un avis
await axios.post('/api/notices', {
  book_id: 123,
  title: 'Un livre marquant',
  content: 'Ce livre m\'a profondement touche...'
});
```

**📸 Uploads :**

```tsx
// Upload avatar
const handleFileUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  await axios.post('/api/uploads/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
```

**❌ PAS besoin de configuration pour :**

- Toutes les routes GET (lecture seule)
- `GET /api/auth/csrf-token` (génération automatique du token)

### 3. Stratégies d'implémentation

#### Option A : Token par requête (Simple)

```js
async function makeProtectedRequest(url, options = {}) {
  // Récupérer un nouveau token à chaque requête
  const tokenResponse = await fetch('/api/auth/csrf-token');
  const { csrfToken } = await tokenResponse.json();
  
  // Ajouter le token aux headers
  const headers = {
    ...options.headers,
    'x-csrf-token': csrfToken
  };
  
  return fetch(url, { ...options, headers });
}

// Utilisation
await makeProtectedRequest('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

#### Option B : Token global avec gestion du cache (Optimisé)

```js
class CSRFManager {
  constructor() {
    this.token = null;
    this.tokenExpiry = null;
  }
  
  async getToken() {
    // Token valide pendant 4h, on le renouvelle après 3h50min
    const now = Date.now();
    if (this.token && this.tokenExpiry && now < this.tokenExpiry) {
      return this.token;
    }
    
    // Récupérer un nouveau token
    const response = await fetch('/api/auth/csrf-token');
    const data = await response.json();
    
    this.token = data.csrfToken;
    this.tokenExpiry = now + (3.8 * 60 * 60 * 1000); // 3h50min
    
    return this.token;
  }
  
  async makeRequest(url, options = {}) {
    const token = await this.getToken();
    
    const headers = {
      ...options.headers,
      'x-csrf-token': token
    };
    
    const response = await fetch(url, { ...options, headers });
    
    // Si erreur CSRF, renouveler le token et réessayer
    if (response.status === 403) {
      const errorData = await response.json();
      if (errorData.error === 'CSRF_TOKEN_INVALID') {
        this.token = null; // Forcer le renouvellement
        const newToken = await this.getToken();
        headers['x-csrf-token'] = newToken;
        return fetch(url, { ...options, headers });
      }
    }
    
    return response;
  }
}

// Instance globale
const csrfManager = new CSRFManager();

// Utilisation
await csrfManager.makeRequest('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

#### Option C : Intercepteur Axios (Si vous utilisez Axios)

```js
import axios from 'axios';

// Intercepteur pour ajouter automatiquement le token CSRF
axios.interceptors.request.use(async (config) => {
  // Skip pour les requêtes GET et la récupération du token
  if (config.method === 'get' || config.url === '/api/auth/csrf-token') {
    return config;
  }
  
  // Récupérer le token CSRF
  const tokenResponse = await axios.get('/api/auth/csrf-token');
  const { csrfToken } = tokenResponse.data;
  
  // Ajouter le token aux headers
  config.headers['x-csrf-token'] = csrfToken;
  
  return config;
});

// Utilisation normale
await axios.post('/api/auth/login', { email, password });
```

---

## ⚠️ Points d'attention

### 1. Gestion des erreurs

```js
try {
  const response = await makeProtectedRequest('/api/auth/login', options);
  const data = await response.json();
  
  if (!response.ok) {
    if (data.error === 'CSRF_TOKEN_INVALID') {
      console.error('Token CSRF invalide ou manquant');
      // Renouveler le token et réessayer
    }
    throw new Error(data.message);
  }
  
  return data;
} catch (error) {
  console.error('Erreur de requête:', error);
}
```

### 2. Durée de vie des tokens

- **Durée :** 4 heures
- **Recommandation :** Renouveler le token toutes les 3h50 pour éviter l'expiration
- **En cas d'erreur 403 :** Récupérer un nouveau token et réessayer

### 3. Stockage du token

- **✅ Recommandé :** Variables JavaScript en mémoire
- **❌ Éviter :** localStorage, sessionStorage (pas nécessaire, le cookie est géré automatiquement)

---

## 🧪 Tests et validation

### Test rapide avec curl

```bash
# 1. Récupérer un token
curl -c cookies.txt http://localhost:3000/api/auth/csrf-token

# 2. Utiliser le token (remplacer TOKEN_ICI)
curl -b cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: TOKEN_ICI" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Validation frontend

Vérifiez que vos requêtes incluent bien le header :

```js
console.log('Headers de la requête:', {
  'Content-Type': 'application/json',
  'x-csrf-token': csrfToken  // Doit être présent !
});
```

---

## 🆘 FAQ & Dépannage

### ❌ **Erreur : "CSRF_TOKEN_INVALID"**

**Symptôme :** Votre requête retourne une erreur 403 avec le message "Invalid or missing CSRF token"

**Causes possibles :**

1. ❌ Vous n'avez pas importe `axiosConfig.ts` dans votre `index.tsx`
2. ❌ Vous n'avez pas cree le fichier `axiosConfig.ts`
3. ❌ Vous avez mis `withCredentials: false` dans la config

**Solutions :**

```tsx
// ✅ Verifiez votre index.tsx
import './api/axiosConfig'; // Cette ligne doit etre presente

// ✅ Verifiez votre axiosConfig.ts
axios.defaults.withCredentials = true; // Cette ligne doit etre presente
```

### ❌ **Erreur : "Network Error" ou "CORS"**

**Symptôme :** Vos requêtes n'arrivent pas au serveur

**Causes possibles :**

1. ❌ Mauvaise baseURL dans la configuration
2. ❌ Le serveur backend n'est pas démarré

**Solutions :**

```tsx
// ✅ Verifiez la baseURL dans axiosConfig.ts
axios.defaults.baseURL = 'http://localhost:3000'; // Port correct ?

// ✅ Verifiez que le backend tourne
// Dans un terminal : curl http://localhost:3000/api/health
```

### ❌ **Erreur : "Cannot read properties of undefined"**

**Symptôme :** Erreur JavaScript dans la console

**Solutions :**

```tsx
// ❌ Evitez ca
const user = response.data.user.name; 

// ✅ Faites ca
const user = response.data?.user?.name || 'Inconnu';

// ✅ Ou ca (avec TypeScript)
if (response.data && response.data.user) {
  const user: string = response.data.user.name;
}
```

### 🔍 **Comment vérifier que ça marche ?**

**1. Ouvrez les Dev Tools (F12)**
**2. Onglet Network**
**3. Faites une requête POST**
**4. Vérifiez les headers :**

✅ Vous devez voir :

```js
- Request Headers : x-csrf-token: abc123def456...
- Cookies : _csrf-token=abc123def456...

❌ Si vous ne voyez pas ça :
- L'intercepteur ne fonctionne pas
- Vérifiez votre configuration
```

### 🧪 **Test rapide pour vérifier votre configuration**

**Ajoutez ce code temporaire dans un composant :**

```tsx
// Code de test temporaire
const testCSRF = async () => {
  try {
    console.log('🧪 Test CSRF en cours...');
    
    const response = await axios.post('/api/auth/logout');
    console.log('✅ CSRF fonctionne !', response.data);
    
  } catch (error: any) {
    console.error('❌ CSRF ne fonctionne pas :', error.response?.data);
    console.error('❌ Verifiez votre configuration axiosConfig.ts');
  }
};

// Dans votre JSX :
<button onClick={testCSRF}>Test CSRF</button>
```

### 📞 **Besoin d'aide ?**

**Si ça ne marche toujours pas :**

1. 📋 Copiez-collez EXACTEMENT les codes du guide
2. 🔍 Verifiez que tous les fichiers sont crees aux bons endroits
3. 🔄 Redemarrez votre serveur de developpement (npm start)
4. 🆘 Demandez de l'aide avec les messages d'erreur complets

---

## 🎯 Checklist de migration

- [ ] ✅ Identifier toutes vos requetes POST/PUT/PATCH/DELETE
- [ ] ✅ Implementer la recuperation du token CSRF
- [ ] ✅ Ajouter le header `x-csrf-token` a ces requetes
- [ ] ✅ Gerer les erreurs 403 avec renouvellement du token
- [ ] ✅ Tester le login/logout
- [ ] ✅ Tester la creation/modification de donnees
- [ ] ✅ Verifier que les requetes GET fonctionnent toujours

---
