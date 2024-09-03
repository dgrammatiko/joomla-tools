
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import * as zip from '@quentinadam/zip';

/** @type { string } */
const version = globalThis.joomlaVersion || '4.3.1';

async function fetchJoomla() {
  if (existsSync('www')) {
    throw new Error('A Joomla installation already exists, skipping clonning...');
  }

  let stability = 'Stable';
  if (version.toLowerCase().includes('alpha')) {
    stability = 'Alpha';
  } else if (version.toLowerCase().includes('beta')) {
    stability = 'Beta';
  }

  try {
    mkdirSync('www', { recursive: true });
    // https://github.com/joomla/joomla-cms/releases/download/4.1.2/Joomla_4.1.2-Stable-Full_Package.zip
    const response = await fetch(`https://github.com/joomla/joomla-cms/releases/download/${version}/Joomla_${version}-${stability}-Full_Package.zip`);

    if (!response.ok) {
      throw new Error('There\'s a server problem. Try again later.');
    }

    const zipData = await response.arrayBuffer();

    for (const { name, data } of await zip.extract(Buffer.from(zipData))) {
      if (name.endsWith('/')) {
        mkdirSync(`www/${name}`);
      } else {
        writeFileSync(`www/${name}`, data);
      }
    }

  } catch (err) {
    throw new Error('An error occured, Joomla files were not localised!');
  }
}

export { fetchJoomla };
