import { existsSync, cp, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { logger } from '../utils/logger.mjs';
import { transform, Features } from 'lightningcss';

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
      mkdirSync(dirname(outputFile), { recursive: true, mode: '0755' });
    }

    let cssMin = transform({
      filename: file,
      code: readFileSync(file),
      minify: true,
      targets: {
        safari: 15 << 16
      },
      exclude: Features.VendorPrefixes
    });

    // Ensure the folder exists or create it
    writeFileSync(outputFile.replace('.css', '.min.css'), cssMin.code.toString(), { encoding: 'utf8', mode: '0644' });

    logger(`✅ CSS file minified: ${file}`);
  } catch (err) {
    logger(err.message);
  }
};

export { handleCssFile };
