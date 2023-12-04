import { existsSync, rmSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import test from 'ava';

import { handleESMToLegacy } from '../.scripts/javascript/ESMtoES5.mjs';

test.beforeEach(() => {
  global.searchPath = 'test/stubs/js';
  global.replacePath = 'test/stubs/new/js';
});

// Cleanup
test.after.always(() => {
  if (existsSync('test/stubs/new')) {
    rmSync('test/stubs/new', { force: true, recursive: true });
  }
});

test('Missing input file', async (t) => {
  const file = 'nonexisting-legacy-es5.js';

  await t.throwsAsync(async () => {
    await handleESMToLegacy(file, `${global.replacePath}/${file.replace('-es5.js', '.min.js')}`);
  }, { instanceOf: Error, message: `File ${file} doesn't exist` });
});

test('JS file without import', async (t) => {
  const file = 'legacy-es5.js';
  const inputFile = `${global.searchPath}/${file}`;
  const outputFile = `${global.replacePath}/${file.replace('-es5.js', '.min.js')}`;
  const inp = `window.Thing="hello";\n//${'#'} sourceMappingURL=${basename(outputFile.replace('.js', '.js.map'))}\n`;

  // await t.notThrowsAsync(handleES5File(inputFile, outputFile), `File ${inputFile} missing`);
  await handleESMToLegacy(inputFile, outputFile);

  t.truthy(existsSync(outputFile));
  t.truthy(existsSync(`${outputFile}.map`));
  t.is(readFileSync(outputFile, { encoding: 'utf8' }), inp);
});
