import fs from 'node:fs';
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
  if (inputFile.endsWith('.es5.js')) return handleES5File(inputFile, inputFile.replace(/\.es5\.js$/, '.min.js').replace(/^media_source(\/|\\)/, 'media/'));

  if (inputFile.endsWith('.mjs') && !inputFile.match(/(\/|\\)_[^/\\]+$/))
    return handleESMFile(inputFile, inputFile.replace(/\.mjs$/, '.min.js').replace(/^media_source(\/|\\)/, 'media/'));
}

export { handleScripts };
