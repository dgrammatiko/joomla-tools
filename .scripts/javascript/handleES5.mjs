import { basename, dirname, resolve, sep } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { rolldown } from 'rolldown';
import { logger } from '../utils/logger.mjs';

/**
 * @param { string } file
 */
async function handleES5File(file) {
  if (!existsSync(file)) {
    throw new Error(`File ${file} doesn't exist`);
  }

  if (!globalThis.searchPath || !globalThis.replacePath) {
    throw new Error(`Global searchPath and replacePath are not defined`);
  }

  if (file.endsWith('.es5.js')) {
    logger(`Processing Legacy js file: ${basename(file)}...`);
    const outputFile = file.replace(`${sep}${globalThis.searchPath}${sep}`, globalThis.replacePath).replace('.es5.js', '.js');
    if (!existsSync(dirname(outputFile))) {
      await mkdir(dirname(outputFile), { recursive: true, mode: 0o755 });
    }

    const bundler = await rolldown({
      input: file,
      output: { format: 'iife', sourcemap: false },
    });
    const result = await bundler.generate();
    await writeFile(resolve(outputFile), result.output[0].code, { encoding: 'utf8', mode: 0o644 });
    await bundler.close();
    logger(`Legacy js file: ${basename(file)}: ✅ bundled`);

    const minifiedBundler = await rolldown({
      input: file,
      output: { format: 'iife', sourcemap: false, minify: true },
    });
    const minifiedResult = await minifiedBundler.generate();
    await writeFile(resolve(outputFile.replace('.js', '.min.js')), minifiedResult.output[0].code, { encoding: 'utf8', mode: 0o644 });
    await minifiedBundler.close();
    logger(`✅ Legacy js file: ${basename(file)}: minified`);
  }
};

export { handleES5File };
