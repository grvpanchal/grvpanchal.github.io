# Forking checklist

Step-by-step from `git clone` to live site at your own domain.

## 1. Fork and clone

Use GitHub's "Fork" button on the repo, then:

```bash
git clone https://github.com/<you>/<your-fork>.git
cd <your-fork>
```

If you want it served at `<you>.github.io`, rename the repo to `<you>.github.io` after forking.

## 2. Install dependencies

```bash
bundle install     # Ruby / Jekyll
npm install        # Node scripts (onboard, sync, sanitize)
```

You need Ruby 2.7+ and Node 18+.

## 3. Replace identity with `npm run onboard`

```bash
npm run onboard
```

The wizard prompts for:

- **Identity** — your name, tagline, profile image path
- **Social links** — LinkedIn, Facebook, Twitter, Instagram, GitHub (blank to skip a platform)
- **Blog feed** — RSS URL for the homepage "Featured Blogs" section (leave blank to disable)
- **Contact form** — POST endpoint (Lambda, Formspree, etc.) for the contact form
- **Google Analytics ID** — optional
- **Jekyll site config** — title, email, description, URL, Twitter / GitHub usernames
- **Custom domain** — keep, set, or remove `CNAME`
- **PWA / manifest** — name, short_name, theme color, opt-out option

It's safe to re-run anytime — existing values are shown as defaults.

## 4. Drop in image assets

The wizard doesn't move binary files. Replace these manually:

| Path | Purpose | Recommended size |
|------|---------|------------------|
| `assets/img/profile.jpg` | Resume profile photo + home hero | Square, 400×400+ |
| `favicon.ico` | Browser tab icon | 48×48 |
| `assets/img/192.png`, `assets/img/512.png` | PWA icons | 192×192 and 512×512 |
| `assets/img/background.jpg` | Home page hero background | 1920×1080+ |

## 5. Edit content data files

These are list-shaped — easier to edit YAML directly than via a wizard.

### Projects (`_data/sectors.yml` + `_data/projects.yml`)

`sectors.yml` defines the tabs on the homepage Projects section. `projects.yml` contains entries; each `sector` field references a slug from `sectors.yml`. `active: true` puts the entry under "CURRENT"; `false` under "PREVIOUS". `tags` accepts `{name, icon}` where `icon` is a [devicon](https://icongr.am/devicon) slug.

### Skills (`_data/skills.yml`)

The "Skills" tab on the homepage. Categories with `items: [{text, icon}]`. Use `image:` instead of `icon:` for local PNG (e.g., certification badges).

### Resume (`_data/resume.yml`)

Multi-page A4 CV. Top-level data blocks (`profile_html`, `experience`, `projects`, `education`, etc.) hold content. The `pages:` array at the bottom decides which blocks appear on which page.

To add a new experience entry, add an object to `experience:` and adjust the `slice:` ranges in `pages:` if needed.

### Workflows (`_data/workflows.yml`)

Don't edit by hand for the first pass — see step 6.

## 6. (Optional) Wire up your n8n workflows

If you don't use n8n or don't want the workflows showcased, skip this — the `/workflows/` page renders an empty-state message.

Otherwise:

1. In your n8n instance, tag each workflow with three tags: `evolution`, `pillar:<x>`, `phase:start` or `phase:end`. Pillar values: `ceo | coo | cto | cio | cfo | cxo | cmo`.
2. Generate an n8n API key (Settings → n8n API → Create API key).
3. `cp .env.example .env` and fill in:
   ```
   N8N_BASE_URL=https://your-n8n-url
   N8N_API_KEY=...
   ```
4. `npm run sync-workflows` — pulls all tagged workflows, sanitizes (strips credentials, webhook IDs, inline API keys), writes `workflows/<id>.json`, merges metadata into `_data/workflows.yml`.
5. Open `_data/workflows.yml`, fill in `description` and `integrations` for each. These fields are repo-owned and survive re-syncs.

## 7. Preview and deploy

```bash
bundle exec jekyll serve
# open http://127.0.0.1:4000
```

When happy:

```bash
git add .
git commit -m "Initial fork — replaced identity"
git push origin master
```

GitHub Pages picks up `master` and deploys within 1–2 minutes.

## 8. (Optional) Custom domain DNS

If you set a custom domain in step 3:

- Add CNAME record at your DNS provider: `<your-domain>` → `<you>.github.io`
- In GitHub repo settings → Pages, enforce HTTPS

## Common issues

**Site shows my own data after fork.** That's expected — the repo ships with the previous occupant's data so the live site keeps working. Run `npm run onboard` to replace it.

**`/strategy` etc. shows my Vue templates broken.** The original `site/strategy.html` uses Vue.js mustache `{{ }}` syntax and is wrapped in `{% raw %}{% endraw %}` so Jekyll/Liquid leaves it alone. If you copy-paste content into other `site/` pages and use `{{` for any reason, wrap it the same way.

**Stale homepage after onboarding.** The PWA service worker may be serving a cached copy. The new SW uses network-first for HTML so this should self-heal on the next page load. Hard-refresh (`Cmd+Shift+R`) if needed.

**Workflows page is empty.** You haven't run `npm run sync-workflows` yet, or your tags don't match the convention. Check the n8n workflow has all three tags: `evolution`, `pillar:<x>`, `phase:start|end`.

**Devicon icons missing.** The slug doesn't exist on icongr.am. Browse https://icongr.am/devicon/ for the correct one, or remove the `icon:` field — the text label still renders.
