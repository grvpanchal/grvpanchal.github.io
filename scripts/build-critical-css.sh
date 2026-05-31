#!/usr/bin/env bash
# Regenerates _includes/home-critical-css.html from the home page's CSS sources.
#
# The home layout inlines its CSS in a <style> block to eliminate render-blocking
# stylesheet requests (key to the page's 100 Lighthouse performance score). Run
# this after editing any of the source files below, then rebuild Jekyll.
#
#   ./scripts/build-critical-css.sh
#
set -euo pipefail
cd "$(dirname "$0")/.."

OUT=_includes/home-critical-css.html
CSS_DIR=assets/css

{
  echo '<!-- Critical CSS inlined to eliminate render-blocking requests on the home page.'
  echo '     Source files: assets/css/chota.min.css, style.min.css, blog-feed.css.'
  echo '     Regenerate with ./scripts/build-critical-css.sh after editing those. -->'
  echo '<style>'
  # Order matters: Chota must come LAST so it wins equal-specificity ties against
  # style.min.css — the site's styles were authored against the standalone page,
  # which linked Chota after style.min.css/blog-feed.css. Loading Chota first
  # (the obvious order) silently broke the hero column width and the nav-tab
  # hover/active underline (.tabs>a:hover border-bottom vs .menu .tabs a border:none,
  # both specificity 0,2,1 — last one wins).
  #
  # Inline <style> resolves relative url()s against the page, not the stylesheet,
  # so rewrite the sprite's ../../ path to an absolute one.
  sed 's#\.\./\.\./assets/img/#/assets/img/#g' "$CSS_DIR/style.min.css"
  echo ''
  sed 's#\.\./\.\./assets/img/#/assets/img/#g' "$CSS_DIR/blog-feed.css"
  echo ''
  cat "$CSS_DIR/chota.min.css"
  echo ''
  echo '.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}'
  echo '</style>'
} > "$OUT"

echo "Wrote $OUT ($(wc -c < "$OUT") bytes)"
