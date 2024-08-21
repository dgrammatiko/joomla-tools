import { readdirSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname } from 'node:path';

import { BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js';

/**
 * @type {[]} //{ name: string, zip: ZipWriter }
 */
const zips = [];

function applyReplacements(file, replacables) {
  const content = readFileSync(file, { encoding: 'utf8' });
  return new TextReader(!replacables.version ? content : content.replace('{{version}}', replacables.version));
}

async function addFilesRecursively(folder, replace, replacables, zipper) {
  if (existsSync(folder)) return;
  for (const fileObj of readdirSync(folder, { recursive: true, withFileTypes: true })) {
    if (!fileObj.isFile()) continue;
    const file = `${fileObj.parentPath}/${fileObj.name}`;
    const corrected = fileObj.parentPath.replace(folder, replace);
    await zipper.add(
      `${corrected ? `${corrected}/` : ''}${fileObj.name}`,
      ['.php', '.xml', '.ini', '.js', '.css'].includes(extname(fileObj.name)) ? applyReplacements(file, replacables) : new TextReader(readFileSync(file)),
    );
  }
}

async function packageExtensions() {
  if (!existsSync('src')) throw new Error('There are no extensions or media, please run build before linking...');

  for (const extensionType of readdirSync('src')) {
    if (['.', '..', '.DS_Store'].includes(extensionType)) continue;

    for (const extensionName of readdirSync(`src/${extensionType}`)) {
      if (['.', '..', '.DS_Store'].includes(extensionName)) continue;

      switch (extensionType) {
        case 'components': {
          if (existsSync(`src/${extensionType}/${extensionName}/administrator`)) throw Error('Components need the Administrator part!');
          const replacables = globalThis.options['joomla-extensions'].components.filter((x) => x.name === extensionName)?.[0];
          const zip = new ZipWriter(new BlobWriter('application/zip'));

          addFilesRecursively(`src/${extensionType}/${extensionName}/administrator`, 'administrator', replacables, zip);

          // Fix the path to the manifest
          const zipFs = new zip.fs.FS();
          for (const zipEntry of zipFs.children) {
            if (zipEntry.getFullname() === `administrator/${extensionName}.xml`) {
              zipEntry.moveTo(`${extensionName}.xml`);
            }
          }

          addFilesRecursively(`src/${extensionType}/${extensionName}/site`, 'site', replacables, zip);
          addFilesRecursively(`media/com_${extensionName}`, 'media', replacables, zip);

          zips.push({ name: `com_${extensionName}_v${replacables.version}.zip`, zip: zip });
          break;
        }
        case 'modules': {
          if (!globalThis.options['joomla-extensions'].modules[extensionName]) throw new Error(`package.json does't have entry for module ${extensionName}`);
          for (const actualModName of readdirSync(`src/${extensionType}/${extensionName}`)) {
            if (['.', '..', '.DS_Store'].includes(actualModName)) continue;
            const replacables = globalThis.options['joomla-extensions'].modules[extensionName].filter((x) => x.name === actualModName)?.[0];
            if (!replacables) throw new Error(`package.json does't have entry for module ${extensionName}`);
            const zip = new ZipWriter(new BlobWriter('application/zip'));
            addFilesRecursively(`src/${extensionType}/${extensionName}/${actualModName}`, '', replacables, zip);
            addFilesRecursively(`media/mod_${actualModName}`, 'media', replacables, zip);

            zips.push({ name: `mod_${extensionName}_${actualModName}_v${replacables.version}.zip`, zip: zip });

          }
          break;
        }
        case 'plugins': {
          if (!globalThis.options['joomla-extensions'].plugins[extensionName]) throw new Error(`package.json does't have entry for the plugin type ${extensionName}`);
          for (const plgName of readdirSync(`src/${extensionType}/${extensionName}`)) {
            if (['.', '..', '.DS_Store'].includes(plgName)) continue;
            const replacables = globalThis.options['joomla-extensions'].plugins[extensionName].filter((x) => x.name === plgName)?.[0];
            if (!replacables) throw new Error(`package.json does't have entry for the plugin ${plgName} of type ${extensionName}`);
            const zip = new ZipWriter(new BlobWriter('application/zip'));
            addFilesRecursively(`src/${extensionType}/${extensionName}/${plgName}`, '', replacables, zip);
            addFilesRecursively(`media/plg_${extensionName}_${plgName}`, 'media', replacables, zip);

            zips.push({ name: `plg_${extensionName}_${plgName}_v${replacables.version}.zip`, zip: zip });
          }
          break;
        }
        case 'libraries': {
          const replacables = globalThis.options['joomla-extensions'].libraries.filter((x) => x.name === extensionName)?.[0];
          const zip = new ZipWriter(new BlobWriter('application/zip'));
          addFilesRecursively(`src/${extensionType}/${extensionName}`, '', replacables, zip);
          addFilesRecursively(`media/lib_${extensionName}`, 'media', replacables, zip);

          zips.push({ name: `lib_${extensionType}_${extensionName}_v${replacables.version}.zip`, zip: zip });
          break;
        }
        case 'templates': {
          for (const actualTplName of readdirSync(`src/${extensionType}/${extensionName}`)) {
            if (['.', '..', '.DS_Store'].includes(actualTplName)) continue;
            const replacables = globalThis.options['joomla-extensions'].templates[extensionName][actualTplName].filter((x) => x.name === actualTplName)?.[0];
            const zip = new ZipWriter(new BlobWriter('application/zip'));
            addFilesRecursively(`src/${extensionType}/${extensionName}/${actualTplName}`, '', replacables, zip);
            addFilesRecursively(`media/${extensionType}/${extensionName}/${actualTplName}`, 'media', replacables, zip);

            zips.push({ name: `tpl_${extensionName}_${actualTplName}_v${replacables.version}.zip`, zip: zip });
          }
          break;
        }
        case 'package':
          break;
        default:
          break;
      }
    }
  }

  if (!existsSync('./packages')) mkdirSync('packages');
  if (existsSync('src/packages')) {
    mkdirSync('packages/packages');

    // @todo add packages support
    return;
  }

  for (const zipEntry of zips) {
    const blob = await zipEntry.zip.close();
    const arrayBuffer = await new Response(blob).arrayBuffer();
    writeFileSync(`./packages/${zipEntry.name}`, Buffer.from(arrayBuffer));
  }
}

export { packageExtensions };
