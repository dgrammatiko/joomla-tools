import { rmSync, writeFileSync } from 'node:fs';
import semver from 'semver';
import pkg from './package.json' with { type: 'json' };

const version = semver.clean(pkg.version);

pkg.version = `${semver.major(version)}.${semver.minor(version)}.${semver.patch(version) + 1}`;

writeFileSync('package.json', JSON.stringify(pkg, '', 2));

rmSync('package-lock.json');
