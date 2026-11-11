import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // keep existing REACT_APP_* variables from .env working
  envPrefix: 'REACT_APP_',
  server: { port: 4000, host: true },
  preview: { port: 4000 },
  build: {
    outDir: '../application/public',
    emptyOutDir: true,
  },
})
