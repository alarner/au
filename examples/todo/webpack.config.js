const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: [
    './web/index.js'
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ["source-map-loader"],
        enforce: "pre"
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['react'],
            plugins: ['transform-object-rest-spread']
          }
        }]
      }
    ]
  },
  devtool: 'inline-source-map',
  output: {
    path: path.resolve(__dirname),
    publicPath: '/',
    filename: 'bundle.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Todo List',
      template: './web/index.html'
    })
  ]
};