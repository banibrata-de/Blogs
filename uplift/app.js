/**
 * Uplift · app.js
 * Progressive enhancement only — page works without JS.
 * Features:
 *   1. Animated metric bars (IntersectionObserver + CSS transition)
 *   2. Scroll-reveal for .reveal elements
 *   3. Year injection in footer
 *   4. Smooth-scroll polite nav active state
 */

'use strict';

/* ─── Year ─────────────────────────────────────────────────────── */
(function injectYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ─── Scroll Reveal ─────────────────────────────────────────────── */
(function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    // Graceful degradation: make all elements visible
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* ─── Animated Metric Bars ──────────────────────────────────────── */
(function initMetricBars() {
  if (!('IntersectionObserver' in window)) return;

  const metricSection = document.querySelector('.metric-section');
  if (!metricSection) return;

  let animated = false;

  const observer = new IntersectionObserver(
    (entries) => {
      if (animated) return;
      if (!entries[0].isIntersecting) return;

      animated = true;
      observer.disconnect();

      const bars   = document.querySelectorAll('.metric-bar');
      const values = document.querySelectorAll('.metric-value');

      bars.forEach((bar, i) => {
        const target = parseInt(bar.dataset.target, 10);

        // Animate the CSS width via the custom property
        // We rAF-queue to ensure the DOM has painted width:0 first
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            bar.style.width = target + '%';
          });
        });

        // Animate the counter text
        if (values[i]) {
          animateCounter(values[i], 0, target, 1100);
        }
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(metricSection);

  function animateCounter(el, from, to, duration) {
    const startTime = performance.now();

    function step(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutCubic(progress);
      const current  = Math.round(from + (to - from) * eased);

      el.textContent = current + '%';

      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
})();

/* ─── Active Nav Link ───────────────────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-list a[href^="#"]');

  if (!sections.length || !navLinks.length) return;
  if (!('IntersectionObserver' in window)) return;

  const visibleSections = new Set();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          visibleSections.add(entry.target.id);
        } else {
          visibleSections.delete(entry.target.id);
        }
      });

      // Highlight the topmost visible section
      navLinks.forEach(link => {
        const id = link.getAttribute('href').slice(1);
        if (visibleSections.has(id)) {
          link.setAttribute('aria-current', 'true');
          link.style.color = 'var(--clr-accent)';
        } else {
          link.removeAttribute('aria-current');
          link.style.color = '';
        }
      });
    },
    { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
  );

  sections.forEach(s => observer.observe(s));
})();

/* ─── Stagger reveal delay for grids ───────────────────────────── */
(function staggerReveal() {
  const grids = document.querySelectorAll(
    '.challenge-grid, .approach-grid, .principles-grid'
  );

  grids.forEach(grid => {
    Array.from(grid.querySelectorAll('.reveal')).forEach((card, i) => {
      card.style.transitionDelay = (i * 0.08) + 's';
    });
  });
})();
