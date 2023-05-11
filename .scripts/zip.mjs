import { readdirSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import jetpack from 'fs-jetpack';
import admZip from 'adm-zip';
const zips = [];
let zip, replacables;

function applyReplacements(file, replacables) {
  const content = readFileSync(file, { encoding: 'utf8'});
  return !replacables.version ? content : content.replace('{{version}}', replacables.version);
}

async function addFilesRecursively(folder, { base: base, replace: replace }, replacables, zipper) {
  jetpack.find(folder).forEach((file) => zipper.addFile(file.replace(base, replace), applyReplacements(file, replacables)));
}

export async function packageExtensions() {
  if (!existsSync('./src')) {
    throw new Error('There are no extensions or media, please run build before linking...');
  }

  const options = globalThis.options;

  for (const extensionType of readdirSync('./src')) {
    for (const extensionName of readdirSync(`./src/${extensionType}`)) {
      switch(extensionType) {
        case 'components':
          replacables = options['joomla-extensions'].components.filter((x) => x.name === extensionName)[0];
          zip = new admZip();
          if (existsSync(`./src/${extensionType}/${extensionName}/administrator`)) {
            addFilesRecursively(`./src/${extensionType}/${extensionName}/administrator`, {base: `src/${extensionType}/${extensionName}/administrator`, replace: 'administrator'}, replacables, zip);
            const xml = zip.getEntry(`administrator/${extensionName}.xml`);
            zip.deleteEntry(`administrator/${extensionName}.xml`);
            zip.addFile(`${extensionName}.xml`, xml.getData())
          }
          if (existsSync(`./src/${extensionType}/${extensionName}/site`)) {
            addFilesRecursively(`./src/${extensionType}/${extensionName}/site`, {base: `src/${extensionType}/${extensionName}/site`, replace: 'site'}, replacables, zip);
          }
          if (existsSync(`./media/com_${extensionName}`)) {
            addFilesRecursively(`./media/com_${extensionName}`, {base: `media/com_${extensionName}`, replace: 'media'}, replacables, zip);
          }
          zips.push({name: `com_${extensionName}_v${replacables.version}.zip`, zip: zip });
          break;
        case 'modules':
          for (const actualModName of readdirSync(`./src/${extensionType}/${extensionName}`)) {
            replacables = options['joomla-extensions'].modules[extensionName].filter((x) => x.name === actualModName)[0];
            zip = new admZip();
            addFilesRecursively(`./src/${extensionType}/${extensionName}/${actualModName}`, {base: `src/${extensionType}/${extensionName}/${actualModName}`, replace: ''}, replacables, zip);
            if (existsSync(`./media/mod_${actualModName}`)) {
              addFilesRecursively(`./media/mod_${actualModName}`, {base: `media/mod_${actualModName}`, replace: 'media'}, replacables, zip);
            }
            zips.push({name: `mod_${extensionName}_${actualModName}_v${replacables.version}.zip`, zip: zip });
          }
          break;
        case 'plugins':
          for (const plgName of readdirSync(`./src/${extensionType}/${extensionName}`)) {
            replacables = options['joomla-extensions'].plugins.filter((x) => x.name === extensionName)[0];
            zip = new admZip();
            addFilesRecursively(`./src/${extensionType}/${extensionName}/${plgName}`, {base: `src/${extensionType}/${extensionName}/${plgName}`, replace: ''}, replacables, zip);
            if (existsSync(`./media/plg_${extensionName}_${plgName}`)) {
              addFilesRecursively(`./media/plg_${extensionName}_${plgName}`, {base: `media/plg_${extensionName}_${plgName}`, replace: 'media'}, replacables, zip);
            }
            zips.push({name: `plg_${extensionName}_${plgName}_v${replacables.version}.zip`, zip: zip });
          }
          break;
        case 'libraries':
          replacables = options['joomla-extensions'].libraries.filter((x) => x.name === extensionName)[0];
          zip = new admZip();
          addFilesRecursively(`./src/${extensionType}/${extensionName}`, {base: `src/${extensionType}/${extensionName}`, replace: ''}, replacables, zip);
          if (existsSync(`./media/lib_${extensionName}`)) {
            addFilesRecursively(`./media/lib_${extensionName}`, {base: `media/lib_${extensionName}`, replace: 'media'}, replacables, zip);
          }
          zips.push({name: `lib_${extensionType}_${extensionName}_v${replacables.version}.zip`, zip: zip });
          break;
        case 'templates':
          for (const actualTplName of readdirSync(`./src/${extensionType}/${extensionName}`)) {
            replacables = options['joomla-extensions'].templates[extensionName].filter((x) => x.name === actualTplName)[0];
            zip = new admZip();
            addFilesRecursively(`./src/${extensionType}/${extensionName}/${actualTplName}`, {base: `src/${extensionType}/${extensionName}/${actualTplName}`, replace: ''}, replacables, zip);
            if (existsSync(`./media/${extensionType}/${extensionName}/${actualTplName}`)) {
              addFilesRecursively(`./media/${extensionType}/${extensionName}/${actualTplName}`, {base: `media/${extensionType}/${extensionName}/${actualTplName}`, replace: 'media'}, replacables, zip);
            }
            zips.push({name: `tpl_${extensionName}_${actualTplName}_v${replacables.version}.zip`, zip: zip });
          }
          break;
        default:
          break;
      }
    }
  }

  if (!existsSync('./packages')) mkdirSync('packages');
  for (const zipEntry of zips) {
    zipEntry.zip.writeZip(`./packages/${zipEntry.name}`, zipEntry.zip.data);
  }
};

