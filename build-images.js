const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const QUALITY = 90;
const SKIP_DIRS = ['node_modules', '.git', '.cursor', '.claude', 'cursor'];

async function findPngs(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const e of entries) {
    if (SKIP_DIRS.includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files = files.concat(await findPngs(full));
    else if (e.name.endsWith('.png')) files.push(full);
  }
  return files;
}

async function convert(src) {
  const dest = src.replace(/\.png$/, '.webp');
  const srcStat = fs.statSync(src);
  if (fs.existsSync(dest) && fs.statSync(dest).mtimeMs >= srcStat.mtimeMs) return null;
  await sharp(src).webp({ quality: QUALITY }).toFile(dest);
  const destStat = fs.statSync(dest);
  const saved = ((1 - destStat.size / srcStat.size) * 100).toFixed(0);
  return { src: path.relative(process.cwd(), src), saved: `${saved}%` };
}

(async () => {
  const root = path.dirname(__filename);
  const pngs = await findPngs(root);
  if (!pngs.length) { console.log('No PNGs found.'); return; }
  console.log(`Found ${pngs.length} PNG(s). Converting…\n`);
  let converted = 0;
  for (const p of pngs) {
    const result = await convert(p);
    if (result) { console.log(`  ✓ ${result.src}  (${result.saved} smaller)`); converted++; }
  }
  console.log(converted ? `\nDone — ${converted} image(s) converted.` : '\nAll WebP files already up to date.');
})();
