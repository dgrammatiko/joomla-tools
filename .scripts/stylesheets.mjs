import { existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { cwd, exit } from 'node:process';
import { join, sep } from 'node:path';
import pkgFsJetpack from 'fs-jetpack';

import { logger } from './utils/logger.mjs';
import { handleScssFile } from './stylesheets/handle-scss.mjs';
import { handleCssFile } from './stylesheets/handle-css.mjs';

const { find } = pkgFsJetpack;

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
  if (!existsSync(join(cwd(), 'media_source'))) {
    logger('The folder media_source does not exist. Exiting');
    exit(1);
  }

  const files = [];
  const folders = [];

  if (path) {
    const stats = await stat(`${cwd()}/${path}`);

    if (stats.isDirectory()) {
      folders.push(`${cwd()}/${path}`);
    } else if (stats.isFile()) {
      files.push(`${cwd()}/${path}`);
    } else {
      logger(`Unknown path ${path}`);
      exit(1);
    }
  } else {
    folders.push('media_source');
  }

  const fromFolder = await Promise.all(folders.map((folder) => find(folder, { matching: ['*.+(scss|css)'] })));
  // Loop to get the files that should be compiled via parameter
  const computedFiles = [...files, ...fromFolder.flat()];

  return Promise.all(computedFiles.map((file) => handleStylesheet(file)));
}

/**
 * @param { string } inputFile
 * @returns { Promise<unknown> }
 */
async function handleStylesheet(inputFile) {
  if (!globalThis.searchPath || !globalThis.replacePath) {
    throw new Error(`Global searchPath and replacePath are not defined`);
  }
  if (inputFile.endsWith('.css') && !inputFile.endsWith('.min.css')) {
    return handleCssFile(inputFile);
  }

  if (inputFile.endsWith('.scss') && !inputFile.match(/(\/|\\)_[^/\\]+$/)) {
    const outputFile = inputFile.replace(`${sep}scss${sep}`, `${sep}css${sep}`).replace(globalThis.searchPath, globalThis.replacePath).replace('.scss', '.css');
    return handleScssFile(inputFile, outputFile);
  }
}

export { handleStylesheets };
