import fsExtra from 'fs-extra';
// import { sep } from 'path';
import recursive from 'recursive-readdir';
import { logger } from './utils/logger.mjs';
import { handleES5File } from './javascript/handle-es5.mjs';
import { handleESMFile } from './javascript/compile-to-es2018.mjs';

const { stat } = fsExtra;
const RootPath = process.cwd();

/**
 * Method that will crawl the media_source folder and
 * compile ES6 to ES5 and ES6
 * copy any ES5 files to the appropriate destination and
 * minify them in place
 * compile any custom elements/webcomponents
 *
 * Expects ES6 files to have ext: .es6.js
 *         ES5 files to have ext: .es5.js
 *         WC/CE files to have ext: .w-c.es6.js
 *
 * @param { object } options The options from settings.json
 * @param { string } path    The folder that needs to be compiled, optional
 * @param { string } mode    esm for ES2017, es5 for ES5, both for both
 */
export async function scripts(options, path) {
  const files = [];
  const folders = [];

  if (path) {
    const stats = await stat(`${RootPath}/${path}`);

    if (stats.isDirectory()) {
      folders.push(`${RootPath}/${path}`);
    } else if (stats.isFile()) {
      files.push(`${RootPath}/${path}`);
    } else {
      logger(`Unknown path ${path}`);
      process.exit(1);
    }
  } else {
    folders.push(`${RootPath}/media_src`);
  }

  // Loop to get the files that should be compiled via parameter
  const computedFiles = await Promise.all(folders.map(folder => recursive(folder, ['!*.+(scss|css)'])));

  Promise.all([
    ...[].concat(...computedFiles)
      .filter(file => file.endsWith('.es5.js'))
      .map(hanler => handleES5File(hanler)),
    ...[].concat(...computedFiles)
      .filter(file => file.endsWith('.es6.js') || file.endsWith('.w-c.es6.js'))
      .map(hanler => handleESMFile(hanler)),
  ]);
};
