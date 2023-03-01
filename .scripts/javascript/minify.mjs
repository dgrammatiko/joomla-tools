import { basename } from 'node:path';
import { minify } from 'terser';
import fsExtra from 'fs-extra';
import { logger } from '../utils/logger.mjs';

const { readFile, writeFile } = fsExtra;

/**
 * Minify a js file using Terser
 *
 * @param file
 * @returns {Promise<void>}
 */
export async function minifyJs(file) {
  const fileContent = await readFile(file, { encoding: 'utf8' });
  const content = await minify(fileContent, { sourceMap: false, format: { comments: false } });
  await writeFile(file.replace('.js', '.min.js'), content.code, { encoding: 'utf8', mode: 0o644 });
  logger(`✅ Legacy js file: ${basename(file)}: minified`);
};

/**
 * Minify a chunk of js using Terser
 *
 * @param code
 * @returns {Promise<void>}
 */
export async function minifyJsCode(code) {
  minify(code, { sourceMap: false, format: { comments: false } });
}
