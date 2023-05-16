import Fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, sep } from 'node:path';
import Autoprefixer from 'autoprefixer';
import CssNano from 'cssnano';
import Postcss from 'postcss';
import Sass from 'sass';
import { logger } from '../utils/logger.es6.js';

async function compile(file) {
  if (!existsSync(file)) {
    throw new Error(`File ${file} doesn't exist`);
  }
  if (!globalThis.searchPath || !globalThis.replacePath) {
    throw new Error(`Global searchPath and replacePath are not defined`);
  }
  const cssFile = file.replace(`${sep}scss${sep}`, `${sep}css${sep}`)
    .replace(/\.scss$/, '.css')
    .replace(`${sep}${globalThis.searchPath}${sep}`, globalThis.replacePath);

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
  if (!existsSync(dirname(cssFile))) {
    await Fs.mkdir(dirname(cssFile), { recursive: true, mode: 0o755 });
  }

  await Fs.writeFile(
    cssFile,
    res.css.toString(),
    { encoding: 'utf8', mode: 0o644 },
  );

  const cssMin = await Postcss([CssNano]).process(res.css.toString(), { from: undefined });

  // Ensure the folder exists or create it
  await Fs.mkdir(dirname(cssFile.replace('.css', '.min.css')), { recursive: true });
  await Fs.writeFile(
    cssFile.replace('.css', '.min.css'),
    cssMin.css.toString(),
    { encoding: 'utf8', mode: 0o644 },
  );

  logger(`✅ SCSS File compiled: ${cssFile}`);
};

export { compile };
