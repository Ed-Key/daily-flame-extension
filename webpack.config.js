const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: {
    content: './src/content/monitor.ts',
    'verse-app': './src/content/verse-app.ts',
    background: './src/background/index.ts',
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
        // Don't split verse-app - we want it as a single bundle
        return chunk.name !== 'verse-app';
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
        exclude: /node_modules/,
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
      ],
    }),
  ],
  mode: 'development',
  devtool: 'cheap-module-source-map',
};