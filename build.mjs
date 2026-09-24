// Builds the static articles site into docs/:  node build.mjs
//
// Reads the three article folders that sit next to this one on the Desktop (article.md, images,
// share texts, and the existing copy page for alt text and captions), and writes plain HTML, CSS
// and JS for https://articles.edgarasneverdauskas.com, served by GitHub Pages from /docs.
// Links inside the site are relative; canonical, og:url, og:image and the sitemap are absolute.
// No dependencies. The source folders are only read, never written.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const DOCS = path.join(here, 'docs');
const desktop = path.dirname(here);
const SYNC_PROJECTS = process.argv.includes('--sync-projects');

// --- the site ---------------------------------------------------------------------------------
// This site is the articles' home: canonical, og:url and social images all point here.
const SITE_URL = 'https://articles.edgarasneverdauskas.com';
const SITE_HOST = new URL(SITE_URL).host;
const HOME_URL = 'https://edgarasneverdauskas.com';

// The articles are outreach, so they are counted: a visitor count tells me
// whether writing the next one sends anyone to the project. The copies mirrored
// into the project sites are not counted here — those pages belong to
// selfawarewriting.com and css3dlab, which count their own readers or, in the
// book's case, deliberately count nobody.
const ANALYTICS = 'https://articles.goatcounter.com/count';

