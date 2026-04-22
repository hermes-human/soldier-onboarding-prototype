import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/soldier-onboarding-prototype/',
  plugins: [react()],
})
