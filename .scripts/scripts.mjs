import fs from 'node:fs';

import { logger } from './utils/logger.mjs';
import { handleES5File } from './javascript/handleES5.mjs';
import { handleESMFile } from './javascript/handleESMFile.mjs';

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
    for (const file of fs.readdirSync(folder, {recursive: true, encoding: 'utf8'})) {
      if (file.endsWith('.mjs') || file.endsWith('.es5.js')) {
        files.push(file);
      }
    }
  }

  Promise.all(files.map((file) => handleScript(file)));
}

/**
 * @param { string } inputFile
 * @returns { Promise<unknown> }
 */
async function handleScript(inputFile) {
  if (!globalThis.searchPath || !globalThis.replacePath) throw new Error(`Global searchPath and replacePath are not defined`);

  if (inputFile.endsWith('.es5.js')) return handleES5File(inputFile);

  if (inputFile.endsWith('.mjs') && !inputFile.match(/(\/|\\)_[^/\\]+$/))
    return handleESMFile(inputFile, inputFile.replace(/\.mjs$/, '.js').replace(globalThis.searchPath, globalThis.replacePath));
}

export { handleScripts };
