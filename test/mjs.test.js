import { existsSync, rmSync, readFileSync } from 'node:fs';
import assert from 'node:assert';
import { describe, test } from 'node:test';
import { handleESMFile } from '../.scripts/javascript/handleESMFile.mjs';

const noImportMap = `{"version":3,"file":"module_without_import.min.js","names":[],"sources":["../../../media_source/stubs/js/module_without_import.mjs"],"sourcesContent":["const a = 'hello';\\n\\nexport { a };\\n"],"mappings":"AAAA,MAAM,EAAI,QAAA,QAAA"}`;
const importMap = `{"version":3,"file":"module_with_import.min.js","names":[],"sources":["../../../media_source/stubs/js/module_without_import.mjs"],"sourcesContent":["const a = 'hello';\\n\\nexport { a };\\n"],"mappings":"AAAA,MAAM,EAAI,QAAA,QAAA"}`;

describe('ESM js handling tests', {concurrency: false}, async () => {
  test.afterEach(() => {
    if (existsSync('test/stubs/js')) rmSync('media/stubs/js', { force: true, recursive: true });
  });

  test('Non existing file', async (t) => {
    process.env.production = 'production';
    const file = 'nonExisting.mjs';

    try {
      await handleESMFile(file);
    } catch (e) {
      assert.equal(e.message, `File ${file} doesn't exist`);
    }
  });

  test('Module file without import [production]', async (t) => {
    process.env.production = 'production';
    const file = 'module_without_import.mjs';
    const inputFile = `media_source/stubs/js/${file}`;
    const outputFile = `media/stubs/js/${file.replace('.mjs', '.js')}`;

    await handleESMFile(inputFile, outputFile.replace('.js', '.min.js'));
    assert.equal(existsSync(outputFile.replace('.js', '.min.js')), true);
    assert.equal(readFileSync(outputFile.replace('.js', '.min.js'), {encoding: 'utf8'}), 'const a="hello";export {a}\n//# sourceMappingURL=module_without_import.min.js.map');
    assert.equal(existsSync(outputFile.replace('.js', '.min.js.map')), true);
    assert.equal(readFileSync(outputFile.replace('.js', '.min.js.map'), { encoding: 'utf8' }), noImportMap);
  });

  test('Module file without import [development]', async (t) => {
    process.env.production = 'development';
    const file = 'module_without_import.mjs';
    const inputFile = `media_source/stubs/js/${file}`;
    const outputFile = `media/stubs/js/${file.replace('.mjs', '.js')}`;

    await handleESMFile(inputFile, outputFile.replace('.js', '.min.js'));
    assert.equal(existsSync(outputFile.replace('.js', '.min.js')), true);
    assert.equal(readFileSync(outputFile.replace('.js', '.min.js'), {encoding: 'utf8'}), `const a="hello";export {a}\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,${Buffer.from(noImportMap).toString('base64')}`);
  });

  test('Module file with import [production]', async (t) => {
    process.env.production = 'production';
    const file = 'module_with_import.mjs';
    const inputFile = `media_source/stubs/js/${file}`;
    const outputFile = `media/stubs/js/${file.replace('.mjs', '.js')}`;

    await handleESMFile(inputFile, outputFile.replace('.js', '.min.js'));

    assert.equal(existsSync(outputFile.replace('.js', '.min.js')), true);
    assert.equal(readFileSync(outputFile.replace('.js', '.min.js'), { encoding: 'utf8' }), 'const a="hello";export {a}\n//# sourceMappingURL=module_with_import.min.js.map');
    assert.equal(existsSync(outputFile.replace('.js', '.min.js.map')), true);
    assert.equal(readFileSync(outputFile.replace('.js', '.min.js.map'), { encoding: 'utf8' }), importMap);
  });

  test('Module file with import [development]', async (t) => {
    process.env.production = 'development';
    const file = 'module_with_import.mjs';
    const inputFile = `media_source/stubs/js/${file}`;
    const outputFile = `media/stubs/js/${file.replace('.mjs', '.js')}`;

    await handleESMFile(inputFile, outputFile.replace('.js', '.min.js'));

    assert.equal(existsSync(outputFile.replace('.js', '.min.js')), true);
    assert.equal(readFileSync(outputFile.replace('.js', '.min.js'), { encoding: 'utf8' }), `const a="hello";export {a}\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,${Buffer.from(importMap).toString('base64')}`,);
  });
});
