import { cwd } from 'node:process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';
import axios from 'axios';
import AdmZip from 'adm-zip';

import { logger } from './utils/logger.mjs';

// https://github.com/joomla/joomla-cms/releases/download/4.1.2/Joomla_4.1.2-Stable-Full_Package.zip
async function fetchJoomla(params) {
  if (!existsSync(resolve(cwd(), 'www'))) {
    try {
      await mkdir('www', { recursive: true });
      const { data } = await axios.get(`https://github.com/joomla/joomla-cms/releases/download/${params.joomlaVersion}/Joomla_${params.joomlaVersion}-Stable-Full_Package.zip`, { responseType: 'arraybuffer' });
      await (new AdmZip(data)).extractAllTo(resolve(cwd(), 'www'), true);
    } catch(err) {
      logger('An error occured, Joomla was not downloaded!');
    }
  } else {
    logger('A Joomla installation already exists, skipping clonning...');
  }
};

export {fetchJoomla};
