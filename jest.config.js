module.exports = {
    testEnvironment: 'node',
    verbose: true,
    silent: false,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coveragePathIgnorePatterns: [
      '/node_modules/',
      '/tests/fixtures/',
    ],
    testMatch: [
      '**/tests/**/*.test.js',
    ],
    testEnvironmentOptions: {
      NODE_ENV: 'test'
    },
    setupFiles: ['dotenv/config'],
    testTimeout: 10000,
    clearMocks: true,
    restoreMocks: true,
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    globalSetup: './tests/globalSetup.js',
    globalTeardown: './tests/globalTeardown.js',
    setupFilesAfterEnv: ['./tests/setup.js']
  };