import { existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { cwd, exit } from 'node:process';
import { join, sep } from 'node:path';
import recursive from 'recursive-readdir';

import { logger } from './utils/logger.mjs';
import { handleScssFile } from './stylesheets/handle-scss.mjs';
import { handleCssFile } from './stylesheets/handle-css.mjs';

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
 * @param {string} path     The folder that needs to be compiled, optional
 */
async function stylesheets(path) {
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
    folders.push(`${cwd()}/media_source`);
  }

  // Loop to get the files that should be compiled via parameter
  const computedFiles = await Promise.all(folders.map(folder => recursive(folder, ['!*.+(scss|css)'])));

  return Promise.all([
    ...[].concat(...computedFiles).filter(file => file.endsWith('.css') && !file.endsWith('.min.css')).map((file) => handleCssFile(file)),
    ...[].concat(...computedFiles).filter(file => file.endsWith('.scss') && !file.match(/(\/|\\)_[^/\\]+$/) && (file.match(/\/scss\//) || file.match(/\\scss\\/)))
        .map((file) => handleScssFile(file, file.replace(`${sep}scss${sep}`, `${sep}css${sep}`).replace(`${sep}media_source${sep}`, `${sep}media${sep}`).replace('.scss', '.css'))),
  ]);
};

export {stylesheets};
