import { basename, dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { rolldown } from 'rolldown';
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
  if (!existsSync(dirname(outputFile))) {
    await mkdir(dirname(outputFile), { recursive: true, mode: 0o755 });
  }

  logger(`Transpiling ES5 file: ${basename(outputFile)}...`);

  const bundler = await rolldown({ ...config, input: inputFile });
  await bundler.write({ file: resolve(outputFile) });
  await bundler.close();

  const minifiedBundler = await rolldown({ ...config, input: inputFile, output: { ...config.output, minify: true } });
  await minifiedBundler.write({ file: resolve(outputFile.replace('.js', '.min.js')) });
  await minifiedBundler.close();
};

export { handleESMToLegacy };
