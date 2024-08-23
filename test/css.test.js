import { existsSync, rmSync, readFileSync } from 'node:fs';
import assert from 'node:assert';
import { describe, it, test } from 'node:test';

import { handleCssFile } from '../.scripts/stylesheets/handleCSSFile.mjs';

describe('CSS handling tests', { concurrency: false }, () => {
  // Cleanup
  test.afterEach(async () => {
    if (existsSync('test/stubs/css')) rmSync('media/stubs/css', { force: true, recursive: true });
  });

  it('Non existing CSS file', (t) => {
    process.env.production = 'production';
    const inputFile = 'nonExistingCSS.css';
    const outputFile = 'nonExistingCSS.css';
    let message;

    try {
      handleCssFile(inputFile, outputFile);
    } catch (e) {
      message = e.message;
    }
    assert.equal(message, `File ${inputFile} doesn't exist`);
  });

  it('CSS file no outputFile argument [production]', (t) => {
    process.env.production = 'production';
    const file = 'css_without_import.css';
    const inputFile = `media_source/stubs/css/${file}`;
    const outputFile = `media/stubs/css/${file.replace('.css', '.min.css')}`;

    handleCssFile(inputFile);
    assert.equal(existsSync(outputFile), true);
    assert.equal(readFileSync(outputFile, { encoding: 'utf8' }), 'body{color:red}\n/*# sourceMappingURL=css_without_import.min.css.map */');
  });

  it('CSS file without import [production]', (t) => {
    process.env.production = 'production';
    const file = 'css_without_import.css';
    const inputFile = `media_source/stubs/css/${file}`;
    const outputFile = `media/stubs/css/${file.replace('.css', '.min.css')}`;

    handleCssFile(inputFile, outputFile);
    assert.equal(existsSync(outputFile), true);
    assert.equal(
      readFileSync(outputFile, { encoding: 'utf8' }),
      'body{color:red}\n/*# sourceMappingURL=css_without_import.min.css.map */',
    );
  });

  it('CSS file without import [development]', (t) => {
    process.env.production = 'nope';
    const file = 'css_without_import.css';
    const inputFile = `media_source/stubs/css/${file}`;
    const outputFile = `media/stubs/css/${file.replace('.css', '.min.css')}`;

    handleCssFile(inputFile, outputFile);
    assert.equal(existsSync(outputFile), true);
    assert.equal(
      readFileSync(outputFile, { encoding: 'utf8' }),
      'body {\n  color: red;\n}\n\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VSb290IjpudWxsLCJtYXBwaW5ncyI6IkFBQUEiLCJzb3VyY2VzIjpbIm1lZGlhX3NvdXJjZS9zdHVicy9jc3MvY3NzX3dpdGhvdXRfaW1wb3J0LmNzcyJdLCJzb3VyY2VzQ29udGVudCI6WyJib2R5IHtcbiAgY29sb3I6IHJlZDtcbn1cbiJdLCJuYW1lcyI6W119 */',
    );
  });

  it('CSS file with import', (t) => {
    process.env.production = 'production';
    const file = 'css_with_import.css';
    const inputFile = `media_source/stubs/css/${file}`;
    const outputFile = `media/stubs/css/${file.replace('.css', '.min.css')}`;

    handleCssFile(inputFile, outputFile);
    assert.equal(existsSync(outputFile), true);
    assert.equal(readFileSync(outputFile, { encoding: 'utf8' }), 'body{color:red}\n/*# sourceMappingURL=css_with_import.min.css.map */');
  });
});
