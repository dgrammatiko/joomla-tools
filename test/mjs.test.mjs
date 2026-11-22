import { existsSync, rmSync, readFileSync } from 'node:fs';
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { handleESMFile } from '../.scripts/javascript/handleESMFile.mjs';

// Cleanup
after(async () => {
  if (existsSync('test/stubs/new')) {
    rmSync('test/stubs/new', { force: true, recursive: true });
  }
});

test('Non existing file', async () => {
  global.searchPath = 'test/stubs/js';
  global.replacePath = 'test/stubs/new/js';
  const file = 'nonExisting.mjs';
  await assert.rejects(async () => {
    await handleESMFile(file);
  }, { name: 'Error', message: `File ${file} doesn't exist` });
});

test('Module file without import', async () => {
  global.searchPath = 'test/stubs/js';
  global.replacePath = 'test/stubs/new/js';
  const file = 'module_without_import.mjs';
  const inputFile = `${global.searchPath}/${file}`;
  const outputFile = `${global.replacePath}/${file.replace('.mjs', '.js')}`;

  await assert.doesNotReject(handleESMFile(inputFile, outputFile));
  await handleESMFile(inputFile, outputFile);

  assert.ok(existsSync(outputFile));
  assert.ok(existsSync(outputFile.replace('.js', '.min.js')));
  assert.strictEqual(readFileSync(outputFile, { encoding: 'utf8' }), `// test/stubs/js/module_without_import.mjs
const a = "hello";
export { a };
`);
  assert.strictEqual(readFileSync(outputFile.replace('.js', '.min.js'), { encoding: 'utf8' }), `// test/stubs/js/module_without_import.mjs
const a = "hello";
export { a };
`);
});

test('Module file with import', async () => {
  global.searchPath = 'test/stubs/js';
  global.replacePath = 'test/stubs/new/js';
  const file = 'module_with_import.mjs';
  const inputFile = `${global.searchPath}/${file}`;
  const outputFile = `${global.replacePath}/${file.replace('.mjs', '.js')}`;

  await assert.doesNotReject(handleESMFile(inputFile, outputFile));
  await handleESMFile(inputFile, outputFile);

  assert.ok(existsSync(outputFile));
  assert.ok(existsSync(outputFile.replace('.js', '.min.js')));
  assert.strictEqual(readFileSync(outputFile, { encoding: 'utf8' }), `// test/stubs/js/module_without_import.mjs
const a = "hello";
export { a };
`);
  assert.strictEqual(readFileSync(outputFile.replace('.js', '.min.js'), { encoding: 'utf8' }), `// test/stubs/js/module_without_import.mjs
const a = "hello";
export { a };
`);
});
