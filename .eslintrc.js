module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    'react/react-in-jsx-scope': 0,
    'react-native/no-inline-styles': 0, // TODO: turn this back on when the codebase is less error-filled
  },
};
