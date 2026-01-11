import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Ensure environment variables are properly loaded
  envPrefix: 'VITE_',
  // Production-specific configuration
  build: {
    sourcemap: false, // Disable source maps in production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          axios: ['axios'],
        },
      },
    },
  },
  // Development server configuration
  server: {
    port: 5174,
    host: true,
  },
  // Preview server configuration (for production testing)
  preview: {
    port: 4173,
    host: true,
  },
})
