import { dirname } from 'node:path';
import { copy, readFile, writeFile } from 'node:fs/promises';
import Postcss from 'postcss';
import Autoprefixer from 'autoprefixer';
import CssNano from 'cssnano';
import { logger } from '../utils/logger.mjs';

async function handleCssFile(file) {
  const outputFile = file.replace(`${sep}${globalThis.searchPath}${sep}`, globalThis.replacePath);
  try {
    // CSS file, we will copy the file and then minify it in place
    // Ensure that the directories exist or create them
    if (!existsSync(dirname(outputFile))) {
      await Fs.mkdir(dirname(outputFile), { recursive: true, mode: 0o755 });
    }

    if (file !== outputFile) {
      await copy(file, outputFile, { preserveTimestamps: true, overwrite: true });
    }

    const content = await readFile(file, { encoding: 'utf8' });
    const cssMin = await Postcss([Autoprefixer, CssNano]).process(content, { from: undefined });

    // Ensure the folder exists or create it
    await writeFile(outputFile.replace('.css', '.min.css'), cssMin.css.toString(), { encoding: 'utf8', mode: 0o644 });

    logger(`✅ CSS file copied/minified: ${file}`);
  } catch (err) {
    logger(err.message);
  }
};

export { handleCssFile };
