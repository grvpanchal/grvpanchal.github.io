#!/usr/bin/env node
/**
 * Strip credentials, webhook secrets, and inline API keys from an n8n workflow JSON,
 * replacing them with <<REPLACE_ME>> placeholders. Forkers see the placeholders as
 * built-in documentation of what to plug in.
 *
 * Usage:
 *   node scripts/sanitize-workflow.js <input.json> <output.json>
 *   node scripts/sanitize-workflow.js < raw-export.json > workflows/ceo-start.json
 *
 * Programmatic:
 *   const { sanitize } = require('./scripts/sanitize-workflow');
 *   const clean = sanitize(rawWorkflowObject);
 */

const fs = require('fs');

const PLACEHOLDER = '<<REPLACE_ME>>';

// Heuristics for detecting secrets inside string values.
// Hits common API key shapes; deliberately conservative to avoid false positives
// that would mangle real workflow logic.
const SECRET_PATTERNS = [
  /^sk-[A-Za-z0-9_-]{20,}$/,        // OpenAI / Anthropic-style
  /^Bearer\s+[A-Za-z0-9._-]{20,}$/i,
  /^[A-Za-z0-9]{32,}$/,             // long opaque tokens (≥32 chars, alphanumeric only)
  /^xox[bps]-[A-Za-z0-9-]{10,}$/,   // Slack
  /^ghp_[A-Za-z0-9]{30,}$/,         // GitHub PAT
  /^AKIA[0-9A-Z]{16}$/,             // AWS access key
  /AIza[0-9A-Za-z_-]{35}/,          // Google API key
];

// Secrets embedded inside longer strings (URLs, Code-node jsCode). These are replaced
// in place so the surrounding URL / code stays readable.
const INLINE_SECRET_PATTERNS = [
  /\d{8,10}:[A-Za-z0-9_-]{35}/g,                                   // Telegram bot token (api.telegram.org/bot<token>/...)
  /\bsk-[A-Za-z0-9_-]{20,}/g,                                      // OpenAI / Anthropic-style
  /\b[a-z]{2,6}_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, // prefixed UUID keys (e.g. frt_...)
  /AIza[0-9A-Za-z_-]{35}/g,                                        // Google API key
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, // JWTs (Supabase / n8n API keys, etc.)
];

// Auth-scheme prefixes followed by an opaque token ("Bearer <uuid>", "Apikey <key>").
const AUTH_SCHEME_TOKEN = /\b(Bearer|Apikey|Token|Basic)\s+(?!<<REPLACE_ME>>)[A-Za-z0-9._~+/=-]{16,}/gi;

// Google Docs / Sheets / Drive IDs embedded in URLs (docs.google.com/.../d/<id>,
// lh3.googleusercontent.com/d/<id>, sheets.googleapis.com/v4/spreadsheets/<id>, drive folders/<id>).
const GOOGLE_DOC_URL_ID = /\/d\/[A-Za-z0-9_-]{25,}/g;
const GOOGLE_SHEETS_API_ID = /\/spreadsheets\/(?!d\/)[A-Za-z0-9_-]{25,}/g;
const GOOGLE_FOLDER_URL_ID = /\bfolders\/[A-Za-z0-9_-]{20,}/g;

