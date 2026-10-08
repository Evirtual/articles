// Renders cover.html into the article's two cover PNGs with headless Edge (or Chrome):
//   node articles/css-3d-lab-shapes/cover/render.mjs
// Run `node build.mjs` once first so docs/assets/fonts holds DM Sans.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const browser = [
  process.env.BROWSER,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].find((p) => p && fs.existsSync(p));
if (!browser) throw new Error('No Edge or Chrome found; set BROWSER to one');

for (const [variant, w, h] of [['medium', 1500, 750], ['linkedin', 1920, 1080]]) {
  const out = path.join(here, '..', `cover-${variant}-${w}x${h}.png`);
  // a fresh profile per shot: a second run on the same profile can find it still locked and exit
  // without writing anything
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cover-'));
  execFileSync(browser, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', `--user-data-dir=${profile}`,
    `--window-size=${w},${h}`, '--virtual-time-budget=3000', `--screenshot=${out}`, `${pathToFileURL(path.join(here, 'cover.html')).href}#${variant}`], { stdio: 'ignore' });
  const b = fs.readFileSync(out);
  console.log(`${path.basename(out)}: ${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`);
}
