const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
	mode: 'production',
	externals: {
		react: {
			commonjs: 'react',
			commonjs2: 'react',
			amd: 'react',
			root: 'React'
		}
	},
	output: {
		library: 'au-flux',
		libraryTarget: 'umd'
	}
});