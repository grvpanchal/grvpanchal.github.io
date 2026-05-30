# Evolution Framework — Restructure Plan

> The 7-pillar framework + n8n routines I use to keep myself growing — fork it, run it, evolve.

This document records the design decisions made in the `/grill-me` session for restructuring this repo into the Evolution Framework: a forkable template that bundles the 7-pillar self-assessment Vue app, sanitized n8n workflow JSONs, and a templated personal portfolio.

## Audience and intent

**Primary audience: adopters / forkers.** People who want to copy the Evolution Framework and run it for themselves. The site reads as: *here's the framework, here are the workflows, fork and replicate.* All static. **No live personal data is published.**

The repo serves *two* purposes simultaneously:
1. **Gaurav's personal portfolio** at `grvpanchal.me` (rendered from his data).
2. **A fork-and-replicate template** — anyone can fork, run `npm run onboard`, and have their own Evolution Framework site with their own identity, projects, resume, and (optionally) their own n8n workflows.

The structural invariant: anything inside `evolution/`, `workflows/`, root config files, scripts, and `_layouts/`/`_includes/` is **generic and forkable**; anything inside `site/` is **personal**. A forker can `rm -rf site/*` and re-run onboard to start clean.

## The 13 design decisions

### Q1 — Audience: (a) adopters / forkers
Site = framework + workflows showcase + fork pathway. No live personal-data dashboard. Privacy preserved.

### Q2 — Repo structure: (ii) single repo, clean folder separation
Personal pages move to `site/`. Forkable assets stay at root. One-line forker cleanup: "delete everything in `site/`."

### Q3 — URL preservation: (i) Jekyll permalinks
Files physically move to `site/`, but `permalink:` front-matter on each page keeps `/resume`, `/personal`, etc. unchanged. Zero broken inbound links. **`radhika-resume.html` and `shweta-resume.html` are deleted** — their owners don't use them.

### Q4 — Root URL: (i) `index.html` stays at root, templatized
Personal data driven from `_data/*.yml`. Forker runs `npm run onboard` to overwrite the data with theirs. Gaurav's data ships in the repo as the default, so `grvpanchal.me` keeps rendering.

### Q5 — Workflow surfacing: (ii) AND (iii) — both views
- **(ii) Per-pillar inside the Vue app** — each pillar card gains a "Workflows" section showing its Start + End workflows in context.
- **(iii) `/workflows/` catalog page** — Jekyll-rendered, browsable list with import-to-n8n buttons. Also serves as a public URL for sharing individual workflow JSONs.

Both consume the same `_data/workflows.yml` registry. Single source of truth, two views.

### Q6 — Workflow storage + metadata
- **Folder layout**: flat — `workflows/ceo-start.json`, `workflows/ceo-end.json`, etc. Pillar prefix in filename.
- **Metadata location**: single registry `_data/workflows.yml` with `id, pillar, phase, name, description, integrations, screenshot, json_path, active` per workflow.

### Q7 — Routine semantics + sanitization
**Routine lifecycle is universal across pillars** (binary `phase: start | end`):
- **CEO, CFO, CXO, CIO, CTO**: `start` = discipline check + action recommendation; user does the routine; `end` = analysis + reward (project / alignment data).
- **CMO**: `start` = content authoring; `end` = publish + analytics projection.
- **COO**: `start` covers define/plan/execute; `end` is auto-triggered for reflect, scheduled by last routine item time. (Captured in description; `sub_phases` field can be added later if needed.)

**Catalog grouping label**: "Routine Start" / "Routine End".

**Sanitization (option ii)**: `scripts/sanitize-workflow.js` strips known-sensitive fields (credential IDs, webhook URLs with secret paths, inline API keys, personal payload data) and replaces them with `<<REPLACE_ME>>` placeholders. Run on every JSON before commit. Forkers see placeholders as built-in documentation of what to plug in.

### Q8 — n8n sync: tag convention + source-of-truth
- **Tags in n8n** (three per workflow): `evolution`, `pillar:ceo`, `phase:start`. Sync filters by `evolution` and parses the others.
- **Source-of-truth policy (ii) hybrid**: n8n owns JSON + workflow `name` + tag-derived fields (`pillar`, `phase`). Repo owns prose + presentation (`description`, `integrations`, `screenshot`, `active`). Sync merges by reading existing `_data/workflows.yml`, updating tag-derived fields, preserving the rest.

### Q9 — Onboarding script
- **Tech**: Node (`npm run onboard`). Adds `package.json` to the otherwise-Ruby project. Acceptable trade-off for ubiquity.
- **Lifecycle**: re-runnable with smart defaults. Each prompt shows the existing value as default; Enter to keep, type to change.
- **Scope**: data files + Jekyll/PWA config. Writes `_data/owner.yml`, `_data/projects.yml`, `_data/sectors.yml`, `_data/resume.yml`, `_config.yml` (title/url/email/description), `manifest.json` (name/short_name/theme_color), prompts for `CNAME` (custom domain or delete), prompts for PWA enable (default yes), bumps service worker cache version. Tells user where to drop `profile.jpg` + favicon (binary files stay manual).

### Q10 — Service worker
- **Strategy**: switch to **network-first for HTML, cache-first for assets**. Cache-first on HTML breaks badly with data-driven content. Surgical change in fetch handler (~10 lines, branch on `request.destination === 'document'`).
- **Cache-version bump**: auto-bump on `npm run onboard`. Defense in depth.
- **PWA opt-in**: ask in onboarding ("Enable PWA / offline support?"), default yes. On no, onboard removes SW registration from `index.html`, deletes `service-worker.js` + `manifest.json`.

