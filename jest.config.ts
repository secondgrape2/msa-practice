const config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@app/common/(.*)$': '<rootDir>/libs/common/src/$1',
    '^@app/common$': '<rootDir>/libs/common/src',
    '^@app/(.*)$': '<rootDir>/libs/$1',
  },
  modulePaths: ['<rootDir>'],
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '<rootDir>/coverage',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/dist', 'node_modules'],
  testPathIgnorePatterns: ['jest.config.ts'],
  workerIdleMemoryLimit: '500MB',
};

export default config;
