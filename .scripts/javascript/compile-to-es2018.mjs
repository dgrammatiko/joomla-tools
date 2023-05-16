import { basename, dirname, sep, resolve } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
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
async function handleESMFile(file) {
  if (!existsSync(file)) {
    throw new Error(`File ${file} doesn't exist`);
  }
  if (!globalThis.searchPath || !globalThis.replacePath) {
    throw new Error(`Global searchPath and replacePath are not defined`);
  }
  logger(`Transpiling ES2018 file: ${basename(file).replace('.mjs', '.js')}...`);
  const newPath = file.replace(/\.mjs$/, '').replace(`${globalThis.searchPath}`, globalThis.replacePath);
  if (!existsSync(dirname(newPath))) {
    await mkdir(dirname(newPath), { recursive: true, mode: 0o755 });
  }
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
    logger(`✅ ES2018 file: ${basename(file).replace('.mjs', '.js')}: transpiled`);

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

export { handleESMFile };
