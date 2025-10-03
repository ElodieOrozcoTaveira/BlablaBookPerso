// src/api/axiosConfig.ts
import axios from 'axios';

// Configuration de base
axios.defaults.baseURL = 'http://localhost:3000';
axios.defaults.withCredentials = true;

// Intercepteur pour ajouter automatiquement le token CSRF
axios.interceptors.request.use(async (config) => {
  // Vérifier que method existe et ajouter le token CSRF pour les requêtes modifiantes
  if (
    config.method &&
    ['post', 'put', 'patch', 'delete'].includes(config.method)
  ) {
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

export default axios;
