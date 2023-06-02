import { existsSync, rmSync, readFileSync } from 'node:fs';
import test from 'ava';
import { handleESMFile } from '../.scripts/javascript/handleESMFile.mjs';

// Cleanup
test.after.always(async (t) => {
  if (existsSync('test/stubs/new')) {
    rmSync('test/stubs/new', { force: true, recursive: true });
  }
});

test('Non existing file', async (t) => {
  global.searchPath = 'test/stubs/js';
  global.replacePath = 'test/stubs/new/js';
  const file = 'nonExisting.mjs';
  await t.throwsAsync(async () => {
    await handleESMFile(file);
  }, { instanceOf: Error, message: `File ${file} doesn't exist` });
});

test('Module file without import', async (t) => {
  global.searchPath = 'test/stubs/js';
  global.replacePath = 'test/stubs/new/js';
  const file = 'module_without_import.mjs';
  const inputFile = `${global.searchPath}/${file}`;
  const outputFile = `${global.replacePath}/${file.replace('.mjs', '.js')}`;

  await t.notThrowsAsync(handleESMFile(inputFile, outputFile));
  await handleESMFile(inputFile, outputFile);

  t.truthy(existsSync(outputFile));
  t.truthy(existsSync(outputFile.replace('.js', '.min.js')));
  t.is(readFileSync(inputFile, { encoding: 'utf8' }), readFileSync(outputFile, { encoding: 'utf8' }));
  t.is(readFileSync(outputFile.replace('.js', '.min.js'), { encoding: 'utf8' }), 'const a="hello";export{a};');
});

test('Module file with import', async (t) => {
  global.searchPath = 'test/stubs/js';
  global.replacePath = 'test/stubs/new/js';
  const file = 'module_with_import.mjs';
  const inputFile = `${global.searchPath}/${file}`;
  const outputFile = `${global.replacePath}/${file.replace('.mjs', '.js')}`;

  await t.notThrowsAsync(handleESMFile(inputFile, outputFile));
  await handleESMFile(inputFile, outputFile);

  t.truthy(existsSync(outputFile));
  t.truthy(existsSync(outputFile.replace('.js', '.min.js')));
  t.is(readFileSync(outputFile, { encoding: 'utf8' }), `const a = 'hello';

export { a };
`);
  t.is(readFileSync(outputFile.replace('.js', '.min.js'), { encoding: 'utf8' }), 'const a="hello";export{a};');
});
