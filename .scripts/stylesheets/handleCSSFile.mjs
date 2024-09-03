import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import browserslist from 'browserslist';
import { bundle, browserslistToTargets } from 'lightningcss';

/**
 * @param { string } inputFile
 * @param { string } outputFile
 */
function handleCssFile(inputFile, outputFile = '') {
  if (!inputFile || !existsSync(inputFile)) {
    throw new Error(`File ${inputFile} doesn't exist`);
  }

  // biome-ignore lint/style/noParameterAssign:
  outputFile = !outputFile ? inputFile.replace('.css', '.min.css').replace(/^media_source(\/|\\)/, 'media/') : outputFile;

  if (!existsSync(dirname(outputFile))) {
    mkdirSync(dirname(outputFile), { recursive: true, mode: 0o755 });
  }

  const isProd = !process.env.env || process.env.env === 'production' ? true : false;
  const { code, map } = bundle({
    filename: inputFile,
    minify: isProd,
    sourceMap: true,
    targets: browserslistToTargets(browserslist('>= 0.25%')),
  });

  // The css file
  writeFileSync(
    outputFile,
    `${new TextDecoder().decode(code)}\n/*# sourceMappingURL=${
      isProd
        ? basename(outputFile.replace('.css', '.css.map'))
        : `data:application/json;charset=utf-8;base64,${Buffer.from(map).toString('base64')}`
    } */`,
    { encoding: 'utf8' },
  );

  if (isProd) {
    writeFileSync(outputFile.replace('.css', '.css.map'), Buffer.from(map).toString('utf8'), { encoding: 'utf8' });
  }

  process.stdout.write(`✅ CSS: ${inputFile} === ${outputFile}\n`);
}

export { handleCssFile };
