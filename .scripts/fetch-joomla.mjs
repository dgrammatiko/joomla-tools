import { cwd } from 'node:process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';
import axios from 'axios';
import AdmZip from 'adm-zip';

import { logger } from './utils/logger.mjs';

// https://github.com/joomla/joomla-cms/releases/download/4.1.2/Joomla_4.1.2-Stable-Full_Package.zip
export async function fetchJoomla(params) {
  if (!existsSync(resolve(cwd(), 'www'))) {
    try {
      const { data } = await axios.get(`https://github.com/joomla/joomla-cms/releases/download/${params.joomlaVersion}/Joomla_${params.joomlaVersion}-Stable-Full_Package.zip`, { responseType: 'arraybuffer' });
      const zip = new AdmZip(data);
      await mkdir('www', { recursive: true });
      await zip.extractAllTo(resolve(cwd(), 'www'), true);
    } catch(err) {
      logger('An error occured, Joomla was not downloaded!');
    }
  } else {
    logger('A Joomla installation already exists, skipping clonning...');
  }
};
