import Fs from 'node:fs/promises';
import { dirname, sep } from 'node:path';
import Autoprefixer from 'autoprefixer';
import CssNano from 'cssnano';
import FsExtra from 'fs-extra';
import Postcss from 'postcss';
import Sass from 'sass';
import { logger } from '../utils/logger.es6.js';

async function compile(file) {
  const cssFile = file.replace(`${sep}scss${sep}`, `${sep}css${sep}`)
    .replace(/\.scss$/, '.css')
    .replace(`${sep}media_source${sep}`, `${sep}media${sep}`);

  let compiled;
  try {
    compiled = Sass.compile({ file });
  } catch (error) {
    logger(error.formatted);
    process.exit(1);
  }

  // Auto prefixing
  const cleaner = Postcss([Autoprefixer()]);
  const res = await cleaner.process(compiled.css.toString(), { from: undefined });

  // Ensure the folder exists or create it
  await FsExtra.mkdirs(dirname(cssFile), {});
  await Fs.writeFile(
    cssFile,
    res.css.toString(),
    { encoding: 'utf8', mode: 0o644 },
  );

  const cssMin = await Postcss([CssNano]).process(res.css.toString(), { from: undefined });

  // Ensure the folder exists or create it
  FsExtra.mkdirs(dirname(cssFile.replace('.css', '.min.css')), {});
  await Fs.writeFile(
    cssFile.replace('.css', '.min.css'),
    cssMin.css.toString(),
    { encoding: 'utf8', mode: 0o644 },
  );

  logger(`✅ SCSS File compiled: ${cssFile}`);
};

export {compile};
