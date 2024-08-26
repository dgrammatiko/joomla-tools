#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { dirname, sep, join } from 'node:path';
import { createCommand } from 'commander';
import { defaultParams } from './.scripts/utils/defaultParams.mjs';
import { getPackage } from './.scripts/utils/getPackage.mjs';


if (!existsSync(join(process.cwd(), 'package.json'))) {
  throw new Error('No package.json file. Exiting');
}

/**
 * @type {{}} pkg
 */
const pkg = getPackage();
// globalThis.searchPath = `media_source${sep}`;
// globalThis.replacePath = `media${sep}`;
// /^media_source(\/|\\)/, 'media/'

/**
 * @param {{}} error
 */
function errorCatcher(error) {
  /* eslint-disable-next-line */
  console.error(error);
  throw new Error('Something blow up. Exiting');
}

/**
 * @param {string} path
 * @param {string} resolvedFunction
 * @param {[]} args
 */
async function resolveFn(path, resolvedFunction, ...args) {
  if (existsSync(join(process.cwd(), path))) {
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
    if (!existsSync(join(process.cwd(), 'www'))) {
      process.stdout.write('Initializing...');
      await resolveFn('.scripts/fetch-joomla.mjs', 'fetchJoomla', ...program.args);
    }

    process.stdout.write('linking...');
    await resolveFn('.scripts/sym-links.mjs', 'symLink');
  }

  if (opts.build) {
    process.stdout.write('Start building...');
    process.env.env = process.env.env ? process.env.env : 'development';
    await resolveFn('.scripts/stylesheets.mjs', 'handleStylesheets', ...program.args); // Compile css files
    await resolveFn('.scripts/scripts.mjs', 'handleScripts', ...program.args); // Compile script files
    await resolveFn('.scripts/copythru.mjs', 'copyThru', ...program.args); // Copy files through
  }

  if (opts.watch) {
    process.stdout.write(`Start watching... Args: ${program.args.join(' ')}`);
    process.env.env = process.env.env ? process.env.env : 'development';
    await resolveFn('.scripts/watch.mjs', 'watching', ...program.args);
  }

  if (opts.release) {
    process.stdout.write(`Release... Args: ${program.args.join(' ')}`);
    process.env.env = process.env.env ? process.env.env : 'production';
    await resolveFn('.scripts/stylesheets.mjs', 'handleStylesheets', ...program.args);
    await resolveFn('.scripts/scripts.mjs', 'handleScripts', ...program.args);
    await resolveFn('.scripts/copythru.mjs', 'copyThru', ...program.args);
    await resolveFn('.scripts/zip.mjs', 'packageExtensions', ...program.args);
  }

  if (opts.init) {
    process.stdout.write('Fetching a joomla instance...');
    await resolveFn('.scripts/fetch-joomla.mjs', 'fetchJoomla', ...program.args);
  }
}

main();
