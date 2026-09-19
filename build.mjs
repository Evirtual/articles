// Builds the static articles site into docs/:  node build.mjs
//
// Reads the three article folders that sit next to this one on the Desktop (article.md, images,
// share texts, and the existing copy page for alt text, captions and "Before you publish" notes),
// and writes plain HTML, CSS and JS with relative links, ready for GitHub Pages "deploy from /docs".
// No dependencies. The source folders are only read, never written.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const DOCS = path.join(here, 'docs');
const desktop = path.dirname(here);

// --- the articles -----------------------------------------------------------------------------
// `date` is the date article.md was last written (its file date), labelled "Written" on the site,
// because Medium's publish dates could not be read from here. Set `published` to the Medium date
// (YYYY-MM-DD) to show "Published" instead.
const ARTICLES = [
  {
    slug: 'css-3d-lab',
    dir: path.join(desktop, 'css-3d-lab-article'),
    sourceHtml: 'css-3d-lab-article.html',
    medium: '',
    date: '2026-09-19',
    published: '',
    kicker: '18–19 Sep 2026 · 135 models',
    coverInCopy: true,
    fontsLink: '',
  },
  {
    slug: 'self-aware-writing',
    dir: path.join(desktop, 'selfawarewriting-article'),
    sourceHtml: 'self-aware-writing-article.html',
    medium: 'https://medium.com/@edgarasneverdauskas/a-book-that-knows-youre-reading-it-ef41561ae846',
    date: '2026-09-17',
    published: '',
    kicker: '19 Aug – 15 Sep 2026 · 4 chapters',
    coverInCopy: true,
    // Same as the source build: the numbers card goes after the Codex paragraph, and the last
    // paragraph is set in italics; plain mentions of the book's site become links.
    numbersAfter: /^\*\*Codex\*\*/,
    closeEm: true,
    autolink: [['selfawarewriting.com', 'https://selfawarewriting.com']],
    fontsLink: '',
  },
  {
    slug: 'jarvis',
    dir: path.join(desktop, 'jarvis-article'),
    sourceHtml: 'five-days-jarvis.html',
    medium: 'https://medium.com/@edgarasneverdauskas/five-days-building-j-a-r-v-i-s-with-claude-0533b1953060',
    date: '2026-09-14',
    published: '',
    kicker: '10–14 Sep 2026 · 39 hours',
    // The JARVIS copy page marks only the numbers card inside the copied article.
    coverInCopy: false,
    // The source page's captions here are working labels ("Upload it here…"), not reader captions,
    // so these two are written for the site. Alt texts stay verbatim from the source page.
    captions: {
      'cover-medium-1500x750.png': 'J.A.R.V.I.S. on the PC, with example threads on the board. Image and app: Edgaras Neverdauskas.',
      'cover-linkedin-1920x1080.png': 'J.A.R.V.I.S. on the PC, with example threads on the board. Image and app: Edgaras Neverdauskas.',
      'numbers-1400.png': 'Five days, counted from the session logs and git history: what I put in, and what the models did with it.',
    },
    fontsLink: 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Serif:ital,wght@0,400;0,600;1,400&display=swap',
  },
];
const AUTHOR = 'Edgaras Neverdauskas';
const IMAGE_LABELS = {
  'cover-medium-1500x750.png': 'Medium cover',
  'cover-linkedin-1920x1080.png': 'LinkedIn cover',
  'numbers-1400.png': 'Numbers card',
};
const SHARE_FILES = [
  ['linkedin-post.txt', 'LinkedIn post'],
  ['facebook-post.txt', 'Facebook post'],
  ['x-post.txt', 'X post'],
];

