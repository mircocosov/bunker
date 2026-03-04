import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        diagnostics: false,
      },
    ],
  },
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.(t|j)s', '../../packages/shared/src/**/*.(t|j)s'],
  coverageThreshold: {
    global: {
      lines: 50,
      functions: 50,
      branches: 40,
      statements: 50,
    },
  },
  moduleNameMapper: {
    '^@bunker/shared$': '<rootDir>/../../packages/shared/src/index.ts',
    '^zod$': '<rootDir>/test/zod-test-shim.ts',
  },
  testEnvironment: 'node',
};

export default config;
