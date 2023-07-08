import { rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { cwd } from 'node:process';
import { join } from 'node:path';
import semver from 'semver';
import { exec } from 'node:child_process';

const require = createRequire(import.meta.url);

/**
 * Read the package.json
 */
function getPackage(pack = 'package.json') {
  return require(join(cwd(), pack));
}

const pkg = getPackage();
const version = semver.clean(pkg.version);

pkg.version = `${semver.major(version)}.${semver.minor(version)}.${semver.patch(version) + 1}`;

writeFileSync('package.json', JSON.stringify(pkg, '', 2));

rmSync('package-lock.json');
