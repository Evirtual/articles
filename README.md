# Articles site

A small static site for three articles: J.A.R.V.I.S., Self-Aware Writing and CSS 3D Lab. Each
article page has a publishing kit with copy buttons for the title, subtitle, whole article (rich
text or Markdown), every image's caption and alt text, the share posts, and the "Before you
publish" notes.

The built site lives in `docs/`. It uses plain HTML, CSS and JS, and every link is relative.

## Rebuild

```
node build.mjs
```

Needs Node 18 or newer. There are no dependencies and nothing to install.

The build reads the three article folders that sit next to this one on the Desktop:

| Folder | Read from it |
| --- | --- |
| `../jarvis-article/` | `article.md`, the three PNGs, `linkedin-post.txt`, and alt text, captions and notes from `five-days-jarvis.html` |
| `../selfawarewriting-article/` | `article.md`, the three PNGs, alt text, captions and notes from `self-aware-writing-article.html`, and the fonts in `src/` |
| `../css-3d-lab-article/` | `article.md`, the three PNGs, `linkedin-post.txt`, `facebook-post.txt`, `x-post.txt`, and alt text, captions and notes from `css-3d-lab-article.html` |

The source folders are only read, never changed. `docs/` is deleted and written fresh on every
build, so edit `build.mjs` and `src/`, not `docs/`.

- `build.mjs`: the article list (slug, Medium link, dates), colour tokens, the Markdown converter and the page templates. It stops with an error if any text colour pair drops below 4.5:1 contrast, if an image has no alt text, or if alt text goes over Medium's 500-character limit.
- `src/site.css`: the shared components and each article's type and shape. The build puts the fonts and colour tokens in front of it.
- `src/site.js`: the theme switch and the copy buttons.

### Things to update by hand

- **The CSS 3D Lab Medium link.** When the story is live, set `medium:` for `css-3d-lab` in `build.mjs`. The page then gets a "Read on Medium" link and a canonical tag. Its share texts still contain the placeholder `[article link]`, and the kit warns about it.
- **Dates.** The site shows "Written <date>", which is the date each `article.md` was last saved. Medium's publish dates couldn't be read from here because Medium blocks automated requests. Set `published: 'YYYY-MM-DD'` to show "Published <date>" instead.
- **J.A.R.V.I.S. captions.** Its copy page has working labels where captions would go ("Upload it here…"), so `build.mjs` supplies reader captions for its three images. All alt texts are copied word for word from the source pages. The J.A.R.V.I.S. numbers card's alt text is just "By the numbers". Consider writing a fuller one in `five-days-jarvis.html` (or override it in `build.mjs`).

## Preview locally

```
node serve.mjs
```

Then open http://localhost:4173/. `npx serve docs` works too.

Opening `docs/index.html` straight from disk shows the home page, but the article links point at
folders (`jarvis/`), and a browser won't open those as pages from disk. Use a local server.

## Publish on GitHub Pages (later)

1. Create a GitHub repository and push this folder to it (`git remote add origin …`, then `git push -u origin main`).
2. On GitHub, go to **Settings → Pages → Build and deployment**. Set **Source** to *Deploy from a branch*, then set **Branch** to `main` and the folder to `/docs`. Save.
3. After a minute the site is live at `https://<user>.github.io/<repo>/`. Relative links work under that sub-path. `docs/.nojekyll` stops Jekyll from processing the files.
4. **Once the URL is known, make the social previews absolute.** `og:image` and `twitter:image` are relative paths right now (for example `cover-medium-1500x750.png`). LinkedIn, Facebook and X need a full `https://…` address. In `build.mjs`, add a `SITE_URL` constant and prefix the `image:` passed to `head()` with `${SITE_URL}${slug}/`. You can add `og:url` at the same time.
5. With a custom domain, add `docs/CNAME` from the build (write it in `build.mjs`, since `docs/` is rebuilt from scratch).

The publishing kit is part of each page. Once the site is public, anyone can see it, including the
"Before you publish" notes and the draft share posts. To keep the kit private, drop the `kit()` call
from `articlePage()` in `build.mjs`.

## Notes

- **Fonts.** DM Sans and EB Garamond are self-hosted in `docs/assets/fonts/`, copied from the Self-Aware Writing sources. The J.A.R.V.I.S. page loads Chakra Petch, IBM Plex Mono and IBM Plex Serif from Google Fonts, the same way its copy page does, because no local copies exist. There are no other external requests.
- **Theme.** The site follows the system theme by default. The Auto / Light / Dark switch is saved in `localStorage` under `articles-theme`. An inline script in `<head>` applies the saved theme before first paint. If the browser blocks storage, the switch still works for that page and says so.
- **Copying.** The page says "Copied" only after the clipboard accepts the text. When the browser refuses, the page selects the text and asks you to press Ctrl+C (⌘C on a Mac). Rich copy puts `text/html` and `text/plain` on the clipboard together. Where rich text isn't supported, it copies plain text and says so.
- `screens/` holds review screenshots and isn't part of the site.
