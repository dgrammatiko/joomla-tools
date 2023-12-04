#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { argv, cwd, exit } from 'node:process';
import { dirname, join, sep } from 'node:path';
import { createCommand } from 'commander';
import { createRequire } from 'node:module';

/**
 * @type { object }
 */
let pkg;
const require = createRequire(import.meta.url);
const defaultParams = {
  joomlaVersion: '5.0.0',
};

if (!existsSync(join(cwd(), 'package.json'))) {
  process.stdout.write('No package.json file. Exiting');
  exit(1);
}

try {
  pkg = require(join(cwd(), 'package.json'));
} catch (err) {
  throw new Error('The directory is missing the file package.json');
}

globalThis.searchPath = `media_source${sep}`;
globalThis.replacePath = `media${sep}`;

/**
 * @param {{}} error
 */
function errorCatcher(error) {
  process.stdout.write('Something blow up. Exiting\n');
  console.error(error ?? '');
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
    if (!existsSync(join(cwd(), 'www'))) {
      process.stdout.write('Initializing...');
      resolveFn('.scripts/fetch-joomla.mjs', 'fetchJoomla', ...program.args);
    }

    process.stdout.write('linking...');
    resolveFn('.scripts/sym-links.mjs', 'symLink');
  }

  if (opts.build) {
    process.stdout.write('Start building...');
    resolveFn('.scripts/stylesheets.mjs', 'handleStylesheets', ...program.args); // Compile css files
    resolveFn('.scripts/scripts.mjs', 'handleScripts', ...program.args); // Compile script files
    resolveFn('.scripts/copythru.mjs', 'copyThru', ...program.args); // Copy files through
  }

  if (opts.watch) {
    process.stdout.write(`Start watching... Args: ${program.args.join(' ')}`);
    resolveFn('.scripts/watch.mjs', 'watching', ...program.args);
  }

  if (opts.release) {
    process.stdout.write(`Release... Args: ${program.args.join(' ')}`);
    resolveFn('.scripts/zip.mjs', 'packageExtensions', ...program.args);
  }

  if (opts.init) {
    resolveFn('.scripts/fetch-joomla.mjs', 'fetchJoomla', ...program.args);
  }
}

main();
