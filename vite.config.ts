import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.API_KEY || process.env.API_KEY;

  return {
    plugins: [react()],
    // ❌ SUPPRIMEZ CETTE SECTION - la clé reste côté serveur maintenant
    // define: {
    //   'process.env.API_KEY': JSON.stringify(apiKey || ''),
    // },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // ❌ RETIREZ @google/genai d'ici aussi
            vendor: ['react', 'react-dom', 'recharts', 'lucide-react'],
          },
        },
      },
    },
  }
})