import { existsSync, rmSync, readFileSync } from 'node:fs';
import test from 'ava';
import { handleESMFile } from '../.scripts/javascript/compile-to-es2018.mjs';

test.before(async (t) => {
  if (existsSync('test/stubs/js/new')) {
    rmSync('test/stubs/js/new', { force: true, recursive: true });
  }
});

test.after(async (t) => {
  if (existsSync('test/stubs/js/new')) {
    rmSync('test/stubs/js/new', { force: true, recursive: true });
  }
});

test('Non existing file', async (t) => {
  global.searchPath = 'test/stubs/js';
  global.replacePath = 'test/stubs/js/new';
  const file = 'nonExisting.mjs';
  await t.throwsAsync(async () => {
    await handleESMFile(file);
  }, { instanceOf: Error, message: 'File ' + file + ' doesn\'t exist' });
});

test('Module file without import', async (t) => {
  global.searchPath = 'test/stubs/js';
  global.replacePath = 'test/stubs/js/new';
  const file = 'module_without_import.mjs';
  const inputFile = `${global.searchPath}/${file}`;
  const outputFile = `${global.replacePath}/${file.replace('.mjs', '.js')}`;

  await t.notThrowsAsync(handleESMFile(inputFile));
  await handleESMFile(inputFile);

  t.truthy(existsSync(outputFile));
  t.is(readFileSync(inputFile, { encoding: 'utf8' }), readFileSync(outputFile, { encoding: 'utf8' }));
});
