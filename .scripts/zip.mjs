import { readdirSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import admZip from 'adm-zip';
import { getPackage } from './utils/getPackage.mjs';

const noRootPath = `templates/site/starter`;
const { version } = getPackage();
const zippper = new admZip();

export async function zip() {
  readdirSync(`${process.cwd()}/src/${noRootPath}`, { withFileTypes: true }).filter(item => !/(^|\/)\.[^/.]/g.test(item.name)).forEach(file => {
    if (file.isDirectory()) {
      zippper.addLocalFolder(`src/${noRootPath}/${file.name}`, file.name, /^(?!\.DS_Store)/);
    } else if (!file.name.endsWith('templateDetails.xml')) {
      zippper.addLocalFile(`src/${noRootPath}/${file.name}`, false);
    } else {
      let xml = readFileSync(`src/${noRootPath}/${file.name}`, { encoding: 'utf8' });
      xml = xml.replace(/{{version}}/g, version);
      zippper.addFile('templateDetails.xml', xml);
    }
  });

  readdirSync(`${process.cwd()}/media/${noRootPath}`, { withFileTypes: true }).filter(item => !/(^|\/)\.[^/.]/g.test(item.name)).forEach(file => {
    if (file.isDirectory()) {
      zippper.addLocalFolder(`${process.cwd()}/media/${noRootPath}/${file.name}`, `media/${file.name}`, /^(?!\.DS_Store)/);
    } else {
      zippper.addLocalFile(`${process.cwd()}/media/${noRootPath}/${file.name}`, false);
    }
  });

  if (!existsSync('./dist')) mkdirSync('dist');
  zippper.writeZip(`dist/tpl_starter_${version}.zip`, zippper.data);
};