// --- colours: one token set per page and mode, checked for contrast at build time --------------
const TOKENS = {
  index: {
    light: { bg: '#f5f4f0', surface: '#ffffff', surface2: '#ecebe5', text: '#2b2b31', strong: '#111114', muted: '#5c5c66', line: '#dddcd4', link: '#3b37b0', accent: '#3b37b0', accent2: '#5c5c66', btnBg: '#1c1c22', btnText: '#ffffff', focus: '#3b37b0', frame: '#0c0d11',
      accJarvis: '#00687a', accSaw: '#85601f', accCss: '#5b36e8' },
    dark: { bg: '#0e0f13', surface: '#16171d', surface2: '#1f2129', text: '#c9cad3', strong: '#f1f1f5', muted: '#9a9ca9', line: '#2a2c35', link: '#aeabff', accent: '#aeabff', accent2: '#9a9ca9', btnBg: '#ecebf5', btnText: '#111114', focus: '#aeabff', frame: '#000000',
      accJarvis: '#6ff0ff', accSaw: '#d6a24a', accCss: '#a58eff' },
  },
  jarvis: {
    light: { bg: '#eaf1f4', surface: '#ffffff', surface2: '#e0ebf0', text: '#22343d', strong: '#0b1a21', muted: '#4a6270', line: '#c5d8e0', link: '#00687a', accent: '#00687a', accent2: '#8f4f00', btnBg: '#00687a', btnText: '#ffffff', focus: '#00687a', frame: '#04080d', grid: 'rgb(0 104 122 / 7%)' },
    dark: { bg: '#04080d', surface: '#0a141d', surface2: '#0f1f2b', text: '#a9c3ce', strong: '#e2f6fb', muted: '#7299a8', line: '#17394b', link: '#6ff0ff', accent: '#6ff0ff', accent2: '#ffb648', btnBg: '#6ff0ff', btnText: '#04080d', focus: '#6ff0ff', frame: '#04080d', grid: 'rgb(111 240 255 / 4.5%)' },
  },
  'self-aware-writing': {
    light: { bg: '#f7f2e7', surface: '#fffdf7', surface2: '#efe7d4', text: '#2b2924', strong: '#1a1a17', muted: '#67625a', line: '#e0d7c3', link: '#7f5b1c', accent: '#8a6220', accent2: '#7f5b1c', btnBg: '#c8922e', btnText: '#1a1a17', focus: '#8a6220', frame: '#0c0c0d' },
    dark: { bg: '#0c0c0d', surface: '#151517', surface2: '#1d1d20', text: '#d9d3c7', strong: '#f3ede1', muted: '#9a958b', line: '#2c2b28', link: '#dcaa52', accent: '#c8922e', accent2: '#d6a24a', btnBg: '#c8922e', btnText: '#0c0c0d', focus: '#d6a24a', frame: '#0c0c0d' },
  },
  'css-3d-lab': {
    light: { bg: '#f3f4fc', surface: '#ffffff', surface2: '#e9ebfa', text: '#2a2e48', strong: '#14172b', muted: '#575c7d', line: '#dcdff2', link: '#5632e6', accent: '#6a45f5', accent2: '#0a7a71', btnBg: '#6a45f5', btnBg2: '#c42a76', btnText: '#ffffff', focus: '#5632e6', frame: '#0b0d18', dot: 'rgb(20 23 43 / 13%)', glowA: 'rgb(139 108 255 / 14%)', glowB: 'rgb(255 77 157 / 9%)' },
    dark: { bg: '#0b0d18', surface: '#121528', surface2: '#1a1e38', text: '#c9cce6', strong: '#eceefb', muted: '#9296bb', line: '#272b48', link: '#ab97ff', accent: '#8b6cff', accent2: '#2ee6d6', btnBg: '#6a45f5', btnBg2: '#c42a76', btnText: '#ffffff', focus: '#2ee6d6', frame: '#0b0d18', dot: 'rgb(255 255 255 / 9%)', glowA: 'rgb(139 108 255 / 20%)', glowB: 'rgb(255 77 157 / 13%)' },
  },
};
// Text pairs that must reach 4.5:1 (WCAG AA for body text).
const PAIRS = [
  ['text', 'bg'], ['text', 'surface'], ['text', 'surface2'], ['strong', 'bg'], ['strong', 'surface'], ['strong', 'surface2'],
  ['muted', 'bg'], ['muted', 'surface'], ['muted', 'surface2'], ['link', 'bg'], ['link', 'surface'],
  ['accent2', 'bg'], ['accent2', 'surface'], ['btnText', 'btnBg'], ['btnText', 'btnBg2'], ['bg', 'strong'],
  ['accJarvis', 'surface'], ['accSaw', 'surface'], ['accCss', 'surface'],
];
const lum = (hex) => {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const contrastReport = [];
for (const [page, modes] of Object.entries(TOKENS)) {
  for (const [mode, t] of Object.entries(modes)) {
    for (const [fg, bg] of PAIRS) {
      if (!t[fg] || !t[bg]) continue;
      const r = ratio(t[fg], t[bg]);
      contrastReport.push({ page, mode, pair: `${fg}/${bg}`, ratio: +r.toFixed(2) });
      if (r < 4.5) throw new Error(`Contrast ${page} ${mode} ${fg} ${t[fg]} on ${bg} ${t[bg]} is ${r.toFixed(2)}:1, below 4.5:1`);
    }
  }
}
const minRatio = contrastReport.reduce((m, r) => (r.ratio < m.ratio ? r : m));

const cssVars = (t) => Object.entries(t).map(([k, v]) => `--${k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}: ${v};`).join(' ');
const tokenCss = Object.entries(TOKENS).map(([page, { light, dark }]) => {
  const sel = `:root[data-page="${page}"]`;
  return `${sel} { color-scheme: light; ${cssVars(light)} }
@media (prefers-color-scheme: dark) { ${sel}:not([data-theme="light"]) { color-scheme: dark; ${cssVars(dark)} } }
${sel}[data-theme="dark"] { color-scheme: dark; ${cssVars(dark)} }`;
}).join('\n');

// --- helpers ----------------------------------------------------------------------------------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => esc(s).replace(/"/g, '&quot;');
const decode = (s) => String(s ?? '').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const stripTags = (s) => decode(String(s).replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
const pngSize = (file) => { const b = fs.readFileSync(file); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };
const num = (n) => n.toLocaleString('en-US');

// The markdown in these articles is simple: headings, paragraphs, "- " lists, one image line,
// **bold**, *italic*, `code` and [links](url). Same converter as the source build scripts.
const inline = (s, a = {}) => {
  let h = esc(s)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
  for (const [text, url] of a.autolink ?? []) {
    const re = new RegExp(`\\b${text.replace(/\./g, '\\.')}\\b(?![^<]*<\\/a>)`, 'g');
    h = h.replace(re, `<a href="${url}">${text}</a>`);
  }
  return h;
};
const plain = (s) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/`([^`]+)`/g, '$1');

// Alt text and captions come from the existing copy page, so they stay verbatim.
function readSourcePage(a) {
  const html = fs.readFileSync(path.join(a.dir, a.sourceHtml), 'utf8');
  const byWidth = { 1920: 'cover-linkedin-1920x1080.png', 1500: 'cover-medium-1500x750.png', 1400: 'numbers-1400.png' };
  const figures = {};
  for (const m of html.matchAll(/<figure\b([^>]*)>\s*<img\b([^>]*)>([\s\S]*?)<\/figure>/g)) {
    const [, figAttrs, imgAttrs, rest] = m;
    const file = /data-image="([^"]+)"/.exec(figAttrs)?.[1] ?? byWidth[/\bwidth="(\d+)"/.exec(imgAttrs)?.[1]];
    const alt = /\balt="([^"]*)"/.exec(imgAttrs)?.[1];
    const cap = /<figcaption>([\s\S]*?)<\/figcaption>/.exec(rest)?.[1];
    if (!file || alt === undefined) throw new Error(`${a.sourceHtml}: a figure without a known image or alt text`);
    figures[file] = { alt: decode(alt), caption: cap ? stripTags(cap) : '' };
  }
  const notesBlock = /<ul class="notes">([\s\S]*?)<\/ul>/.exec(html)?.[1];
  const notes = notesBlock ? [...notesBlock.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => m[1].trim()) : [];
  return { figures, notes };
}

// --- per-article build ------------------------------------------------------------------------
fs.rmSync(DOCS, { recursive: true, force: true });
fs.mkdirSync(path.join(DOCS, 'assets', 'fonts'), { recursive: true });
fs.writeFileSync(path.join(DOCS, '.nojekyll'), '');

const fontSrc = path.join(desktop, 'selfawarewriting-article', 'src');
for (const f of ['dm-sans-latin.woff2', 'eb-garamond-latin.woff2', 'eb-garamond-latin-italic.woff2']) {
  fs.copyFileSync(path.join(fontSrc, f), path.join(DOCS, 'assets', 'fonts', f));
}
const fontFaces = `@font-face { font-family: 'DM Sans'; font-style: normal; font-weight: 100 1000; font-display: swap; src: url(fonts/dm-sans-latin.woff2) format('woff2'); }
@font-face { font-family: 'EB Garamond'; font-style: normal; font-weight: 400 800; font-display: swap; src: url(fonts/eb-garamond-latin.woff2) format('woff2'); }
@font-face { font-family: 'EB Garamond'; font-style: italic; font-weight: 400 800; font-display: swap; src: url(fonts/eb-garamond-latin-italic.woff2) format('woff2'); }`;
fs.writeFileSync(path.join(DOCS, 'assets', 'site.css'),
  `/* Generated by build.mjs from src/site.css. Edit the source, then run: node build.mjs */\n${fontFaces}\n${tokenCss}\n${fs.readFileSync(path.join(here, 'src', 'site.css'), 'utf8')}`);
fs.copyFileSync(path.join(here, 'src', 'site.js'), path.join(DOCS, 'assets', 'site.js'));

const built = [];
for (const a of ARTICLES) {
  const out = path.join(DOCS, a.slug);
  fs.mkdirSync(out, { recursive: true });
  const src = readSourcePage(a);

  // images: every PNG the folder has for this story, with verbatim alt text and captions
  const images = Object.keys(IMAGE_LABELS).filter((f) => fs.existsSync(path.join(a.dir, f))).map((file) => {
    fs.copyFileSync(path.join(a.dir, file), path.join(out, file));
    let from = src.figures[file];
    let reused = '';
    // SAW and CSS 3D Lab: the LinkedIn cover is the same design as the Medium cover, and the
    // source page gives it no text of its own, so it carries the Medium cover's alt and caption.
    if (!from && file === 'cover-linkedin-1920x1080.png' && src.figures['cover-medium-1500x750.png']) {
      from = src.figures['cover-medium-1500x750.png'];
      reused = 'Alt text and caption are the Medium cover’s: same design, wider shape.';
    }
    if (!from) throw new Error(`${a.slug}: no alt text for ${file} in ${a.sourceHtml}`);
    const caption = a.captions?.[file] ?? from.caption;
    if (!caption) throw new Error(`${a.slug}: no caption for ${file}`);
    if (from.alt.length > 500) throw new Error(`${a.slug}: ${file} alt text is over Medium's 500 characters`);
    const { w, h } = pngSize(path.join(a.dir, file));
    return { file, key: file.split('-')[0] === 'cover' ? file.replace(/-\d.*$/, '') : 'numbers', label: IMAGE_LABELS[file], alt: from.alt, caption, w, h, reused, captionWritten: Boolean(a.captions?.[file]) };
  });
  const img = Object.fromEntries(images.map((i) => [i.file, i]));
  const cover = img['cover-medium-1500x750.png'];
  const numbers = img['numbers-1400.png'];

  // the article
  const md = fs.readFileSync(path.join(a.dir, 'article.md'), 'utf8').replace(/\r/g, '');
  const blocks = md.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  if (!blocks[0].startsWith('# ') || !/^\*.*\*$/.test(blocks[1])) throw new Error(`${a.slug}: article.md must start with "# Title" and an *italic subtitle*`);
  const title = plain(blocks[0].slice(2));
  const subtitle = plain(blocks[1].slice(1, -1));
  const words = md.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/[#*`\[\]]|\(http[^)]*\)/g, ' ').split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 230));

  const marker = (i) => `<p><strong>[Upload ${esc(i.file)} here. Caption: ${esc(i.caption)} Alt text: ${esc(i.alt)}]</strong></p>`;
  const page = [];
  const copy = [`<h1>${inline(blocks[0].slice(2))}</h1>`, `<p><em>${inline(blocks[1].slice(1, -1))}</em></p>`];
  if (a.coverInCopy && cover) copy.push(marker(cover));
  let numbersPlaced = false;
  const push = (h) => { page.push(h); copy.push(h); };
  const pushNumbers = () => { if (!numbers || numbersPlaced) return; page.push(figure(numbers)); copy.push(marker(numbers)); numbersPlaced = true; };
  blocks.slice(2).forEach((b, j, rest) => {
    if (b.startsWith('## ')) push(`<h2>${inline(b.slice(3), a)}</h2>`);
    else if (b.startsWith('![')) {
      if (!b.includes('numbers-1400.png')) throw new Error(`${a.slug}: unknown image line ${b}`);
      pushNumbers();
    } else if (b.startsWith('- ')) push(`<ul>\n${b.split('\n').map((l) => `<li>${inline(l.replace(/^- /, ''), a)}</li>`).join('\n')}\n</ul>`);
    else if (j === rest.length - 1) push(`<p class="close">${a.closeEm ? `<em>${inline(b, a)}</em>` : inline(b, a)}</p>`);
    else push(`<p>${inline(b, a)}</p>`);
    if (a.numbersAfter?.test(b)) pushNumbers();
  });
  if (numbers && !numbersPlaced) throw new Error(`${a.slug}: the numbers card has no place in the article`);

  // share texts: only the files that exist; the Facebook file holds a short and a longer version
  const shares = [];
  for (const [file, label] of SHARE_FILES) {
    const p = path.join(a.dir, file);
    if (!fs.existsSync(p)) continue;
    const text = fs.readFileSync(p, 'utf8').replace(/\r/g, '').trim();
    const two = /^SHORT VERSION\s*\n([\s\S]*?)\n\s*LONGER VERSION\s*\n([\s\S]*)$/.exec(text);
    const id = file.replace(/-post\.txt$/, '');
    if (two) {
      shares.push({ id: `${id}-short`, label: `${label}, short`, file, text: two[1].trim() });
      shares.push({ id: `${id}-long`, label: `${label}, longer`, file, text: two[2].trim() });
    } else shares.push({ id, label, file, text });
  }

  const pubLabel = a.published ? `Published ${fmtDate(a.published)}` : `Written ${fmtDate(a.date)}`;
  const pubIso = a.published || a.date;
  const info = { ...a, title, subtitle, words, minutes, cover, images, shares, notes: src.notes, pubLabel, pubIso };
  built.push(info);

  const kitData = JSON.stringify({ richHtml: copy.join('\n') }).replace(/</g, '\\u003c');
  fs.writeFileSync(path.join(out, 'index.html'), articlePage(info, page.join('\n'), md, kitData));
}

