import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from '../../tsconfig.json';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../../',
  testRegex: 'apps/auth/test/.*\\.integration-spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['apps/auth/src/**/*.(t|j)s'],
  coverageDirectory: 'coverage/apps/auth',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@app/common/(.*)$': '<rootDir>/libs/common/src/$1',
    '^@app/common$': '<rootDir>/libs/common/src',
    '^@app/(.*)$': '<rootDir>/libs/$1',
  },
  modulePaths: ['<rootDir>'],
  testPathIgnorePatterns: ['jest.config.ts'],
  workerIdleMemoryLimit: '500MB',
};

export default config;
