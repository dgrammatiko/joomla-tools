import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';

/**
 * Get an SHA1 hash for a given file
 *
 * @param { string } filePath
 *
 * @returns { Promise<unknown> }
 */
function createHashFromFile(filePath) {
  return new Promise((res) => {
    const hash = createHash('sha1');
    createReadStream(filePath)
      .on('data', (data) => hash.update(data))
      .on('end', () => res(hash.digest('hex')));
  });
}

export { createHashFromFile };
