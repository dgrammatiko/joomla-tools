import { sep } from 'node:path';

/**
 * Resolve the base path
 *
 * @param {string} path the path
 * @param {string} type is it extension or Joomla
 * @returns {string}
 */
export const resolvePath = (path, type = 'extension') => {
  if (type !== 'extension') {
    return path.replace(`${sep}media_source${sep}`, `${sep}media${sep}`);
  } else {
    return path.replace(`${sep}media_source${sep}`, `${sep}media${sep}`);
  }
}
