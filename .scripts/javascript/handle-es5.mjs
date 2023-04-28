import { basename, dirname, sep } from 'node:path';
import FsExtra from 'fs-extra';
import { minifyJs } from './minify.mjs';
import { logger } from '../utils/logger.mjs';

async function handleES5File(file) {
  if (file.endsWith('.es5.js')) {
    logger(`Processing Legacy js file: ${basename(file)}...`);
    // ES5 file, we will copy the file and then minify it in place
    // Ensure that the directories exist or create them
    await FsExtra.ensureDir(dirname(file).replace(`${sep}media_source${sep}`, `${sep}media${sep}`));
    await FsExtra.copy(file, file.replace(`${sep}media_source${sep}`, `${sep}media${sep}`).replace('.es5.js', '.js'), { preserveTimestamps: true });
    logger(`Legacy js file: ${basename(file)}: ✅ copied`);

    minifyJs(file.replace(`${sep}media_source${sep}`, `${sep}media${sep}`).replace('.es5.js', '.js'));
  }
};

export {handleES5File};
