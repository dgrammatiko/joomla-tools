import {
  join, extname, basename, dirname,
} from 'node:path';
import chokidar from 'chokidar';
import { handleESMFile } from './javascript/compile-to-es2018.mjs';
import { handleES5File } from './javascript/handle-es5.mjs';
import { handleScssFile } from './stylesheets/handle-scss.mjs';
import { handleCssFile } from './stylesheets/handle-css.mjs';
import { debounce } from './utils/debounce.mjs';

const RootPath = process.cwd();

const processFile = (file) => {
  if ((extname(file) === '.js' || extname(file) === '.mjs') && !dirname(file).startsWith(join(RootPath, 'build/media_source/vendor/bootstrap/js'))) {
    if (file.match(/\.mjs$/) && !basename(file).startsWith('_')) {
      debounce(handleESMFile(file), 300);
    }
    if (file.match(/\.js/)) {
      debounce(handleES5File(file), 300);
    }
  }

  if (extname(file) === '.scss' && !basename(file).startsWith('_')) {
    debounce(handleScssFile(file), 300);
  }
  if (extname(file) === '.css') {
    debounce(handleCssFile(file), 300);
  }
};

const watching = (path) => {
  const watcher = chokidar.watch(path ? join(RootPath, path) : join(RootPath, 'media_source'),
    {
     // ignore dotfiles
    ignored: /(^|[/\\])\../,
    persistent: true,
  });

  // Close gracefully
  process.on('SIGINT', () => watcher.close());

  watcher
    .on('add', (file) => processFile(file))
    .on('change', (file) => processFile(file));
  // @todo Handle the removal .on('unlink', path => log(`File ${path} has been removed`));
};

export {watching};
