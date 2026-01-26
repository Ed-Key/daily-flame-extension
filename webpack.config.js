const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  // Exclude jsdom from bundle - it's only used in Node.js tests, not in the extension
  externals: {
    jsdom: 'commonjs jsdom',
  },
  entry: {
    content: './src/content/monitor.ts',
    'verse-app': './src/content/verse-app.ts',
    background: './src/background/index-simple.ts',
    auth: './src/auth/auth.ts',
    offscreen: './src/offscreen.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[name].[contenthash].chunk.js',
    clean: true,
    publicPath: '',
  },
  optimization: {
    splitChunks: {
      chunks(chunk) {
        // Don't split verse-app, auth, or offscreen - we want them as single bundles
        return chunk.name !== 'verse-app' && chunk.name !== 'auth' && chunk.name !== 'offscreen';
      },
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: [/node_modules/, /__tests__/],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'manifest.json',
          to: 'manifest.json',
        },
        {
          from: 'src/assets',
          to: 'assets',
          noErrorOnMissing: true,
        },
        {
          from: 'src/auth/auth.html',
          to: 'auth.html',
        },
        {
          from: 'src/auth/auth.css',
          to: 'auth.css',
        },
        {
          from: 'src/offscreen.html',
          to: 'offscreen.html',
        },
        {
          from: 'public/icon-*.png',
          to: '[name][ext]',
        },
        {
          from: 'public/fixtures',
          to: 'fixtures',
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
  mode: 'development',
  devtool: 'cheap-module-source-map',
};