fs.writeFileSync(path.join(DOCS, 'index.html'), indexPage(built));

// --- templates --------------------------------------------------------------------------------
function head({ pageKey, title, description, image, imageAlt, canonical, type, fontsLink, base }) {
  return `<!doctype html>
<html lang="en" data-page="${pageKey}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${attr(description)}">
<meta name="author" content="${AUTHOR}">
<meta name="color-scheme" content="light dark">
<script>try{var t=localStorage.getItem('articles-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>
${canonical ? `<link rel="canonical" href="${attr(canonical)}">\n` : ''}<meta property="og:type" content="${type}">
<meta property="og:title" content="${attr(title)}">
<meta property="og:description" content="${attr(description)}">
<meta property="og:image" content="${attr(image)}">
<meta property="og:image:alt" content="${attr(imageAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${attr(title)}">
<meta name="twitter:description" content="${attr(description)}">
<meta name="twitter:image" content="${attr(image)}">
<meta name="twitter:image:alt" content="${attr(imageAlt)}">
<link rel="icon" href="data:,">
${fontsLink ? `<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="${attr(fontsLink)}">\n` : ''}<link rel="stylesheet" href="${base}assets/site.css">
<script src="${base}assets/site.js" defer></script>
</head>`;
}

function themeSwitchHtml() { return `<div class="theme-switch" role="group" aria-label="Colour theme" hidden>
      <button type="button" data-theme-value="system" aria-pressed="true">Auto</button>
      <button type="button" data-theme-value="light" aria-pressed="false">Light</button>
      <button type="button" data-theme-value="dark" aria-pressed="false">Dark</button>
    </div>`; }

