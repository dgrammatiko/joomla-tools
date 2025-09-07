import fs from 'node:fs';
import { handleESM } from './javascript/handleESM.mjs';
import { handleIIFE } from './javascript/handleIIFE.mjs';

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
    const stats = fs.statSync(path);

    if (stats.isDirectory()) {
      folders.push(path);
    } else if (stats.isFile()) {
      files.push(path);
    } else {
      throw new Error(`Unknown path ${path}`);
    }
  }

  if (!files.length && !folders.length) {
    folders.push('media_source');
  }

  for (const folder of folders) {
    for (const file of fs.readdirSync(folder, { recursive: true, encoding: 'utf8' })) {
      if (file.endsWith('.mjs') || file.endsWith('.js')) {
        files.push(`${folder}/${file}`);
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
  if (inputFile.endsWith('.js')) return handleIIFE(inputFile);

  if (inputFile.endsWith('.mjs') && !inputFile.match(/(\/|\\)_[^/\\]+$/)) return handleESM(inputFile);
}

export { handleScripts };
