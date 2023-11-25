import { stat } from 'node:fs/promises';
import pkgFsJetpack from 'fs-jetpack';
import { cwd } from 'node:process';

import { logger } from './utils/logger.mjs';
import { handleESMToLegacy } from './javascript/ESMtoES5.mjs';
import { handleESMFile } from './javascript/handleESMFile.mjs';

const { find } = pkgFsJetpack;

/**
 * Method that will crawl the media_source folder and
 * bundle ESM
 * copy any ES5 files to the appropriate destination and minify them in place
 *
 * Expects ES Module files to have ext: .mjs
 *         ES5 files to have ext: .es5.js
 *
 * @param { string } path  The folder that needs to be compiled, optional
 */
async function handleScripts(path) {
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
      return Promise.reject();
      // process.exit(1);
    }
  } else {
    folders.push('media_source');
  }

  const fromFolder = await Promise.all(folders.map((folder) => find(folder, { matching: ['*.+(mjs|es5\.js)'] })));
  // Loop to get the files that should be compiled via parameter
  const computedFiles = [ ...files, ...fromFolder.flat() ];

  Promise.all(computedFiles.map((file) => handleScript(file)));
};

/**
 * @param { string } inputFile
 * @returns { Promise<unknown> }
 */
async function handleScript(inputFile) {
  if (!globalThis.searchPath || !globalThis.replacePath) {
    console.error(`Global searchPath and replacePath are not defined`);
    return Promise.reject();
  }

  if (inputFile.endsWith('-es5.js')) {
    return handleESMToLegacy(inputFile, inputFile.replace(\/-es5/.js$/, '.min.js').replace(globalThis.searchPath, globalThis.replacePath));
  }

  if (inputFile.endsWith('.mjs') && !inputFile.match(/(\/|\\)_[^/\\]+$/)) {
    return handleESMFile(inputFile, inputFile.replace(/\.mjs$/, '.min.js').replace(globalThis.searchPath, globalThis.replacePath));
  }
}

export { handleScripts };
