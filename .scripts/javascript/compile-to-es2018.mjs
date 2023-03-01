import { basename, sep, resolve } from 'node:path';
import { rollup } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import jsonFn from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import { babel } from '@rollup/plugin-babel';
import { handleESMToLegacy } from './compile-to-es5.mjs';
import { minifyJsCode } from './minify.mjs';
import { logger } from '../utils/logger.mjs';

/**
 * Compiles es6
 *
 * @param file the full path to the file + filename + extension
 */
export async function handleESMFile(file) {
  logger(`Transpiling ES2018 file: ${basename(file).replace('.es6.js', '.js')}...`);
  const newPath = file.replace(/\.w-c\.es6\.js$/, '').replace(/\.es6\.js$/, '').replace(`${sep}media_src${sep}`, `${sep}media${sep}`);
  const bundle = await rollup({
    input: resolve(file),
    plugins: [
      nodeResolve({
        preferBuiltins: false,
      }),
      jsonFn(),
      replace({
        preventAssignment: true,
        // CSS_CONTENTS_PLACEHOLDER: minifiedCss,
        delimiters: ['{{', '}}'],
      }),
      babel({
        exclude: 'node_modules/core-js/**',
        babelHelpers: 'bundled',
        babelrc: false,
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                browsers: [
                  '> 1%',
                  'not ie 11',
                  'not op_mini all',
                  'not dead',
                ],
              },
              bugfixes: true,
              loose: true,
            },
          ],
        ],
      }),
    ],
    external: [],
    // importAssertions: true,
  });

  bundle.write({
    format: 'es',
    sourcemap: false,
    file: resolve(`${newPath}.js`),
    externalImportAssertions: false,
  })
  .then((value) => minifyJsCode(value.output[0].code))
  .then((content) => {
    logger(`✅ ES2017 file: ${basename(file).replace('.es6.js', '.js')}: transpiled`);

    return writeFile(resolve(`${newPath}.min.js`), content.code, { encoding: 'utf8', mode: 0o644 });
  })
  .then(() => handleESMToLegacy(resolve(`${newPath}.js`)))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
  });

  // closes the bundle
  await bundle.close();
};
