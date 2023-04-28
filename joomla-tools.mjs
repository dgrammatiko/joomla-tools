#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { argv, cwd, exit } from 'node:process';
import { dirname, join } from 'node:path';
import { Command } from 'commander';
import { createRequire } from 'module';

import { logger } from './.scripts/utils/logger.mjs';
import { defaultParams } from './.scripts/utils/defaultParams.mjs';
import { getPackage } from './.scripts/utils/getPackage.mjs';

const require = createRequire(import.meta.url);

if (existsSync(join(cwd(), 'package.json'))) {
  const pkg = require(join(cwd(), 'package.json'));
  globalThis.isJoomla = pkg.name === 'joomla';
} else {
  logger('No package.json file. Exiting'), console.error(err), exit(1);
}

function errorCatcher(err) {
  logger('Something blow up. Exiting'), console.error(err), exit(1);
}

function resolveFn(path, resolvedFunction, options) {
  if (existsSync(join(cwd(), path))) {
    import(join(cwd(), path)).then(mod => mod[resolvedFunction](options)).catch(errorCatcher);
  } else {
    import(join(dirname(import.meta.url), path)).then(mod => mod[resolvedFunction](options)).catch(errorCatcher);
  }
}

async function main() {
  const ppk = getPackage();
  const options = { ...defaultParams, ...ppk };

  console.log(options)
  const opts = (new Command())
    .option('-i, --init', 'Initialise')
    .option('-l, --link [type]', 'Link')
    .option('-b, --build [type]', 'Build')
    .option('-r, --release', 'Release')
    .option('-w, --watch [type]', 'Watch')
    .parse(argv)
    .opts();

  if (opts.link) {
    if (globalThis.isJoomla) {
      return;
    }
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
    if (globalThis.isJoomla) {
      return;
    }
    logger('Release'), resolveFn('.scripts/zip.mjs', 'packageExtensions', options);
  }

  if (opts.init) {
    if (globalThis.isJoomla) {
      return;
    }
    logger('Fetching a joomla instance...');
    resolveFn('.scripts/fetch-joomla.mjs', 'fetchJoomla', options);
  }
}

main();
