import path from 'node:path';
import fs from 'node:fs';
import { minify } from 'terser';
import { logger } from '../utils/logger.mjs';

/**
 * @param { string } file
 */
async function handleES5File(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`File ${file} doesn't exist`);
  }

  if (!globalThis.searchPath || !globalThis.replacePath) {
    throw new Error(`Global searchPath and replacePath are not defined`);
  }

  if (file.endsWith('.es5.js')) {
    // ES5 file, we will copy the file and then minify it in place
    logger(`Processing Legacy js file: ${path.basename(file)}...`);
    if (!fs.existsSync(path.dirname(file).replace(`${path.sep}${globalThis.searchPath}`, globalThis.replacePath))) {
      fs.mkdirSync(path.dirname(file).replace(`${path.sep}${globalThis.searchPath}`, globalThis.replacePath), { recursive: true, mode: 0o755 });
    }

    fs.cpSync(file, file.replace(`${path.sep}${globalThis.searchPath}${path.sep}`, globalThis.replacePath).replace('.es5.js', '.js'), { preserveTimestamps: true, force: true, mode: 0o755 });
    logger(`Legacy js file: ${path.basename(file)}: ✅ copied`);

    const fileContent = fs.readFileSync(file, { encoding: 'utf8' });
    const content = await minify(fileContent, { sourceMap: false, format: { comments: false } });
    fs.writeFileSync(file.replace('.js', '.min.js'), content.code, { encoding: 'utf8', mode: '0644' });
    logger(`✅ Legacy js file: ${path.basename(file)}: minified`);
  }
}

export { handleES5File };
