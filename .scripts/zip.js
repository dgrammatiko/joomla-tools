import { readdirSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname } from 'node:path';

import * as zip from '@quentinadam/zip';

/**
 * @type {[]} //{ name: string, zip: ZipWriter }
 */
const zips = [];

function applyReplacements(file, replacables) {
  const content = readFileSync(file, { encoding: 'utf8' });
  return Buffer.from(!replacables.version ? content : content.replace('{{version}}', replacables.version));
}

async function addFilesRecursively(folder, replace, replacables) {
  const files = [];
  if (!existsSync(folder)) return files;
  for (const fileObj of readdirSync(folder, { recursive: true, withFileTypes: true })) {
    if (!fileObj.isFile()) continue;
    const file = `${fileObj.parentPath}/${fileObj.name}`;
    const corrected = fileObj.parentPath.replace(folder, replace);

    files.push({
      name: `${corrected ? `${corrected}/` : ''}${fileObj.name}`,
      data: ['.php', '.xml', '.ini', '.js', '.css'].includes(extname(fileObj.name)) ? applyReplacements(file, replacables) : readFileSync(file),
    });
  }

  return files;
}

async function packageExtensions() {
  if (!existsSync('src')) throw new Error('There are no extensions, no src folder.');

  for (const type of readdirSync('src')) {
    if (['.', '..', '.DS_Store'].includes(type)) continue;

    for (const extensionName of readdirSync(`src/${type}`)) {
      if (['.', '..', '.DS_Store'].includes(extensionName)) continue;

      switch (type) {
        case 'components': {
          if (existsSync(`src/${type}/${extensionName}/administrator`)) throw Error('Components need the Administrator part!');
          const replacables = globalThis.options['joomla-extensions'].components.filter((x) => x.name === extensionName)[0];
          const zip = new ZipWriter(new BlobWriter('application/zip'));

          const files = await addFilesRecursively(`src/${type}/${extensionName}/administrator`, 'administrator', replacables, zip);

          // Fix the path to the manifest
          for (const file of files) {
            file.name = file.name === `administrator/${extensionName}.xml` ? `${extensionName}.xml` : file.name;
          }

          zips.push({
            name: `com_${extensionName}_v${replacables.version}.zip`,
            data: await zip.create([
              ...files,
              ...(await addFilesRecursively(`src/${type}/${extensionName}/site`, 'site', replacables, zip)),
              ...(await addFilesRecursively(`media/com_${extensionName}`, 'media', replacables, zip)),
            ]),
          });

          break;
        }
        case 'modules': {
          for (const actualModName of readdirSync(`src/${type}/${extensionName}`)) {
            if (!['administrator', 'site'].includes(extensionName)) continue;
            if (['.', '..', '.DS_Store'].includes(actualModName)) continue;
            if (!globalThis.options['joomla-extensions'].modules[extensionName]) return;

            const replacables = globalThis.options['joomla-extensions'].modules[extensionName].filter((x) => x.name === actualModName)?.[0];
            if (!replacables) return;

            zips.push({
              name: `mod_${extensionName}_${actualModName}_v${replacables.version}.zip`,
              data: await zip.create([
                ...(await addFilesRecursively(`src/${type}/${extensionName}/${actualModName}`, '', replacables)),
                ...(await addFilesRecursively(`media/mod_${actualModName}`, 'media', replacables)),
              ]),
            });
          }

          break;
        }
        case 'plugins': {
          for (const plgName of readdirSync(`src/${type}/${extensionName}`)) {
            if (['.', '..', '.DS_Store'].includes(plgName)) continue;
            if (!globalThis.options['joomla-extensions'].plugins[extensionName]) return;
            const replacables = globalThis.options['joomla-extensions'].plugins[extensionName].filter((x) => x.name === plgName)?.[0];
            if (!replacables) return;

            zips.push({
              name: `plg_${extensionName}_${plgName}_v${replacables.version}.zip`,
              data: await zip.create([
                ...(await addFilesRecursively(`src/${type}/${extensionName}/${plgName}`, '', replacables)),
                ...(await addFilesRecursively(`media/plg_${extensionName}_${plgName}`, 'media', replacables)),
              ]),
            });
          }
          break;
        }
        case 'libraries': {
          if (!globalThis.options['joomla-extensions'].libraries[extensionName]) return;
          const replacables = globalThis.options['joomla-extensions'].libraries.filter((x) => x.name === extensionName)?.[0];
          if (!replacables) return;

          zips.push({
            name: `lib_${type}_${extensionName}_v${replacables.version}.zip`,
            data: await zip.create([
              ...(await addFilesRecursively(`src/${type}/${extensionName}/${plgName}`, '', replacables)),
              ...(await addFilesRecursively(`media/lib_${extensionName}`, 'media', replacables)),
            ]),
          });

          break;
        }
        case 'templates': {
          for (const actualTplName of readdirSync(`src/${type}/${extensionName}`)) {
            if (['.', '..', '.DS_Store'].includes(actualTplName)) continue;
            const replacables = globalThis.options['joomla-extensions'].templates[extensionName][actualTplName].filter((x) => x.name === actualTplName)?.[0];
            if (!replacables) return;

            zips.push({
              name: `tpl_${extensionName}_${actualTplName}_v${replacables.version}.zip`,
              data: await zip.create([
                ...(await addFilesRecursively(`src/${type}/${extensionName}/${actualTplName}`, '', replacables)),
                ...(await addFilesRecursively(`media/${type}/${extensionName}/${actualTplName}`, 'media', replacables)),
              ]),
            });
          }

          break;
        }
        default:
          break;
      }
    }
  }

  if (!existsSync('./packages')) mkdirSync('packages');
  if (existsSync('src/packages')) {
    mkdirSync('packages/packages');

    // @todo add packages support
    // return;
  }

  for (const zipEntry of zips) {
    writeFileSync(`packages/${zipEntry.name}`, zipEntry.data);
  }
}

export { packageExtensions };
