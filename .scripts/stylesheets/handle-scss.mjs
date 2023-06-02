import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, sep } from 'node:path';
import Postcss from 'postcss';
import Sass from 'sass';

import { Autoprefixer, CssNano, rtlcss } from './configs/css.mjs';
import { logger } from '../utils/logger.mjs';

/**
 * @param { string } inputFile
 * @param { string } outputFile
 */
async function handleScssFile(inputFile, outputFile) {
  if (!existsSync(inputFile)) {
    throw new Error(`File ${inputFile} doesn't exist`);
  }

  if (!existsSync(dirname(outputFile))) {
    await mkdir(dirname(outputFile), { recursive: true, mode: 0o755 });
  }

  const compiled = Sass.compile(inputFile);
  const plugins = [Autoprefixer];
  if (outputFile.endsWith('-rtl.scss')) plugins.push(rtlcss);

  // Auto prefixing
  const res = await Postcss(plugins).process(compiled.css.toString(), { from: inputFile });

  await writeFile(
    outputFile,
    res.css.toString(),
    { encoding: 'utf8', mode: '0644' },
  );

  const cssMin = await Postcss([CssNano]).process(res.css.toString(), { from: inputFile });

  await writeFile(
    outputFile.replace('.css', '.min.css'),
    cssMin.css,
    { encoding: 'utf8', mode: '0644' },
  );

  logger(`✅ SCSS File compiled: ${outputFile}`);
};

export { handleScssFile };
