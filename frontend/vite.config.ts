import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,  // Port libre pour le développement local
    host: true   // pour que ça écoute toutes les interfaces (utile en Docker)
  }
})
