# Evolution Framework

> The 7-pillar framework + n8n routines I use to keep myself growing — fork it, run it, evolve.

A forkable personal-development system, built on a static Jekyll site:

- **A self-assessment app** at `/evolution/` that scores you across 7 pillars (CEO, COO, CTO, CIO, CFO, CXO, CMO of you) and tracks progress in localStorage.
- **14 sanitized n8n workflows** (a Routine Start + Routine End for each pillar) that automate the daily / weekly practices each pillar needs. Importable into your own n8n instance.
- **A templated portfolio** (homepage, projects, resume) driven entirely from `_data/*.yml` so a forker can replace identity in one onboarding pass.

This repo is two things at once: it's the live site at **[grvpanchal.me](https://grvpanchal.me)**, and it's a template anyone can fork. The `site/` folder holds whatever's *currently personal*; everything outside it is generic and forkable.

---

## Fork and run it yourself

```bash
git clone <your-fork-url>
cd <your-fork>
bundle install         # Jekyll + Ruby deps
npm install            # onboard + sync scripts
npm run onboard        # interactive: replaces my data with yours
bundle exec jekyll serve   # preview at http://127.0.0.1:4000
```

Then drop your `assets/img/profile.jpg` and `favicon.ico` in place, edit `_data/projects.yml` / `_data/resume.yml` for your content, push to `master`, and GitHub Pages auto-deploys.

Detailed setup walkthrough → [FORKING.md](./FORKING.md).

---

## What's in the repo

| Path | What it is |
|------|------------|
| `index.html`, `resume.html` | Frontmatter shells; render via `_layouts/home.html` and `_layouts/resume.html` from `_data/*.yml` |
| `site/` | Pages personal to the current site occupant — delete or replace |
| `evolution/` | Self-contained Vue.js self-assessment app (the 7-pillar dashboard) |
| `workflows/` | Sanitized n8n workflow JSONs + catalog page at `/workflows/` |
| `_data/owner.yml` | Identity, social links, blog feed, contact form, analytics ID |
| `_data/sectors.yml`, `projects.yml`, `skills.yml` | Homepage projects + skills |
| `_data/resume.yml` | Multi-page CV (header, profile, experience, projects, education, sidebars) |
| `_data/workflows.yml` | Workflow registry; populated by `npm run sync-workflows` |
| `scripts/onboard.js` | Re-runnable identity wizard |
| `scripts/sync-workflows.js` | Pulls workflows from your n8n by tag |
| `scripts/sanitize-workflow.js` | Strips credentials / webhooks / secrets before commit |
| `service-worker.js` + `manifest.json` | PWA (network-first HTML, cache-first assets) |
| `PLAN.md` | Full design rationale for the restructure |

---

## Wiring the workflows to your n8n

The Vue assessment shows the framework theory; the workflows make it real. Setup is a one-time pass:

1. Tag each of your workflows in n8n with three tags:
   - `evolution` (root marker)
   - `pillar:ceo` (or `coo`, `cto`, `cio`, `cfo`, `cxo`, `cmo`)
   - `phase:start` or `phase:end`
2. `cp .env.example .env` and fill in `N8N_BASE_URL` + `N8N_API_KEY` (generate the key in n8n Settings → n8n API).
3. `npm run sync-workflows`.

The script pulls each tagged workflow, runs `sanitize-workflow.js` over the JSON (strips credential IDs, webhook secrets, inline API keys, replaces with `<<REPLACE_ME>>`), and merges into `_data/workflows.yml`. Your edits to `description` and `integrations` in `_data/workflows.yml` are preserved across re-syncs — only n8n-owned fields (name, pillar, phase, JSON) are overwritten.

After sync, the workflows appear in two places:
- The pillar detail modal in the Vue assessment (`/evolution/`)
- The public catalog at `/workflows/` with import-to-n8n buttons

---

## Local development

```bash
bundle exec jekyll serve     # http://127.0.0.1:4000 — auto-rebuild on file change
bundle exec jekyll build     # one-off build into _site/
```

There are no tests, linters, or CI workflows. GitHub Pages auto-deploys from `master`.

If you edit any precached asset (`assets/css/style.min.css`, `assets/js/main.min.js`, `assets/img/background.jpg`, `assets/img/css_sprites.png`), bump `PRECACHE` in `service-worker.js` (e.g., `v12` → `v13`). `npm run onboard` does this automatically when run.

---

## License

The framework, scripts, and template structure are MIT-licensed (see `LICENSE` if present, else assume MIT). Personal content under `site/`, `_data/owner.yml`, `_data/projects.yml`, `_data/resume.yml`, and the workflow descriptions belongs to the current site occupant — replace it with yours when you fork.
