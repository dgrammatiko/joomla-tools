import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { cwd } from 'node:process';
import AdmZip from 'adm-zip';

/** @type { string } */
const version = globalThis.joomlaVersion || '5.4.0';

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
    await mkdirSync('www', { recursive: true });

    // https://github.com/joomla/joomla-cms/releases/download/4.1.2/Joomla_4.1.2-Stable-Full_Package.zip
    const response = await fetch(`https://github.com/joomla/joomla-cms/releases/download/${version}/Joomla_${version}-${des}-Full_Package.zip`);

    const data = await response.arrayBuffer();

    new AdmZip(Buffer.from(data)).extractAllTo(resolve(cwd(), 'www'), true);
  } catch (err) {
    throw new Error('An error occured, Joomla was not downloaded!');
  }
}

export { fetchJoomla };
