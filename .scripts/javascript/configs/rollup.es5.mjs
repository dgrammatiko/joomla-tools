import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { swc, defineRollupSwcOption } from 'rollup-plugin-swc3';

const plugins = [
  nodeResolve({ preferBuiltins: false }),
  commonjs(),
  swc(
    defineRollupSwcOption({
      minify: true,
      jsc: {
        target: 'es2018',
        minify: {
          sourceMap: true,
        },
      },
      tsconfig: false,
      sourceMaps: true,
    }),
  ),
];

const config = {
  inputOptions: { plugins },
  outputOptions: {
    format: 'iife',
    sourcemap: true,
  },
};

export { config };
