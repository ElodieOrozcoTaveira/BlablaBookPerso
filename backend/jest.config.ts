import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
    }],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',  // Convertit .js vers .ts pour les imports relatifs
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/tests/utils/setup.ts'],
  // Optimisations pour eviter les timeouts et problemes memoire
  maxWorkers: 1,           // Execution sequentielle pour eviter surcharge memoire
  testTimeout: 30000,      // 30s timeout par test
  forceExit: true,         // Force exit apres tests
  detectOpenHandles: true, // Detecte les handles ouverts
  workerIdleMemoryLimit: '1GB', // Limite memoire par worker
};

export default config;
