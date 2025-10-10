// src/api/axiosConfig.ts
import axios from "axios";

// Configuration de base
axios.defaults.baseURL = "http://localhost:3000";
axios.defaults.withCredentials = true;

// Intercepteur pour logs (optionnel)
axios.interceptors.request.use((config) => {
  console.log(`🔄 Requête ${config.method?.toUpperCase()} vers ${config.url}`);
  return config;
});

// Intercepteur de réponse pour gestion d'erreurs
axios.interceptors.response.use(
  (response) => {
    console.log(`✅ Réponse ${response.status} de ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(
      `❌ Erreur ${error.response?.status} de ${error.config?.url}:`,
      error.response?.data
    );
    return Promise.reject(error);
  }
);

export default axios;
