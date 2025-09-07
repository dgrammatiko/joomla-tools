import { existsSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import { rolldown } from 'rolldown';
import { config } from './configs/rollup.es5.mjs';

function isProd() {
  return !process.env.ENV || process.env.ENV === 'production';
}

/**
 * @param { string } inputFile
 */
async function handleIIFE(inputFile) {
  if (!inputFile.endsWith('.js')) {
    // fullfil promise
    return true;
  }
  if (!existsSync(inputFile)) {
    throw new Error(`File ${inputFile} doesn't exist`);
  }

  const outputFile = inputFile.replace('.js', '.min.js').replace(/^media_source(\/|\\)/, 'media/');

  const currentOpts = {
    ...config.outputOptions,
    dir: dirname(outputFile),
    minify: true,
    sourcemap: isProd() ? true : 'inline',
    // entryFileNames: chunk => chunk.facadeModuleId.endsWith('.es5.js') ? basename(outputFile) : basename(chunk.facadeModuleId),
    // chunkFileNames: '[name].min.js',
    entryFileNames: '[name].min.js',
    chunkFileNames: '[name].min.js',
  };

  const bundle = await rolldown({ ...config.inputOptions, input: inputFile });
  await bundle.write(currentOpts);
  console.log(`✅ ESM: ${inputFile} === ${outputFile}\n`);
}

export { handleIIFE };
