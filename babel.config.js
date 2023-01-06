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
      ignore: ['**/*.test.js'],
    };
  }

  return {
    ...defaultBabelConfig,
  };
};
