import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { cwd } from 'node:process';

const require = createRequire(import.meta.url);

/**
 * Read the package.json
 */
function getPackage() {
  const jsonPath = 'package.json';
  if (!existsSync(jsonPath)) {
    throw new Error(`No package.json found in ${cwd()}`);
  }
  try {
    return require(join(cwd(), 'package.json'));
  } catch (err) {
    return {};
  }
}

export { getPackage };
