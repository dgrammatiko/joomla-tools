import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, sep } from 'node:path';
import Postcss from 'postcss';

// import { Autoprefixer, CssNano } from './configs/css.mjs';
import { logger } from '../utils/logger.mjs';

/**
 * @typedef { Object } globalThis
 * @property { string } searchPath
 */
/**
 * @param { string } file
 */
async function handleCssFile(file) {
  if (!existsSync(file)) {
    throw new Error(`File ${file} doesn't exist`);
  }
  if (!globalThis.searchPath || !globalThis.replacePath) {
    throw new Error(`Global searchPath and replacePath are not defined`);
  }

  const outputFile = file.replace(`${globalThis.searchPath}`, globalThis.replacePath);
  try {
    // CSS file, we will copy the file and then minify it in place
    if (!existsSync(dirname(outputFile))) {
      await mkdir(dirname(outputFile), { recursive: true, mode: '0755' });
    }

    // if (file !== outputFile) {
    //   await cp(file, outputFile, { preserveTimestamps: true, force: true });
    // }

    const content = await readFile(file, { encoding: 'utf8' });
    // const cssMin = await Postcss([Autoprefixer, CssNano]).process(content, { from: undefined });

    // Ensure the folder exists or create it
    await writeFile(outputFile.replace('.css', '.min.css'), content, { encoding: 'utf8', mode: '0644' });

    logger(`✅ CSS file copied/minified: ${file}`);
  } catch (err) {
    logger(err.message);
  }
}

export { handleCssFile };
