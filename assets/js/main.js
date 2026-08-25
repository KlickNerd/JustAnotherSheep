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

  /* ---------- Sheep Records player ----------
     Die Audiodatei wird erst angefasst, wenn jemand auf Play drückt —
     bis dahin kostet der Player kein einziges Byte Mobilfunkvolumen.
     Fehlt die Datei, sagt der Player das, statt kaputt dazustehen. */
  document.querySelectorAll('.player').forEach(function (root) {
    var btn = root.querySelector('.player__toggle');
    var seek = root.querySelector('.player__seek');
    var cur = root.querySelector('.player__cur');
    var dur = root.querySelector('.player__dur');
    var note = root.querySelector('.player__note');
    var title = root.dataset.title || 'Track';
    var audio = null;
    var scrubbing = false;

    function fmt(s) {
      if (!isFinite(s)) return '–:––';
      var m = Math.floor(s / 60);
      var r = Math.floor(s % 60);
      return m + ':' + (r < 10 ? '0' : '') + r;
    }

    function fail() {
      root.classList.remove('is-playing');
      root.classList.add('is-missing');
      btn.disabled = true;
      seek.disabled = true;
      btn.setAttribute('aria-label', title + ' is not available yet');
      if (note) note.hidden = false;
    }

    function build() {
      audio = new Audio();
      audio.preload = 'metadata';
      audio.src = root.dataset.src;

      audio.addEventListener('loadedmetadata', function () {
        dur.textContent = fmt(audio.duration);
        seek.disabled = false;
      });
      audio.addEventListener('timeupdate', function () {
        cur.textContent = fmt(audio.currentTime);
        if (!scrubbing && audio.duration) {
          seek.value = (audio.currentTime / audio.duration) * 1000;
        }
      });
      audio.addEventListener('ended', function () {
        root.classList.remove('is-playing');
        btn.setAttribute('aria-label', 'Play ' + title);
        audio.currentTime = 0;
        seek.value = 0;
      });
      audio.addEventListener('error', fail);
      return audio;
    }

    btn.addEventListener('click', function () {
      if (!audio) build();
      if (audio.paused) {
        var p = audio.play();
        if (p && p.catch) p.catch(fail);
        root.classList.add('is-playing');
        btn.setAttribute('aria-label', 'Pause ' + title);
      } else {
        audio.pause();
        root.classList.remove('is-playing');
        btn.setAttribute('aria-label', 'Play ' + title);
      }
    });

    seek.addEventListener('input', function () {
      scrubbing = true;
      if (audio && audio.duration) cur.textContent = fmt(seek.value / 1000 * audio.duration);
    });
    seek.addEventListener('change', function () {
      if (audio && audio.duration) audio.currentTime = seek.value / 1000 * audio.duration;
      scrubbing = false;
    });
  });

  /* ---------- „Play Seven"-Knöpfe außerhalb des Players ----------
     Scrollen zum Release-Panel und starten den Track im selben Klick. */
  document.querySelectorAll('.js-play').forEach(function (link) {
    link.addEventListener('click', function () {
      var player = document.querySelector('.player');
      if (!player || player.classList.contains('is-missing')) return;
      if (!player.classList.contains('is-playing')) {
        player.querySelector('.player__toggle').click();
      }
    });
  });

  /* ---------- footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
