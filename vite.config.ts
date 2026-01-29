import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement depuis le fichier .env
  // Fix: Use '.' instead of process.cwd() to avoid type error about 'cwd' not existing on 'Process'
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    define: {
      // Permet d'utiliser process.env.API_KEY dans le code client
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'recharts', 'lucide-react', '@google/genai'],
          },
        },
      },
    },
  }
})