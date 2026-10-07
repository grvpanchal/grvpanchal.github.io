#!/usr/bin/env node
/**
 * Content-integrity guard for the built site.
 *
 * UI/styling changes (often AI-assisted) must not silently alter what a reader sees or
 * where links go. This fingerprints every page in _site/ — visible text, headings, links,
 * images + alt text, form fields, aria labels, <title> and meta descriptions — while
 * ignoring <style>, <script>, class names and inline styles, so presentation can change
 * freely but content cannot.
 *
 * Usage (after `bundle exec jekyll build`):
 *   node scripts/integrity-check.js            # compare _site/ against the committed baseline
 *   node scripts/integrity-check.js --update   # re-record the baseline (only for intentional content changes)
 *
 * Exit code 1 on any difference, listing each page and field that changed.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const SITE = path.join(ROOT, '_site');
const BASELINE = path.join(__dirname, 'integrity-baseline.json');

const decode = (s) => s
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&middot;/g, '·')
  .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
const norm = (s) => decode(s).replace(/\s+/g, ' ').trim();
const attr = (tag, name) => {
  const m = new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(tag);
  return m ? norm(m[2] ?? m[3] ?? m[4] ?? '') : null;
};
const tags = (html, name) => html.match(new RegExp(`<${name}\\b[^>]*>`, 'gi')) || [];

function fingerprint(html) {
  const head = (/<head\b[^>]*>([\s\S]*?)<\/head>/i.exec(html) || [, ''])[1];
  // Drop non-content: scripts, styles, comments, templates, noscript.
  const body = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|template|noscript)\b[\s\S]*?<\/\1>/gi, '');

  const metas = {};
  for (const t of tags(head, 'meta')) {
    const key = attr(t, 'name') || attr(t, 'property');
    if (key && /^(description|og:|twitter:|robots)/i.test(key)) metas[key] = attr(t, 'content');
  }

  const headings = [];
  body.replace(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, h, inner) => {
    headings.push(`${h.toLowerCase()}: ${norm(inner.replace(/<[^>]+>/g, ' '))}`);
  });

  const text = norm(
    (/<body\b[^>]*>([\s\S]*)<\/body>/i.exec(body) || [, body])[1]
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/(p|div|li|h[1-6]|section|header|footer|td|th|tr|label|a|span|button)>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  );

  return {
    title: norm((/<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(head) || [, ''])[1]),
    canonical: (tags(head, 'link').map((t) => (/rel\s*=\s*["']?canonical/i.test(t) ? attr(t, 'href') : null)).find(Boolean)) || null,
    metas,
    headings,
    links: tags(body, 'a').map((t) => attr(t, 'href')).filter((h) => h !== null),
    images: tags(body, 'img').map((t) => `${attr(t, 'src')} | alt=${attr(t, 'alt')}`),
    forms: tags(body, 'form').map((t) => `${attr(t, 'method')} ${attr(t, 'action')}`),
    fields: [...tags(body, 'input'), ...tags(body, 'textarea'), ...tags(body, 'select')]
      .map((t) => ['name', 'type', 'placeholder', 'value', 'required'].map((a) => `${a}=${attr(t, a)}`).join(' ')),
    ariaLabels: (body.match(/\saria-label\s*=\s*("[^"]*"|'[^']*')/gi) || []).map((m) => norm(m.replace(/^\s*aria-label\s*=\s*/i, '').slice(1, -1))),
    textHash: crypto.createHash('sha256').update(text).digest('hex').slice(0, 16),
    text,
  };
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function snapshot() {
  if (!fs.existsSync(SITE)) {
    console.error('No _site/ — run `bundle exec jekyll build` first.');
    process.exit(2);
  }
  const pages = {};
  for (const f of walk(SITE).sort()) pages[path.relative(SITE, f)] = fingerprint(fs.readFileSync(f, 'utf8'));
  return pages;
}

function firstDiff(a, b) {
  const wa = a.split(' '), wb = b.split(' ');
  let i = 0;
  while (i < wa.length && wa[i] === wb[i]) i++;
  return `…${wa.slice(Math.max(0, i - 6), i + 8).join(' ')}…  →  …${wb.slice(Math.max(0, i - 6), i + 8).join(' ')}…`;
}

const current = snapshot();
if (process.argv.includes('--update')) {
  fs.writeFileSync(BASELINE, JSON.stringify(current, null, 2) + '\n');
  console.log(`Recorded integrity baseline for ${Object.keys(current).length} pages → ${path.relative(ROOT, BASELINE)}`);
  process.exit(0);
}
if (!fs.existsSync(BASELINE)) {
  console.error('No baseline yet — run with --update on a known-good build first.');
  process.exit(2);
}

const base = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
const problems = [];
for (const page of new Set([...Object.keys(base), ...Object.keys(current)])) {
  if (!current[page]) { problems.push(`${page}: page missing from build`); continue; }
  if (!base[page]) { problems.push(`${page}: new page not in baseline`); continue; }
  for (const field of Object.keys(base[page])) {
    if (field === 'text') continue; // reported via textHash
    const was = JSON.stringify(base[page][field]);
    const now = JSON.stringify(current[page][field]);
    if (was === now) continue;
    problems.push(field === 'textHash'
      ? `${page}: visible text changed  ${firstDiff(base[page].text, current[page].text)}`
      : `${page}: ${field} changed\n      was: ${was.slice(0, 300)}\n      now: ${now.slice(0, 300)}`);
  }
}

if (problems.length) {
  console.error(`✗ Content integrity check FAILED (${problems.length} difference(s)):\n  - ${problems.join('\n  - ')}`);
  console.error('\nIf these content changes are intentional, re-record with: node scripts/integrity-check.js --update');
  process.exit(1);
}
console.log(`✓ Content integrity OK — ${Object.keys(current).length} pages match the baseline (text, headings, links, images/alt, forms, meta).`);
