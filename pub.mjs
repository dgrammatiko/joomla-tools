import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { cwd } from 'node:process';
import { join } from 'node:path';
import semver from 'semver';

const require = createRequire(import.meta.url);
const getPackage = (pack = 'package.json') => require(join(cwd(), pack));

const pkg = getPackage();
const pkgLock = getPackage('package-lock.json');
const version = semver.clean(pkg.version);

pkg.version = `${semver.major(version)}.${semver.minor(version)}.${semver.patch(version) + 1}`;
pkgLock.version = `${semver.major(version)}.${semver.minor(version)}.${semver.patch(version) + 1}`;

writeFileSync('package.json', JSON.stringify(pkg, '', 2));
writeFileSync('package-lock.json', JSON.stringify(pkgLock, '', 2));
