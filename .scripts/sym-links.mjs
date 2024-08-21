import { existsSync, readdirSync, mkdirSync, symlinkSync, lstatSync } from 'node:fs';
import { basename, dirname, sep, resolve } from 'node:path';
import os from 'node:os';
import jetpack from 'fs-jetpack';
import symlinkDir from 'symlink-dir';

/**
 * @param {String} path
 * @returns
 */
function existsAlterSync(path) {
  try {
    lstatSync(path);
    return true;
  } catch (err) {
    // if (err.code !== 'EEXIST') throw err
    return false;
  }
}

function isWin() {
  return os.platform() === 'win32';
}

/**
 * @param {String} path
 * @returns
 */
async function symLink(path = './src') {
  if (!existsSync('./media')) {
    mkdirSync('./media');
  }
  if (!existsSync(path)) {
    throw new Error('There are no extensions or media, please run build before linking...');
  }

  for (const extensionType of readdirSync(path)) {
    if (extensionType === '.DS_Store') return;
    for (const extensionName of readdirSync(`./src/${extensionType}`)) {
      if (extensionName === '.DS_Store') return;
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
            if (actualModName === '.DS_Store') return;
            symlinkDir(`./src/${extensionType}/${extensionName}/${actualModName}`, `./www/${extensionName === 'site' ? '' : 'administrator/'}modules/mod_${actualModName}`);
          }
          break;
        case 'plugins':
          for (const plgType of readdirSync(`./src/${extensionType}/${extensionName}`)) {
            if (plgType === '.DS_Store') return;
            for (const plgName of readdirSync(`./src/${extensionType}/${extensionName}/${plgType}`)) {
              if (plgName === '.DS_Store') return;
              symlinkDir(`./src/${extensionType}/${extensionName}/${plgType}/${plgName}`, `./www/plugins/${extensionName}/${plgType}/${plgName}`);
            }
          }
          break;
        case 'libraries': {
          const xmls = jetpack.find(`./src/${extensionType}`, {
            matching: `${extensionName}/**/*.xml`,
          });
          for (const xml of xmls) {
            const newPath = xml.replace(`src${sep}libraries`, `www${sep}administrator${sep}manifests${sep}libraries`);
            const skippedName = dirname(dirname(newPath));
            const xmlFileName = basename(newPath, '.xml');
            if (skippedName !== `www${sep}administrator${sep}manifests${sep}libraries` && !existsSync(skippedName)) {
              mkdirSync(skippedName, { recursive: true });
            }
            if (!existsAlterSync(`${skippedName}/${xmlFileName}.xml`)) {
              symlinkSync(resolve(xml), `${skippedName}/${xmlFileName}.xml`, isWin() ? 'junction' : 'file');
            }
          }
          symlinkDir(resolve(`./src/${extensionType}/${extensionName}`), resolve(`./www/libraries/${extensionName}`));
          break;
        }
        case 'templates':
          for (const actualTplName of readdirSync(`./src/${extensionType}/${extensionName}`)) {
            if (actualTplName === '.DS_Store') return;
            symlinkDir(`./src/${extensionType}/${extensionName}/${actualTplName}`, `./www/${extensionName === 'site' ? '' : 'administrator/'}templates/${actualTplName}`);
          }
          break;
        default:
          break;
      }
    }
  }

  if (existsSync('./media')) {
    const mediaContent = readdirSync('./media');
    for (const ext of mediaContent) {
      if (ext !== 'templates' && ext !== '.DS_Store') {
        symlinkDir(`${process.cwd()}/media/${ext}`, `./www/media/${ext}`);
      } else {
        if (existsSync('./media/templates/administrator')) {
          const adminTmpl = readdirSync('./media/templates/administrator');
          for (const exta of adminTmpl) {
            if (exta === '.DS_Store') return;
            if (!existsSync(`${process.cwd()}/media/templates/administrator/${exta}`)) mkdirSync(`${process.cwd()}/media/templates/administrator/${exta}`, { recursive: true });
            symlinkDir(`${process.cwd()}/media/templates/administrator/${exta}`, `./www/media/templates/administrator/${exta}`);
          }
        }
        if (existsSync('./media/templates/site')) {
          const siteTmpl = readdirSync('./media/templates/site');
          for (const exta of siteTmpl) {
            if (exta === '.DS_Store') return;
            if (!existsSync(`${process.cwd()}/media/templates/site/${exta}`))
              mkdirSync(`${process.cwd()}/media/templates/site/${exta}`, {
                recursive: true,
              });
            symlinkDir(`${process.cwd()}/media/templates/site/${exta}`, `./www/media/templates/site/${exta}`);
          }
        }
      }
    }
  }
}

export { symLink };
