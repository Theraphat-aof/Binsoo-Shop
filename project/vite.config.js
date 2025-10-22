import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  base: '/Binsoo-Shop',
  plugins: [react()],
  server: {
    host: true,
    port: 9000,
  },
})
