const {mobilePlugins} = require('./config/babel-shared');

module.exports = {
  presets: [
    [
      '@rnx-kit/babel-preset-metro-react-native',
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
