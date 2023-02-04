const path = require('path');

const errorCodesPath = path.resolve(
  __dirname,
  './packages/dalya-utils/public/static/error-codes.json',
);

const missingError = process.env.DALYA_EXTRACT_ERROR_CODES === 'true' ? 'write' : 'annotate';

const defaultBabelConfig = {
  presets: [
    '@babel/preset-env',
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      'babel-plugin-macros',
      {
        dalyaError: {
          errorCodesPath,
          missingError,
        },
      },
    ],
    [
      '@babel/plugin-transform-runtime',
      {
        regenerator: true,
      },
    ],
  ],
};

module.exports = function (api) {
  const isProduction = api.env('production');
  if (isProduction) {
    return {
      ...defaultBabelConfig,
      ignore: ['**/*.test.ts', '**/*.test.tsx', '**/*.stories.tsx'],
    };
  }

  return {
    ...defaultBabelConfig,
  };
};