function figure(i, { hero = false } = {}) {
  return `<figure class="fig${hero ? ' fig-cover' : ''}" id="fig-${i.key}">
  <div class="frame"><img src="${i.file}" alt="${attr(i.alt)}" width="${i.w}" height="${i.h}" decoding="async"${hero ? ' fetchpriority="high"' : ' loading="lazy"'}></div>
  <figcaption>
    <p class="cap" id="cap-${i.key}">${esc(i.caption)}</p>
    <div class="fig-tools">
      <button type="button" class="chip" data-copy="cap-${i.key}" aria-label="Copy caption, ${i.label.toLowerCase()}">Copy caption</button>
      <button type="button" class="chip" data-copy="alt-${i.key}" aria-label="Copy alt text, ${i.label.toLowerCase()}">Copy alt</button>
      <a class="chip" href="${i.file}" download aria-label="Download image, ${i.label.toLowerCase()} (${i.file})">Download</a>
    </div>
    <details class="alt"><summary>Alt text <span>· ${i.alt.length} of 500 characters</span></summary><p id="alt-${i.key}">${esc(i.alt)}</p></details>
  </figcaption>
</figure>`;
}

function kit(a, md) {
  const mediumLine = a.medium
    ? `<p class="kit-status"><span class="dot on" aria-hidden="true"></span><span>Published on Medium</span><a class="kit-open" href="${attr(a.medium)}" rel="noopener">Open<span aria-hidden="true"> ↗</span><span class="vh"> the story on Medium</span></a></p>`
    : `<p class="kit-status"><span class="dot" aria-hidden="true"></span>Not yet published on Medium</p>`;
  const imageRows = a.images.map((i) => `<li class="img-row">
          <img src="${i.file}" alt="" width="${i.w}" height="${i.h}" loading="lazy" decoding="async">
          <p class="img-name">${esc(i.label)}<span>${esc(i.file)} · ${i.w}&nbsp;×&nbsp;${i.h}</span></p>
          <div class="img-more">
            <div class="fig-tools">
              <button type="button" class="chip" data-copy="k-cap-${i.key}" aria-label="Copy caption, ${i.label.toLowerCase()}">Copy caption</button>
              <button type="button" class="chip" data-copy="k-alt-${i.key}" aria-label="Copy alt text, ${i.label.toLowerCase()}">Copy alt</button>
              <a class="chip" href="${i.file}" download aria-label="Download image, ${i.label.toLowerCase()} (${i.file})">Download</a>
            </div>
            <details class="alt"><summary>Caption and alt text</summary>
              <p class="lbl">Caption</p><p id="k-cap-${i.key}">${esc(i.caption)}</p>
              <p class="lbl">Alt text · ${i.alt.length} of 500</p><p id="k-alt-${i.key}">${esc(i.alt)}</p>
              ${i.reused ? `<p class="lbl note">${esc(i.reused)}</p>` : ''}
            </details>
          </div>
        </li>`).join('\n');
  const shareCards = a.shares.map((s) => `<div class="share">
          <div class="share-head">
            <h3>${esc(s.label)}</h3>
            <button type="button" class="chip" data-copy="share-${s.id}" aria-label="Copy ${s.label}">Copy</button>
          </div>
          <p class="share-meta">${num([...s.text].length)} characters · ${esc(s.file)}</p>
          ${s.text.includes('[article link]') ? `<p class="share-warn">Contains the placeholder “[article link]”. Replace it with the article’s address before posting.</p>` : ''}
          <pre id="share-${s.id}" tabindex="0">${esc(s.text)}</pre>
        </div>`).join('\n');
  return `<aside class="kit" aria-label="Publishing kit">
    <details class="kit-box" id="kit">
      <summary><span class="kit-sum"><span class="kit-title">Publishing kit</span><span class="kit-hint">Copy the text, images and posts</span></span></summary>
      <div class="kit-body">
        <section aria-labelledby="kit-story">
          <h2 id="kit-story">Story</h2>
          ${mediumLine}
          <div class="btn-grid">
            <button type="button" class="btn primary" data-copy-rich>Copy article as rich text</button>
            <button type="button" class="btn" data-copy="story-title">Copy title</button>
            <button type="button" class="btn" data-copy="story-dek">Copy subtitle</button>
            <button type="button" class="btn wide" data-copy="md-source">Copy article as Markdown</button>
          </div>
          <p class="kit-note">Rich text pastes into the Medium and LinkedIn editors with headings, bold, lists and links. Images don’t travel: the copy has a bold line where each one goes, with its file name, caption and alt text.</p>
          <details class="alt"><summary>Show the Markdown</summary><textarea id="md-source" rows="8" readonly aria-label="The article as Markdown">${esc(md.trim())}</textarea></details>
        </section>
        <section aria-labelledby="kit-images">
          <h2 id="kit-images">Images (${a.images.length})</h2>
          <ul class="img-list">
        ${imageRows}
          </ul>
        </section>
        ${a.shares.length ? `<section aria-labelledby="kit-share">
          <h2 id="kit-share">Share texts (${a.shares.length})</h2>
        ${shareCards}
        </section>` : ''}
        ${a.notes.length ? `<section aria-labelledby="kit-notes">
          <h2 id="kit-notes">Before you publish</h2>
          <ul class="notes">
            ${a.notes.map((n) => `<li>${n}</li>`).join('\n            ')}
          </ul>
          <p class="kit-src">From ${esc(a.sourceHtml)}</p>
        </section>` : ''}
      </div>
    </details>
  </aside>`;
}

