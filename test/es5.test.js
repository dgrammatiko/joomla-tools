import { existsSync, rmSync, readFileSync } from 'node:fs';
import assert from 'node:assert';
import { describe, test } from 'node:test';
import { handleES5File } from '../.scripts/javascript/handleES5.mjs';

describe('CSS handling tests', { concurrency: false }, () => {
  test.afterEach(async () => {
    if (existsSync('test/stubs/new')) {
      rmSync('test/stubs/new', { force: true, recursive: true });
    }
  });

  test('Non existing file', async (t) => {
    process.env.env = 'production';
    const file = 'nonexisting-legacy-es5.js';

    try {
      await handleES5File(file);
    } catch (e) {
      assert.equal(e.message, `File ${file} doesn't exist`);
    }
    assert.ok(true, 'ok');
  });

  test('ES5 file [production]', async (t) => {
    process.env.env = 'production';
    const file = 'legacy.es5.js';
    const inputFile = `media_source/stubs/js/${file}`;
    const outputFile = `media/stubs/js/${file.replace('.es5.js', '.min.js')}`;
    const map = `{"version":3,"file":"legacy.min.js","names":[],"sources":["../../../media_source/stubs/js/legacy.es5.js"],"sourcesContent":["const a = 'hello';\\n\\ndocument.addEventListener('DOMContentLoaded', () => {\\n  console.log(a)\\n});\\n"],"mappings":"yBAAA,MAAM,EAAI,QAEV,SAAS,iBAAiB,mBAAoB,IAAM,CAClD,QAAQ,IAAI,EAAE,AACf,EAAC,IAAA"}`;

    await handleES5File(inputFile, outputFile);
    assert.equal(existsSync(outputFile), true);
    assert.equal(
      readFileSync(outputFile, { encoding: 'utf8' }),
      '(function(){"use strict";const a="hello";document.addEventListener("DOMContentLoaded",()=>{console.log(a)})})();\n//# sourceMappingURL=legacy.min.js.map',
    );
    assert.equal(existsSync(outputFile.replace('.js', '.js.map')), true);
    assert.equal(readFileSync(outputFile.replace('.js', '.js.map'), { encoding: 'utf8' }), map);
  });

  test('ES5 file [development]', async (t) => {
    process.env.env = 'development';
    const file = 'legacy.es5.js';
    const inputFile = `media_source/stubs/js/${file}`;
    const outputFile = `media/stubs/js/${file.replace('.es5.js', '.min.js')}`;
    const map = `{"version":3,"file":"legacy.min.js","names":[],"sources":["../../../media_source/stubs/js/legacy.es5.js"],"sourcesContent":["const a = 'hello';\\n\\ndocument.addEventListener('DOMContentLoaded', () => {\\n  console.log(a)\\n});\\n"],"mappings":"yBAAA,MAAM,EAAI,QAEV,SAAS,iBAAiB,mBAAoB,IAAM,CAClD,QAAQ,IAAI,EAAE,AACf,EAAC,IAAA"}`;

    await handleES5File(inputFile, outputFile);
    assert.equal(existsSync(outputFile), true);
    assert.equal(
      readFileSync(outputFile, { encoding: 'utf8' }),
      `(function(){"use strict";const a="hello";document.addEventListener("DOMContentLoaded",()=>{console.log(a)})})();\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,${Buffer.from(
        map,
      ).toString('base64')}`,
    );
  });
});
