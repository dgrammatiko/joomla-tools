import { existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { rolldown } from 'rolldown';
import { config } from './configs/rollup.2022.mjs';

function isProd() {
  if (!process.env.ENV) {
    return true;
  }
  return process.env.ENV === 'production';
}

/**
 * Compiles es6
 *
 * @param { string } inputFile the full path to the file + filename + extension
 */
async function handleESMFile(inputFile) {
  if (!inputFile.endsWith('.mjs')) {
    return;
  }

  // biome-ignore lint/style/noParameterAssign:
  const outputFile = inputFile.replace('.mjs', '.min.js').replace(/^media_source(\/|\\)/, 'media/');

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
  console.log(`✅ ESM: ${inputFile} === ${outputFile}\n`);
}

export { handleESMFile };
