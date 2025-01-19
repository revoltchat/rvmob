const regularAlias = {
  '@clerotri': './src',
  '@clerotri-i18n': './i18n',
};

const webAlias = {
  ...regularAlias,
  '^react-native$': 'react-native-web',
};

const commonPlugins = ['react-native-reanimated/plugin'];

module.exports = {
  mobilePlugins: [
    ...commonPlugins,
    [
      'module-resolver',
      {
        alias: regularAlias,
      },
    ],
  ],
  webPlugins: [
    ...commonPlugins,
    [
      'module-resolver',
      {
        alias: webAlias,
      },
    ],
    'react-native-web',
  ],
};
