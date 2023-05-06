import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Read the package.json
 */
function getPackage() {
  const path = join(process.cwd(), 'package.json');
  if (!existsSync(path)) {
    throw new Error(`No package.json found in ${process.cwd()}`);
  }
  try {
    return JSON.parse(readFileSync(path, { encoding: 'utf-8' }));
  } catch(err) {
    return {};
  }
};

export {getPackage};
