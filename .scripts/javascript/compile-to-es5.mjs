import { basename, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { rollup } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { minifyJsCode } from './minify.mjs';
import { logger } from '../utils/logger.mjs';

/**
 * Compiles es6 files to es5.
 *
 * @param file the full path to the file + filename + extension
 */
async function handleESMToLegacy(file) {
  if (!existsSync(file)) {
    throw new Error(`File ${file} doesn't exist`);
  }
  logger(`Transpiling ES5 file: ${basename(file).replace('.js', '-es5.js')}...`);
  const bundleLegacy = await rollup({
    input: resolve(file),
    plugins: [
      nodeResolve(),
      commonjs(),
      babel({
        exclude: ['node_modules/core-js/**', 'media/system/js/core.js'],
        babelHelpers: 'bundled', // runtime
        babelrc: false,
        presets: [
          [
            '@babel/preset-env',
            {
              corejs: '3.8',
              useBuiltIns: 'entry', // usage
              targets: {
                firefox: '40',
              },
              loose: true,
              bugfixes: false,
              modules: false,
            },
          ],
        ],
        // plugins: ['@babel/plugin-transform-runtime'],
      }),
    ],
  });

  await bundleLegacy.write({
    format: 'iife',
    sourcemap: false,
    file: resolve(`${file.replace(/\.js$/, '')}-es5.js`),
  })
  .then((value) => minifyJsCode(value.output[0].code))
  .then((content) => {
    logger(`ES5 file: ${basename(file).replace('.js', '-es5.js')}: ✅ transpiled`);

    return writeFile(resolve(`${file.replace(/\.js$/, '')}-es5.min.js`), content.code, { encoding: 'utf8', mode: 0o644 });
  })
};

export { handleESMToLegacy };
