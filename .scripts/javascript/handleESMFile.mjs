import fs from 'node:fs';
import { dirname, basename, sep } from 'node:path';

import { rolldown } from 'rolldown';
import { config } from './configs/rollup.2018.mjs';
import { logger } from '../utils/logger.mjs';

function isProd() {
  return !process.env.production || process.env.production === 'production' ? true : false;
}

/**
 * Compiles es6
 *
 * @param { string } inputFile the full path to the file + filename + extension
 * @param { string } outputFile the full path to the file + filename + extension
 */
async function handleESMFile(inputFile, outputFile = '') {
  // biome-ignore lint/style/noParameterAssign:
  outputFile = !outputFile ? inputFile.replace('.mjs', '.min.js').replace(/^media_source(\/|\\)/, 'media/') : outputFile;

  if (!fs.existsSync(inputFile)) {
    throw new Error(`File ${inputFile} doesn't exist`);
  }

  const currentOpts = {
    ...config.outputOptions,
    dir: dirname(outputFile),
    minify: true,
    sourcemap: isProd() ? true : 'inline',
    entryFileNames: '[name].min.js',
    chunkFileNames: '[name].min.js',
  };

  const bundle = await rolldown({ ...config.inputOptions, input: inputFile });
  await bundle.write(currentOpts);
  logger(`✅ ES2018 file: ${basename(outputFile)}: transpiled`);
  await bundle.destroy();
}

export { handleESMFile };
