import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, basename } from 'node:path';
import { initCompiler } from 'sass';
import { logger } from '../utils/logger.mjs';

const ScssCompiler = new initCompiler();

function isProd() {
  return !process.env.production || process.env.production === 'production' ? true : false;
}

/**
 * @param { string } inputFile
 * @param { string } outputFile
 */
async function handleScssFile(inputFile, outputFile) {
  if (!inputFile || !existsSync(inputFile)) {
    throw new Error(`File ${inputFile} doesn't exist`);
  }

  // biome-ignore lint/style/noParameterAssign:
  outputFile = !outputFile ? inputFile.replace('.scss', '.min.css').replace(/^media_source(\/|\\)/, 'media/') : outputFile;

  if (!existsSync(dirname(outputFile))) {
    mkdirSync(dirname(outputFile), { recursive: true, mode: 0o755 });
  }

  const isProdFlag = isProd();
  const options = {
    charset: true,
    sourceMap: true,
    sourceMapIncludeSources: !isProdFlag,
    style: isProdFlag ? 'compressed' : 'expanded',
  };
  const { css, sourceMap } = ScssCompiler.compile(inputFile, options);

  const mapJSON = JSON.stringify(sourceMap);
  const content = `${css}\n/*# sourceMappingURL=${
    isProdFlag
      ? basename(outputFile.replace('.css', '.css.map'))
      : `data:application/json;charset=utf-8;base64,${Buffer.from(mapJSON).toString('base64')}`
  } */`;
  // @todo make all the paths in the sourcemap relative to the output css file

  writeFileSync(outputFile, content, { encoding: 'utf8' });

  if (isProdFlag)
    writeFileSync(outputFile.replace('.css', '.css.map'), mapJSON, { encoding: 'utf8' });

  logger(`✅ SCSS File compiled: ${outputFile}`);
}

export { handleScssFile };
