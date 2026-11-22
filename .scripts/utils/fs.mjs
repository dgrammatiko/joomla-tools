import { readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * @param {String} path
 * @param {Object} [options]
 * @param {String|String[]} [options.matching]
 * @param {Boolean} [options.files]
 * @param {Boolean} [options.directories]
 * @returns {String[]}
 */
export const find = (path, options = {}) => {
  const { matching, files = true, directories = false } = options;
  const results = [];

  function globToRegex(pattern) {
    let regex = '';
    let i = 0;
    while (i < pattern.length) {
      const ch = pattern[i];
      if (ch === '*' && pattern[i + 1] === '*') {
        regex += '.*';
        i += 2;
      } else if (ch === '*') {
        regex += '[^/]*';
        i++;
      } else if (ch === '?') {
        regex += '[^/]';
        i++;
      } else if (ch === '+' && pattern[i + 1] === '(') {
        const close = pattern.indexOf(')', i);
        const inner = pattern.slice(i + 2, close);
        regex += '(?:' + inner + ')';
        i = close + 1;
      } else if ('.+^${}()|[]\\'.includes(ch)) {
        regex += '\\' + ch;
        i++;
      } else {
        regex += ch;
        i++;
      }
    }
    return new RegExp(`^${regex}$`);
  }

  function matches(name, patterns) {
    const list = Array.isArray(patterns) ? patterns : [patterns];
    return list.some((p) => globToRegex(p).test(name));
  }

  function walk(currentDir) {
    const entries = readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (directories && (!matching || matches(entry.name, matching))) {
          results.push(fullPath);
        }
        walk(fullPath);
      } else if (entry.isFile()) {
        if (files && (!matching || matches(entry.name, matching))) {
          results.push(fullPath);
        }
      }
    }
  }

  walk(path);
  return results;
}

/**
 * @param {String} path
 * @param {Object} [options]
 * @param {String|String[]} [options.matching]
 * @param {Boolean} [options.files]
 * @param {Boolean} [options.directories]
 * @returns {String[]}
 */
// function find(path, options = {}) {
//   const { matching, files = true, directories = false } = options;
//   const results = [];

//   function globToRegex(pattern) {
//     let regex = '';
//     let i = 0;
//     while (i < pattern.length) {
//       const ch = pattern[i];
//       if (ch === '*' && pattern[i + 1] === '*') {
//         regex += '.*';
//         i += 2;
//       } else if (ch === '*') {
//         regex += '[^/]*';
//         i++;
//       } else if (ch === '?') {
//         regex += '[^/]';
//         i++;
//       } else if (ch === '+' && pattern[i + 1] === '(') {
//         const close = pattern.indexOf(')', i);
//         const inner = pattern.slice(i + 2, close);
//         regex += '(?:' + inner + ')';
//         i = close + 1;
//       } else if ('.+^${}()|[]\\'.includes(ch)) {
//         regex += '\\' + ch;
//         i++;
//       } else {
//         regex += ch;
//         i++;
//       }
//     }
//     return new RegExp(`^${regex}$`);
//   }

//   function matches(name, patterns) {
//     const list = Array.isArray(patterns) ? patterns : [patterns];
//     return list.some((p) => globToRegex(p).test(name));
//   }

//   function walk(currentDir) {
//     const entries = readdirSync(currentDir, { withFileTypes: true });
//     for (const entry of entries) {
//       const fullPath = join(currentDir, entry.name);
//       if (entry.isDirectory()) {
//         if (directories && (!matching || matches(entry.name, matching))) {
//           results.push(fullPath);
//         }
//         walk(fullPath);
//       } else if (entry.isFile()) {
//         if (files && (!matching || matches(entry.name, matching))) {
//           results.push(fullPath);
//         }
//       }
//     }
//   }

//   walk(path);
//   return results;
// }