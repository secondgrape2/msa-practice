const config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    'src/(.*)': '<rootDir>/src/$1',
    'test/(.*)': '<rootDir>/test/$1',
  },
  modulePaths: ['<rootDir>/src'],
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: '<rootDir>/coverage/unit',
  coveragePathIgnorePatterns: [],
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/dist', 'node_modules'],
  testPathIgnorePatterns: ['jest.config.ts'],
  workerIdleMemoryLimit: '500MB',
};

export default config;
