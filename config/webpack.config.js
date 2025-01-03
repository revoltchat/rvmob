const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const dir = path.resolve(__dirname);
const appDirectory = `${dir}/../`;
const {webPlugins} = require(`${dir}/babel-shared`);
const {presets} = require(`${dir}/../babel.config.js`);

const compileNodeModules = [
  // react-native packages that need compiling
  '@gorhom/bottom-sheet',
  '@rexovolt/react-native-markdown-display',
  'react-native-gesture-handler',
  'react-native-reanimated-image-viewer',
  'react-native-vector-icons',
].map(moduleName => path.resolve(appDirectory, `node_modules/${moduleName}`));

const babelLoaderConfiguration = {
  test: /\.(js|ts)x?$/,
  // Add every directory that needs to be compiled by Babel during the build.
  include: [
    path.resolve(__dirname, '../index.web.js'),
    path.resolve(__dirname, '../App.tsx'),
    path.resolve(__dirname, '../src'),
    path.resolve(__dirname, '../i18n'),
    ...compileNodeModules,
  ],
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      presets,
      plugins: webPlugins,
    },
  },
};

const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png)$/,
  use: {
    loader: 'url-loader',
    options: {
      name: '[name].[ext]',
    },
  },
};

const vectorLoaderConfiguration = {
  test: /\.svg$/,
  exclude: /node_modules/,
  use: [
    {
      loader: '@svgr/webpack',
    },
  ],
};

const fontLoaderConfiguration = {
  test: /\.ttf$/,
  loader: 'url-loader',
  include: [
    path.resolve(__dirname, '../assets/fonts'),
    path.resolve(__dirname, '../node_modules/react-native-vector-icons'),
  ],
};

module.exports = {
  entry: {
    app: path.join(__dirname, '../index.web.js'),
  },
  output: {
    filename: 'bundle-[name].web.js',
    path: path.resolve(appDirectory, 'dist/web'),
  },
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
    alias: {
      'react-native$': 'react-native-web',
      // the ESM version of MMKV breaks Webpack
      'react-native-mmkv': 'react-native-mmkv/lib/commonjs',
    },
    symlinks: false,
    fallback: {crypto: require.resolve('react-native-get-random-values')},
  },
  module: {
    rules: [
      babelLoaderConfiguration,
      fontLoaderConfiguration,
      imageLoaderConfiguration,
      vectorLoaderConfiguration,
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../web/index.html'),
      favicon: path.join(__dirname, '../public/favicon.ico'),
    }),
    new webpack.DefinePlugin({
      // See: https://github.com/necolas/react-native-web/issues/349
      __DEV__: JSON.stringify(true),
    }),
    new webpack.EnvironmentPlugin({JEST_WORKER_ID: null}),
    new webpack.DefinePlugin({process: {env: {}}}),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
};
