import { existsSync, rmSync, readFileSync } from 'node:fs';
import test from 'ava';
import { handleScssFile } from '../.scripts/stylesheets/handle-scss.mjs';

test.beforeEach(() => {
  globalThis.searchPath = 'test/stubs/css';
  globalThis.replacePath = 'test/stubs/new/css';
})
// Cleanup
test.after.always(async () => {
  if (existsSync('test/stubs/new')) {
    rmSync('test/stubs/new', { force: true, recursive: true });
  }
});

// test('Non existing searchPath', async (t) => {
//   global.searchPath = undefined;
//   global.replacePath = 'test/stubs/new/css';
//   const file = 'nonExistingCSS.css';
//   const inputFile = `${global.searchPath}/${file}`;
//   await t.throwsAsync(
//     async () => {
//       await handleStylesheet(inputFile);
//     },
//     { instanceOf: Error, message: 'Global searchPath and replacePath are not defined' },
//   );
// });

// test('Non existing replacePath', async (t) => {
//   globalThis.searchPath = 'test/stubs/css';
//   globalThis.replacePath = 'test/stubs/new/css';
//   const file = 'nonExistingCSS.css';
//   const inputFile = `${globalThis.searchPath}/${file}`;
//   await t.throwsAsync(
//     async () => {
//       console.log({ a: globalThis.searchPath, b: globalThis.replacePath });
//       await handleStylesheet(inputFile);
//     },
//     { instanceOf: Error, message: 'globalThis searchPath and replacePath are not defined' },
//   );
// });

test('Non existing CSS file', async (t) => {
  globalThis.searchPath = 'test/stubs/css';
  globalThis.replacePath = 'test/stubs/new/css';
  const file = 'nonExistingCSS.css';
  const inputFile = `${globalThis.searchPath}/${file}`;
  await t.throwsAsync(
    async () => {
      await handleScssFile(inputFile, 'whatever');
    },
    { instanceOf: Error, message: `File test/stubs/css/nonExistingCSS.css doesn't exist` },
  );
});

test('CSS file without import', async (t) => {
  globalThis.searchPath = 'test/stubs/css';
  globalThis.replacePath = 'test/stubs/new/css';
  const file = 'css_without_import.css';
  const inputFile = `${globalThis.searchPath}/${file}`;
  const outputFile = `${globalThis.replacePath}/${file.replace('.scss', '.css')}`;

  await t.notThrowsAsync(handleScssFile(inputFile, outputFile));
  await handleScssFile(inputFile, outputFile);

  // t.truthy(existsSync(outputFile));
  t.truthy(existsSync(outputFile.replace('.css', '.min.css')));
  // t.truthy(existsSync(`${outputFile}.map`));
  t.is(
    readFileSync(outputFile.replace('.css', '.min.css'), { encoding: 'utf8' }),
    `body{color:red}
//${'#'} sourceMappingURL=css_without_import.min.css.map`,
  );
});

test('SCSS file with import', async (t) => {
    globalThis.searchPath = 'test/stubs/scss';
    globalThis.replacePath = 'test/stubs/new/css';
    const file = 'scss_with_import.scss';
    const inputFile = `${globalThis.searchPath}/${file}`;
    const outputFile = `${globalThis.replacePath}/${file.replace('.scss', '.css')}`;

    await t.notThrowsAsync(handleScssFile(inputFile, outputFile));
    await handleScssFile(inputFile, outputFile);

    t.truthy(existsSync(outputFile.replace('.css', '.min.css')));
    t.is(
      readFileSync(outputFile.replace('.css', '.min.css'), { encoding: 'utf8' }),
      `body{color:red}
//${'#'} sourceMappingURL=scss_with_import.min.css.map`,
    );
});

test('RTL SCSS file with import', async (t) => {
    globalThis.searchPath = 'test/stubs/scss';
    globalThis.replacePath = 'test/stubs/new/css';
    const file = 'scss_with_import-rtl.scss';
    const inputFile = `${globalThis.searchPath}/${file}`;
    const outputFile = `${globalThis.replacePath}/${file.replace('.scss', '.css')}`;

    await t.notThrowsAsync(handleScssFile(inputFile, outputFile));
    await handleScssFile(inputFile, outputFile);

    t.truthy(existsSync(outputFile.replace('.css', '.min.css')));
    t.is(
      readFileSync(outputFile.replace('.css', '.min.css'), { encoding: 'utf8' }),
      `body{color:red}
//${'#'} sourceMappingURL=scss_with_import-rtl.min.css.map`,
    );
});
