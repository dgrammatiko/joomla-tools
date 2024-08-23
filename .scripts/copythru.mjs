import Path from 'node:path';
import fs from 'node:fs';

import { logger } from './utils/logger.mjs';

/** text
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
async function copyThru(path) {
  if (!fs.existsSync(Path.join(process.cwd(), globalThis.searchPath))) {
    logger(`The tools aren't initialized properly. Exiting`);
    process.exit(1);
  }

  if (!fs.existsSync('media')) {
    fs.mkdirSync('media');
  }

  const files = [];
  const folders = [];

  if (path) {
    const stats = fs.statSync(`${path}`);

    if (stats.isDirectory()) {
      folders.push(`${path}`);
    } else if (stats.isFile()) {
      files.push(`${path}`);
    } else {
      logger(`Unknown path ${path}`);
      process.exit(1);
    }
  } else {
    folders.push(globalThis.searchPath);
  }

  // Copy any images folders
  // jetpack.find(globalThis.searchPath, { matching: 'images', files: false, directories: true }).forEach((file) =>
  //   cpSync(`./${file}`, `./${file.replace(`${globalThis.searchPath}`, `${globalThis.replacePath}`)}`, { recursive: true }),
  // );

  // // Copy the joomla.asset.json files
  // jetpack.find(globalThis.searchPath, { matching: 'joomla.asset.json', files: true, directories: false }).forEach((file) =>
  //   cp(`./${file}`, `./${file.replace(`${globalThis.searchPath}`, `${globalThis.replacePath}`)}`, { recursive: true }),
  // );
}

export { copyThru };
