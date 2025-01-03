const {mobilePlugins} = require('./config/babel-shared');

const env = process.env.BABEL_ENV || process.env.NODE_ENV;

module.exports = {
  presets: [
    [
      '@rnx-kit/babel-preset-metro-react-native',
      {
        disableImportExportTransform:
          env === 'production' && process.env.RNX_METRO_SERIALIZER_ESBUILD,
      },
    ],
  ],
  env: {
    production: {
      plugins: [
        [
          'transform-remove-console',
          {
            exclude: ['error', 'warn'],
          },
        ],
      ],
    },
  },
  plugins: mobilePlugins,
};
