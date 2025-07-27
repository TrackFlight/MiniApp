import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
      svelte({
        compilerOptions: {
          customElement: true
        }
      })
  ],
  server: {
    allowedHosts: true,
    host: '0.0.0.0',
    port: 5173,

    proxy: {
      '/api': {
        target: 'http://bot:9045',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    rollupOptions: {
      output:{
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      }
    }
  }
})
