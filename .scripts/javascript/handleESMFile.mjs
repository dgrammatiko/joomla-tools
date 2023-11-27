import { basename, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { rollup } from 'rollup';
import { config } from './configs/rollup.2018.mjs';

function logger(inp) {
  process.stdout.write(inp);
}

/**
 * Compiles es6
 *
 * @param { string } inputFile the full path to the file + filename + extension
 * @param { string } outputFile the full path to the file + filename + extension
 */
async function handleESMFile(inputFile, outputFile) {
  if (!existsSync(inputFile)) {
    throw new Error(`File ${inputFile} doesn't exist`);
  }

  // logger(`Transpiling ES2018 file: ${basename(inputFile).replace('.mjs', '.js')}...`);
  const bundle = await rollup({ ...config.inputOptions, input: resolve(inputFile) });
  await bundle.write({ ...config.outputOptions, file: resolve(outputFile) });

  logger(`✅ ES2018 file: ${basename(outputFile)}: transpiled`);
  await bundle.close();
}

export { handleESMFile };
