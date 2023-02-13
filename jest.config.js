const config = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.ts?$': 'ts-jest', // TypeScript test files are transformed to js
    '^.+\\.(js|jsx)$': 'babel-jest', // use babel-jest to transform dependencies in node_modules
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  moduleNameMapper: {
    '^dalya$': '<rootDir>/packages/dalya-components/src',
    '^dalya/(.*)$': '<rootDir>/packages/dalya-components/src/$1',
    '^dalya-styled-engine$': '<rootDir>/packages/dalya-tools/src/styled-engine',
    '^dalya-system$': '<rootDir>/packages/dalya-tools/src/system',
    '^dalya-types$': '<rootDir>/packages/dalya-tools/src/types',
    '^dalya-utils$': '<rootDir>/packages/dalya-utils/src',
  },
};

module.exports = config;

// https://kulshekhar.github.io/ts-jest/docs/getting-started/paths-mapping/
// Jest does not understand TypeScript files