// Secret-named keys assigned a literal inside Code-node JS, e.g. headers: { 'X-API-Key': '...' }.
const CODE_SECRET_ASSIGNMENT =
  /(['"]?(?:x-api-key|api[_-]?key|apikey|authorization|access[_-]?token|secret|password)['"]?\s*[:=]\s*)(['"])(?!<<REPLACE_ME>>)[^'"\s]{12,}\2/gi;

// n8n resource-locator params ({ __rl: true, value }) whose value identifies a private resource.
const RESOURCE_LOCATOR_KEYS = new Set([
  'documentid', 'spreadsheetid', 'folderid', 'driveid', 'fileid', 'calendar', 'calendarid', 'base', 'table',
]);

function scrubInline(value) {
  return INLINE_SECRET_PATTERNS.reduce((s, re) => s.replace(re, PLACEHOLDER), value)
    .replace(AUTH_SCHEME_TOKEN, `$1 ${PLACEHOLDER}`)
    .replace(GOOGLE_DOC_URL_ID, `/d/${PLACEHOLDER}`)
    .replace(GOOGLE_SHEETS_API_ID, `/spreadsheets/${PLACEHOLDER}`)
    .replace(GOOGLE_FOLDER_URL_ID, `folders/${PLACEHOLDER}`)
    .replace(CODE_SECRET_ASSIGNMENT, `$1$2${PLACEHOLDER}$2`);
}

function scrubResourceLocator(rl) {
  // Keep expressions ("={{ ... }}") and well-known non-private values like Drive "root".
  if (typeof rl.value === 'string' && !rl.value.startsWith('=') && rl.value !== 'root') rl.value = PLACEHOLDER;
  if (typeof rl.cachedResultUrl === 'string') rl.cachedResultUrl = PLACEHOLDER;
}

// Header / body keys that frequently carry secrets.
const SECRET_KEY_NAMES = new Set([
  'authorization', 'x-api-key', 'api-key', 'apikey', 'token',
  'bearer', 'secret', 'password', 'access_token', 'refresh_token',
  'private_key', 'client_secret',
]);

function isSecretValue(value) {
  if (typeof value !== 'string') return false;
  return SECRET_PATTERNS.some((re) => re.test(value));
}

function isSecretKey(key) {
  if (typeof key !== 'string') return false;
  return SECRET_KEY_NAMES.has(key.toLowerCase());
}

function sanitize(workflow) {
  const cleaned = JSON.parse(JSON.stringify(workflow)); // deep clone

  // Strip top-level n8n-internal fields a forker shouldn't import as-is.
  delete cleaned.id;
  delete cleaned.versionId;
  delete cleaned.meta;
  delete cleaned.shared;
  delete cleaned.triggerCount;
  delete cleaned.createdAt;
  delete cleaned.updatedAt;
  // n8n 2.x: the API response embeds a full, unsanitized copy of the published version.
  delete cleaned.activeVersion;
  delete cleaned.activeVersionId;
  delete cleaned.versionCounter;

  if (Array.isArray(cleaned.nodes)) {
    for (const node of cleaned.nodes) {
      // 1. Replace credential references (the schema is { CredType: { id, name } }).
      if (node.credentials && typeof node.credentials === 'object') {
        for (const credType of Object.keys(node.credentials)) {
          node.credentials[credType] = {
            id: PLACEHOLDER,
            name: `${PLACEHOLDER} (was: ${node.credentials[credType].name || ''})`.trim(),
          };
        }
      }

      // 2. Sanitize webhook IDs.
      if (node.webhookId) node.webhookId = PLACEHOLDER;

      // 3. Walk parameters tree, replacing secret-shaped values and secret-named keys.
      if (node.parameters) walkAndScrub(node.parameters);
    }
  }

  // 4. Sanitize webhook URLs that may live in pinData.
  if (cleaned.pinData) walkAndScrub(cleaned.pinData);

  return cleaned;
}

function walkAndScrub(obj) {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === 'object' && obj[i] !== null) {
        walkAndScrub(obj[i]);
      } else if (isSecretValue(obj[i])) {
        obj[i] = PLACEHOLDER;
      } else if (typeof obj[i] === 'string') {
        obj[i] = scrubInline(obj[i]);
      }
    }
    return;
  }

  if (typeof obj !== 'object' || obj === null) return;

  for (const key of Object.keys(obj)) {
    const value = obj[key];

    if (isSecretKey(key) && typeof value === 'string') {
      obj[key] = PLACEHOLDER;
      continue;
    }

    if (RESOURCE_LOCATOR_KEYS.has(key.toLowerCase()) && value && typeof value === 'object' && value.__rl) {
      scrubResourceLocator(value);
      continue;
    }

    if (typeof value === 'string') {
      // URL with hardcoded query secret.
      if (/[?&](api[_-]?key|token|secret|access_token)=[^&]+/i.test(value)) {
        obj[key] = scrubInline(value.replace(
          /([?&])(api[_-]?key|token|secret|access_token)=([^&]+)/gi,
          `$1$2=${PLACEHOLDER}`
        ));
      } else if (isSecretValue(value)) {
        obj[key] = PLACEHOLDER;
      } else {
        obj[key] = scrubInline(value);
      }
    } else if (typeof value === 'object' && value !== null) {
      walkAndScrub(value);
    }
  }
}

// CLI entry point.
if (require.main === module) {
  const args = process.argv.slice(2);
  let input;
  let outputPath;

  if (args.length === 0) {
    input = fs.readFileSync(0, 'utf-8'); // stdin
  } else if (args.length === 1) {
    input = fs.readFileSync(args[0], 'utf-8');
  } else if (args.length === 2) {
    input = fs.readFileSync(args[0], 'utf-8');
    outputPath = args[1];
  } else {
    console.error('Usage: sanitize-workflow.js [input.json] [output.json]');
    process.exit(1);
  }

  const workflow = JSON.parse(input);
  const cleaned = sanitize(workflow);
  const out = JSON.stringify(cleaned, null, 2);

  if (outputPath) {
    fs.writeFileSync(outputPath, out);
    console.error(`Sanitized → ${outputPath}`);
  } else {
    process.stdout.write(out);
  }
}

module.exports = { sanitize, PLACEHOLDER };
