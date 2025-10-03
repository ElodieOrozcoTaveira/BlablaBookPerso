import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@jest/globals': path.resolve(__dirname, 'tests/shims/jest-globals-shim.cjs')
    }
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['dist/**', 'node_modules/**'],
    // No setupFiles for unit tests - they should mock everything
  },
});
