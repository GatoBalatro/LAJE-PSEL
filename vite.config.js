import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [
    react(),
    viteSingleFile({
      // Opcional: remove o loader do Vite (recomendado)
      removeViteModuleLoader: true,
    })
  ],
  build: {
    // Opcional: aumenta o limite para inlining de assets (imagens, etc)
    assetsInlineLimit: 100000000, // ~100MB (cuidado com tamanho final)
  }
})