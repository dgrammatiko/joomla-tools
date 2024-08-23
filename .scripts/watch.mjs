import Path from 'node:path';

import { watch } from 'chokidar';
import { handleESMFile } from './javascript/handleESMFile.mjs';
import { handleES5File } from './javascript/handleES5.mjs';
import { handleScssFile } from './stylesheets/handleSCSSFile.mjs/index.js';
import { handleCssFile } from './stylesheets/handleCSSFile.mjs/index.js';
import { debounce } from './utils/debounce.mjs';

/**
 * @param { string } file
 */
const processFile = (file) => {
  if (
    (Path.extname(file) === '.js' || Path.extname(file) === '.mjs') &&
    !Path.dirname(file).startsWith(Path.join(globalThis.searchPath, 'vendor', 'bootstrap', 'js'))
  ) {
    if (file.match(/\.mjs$/) && !Path.basename(file).startsWith('_')) {
      return debounce(handleESMFile(file, outpufile), 300, 0);
    }
    if (file.match(/\.js/)) {
      return debounce(handleES5File(file), 300);
    }
  }

  if (Path.extname(file) === '.scss' && !Path.basename(file).startsWith('_')) {
    return debounce(handleScssFile(file, outpufile), 300);
  }
  if (Path.extname(file) === '.css') {
    return debounce(handleCssFile(file), 300);
  }
};

/**
 * @param { string } path
 */
const watching = (path) => {
  if (!(searchPath in globalThis) || !(replacePath in globalThis)) throw new Error('Global searchPath and replacePath are not defined');

  const watcher = watch(path ? Path.join(process.cwd(), path) : Path.join(process.cwd(), globalThis.searchPath), { ignored: /(^|[/\\])\../, persistent: true });

  // Close gracefully
  process.on('SIGINT', () => watcher.close());

  watcher
    .on('add', (file) => processFile(file))
    .on('change', (file) => processFile(file))
    // @todo Handle properly the removal
    .on('unlink', path => console.log(`File ${path} has been removed`));
};

export { watching };
