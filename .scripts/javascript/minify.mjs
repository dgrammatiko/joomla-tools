import { basename } from 'node:path';
import { minify } from 'terser';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { logger } from '../utils/logger.mjs';

/**
 * Minify a js file using Terser
 *
 * @param file
 * @returns {Promise<void>}
 */
async function minifyJs(file) {
  if (!existsSync(file)) {
    throw new Error(`File ${file} doesn't exist`);
  }
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
const minifyJsCode = async (code) => minify(code, { sourceMap: false, format: { comments: false } });

export { minifyJs, minifyJsCode }
