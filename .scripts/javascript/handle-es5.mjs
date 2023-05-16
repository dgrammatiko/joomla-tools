import { basename, dirname, sep } from 'node:path';
import { copy } from 'node:fs/promises';
import { minifyJs } from './minify.mjs';
import { logger } from '../utils/logger.mjs';

async function handleES5File(file) {
  if (file.endsWith('.es5.js')) {
    logger(`Processing Legacy js file: ${basename(file)}...`);
    // ES5 file, we will copy the file and then minify it in place
    // Ensure that the directories exist or create them
    if (!existsSync(dirname(file).replace(`${sep}${globalThis.searchPath}`, globalThis.replacePath))) {
      await Fs.mkdir(dirname(file).replace(`${sep}${globalThis.searchPath}`, globalThis.replacePath), { recursive: true, mode: 0o755 });
    }

    await copy(file, file.replace(`${sep}${globalThis.searchPath}${sep}`, globalThis.replacePath).replace('.es5.js', '.js'), { preserveTimestamps: true });
    logger(`Legacy js file: ${basename(file)}: ✅ copied`);

    minifyJs(file.replace(globalThis.searchPath, globalThis.replacePath).replace('.es5.js', '.js'));
  }
};

export { handleES5File };
