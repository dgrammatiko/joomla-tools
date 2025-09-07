import assert from 'node:assert';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { describe, test } from 'node:test';
import { handleESM } from '../.scripts/javascript/handleESM.mjs';

const noImportMap = `{"version":3,"file":"module_without_import.min.js","names":[],"sources":["../../../media_source/stubs/js/module_without_import.mjs"],"sourcesContent":["const a = 'hello';\\n\\nexport { a };\\n"],"mappings":"AAAA,MAAM,EAAI"}`;
const importMap = `{"version":3,"file":"module_with_import.min.js","names":[],"sources":["../../../media_source/stubs/js/module_without_import.mjs"],"sourcesContent":["const a = 'hello';\\n\\nexport { a };\\n"],"mappings":"AAAA,MAAM,EAAI"}`;

describe('ESM js handling tests', { concurrency: false }, async () => {
  test.afterEach(() => {
    if (existsSync('test/stubs/js')) rmSync('media/stubs/js', { force: true, recursive: true });
  });

  test('Non .mjs file', async (t) => {
    process.env.ENV = 'production';
    const file = 'nonExisting.go';

    const out = await handleESM(file);
    assert.equal(out, true);
  });

  test('Non existing file', async (t) => {
    process.env.ENV = 'production';
    const file = 'nonExisting.mjs';

    try {
      await handleESM(file);
    } catch (e) {
      assert.equal(e.message, `File ${file} doesn't exist`);
    }
  });

  test('Module file without import [production]', async (t) => {
    process.env.ENV = 'production';
    const file = 'module_without_import.mjs';
    const inputFile = `media_source/stubs/js/${file}`;
    const outputFile = `media/stubs/js/${file.replace('.mjs', '.js')}`;

    await handleESM(inputFile, outputFile.replace('.js', '.min.js'));
    assert.equal(existsSync(outputFile.replace('.js', '.min.js')), true);
    assert.equal(
      readFileSync(outputFile.replace('.js', '.min.js'), { encoding: 'utf8' }),
      'const e=`hello`;export{e as a};\n//# sourceMappingURL=module_without_import.min.js.map',
    );
    assert.equal(existsSync(outputFile.replace('.js', '.min.js.map')), true);
    assert.equal(readFileSync(outputFile.replace('.js', '.min.js.map'), { encoding: 'utf8' }), noImportMap);
  });

  test('Module file without import [development]', async (t) => {
    process.env.ENV = 'development';
    const file = 'module_without_import.mjs';
    const inputFile = `media_source/stubs/js/${file}`;
    const outputFile = `media/stubs/js/${file.replace('.mjs', '.js')}`;

    await handleESM(inputFile, outputFile.replace('.js', '.min.js'));
    assert.equal(existsSync(outputFile.replace('.js', '.min.js')), true);
    assert.equal(
      readFileSync(outputFile.replace('.js', '.min.js'), { encoding: 'utf8' }),
      `const e=\`hello\`;export{e as a};\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,${Buffer.from(noImportMap).toString('base64')}`,
    );
  });

  test('Module file with import [production]', async (t) => {
    process.env.ENV = 'production';
    const file = 'module_with_import.mjs';
    const inputFile = `media_source/stubs/js/${file}`;
    const outputFile = `media/stubs/js/${file.replace('.mjs', '.js')}`;

    await handleESM(inputFile, outputFile.replace('.js', '.min.js'));

    assert.equal(existsSync(outputFile.replace('.js', '.min.js')), true);
    assert.equal(
      readFileSync(outputFile.replace('.js', '.min.js'), { encoding: 'utf8' }),
      'const e=`hello`;export{e as a};\n//# sourceMappingURL=module_with_import.min.js.map',
    );
    assert.equal(existsSync(outputFile.replace('.js', '.min.js.map')), true);
    assert.equal(readFileSync(outputFile.replace('.js', '.min.js.map'), { encoding: 'utf8' }), importMap);
  });

  test('Module file with import [development]', async (t) => {
    process.env.ENV = 'development';
    const file = 'module_with_import.mjs';
    const inputFile = `media_source/stubs/js/${file}`;
    const outputFile = `media/stubs/js/${file.replace('.mjs', '.js')}`;

    await handleESM(inputFile, outputFile.replace('.js', '.min.js'));

    assert.equal(existsSync(outputFile.replace('.js', '.min.js')), true);
    assert.equal(
      readFileSync(outputFile.replace('.js', '.min.js'), { encoding: 'utf8' }),
      `const e=\`hello\`;export{e as a};\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,${Buffer.from(importMap).toString('base64')}`,
    );
  });
});
