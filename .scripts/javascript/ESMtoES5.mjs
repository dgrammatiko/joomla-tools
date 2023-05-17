import { basename, dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { rollup } from 'rollup';
import { minify } from 'terser';
import { config } from './configs/rollup.es5.mjs';
import { logger } from '../utils/logger.mjs';

/**
 * Compiles es6 files to es5.
 *
 * @param inputFile the input file
 * @param outputFile the generated file
 */
async function handleESMToLegacy(inputFile, outputFile) {
  if (!existsSync(inputFile)) {
    throw new Error(`File ${inputFile} doesn't exist`);
  }
  if (!existsSync(dirname(outputFile))) {
    await mkdir(dirname(outputFile), { recursive: true, mode: 0o755 });
  }

  logger(`Transpiling ES5 file: ${basename(outputFile)}...`);

  const bundle = await rollup({ ...config.inputOptions, input: inputFile });
  const output = await bundle.write({ ...config.outputOptions, file: resolve(outputFile) });
  const minified = await minify(output.output[0].code, { sourceMap: false, format: { comments: false } });
  await writeFile(resolve(outputFile.replace('.js', '.min.js')), minified.code, {encoding: 'utf8', mode: 0o644});
  await bundle.close();
};

export { handleESMToLegacy };
