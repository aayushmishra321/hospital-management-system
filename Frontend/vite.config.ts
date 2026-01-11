import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Ensure environment variables are properly loaded
  envPrefix: 'VITE_',
  define: {
    // Force define API URL for production builds
    __HOSPITAL_API_URL__: JSON.stringify(process.env.VITE_API_URL || 'https://hospital-backend-zvjt.onrender.com/api'),
  },
  build: {
    // Ensure environment variables are included in build
    rollupOptions: {
      external: [],
    },
  },
})
