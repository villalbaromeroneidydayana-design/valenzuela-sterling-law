import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createApiMiddleware } from './server/apiMiddleware.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-server-middleware',
      configureServer(server) {
        server.middlewares.use(createApiMiddleware())
      }
    }
  ],
  server: {
    port: 3000,
    open: false
  }
})
