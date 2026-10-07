/**
 * Home page UI enhancements — behaviour only, never content.
 *  - Sticky menu turns glassy once stuck, with a reading-progress hairline.
 *  - Scrollspy: the nav tab for the section in view is marked active.
 *  - Below-the-fold sections fade up as they enter the viewport.
 *  - Project tab labels become keyboard-operable (Tab + Enter/Space).
 * Everything degrades to the original static page if this script doesn't run.
 */
(function () {
  var menu = document.querySelector('.menu');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Glassy menu + reading progress (one rAF-throttled passive scroll handler) ----
  if (menu) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      menu.style.setProperty('--scroll-progress', max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : 0);
      menu.classList.toggle('is-scrolled', menu.getBoundingClientRect().top <= 0 && window.scrollY > 0);
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  if (!('IntersectionObserver' in window)) return;

  // ---- Scrollspy for the in-page nav tabs ----
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.menu .tabs a[href^="#"]'));
  var sections = tabs
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);
  if (sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        tabs.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + entry.target.id;
          a.classList.toggle('active', on);
          if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  // ---- Below-the-fold reveals (skipped entirely for reduced motion) ----
  if (!reduceMotion) {
    var targets = document.querySelectorAll(
      '#blog .content h1, #blog > .text-center, #projects .content h1, #projects .tab-wrapper-content, ' +
      '#contact .text-center h1, #contact .social-icons, #contact form .row > div'
    );
    if (targets.length) {
      var reveal = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          reveal.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px' });
      Array.prototype.forEach.call(targets, function (el) {
        // Anything already on screen stays put; only off-screen content animates in.
        if (el.getBoundingClientRect().top < window.innerHeight) return;
        el.setAttribute('data-reveal', '');
        reveal.observe(el);
      });
      document.documentElement.classList.add('js-reveal');
    }
  }

  // ---- Keyboard support for the project tab labels (radio inputs are display:none) ----
  Array.prototype.forEach.call(document.querySelectorAll('.tabs-container label'), function (label) {
    label.setAttribute('tabindex', '0');
    label.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); label.click(); }
    });
  });
})();
