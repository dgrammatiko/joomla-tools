import fs from 'node:fs';
import Path from 'node:path';
import { handleCss } from './stylesheets/handleCss.mjs';
import { handleScss } from './stylesheets/handleScss.mjs';

/**
 * Method that will crawl the media_source folder
 * and compile any scss files to css and .min.css
 * copy any css files to the appropriate destination and
 * minify them in place
 *
 * Expects scss files to have ext: .scss and css files to have ext: .css
 * Ignores scss files that their filename starts with `_`
 *
 * @param { string } path  The folder that needs to be compiled, optional
 */
export async function handleStylesheets(path) {
  if (!fs.existsSync(Path.join(process.cwd(), 'media_source'))) {
    throw new Error('The folder media_source does not exist. Exiting');
  }

  const files = [];
  const folders = [];

  if (path) {
    const stats = fs.statSync(`${process.cwd()}/${path}`);

    if (stats.isDirectory()) {
      folders.push(`${process.cwd()}/${path}`);
    } else if (stats.isFile()) {
      files.push(`${process.cwd()}/${path}`);
    } else {
      throw new Error(`Unknown path ${path}`);
    }
  } else {
    folders.push('media_source');
  }

  for (const folder of folders) {
    for (const file of fs.readdirSync(folder, { recursive: true, encoding: 'utf8' })) {
      if (file.endsWith('.scss') || file.endsWith('.css')) {
        files.push(`${folder}/${file}`);
      }
    }
  }

  Promise.all(files.map((file) => handleStylesheet(file)));
}

/**
 * @param { string } inputFile
 * @returns { Promise<unknown> }
 */
async function handleStylesheet(inputFile) {
  if (inputFile.endsWith('.css') && !inputFile.endsWith('.min.css')) {
    return handleCss(inputFile);
  }

  if (inputFile.endsWith('.scss') && !inputFile.match(/(\/|\\)_[^/\\]+$/)) {
    return handleScss(inputFile);
  }
}
