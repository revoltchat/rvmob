const isFoss = process.env.FOSS;
const notifeeObject = isFoss ? null : {};

module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts'],
  // exclude Notifee for FOSS builds
  dependencies: {
    '@notifee/react-native': {
      platforms: {
        android: notifeeObject,
        ios: null,
      },
    },
  },
};
