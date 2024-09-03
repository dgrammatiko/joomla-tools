import { existsSync, rmSync, readFileSync } from 'node:fs';
import assert from 'node:assert';
import { describe, test } from 'node:test';
import { handleScssFile } from '../.scripts/stylesheets/handleSCSSFile.mjs';

describe('SCSS handling tests', { concurrency: false }, () => {
  test.afterEach(() => {
    if (existsSync('media/stubs/scss')) rmSync('media/stubs/scss', { force: true, recursive: true });
  });

  test('Non existing SCSS file', async (t) => {
    process.env.env = 'production';
    const inputFile = 'nonExistingSCSS.scss';
    const outputFile = 'nonExistingSCSS.scss';
    let message;

    try {
      await handleScssFile(inputFile, outputFile);
    } catch (e) {
      message = e.message;
      assert.equal(message, `File ${inputFile} doesn't exist`);
    }
  });

  test('SCSS file without import [production]', async (t) => {
    process.env.env = 'production';
    const file = 'scss_without_import.scss';
    const inputFile = `media_source/stubs/scss/${file}`;
    const outputFile = `media/stubs/scss/${file.replace('.scss', '.min.css')}`;

    await handleScssFile(inputFile, outputFile);

    assert.equal(existsSync(outputFile), true);
    assert.equal(readFileSync(outputFile, { encoding: 'utf8' }), 'body{color:red}\n/*# sourceMappingURL=scss_without_import.min.css.map */');
    assert.equal(existsSync(outputFile.replace('.css', '.css.map')), true);
    assert.equal(
      readFileSync(outputFile.replace('.css', '.css.map'), { encoding: 'utf8' }),
      `{"version":3,"sourceRoot":"","sources":["file://${process.cwd()}/media_source/stubs/scss/scss_without_import.scss"],"names":[],"mappings":"AAEA,KACE,MAHM"}`,
    );
  });

  test('SCSS file without import [development]', async (t) => {
    process.env.env = 'development';
    const file = 'scss_without_import.scss';
    const inputFile = `media_source/stubs/scss/${file}`;
    const outputFile = `media/stubs/scss/${file.replace('.scss', '.min.css')}`;

    await handleScssFile(inputFile, outputFile);
    const map = `{"version":3,"sourceRoot":"","sources":["file://${process.cwd()}/media_source/stubs/scss/scss_without_import.scss"],"names":[],"mappings":"AAEA;EACE,OAHM","sourcesContent":["$color: red;\\n\\nbody {\\n  color: $color;\\n}\\n"]}`;

    assert.equal(existsSync(outputFile), true);
    assert.equal(
      readFileSync(outputFile, { encoding: 'utf8' }),
      `body {\n  color: red;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,${Buffer.from(map).toString('base64')} */`,
    );
  });

  test('SCSS file with import [production]', async (t) => {
    process.env.env = 'production';
    const file = 'scss_with_import.scss';
    const inputFile = `media_source/stubs/scss/${file}`;
    const outputFile = `media/stubs/scss/${file.replace('.scss', '.min.css')}`;

    await handleScssFile(inputFile, outputFile);

    assert.equal(existsSync(outputFile), true);
    assert.equal(readFileSync(outputFile, { encoding: 'utf8' }), 'body{color:red}\n/*# sourceMappingURL=scss_with_import.min.css.map */');
    assert.equal(existsSync(outputFile.replace('.css', '.css.map')), true);
    assert.equal(
      readFileSync(outputFile.replace('.css', '.css.map'), { encoding: 'utf8' }),
      `{"version":3,"sourceRoot":"","sources":["file://${process.cwd()}/media_source/stubs/scss/scss_without_import.scss"],"names":[],"mappings":"AAEA,KACE,MAHM"}`,
    );
  });

  test('SCSS file with import [development]', async (t) => {
    process.env.env = 'development';
    const file = 'scss_with_import.scss';
    const inputFile = `media_source/stubs/scss/${file}`;
    const outputFile = `media/stubs/scss/${file.replace('.scss', '.min.css')}`;

    await handleScssFile(inputFile, outputFile);
    const map = `{"version":3,"sourceRoot":"","sources":["file://${process.cwd()}/media_source/stubs/scss/scss_without_import.scss"],"names":[],"mappings":"AAEA;EACE,OAHM","sourcesContent":["$color: red;\\n\\nbody {\\n  color: $color;\\n}\\n"]}`;

    assert.equal(existsSync(outputFile), true);
    assert.equal(
      readFileSync(outputFile, { encoding: 'utf8' }),
      `body {\n  color: red;\n}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,${Buffer.from(map).toString('base64')} */`,
    );
  });
});
