import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoName = '/Binsoo-Shop/';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: repoName,
  server: {
    host: true,
    port: 9000,
  },
})
