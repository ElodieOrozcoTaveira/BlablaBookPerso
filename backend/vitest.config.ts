import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      // Redirect @jest/globals to a local shim so Vitest doesn't try to parse
      // the Jest bundle (which throws when required outside Jest).
      '@jest/globals': path.resolve(__dirname, 'tests/shims/jest-globals-shim.cjs')
    }
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    // Exclude compiled artifacts and other large folders to avoid picking up
    // stale Jest-compiled files (which import @jest/globals)
    exclude: ['dist/**', 'node_modules/**'],
    // (Le parallélisme sera limité via l'option CLI --maxThreads=1 dans le script test:ci)
    setupFiles: ['tests/setup.ts'],
    passWithNoTests: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      all: true,
    },
  },
});
