import { dirname } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import FsExtra from 'fs-extra';
import Postcss from 'postcss';
import Autoprefixer from 'autoprefixer';
import CssNano from 'cssnano';
import { logger } from '../utils/logger.mjs';
import { resolvePath } from '../utils/resolvePath.mjs';

export async function handleCssFile(file) {
  const outputFile = resolvePath(file, 'extension');
  try {
    // CSS file, we will copy the file and then minify it in place
    // Ensure that the directories exist or create them
    await FsExtra.ensureDir(dirname(outputFile), { recursive: true, mode: 0o755 });

    if (file !== outputFile) {
      await FsExtra.copy(file, outputFile, { preserveTimestamps: true, overwrite: true });
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
