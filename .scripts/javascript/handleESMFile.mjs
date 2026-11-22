import { basename, dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { rolldown } from 'rolldown';
import { config } from './configs/rollup.2018.mjs';
import { logger } from '../utils/logger.mjs';

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

  if (!existsSync(dirname(outputFile))) {
    await mkdir(dirname(outputFile), { recursive: true, mode: 0o755 });
  }

  logger(`Transpiling ES2018 file: ${basename(inputFile).replace('.mjs', '.js')}...`);
  const bundler = await rolldown({ ...config, input: resolve(inputFile) });
  const result = await bundler.write({ file: resolve(outputFile) });
  await bundler.close();

  const minifiedBundler = await rolldown({ ...config, input: resolve(inputFile), output: { ...config.output, minify: true } });
  await minifiedBundler.write({ file: resolve(outputFile.replace('.js', '.min.js')) });
  await minifiedBundler.close();

  logger(`✅ ES2018 file: ${basename(outputFile)}: transpiled`);

  return result.output[0].code;
};

export { handleESMFile };
