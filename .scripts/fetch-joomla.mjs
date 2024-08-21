import { cwd, exit } from 'node:process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';
import * as zip from '@zip.js/zip.js';
import { logger } from './utils/logger.mjs';

/** @type { string } */
let version = globalThis.joomlaVersion || '4.3.1';

async function fetchJoomla() {
  if (existsSync(resolve(cwd(), 'www'))) {
    logger('A Joomla installation already exists, skipping clonning...');
    exit(1);
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
    await mkdir('www', { recursive: true });
    // https://github.com/joomla/joomla-cms/releases/download/4.1.2/Joomla_4.1.2-Stable-Full_Package.zip
    const response = await fetch(`https://github.com/joomla/joomla-cms/releases/download/${version}/Joomla_${version}-${des}-Full_Package.zip`);
    const data = await response.arrayBuffer();
    zip.configure({ chunkSize: 128, useWebWorkers: true });
    const zipReader = await new zip.ZipReader(new zip.Uint8ArrayReader(Buffer.from(data)));

    const entries = await zipReader.getEntries();

    for (const entry of entries) {
      if (!entry) continue;
      const dir = entry.directory ? `www/${entry.directory}` : 'www';
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

      if (entry.filename) {
        const data = await entry.getData(new zip.Uint8ArrayWriter());
        writeFileSync(`${dir}/${entry.filename}`, data);
      }
    }
  } catch (err) {
    logger('An error occured, Joomla was not downloaded!');
    exit(1);
  }
}

export { fetchJoomla };
