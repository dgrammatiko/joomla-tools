import { createRequire } from 'node:module';
import { cwd } from 'node:process';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

const require = createRequire(import.meta.url);

/**
 * Read the package.json
 */
function getPackage() {
  const path = join(cwd(), 'package.json');
  if (!existsSync(path)) {
    throw new Error(`No package.json found in ${cwd()}`);
  }
  try {
    return require(join(cwd(), 'package.json'));
  } catch (err) {
    return {};
  }
}

export { getPackage };
