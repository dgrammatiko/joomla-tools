import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import * as sass from 'sass';
import rtlcss from 'rtlcss';

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
    mkdirSync(dirname(outputFile), { recursive: true, mode: 0o755 });
  }

  let contents = sass.compile(inputFile, {sourceMap: true, style: 'compressed'});
  const code = (outputFile.endsWith('-rtl.scss')) ? rtlcss.process(contents.css.toString()) : contents.css.toString();

  writeFileSync(
    outputFile.replace('.css', '.min.css'),
    `${code}
//# sourceMappingURL=${basename(outputFile.replace('.css', '.min.css.map'))}`,
    { encoding: 'utf8', mode: '0644' },
  );

  writeFileSync(
    outputFile.replace('.css', '.css.map'),
    contents.sourceMap ? JSON.stringify(contents.sourceMap) : '',
    { encoding: 'utf8', mode: '0644' },
  );

  logger(`✅ SCSS File compiled: ${outputFile}`);
};

export { handleScssFile };