// --- the articles (newest first, the order of the home page) ----------------------------------
// medium / linkedin: the story's other copies. project: the thing the story is about.
const ARTICLES = [
  {
    slug: 'css-3d-lab-ledger',
    dir: path.join(desktop, 'css-3d-lab-ledger-article'),
    sourceHtml: 'css-3d-lab-ledger-article.html',
    medium: '',
    linkedin: '',
    project: 'https://css3dlab.edgarasneverdauskas.com',
    // No project copy: /article/ on the lab is the first CSS 3D Lab story, and one project can
    // only host one /article/. This one lives here only.
    mirrorDir: null,
    kicker: 'Four days · 614 commits',
    coverInCopy: true,
    fontsLink: '',
  },
  {
    slug: 'css-3d-lab',
    dir: path.join(desktop, 'css-3d-lab-article'),
    sourceHtml: 'css-3d-lab-article.html',
    medium: 'https://medium.com/@edgarasneverdauskas/one-day-building-css-3d-lab-with-claude-2e6852ba0e65',
    linkedin: 'https://www.linkedin.com/pulse/one-day-building-css-3d-lab-claude-edgaras-neverdauskas-xjlbc/',
    project: 'https://css3dlab.edgarasneverdauskas.com',
    mirrorDir: 'C:\\dev\\css-3d-lab\\public\\article',
    kicker: 'About a day · 135 models',
    coverInCopy: true,
    fontsLink: '',
  },
  {
    slug: 'self-aware-writing',
    dir: path.join(desktop, 'selfawarewriting-article'),
    sourceHtml: 'self-aware-writing-article.html',
    medium: 'https://medium.com/@edgarasneverdauskas/a-book-that-knows-youre-reading-it-ef41561ae846',
    linkedin: 'https://www.linkedin.com/pulse/book-knows-youre-reading-edgaras-neverdauskas-h7mfc/',
    project: 'https://selfawarewriting.com',
    mirrorDir: path.join(desktop, 'selfawarewriting', 'public', 'article'),
    kicker: 'Four weeks · 4 chapters',
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
    linkedin: 'https://www.linkedin.com/pulse/five-days-building-jarvis-claude-edgaras-neverdauskas-kqxjc/',
    project: 'https://jarvis.edgarasneverdauskas.com',
    mirrorDir: path.join(desktop, 'jarvis', 'src', 'client', 'public', 'article'),
    kicker: 'Five days · 39 hours',
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
      accJarvis: '#00687a', accSaw: '#85601f', accCss: '#5b36e8', accLedger: '#0a6076' },
    dark: { bg: '#0e0f13', surface: '#16171d', surface2: '#1f2129', text: '#c9cad3', strong: '#f1f1f5', muted: '#9a9ca9', line: '#2a2c35', link: '#aeabff', accent: '#aeabff', accent2: '#9a9ca9', btnBg: '#ecebf5', btnText: '#111114', focus: '#aeabff', frame: '#000000',
      accJarvis: '#6ff0ff', accSaw: '#d6a24a', accCss: '#a58eff', accLedger: '#2ee6d6' },
  },
  jarvis: {
    light: { bg: '#eaf1f4', surface: '#ffffff', surface2: '#e0ebf0', text: '#22343d', strong: '#0b1a21', muted: '#4a6270', line: '#c5d8e0', link: '#00687a', accent: '#00687a', accent2: '#8f4f00', btnBg: '#00687a', btnText: '#ffffff', focus: '#00687a', frame: '#04080d', grid: 'rgb(0 104 122 / 7%)' },
    dark: { bg: '#04080d', surface: '#0a141d', surface2: '#0f1f2b', text: '#a9c3ce', strong: '#e2f6fb', muted: '#7299a8', line: '#17394b', link: '#6ff0ff', accent: '#6ff0ff', accent2: '#ffb648', btnBg: '#6ff0ff', btnText: '#04080d', focus: '#6ff0ff', frame: '#04080d', grid: 'rgb(111 240 255 / 4.5%)' },
  },
  'self-aware-writing': {
    light: { bg: '#f7f2e7', surface: '#fffdf7', surface2: '#efe7d4', text: '#2b2924', strong: '#1a1a17', muted: '#67625a', line: '#e0d7c3', link: '#7f5b1c', accent: '#8a6220', accent2: '#7f5b1c', btnBg: '#c8922e', btnText: '#1a1a17', focus: '#8a6220', frame: '#0c0c0d' },
    dark: { bg: '#0c0c0d', surface: '#151517', surface2: '#1d1d20', text: '#d9d3c7', strong: '#f3ede1', muted: '#9a958b', line: '#2c2b28', link: '#dcaa52', accent: '#c8922e', accent2: '#d6a24a', btnBg: '#c8922e', btnText: '#0c0c0d', focus: '#d6a24a', frame: '#0c0c0d' },
  },
  // The ledger article: the same lab, seen from the checks. Teal takes the lead, violet answers it.
  'css-3d-lab-ledger': {
    light: { bg: '#f1f6f8', surface: '#ffffff', surface2: '#e4eef1', text: '#23313b', strong: '#0f1c25', muted: '#4d6270', line: '#d4e2e7', link: '#0a6076', accent: '#0a6076', accent2: '#5632e6', btnBg: '#0a6076', btnBg2: '#5632e6', btnText: '#ffffff', focus: '#0a6076', frame: '#0b0d18', dot: 'rgb(15 28 37 / 13%)', glowA: 'rgb(46 230 214 / 16%)', glowB: 'rgb(139 108 255 / 10%)' },
    dark: { bg: '#0b0d18', surface: '#121528', surface2: '#1a1e38', text: '#c9cce6', strong: '#eceefb', muted: '#9296bb', line: '#272b48', link: '#5ee3d6', accent: '#2ee6d6', accent2: '#ab97ff', btnBg: '#0f7a8f', btnBg2: '#6a45f5', btnText: '#ffffff', focus: '#2ee6d6', frame: '#0b0d18', dot: 'rgb(255 255 255 / 9%)', glowA: 'rgb(46 230 214 / 16%)', glowB: 'rgb(139 108 255 / 16%)' },
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
  ['accJarvis', 'surface'], ['accSaw', 'surface'], ['accCss', 'surface'], ['accLedger', 'surface'],
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
const num = (n) => n.toLocaleString('en-US');
const pageUrl = (slug) => `${SITE_URL}/${slug}/`;

// Links to a sibling article's Medium or LinkedIn copy point at its page on this site instead:
// relative on the page itself, absolute in anything copied for use elsewhere.
const ARTICLE_URLS = new Map(ARTICLES.flatMap((x) => [x.medium, x.linkedin].filter(Boolean).map((u) => [u.replace(/\/+$/, ''), x.slug])));
const siblingSlug = (url) => ARTICLE_URLS.get(url.replace(/[?#].*$/, '').replace(/\/+$/, ''));
const linkFor = (url, mode) => {
  const slug = siblingSlug(url);
  if (!slug) return url;
  return mode === 'copy' || mode === 'mirror' ? pageUrl(slug) : `../${slug}/`;
};

// The markdown in these articles is simple: headings, paragraphs, "- " lists, one image line,
// **bold**, *italic*, `code` and [links](url). Same converter as the source build scripts.
const inline = (s, a = {}, mode = 'page') => {
  let h = esc(s)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, text, url) => `<a href="${attr(linkFor(decode(url), mode))}">${text}</a>`)
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
  return { figures };
}

// --- per-article build ------------------------------------------------------------------------
fs.rmSync(DOCS, { recursive: true, force: true });
fs.mkdirSync(path.join(DOCS, 'assets', 'fonts'), { recursive: true });
fs.writeFileSync(path.join(DOCS, '.nojekyll'), '');
fs.writeFileSync(path.join(DOCS, 'CNAME'), `${SITE_HOST}\n`);

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

// Titles first, so each page can link to the others by name.

const TITLES = Object.fromEntries(ARTICLES.map((a) => {
  const firstLine = fs.readFileSync(path.join(a.dir, 'article.md'), 'utf8').replace(/\r/g, '').split('\n', 1)[0];
  if (!firstLine.startsWith('# ')) throw new Error(`${a.slug}: article.md must start with "# Title"`);
  return [a.slug, plain(firstLine.slice(2))];
}));
const built = [];
for (const a of ARTICLES) {
  const out = path.join(DOCS, a.slug);
  fs.mkdirSync(out, { recursive: true });
  const src = readSourcePage(a);

  // images: every PNG the folder has for this story, with verbatim alt text and captions
  const images = Object.keys(IMAGE_LABELS).filter((f) => fs.existsSync(path.join(a.dir, f))).map((file) => {
    fs.copyFileSync(path.join(a.dir, file), path.join(out, file));
    let from = src.figures[file];
    // SAW and CSS 3D Lab: the LinkedIn cover is the same design as the Medium cover, and the
    // source page gives it no text of its own, so it carries the Medium cover's alt and caption.
    if (!from && file === 'cover-linkedin-1920x1080.png' && src.figures['cover-medium-1500x750.png']) {
      from = src.figures['cover-medium-1500x750.png'];
    }
    if (!from) throw new Error(`${a.slug}: no alt text for ${file} in ${a.sourceHtml}`);
    const caption = a.captions?.[file] ?? from.caption;
    if (!caption) throw new Error(`${a.slug}: no caption for ${file}`);
    if (from.alt.length > 500) throw new Error(`${a.slug}: ${file} alt text is over Medium's 500 characters`);
    const { w, h } = pngSize(path.join(a.dir, file));
    return { file, key: file.split('-')[0] === 'cover' ? file.replace(/-\d.*$/, '') : 'numbers', label: IMAGE_LABELS[file], alt: from.alt, caption, w, h };
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
  const words = md.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/^(>\s?|\[(numbers|time[^\]]*)\]\s*$)/gm, ' ')
    .replace(/[#*`\[\]|]|\(http[^)]*\)/g, ' ').split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 230));

  // The page gets figures; the copy for other editors gets a bold line with the image's address,
  // caption and alt text, since pasted images don't travel.
  const marker = (i) => `<p><strong>[Image: ${esc(pageUrl(a.slug) + i.file)} Caption: ${esc(i.caption)} Alt text: ${esc(i.alt)}]</strong></p>`;
  const page = [];
  const mirror = [];
  const copy = [`<h1>${inline(blocks[0].slice(2), a, 'copy')}</h1>`, `<p><em>${inline(blocks[1].slice(1, -1), a, 'copy')}</em></p>`];
  if (a.coverInCopy && cover) copy.push(marker(cover));
  let numbersPlaced = false;
  const both = (render) => { page.push(render('page')); mirror.push(render('mirror')); copy.push(render('copy')); };
  const pushNumbers = () => { if (!numbers || numbersPlaced) return; page.push(figure(numbers)); mirror.push(figure(numbers)); copy.push(marker(numbers)); numbersPlaced = true; };
  blocks.slice(2).forEach((b, j, rest) => {
    if (b.startsWith('## ')) both((m) => `<h2>${inline(b.slice(3), a, m)}</h2>`);
    else if (b.startsWith('![')) {
      if (!b.includes('numbers-1400.png')) throw new Error(`${a.slug}: unknown image line ${b}`);
      pushNumbers();
    } else if (b.startsWith('[numbers]')) both((m) => {
      // A row of figures to land on: "614 | commits, none pushed" per line. The page draws cards;
      // the paste copy is a plain list, since a grid does not survive being pasted anywhere.
      const rows = b.split('\n').slice(1).map((l) => l.split('|').map((s) => s.trim()));
      if (m === 'copy') return `<ul>\n${rows.map(([n, w]) => `<li><strong>${inline(n, a, m)}</strong> — ${inline(w, a, m)}</li>`).join('\n')}\n</ul>`;
      return `<ul class="figs">\n${rows.map(([n, w]) => `<li><b>${inline(n, a, m)}</b><span>${inline(w, a, m)}</span></li>`).join('\n')}\n</ul>`;
    });
    else if (b.startsWith('[time')) both((m) => {
      // A run of times that would otherwise be a paragraph nobody reads: "10:23 | what happened".
      // The first line may name the day, as [time Monday morning].
      const [head, ...rows] = b.split('\n');
      const when = /^\[time\s+([^\]]+)\]/.exec(head)?.[1] ?? null;
      const items = rows.map((l) => l.split('|').map((s) => s.trim()));
      if (m === 'copy') return `${when ? `<p><strong>${esc(when)}</strong></p>\n` : ''}<ul>\n${items.map(([t, w]) => `<li><strong>${inline(t, a, m)}</strong> — ${inline(w, a, m)}</li>`).join('\n')}\n</ul>`;
      return `<ul class="tl">\n${when ? `<li class="tl-day">${esc(when)}</li>\n` : ''}${items.map(([t, w]) => `<li><time>${inline(t, a, m)}</time><span>${inline(w, a, m)}</span></li>`).join('\n')}\n</ul>`;
    });
    else if (b.startsWith('> ')) both((m) => {
      // A quoted message: every line starts with >, and a final line opening with an em dash says
      // who said it and when. Medium, LinkedIn and Substack all turn a pasted blockquote into
      // their own quote block, so the copy carries the same element the page does.
      const lines = b.split('\n').map((l) => l.replace(/^>\s?/, ''));
      const who = lines.at(-1).startsWith('— ') ? lines.pop().slice(2) : null;
      const said = `<p>${inline(lines.join(' '), a, m)}</p>`;
      return `<blockquote class="say">\n${said}${who ? `\n<p class="who">${inline(who, a, m)}</p>` : ''}\n</blockquote>`;
    });
    else if (b.startsWith('- ')) both((m) => `<ul>\n${b.split('\n').map((l) => `<li>${inline(l.replace(/^- /, ''), a, m)}</li>`).join('\n')}\n</ul>`);
    else if (j === rest.length - 1) both((m) => `<p class="close">${a.closeEm ? `<em>${inline(b, a, m)}</em>` : inline(b, a, m)}</p>`);
    else both((m) => `<p>${inline(b, a, m)}</p>`);
    if (a.numbersAfter?.test(b)) pushNumbers();
  });
  if (numbers && !numbersPlaced) throw new Error(`${a.slug}: the numbers card has no place in the article`);

  // The Markdown copy: sibling-article links and the image point at this site, absolutely.
  const mdCopy = md
    .replace(/\]\((https?:[^)\s]+)\)/g, (m, url) => `](${linkFor(url, 'copy')})`)
    .replace(/\]\((numbers-1400\.png)\)/g, `](${pageUrl(a.slug)}$1)`);

  // share texts: only the files that exist; a file may hold a short and a longer version
  const shares = [];
  for (const [file, label] of SHARE_FILES) {
    const p = path.join(a.dir, file);
    if (!fs.existsSync(p)) continue;
    const text = fs.readFileSync(p, 'utf8').replace(/\r/g, '').trim().replaceAll('[article link]', pageUrl(a.slug));
    const two = /^SHORT VERSION\s*\n([\s\S]*?)\n\s*LONGER VERSION\s*\n([\s\S]*)$/.exec(text);
    const id = file.replace(/-post\.txt$/, '');
    if (two) {
      shares.push({ id: `${id}-short`, label: `${label}, short`, file, text: two[1].trim() });
      shares.push({ id: `${id}-long`, label: `${label}, longer`, file, text: two[2].trim() });
    } else shares.push({ id, label, file, text });
  }

  const info = { ...a, title, subtitle, words, minutes, cover, images, shares };
  built.push(info);

  const kitData = JSON.stringify({ richHtml: copy.join('\n') }).replace(/</g, '\\u003c');
  fs.writeFileSync(path.join(out, 'index.html'), articlePage(info, page.join('\n'), mdCopy, kitData));
  if (SYNC_PROJECTS && a.mirrorDir) syncProjectArticle(info, mirror.join('\n'), mdCopy, kitData);
}

