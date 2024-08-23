import { existsSync, rmSync, readFileSync } from 'node:fs';
import assert from 'node:assert';
import { test } from 'node:test';
import { handleScssFile } from '../.scripts/stylesheets/handleSCSSFile.mjs';

// Cleanup
test.afterEach(async () => {
  if (existsSync('test/stubs/new')) {
    rmSync('test/stubs/new', { force: true, recursive: true });
  }
});
test.beforeEach(async () => {
  if (existsSync('test/stubs/new')) {
    rmSync('test/stubs/new', { force: true, recursive: true });
  }
});

test('Non existing SCSS file', async (t) => {
  global.searchPath = 'test/stubs/scss';
  global.replacePath = 'test/stubs/new/css';
  const file = 'nonExisting.scss';
  await t.throwsAsync(async () => {
    await handleScssFile(file);
  }, { instanceOf: Error, message: `File ${file} doesn't exist` });
});

test('SCSS file without import', async (t) => {
  global.searchPath = 'test/stubs/scss';
  global.replacePath = 'test/stubs/new/css';
  const file = 'scss_without_import.scss';
  const inputFile = `${global.searchPath}/${file}`;
  const outputFile = `${global.replacePath}/${file.replace('.scss', '.css')}`;

  await t.notThrowsAsync(handleScssFile(inputFile, outputFile));
  await handleScssFile(inputFile, outputFile);

  t.truthy(existsSync(outputFile));
  t.truthy(existsSync(outputFile.replace('.css', '.min.css')));
  t.is(readFileSync(outputFile, { encoding: 'utf8' }), `body {
  color: red;
}`);
  t.is(readFileSync(outputFile.replace('.css', '.min.css'), { encoding: 'utf8' }), 'body{color:red}');
});

test('SCSS file with import', async (t) => {
  global.searchPath = 'test/stubs/scss';
  global.replacePath = 'test/stubs/new/css';
  const file = 'scss_with_import.scss';
  const inputFile = `${global.searchPath}/${file}`;
  const outputFile = `${global.replacePath}/${file.replace('.scss', '.css')}`;

  await t.notThrowsAsync(handleScssFile(inputFile, outputFile));
  await handleScssFile(inputFile, outputFile);

  t.truthy(existsSync(outputFile));
  t.truthy(existsSync(outputFile.replace('.css', '.min.css')));
  t.is(readFileSync(outputFile, { encoding: 'utf8' }), `body {
  color: red;
}`);
  t.is(readFileSync(outputFile.replace('.css', '.min.css'), { encoding: 'utf8' }), 'body{color:red}');
});

test('RTL SCSS file with import', async (t) => {
  global.searchPath = 'test/stubs/scss';
  global.replacePath = 'test/stubs/new/css';
  const file = 'scss_with_import-rtl.scss';
  const inputFile = `${global.searchPath}/${file}`;
  const outputFile = `${global.replacePath}/${file.replace('.scss', '.css')}`;

  await t.notThrowsAsync(handleScssFile(inputFile, outputFile));
  await handleScssFile(inputFile, outputFile);

  t.truthy(existsSync(outputFile));
  t.truthy(existsSync(outputFile.replace('.css', '.min.css')));
  t.is(readFileSync(outputFile, { encoding: 'utf8' }), `body {
  color: red;
}`);
  t.is(readFileSync(outputFile.replace('.css', '.min.css'), { encoding: 'utf8' }), 'body{color:red}');
});
