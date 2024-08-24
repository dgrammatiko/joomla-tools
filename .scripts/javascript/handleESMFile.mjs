import { existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { rolldown } from 'rolldown';
import { config } from './configs/rollup.2022.mjs';

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
  if (!inputFile.endsWith('js')) {
    return;
  }

  // biome-ignore lint/style/noParameterAssign:
  outputFile = !outputFile ? inputFile.replace('.mjs', '.min.js').replace(/^media_source(\/|\\)/, 'media/') : outputFile;

  if (!existsSync(inputFile)) {
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
  process.stdout.write(`✅ ESM: ${inputFile} === ${outputFile}\n`);
  await bundle.destroy();
}

export { handleESMFile };
