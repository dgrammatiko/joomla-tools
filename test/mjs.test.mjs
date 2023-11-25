import { existsSync, rmSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import test from 'ava';
import { handleESMFile } from '../.scripts/javascript/handleESMFile.mjs';

test.beforeEach(() => {
  global.searchPath = 'test/stubs/js';
  global.replacePath = 'test/stubs/new/js';
});

// Cleanup
test.after.always(() => {
  if (existsSync('test/stubs/new')) {
    rmSync('test/stubs/new', { force: true, recursive: true });
  }
});

test('Non existing file', async (t) => {
  const file = 'nonExisting.mjs';
  await t.throwsAsync(async () => {
    await handleESMFile(file);
  }, { instanceOf: Error, message: `File ${file} doesn't exist` });
});

test('Module file without import', async (t) => {
  const file = 'module_without_import.mjs';
  const inputFile = `${global.searchPath}/${file}`;
  const outputFile = `${global.replacePath}/${file.replace('.mjs', '.min.js')}`;

  await t.notThrowsAsync(handleESMFile(inputFile, outputFile));
  await handleESMFile(inputFile, outputFile);

  const inp = `let e="hello";export{e as a};\n//${'#'} sourceMappingURL=${basename(outputFile.replace('.js', '.js.map'))}\n`;

  t.truthy(existsSync(outputFile));
  t.is(readFileSync(outputFile, { encoding: 'utf8' }), inp);
});

test('Module file with import', async (t) => {
  const file = 'module_with_import.mjs';
  const inputFile = `${global.searchPath}/${file}`;
  const outputFile = `${global.replacePath}/${file.replace('.mjs', '.min.js')}`;

  await t.notThrowsAsync(handleESMFile(inputFile, outputFile));
  await handleESMFile(inputFile, outputFile);

  const inp = `let e="hello";export{e as a};\n//${'#'} sourceMappingURL=${basename(outputFile.replace('.js', '.js.map'))}\n`;

  t.truthy(existsSync(outputFile));
  t.is(readFileSync(outputFile, { encoding: 'utf8' }), inp);
});
