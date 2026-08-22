import path from 'node:path'
import { defineConfig } from 'vitest/config'

const dirname = import.meta.dirname

// standalone config: the app's vite plugins (react compiler, tailwind) have
// no business running for pure-function tests
export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },
})
