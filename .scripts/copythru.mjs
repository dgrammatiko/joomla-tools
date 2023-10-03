import { cwd, exit } from 'node:process';
import { join, sep } from 'node:path';
import {
  stat,
  existsSync,
  copyFileSync,
  readdirSync,
  mkdirSync
} from 'node:fs';
import jetpack from 'fs-jetpack';

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
  if (!existsSync(join(cwd(), globalThis.searchPath))) {
    logger(`The tools aren't initialized properly. Exiting`);
    exit(1);
  }

  const files = [];
  const folders = [];

  if (path) {
    const stats = await stat(`${path}`);

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

  jetpack
    .find(globalThis.searchPath, { matching: 'images', files: false, directories: true })
    .forEach((file) => jetpack.copy(file, file.replace(`${globalThis.searchPath}${sep}`, `${globalThis.replacePath}${sep}`), { overwrite: true }));

  // Copy the joomla.asset.json files
  if (existsSync('./media')) {
    readdirSync('./media').forEach((ext) => {
      if (ext !== 'templates') {
        if (existsSync(`${process.cwd()}/media_source/${ext}/joomla.asset.json`) && !existsSync(`${process.cwd()}/media/${ext}/joomla.asset.json`)) {
          if (!existsSync(`${process.cwd()}/media/${ext}`)) mkdirSync(`${process.cwd()}/media/${ext}`, {recursive: true});
          if (!existsSync(`${process.cwd()}/media/${ext}/joomla.asset.json`)) copyFileSync(`${process.cwd()}/media_source/${ext}/joomla.asset.json`, `${process.cwd()}/media/${ext}/joomla.asset.json`);
        }
      }
    });
  }
};

export { copyThru };
