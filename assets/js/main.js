/* Just Another Sheep — homepage behaviour
   Small, dependency free, touch friendly. */

(function () {
  'use strict';

  var header = document.getElementById('siteHeader');
  var burger = document.getElementById('burger');
  var nav = document.getElementById('mobileNav');
  var scrollY = 0;

  /* ---------- header background after scrolling past the hero top ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      header.classList.toggle('is-stuck', window.scrollY > 24);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  function openNav() {
    scrollY = window.scrollY;
    nav.hidden = false;
    // next frame so the transition actually runs
    requestAnimationFrame(function () { nav.classList.add('is-open'); });
    document.body.classList.add('nav-open');
    // lock the page behind the overlay without losing the scroll position
    document.body.style.position = 'fixed';
    document.body.style.top = -scrollY + 'px';
    document.body.style.width = '100%';
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
  }

  function closeNav() {
    nav.classList.remove('is-open');
    document.body.classList.remove('nav-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollY);
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    window.setTimeout(function () {
      if (!nav.classList.contains('is-open')) nav.hidden = true;
    }, 300);
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      if (nav.hidden) openNav(); else closeNav();
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !nav.hidden) closeNav();
    });

    // if the viewport grows into the desktop layout, drop the lock
    window.matchMedia('(min-width: 1000px)').addEventListener('change', function (e) {
      if (e.matches && !nav.hidden) closeNav();
    });
  }

  /* ---------- reveal on scroll ---------- */
  var items = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
