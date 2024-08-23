#!/usr/bin/env node
import fs from 'node:fs';
import { dirname, sep, join } from 'node:path';
import { createCommand } from 'commander';

import { logger } from './.scripts/utils/logger.mjs';
import { defaultParams } from './.scripts/utils/defaultParams.mjs';
import { getPackage } from './.scripts/utils/getPackage.mjs';

/**
 * @type {{}} pkg
 */
let pkg;

if (fs.existsSync(join(process.cwd(), 'package.json'))) {
  pkg = getPackage();
  globalThis.searchPath = `media_source${sep}`;
  globalThis.replacePath = `media${sep}`;
  // /^media_source(\/|\\)/, 'media/'
} else {
  logger('No package.json file. Exiting');
  process.exit(1);
}

/**
 * @param {{}} error
 */
function errorCatcher(error) {
  logger('Something blow up. Exiting');
  /* eslint-disable-next-line */
  console.error(error);
  process.exit(1);
}

/**
 * @param {string} path
 * @param {string} resolvedFunction
 * @param {[]} args
 */
async function resolveFn(path, resolvedFunction, ...args) {
  if (fs.existsSync(join(process.cwd(), path))) {
    await import(join(process.cwd(), path)).then((mod) => mod[resolvedFunction](...args)).catch(errorCatcher);
  } else {
    await import(join(dirname(import.meta.url), path)).then((mod) => mod[resolvedFunction](...args)).catch(errorCatcher);
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
    .parse(process.argv)
    .opts();

  if (opts.link) {
    if (!fs.existsSync(join(process.cwd(), 'www'))) {
      logger('Initializing...');
      await resolveFn('.scripts/fetch-joomla.mjs', 'fetchJoomla', ...program.args);
    }

    logger('linking...');
    await resolveFn('.scripts/sym-links.mjs', 'symLink');
  }

  if (opts.build) {
    logger('Start building...');
    process.env.production = 'development';
    await resolveFn('.scripts/stylesheets.mjs', 'handleStylesheets', ...program.args); // Compile css files
    await resolveFn('.scripts/scripts.mjs', 'handleScripts', ...program.args); // Compile script files
    await resolveFn('.scripts/copythru.mjs', 'copyThru', ...program.args); // Copy files through
  }

  if (opts.watch) {
    logger(`Start watching... Args: ${program.args.join(' ')}`);
    process.env.production = 'development';
    await resolveFn('.scripts/watch.mjs', 'watching', ...program.args);
  }

  if (opts.release) {
    logger(`Release... Args: ${program.args.join(' ')}`);
    process.env.production = 'production';
    await resolveFn('.scripts/stylesheets.mjs', 'handleStylesheets', ...program.args); // Compile css files
    await resolveFn('.scripts/scripts.mjs', 'handleScripts', ...program.args); // Compile script files
    await resolveFn('.scripts/copythru.mjs', 'copyThru', ...program.args); // Copy files through
    await resolveFn('.scripts/zip.mjs', 'packageExtensions', ...program.args);
  }

  if (opts.init) {
    logger(`Fetching a joomla instance...`);
    await resolveFn('.scripts/fetch-joomla.mjs', 'fetchJoomla', ...program.args);
  }
}

main();
