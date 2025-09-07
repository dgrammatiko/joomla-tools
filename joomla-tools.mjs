#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { argv, cwd } from 'node:process';
import { createCommand } from 'commander';

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
  throw new Error('No package.json file. Exiting');
}

/**
 * @param {string} path
 * @param {string} resolvedFunction
 * @param {[]} args
 */
function resolveFn(path, resolvedFunction, ...args) {
  const local = resolve(join(cwd(), path));
  const nodeModule = resolve(import.meta.dirname, path);

  import(existsSync(local) ? local : nodeModule)
    .then((mod) => mod[resolvedFunction](...args))
    .catch((_) => {
      throw new Error(`Error importing ${resolvedFunction} from ${path}`);
    });
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
      console.log('Initializing...');
      resolveFn('.scripts/fetch-joomla.mjs', 'fetchJoomla', ...program.args);
    }

    console.log('linking...');
    resolveFn('.scripts/sym-links.mjs', 'symLink');
  }

  if (opts.build) {
    if (globalThis.isJoomla) return;

    console.log('Start building...');
    // resolveFn('.scripts/stylesheets.mjs', 'handleStylesheets', ...program.args); // Compile css files
    resolveFn('.scripts/scripts.mjs', 'handleScripts', ...program.args); // Compile script files
    resolveFn('.scripts/copythru.mjs', 'copyThru', ...program.args); // Copy files through
  }

  if (opts.watch) {
    if (globalThis.isJoomla) return;

    console.log(`Start watching... Args: ${program.args.join(' ')}`);
    resolveFn('.scripts/watch.mjs', 'watching', ...program.args);
  }

  if (opts.release) {
    if (globalThis.isJoomla) return;

    console.log(`Release... Args: ${program.args.join(' ')}`);
    resolveFn('.scripts/zip.mjs', 'packageExtensions', ...program.args);
  }

  if (opts.init) {
    if (globalThis.isJoomla) return;
    if (pkg.joomlaVersion) globalThis.joomlaVersion = pkg.joomlaVersion;

    console.log(`Fetching a joomla instance... Version: ${pkg.joomlaVersion}`);
    resolveFn('.scripts/fetch-joomla.mjs', 'fetchJoomla', ...program.args);
  }
}

main();
