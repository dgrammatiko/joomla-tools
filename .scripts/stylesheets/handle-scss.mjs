import { dirname, sep } from 'node:path';
import { writeFile } from 'node:fs/promises';
import Autoprefixer from 'autoprefixer';
import CssNano from 'cssnano';
import rtlcss from 'rtlcss';
import Postcss from 'postcss';
import Sass from 'sass';
import { logger } from '../utils/logger.mjs';
import { existsSync } from 'node:fs';

async function handleScssFile(file) {
  if (!existsSync(file)) {
    throw new Error(`File ${file} doesn't exist`);
  }
  if (!globalThis.searchPath || !globalThis.replacePath) {
    throw new Error(`Global searchPath and replacePath are not defined`);
  }
  const cssFile = file.replace(`${sep}scss${sep}`, `${sep}css${sep}`)
    .replace(`${sep}${globalThis.searchPath}${sep}`, globalThis.replacePath)
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
  if (!existsSync(dirname(cssFile))) {
    await Fs.mkdir(dirname(cssFile), { recursive: true, mode: 0o755 });
  }

  await writeFile(
    cssFile,
    res.css,
    { encoding: 'utf8', mode: 0o644 },
  );

  const cssMin = await Postcss([CssNano]).process(res.css, { from: undefined });

  // Ensure the folder exists or create it
  if (!existsSync(dirname(cssFile.replace('.css', '.min.css')))) {
    await Fs.mkdir(dirname(cssFile.replace('.css', '.min.css')), { recursive: true, mode: 0o755 });
  }

  await writeFile(
    cssFile.replace('.css', '.min.css'),
    cssMin.css,
    { encoding: 'utf8', mode: 0o644 },
  );

  logger(`✅ SCSS File compiled: ${cssFile}`);
};

export { handleScssFile };
