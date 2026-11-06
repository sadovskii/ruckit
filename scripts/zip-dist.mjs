// Packs dist/<browser> into dist/zip-<browser>/<browser>-<version>.zip for uploading to a store.
// Usage: node scripts/zip-dist.mjs <browser>
import AdmZip from 'adm-zip';
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const browser = process.argv[2];
const validBrowsers = ['chrome', 'edge', 'firefox', 'opera'];
if (!validBrowsers.includes(browser)) {
  console.error(`Usage: node scripts/zip-dist.mjs <${validBrowsers.join('|')}>`);
  process.exit(1);
}

const buildFolder = join('dist', browser);
const manifestPath = join(buildFolder, 'manifest.json');
if (!existsSync(manifestPath)) {
  console.error(`"${manifestPath}" not found. Build the extension first: npm run build:${browser}`);
  process.exit(1);
}

const { version } = JSON.parse(readFileSync(manifestPath, 'utf8'));
const zipFolder = join('dist', `zip-${browser}`);
const zipPath = join(zipFolder, `${browser}-${version}.zip`);

mkdirSync(zipFolder, { recursive: true });
// Rebuilding the same version replaces its archive; other versions are kept.
rmSync(zipPath, { force: true });

const zip = new AdmZip();
zip.addLocalFolder(buildFolder);
zip.writeZip(zipPath);

console.log(`Created ${zipPath}`);
