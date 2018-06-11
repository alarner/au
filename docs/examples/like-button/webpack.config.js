const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	mode: 'development',
	entry: [
		'./src/scripts/main.js'
	],
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: ['babel-loader']
			}
		]
	},
	resolve: {
		extensions: ['*', '.js', '.jsx']
	},
	output: {
		filename: '[name].bundle.js',
		path: path.join(__dirname, 'dev'),
		publicPath: '/'
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'Climbalytics Admin',
			template: './src/index.html'
		})
	]
};