// Small WebP thumbnails of the article covers, for the "More build stories" cards.
//
// A cover is about half a megabyte, and every article lists eleven others: drawing the covers
// themselves would put five megabytes under every story. A 600 x 300 WebP is about thirty KB.
//
// There are no image libraries here, so a headless Edge or Chrome does the scaling: one page draws
// every cover onto a canvas and hands the WebP back. A thumbnail is named after its cover's hash,
// so it is made once, kept in src/thumbs/, and made again only when the cover itself changes.
// Without a browser the build carries on with the full covers and says so.
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const THUMB_W = 600;
export const THUMB_H = 300;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const findBrowser = () => [
  process.env.BROWSER,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
].find((p) => p && fs.existsSync(p));

/**
 * covers: [{ slug, file }] -> { slug: name in dir } for every thumbnail that exists afterwards,
 * plus the slugs that could not get one.
 */
export async function ensureThumbs(covers, dir) {
  fs.mkdirSync(dir, { recursive: true });
  const want = covers.map(({ slug, file }) => {
    const hash = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 10);
    return { slug, file, name: `${slug}-${hash}.webp` };
  });
  const missing = want.filter((w) => !fs.existsSync(path.join(dir, w.name)));
  let failed = [];
  if (missing.length) {
    const browser = findBrowser();
    if (!browser) failed = missing.map((m) => m.slug);
    else {
      const made = await render(browser, missing);
      for (const m of missing) {
        if (made[m.slug]) fs.writeFileSync(path.join(dir, m.name), Buffer.from(made[m.slug], 'base64'));
        else failed.push(m.slug);
      }
    }
  }
  // a cover that changed leaves its old thumbnail behind; only the current one is kept
  const keep = new Set(want.map((w) => w.name));
  const slugs = new Set(want.map((w) => w.slug));
  for (const f of fs.readdirSync(dir)) {
    const slug = f.replace(/-[0-9a-f]{10}\.webp$/, '');
    if (slugs.has(slug) && !keep.has(f)) fs.rmSync(path.join(dir, f));
  }
  const names = Object.fromEntries(want.filter((w) => fs.existsSync(path.join(dir, w.name))).map((w) => [w.slug, w.name]));
  return { names, failed, made: missing.length - failed.length };
}

/** Browser.close over the browser's own DevTools endpoint; quiet if it is already gone. */
async function closeBrowser(port) {
  try {
    const { webSocketDebuggerUrl } = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
    const bws = new WebSocket(webSocketDebuggerUrl);
    await new Promise((ok, no) => { bws.onopen = ok; bws.onerror = no; });
    const gone = new Promise((ok) => { bws.onclose = ok; setTimeout(ok, 3000); });
    bws.send(JSON.stringify({ id: 1, method: 'Browser.close' }));
    await gone;
  } catch {}
}

async function render(browser, list) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'thumbs-'));
  const profile = path.join(tmp, 'profile');
  // Edge on Windows prints nothing back from --dump-dom, so the page is driven over the DevTools
  // protocol instead (Node's own WebSocket, no packages)
  const proc = spawn(browser, ['--headless=new', '--disable-gpu', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
  const out = {};
  let ws, port;
  try {
    const portFile = path.join(profile, 'DevToolsActivePort');
    for (let i = 0; i < 150 && !fs.existsSync(portFile); i++) await sleep(100);
    port = fs.readFileSync(portFile, 'utf8').trim().split(/\s+/)[0];
    let page;
    for (let i = 0; i < 50 && !page; i++) {
      page = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page');
      if (!page) await sleep(100);
    }
    ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((ok, no) => { ws.onopen = ok; ws.onerror = no; });
    let id = 0;
    const pending = new Map();
    ws.onmessage = (e) => { const m = JSON.parse(e.data); pending.get(m.id)?.(m); pending.delete(m.id); };
    const evaluate = (expression) => new Promise((ok) => {
      pending.set(++id, ok);
      ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
    });
    for (const m of list) {
      const png = fs.readFileSync(m.file).toString('base64');
      const r = await evaluate(`(async () => {
        const im = new Image(); im.src = 'data:image/png;base64,${png}'; await im.decode();
        const c = document.createElement('canvas'); c.width = ${THUMB_W}; c.height = ${THUMB_H};
        const x = c.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
        x.drawImage(im, 0, 0, c.width, c.height);
        return c.toDataURL('image/webp', 0.82);
      })()`);
      const url = r.result?.result?.value;
      if (typeof url === 'string' && url.startsWith('data:image/webp;base64,')) out[m.slug] = url.split(',')[1];
    }
  } catch (e) {
    // whatever was made is kept; the rest are reported as missing, with the reason
    console.log(`thumbnails: ${browser} failed: ${e.message}`);
  } finally {
    try { ws?.close(); } catch {}
    // Edge on Windows hands its work to child processes, so killing the one we spawned can leave
    // the rest running headless all day (found on 2026-10-08: two copies, half an hour of CPU).
    // Asking the browser itself to close takes every process with it; the kill is the fallback.
    if (port) await closeBrowser(port);
    proc.kill();
    await sleep(300);
    // the browser can still be letting go of its profile; a leftover temp folder is harmless
    try { fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 }); } catch {}
  }
  return out;
}
