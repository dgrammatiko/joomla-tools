
import fs from 'node:fs';
import Path from 'node:path';
import * as zip from '@quentinadam/zip';

import { logger } from './utils/logger.mjs';

/** @type { string } */
const version = globalThis.joomlaVersion || '4.3.1';

async function fetchJoomla() {
  if (fs.existsSync(Path.resolve(process.cwd(), 'www'))) {
    logger('A Joomla installation already exists, skipping clonning...');
    process.exit(1);
  }

  let des;
  if (version.toLowerCase().includes('alpha')) {
    des = 'Alpha';
  } else if (version.toLowerCase().includes('beta')) {
    des = 'Beta';
  } else {
    des = 'Stable';
  }

  try {
    fs.mkdirSync('www', { recursive: true });
    // https://github.com/joomla/joomla-cms/releases/download/4.1.2/Joomla_4.1.2-Stable-Full_Package.zip
    const response = await fetch(`https://github.com/joomla/joomla-cms/releases/download/${version}/Joomla_${version}-${des}-Full_Package.zip`);
    const zipData = await response.arrayBuffer();

    for (const { name, data } of await zip.extract(Buffer.from(zipData))) {
      if (name.endsWith('/')) {
        fs.mkdirSync(`www/${name}`);
      } else {
        fs.writeFileSync(`www/${name}`, data);
      }
    }

  } catch (err) {
    logger('An error occured, Joomla was not downloaded!');
    process.exit(1);
  }
}

export { fetchJoomla };
