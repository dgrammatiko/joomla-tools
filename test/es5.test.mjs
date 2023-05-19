import { existsSync, rmSync, readFileSync } from 'node:fs';
import test from 'ava';
import { handleESMToLegacy } from '../.scripts/javascript/ESMtoES5.mjs';

const outputString = `(function () {
    'use strict';

    var a = 'hello';
    window.Joomla = a;

})();`;

// Cleanup
test.after.always(async (t) => {
  if (existsSync('test/stubs/js/new')) {
    rmSync('test/stubs/js/new', { force: true, recursive: true });
  }
});

test('Non existing file', async (t) => {
  global.searchPath = 'test/stubs/js';
  global.replacePath = 'test/stubs/new/js';
  const file = 'nonexisting-legacy-es5.js';
  await t.throwsAsync(async () => {
    await handleESMToLegacy(file, `${global.replacePath}/${file.replace('-es5.js', '.js')}`);
  }, { instanceOf: Error, message: `File ${file} doesn't exist` });
});

test('ES5 file', async (t) => {
  global.searchPath = 'test/stubs/js';
  global.replacePath = 'test/stubs/new/js';
  const file = 'legacy-es5.js';
  const inputFile = `${global.searchPath}/${file}`;
  const outputFile = `${global.replacePath}/${file.replace('-es5.js', '.js')}`;

  await t.notThrowsAsync(handleESMToLegacy(inputFile, outputFile));
  await handleESMToLegacy(inputFile, outputFile);

  t.truthy(existsSync(outputFile));
  t.truthy(existsSync(outputFile.replace('.js', '.min.js')));
  // t.is(readFileSync(outputFile, { encoding: 'utf8' }), outputString);
  t.is(readFileSync(outputFile.replace('.js', '.min.js'), { encoding: 'utf8' }), `!function(){"use strict";window.Thing="hello"}();`);
});
