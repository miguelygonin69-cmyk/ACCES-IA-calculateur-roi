import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 1. Charge les variables depuis le fichier .env (utile en local)
  // Le 3ème argument '' permet de charger toutes les variables, pas seulement celles commençant par VITE_
  // Fix: Cast process to any to avoid "Property 'cwd' does not exist on type 'Process'" error
  const env = loadEnv(mode, (process as any).cwd(), '');

  // 2. Récupère la clé API : soit du fichier .env, soit de l'environnement système (Vercel)
  const apiKey = env.API_KEY || process.env.API_KEY;

  return {
    plugins: [react()],
    // 3. Injecte la clé dans le code frontend de manière sécurisée au moment du build
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey || ''),
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