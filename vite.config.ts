import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Use VITE_BASE_PATH in CI (set to /repo-name/ for GitHub Pages), default to / for local dev
  base: process.env.VITE_BASE_PATH ?? '/',
})
