import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from '../../tsconfig.json';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../../',
  testRegex: 'apps/event/test/.*\\.integration-spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['apps/event/src/**/*.(t|j)s'],
  coverageDirectory: 'coverage/apps/event',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@app/common/(.*)$': '<rootDir>/libs/common/src/$1',
  },
  modulePaths: ['<rootDir>/apps/event/src'],
};

export default config;
