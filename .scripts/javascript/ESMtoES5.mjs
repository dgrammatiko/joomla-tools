import { basename, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { rollup } from 'rollup';
import { config } from './configs/rollup.es5.mjs';
import { logger } from '../utils/logger.mjs';

/**
 * Compiles es6 files to es5.
 *
 * @param { string } inputFile the input file
 * @param { string } outputFile the generated file
 */
async function handleESMToLegacy(inputFile, outputFile) {
  if (!existsSync(inputFile)) {
    throw new Error(`File ${inputFile} doesn't exist`);
  }

  logger(`Transpiling ES5 file: ${basename(outputFile)}...`);

  if (!existsSync(inputFile)) return;

  const bundle = await rollup({ ...config.inputOptions, input: inputFile });
  await bundle.write({ ...config.outputOptions, file: resolve(outputFile) });
  await bundle.close();
};

export { handleESMToLegacy };
