import mod from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

const require = mod.createRequire(import.meta.url);

/**
 * Read the package.json
 */
function getPackage() {
  const jsonPath = 'package.json';
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`No package.json found in ${process.cwd()}`);
  }
  try {
    return require(path.join(process.cwd(), 'package.json'));
  } catch (err) {
    return {};
  }
}

export { getPackage };
