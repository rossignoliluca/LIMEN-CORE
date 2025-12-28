// JEST CONFIGURATION FOR ENOQ TESTS
//
// Tests are organized in src/__tests__/
// Each test file documents WHY it exists.
//
// FILE CONVENTIONS:
// - .test.ts  = Unit tests (blocking, must pass for CI)
// - .bench.ts = Benchmark tests (non-blocking, documents known limitations)
//
// RUN ALL TESTS:  npm test
// RUN ONE TEST:   npx jest test-name
// RUN BENCHMARKS: npx jest detector_benchmark.bench.ts

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  // Only .test.ts files run by default (benchmarks are .bench.ts)
  testMatch: ['**/__tests__/**/*.test.ts'],
  // Exclude legacy benchmark tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/legacy/',
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/__tests__/**',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 30000,
};
