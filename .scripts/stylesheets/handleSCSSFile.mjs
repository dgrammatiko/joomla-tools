import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, basename } from 'node:path';
import { initCompiler } from 'sass';

function isProd() {
  if (!process.env.ENV) {
    return true;
  }
  return process.env.ENV === 'production';
}

const ScssCompiler = new initCompiler();

/**
 * @param { string } inputFile
 */
async function handleScssFile(inputFile) {
  if (!inputFile) {
    throw new Error(`File ${inputFile} doesn't exist`);
  }

  // biome-ignore lint/style/noParameterAssign:
  const outputFile = inputFile.replace('.scss', '.min.css').replace(/^media_source(\/|\\)/, 'media/');

  if (!existsSync(dirname(outputFile))) {
    mkdirSync(dirname(outputFile), { recursive: true, mode: 0o755 });
  }

  const options = {
    charset: true,
    sourceMap: true,
    sourceMapIncludeSources: !isProd(),
    style: isProd() ? 'compressed' : 'expanded',
  };
  const { css, sourceMap } = ScssCompiler.compile(inputFile, options);

  const mapJSON = JSON.stringify(sourceMap);
  const content = `${css}\n/*# sourceMappingURL=${
    isProd()
      ? basename(outputFile.replace('.css', '.css.map'))
      : `data:application/json;charset=utf-8;base64,${Buffer.from(mapJSON).toString('base64')}`
  } */`;

  // @todo make all the paths in the sourcemap relative to the output css file
  writeFileSync(outputFile, content, { encoding: 'utf8' });

  if (isProd()) {
    writeFileSync(outputFile.replace('.css', '.css.map'), mapJSON, { encoding: 'utf8' });
  }

  process.stdout.write(`✅ SCSS: ${inputFile} === ${outputFile}\n`);
}

export { handleScssFile };
