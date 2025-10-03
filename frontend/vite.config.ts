import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,  // ou un autre port que tu veux
    host: true   // pour que ça écoute toutes les interfaces (utile en Docker)
  }
})
