import fs from 'node:fs';
import Path from 'node:path';
import os from 'node:os';
import jetpack from 'fs-jetpack';
import symlinkDir from 'symlink-dir';

/**
 * @param {String} path
 * @returns
 */
function existsAlterSync(path) {
  try {
    fs.lstatSync(path);
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
  if (!fs.existsSync('./media')) {
    fs.mkdirSync('./media');
  }
  if (!fs.existsSync(path)) {
    throw new Error('There are no extensions or media, please run build before linking...');
  }

  for (const extensionType of fs.readdirSync(path)) {
    if (extensionType === '.DS_Store') return;
    for (const extensionName of fs.readdirSync(`./src/${extensionType}`)) {
      if (extensionName === '.DS_Store') return;
      switch (extensionType) {
        case 'components':
          if (fs.existsSync(`./src/${extensionType}/${extensionName}/administrator`)) {
            symlinkDir(`./src/${extensionType}/${extensionName}/administrator`, `./www/administrator/${extensionType}/com_${extensionName}`);
          }
          if (fs.existsSync(`./src/${extensionType}/${extensionName}/site`)) {
            symlinkDir(`./src/${extensionType}/${extensionName}/site`, `./www/${extensionType}/com_${extensionName}`);
          }
          break;
        case 'modules':
          for (const actualModName of fs.readdirSync(`./src/${extensionType}/${extensionName}`)) {
            if (actualModName === '.DS_Store') return;
            symlinkDir(`./src/${extensionType}/${extensionName}/${actualModName}`, `./www/${extensionName === 'site' ? '' : 'administrator/'}modules/mod_${actualModName}`);
          }
          break;
        case 'plugins':
          for (const plgType of fs.readdirSync(`./src/${extensionType}/${extensionName}`)) {
            if (plgType === '.DS_Store') return;
            for (const plgName of fs.readdirSync(`./src/${extensionType}/${extensionName}/${plgType}`)) {
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
            const newPath = xml.replace(`src${Path.sep}libraries`, `www${Path.sep}administrator${Path.sep}manifests${Path.sep}libraries`);
            const skippedName = Path.dirname(Path.dirname(newPath));
            const xmlFileName = Path.basename(newPath, '.xml');
            if (skippedName !== `www${Path.sep}administrator${Path.sep}manifests${Path.sep}libraries` && !fs.existsSync(skippedName)) {
              fs.mkdirSync(skippedName, { recursive: true });
            }
            if (!existsAlterSync(`${skippedName}/${xmlFileName}.xml`)) {
              fs.symlinkSync(Path.resolve(xml), `${skippedName}/${xmlFileName}.xml`, isWin() ? 'junction' : 'file');
            }
          }
          symlinkDir(Path.resolve(`src/${extensionType}/${extensionName}`), Path.resolve(`www/libraries/${extensionName}`));
          break;
        }
        case 'templates':
          for (const actualTplName of fs.readdirSync(`./src/${extensionType}/${extensionName}`)) {
            if (actualTplName === '.DS_Store') return;
            symlinkDir(`src/${extensionType}/${extensionName}/${actualTplName}`, `www/${extensionName === 'site' ? '' : 'administrator/'}templates/${actualTplName}`);
          }
          break;
        default:
          break;
      }
    }
  }

  if (fs.existsSync('./media')) {
    for (const ext of fs.readdirSync('./media')) {
      if (ext !== 'templates' && ext !== '.DS_Store') {
        symlinkDir(`${process.cwd()}/media/${ext}`, `./www/media/${ext}`);
      } else {
        if (fs.existsSync('./media/templates/administrator')) {
          const adminTmpl = fs.readdirSync('./media/templates/administrator');
          for (const exta of adminTmpl) {
            if (exta === '.DS_Store') return;
            if (!fs.existsSync(`${process.cwd()}/media/templates/administrator/${exta}`)) fs.mkdirSync(`${process.cwd()}/media/templates/administrator/${exta}`, { recursive: true });
            symlinkDir(`${process.cwd()}/media/templates/administrator/${exta}`, `./www/media/templates/administrator/${exta}`);
          }
        }
        if (fs.existsSync('./media/templates/site')) {
          const siteTmpl = fs.readdirSync('./media/templates/site');
          for (const exta of siteTmpl) {
            if (exta === '.DS_Store') return;
            if (!fs.existsSync(`${process.cwd()}/media/templates/site/${exta}`))
              fs.mkdirSync(`${process.cwd()}/media/templates/site/${exta}`, {
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
