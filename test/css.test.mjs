import { existsSync, rmSync, readFileSync } from 'node:fs';
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { handleCssFile } from '../.scripts/stylesheets/handle-css.mjs';

// Cleanup
after(async () => {
  if (existsSync('test/stubs/new')) {
    rmSync('test/stubs/new', { force: true, recursive: true });
  }
});

test('Non existing CSS file', async () => {
  global.searchPath = 'test/stubs/css';
  global.replacePath = 'test/stubs/new/css';
  const file = 'nonExistingCSS.css';
  await assert.rejects(async () => {
    await handleCssFile(file);
  }, { name: 'Error', message: `File ${file} doesn't exist` });
});

test('CSS file without import', async () => {
  global.searchPath = 'test/stubs/css';
  global.replacePath = 'test/stubs/new/css';
  const file = 'css_without_import.css';
  const inputFile = `${global.searchPath}/${file}`;
  const outputFile = `${global.replacePath}/${file}`;

  await assert.doesNotReject(handleCssFile(inputFile));
  await handleCssFile(inputFile);

  assert.ok(existsSync(outputFile));
  assert.ok(existsSync(outputFile.replace('.css', '.min.css')));
  assert.strictEqual(readFileSync(outputFile, { encoding: 'utf8' }), `body {
  color: red;
}
`);
  assert.strictEqual(readFileSync(outputFile.replace('.css', '.min.css'), { encoding: 'utf8' }), 'body{color:red}');
});

// test('CSS file with import', async () => {
//   global.searchPath = 'test/stubs/scss';
//   global.replacePath = 'test/stubs/new/css';
//   const file = 'scss_with_import.scss';
//   const inputFile = `${global.searchPath}/${file}`;
//   const outputFile = `${global.replacePath}/${file.replace('.scss', '.css')}`;

//   await t.notThrowsAsync(handleCssFile(inputFile, outputFile));
//   await handleCssFile(inputFile, outputFile);

//   t.truthy(existsSync(outputFile));
//   t.truthy(existsSync(outputFile.replace('.css', '.min.css')));
//   t.is(readFileSync(outputFile, { encoding: 'utf8' }), `body {
//   color: red;
// }`);
//   t.is(readFileSync(outputFile.replace('.css', '.min.css'), { encoding: 'utf8' }), 'body{color:red}');
// });

// test('RTL SCSS file with import', async (t) => {
//   global.searchPath = 'test/stubs/scss';
//   global.replacePath = 'test/stubs/new/css';
//   const file = 'scss_with_import-rtl.scss';
//   const inputFile = `${global.searchPath}/${file}`;
//   const outputFile = `${global.replacePath}/${file.replace('.scss', '.css')}`;

//   await t.notThrowsAsync(handleCssFile(inputFile, outputFile));
//   await handleCssFile(inputFile, outputFile);

//   t.truthy(existsSync(outputFile));
//   t.truthy(existsSync(outputFile.replace('.css', '.min.css')));
//   t.is(readFileSync(outputFile, { encoding: 'utf8' }), `body {
//   color: red;
// }`);
//   t.is(readFileSync(outputFile.replace('.css', '.min.css'), { encoding: 'utf8' }), 'body{color:red}');
// });
