import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);

/**
 * Read the package.json
 */
function getPackage() {
  const path = join(process.cwd(), 'package.json');
  if (!existsSync(path)) {
    throw new Error(`No package.json found in ${process.cwd()}`);
  }
  try {
    return require(join(process.cwd(), 'package.json'));
  } catch(err) {
    return {};
  }
};

export { getPackage };
