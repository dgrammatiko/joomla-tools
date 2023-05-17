import { basename, dirname, sep } from 'node:path';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { minify } from 'terser';
import { logger } from '../utils/logger.mjs';

async function handleES5File(file) {
  if (!existsSync(file)) {
    throw new Error(`File ${file} doesn't exist`);
  }

  if (!globalThis.searchPath || !globalThis.replacePath) {
    throw new Error(`Global searchPath and replacePath are not defined`);
  }

  if (file.endsWith('.es5.js')) {
    // ES5 file, we will copy the file and then minify it in place
    logger(`Processing Legacy js file: ${basename(file)}...`);
    if (!existsSync(dirname(file).replace(`${sep}${globalThis.searchPath}`, globalThis.replacePath))) {
      await mkdir(dirname(file).replace(`${sep}${globalThis.searchPath}`, globalThis.replacePath), { recursive: true, mode: 0o755 });
    }

    await cp(file, file.replace(`${sep}${globalThis.searchPath}${sep}`, globalThis.replacePath).replace('.es5.js', '.js'), { preserveTimestamps: true });
    logger(`Legacy js file: ${basename(file)}: ✅ copied`);

    const fileContent = await readFile(file, { encoding: 'utf8' });
    const content = await minify(fileContent, { sourceMap: false, format: { comments: false } });
    await writeFile(file.replace('.js', '.min.js'), content.code, { encoding: 'utf8', mode: 0o644 });
    logger(`✅ Legacy js file: ${basename(file)}: minified`);
  }
};

export { handleES5File };
