const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const {makeMetroConfig} = require('@rnx-kit/metro-config');
const {
  esbuildTransformerConfig,
} = require('@rnx-kit/metro-serializer-esbuild');

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
    ...esbuildTransformerConfig,
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
  },
  // serializer: {
  //   customSerializer: MetroSerializer([
  //     CyclicDependencies({
  //       includeNodeModules: false,
  //       linesOfContext: 3,
  //       throwOnError: true,
  //     }),
  //     DuplicateDependencies,
  //   ]),
  // },
};

module.exports = makeMetroConfig(mergeConfig(defaultConfig, config));
