const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const {makeMetroConfig} = require('@rnx-kit/metro-config');
const {
  CyclicDependencies,
} = require('@rnx-kit/metro-plugin-cyclic-dependencies-detector');
const {
  DuplicateDependencies,
} = require('@rnx-kit/metro-plugin-duplicates-checker');
const {MetroSerializer} = require('@rnx-kit/metro-serializer');

const defaultConfig = getDefaultConfig(__dirname);
const {assetExts, sourceExts} = defaultConfig.resolver;

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */

const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: true,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  },
  serializer: {
    customSerializer: MetroSerializer([
      CyclicDependencies({
        includeNodeModules: false,
        linesOfContext: 3,
        throwOnError: true,
      }),
      DuplicateDependencies,
    ]),
  },
};

module.exports = makeMetroConfig(mergeConfig(defaultConfig, config));
