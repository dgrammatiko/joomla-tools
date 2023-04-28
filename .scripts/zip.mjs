import { readdirSync, existsSync, mkdirSync } from 'node:fs';
import admZip from 'adm-zip';
const zips = [];
let zip;

async function packageExtensions() {
  if (!existsSync('./src')) {
    throw new Error('There are no extensions or media, please run build before linking...');
  }

  for (const extensionType of readdirSync('./src')) {
    for (const extensionName of readdirSync(`./src/${extensionType}`)) {
      switch(extensionType) {
        case 'components':
          zip = new admZip();
          if (existsSync(`./src/${extensionType}/${extensionName}/administrator`)) {
            zip.addLocalFolder(`./src/${extensionType}/${extensionName}/administrator`, 'administrator', /^(?!\.DS_Store)/);
            const xml = zip.getEntry(`administrator/${extensionName}.xml`);
            zip.deleteEntry(`administrator/${extensionName}.xml`);
            zip.addFile(`${extensionName}.xml`, xml.getData())
          }
          if (existsSync(`./src/${extensionType}/${extensionName}/site`)) {
            zip.addLocalFolder(`./src/${extensionType}/${extensionName}/site`, 'site', /^(?!\.DS_Store)/);
          }
          if (existsSync(`./media/com_${extensionName}`)) {
            zip.addLocalFolder(`./media/com_${extensionName}`, 'media', /^(?!\.DS_Store)/);
          }
          if (existsSync(`./media/com_${extensionName}`)) {
            zip.addLocalFolder(`./media/com_${extensionName}`, 'media', /^(?!\.DS_Store)/);
          }
          zips.push({name: `com_${extensionName}.zip`, zip: zip });
          break;
        case 'modules':
          zip = new admZip();
          for (const actualModName of readdirSync(`./src/${extensionType}/${extensionName}`)) {
            zip.addLocalFolder(`./src/${extensionType}/${extensionName}/${actualModName}`, '', /^(?!\.DS_Store)/);
            if (existsSync(`./media/mod_${actualModName}`)) {
              zip.addLocalFolder(`./media/mod_${actualModName}`, 'media', /^(?!\.DS_Store)/);
            }
            zips.push({name: `mod_${extensionName}_${actualModName}.zip`, zip: zip });
          }
          break;
        case 'plugins':
          for (const plgName of readdirSync(`./src/${extensionType}/${extensionName}`)) {
            zip = new admZip();
            zip.addLocalFolder(`./src/${extensionType}/${extensionName}/${plgName}`, '', /^(?!\.DS_Store)/);
            if (existsSync(`./media/plg_${extensionName}_${plgName}`)) {
              zip.addLocalFolder(`./media/plg_${extensionName}_${plgName}`, 'media', /^(?!\.DS_Store)/);
            }
            zips.push({name: `plg_${extensionName}_${plgName}.zip`, zip: zip });
          }
          break;
        case 'libraries':
          zip = new admZip();
          zip.addLocalFolder(`./src/${extensionType}/${extensionName}`, '', /^(?!\.DS_Store)/);
          if (existsSync(`./media/lib_${extensionName}`)) {
            zip.addLocalFolder(`./media/lib_${extensionName}`, 'media', /^(?!\.DS_Store)/);
          }
          zips.push({name: `lib_${extensionType}_${extensionName}.zip`, zip: zip });
          break;
        case 'templates':
          for (const actualTplName of readdirSync(`./src/${extensionType}/${extensionName}`)) {
            zip = new admZip();
            zip.addLocalFolder(`./src/${extensionType}/${extensionName}/${actualTplName}`, '', /^(?!\.DS_Store)/);
            if (existsSync(`./media/${extensionType}/${extensionName}/${actualTplName}`)) {
              zip.addLocalFolder(`./media/${extensionType}/${extensionName}/${actualTplName}`, 'media', /^(?!\.DS_Store)/);
            }
            zips.push({name: `tpl_${extensionName}_${actualTplName}.zip`, zip: zip });
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

export {packageExtensions};
