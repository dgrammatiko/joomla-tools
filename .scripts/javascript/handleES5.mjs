import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { rolldown } from 'rolldown';
import { config } from './configs/rollup.es5.mjs';

function isProd() {
  return !process.env.env || process.env.env === 'production' ? true : false;
}

/**
 * @param { string } inputFile
 * @param { string } outputFile
 */
async function handleES5File(inputFile, outputFile = '') {
  if (!inputFile.endsWith('.es5.js')) {
    return;
  }
  if (!existsSync(inputFile)) {
    throw new Error(`File ${inputFile} doesn't exist`);
  }

  // biome-ignore lint/style/noParameterAssign:
  outputFile = !outputFile ? inputFile.replace('.es5.js', '.es5.min.js').replace(/^media_source(\/|\\)/, 'media/') : outputFile;

  const currentOpts = {
    ...config.outputOptions,
    dir: dirname(outputFile),
    file: outputFile,
    minify: true,
    sourcemap: isProd() ? true : 'inline',
    // after https://github.com/rolldown/rolldown/pull/1834 is merged
    // entryFileNames: (chunk) => {
    //   if (chunk.facadeModuleId.endsWith('.es5.js')) {
    //     return chunk.facadeModuleId.replace('.es5.js', '.min.js');
    //   }
    //   return chunk.facadeModuleId;
    // }
    entryFileNames: '[name].min.js',
    // chunkFileNames: '[name].min.js',
  };

  const bundle = await rolldown({ ...config.inputOptions, input: inputFile });
  await bundle.write(currentOpts);
  process.stdout.write(`✅ ESM: ${inputFile} === ${outputFile}\n`);
  await bundle.destroy();

  process.stdout.write(`✅ js: ${inputFile} === ${outputFile}\n`);
}

export { handleES5File };
