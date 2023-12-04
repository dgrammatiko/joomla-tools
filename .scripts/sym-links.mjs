import { existsSync, readdirSync, mkdirSync, symlinkSync, lstatSync } from 'node:fs';
import { basename, dirname, sep, resolve } from 'path';
import fsJetpack from 'fs-jetpack';
const { find } = fsJetpack;

import symlinkDir from 'symlink-dir';

function existsAlterSync(path) {
  try {
    lstatSync(path);
    return true;
  } catch (err) {
    // if (err.code !== 'EEXIST') throw err
    return false;
  }
}

function linkPath(base, suffix) {
  if (!existsSync(`${process.cwd()}${base}${suffix}`)) {
    mkdirSync(`${process.cwd()}${base}${suffix}`, { recursive: true });
  }
  symlinkDir(`${process.cwd()}${base}${suffix}`, `./www${base}${suffix}`);
}

async function symLink(path) {
  if (!existsSync('./src')) {
    console.error('There are no extensions or media, please run build before linking...');
    return Promise.reject();
  }
  if (!existsSync('./media')) {
    mkdirSync('./media');
  }

  for (const extensionType of readdirSync('./src')) {
    for (const extensionName of readdirSync(`./src/${extensionType}`)) {
      switch (extensionType) {
        case 'components':
          if (existsSync(`./src/${extensionType}/${extensionName}/administrator`)) {
            symlinkDir(`./src/${extensionType}/${extensionName}/administrator`, `./www/administrator/${extensionType}/com_${extensionName}`);
          }
          if (existsSync(`./src/${extensionType}/${extensionName}/site`)) {
            symlinkDir(`./src/${extensionType}/${extensionName}/site`, `./www/${extensionType}/com_${extensionName}`);
          }
          break;
        case 'modules':
          for (const actualModName of readdirSync(`./src/${extensionType}/${extensionName}`)) {
            symlinkDir(
              `./src/${extensionType}/${extensionName}/${actualModName}`,
              `./www/${extensionName === 'site' ? '' : 'administrator/'}modules/mod_${actualModName}`,
            );
          }
          break;
        case 'plugins':
          for (const plgType of readdirSync(`./src/${extensionType}/${extensionName}`)) {
            for (const plgName of readdirSync(`./src/${extensionType}/${extensionName}/${plgType}`)) {
              symlinkDir(`./src/${extensionType}/${extensionName}/${plgType}/${plgName}`, `./www/plugins/${extensionName}/${plgType}/${plgName}`);
            }
          }
          break;
        case 'libraries': {
          const xmls = find(`./src/${extensionType}`, { matching: `${extensionName}/**/*.xml` });
          for (const xml of xmls) {
            const newPath = xml.replace(`src${sep}libraries`, `www${sep}administrator${sep}manifests${sep}libraries`);
            const skippedName = dirname(dirname(newPath));
            const xmlFileName = basename(newPath, '.xml');
            if (skippedName !== `www${sep}administrator${sep}manifests${sep}libraries` && !existsSync(skippedName)) {
              mkdirSync(skippedName, { recursive: true });
            }

            if (!existsAlterSync(`${skippedName}${sep}${xmlFileName}.xml`)) symlinkSync(resolve(xml), `${skippedName}${sep}${xmlFileName}.xml`);
          }
          symlinkDir(`./src/${extensionType}/${extensionName}`, `./www/libraries/${extensionName}`);
          break;
        }
        case 'templates':
          for (const actualTplName of readdirSync(`./src/${extensionType}/${extensionName}`)) {
            symlinkDir(
              `./src/${extensionType}/${extensionName}/${actualTplName}`,
              `./www/${extensionName === 'site' ? '' : 'administrator/'}templates/${actualTplName}`,
            );
          }
          break;
        default:
          break;
      }
    }
  }

  if (existsSync('./media')) {
    for (const ext of readdirSync('./media')) {
      if (ext !== 'templates') {
        symlinkDir(`${process.cwd()}/media/${ext}`, `./www/media/${ext}`);
      } else {
        if (existsSync('./media/templates/administrator')) {
          for (const pathName of readdirSync('./media/templates/administrator')) {
            linkPath('/media/templates/administrator/', pathName);
          }
        }
        if (existsSync('./media/templates/site')) {
          for (const pathName of readdirSync('./media/templates/site')) {
            linkPath('/media/templates/site/', pathName);
          }
        }
      }
    }
  }
}

export { symLink };