function articlePage(a, body, md, kitData) {
  const mediumLink = a.medium
    ? `<a href="${attr(a.medium)}" rel="noopener">Read on Medium<span aria-hidden="true"> ↗</span></a>`
    : `<span>Not yet on Medium</span>`;
  return `${head({ pageKey: a.slug, title: a.title, description: a.subtitle, image: a.cover.file, imageAlt: a.cover.alt, canonical: a.medium, type: 'article', fontsLink: a.fontsLink, base: '../' })}
<body>
<a class="skip" href="#story">Skip to the article</a>
<header class="site-head">
  <nav aria-label="Site"><a class="home" href="../"><span aria-hidden="true">←</span> All articles</a></nav>
  ${themeSwitchHtml()}
</header>
<main class="layout" id="main">
  ${kit(a, md)}
  <article class="story" id="story" aria-labelledby="story-title" tabindex="-1">
    <header class="story-head">
      <p class="kicker">${esc(a.kicker)}</p>
      <h1 id="story-title">${esc(a.title)}</h1>
      <p class="dek" id="story-dek">${esc(a.subtitle)}</p>
      <p class="byline"><span>${AUTHOR}</span><time datetime="${a.pubIso}">${a.pubLabel}</time><span>${a.minutes} min read · ${num(a.words)} words</span>${mediumLink}</p>
    </header>
    ${figure(a.cover, { hero: true })}
    <div class="prose" id="article-body">
${body}
    </div>
  </article>
</main>
<footer class="site-foot">
  <a href="../"><span aria-hidden="true">←</span> All articles</a>
  <span>${AUTHOR} · 2026</span>
</footer>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
<script type="application/json" id="kit-data">${kitData}</script>
</body>
</html>
`;
}

