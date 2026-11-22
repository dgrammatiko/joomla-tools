import { existsSync, rmSync, readFileSync } from 'node:fs';
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { handleESMToLegacy } from '../.scripts/javascript/ESMtoES5.mjs';

// Cleanup
after(async () => {
  if (existsSync('test/stubs/new')) {
    rmSync('test/stubs/new', { force: true, recursive: true });
  }
});

test('Non existing file', async () => {
  global.searchPath = 'test/stubs/js';
  global.replacePath = 'test/stubs/new/js';
  const file = 'nonexisting-legacy-es5.js';
  await assert.rejects(async () => {
    await handleESMToLegacy(file, `${global.replacePath}/${file.replace('-es5.js', '.js')}`);
  }, { name: 'Error', message: `File ${file} doesn't exist` });
});

test('ES5 file', async () => {
  global.searchPath = 'test/stubs/js';
  global.replacePath = 'test/stubs/new/js';
  const file = 'legacy-es5.js';
  const inputFile = `${global.searchPath}/${file}`;
  const outputFile = `${global.replacePath}/${file.replace('-es5.js', '.js')}`;

  await assert.doesNotReject(handleESMToLegacy(inputFile, outputFile));
  await handleESMToLegacy(inputFile, outputFile);

  assert.ok(existsSync(outputFile));
  assert.ok(existsSync(outputFile.replace('.js', '.min.js')));
  assert.strictEqual(readFileSync(outputFile.replace('.js', '.min.js'), { encoding: 'utf8' }), `// test/stubs/js/legacy-es5.js
window.Thing = "hello";
`);
});
