import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'src/index.js',
  output: {
    format: 'es',
    name: 'au-flux',
    globals: ['React']
  },
  external: [ 'react', 'immutable' ],
  plugins: [
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      presets: [ 'react' ],
      // plugins: ['external-helpers'],
    }),
    // resolve({
    //   only: [
    //     'async.auto',
    //     'async.util.once',
    //     'async.util.noop',
    //     'async.util.keys',
    //     'async.util.reduce',
    //     'async.util.indexof',
    //     'async.util.isarray',
    //     'async.util.arrayeach',
    //     'async.util.restparam',
    //     'async.util.foreachof',
    //     'async.util.setimmediate',
    //   ]
    // }),
    // commonjs({
    // }),
    // uglify({
    //   compress: {
    //     pure_getters: true,
    //     // unsafe: true,
    //     // unsafe_comps: true,
    //     // warnings: false
    //   },
    //   sourceMap: true
    // })
  ]
};