import { existsSync, rmSync, readFileSync } from 'node:fs';
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { handleScssFile } from '../.scripts/stylesheets/handle-scss.mjs';

// Cleanup
after(async () => {
  if (existsSync('test/stubs/new')) {
    rmSync('test/stubs/new', { force: true, recursive: true });
  }
});

test('Non existing SCSS file', async () => {
  global.searchPath = 'test/stubs/scss';
  global.replacePath = 'test/stubs/new/css';
  const file = 'nonExisting.scss';
  await assert.rejects(async () => {
    await handleScssFile(file);
  }, { name: 'Error', message: `File ${file} doesn't exist` });
});

test('SCSS file without import', async () => {
  global.searchPath = 'test/stubs/scss';
  global.replacePath = 'test/stubs/new/css';
  const file = 'scss_without_import.scss';
  const inputFile = `${global.searchPath}/${file}`;
  const outputFile = `${global.replacePath}/${file.replace('.scss', '.css')}`;

  await assert.doesNotReject(handleScssFile(inputFile, outputFile));
  await handleScssFile(inputFile, outputFile);

  assert.ok(existsSync(outputFile));
  assert.ok(existsSync(outputFile.replace('.css', '.min.css')));
  assert.strictEqual(readFileSync(outputFile, { encoding: 'utf8' }), `body {
  color: red;
}`);
  assert.strictEqual(readFileSync(outputFile.replace('.css', '.min.css'), { encoding: 'utf8' }), 'body{color:red}');
});

test('SCSS file with import', async () => {
  global.searchPath = 'test/stubs/scss';
  global.replacePath = 'test/stubs/new/css';
  const file = 'scss_with_import.scss';
  const inputFile = `${global.searchPath}/${file}`;
  const outputFile = `${global.replacePath}/${file.replace('.scss', '.css')}`;

  await assert.doesNotReject(handleScssFile(inputFile, outputFile));
  await handleScssFile(inputFile, outputFile);

  assert.ok(existsSync(outputFile));
  assert.ok(existsSync(outputFile.replace('.css', '.min.css')));
  assert.strictEqual(readFileSync(outputFile, { encoding: 'utf8' }), `body {
  color: red;
}`);
  assert.strictEqual(readFileSync(outputFile.replace('.css', '.min.css'), { encoding: 'utf8' }), 'body{color:red}');
});

test('RTL SCSS file with import', async () => {
  global.searchPath = 'test/stubs/scss';
  global.replacePath = 'test/stubs/new/css';
  const file = 'scss_with_import-rtl.scss';
  const inputFile = `${global.searchPath}/${file}`;
  const outputFile = `${global.replacePath}/${file.replace('.scss', '.css')}`;

  await assert.doesNotReject(handleScssFile(inputFile, outputFile));
  await handleScssFile(inputFile, outputFile);

  assert.ok(existsSync(outputFile));
  assert.ok(existsSync(outputFile.replace('.css', '.min.css')));
  assert.strictEqual(readFileSync(outputFile, { encoding: 'utf8' }), `body {
  color: red;
}`);
  assert.strictEqual(readFileSync(outputFile.replace('.css', '.min.css'), { encoding: 'utf8' }), 'body{color:red}');
});
