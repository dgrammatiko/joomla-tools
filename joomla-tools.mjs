#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { argv, cwd, exit } from 'node:process';
import { dirname, join, sep } from 'node:path';
import { createCommand } from 'commander';

import { logger } from './.scripts/utils/logger.mjs';
import { defaultParams } from './.scripts/utils/defaultParams.mjs';
import { getPackage } from './.scripts/utils/getPackage.mjs';

/**
 * @type {{}} pkg
 */
let pkg;

if (existsSync(join(cwd(), 'package.json'))) {
  pkg = getPackage();
  globalThis.isJoomla = pkg.name === 'joomla';
  if (globalThis.jsJoomla) {
    globalThis.searchPath = `build${sep}media_source${sep}`;
    globalThis.replacePath = `media${sep}`;
  } else {
    globalThis.searchPath = `media_source${sep}`;
    globalThis.replacePath = `media${sep}`;
  }
} else {
  logger('No package.json file. Exiting');
  exit(1);
}

/**
 * @param {{}} error
 */
function errorCatcher(error) {
  logger('Something blow up. Exiting');
  /* eslint-disable-next-line */
  console.error(error);
  exit(1);
}

/**
 * @param {string} path
 * @param {string} resolvedFunction
 * @param {[]} args
 */
function resolveFn(path, resolvedFunction, ...args) {
  if (existsSync(join(cwd(), path))) {
    import(join(cwd(), path)).then((mod) => mod[resolvedFunction](...args)).catch(errorCatcher);
  } else {
    import(join(dirname(import.meta.url), path)).then((mod) => mod[resolvedFunction](...args)).catch(errorCatcher);
  }
}

async function main() {
  globalThis.options = { ...pkg, ...defaultParams };
  const program = createCommand();
  const opts = program
    .option('-i, --init', 'Initialise')
    .option('-l, --link [type]', 'Link')
    .option('-b, --build [type]', 'Build')
    .option('-r, --release', 'Release')
    .option('-w, --watch [type]', 'Watch')
    .parse(argv)
    .opts();

  if (opts.link) {
    if (globalThis.isJoomla) return;

    if (!existsSync(join(cwd(), 'www'))) {
      logger('Initializing...');
      resolveFn('.scripts/fetch-joomla.mjs', 'fetchJoomla', ...program.args);
    }

    logger('linking...');
    resolveFn('.scripts/sym-links.mjs', 'symLink');
  }

  if (opts.build) {
    if (globalThis.isJoomla) return;

    logger('Start building...');
    resolveFn('.scripts/stylesheets.mjs', 'handleStylesheets', ...program.args); // Compile css files
    resolveFn('.scripts/scripts.mjs', 'handleScripts', ...program.args); // Compile script files
    resolveFn('.scripts/copythru.mjs', 'copyThru', ...program.args); // Copy files through
  }

  if (opts.watch) {
    if (globalThis.isJoomla) return;

    logger(`Start watching... Args: ${program.args.join(' ')}`);
    resolveFn('.scripts/watch.mjs', 'watching', ...program.args);
  }

  if (opts.release) {
    if (globalThis.isJoomla) return;

    logger(`Release... Args: ${program.args.join(' ')}`);
    resolveFn('.scripts/zip.mjs', 'packageExtensions', ...program.args);
  }

  if (opts.init) {
    if (globalThis.isJoomla) return;
    if (pkg.joomlaVersion) globalThis.joomlaVersion = pkg.joomlaVersion;

    logger(`Fetching a joomla instance... Version: ${pkg.joomlaVersion}`);
    resolveFn('.scripts/fetch-joomla.mjs', 'fetchJoomla', ...program.args);
  }
}

main();
