import { dirname, sep } from 'node:path';
import { writeFile } from 'node:fs/promises';
import Autoprefixer from 'autoprefixer';
import CssNano from 'cssnano';
import rtlcss from 'rtlcss';
import fsExtra from 'fs-extra';
import Postcss from 'postcss';
import Sass from 'sass';
import { logger } from '../utils/logger.mjs';

const { ensureDir } = fsExtra;

export async function handleScssFile(file) {
  const cssFile = file.replace(`${sep}scss${sep}`, `${sep}css${sep}`)
    .replace(`${sep}media_source${sep}`, `${sep}media${sep}`)
    .replace('.scss', '.css');

  let compiled;
  try {
    compiled = Sass.compile({ file });
  } catch (error) {
    logger(error.formatted);
    process.exit(1);
  }

  const plugins = [Autoprefixer];
  if (cssFile.endsWith('-rtl.css')) plugins.push(rtlcss);

  // Auto prefixing
  const cleaner = Postcss(plugins);
  const res = await cleaner.process(compiled.css.toString(), { from: undefined });

  // Ensure the folder exists or create it
  await ensureDir(dirname(cssFile), {});
  await writeFile(
    cssFile,
    res.css,
    { encoding: 'utf8', mode: 0o644 },
  );

  const cssMin = await Postcss([CssNano]).process(res.css, { from: undefined });

  // Ensure the folder exists or create it
  await ensureDir(dirname(cssFile.replace('.css', '.min.css')), {});
  await writeFile(
    cssFile.replace('.css', '.min.css'),
    cssMin.css,
    { encoding: 'utf8', mode: 0o644 },
  );

  logger(`✅ SCSS File compiled: ${cssFile}`);
};
