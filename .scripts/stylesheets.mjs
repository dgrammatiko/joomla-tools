import fs from 'node:fs';
import Path from 'node:path';

import { logger } from './utils/logger.mjs';
import { handleScssFile } from './stylesheets/handleSCSSFile.mjs';
import { handleCssFile } from './stylesheets/handleCSSFile.mjs';

/**
 * Method that will crawl the media_source folder
 * and compile any scss files to css and .min.css
 * copy any css files to the appropriate destination and
 * minify them in place
 *
 * Expects scss files to have ext: .scss
 *         css files to have ext: .css
 * Ignores scss files that their filename starts with `_`
 *
 * @param { string } path  The folder that needs to be compiled, optional
 */
async function handleStylesheets(path) {
  if (!fs.existsSync(Path.join(process.cwd(), 'media_source'))) {
    logger('The folder media_source does not exist. Exiting');
    process.exit(1);
  }

  const files = [];
  const folders = [];

  if (path) {
    const stats = fs.statSync(`${process.cwd()}/${path}`);

    if (stats.isDirectory()) {
      folders.push(`${process.cwd()}/${path}`);
    } else if (stats.isFile()) {
      files.push(`${process.cwd()}/${path}`);
    } else {
      logger(`Unknown path ${path}`);
      process.exit(1);
    }
  } else {
    folders.push('media_source');
  }

    for (const folder of folders) {
    for (const file of fs.readdirSync(folder, { recursive: true, encoding: 'utf8' })) {
      if (file.endsWith('.scss') || file.endsWith('.css')) {
        files.push(file);
      }
    }
  }

  Promise.all(files.map((file) => handleStylesheet(file, file.replace(/\.css$/, '.min.css').replace(globalThis.searchPath, globalThis.replacePath))));
}

/**
 * @param { string } inputFile
 * @returns { Promise<unknown> }
 */
async function handleStylesheet(inputFile) {
  if (!globalThis.searchPath || !globalThis.replacePath) throw new Error(`Global searchPath and replacePath are not defined`);
  if (inputFile.endsWith('.css') && !inputFile.endsWith('.min.css')) {
    return handleCssFile(inputFile);
  }

  if (inputFile.endsWith('.scss') && !inputFile.match(/(\/|\\)_[^/\\]+$/)) {
    const outputFile = inputFile.replace(`${Path.sep}scss${Path.sep}`, `${Path.sep}css${Path.sep}`).replace(globalThis.searchPath, globalThis.replacePath).replace('.scss', '.css');
    return handleScssFile(inputFile, outputFile);
  }
}

export { handleStylesheets };
