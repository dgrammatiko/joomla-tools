import { existsSync, rmSync, readFileSync } from 'node:fs';
import assert from 'node:assert';
import { describe, it, test } from 'node:test';

import { handleCssFile } from '../.scripts/stylesheets/handleCSSFile.mjs';

describe('CSS handling tests', { concurrency: false }, () => {
  // Cleanup
  test.afterEach(() => {
    if (existsSync('test/stubs/new/css')) rmSync('test/stubs/new/css', { force: true, recursive: true });
  });
  // test.beforeEach(() => {
  //   if (existsSync('test/stubs/new/css')) rmSync('test/stubs/new/css', { force: true, recursive: true });
  // });

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

  // This needs infra
  // it('CSS file no outputFile argument [production]', (t) => {
  //   process.env.production = 'production';
  //   const file = 'css_without_import.css';
  //   const inputFile = `test/stubs/css/${file}`;
  //   const outputFile = `test/stubs/new/css/${file.replace('.css', '.min.css')}`;

  //   handleCssFile(inputFile);
  //   assert.equal(existsSync(outputFile), true);
  //   assert.equal(readFileSync(outputFile, { encoding: 'utf8' }), 'body{color:red}\n/*# sourceMappingURL=css_without_import.min.css.map */');
  // });

  it('CSS file without import [production]', (t) => {
    process.env.production = 'production';
    const file = 'css_without_import.css';
    const inputFile = `test/stubs/css/${file}`;
    const outputFile = `test/stubs/new/css/${file.replace('.css', '.min.css')}`;

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
    const inputFile = `test/stubs/css/${file}`;
    const outputFile = `test/stubs/new/css/${file.replace('.css', '.min.css')}`;

    handleCssFile(inputFile, outputFile);
    assert.equal(existsSync(outputFile), true);
    assert.equal(
      readFileSync(outputFile, { encoding: 'utf8' }),
      'body {\n  color: red;\n}\n\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VSb290IjpudWxsLCJtYXBwaW5ncyI6IkFBQUEiLCJzb3VyY2VzIjpbInRlc3Qvc3R1YnMvY3NzL2Nzc193aXRob3V0X2ltcG9ydC5jc3MiXSwic291cmNlc0NvbnRlbnQiOlsiYm9keSB7XG4gIGNvbG9yOiByZWQ7XG59XG4iXSwibmFtZXMiOltdfQ== */',
    );
  });

  it('CSS file with import', (t) => {
    process.env.production = 'production';
    const file = 'css_with_import.css';
    const inputFile = `test/stubs/css/${file}`;
    const outputFile = `test/stubs/new/css/${file.replace('.css', '.min.css')}`;

    handleCssFile(inputFile, outputFile);
    assert.equal(existsSync(outputFile), true);
    assert.equal(readFileSync(outputFile, { encoding: 'utf8' }), 'body{color:red}\n/*# sourceMappingURL=css_with_import.min.css.map */');
  });
});
