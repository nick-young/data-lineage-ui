import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html'
      },
    },
  },
  publicDir: resolve(__dirname, 'public'),
  base: '/data-lineage-ui/',
})
