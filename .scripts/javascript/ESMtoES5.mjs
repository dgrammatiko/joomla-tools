import { basename, dirname, resolve } from 'node:path';
import fs from 'node:fs';
import { rollup } from 'rollup';
import { minify } from 'terser';
import { config } from './configs/rollup.es5.mjs';

/**
 * Compiles es6 files to es5.
 *
 * @param { string } inputFile the input file
 * @param { string } outputFile the generated file
 */
async function handleESMToLegacy(inputFile, outputFile) {
  if (!fs.existsSync(inputFile)) {
    throw new Error(`File ${inputFile} doesn't exist`);
  }
  if (!fs.existsSync(dirname(outputFile))) {
    fs.mkdirSync(dirname(outputFile), { recursive: true, mode: 0o755 });
  }

  const bundle = await rollup({ ...config.inputOptions, input: inputFile });
  const output = await bundle.write({ ...config.outputOptions, file: resolve(outputFile) });
  const minified = await minify(output.output[0].code, { sourceMap: false, format: { comments: false } });

  process.stdout.write(`Transpiling ES5 file: ${basename(outputFile)}...\n`);
  fs.writeFileSync(resolve(outputFile.replace('.js', '.min.js')), minified.code, { encoding: 'utf8', mode: 0o644 });

  await bundle.close();
}

export { handleESMToLegacy };
