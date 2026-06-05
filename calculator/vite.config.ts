import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // jsdom gives us a fake browser DOM so React components can render in tests.
    environment: 'jsdom',
    // `globals: true` lets us use describe/it/expect without importing them.
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
