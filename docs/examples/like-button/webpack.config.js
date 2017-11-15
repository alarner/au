const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './src/scripts/main.js',
	plugins: [
		new HtmlWebpackPlugin({
			title: 'AU Flux Like Button Example',
			template: 'src/index.html'
		})
	],
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist')
	}
};
