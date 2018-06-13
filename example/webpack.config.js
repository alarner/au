const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: [
    './index.js'
  ],
  // module: {
  //   rules: [
  //     {
  //       test: /\.(js|jsx)$/,
  //       exclude: /node_modules/,
  //       use: ['babel-loader']
  //     }
  //   ]
  // },
  // devServer: {
  //   contentBase: './dev',
  //   historyApiFallback: true,
  //   port: 4000
  // },
  // resolve: {
  //   extensions: ['*', '.js', '.jsx']
  // },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ["source-map-loader"],
        enforce: "pre"
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
      title: 'Climbalytics Admin',
      template: './index.html'
    })
  ]
};