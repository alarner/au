const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const common = require('./webpack.common.js');

module.exports = [
	merge(common, {
		plugins: [
			new UglifyJSPlugin()
		],
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
			libraryTarget: 'umd',
			filename: 'bundle.min.js'
		}
	}),
	merge(common, {
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
	})
];
