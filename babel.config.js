module.exports = {
  presets: ['module:@react-native/babel-preset'],
  env: {
    production: {
      plugins: [
        'react-native-web',
        [
          'transform-remove-console',
          {
            exclude: ['error', 'warn'],
          },
        ],
      ],
    },
  },
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@rvmob': './src',
          '@rvmob-i18n': './i18n',
          "^react-native$": "react-native-web",
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
