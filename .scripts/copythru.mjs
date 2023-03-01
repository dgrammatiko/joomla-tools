import { cwd, exit } from 'node:process';
import { join, sep } from 'node:path';
import { stat, existsSync } from 'node:fs';
import jetpack from 'fs-jetpack';

import { logger } from './utils/logger.mjs';

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
 * @param {object} options  The options
 * @param {string} path     The folder that needs to be compiled, optional
 */
export async function copyThru(options, path) {
  if (!existsSync(join(cwd(), 'media_src'))) {
    logger('The tools aren\'t initialized properly. Exiting');
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
      process.exit(1);
    }
  } else {
    folders.push(`${cwd()}/media_src`);
  }

  jetpack
    .find(`${cwd()}/media_src`, { matching: 'images', files: false, directories: true })
    .forEach((file) => jetpack.copy(file, file.replace(`media_src${sep}`, `media${sep}`), { overwrite: true }));
};
