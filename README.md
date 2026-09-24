# Articles site

A small static site for four articles: J.A.R.V.I.S., Self-Aware Writing, CSS 3D Lab and the CSS 3D
Lab ledger. Each
article page has a public share kit with copy buttons for the title, subtitle, whole article (rich
text or Markdown), every image's caption and alt text, and the available share posts.

The built site lives in `docs/`. It uses plain HTML, CSS and JS, and every link is relative.

## Rebuild

```
node build.mjs
```

Needs Node 18 or newer. There are no dependencies and nothing to install.

The build reads the four article folders that sit next to this one on the Desktop:

| Folder | Read from it |
| --- | --- |
| `../css-3d-lab-ledger-article/` | `article.md`, the three PNGs, `linkedin-post.txt`, `facebook-post.txt`, `x-post.txt`, and alt text, captions and notes from `css-3d-lab-ledger-article.html` |
| `../jarvis-article/` | `article.md`, the three PNGs, `linkedin-post.txt`, and alt text, captions and notes from `five-days-jarvis.html` |
| `../selfawarewriting-article/` | `article.md`, the three PNGs, alt text, captions and notes from `self-aware-writing-article.html`, and the fonts in `src/` |
| `../css-3d-lab-article/` | `article.md`, the three PNGs, `linkedin-post.txt`, `facebook-post.txt`, `x-post.txt`, and alt text, captions and notes from `css-3d-lab-article.html` |

The source folders are only read, never changed. `docs/` is deleted and written fresh on every
build, so edit `build.mjs` and `src/`, not `docs/`.

To rebuild the hub and synchronize the matching single-article page into every project's public
assets, run:

```
node build.mjs --sync-projects
```

That writes `/article/` into CSS 3D Lab's `public/`, Self-Aware Writing's `public/`, and
J.A.R.V.I.S.'s `src/client/public/`. Their normal production builds then publish the pages with the
projects. The ledger story has no project copy — a project can only host one `/article/`, and
CSS 3D Lab's is the first story — so it lives here only. The central article URL stays canonical; each project copy uses its own `/article/` URL
for social previews and sends cross-article links back to this hub.

- `build.mjs`: the article list (slug, external links and project link), colour tokens, the Markdown converter and the page templates. It stops with an error if any text colour pair drops below 4.5:1 contrast, if an image has no alt text, or if alt text goes over Medium's 500-character limit.
- `src/site.css`: the shared components and each article's type and shape. The build puts the fonts and colour tokens in front of it.
- `src/site.js`: the theme switch and the copy buttons.

### Source notes

- **Share links.** Any `[article link]` placeholder in a source share-post file is replaced with the article's public self-hosted URL during the build.
- **J.A.R.V.I.S. captions.** Its copy page has working labels where captions would go ("Upload it here…"), so `build.mjs` supplies reader captions for its three images. All alt texts are copied word for word from the source pages.

## Preview locally

```
node serve.mjs
```

Then open http://localhost:4173/. `npx serve docs` works too.

Opening `docs/index.html` straight from disk shows the home page, but the article links point at
folders (`jarvis/`), and a browser won't open those as pages from disk. Use a local server.

## Publish on GitHub Pages

1. Create a GitHub repository and push this folder to it (`git remote add origin …`, then `git push -u origin main`).
2. On GitHub, go to **Settings → Pages → Build and deployment**. Set **Source** to *Deploy from a branch*, then set **Branch** to `main` and the folder to `/docs`. Save.
3. Configure the custom domain as `articles.edgarasneverdauskas.com`. The build writes `docs/CNAME`, absolute canonical/social URLs, `sitemap.xml`, and `robots.txt` automatically.

## Notes

- **Fonts.** DM Sans and EB Garamond are self-hosted in `docs/assets/fonts/`, copied from the Self-Aware Writing sources. The J.A.R.V.I.S. page loads Chakra Petch, IBM Plex Mono and IBM Plex Serif from Google Fonts, the same way its copy page does, because no local copies exist. There are no other external requests.
- **Theme.** The site follows the system theme by default. The Auto / Light / Dark switch is saved in `localStorage` under `articles-theme`. An inline script in `<head>` applies the saved theme before first paint. If the browser blocks storage, the switch still works for that page and says so.
- **Copying.** The page says "Copied" only after the clipboard accepts the text. When the browser refuses, the page selects the text and asks you to press Ctrl+C (⌘C on a Mac). Rich copy puts `text/html` and `text/plain` on the clipboard together. Where rich text isn't supported, it copies plain text and says so.
- `screens/` holds review screenshots and isn't part of the site.
