const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

const ModuleFederationPlugin = webpack.container.ModuleFederationPlugin;
const packageJSON = require('../../package.json');
const deps = packageJSON.dependencies;

const CorsWorkerPlugin = require('./plugins/CorsWorkerPlugin');

module.exports = {
  target: 'web',
  entry: {
    app: './public/app/index.ts',
  },
  output: {
    clean: true,
    path: path.resolve(__dirname, '../../public/build'),
    filename: '[name].[contenthash].js',
    // Keep publicPath relative for host.com/grafana/ deployments
    publicPath: 'public/build/',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.es6', '.js', '.json', '.svg'],
    alias: {
      // some of data source plugins use global Prism object to add the language definition
      // we want to have same Prism object in core and in grafana/ui
      prismjs: require.resolve('prismjs'),
    },
    modules: ['node_modules', path.resolve('public')],
    fallback: {
      buffer: false,
      fs: false,
      stream: false,
      http: false,
      https: false,
      string_decoder: false,
    },
    symlinks: false,
  },
  ignoreWarnings: [/export .* was not found in/],
  stats: {
    children: false,
    source: false,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'grafana',
      filename: 'remoteEntry.js',
      remotes: {},
      exposes: {},
      shared: {
        '@emotion/css': { singleton: true, requiredVersion: deps['@emotion/css'] },
        '@emotion/react': { singleton: true, requiredVersion: deps['@emotion/react'] },
        react: { singleton: true, requiredVersion: deps.react },
        'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
        '@grafana/data': {
          singleton: true,
          requiredVersion: '^9.0.0',
        },
        '@grafana/e2e-selectors': {
          singleton: true,
          requiredVersion: '^9.0.0',
        },
        '@grafana/runtime': {
          singleton: true,
          requiredVersion: '^9.0.0',
        },
        '@grafana/schema': {
          singleton: true,
          requiredVersion: '^9.0.0',
        },
        '@grafana/ui': {
          singleton: true,
          requiredVersion: '^9.0.0',
        },
      },
    }),
    new CorsWorkerPlugin(),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          context: path.join(require.resolve('monaco-editor/package.json'), '../min/vs/'),
          from: '**/*',
          to: '../lib/monaco/min/vs/', // inside the public/build folder
          globOptions: {
            ignore: [
              '**/*.map', // debug files
            ],
          },
        },
        {
          context: path.join(require.resolve('@kusto/monaco-kusto'), '../'),
          from: '**/*',
          to: '../lib/monaco/min/vs/language/kusto/',
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: require.resolve('jquery'),
        loader: 'expose-loader',
        options: {
          exposes: ['$', 'jQuery'],
        },
      },
      {
        test: /\.html$/,
        exclude: /(index|error)\-template\.html/,
        use: [
          {
            loader: 'ngtemplate-loader?relativeTo=' + path.resolve(__dirname, '../../public') + '&prefix=public',
          },
          {
            loader: 'html-loader',
            options: {
              sources: false,
              minimize: {
                removeComments: false,
                collapseWhitespace: false,
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(svg|ico|jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\?.*)?$/,
        type: 'asset/resource',
        generator: { filename: 'static/img/[name].[hash:8][ext]' },
      },
      // for pre-caching SVGs as part of the JS bundles
      {
        test: /(unicons|mono|custom)[\\/].*\.svg$/,
        type: 'asset/source',
      },
    ],
  },
  // https://webpack.js.org/plugins/split-chunks-plugin/#split-chunks-example-3
  optimization: {
    runtimeChunk: 'single',
  },
};
