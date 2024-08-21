import { nodeResolve } from '@rollup/plugin-node-resolve';
import jsonFn from '@rollup/plugin-json';
// import replace from '@rollup/plugin-replace';
import { babel } from '@rollup/plugin-babel';

const plugins = [
  nodeResolve({ preferBuiltins: false }),
  jsonFn(),
  // replace({
  //   preventAssignment: true,
  //   // CSS_CONTENTS_PLACEHOLDER: minifiedCss,
  //   delimiters: ['{{', '}}'],
  // }),
  babel({
    exclude: 'node_modules/core-js/**',
    babelHelpers: 'bundled',
    babelrc: false,
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            browsers: ['> 1%', 'not op_mini all', 'not dead'],
          },
          bugfixes: true,
          loose: true,
        },
      ],
    ],
  }),
  // terser(),
];

const config = {
  inputOptions: { plugins },
  outputOptions: {
    format: 'es',
    sourcemap: false,
    externalImportAttributes: false,
  },
};

export { config };
