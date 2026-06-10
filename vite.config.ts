import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [tailwindcss(), react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    appType: 'spa',
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            mapbox: ['mapbox-gl'],
            supabase: ['@supabase/supabase-js'],
          },
        },
      },
    },
    server: {
      proxy: {
        '/api/scores': {
          target: 'https://api.football-data.org',
          changeOrigin: true,
          rewrite: () => '/v4/teams/765/matches?competitions=WC&season=2026',
          headers: { 'X-Auth-Token': env.FOOTBALL_DATA_API_KEY ?? '' },
        },
        '/api/standings': {
          target: 'https://api.football-data.org',
          changeOrigin: true,
          rewrite: () => '/v4/competitions/WC/standings?season=2026',
          headers: { 'X-Auth-Token': env.FOOTBALL_DATA_API_KEY ?? '' },
        },
      },
    },
  }
})
