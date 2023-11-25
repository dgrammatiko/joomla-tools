import { nodeResolve } from '@rollup/plugin-node-resolve';
import jsonFn from '@rollup/plugin-json';
import { swc, defineRollupSwcOption } from 'rollup-plugin-swc3';

const plugins = [
  nodeResolve({ preferBuiltins: false }),
  jsonFn(),
  swc(defineRollupSwcOption({
    minify: true,
    jsc: {
      target: "es2018",
      minify: {
        sourceMap: true,
      }
    },
    tsconfig: false,
    sourceMaps: true
  })),
];

const config = {
  inputOptions: { plugins },
  outputOptions: {
    format: 'es',
    sourcemap: true,
    externalImportAttributes: false,
  }
}

export { config };
