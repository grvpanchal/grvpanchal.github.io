#!/usr/bin/env node
/**
 * Re-runnable onboarding wizard.
 *
 * Walks through identity, social links, blog feed, contact form, Jekyll config,
 * PWA manifest, custom domain, PWA opt-in, and bumps the service-worker cache.
 *
 * Existing values are shown as defaults; press Enter to keep, type to change.
 * Skill / project / resume data lives in _data/*.yml — edit those directly.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { input, confirm, select } = require('@inquirer/prompts');

const ROOT = path.join(__dirname, '..');
const P = (p) => path.join(ROOT, p);

const SOCIAL_PLATFORMS = [
  { platform: 'linkedin',  icon_class: 'bg-linkedin_square' },
  { platform: 'facebook',  icon_class: 'bg-facebook' },
  { platform: 'twitter',   icon_class: 'bg-twitter' },
  { platform: 'instagram', icon_class: 'bg-instagram' },
  { platform: 'github',    icon_class: 'bg-github' },
];

async function main() {
  console.log('\nEvolution Framework — onboarding\n');
  console.log('Press Enter on any prompt to keep the current value.\n');

  // ----- _data/owner.yml -----
  const ownerPath = P('_data/owner.yml');
  const owner = yaml.load(fs.readFileSync(ownerPath, 'utf-8')) || {};

  console.log('--- Identity ---');
  owner.name = await input({ message: 'Your name', default: owner.name });
  owner.tagline = await input({ message: 'Tagline (one-line bio)', default: owner.tagline });
  owner.title_suffix = await input({ message: 'Title suffix (e.g., "The Coder")', default: owner.title_suffix || '' });
  owner.meta_description = await input({ message: 'Meta description (search engines)', default: owner.meta_description || owner.tagline });
  owner.profile_image = await input({ message: 'Profile image path', default: owner.profile_image || '/assets/img/profile.jpg' });

  console.log('\n--- Social links (leave blank to skip a platform) ---');
  const social = [];
  const existingByPlatform = Object.fromEntries((owner.social || []).map((s) => [s.platform, s]));
  for (const p of SOCIAL_PLATFORMS) {
    const prev = existingByPlatform[p.platform];
    const url = await input({
      message: `${p.platform} URL`,
      default: prev ? prev.url : '',
    });
    if (url.trim()) social.push({ ...p, url: url.trim() });
  }
  owner.social = social;

  console.log('\n--- Blog feed ---');
  owner.blog = owner.blog || {};
  owner.blog.feed_url = await input({ message: 'RSS feed URL (leave blank to disable blog section)', default: owner.blog.feed_url || '' });
  owner.blog.more_posts_url = await input({ message: '"More posts" URL', default: owner.blog.more_posts_url || '' });

  console.log('\n--- Contact form ---');
  owner.contact_form_action = await input({
    message: 'Contact form POST endpoint (Lambda / Formspree / etc.)',
    default: owner.contact_form_action || '',
  });

  console.log('\n--- Analytics ---');
  owner.google_analytics_id = await input({
    message: 'Google Analytics ID (blank to disable)',
    default: owner.google_analytics_id || '',
  });

  fs.writeFileSync(ownerPath, yaml.dump(owner, { lineWidth: 120 }));
  console.log('  ✓ wrote _data/owner.yml');

  // ----- _config.yml (line-based to preserve comments) -----
  console.log('\n--- Jekyll site config ---');
  const cfgPath = P('_config.yml');
  let cfg = fs.readFileSync(cfgPath, 'utf-8');
  const cfgGet = (key) => {
    const m = cfg.match(new RegExp(`^${key}:\\s*"?([^"\\n]*?)"?\\s*$`, 'm'));
    return m ? m[1] : '';
  };
  const cfgSet = (key, value) => {
    const safe = value.includes(':') || value.includes('#') ? `"${value.replace(/"/g, '\\"')}"` : value;
    const re = new RegExp(`^${key}:.*$`, 'm');
    if (re.test(cfg)) cfg = cfg.replace(re, `${key}: ${safe}`);
    else cfg += `\n${key}: ${safe}\n`;
  };

  const siteTitle = await input({ message: 'Jekyll site title', default: cfgGet('title') || owner.name });
  const siteEmail = await input({ message: 'Site contact email', default: cfgGet('email') });
  const siteDesc  = await input({ message: 'Site description (RSS / SEO)', default: owner.tagline });
  const siteUrl   = await input({ message: 'Site URL (e.g., https://yourdomain.com — blank for github.io default)', default: cfgGet('url') });
  const twitter   = await input({ message: 'Twitter handle (no @)', default: cfgGet('twitter_username') });
  const github    = await input({ message: 'GitHub username', default: cfgGet('github_username') });

  cfgSet('title', siteTitle);
  cfgSet('email', siteEmail);
  cfgSet('description', siteDesc);
  cfgSet('url', siteUrl);
  cfgSet('twitter_username', twitter);
  cfgSet('github_username', github);
  fs.writeFileSync(cfgPath, cfg);
  console.log('  ✓ wrote _config.yml');

  // ----- CNAME -----
  console.log('\n--- Custom domain ---');
  const cnamePath = P('CNAME');
  const cnameExists = fs.existsSync(cnamePath);
  const currentDomain = cnameExists ? fs.readFileSync(cnamePath, 'utf-8').trim() : '';
  const useCustom = await confirm({
    message: `Use a custom domain?${currentDomain ? ` (currently: ${currentDomain})` : ''}`,
    default: !!currentDomain,
  });
  if (useCustom) {
    const dom = await input({ message: 'Domain (e.g., yourdomain.com)', default: currentDomain });
    fs.writeFileSync(cnamePath, dom + '\n');
    console.log(`  ✓ wrote CNAME → ${dom}`);
  } else if (cnameExists) {
    fs.unlinkSync(cnamePath);
    console.log('  ✓ deleted CNAME');
  }

  // ----- PWA opt-in -----
  console.log('\n--- PWA / offline support ---');
  const swPath = P('service-worker.js');
  const manifestPath = P('manifest.json');
  const pwaCurrentlyOn = fs.existsSync(swPath) && fs.existsSync(manifestPath);
  const enablePwa = await confirm({
    message: `Enable PWA / offline support?`,
    default: pwaCurrentlyOn,
  });

  if (enablePwa) {
    // Update manifest.
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      manifest.name = await input({ message: 'PWA name (full)', default: manifest.name || owner.name });
      manifest.short_name = await input({ message: 'PWA short name (≤12 chars)', default: manifest.short_name || owner.name.split(' ')[0] });
      manifest.description = await input({ message: 'PWA description', default: manifest.description || owner.tagline });
      manifest.theme_color = await input({ message: 'PWA theme color (hex)', default: manifest.theme_color || '#FFFFFF' });
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
      console.log('  ✓ wrote manifest.json');
    }

    // Bump SW cache version.
    if (fs.existsSync(swPath)) {
      const sw = fs.readFileSync(swPath, 'utf-8');
      const bumped = sw.replace(/precache-v(\d+)/g, (_, n) => `precache-v${parseInt(n, 10) + 1}`);
      fs.writeFileSync(swPath, bumped);
      console.log('  ✓ bumped service-worker.js cache version');
    }
  } else if (pwaCurrentlyOn) {
    if (fs.existsSync(swPath)) fs.unlinkSync(swPath);
    if (fs.existsSync(manifestPath)) fs.unlinkSync(manifestPath);
    // Strip SW registration + manifest link from index.html.
    const idxPath = P('index.html');
    if (fs.existsSync(idxPath)) {
      // index.html itself is just frontmatter; the SW reg lives in _layouts/home.html.
      const layoutPath = P('_layouts/home.html');
      let layout = fs.readFileSync(layoutPath, 'utf-8');
      layout = layout.replace(/<script src=["']service-worker\.js["']><\/script>\s*/g, '');
      layout = layout.replace(/<link rel=["']manifest["'][^>]*>\s*/g, '');
      fs.writeFileSync(layoutPath, layout);
      console.log('  ✓ removed PWA references from _layouts/home.html');
    }
    console.log('  ✓ deleted service-worker.js + manifest.json');
  }

  console.log('\n✅ Done.');
  console.log('\nWhat onboarding did NOT touch (edit these by hand if you want):');
  console.log('  • _data/sectors.yml, _data/projects.yml — your project sectors and entries');
  console.log('  • _data/skills.yml — home-page skills tab');
  console.log('  • _data/resume.yml — your CV (multi-page)');
  console.log('  • _data/workflows.yml — populated by `npm run sync-workflows` after you tag your n8n workflows');
  console.log('  • assets/img/profile.jpg, favicon.ico — drop your image files at these paths');
  console.log('\nPreview locally:  bundle exec jekyll serve');
  console.log('Then commit + push when happy.\n');
}

main().catch((e) => {
  if (e?.name === 'ExitPromptError') { console.log('\nAborted.'); process.exit(0); }
  console.error(e.stack || e.message);
  process.exit(1);
});