### Q11 — Catalog + Vue integration
- **Catalog (`/workflows/`)**: grouped by pillar, Start / End paired side-by-side. Each card: name (from n8n), description (from `_data/workflows.yml`), integration badges, primary "Import to n8n" button → raw JSON URL, secondary "View JSON" link, optional screenshot, greyed if `active: false`.
- **Vue app integration**: runtime fetch. Jekyll emits `workflows.json` (1-line Liquid file: `--- layout: null --- {{ site.data.workflows | jsonify }}`). Vue app `fetch('/workflows.json')`, filters by current pillar, renders inline. Vue app stays self-contained per CLAUDE.md.

### Q12 — Naming + pitch + icons
- **Name**: **Evolution Framework**.
- **One-line pitch**: *"The 7-pillar framework + n8n routines I use to keep myself growing — fork it, run it, evolve."* Used in root H1 subtitle, manifest description, README first line.
- **Skill icons**: icongr.am devicon — `https://icongr.am/devicon/{slug}-original.svg`. Tags and skills have `{name|text, icon?}` shape; icon optional. Concepts (e.g., "Web App Performance") render as text-only badges. Accept CDN dependency; broken-image alt text covers degradation.

### Q13 — Execution order
See **Phases** below.

---

## Phases

### Phase 1 — Foundation (no user-visible change)
1. Add `package.json` + minimal Node deps (`inquirer`, `js-yaml`, `dotenv`).
2. Create `_data/owner.yml`, `_data/projects.yml`, `_data/sectors.yml`, `_data/resume.yml` populated with current hardcoded data.
3. Refactor `index.html` to consume `_data/` via Liquid. Diff rendered output against the original — must match modulo whitespace.
4. Refactor `resume.html` similarly. Same diff check.
5. Move other personal pages (`personal.html`, `strategy.html`, `n8n-app.html`, `routine.html`, `routine-waitlist.html`, `privacy.html`, `terms.html`) to `site/` with `permalink:` front-matter preserving their public URLs.
6. Delete `radhika-resume.html`, `shweta-resume.html`, `test-post.html`.
7. Commit. Site looks identical.

### Phase 2 — Workflows half
8. Manual one-time export of 14 n8n workflows. **Action required from Gaurav**: log in to n8n, tag each workflow with the three-tag convention, export each.
9. Build `scripts/sanitize-workflow.js`. Run on every exported JSON. Save to `workflows/{pillar}-{phase}.json`.
10. Build `scripts/sync-workflows.js` (hits n8n REST API, pulls tagged workflows, sanitizes, merges into `_data/workflows.yml` per policy (ii)). Add `.env.example` with `N8N_BASE_URL`, `N8N_API_KEY` placeholders.
11. Hand-write first version of `_data/workflows.yml`. Sync script merges going forward.
12. Build `/workflows/index.html` Liquid catalog page (grouped/paired layout).
13. Add `workflows.json` Liquid emitter file.
14. Update Vue app (`evolution/app.js`): per-pillar workflows section + `fetch('/workflows.json')`.
15. Commit. Workflows visible in two places.

### Phase 3 — Onboarding + PWA + docs
16. Build `scripts/onboard.js` (data files + `_config.yml` + `manifest.json` + CNAME prompt + PWA opt-in + SW cache bump).
17. Update `service-worker.js`: network-first for HTML, cache-first for assets.
18. Write `README.md` (forker-facing; lead with pitch, then "fork and run `npm run onboard`").
19. Write `FORKING.md` setup checklist (every step from fork to live site).
20. Commit.

### Phase 4 — Verification
21. `bundle exec jekyll serve` — visual check every page.
22. Fresh-fork test: clone repo into a temp dir, run `npm run onboard` with throwaway answers, verify alternate-identity site renders.
23. Push to `master`, verify `grvpanchal.me` deploys cleanly.

---

## Risks watched

- **Phase 1.3/1.4 fragility**: Liquid output must match original HTML exactly. Wide blast radius if it doesn't. Mitigation: diff side-by-side in browser dev-tools before commit.
- **Phase 2.8 manual step**: depends on Gaurav exporting + tagging 14 workflows in n8n. Half-hour of focused work; can't be automated yet (the script needs sanitized JSONs to test against).
- **icongr.am CDN dependency**: external service can go down. Mitigation: alt-text fallback, accept the risk.
- **Phase 4.22 is the one real test of forkability.** Skipping it means we ship untested.
- **Service worker stale cache during transition**: returning visitors may see stale `index.html` until SW updates. The network-first switch (Phase 3.17) fixes this going forward, but during the migration itself, Phase 1.7's commit may sit briefly behind a stale cache. Bumping SW version on that commit closes the gap.

## Out of scope

- A live personal-data dashboard (option (b) from Q1) — not built. Available as future work.
- Auto-sync via GitHub Action (option (3) from Q8) — manual `npm run sync-workflows` for now. Promote to Action later if desired.
- Auto-fit resume layout (option (C) from the resume contract) — not feasible on GitHub Pages. Single-page A4 with "trim to fit" is the contract.
- Headless-browser screenshot generation for workflow cards — manual screenshots only.
- CI / linting / tests — none added.
