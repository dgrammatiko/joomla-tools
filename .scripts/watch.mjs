import Path from 'node:path';

import { watch } from 'chokidar';
import { handleESM } from './javascript/handleESM.mjs';
import { handleIIFE } from './javascript/handleIIFE.mjs';
import { handleCss } from './stylesheets/handleCss.mjs';
import { handleScss } from './stylesheets/handleScss.mjs';
import { debounce } from './utils/debounce.mjs';

/**
 * @param { string } file
 */
const processFile = (file) => {
  if (
    (Path.extname(file) === '.js' || Path.extname(file) === '.mjs') &&
    !Path.dirname(file).startsWith(Path.join('media_source', 'vendor', 'bootstrap', 'js'))
  ) {
    if (file.match(/\.mjs$/) && !Path.basename(file).startsWith('_')) {
      return debounce(handleESM(file), 300, 0);
    }
    if (file.match(/\.js/)) {
      return debounce(handleIIFE(file), 250, 300);
    }
  }

  if (Path.extname(file) === '.scss' && !Path.basename(file).startsWith('_')) {
    return debounce(handleScss(file), 250, 300);
  }
  if (Path.extname(file) === '.css') {
    return debounce(handleCss(file), 250, 300);
  }
};

/**
 * @param { string } path
 */
const watching = (path) => {
  process.env.ENV = 'development';
  const watcher = watch(path ? Path.join(process.cwd(), path) : Path.join(process.cwd(), 'media_source'), { ignored: /(^|[/\\])\../, persistent: true });

  // Close gracefully
  process.on('SIGINT', () => watcher.close());

  watcher
    .on('add', (file) => processFile(file))
    .on('change', (file) => processFile(file))
    // @todo Handle properly the removal
    .on('unlink', (path) => console.log(`File ${path} has been removed`));
};

export { watching };
