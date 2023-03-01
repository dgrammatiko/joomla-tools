#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { argv, cwd, exit } from 'node:process';
import { dirname, join } from 'node:path';
import { Command } from 'commander';

let logger, options;
const cliPath = join(dirname(import.meta.url), '../');

function errorCatcher(err) {
  logger('Something blow up. Exiting'), console.error(err), exit(1);
}

function resolveFn(path, resolvedFunction, options) {
  if (existsSync(join(cwd(), path))) {
    import(join(cwd(), path)).then(mod => mod[resolvedFunction](options)).catch(errorCatcher);
  } else if (existsSync(join(cliPath, path))) {
    import(join(cliPath, path)).then(mod => mod[resolvedFunction](options)).catch(errorCatcher);
  } else {
    logger('The tools aren\'t initialized properly. Quiting'), exit(1);
  }
}

async function main() {
  logger = (await import(join(cliPath, '.scripts/utils/logger.mjs'))).logger;
  options = {
    ...(await import(join(cliPath, '.scripts/utils/defaultParams.mjs'))).defaultParams,
    ...(await import(join(cliPath, '.scripts/utils/getPackage.mjs'))).getPackage(),
  };

  const opts = (new Command())
    .option('-i, --init', 'Initialise')
    .option('-l, --link [type]', 'Link')
    .option('-b, --build [type]', 'Build')
    .option('-r, --release', 'Release')
    .option('-w, --watch [type]', 'Watch')
    .parse(argv)
    .opts();

  if (opts.link) {
    if (!existsSync(join(cwd(), 'www'))) {
      logger('Initializing...'), resolveFn('.scripts/fetch-joomla.mjs', 'fetchJoomla', options);
    }

    logger('linking...'), resolveFn('.scripts/sym-links.mjs', 'symLink', options);
  }

  if (opts.build) {
    logger('Start building...'),
    resolveFn('.scripts/copythru.mjs', 'copyThru', options), // Copy files through
    resolveFn('.scripts/stylesheets.mjs', 'stylesheets', options), // Compile css files
    resolveFn('.scripts/scripts.mjs', 'scripts', options); // Compile script files
  }

  if (opts.watch) {
    logger('Start watching...');
  }

  if (opts.release) {
    logger('Release'), resolveFn('.scripts/zip.mjs', 'zip', options);
  }

  if (opts.init) {
    logger('Fetching a joomla instance...'), resolveFn('.scripts/fetch-joomla.mjs', 'fetchJoomla', options);
  }
}

main();
