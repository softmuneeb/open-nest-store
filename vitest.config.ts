import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: [
      { find: /^~\//, replacement: path.resolve(__dirname, 'app') + '/' },
    ],
  },
  test: {
    // Unit and integration tests run in happy-dom (browser-like)
    environment: 'happy-dom',
    globals: true,

    // Global setup/teardown
    globalSetup: ['./tests/setup/global-setup.ts'],
    setupFiles: ['./tests/setup/vitest-setup.ts'],

    // Test file patterns
    include: [
      'tests/unit/**/*.test.ts',
      'tests/unit/**/*.test.tsx',
      'tests/integration/**/*.test.ts',
    ],

    // Exclude E2E (Playwright handles those)
    exclude: ['tests/e2e/**', 'node_modules/**', 'build/**'],

    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      include: ['app/**/*.{ts,tsx}'],
      exclude: [
        'app/root.tsx',
        'app/entry.server.tsx',
        'app/routes.ts',
        '**/*.d.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },

    // Timeouts
    testTimeout: 10_000,
    hookTimeout: 30_000,

    // Reporter
    reporter: ['verbose'],
    outputFile: {
      junit: './coverage/junit.xml',
    },
  },
});
