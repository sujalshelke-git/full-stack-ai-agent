import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ DO NOT import tailwindcss here

export default defineConfig({
  plugins: [
    react(), // ✅ only React here
    
  ],
  base: '/'
})