fs.writeFileSync(path.join(DOCS, 'index.html'), indexPage(built));
fs.writeFileSync(path.join(DOCS, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[`${SITE_URL}/`, ...built.map((a) => pageUrl(a.slug))].map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(DOCS, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

// --- templates --------------------------------------------------------------------------------
function head({ pageKey, title, description, image, imageAlt, url, canonical = url, type, fontsLink, base, counted = false }) {
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
<link rel="canonical" href="${attr(canonical)}">
<meta property="og:type" content="${type}">
<meta property="og:url" content="${attr(url)}">
<meta property="og:site_name" content="Articles — ${AUTHOR}">
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
${counted ? `<script data-goatcounter="${ANALYTICS}" async src="https://gc.zgo.at/count.js"></script>
` : ''}</head>`;
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
    <details class="alt"><summary>Alt text <span>· ${i.alt.length} characters</span></summary><p id="alt-${i.key}">${esc(i.alt)}</p></details>
  </figcaption>
</figure>`;
}

function hostOf(url) { return new URL(url).host; }
function ext(url, text) { return `<a href="${attr(url)}" rel="noopener">${text}<span aria-hidden="true"> ↗</span></a>`; }

// "Also on": the story's Medium and LinkedIn copies, and the project it is about.
function alsoTop(a) {
  const links = [a.medium && ext(a.medium, 'Medium'), a.linkedin && ext(a.linkedin, 'LinkedIn')].filter(Boolean);
  return `<nav class="also" aria-label="This story elsewhere">
        ${links.length ? `<p><span class="also-label">Also on</span>${links.join('')}</p>` : ''}
        ${a.project ? `<p><span class="also-label">Project</span>${ext(a.project, esc(hostOf(a.project)))}</p>` : ''}
      </nav>`;
}
function alsoEnd(a, list, mirror = false) {
  const copies = [a.medium && ext(a.medium, 'Medium'), a.linkedin && ext(a.linkedin, 'LinkedIn')].filter(Boolean);
  const others = list.filter((x) => x.slug !== a.slug);
  return `<footer class="story-foot">
      <p class="also-end">${copies.length ? `<span>Read it on ${copies.join(' / ')}</span>` : ''}${a.project ? `<span>${ext(a.project, 'Visit the project')}</span>` : ''}</p>
      <nav class="more" aria-labelledby="more-${a.slug}">
        <h2 id="more-${a.slug}">More build stories</h2>
        <ul>${others.map((x) => `<li><a href="${mirror ? pageUrl(x.slug) : `../${x.slug}/`}">${esc(TITLES[x.slug])}</a></li>`).join('')}</ul>
      </nav>
    </footer>`;
}

function kit(a, md) {
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
              <p class="lbl">Alt text · ${i.alt.length} characters</p><p id="k-alt-${i.key}">${esc(i.alt)}</p>
            </details>
          </div>
        </li>`).join('\n');
  const shareCards = a.shares.map((s) => `<div class="share">
          <div class="share-head">
            <h3>${esc(s.label)}</h3>
            <button type="button" class="chip" data-copy="share-${s.id}" aria-label="Copy ${s.label}">Copy</button>
          </div>
          <p class="share-meta">${num([...s.text].length)} characters</p>
          <pre id="share-${s.id}" tabindex="0">${esc(s.text)}</pre>
        </div>`).join('\n');
  return `<aside class="kit" aria-label="Share kit">
    <details class="kit-box" id="kit">
      <summary><span class="kit-sum"><span class="kit-title">Share kit</span><span class="kit-hint">Copy the story, images and posts</span></span></summary>
      <div class="kit-body">
        <section aria-labelledby="kit-story">
          <h2 id="kit-story">Story</h2>
          <div class="btn-grid">
            <button type="button" class="btn primary" data-copy-rich>Copy article as rich text</button>
            <button type="button" class="btn" data-copy="story-title">Copy title</button>
            <button type="button" class="btn" data-copy="story-dek">Copy subtitle</button>
            <button type="button" class="btn wide" data-copy="md-source">Copy article as Markdown</button>
          </div>
          <p class="kit-note">Rich text keeps the headings, bold, lists and links when pasted into an editor such as Medium or LinkedIn. Images aren’t included: the copy has a bold line where each one goes, with its address, caption and alt text.</p>
          <details class="alt"><summary>Show the Markdown</summary><textarea id="md-source" rows="8" readonly aria-label="The article as Markdown">${esc(md.trim())}</textarea></details>
        </section>
        <section aria-labelledby="kit-images">
          <h2 id="kit-images">Images (${a.images.length})</h2>
          <ul class="img-list">
        ${imageRows}
          </ul>
        </section>
        ${a.shares.length ? `<section aria-labelledby="kit-share">
          <h2 id="kit-share">Posts (${a.shares.length})</h2>
        ${shareCards}
        </section>` : ''}
      </div>
    </details>
  </aside>`;
}

function siteFoot(back, mirror = false) {
  return `<footer class="site-foot">
  ${back ? `<a href="${mirror ? `${SITE_URL}/` : '../'}"><span aria-hidden="true">←</span> All articles</a>` : `<span>Articles by ${AUTHOR}</span>`}
  <a href="${HOME_URL}">${esc(hostOf(HOME_URL))}</a>
</footer>`;
}

function articlePage(a, body, md, kitData, { mirror = false } = {}) {
  const url = mirror ? `${a.project}/article/` : pageUrl(a.slug);
  return `${head({ pageKey: a.slug, title: a.title, description: a.subtitle, image: url + a.cover.file, imageAlt: a.cover.alt, url, canonical: pageUrl(a.slug), type: 'article', fontsLink: a.fontsLink, base: mirror ? './' : '../', counted: !mirror })}
<body>
<a class="skip" href="#story">Skip to the article</a>
<header class="site-head">
  <nav aria-label="Site"><a class="home" href="${mirror ? `${SITE_URL}/` : '../'}"><span aria-hidden="true">←</span> All articles</a></nav>
  ${themeSwitchHtml()}
</header>
<main class="layout" id="main">
  ${kit(a, md)}
  <article class="story" id="story" aria-labelledby="story-title" tabindex="-1">
    <header class="story-head">
      <p class="kicker">${esc(a.kicker)}</p>
      <h1 id="story-title">${esc(a.title)}</h1>
      <p class="dek" id="story-dek">${esc(a.subtitle)}</p>
      <p class="byline"><span>${AUTHOR}</span><span>${a.minutes} min read</span><span>${num(a.words)} words</span></p>
      ${alsoTop(a)}
    </header>
    ${figure(a.cover, { hero: true })}
    <div class="prose" id="article-body">
${body}
    </div>
    ${alsoEnd(a, ARTICLES, mirror)}
  </article>
</main>
${siteFoot(true, mirror)}
<div class="toast" id="toast" role="status" aria-live="polite"></div>
<script type="application/json" id="kit-data">${kitData}</script>
</body>
</html>
`;
}

function syncProjectArticle(a, body, md, kitData) {
  const out = path.resolve(a.mirrorDir);
  if (path.basename(out).toLowerCase() !== 'article') throw new Error(`${a.slug}: mirror target must end in /article`);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(path.join(out, 'assets', 'fonts'), { recursive: true });
  for (const file of ['site.css', 'site.js']) fs.copyFileSync(path.join(DOCS, 'assets', file), path.join(out, 'assets', file));
  for (const file of ['dm-sans-latin.woff2', 'eb-garamond-latin.woff2', 'eb-garamond-latin-italic.woff2']) {
    fs.copyFileSync(path.join(DOCS, 'assets', 'fonts', file), path.join(out, 'assets', 'fonts', file));
  }
  for (const image of a.images) fs.copyFileSync(path.join(a.dir, image.file), path.join(out, image.file));
  fs.writeFileSync(path.join(out, 'index.html'), articlePage(a, body, md, kitData, { mirror: true }));
  console.log(`synced ${a.project}/article/ -> ${out}`);
}

function indexPage(list) {
  const cards = list.map((a) => `<article class="card" data-accent="${a.slug}">
      <div class="frame"><img src="${a.slug}/${a.cover.file}" alt="${attr(a.cover.alt)}" width="${a.cover.w}" height="${a.cover.h}" decoding="async"></div>
      <div class="card-body">
        <p class="kicker">${esc(a.kicker)}</p>
        <h2><a class="card-link" href="${a.slug}/">${esc(a.title)}</a></h2>
        <p class="sub">${esc(a.subtitle)}</p>
        <p class="meta">${a.minutes} min read</p>
        <p class="links"><a href="${a.slug}/">Read the article<span aria-hidden="true"> →</span></a></p>
        <p class="elsewhere">${a.medium || a.linkedin ? `<span class="grp"><span class="also-label">Also on</span>${a.medium ? ext(a.medium, 'Medium') : ''}${a.linkedin ? ext(a.linkedin, 'LinkedIn') : ''}</span>` : ''}${a.project ? `<span class="grp"><span class="also-label">Project</span>${ext(a.project, esc(hostOf(a.project)))}</span>` : ''}</p>
      </div>
    </article>`).join('\n    ');
  const first = list[0];
  return `${head({ pageKey: 'index', title: `Articles — ${AUTHOR}`, description: 'Build stories, counted from the logs.', image: pageUrl(first.slug) + first.cover.file, imageAlt: first.cover.alt, url: `${SITE_URL}/`, type: 'website', fontsLink: '', base: '', counted: true })}
<body>
<a class="skip" href="#main">Skip to the articles</a>
<header class="site-head">
  <nav aria-label="Site"><a class="home" href="./">${AUTHOR}</a></nav>
  ${themeSwitchHtml()}
</header>
<main class="index" id="main" tabindex="-1">
  <header class="index-head">
    <p class="kicker">${AUTHOR}</p>
    <h1>Articles</h1>
    <p class="dek">Build stories, counted from the logs.</p>
  </header>
  <div class="cards">
    ${cards}
  </div>
</main>
${siteFoot(false)}
<div class="toast" id="toast" role="status" aria-live="polite"></div>
</body>
</html>
`;
}

// --- report -----------------------------------------------------------------------------------
for (const a of built) {
  console.log(`${a.slug}: ${num(a.words)} words, ${a.minutes} min, ${a.images.length} images, ${a.shares.length} posts`);
}
console.log(`contrast: ${contrastReport.length} text pairs checked, lowest ${minRatio.ratio}:1 (${minRatio.page} ${minRatio.mode} ${minRatio.pair})`);
console.log(`wrote ${path.relative(here, DOCS)}${path.sep}`);
