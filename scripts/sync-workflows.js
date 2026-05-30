#!/usr/bin/env node
/**
 * Pull tagged workflows from your n8n instance, sanitize, and merge into
 * `_data/workflows.yml` and `workflows/<id>.json`.
 *
 * Tag convention (set in n8n on each workflow):
 *   - evolution                     (root marker; only tagged workflows are pulled)
 *   - pillar:ceo | coo | cto | cio | cfo | cxo | cmo
 *   - phase:start | end
 *
 * Source-of-truth policy (Q8 hybrid):
 *   - n8n owns: workflow JSON, name, pillar, phase
 *   - repo owns: description, integrations, screenshot, active flag
 *
 * Existing entries in `_data/workflows.yml` are preserved across sync — only the
 * n8n-owned fields are overwritten. New workflows get default placeholder values
 * for the repo-owned fields; remove them with `npm run sync-workflows --prune`.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { sanitize } = require('./sanitize-workflow');

const REPO_ROOT = path.join(__dirname, '..');
const WORKFLOWS_DIR = path.join(REPO_ROOT, 'workflows');
const REGISTRY_PATH = path.join(REPO_ROOT, '_data', 'workflows.yml');

const N8N_BASE_URL = process.env.N8N_BASE_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;
const SHOWCASE_TAG = process.env.N8N_SHOWCASE_TAG || 'evolution';

if (!N8N_BASE_URL || !N8N_API_KEY) {
  console.error('Missing N8N_BASE_URL or N8N_API_KEY. Copy .env.example to .env and fill in.');
  process.exit(1);
}

const PRUNE = process.argv.includes('--prune');

async function n8nFetch(p) {
  const url = `${N8N_BASE_URL.replace(/\/$/, '')}/api/v1${p}`;
  const res = await fetch(url, {
    headers: { 'X-N8N-API-KEY': N8N_API_KEY, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`n8n API ${res.status} ${res.statusText} at ${url}`);
  return res.json();
}

function parseTags(tags) {
  // n8n tag arrays come back as [{id, name}, ...] or just [name, ...] depending on endpoint.
  const names = (tags || []).map((t) => (typeof t === 'string' ? t : t.name)).filter(Boolean);
  let pillar, phase;
  for (const t of names) {
    const m = t.match(/^(pillar|phase):(.+)$/i);
    if (!m) continue;
    if (m[1].toLowerCase() === 'pillar') pillar = m[2].toLowerCase();
    if (m[1].toLowerCase() === 'phase') phase = m[2].toLowerCase();
  }
  return { rawTags: names, pillar, phase };
}

function buildId(pillar, phase) {
  return `${pillar}-${phase}`;
}

async function main() {
  // List all workflows; n8n's filtering by tag in API requires querystring `?tags=`.
  const list = await n8nFetch(`/workflows?tags=${encodeURIComponent(SHOWCASE_TAG)}`);
  const workflows = list.data || list; // n8n returns { data: [...] }
  console.error(`Pulled ${workflows.length} workflow(s) tagged "${SHOWCASE_TAG}" from n8n.`);

  // Load existing registry to merge against.
  const existing = fs.existsSync(REGISTRY_PATH)
    ? yaml.load(fs.readFileSync(REGISTRY_PATH, 'utf-8')) || []
    : [];
  const byId = new Map(existing.map((e) => [e.id, e]));

  fs.mkdirSync(WORKFLOWS_DIR, { recursive: true });

  const seenIds = new Set();
  const updated = [];

  for (const summary of workflows) {
    // Fetch full workflow (list endpoint may not include nodes).
    const full = await n8nFetch(`/workflows/${summary.id}`);
    const wf = full.data || full;

    const { pillar, phase, rawTags } = parseTags(wf.tags);
    if (!pillar || !phase) {
      console.error(`  ! skipping "${wf.name}" — missing pillar:* or phase:* tag (tags: ${rawTags.join(', ')})`);
      continue;
    }

    const id = buildId(pillar, phase);
    seenIds.add(id);

    // Sanitize and write JSON.
    const cleaned = sanitize(wf);
    const jsonPath = `workflows/${id}.json`;
    fs.writeFileSync(path.join(REPO_ROOT, jsonPath), JSON.stringify(cleaned, null, 2));

    // Merge registry entry.
    const prev = byId.get(id) || {};
    const merged = {
      id,
      pillar: pillar.toUpperCase(),
      phase,
      name: wf.name,            // n8n-owned
      description: prev.description || '',         // repo-owned
      integrations: prev.integrations || [],       // repo-owned
      screenshot: prev.screenshot || null,         // repo-owned
      active: prev.active === undefined ? true : prev.active,
      json_path: `/${jsonPath}`,
    };
    updated.push(merged);
    console.error(`  ✓ ${id} → ${jsonPath}  (${wf.name})`);
  }

  // Preserve unpulled entries unless --prune.
  if (!PRUNE) {
    for (const e of existing) {
      if (!seenIds.has(e.id)) updated.push(e);
    }
  }

  // Sort: pillar in canonical order, phase start-before-end.
  const PILLAR_ORDER = ['CEO', 'COO', 'CTO', 'CIO', 'CFO', 'CXO', 'CMO'];
  updated.sort((a, b) => {
    const pa = PILLAR_ORDER.indexOf(a.pillar);
    const pb = PILLAR_ORDER.indexOf(b.pillar);
    if (pa !== pb) return pa - pb;
    return a.phase === 'start' ? -1 : 1;
  });

  fs.writeFileSync(REGISTRY_PATH, yaml.dump(updated, { lineWidth: 120, noRefs: true }));
  console.error(`\nWrote ${updated.length} entries to _data/workflows.yml`);
  console.error('Review the diff and edit `description` / `integrations` for any new workflows.');
}

main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});
