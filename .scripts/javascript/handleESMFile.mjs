import { basename, dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { rollup } from 'rollup';
import { minify } from 'terser';
import { config } from './configs/rollup.2018.mjs';
import { logger } from '../utils/logger.mjs';

/**
 * Compiles es6
 *
 * @param {string} inputFile the full path to the file + filename + extension
 * @param {string} outputFile the full path to the file + filename + extension
 */
async function handleESMFile(inputFile, outputFile) {
  if (!existsSync(inputFile)) {
    throw new Error(`File ${inputFile} doesn't exist`);
  }

  if (!existsSync(dirname(outputFile))) {
    await mkdir(dirname(outputFile), { recursive: true, mode: 0o755 });
  }

  logger(`Transpiling ES2018 file: ${basename(inputFile).replace('.mjs', '.js')}...`);
  const bundle = await rollup({ ...config.inputOptions, input: resolve(inputFile) });
  const output = await bundle.write({ ...config.outputOptions, file: resolve(outputFile) });
  const minified = await minify(output.output[0].code, { sourceMap: false, format: { comments: false } });
  await writeFile(resolve(outputFile.replace('.js', '.min.js')), minified.code, {encoding: 'utf8', mode: '0644'});
  logger(`✅ ES2018 file: ${basename(outputFile)}: transpiled`);
  await bundle.close();

  return output.output[0].code;
};

export { handleESMFile };
