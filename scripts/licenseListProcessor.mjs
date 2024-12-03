import {readFile, writeFile} from 'fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';

const silent = process.argv.includes('-silent');
function log(message) {
  if (!silent) {
    console.log(message);
  }
}

const prettyPrint = !process.argv.includes('-prod');

const dir = fileURLToPath(import.meta.url);
const currentDir = path.dirname(dir);
const parentDir = path.dirname(currentDir);

const rawData = await readFile(`${parentDir}/assets/data/licenses.json`);
const data = rawData.toString();

log('[LICENSELISTPROCESSOR] Cleaning up licenses list...');

const dataAsJSON = `[${data}]`.replaceAll('\n', ', ').replace(', ]', ']');

const object = JSON.parse(dataAsJSON);

const newArray = [];

object.forEach(license => {
  log(license.value);

  const packageArray = Object.keys(license.children).map(key => {
    // ignore workspace (the project itself)
    if (key !== 'rvmob@workspace:.') {
      log(key);

      // first pass covers most packages; second covers patched packagess
      const cleanedKey = key
        .replace(/(.)@(virtual:.*#)?npm:/, '$1@')
        .replace(/(.)@(patch|virtual:.*#)?patch:.*::version=(.*)&.*/, '$1@$3');
      log(cleanedKey);

      // split the package name by the @ symbol; the last entry will be the package version (e.g. @rexovolt/foo@1.2.3 -> ['', 'rexovolt/foo', '1.2.3'])
      const nameArray = cleanedKey.split('@');
      const version = nameArray[nameArray.length - 1];
      nameArray.pop();

      // rejoin the array of strings after removing the version
      const newKey = nameArray.join('@');

      const extraInfo = license.children[key].children;

      // remove "git+" and "git://" at the start of URLs - they usually link to GitHub repos, so in most cases this should be safe
      // also replace "git@github.com:" with "https://github.com"
      const newURL = extraInfo.url
        ?.replace(/^git\+/, '')
        .replace('git://', 'https://')
        .replace('git@github.com:', 'https//github.com/');
      const newPackageInfo = {name: newKey, version, ...extraInfo, url: newURL};

      return newPackageInfo;
    }
  });

  // otherwise we get an array with null as its only entry
  if (packageArray[0]) {
    newArray.push({license: license.value, packages: packageArray});
  }
});

const newData = JSON.stringify(newArray, null, prettyPrint ? 2 : 0);

log(newData);

await writeFile(`${parentDir}/assets/data/licenses.json`, newData);
