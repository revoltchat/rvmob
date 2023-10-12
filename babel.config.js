module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: ['react-native-reanimated/plugin', ["transform-remove-console", { "exclude": ["error", "warn"] }]],
};
