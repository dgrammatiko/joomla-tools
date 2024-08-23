import fs, { writeFileSync } from 'node:fs';
import { basename, dirname } from 'node:path';

import browserslist from 'browserslist';
import { bundleAsync, bundle, browserslistToTargets } from 'lightningcss';

import { logger } from '../utils/logger.mjs';

function isProd() {
  return !process.env.production || process.env.production === 'production' ? true : false;
}

/**
 * @param { string } inputFile
 * @param { string } outputFile
 */
function handleCssFile(inputFile, outputFile = '') {
  // biome-ignore lint/style/noParameterAssign:
  outputFile = !outputFile ? inputFile.replace('.css', '.min.css').replace(/^media_source(\/|\\)/, 'media/') : outputFile;

  if (!fs.existsSync(inputFile)) {
    throw new Error(`File ${inputFile} doesn't exist`);
  }

  if (!fs.existsSync(dirname(outputFile))) {
    fs.mkdirSync(dirname(outputFile), { recursive: true, mode: 0o755 });
  }

  const { code, map } = bundle({
    filename: inputFile,
    minify: isProd(),
    sourceMap: true,
    targets: browserslistToTargets(browserslist('>= 0.25%')),
  });

  // The css file
  writeFileSync(
    outputFile,
    `${new TextDecoder().decode(code)}\n/*# sourceMappingURL=${
      isProd() ? basename(outputFile.replace('.css', '.css.map')) : `data:application/json;charset=utf-8;base64,${Buffer.from(map).toString('base64')}`
    } */`,
    { encoding: 'utf8' }
  );

  if (isProd()) {
    // sourcemap file
    writeFileSync(outputFile.replace('.css', '.css.map'), Buffer.from(map).toString('utf8'), { encoding: 'utf8' });
  }

  logger(`✅ CSS file copied/minified: ${inputFile}`);
}

export { handleCssFile };
