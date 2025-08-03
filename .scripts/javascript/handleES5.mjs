import { existsSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import { rolldown } from 'rolldown';
import { config } from './configs/rollup.es5.mjs';

function isProd() {
  if (!process.env.ENV) {
    return true;
  }
  return process.env.ENV === 'production';
}

/**
 * @param { string } inputFile
 */
async function handleES5File(inputFile) {
  if (!inputFile.endsWith('.js')) {
    return;
  }
  if (!existsSync(inputFile)) {
    throw new Error(`File ${inputFile} doesn't exist`);
  }

  // biome-ignore lint/style/noParameterAssign:
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

export { handleES5File };
