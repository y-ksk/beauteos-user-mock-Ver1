// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // ← リポジトリ名と完全一致させる
  base: '/beauteos-user-mock-Ver1/',
})
