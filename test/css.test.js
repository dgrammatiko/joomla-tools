import { existsSync, rmSync, readFileSync } from 'node:fs';
import { env } from 'node:process';
import assert from 'node:assert';
import { describe, test } from 'node:test';
import { handleCssFile } from '../.scripts/stylesheets/handleCSSFile.mjs';

describe('CSS handling tests', { concurrency: false }, () => {
  test.afterEach(() => {
    if (existsSync('test/stubs/css')) rmSync('media/stubs/css', { force: true, recursive: true });
  });

  test('Non file passed', async (t) => {
    process.env.ENV = 'production';
    let message;

    try {
      await handleCssFile(null);
    } catch (e) {
      message = e.message;
    }
    assert.equal(message, `File doesn't exist`);
  });

  test('Non .css file', async (t) => {
    process.env.ENV = 'production';
    const file = 'nonExisting.go';
    const out = await handleCssFile(file);
    assert.equal(out, true);
  });

  test('Non existing CSS file', async (t) => {
    env.ENV = 'production';
    const inputFile = 'nonExistingCSS.css';
    let message;

    try {
      await handleCssFile(inputFile);
    } catch (e) {
      message = e.message;
    }
    assert.equal(message, `No such file or directory (os error 2)`);
  });

  test('CSS file no outputFile argument [production]', async (t) => {
    env.ENV = 'production';
    const file = 'css_without_import.css';
    const inputFile = `media_source/stubs/css/${file}`;
    const outputFile = `media/stubs/css/${file.replace('.css', '.min.css')}`;

    await handleCssFile(inputFile);
    assert.equal(existsSync(outputFile), true);
    assert.equal(readFileSync(outputFile, { encoding: 'utf8' }), 'body{color:red}\n/*# sourceMappingURL=css_without_import.min.css.map */');
  });

  test('CSS file without import [production]', async (t) => {
    env.ENV = 'production';
    const file = 'css_without_import.css';
    const inputFile = `media_source/stubs/css/${file}`;
    const outputFile = `media/stubs/css/${file.replace('.css', '.min.css')}`;

    await handleCssFile(inputFile, outputFile);
    assert.equal(existsSync(outputFile), true);
    assert.equal(
      readFileSync(outputFile, { encoding: 'utf8' }),
      'body{color:red}\n/*# sourceMappingURL=css_without_import.min.css.map */',
    );
  });

  test('CSS file without import [development]', async (t) => {
    env.ENV = 'nope';
    const file = 'css_without_import.css';
    const inputFile = `media_source/stubs/css/${file}`;
    const outputFile = `media/stubs/css/${file.replace('.css', '.min.css')}`;

    await handleCssFile(inputFile, outputFile);
    assert.equal(existsSync(outputFile), true);
    assert.equal(
      readFileSync(outputFile, { encoding: 'utf8' }),
      'body {\n  color: red;\n}\n\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VSb290IjpudWxsLCJtYXBwaW5ncyI6IkFBQUEiLCJzb3VyY2VzIjpbIm1lZGlhX3NvdXJjZS9zdHVicy9jc3MvY3NzX3dpdGhvdXRfaW1wb3J0LmNzcyJdLCJzb3VyY2VzQ29udGVudCI6WyJib2R5IHtcbiAgY29sb3I6IHJlZDtcbn1cbiJdLCJuYW1lcyI6W119 */',
    );
  });

  test('CSS file with import [production]', async (t) => {
    env.ENV = 'production';
    const file = 'css_with_import.css';
    const inputFile = `media_source/stubs/css/${file}`;
    const outputFile = `media/stubs/css/${file.replace('.css', '.min.css')}`;

    await handleCssFile(inputFile, outputFile);
    assert.equal(existsSync(outputFile), true);
    assert.equal(readFileSync(outputFile, { encoding: 'utf8' }), 'body{color:red}\n/*# sourceMappingURL=css_with_import.min.css.map */');
  });

  test('CSS file with import [development]', async (t) => {
    env.ENV = 'development';
    const file = 'css_with_import.css';
    const inputFile = `media_source/stubs/css/${file}`;
    const outputFile = `media/stubs/css/${file.replace('.css', '.min.css')}`;

    await handleCssFile(inputFile, outputFile);
    assert.equal(existsSync(outputFile), true);
    assert.equal(
      readFileSync(outputFile, { encoding: 'utf8' }),
      'body {\n  color: red;\n}\n\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VSb290IjpudWxsLCJtYXBwaW5ncyI6IkFDQUEiLCJzb3VyY2VzIjpbIm1lZGlhX3NvdXJjZS9zdHVicy9jc3MvY3NzX3dpdGhfaW1wb3J0LmNzcyIsIm1lZGlhX3NvdXJjZS9zdHVicy9jc3MvY3NzX3dpdGhvdXRfaW1wb3J0LmNzcyJdLCJzb3VyY2VzQ29udGVudCI6WyJAaW1wb3J0IFwiY3NzX3dpdGhvdXRfaW1wb3J0LmNzc1wiO1xuIiwiYm9keSB7XG4gIGNvbG9yOiByZWQ7XG59XG4iXSwibmFtZXMiOltdfQ== */',
    );
  });
});
