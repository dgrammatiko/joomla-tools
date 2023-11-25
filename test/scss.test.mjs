import { existsSync, rmSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import test from 'ava';
import { handleScssFile } from '../.scripts/stylesheets/handle-scss.mjs';

test.beforeEach(() => {
  global.searchPath = 'test/stubs/scss';
  global.replacePath = 'test/stubs/new/css';
});

// Cleanup
test.after.always(async () => {
  if (existsSync('test/stubs/new')) {
    rmSync('test/stubs/new', { force: true, recursive: true });
  }
});

test('Non existing SCSS file', async (t) => {
  const file = 'nonExisting.scss';
  await t.throwsAsync(async () => {
    await handleScssFile(file);
  }, { instanceOf: Error, message: `File ${file} doesn't exist` });
});

test('SCSS file without import', async (t) => {
  const file = 'scss_without_import.scss';
  const inputFile = `${global.searchPath}/${file}`;
  const outputFile = `${global.replacePath}/${file.replace('.scss', '.css')}`;

  await t.notThrowsAsync(handleScssFile(inputFile, outputFile));
  await handleScssFile(inputFile, outputFile);

  const inp = `body{color:red}
//${'#'} sourceMappingURL=${basename(outputFile.replace('.css', '.min.css.map'))}`;

  t.truthy(existsSync(outputFile.replace('.css', '.min.css')));
  t.is(readFileSync(outputFile.replace('.css', '.min.css'), { encoding: 'utf8' }), inp);
});

test('SCSS file with import', async (t) => {
  const file = 'scss_with_import.scss';
  const inputFile = `${global.searchPath}/${file}`;
  const outputFile = `${global.replacePath}/${file.replace('.scss', '.css')}`;

  await t.notThrowsAsync(handleScssFile(inputFile, outputFile));
  await handleScssFile(inputFile, outputFile);

  const inp = `body{color:red}
//${'#'} sourceMappingURL=${basename(outputFile.replace('.css', '.min.css.map'))}`;

  t.truthy(existsSync(outputFile.replace('.css', '.min.css')));
  t.is(readFileSync(outputFile.replace('.css', '.min.css'), { encoding: 'utf8' }), inp);
});

test('RTL SCSS file with import', async (t) => {
  const file = 'scss_with_import-rtl.scss';
  const inputFile = `${global.searchPath}/${file}`;
  const outputFile = `${global.replacePath}/${file.replace('.scss', '.css')}`;

  await t.notThrowsAsync(handleScssFile(inputFile, outputFile));
  await handleScssFile(inputFile, outputFile);

  const inp = `body{color:red}
//${'#'} sourceMappingURL=${basename(outputFile.replace('.css', '.min.css.map'))}`;

  t.truthy(existsSync(outputFile.replace('.css', '.min.css')));
  t.is(readFileSync(outputFile.replace('.css', '.min.css'), { encoding: 'utf8' }), inp);
});
