import { existsSync, cp, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { transform, Features } from 'lightningcss';

/**
 * @typedef { {} } globalThis
 * @property { string } globalThis.searchPath
 */


function logger(inp) {
  process.stdout.write(inp);
}

/**
 * @param { string } file
 */
async function handleCssFile(inputFile, outputFile) {
  if (!existsSync(inputFile)) {
    throw new Error(`File ${inputFile} doesn't exist`);
  }

  try {
    // CSS file, we will copy the file and then minify it in place
    if (!existsSync(dirname(outputFile))) {
      mkdirSync(dirname(outputFile), { recursive: true, mode: '0755' });
    }

    const cssMin = transform({
      filename: inputFile,
      code: readFileSync(inputFile),
      minify: true,
      targets: {
        safari: 15 << 16,
      },
      exclude: Features.VendorPrefixes,
    });

    // Ensure the folder exists or create it
    writeFileSync(outputFile.replace('.css', '.min.css'), cssMin.code.toString(), { encoding: 'utf8', mode: '0644' });

    logger(`✅ CSS file minified: ${inputFile}`);
  } catch (err) {
    logger(`Couldn't create file: ${outputFile}`);
  }
}

export { handleCssFile };
