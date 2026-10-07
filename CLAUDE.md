# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal portfolio + resume site for Gaurav Panchal, served at `grvpanchal.me` (see `CNAME`). Built with Jekyll, deployed via GitHub Pages auto-deploy on push to `master` — there is **no CI workflow** under `.github/`. The `_site/` build output is gitignored; do not commit it.

## Common commands

```bash
bundle install                  # first-time setup / after Gemfile changes
bundle exec jekyll serve        # local dev server (http://127.0.0.1:4000)
bundle exec jekyll build        # one-off build into _site/
```

There are no tests, linters, or package-manager-driven build steps. Jekyll plugins are limited to `jekyll-sitemap` and `jekyll-seo-tag` (see `Gemfile` and `_config.yml`).

## Architecture notes

**Most pages are standalone HTML, not Jekyll-templated.** Only `resume.html` uses `_layouts/resume.html`, which in turn pulls in `_includes/resume-header.html`. Every other top-level page (`index.html`, `personal.html`, `strategy.html`, `n8n-app.html`, `routine.html`, `routine-waitlist.html`, `privacy.html`, `terms.html`) is a full standalone HTML document with its own `<head>`, inline meta tags, and asset references. **There is no shared header/footer include for these pages** — site-wide changes (favicon, theme color, analytics, manifest link) must be applied to each page individually.

**Multiple resume variants exist for different people.** `resume.html` is Gaurav's CV. `radhika-resume.html` and `shweta-resume.html` are separate documents for other people — do not propagate edits across them unless explicitly asked.

**`evolution/` is a self-contained Vue.js sub-app**, not a Jekyll page. It has its own `index.html`, `app.js`, `style.css`, and CSV data files. Treat it as a separate project; Jekyll does not template anything inside it.

**Assets** live under `assets/css/`, `assets/js/`, `assets/img/`. CSS includes both minified production files (`style.min.css`, `main.min.js`) and unminified working copies — when editing, find the source and rebuild the minified version, or update both consistently.

## PWA / service worker — gotcha

The site is a PWA (`manifest.json`, `service-worker.js`). **The service worker uses a versioned cache name (`PRECACHE = 'precache-vN'` at the top of `service-worker.js`).** If you modify any file listed in `PRECACHE_URLS` — currently `index.html`, `assets/css/chota.min.css`, `assets/css/style.min.css`, `assets/css/blog-feed.css`, `assets/js/main.min.js`, `assets/img/css_sprites.png` — you **must bump the version number** (e.g. `v13` → `v14`), otherwise returning visitors will be served the stale cached copy until the SW happens to update.

The service worker is registered only from `index.html`. Other pages reference `manifest.json` but do not register the SW.

## Conventions

- Markdown engine: kramdown (per `_config.yml`).
- Site config variables (`site.title`, `site.email`, etc.) come from `_config.yml`. Restart `jekyll serve` after editing it — Jekyll does not auto-reload config changes.
- Front-matter (`---` blocks) is used on Jekyll-rendered pages; standalone HTML pages mostly skip it.
- Third-party CSS/fonts (Font Awesome, Google Fonts, Chota) load from CDNs in page heads — **except the home page**, which self-hosts Chota (`assets/css/chota.min.css`) and inlines its critical CSS.

## Home page performance (Lighthouse 100/100/100/100)

`_layouts/home.html` is tuned to score 100 in all four Lighthouse categories. Things that are load-bearing for that score — keep them intact:

- **CSS is inlined**, not linked. The head pulls in `_includes/home-critical-css.html` (a `<style>` block) instead of `<link rel="stylesheet">` tags, to eliminate render-blocking requests. That include is **generated** from `assets/css/{chota.min,style.min,blog-feed}.css` — after editing any of those, regenerate it with `./scripts/build-critical-css.sh`, then rebuild. (The standalone `.css` files are still kept for the SW precache and other pages.)
- **Google Analytics loads lazily** (on first interaction, with an idle fallback) so its ~350ms of script execution stays out of the initial render window and Total Blocking Time stays ~0.
- **The blog feed (`assets/js/blog-feed.js`) loads on idle after `window.load`** so its live RSS fetch + card injection never competes with the hero's LCP.
- Below-the-fold images use `loading="lazy"`; in-page scrolling uses native `scroll-behavior: smooth` (no jQuery).
- `_config.yml` sets `url: https://grvpanchal.me` so `jekyll-seo-tag` emits a valid absolute `rel=canonical` (do not add a second manual one).
- **UI polish lives in `assets/css/enhance.css` + `assets/js/enhance.js`** (focus rings, glassy sticky menu + reading-progress hairline, scrollspy, below-the-fold reveals, keyboard-operable project tabs). `enhance.css` is inlined *after* Chota (minified by `build-critical-css.sh`) so it wins ties — notably it restores the accessible `#0a7a45` primary-button green that Chota's `#17c16f` otherwise overrides (contrast 3:1 → Lighthouse a11y 95). Animate only `transform`/`opacity`; never hide above-the-fold content; keep all motion behind `prefers-reduced-motion: no-preference`; reveals apply only after `enhance.js` adds `.js-reveal`.

## Content integrity check (run after any UI/styling change)

`scripts/integrity-check.js` fingerprints every built page — visible text, headings, links, images + alt, form fields, aria labels, title/meta — ignoring CSS/JS/classes. UI work must leave it green:

```bash
bundle exec jekyll build && npm run integrity      # fails with a per-page diff if content changed
npm run integrity:update                           # ONLY when a content change is intentional; commit the new baseline
```

The baseline is `scripts/integrity-baseline.json` (not published — `scripts/` is in Jekyll's exclude). Pages whose content is injected at runtime (the blog feed cards) aren't covered; check those in a browser.

## Blog theme (blog.grvpanchal.me)

The Blogger theme can't be changed via the API. `assets/css/blogger-theme.css` is the source of truth for the CSS pasted into Blogger → Theme → Edit HTML, just before `</head>`, inside `<style>/*<![CDATA[*/ … /*]]>*/</style>`.
