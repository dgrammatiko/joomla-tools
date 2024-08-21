import { join, extname, basename, dirname } from 'node:path';
import { cwd, on as processOn } from 'node:process';
import { watch } from 'chokidar';
import { handleESMFile } from './javascript/handleESMFile.mjs';
import { handleES5File } from './javascript/handleES5.mjs';
import { handleScssFile } from './stylesheets/handle-scss.mjs';
import { handleCssFile } from './stylesheets/handle-css.mjs';
import { debounce } from './utils/debounce.mjs';

/**
 * @param { string } file
 */
const processFile = (file) => {
  if ((extname(file) === '.js' || extname(file) === '.mjs') && !dirname(file).startsWith(join(globalThis.searchPath, 'vendor', 'bootstrap', 'js'))) {
    if (file.match(/\.mjs$/) && !basename(file).startsWith('_')) {
      return debounce(handleESMFile(file, outpufile), 300, 0);
    }
    if (file.match(/\.js/)) {
      return debounce(handleES5File(file), 300);
    }
  }

  if (extname(file) === '.scss' && !basename(file).startsWith('_')) {
    return debounce(handleScssFile(file, outpufile), 300);
  }
  if (extname(file) === '.css') {
    return debounce(handleCssFile(file), 300);
  }
};

/**
 * @param { string } path
 */
const watching = (path) => {
  if (!globalThis.searchPath || !globalThis.replacePath) {
    throw new Error(`Global searchPath and replacePath are not defined`);
  }

  const watcher = watch(path ? join(cwd(), path) : join(cwd(), globalThis.searchPath), { ignored: /(^|[/\\])\../, persistent: true });

  // Close gracefully
  processOn('SIGINT', () => watcher.close());

  watcher.on('add', (file) => processFile(file)).on('change', (file) => processFile(file));
  // @todo Handle the removal .on('unlink', path => log(`File ${path} has been removed`));
};

export { watching };
