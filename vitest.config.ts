import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  // Use automatic JSX runtime (React 17+) so test files don't need `import React`
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  resolve: {
    alias: [
      { find: /^~\//, replacement: path.resolve(__dirname, 'app') + '/' },
    ],
  },
  test: {
    // Component unit tests run in happy-dom (browser-like DOM APIs needed)
    // Integration tests run in node to allow full HTTP header access (cookie, set-cookie)
    environment: 'happy-dom',
    environmentMatchGlobs: [
      ['tests/integration/**', 'node'],
    ],
    globals: true,

    // Run test files sequentially to prevent data-race on shared in-memory MongoDB
    fileParallelism: false,

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
