import { nodeResolve } from '@rollup/plugin-node-resolve';
// import jsonFn from '@rollup/plugin-json';
// import replace from '@rollup/plugin-replace';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';

const plugins = [
  nodeResolve(),
  commonjs(),
  babel({
    exclude: ['node_modules/core-js/**', 'media/system/js/core.js'],
    babelHelpers: 'runtime', // runtime
    babelrc: false,
    presets: [
      [
        '@babel/preset-env',
        {
          corejs: '3.8',
          useBuiltIns: 'entry', // entry
          targets: {
            firefox: '40',
          },
          loose: true,
          bugfixes: false,
          modules: false,
        },
      ],
    ],
    plugins: ['@babel/plugin-transform-runtime'],
  }),
];

// if (globalThis.onlyMinimized) {
//   plugins.push(terser());
// }

const config = {
  inputOptions: { plugins },
  outputOptions: {
    format: 'iife',
    sourcemap: false,
  },
};

export { config };
