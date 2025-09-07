import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

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
  if (!existsSync(join('media_source'))) {
    throw new Error(`The tools aren't initialized properly. Exiting`);
  }

  if (!existsSync('media')) {
    mkdirSync('media');
  }

  const files = [];
  const folders = [];

  if (path) {
    const stats = statSync(`${path}`);

    if (stats.isDirectory()) {
      folders.push(`${path}`);
    } else if (stats.isFile()) {
      files.push(`${path}`);
    } else {
      throw new Error(`Unknown path ${path}`);
    }
  }

  if (!files.length && !folders.length) {
    folders.push('media_source');
  }

  for (const folderName of folders) {
    for (const folder of readdirSync(folderName, { recursive: true, withFileTypes: true })) {
      // push the right files
    }
  }

  for (const file of files) {
    // copy the file over
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