function indexPage(list) {
  const cards = list.map((a) => `<article class="card" data-accent="${a.slug}">
      <div class="frame"><img src="${a.slug}/${a.cover.file}" alt="${attr(a.cover.alt)}" width="${a.cover.w}" height="${a.cover.h}" decoding="async"></div>
      <div class="card-body">
        <p class="kicker">${esc(a.kicker)}</p>
        <h2><a class="card-link" href="${a.slug}/">${esc(a.title)}</a></h2>
        <p class="sub">${esc(a.subtitle)}</p>
        <p class="meta"><time datetime="${a.pubIso}">${a.pubLabel}</time> · ${a.minutes} min read</p>
        <p class="links"><a href="${a.slug}/">Read the article</a>${a.medium ? `<a href="${attr(a.medium)}" rel="noopener">On Medium<span aria-hidden="true"> ↗</span></a>` : '<span>Not yet on Medium</span>'}</p>
      </div>
    </article>`).join('\n    ');
  const first = list[0];
  return `${head({ pageKey: 'index', title: `Articles · ${AUTHOR}`, description: 'Three build stories by Edgaras Neverdauskas, each counted from the session logs and git history.', image: `${first.slug}/${first.cover.file}`, imageAlt: first.cover.alt, canonical: '', type: 'website', fontsLink: '', base: '' })}
<body>
<a class="skip" href="#main">Skip to the articles</a>
<header class="site-head">
  <nav aria-label="Site"><a class="home" href="./">${AUTHOR}</a></nav>
  ${themeSwitchHtml()}
</header>
<main class="index" id="main" tabindex="-1">
  <header class="index-head">
    <p class="kicker">Articles</p>
    <h1>Building with AI, counted from the logs</h1>
    <p class="dek">Three build stories by ${AUTHOR}. Each one goes back through the session logs and the git history, so the numbers are counted, not remembered.</p>
  </header>
  <div class="cards">
    ${cards}
  </div>
</main>
<footer class="site-foot"><span>${AUTHOR} · 2026</span></footer>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
</body>
</html>
`;
}

// --- report -----------------------------------------------------------------------------------
for (const a of built) {
  console.log(`${a.slug}: ${num(a.words)} words, ${a.minutes} min, ${a.images.length} images, ${a.shares.length} share texts, ${a.notes.length} notes${a.medium ? '' : ', not on Medium yet'}`);
}
console.log(`contrast: ${contrastReport.length} text pairs checked, lowest ${minRatio.ratio}:1 (${minRatio.page} ${minRatio.mode} ${minRatio.pair})`);
console.log(`wrote ${path.relative(here, DOCS)}${path.sep}`);
