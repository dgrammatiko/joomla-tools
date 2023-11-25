import {
  existsSync,
  readdirSync,
  mkdirSync,
  symlinkSync,
  lstatSync
} from 'node:fs';
import { basename, dirname, sep, resolve } from 'path';
import jetpack from 'fs-jetpack';
import symlinkDir from 'symlink-dir';

function existsAlterSync(path) {
  try {
    lstatSync(path)
    return true
  } catch (err) {
    // if (err.code !== 'EEXIST') throw err
    return false
  }
}

async function symLink(path) {
  if (!existsSync('./media')) {
    mkdirSync('./media');
  }
  if (!existsSync('./src')) {
    console.error('There are no extensions or media, please run build before linking...');
    return Promise.reject();
  }

  for (const extensionType of readdirSync('./src')) {
    for (const extensionName of readdirSync(`./src/${extensionType}`)) {
      switch(extensionType) {
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
            symlinkDir(`./src/${extensionType}/${extensionName}/${actualModName}`, `./www/${extensionName === 'site' ? '' : 'administrator/'}modules/mod_${actualModName}`);
          }
          break;
        case 'plugins':
          for (const plgType of readdirSync(`./src/${extensionType}/${extensionName}`)) {
            for (const plgName of readdirSync(`./src/${extensionType}/${extensionName}/${plgType}`)) {
              symlinkDir(`./src/${extensionType}/${extensionName}/${plgType}/${plgName}`, `./www/plugins/${extensionName}/${plgType}/${plgName}`);
            }
          }
          break;
        case 'libraries':
          const xmls = jetpack.find(`./src/${extensionType}`, { matching: `${extensionName}/**/*.xml` });
          xmls.forEach((xml) => {
            const newPath = xml.replace(`src${sep}libraries`, `www${sep}administrator${sep}manifests${sep}libraries`);
            const skippedName = dirname(dirname(newPath));
            const xmlFileName = basename(newPath, '.xml');
            if (skippedName !== `www${sep}administrator${sep}manifests${sep}libraries` && !existsSync(skippedName)) {
              mkdirSync(skippedName, {recursive: true});
            }

            console.log({
              xml,
              newPath,
              skippedName,
              xmlFileName,
              x: `${skippedName}${sep}${xmlFileName}.xml`
            })
            if (!existsAlterSync(`${skippedName}${sep}${xmlFileName}.xml`)) symlinkSync(resolve(xml), `${skippedName}${sep}${xmlFileName}.xml`)
          });
          symlinkDir(`./src/${extensionType}/${extensionName}`, `./www/libraries/${extensionName}`);
          break;
        case 'templates':
          for (const actualTplName of readdirSync(`./src/${extensionType}/${extensionName}`)) {
            symlinkDir(`./src/${extensionType}/${extensionName}/${actualTplName}`, `./www/${extensionName === 'site' ? '' : 'administrator/'}templates/${actualTplName}`);
          }
          break;
        default:
          break;
      }
    }
  }

  if (existsSync('./media')) {
    readdirSync('./media').forEach((ext) => {
      if (ext !== 'templates') {
        symlinkDir(`${process.cwd()}/media/${ext}`, `./www/media/${ext}`);
      } else {
        if (existsSync('./media/templates/administrator')) {
          readdirSync('./media/templates/administrator').forEach((exta) => {
            if (!existsSync(`${process.cwd()}/media/templates/administrator/${exta}`)) mkdirSync(`${process.cwd()}/media/templates/administrator/${exta}`, { recursive: true });
            symlinkDir(`${process.cwd()}/media/templates/administrator/${exta}`, `./www/media/templates/administrator/${exta}`);
          });
        }
        if (existsSync('./media/templates/site')) {
          readdirSync('./media/templates/site').forEach((exta) => {
            if (!existsSync(`${process.cwd()}/media/templates/site/${exta}`)) mkdirSync(`${process.cwd()}/media/templates/site/${exta}`, { recursive: true });
            symlinkDir(`${process.cwd()}/media/templates/site/${exta}`, `./www/media/templates/site/${exta}`);
          });
        }
      }
    });
  }
};

export { symLink };
