/* =========================================================
   Achouak Yassine — chapters
   GSAP + ScrollTrigger + Lenis + SplitType (all self-hosted)
   ========================================================= */
(function () {
  'use strict';
  var D = document, W = window;
  D.documentElement.classList.add('js');

  var $ = function (s, c) { return (c || D).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || D).querySelectorAll(s)); };
  var calm = W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = W.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGSAP = !!(W.gsap);
  var hasST = hasGSAP && !!(W.ScrollTrigger);
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  /* ---------- SMOOTH SCROLL ---------- */
  var lenis = null;
  if (!calm && W.Lenis) {
    lenis = new Lenis({ duration: 1.05, smoothWheel: true, touchMultiplier: 1.4 });
    if (hasST) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }(0));
    }
  }
  function stopScroll(on) {
    if (lenis) { on ? lenis.stop() : lenis.start(); }
    D.body.style.overflow = on ? 'hidden' : '';
  }

  /* ---------- PAGE TRANSITION ---------- */
  var curtain = $('#curtain'), curtainWord = $('#curtain .cw');
  var CAME_FROM = 'ay:transition';

  function playIn() {
    var flagged = false;
    try { flagged = sessionStorage.getItem(CAME_FROM) === '1'; sessionStorage.removeItem(CAME_FROM); } catch (e) {}
    if (!curtain || !hasGSAP || calm || !flagged) {
      if (curtain) curtain.style.transform = 'translateY(100%)';
      return;
    }
    gsap.set(curtain, { yPercent: 0 });
    gsap.set(curtainWord, { opacity: 1 });
    gsap.timeline()
      .to(curtainWord, { opacity: 0, duration: .3, ease: 'power2.out' })
      .to(curtain, { yPercent: -100, duration: .9, ease: 'expo.inOut' }, '-=.1')
      .set(curtain, { yPercent: 100 });
  }

  function goTo(url, label) {
    if (!curtain || !hasGSAP || calm) { W.location.href = url; return; }
    try { sessionStorage.setItem(CAME_FROM, '1'); } catch (e) {}
    if (curtainWord) curtainWord.textContent = label || '';
    gsap.set(curtain, { yPercent: 100 });
    gsap.set(curtainWord, { opacity: 0 });
    gsap.timeline()
      .to(curtain, { yPercent: 0, duration: .75, ease: 'expo.inOut' })
      .to(curtainWord, { opacity: 1, duration: .25, ease: 'power2.out' }, '-=.25')
      .call(function () { W.location.href = url; });
  }

  D.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    if (!/\.html($|[?#])/.test(href) && href !== '/' ) return;      // internal page links only
    if (a.host && a.host !== location.host) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    goTo(href, a.dataset.label || a.textContent.trim());
  });
  W.addEventListener('pageshow', function (e) { if (e.persisted && curtain) curtain.style.transform = 'translateY(100%)'; });

  /* ---------- PRELOADER ---------- */
  function boot() {
    var pre = $('#pre');
    if (!pre) { playIn(); reveal(); return; }
    var fill = $('#pre .bar i'), num = $('#pre .n');
    var imgs = $$('img:not([loading="lazy"])');
    var total = imgs.length || 1, done = 0, ended = false;
    function tick() {
      done++;
      var p = Math.min(100, Math.round(done / total * 100));
      if (fill) fill.style.width = p + '%';
      if (num) num.textContent = String(p).padStart(3, '0');
      if (done >= total) end();
    }
    function end() {
      if (ended) return; ended = true;
      if (fill) fill.style.width = '100%';
      if (num) num.textContent = '100';
      stopScroll(false);
      if (!hasGSAP || calm) { pre.remove(); reveal(); return; }
      gsap.timeline({ delay: .15, onComplete: function () { pre.remove(); reveal(); } })
        .to('#pre .w, #pre .bar, #pre .n', { opacity: 0, y: -14, duration: .45, ease: 'power2.in', stagger: .04 })
        .to(pre, { yPercent: -100, duration: .95, ease: 'expo.inOut' }, '-=.15');
    }
    stopScroll(true);
    imgs.forEach(function (i) {
      if (i.complete) tick();
      else { i.addEventListener('load', tick, { once: true }); i.addEventListener('error', tick, { once: true }); }
    });
    if (!imgs.length) end();
    setTimeout(end, calm ? 200 : 2600);
  }

  /* ---------- REVEALS ---------- */
  function reveal() {
    playIn();

    if (!hasGSAP || calm) {
      $$('[data-rv]').forEach(function (n) { n.style.opacity = 1; });
      $$('[data-clip]').forEach(function (n) { n.style.clipPath = 'none'; });
      return;
    }

    // split headlines into lines and lift them out of a mask
    $$('[data-split]').forEach(function (el) {
      var lines;
      if (W.SplitType) {
        var s = new SplitType(el, { types: 'lines', lineClass: 'line-in' });
        lines = s.lines || [];
        lines.forEach(function (ln) {
          var inner = D.createElement('span');
          inner.style.display = 'block';
          while (ln.firstChild) inner.appendChild(ln.firstChild);
          ln.appendChild(inner);
        });
        lines = lines.map(function (ln) { return ln.firstChild; });
      }
      if (!lines || !lines.length) { el.style.opacity = 1; return; }
      el.style.opacity = 1;
      gsap.set(lines, { yPercent: 108 });
      gsap.to(lines, {
        yPercent: 0, duration: 1.15, ease: 'expo.out', stagger: .085,
        scrollTrigger: hasST ? { trigger: el, start: 'top 88%', once: true } : undefined,
        delay: hasST ? 0 : .2
      });
    });

    // generic fade-ups
    $$('[data-rv]').forEach(function (el, i) {
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: .95, ease: 'expo.out',
        delay: (parseFloat(el.dataset.rv) || 0),
        scrollTrigger: hasST ? { trigger: el, start: 'top 90%', once: true } : undefined
      });
    });

    // image clip reveals
    $$('[data-clip]').forEach(function (el) {
      gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0)' }, {
        clipPath: 'inset(0 0 0% 0)', duration: 1.25, ease: 'expo.out',
        scrollTrigger: hasST ? { trigger: el, start: 'top 88%', once: true } : undefined
      });
    });

    if (!hasST) return;

    // parallax inside .media frames
    $$('.media img[data-par]').forEach(function (img) {
      var amt = parseFloat(img.dataset.par) || 12;
      gsap.fromTo(img, { yPercent: -amt, scale: 1.14 }, {
        yPercent: amt, ease: 'none',
        scrollTrigger: { trigger: img.closest('.media'), start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    // hero: slow zoom-out + scrim drift
    var heroImg = $('#stage .bg img');
    if (heroImg) {
      gsap.to(heroImg, { scale: 1, duration: 2.4, ease: 'expo.out' });
      gsap.to(heroImg, {
        yPercent: 12, ease: 'none',
        scrollTrigger: { trigger: '#stage', start: 'top top', end: 'bottom top', scrub: true }
      });
    }

    // horizontal pinned strip
    var strip = $('#strip'), track = $('#strip .track');
    if (strip && track && innerWidth > 760) {
      var dist = function () { return Math.max(0, track.scrollWidth - innerWidth + 32); };
      gsap.to(track, {
        x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: {
          trigger: strip, start: 'top top', end: function () { return '+=' + dist(); },
          pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1
        }
      });
    }

    // marquee
    $$('.mq__t').forEach(function (t) {
      var dir = t.closest('.mq').dataset.dir === 'rev' ? 1 : -1;
      gsap.to(t, { xPercent: 50 * dir, duration: 26, ease: 'none', repeat: -1 });
      gsap.set(t, { xPercent: dir === 1 ? -50 : 0 });
    });
  }

  /* ---------- NAV BACKDROP ---------- */
  (function () {
    var n = $('.nav'); if (!n) return;
    var f = function () { n.classList.toggle('stuck', (W.scrollY || 0) > 40); };
    f(); W.addEventListener('scroll', f, { passive: true });
    if (lenis) lenis.on('scroll', function (e) { n.classList.toggle('stuck', e.scroll > 40); });
  }());

  /* ---------- CURSOR ---------- */
  (function () {
    var c = $('#cur'); if (!c || !fine || calm || !hasGSAP) return;
    var xt = gsap.quickTo(c, 'x', { duration: .35, ease: 'power3' });
    var yt = gsap.quickTo(c, 'y', { duration: .35, ease: 'power3' });
    var woke = false;
    W.addEventListener('pointermove', function (e) {
      if (!woke) { woke = true; gsap.set(c, { x: e.clientX, y: e.clientY }); gsap.to(c, { opacity: 1, duration: .3 }); }
      xt(e.clientX); yt(e.clientY);
    }, { passive: true });
    D.addEventListener('pointerover', function (e) {
      c.classList.toggle('big', !!e.target.closest('a,button,.media,.ch'));
    });
  }());

  /* ---------- CHAPTER HOVER PEEK ---------- */
  (function () {
    var peek = $('#peek'); if (!peek || !fine || calm || !hasGSAP) return;
    var img = peek.querySelector('img');
    var xt = gsap.quickTo(peek, 'x', { duration: .55, ease: 'power3' });
    var yt = gsap.quickTo(peek, 'y', { duration: .55, ease: 'power3' });
    W.addEventListener('pointermove', function (e) { xt(e.clientX); yt(e.clientY); }, { passive: true });
    $$('.ch').forEach(function (ch) {
      ch.addEventListener('pointerenter', function () {
        if (ch.dataset.peek) img.src = ch.dataset.peek;
        gsap.to(peek, { opacity: 1, duration: .35, ease: 'power2.out' });
      });
      ch.addEventListener('pointerleave', function () {
        gsap.to(peek, { opacity: 0, duration: .3, ease: 'power2.out' });
      });
    });
  }());

  /* ---------- MENU ---------- */
  (function () {
    var b = $('#burger'), m = $('#menu'); if (!b || !m) return;
    function set(on) {
      m.classList.toggle('open', on);
      b.setAttribute('aria-expanded', String(on));
      b.setAttribute('aria-label', on ? 'Close menu' : 'Open menu');
      stopScroll(on);
      if (on) { var f = m.querySelector('a'); if (f) f.focus(); }
    }
    b.addEventListener('click', function () { set(!m.classList.contains('open')); });
    D.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && m.classList.contains('open')) { set(false); b.focus(); }
    });
  }());

  /* ---------- LIGHTBOX ---------- */
  (function () {
    var box = $('#lb'); if (!box || !W.PHOTOS) return;
    var img = $('#lb-img'), ix = $('#lb-ix'), cg = $('#lb-cg'), tt = $('#lb-tt'), st = $('#lb-st');
    var i = 0, last = null;
    function paint() {
      var p = W.PHOTOS[i];
      img.src = p.src; img.alt = p.title; img.width = p.w; img.height = p.h;
      ix.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(W.PHOTOS.length).padStart(2, '0');
      cg.textContent = p.cat; tt.textContent = p.title; st.textContent = p.story;
    }
    function open(n) {
      last = D.activeElement; i = n; paint();
      box.classList.add('open'); box.setAttribute('aria-hidden', 'false');
      stopScroll(true); $('#lb-close').focus();
    }
    function close() {
      box.classList.remove('open'); box.setAttribute('aria-hidden', 'true');
      stopScroll(false); if (last && last.focus) last.focus();
    }
    function go(d) { i = (i + d + W.PHOTOS.length) % W.PHOTOS.length; paint(); }
    $$('[data-lb]').forEach(function (b) {
      b.addEventListener('click', function () { open(parseInt(b.dataset.lb, 10) || 0); });
    });
    $('#lb-close').addEventListener('click', close);
    $('#lb-prev').addEventListener('click', function () { go(-1); });
    $('#lb-next').addEventListener('click', function () { go(1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    D.addEventListener('keydown', function (e) {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (e.key === 'Tab') {
        var f = $$('button', box).filter(function (n) { return n.offsetParent !== null; });
        if (!f.length) return;
        var a = f[0], z = f[f.length - 1];
        if (e.shiftKey && D.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && D.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    });
    var tx = 0;
    box.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      var d = e.changedTouches[0].clientX - tx;
      if (Math.abs(d) > 55) go(d < 0 ? 1 : -1);
    }, { passive: true });
  }());

  /* ---------- BOOKING → prefilled enquiry ---------- */
  $$('[data-book]').forEach(function (b) {
    b.addEventListener('click', function () {
      var s = $('#c-subj'); if (s) s.value = b.dataset.book + ' — enquiry';
      var f = $('#enquiry');
      if (f) {
        if (lenis) lenis.scrollTo(f, { offset: -60 });
        else f.scrollIntoView({ behavior: calm ? 'auto' : 'smooth' });
      }
      setTimeout(function () { var n = $('#c-name'); if (n) n.focus({ preventScroll: true }); }, calm ? 0 : 800);
    });
  });

  /* ---------- FORM ---------- */
  (function () {
    var form = $('#contact-form'); if (!form) return;
    var msg = $('#c-msg'), cnt = $('#c-count');
    if (msg && cnt) { var s = function () { cnt.textContent = msg.value.length + ' / 600'; }; msg.addEventListener('input', s); s(); }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var body = $('#c-msg').value.trim() + '\n\n—\n' + $('#c-name').value.trim();
      var mail = $('#c-mail').value.trim(); if (mail) body += '\n' + mail;
      location.href = 'mailto:achouakdyassine@gmail.com?subject='
        + encodeURIComponent($('#c-subj').value.trim() || 'Booking enquiry')
        + '&body=' + encodeURIComponent(body);
    });
  }());

  /* ---------- COPY EMAIL ---------- */
  (function () {
    var b = $('#copy-mail'); if (!b) return;
    var l = $('#copy-mail-label'), o = l ? l.textContent : '';
    b.addEventListener('click', function () {
      var a = 'achouakdyassine@gmail.com';
      function ok() { if (l) { l.textContent = 'Copied ✓'; setTimeout(function () { l.textContent = o; }, 1800); } }
      if (navigator.clipboard) navigator.clipboard.writeText(a).then(ok, function () { location.href = 'mailto:' + a; });
      else location.href = 'mailto:' + a;
    });
  }());

  $$('[data-year]').forEach(function (n) { n.textContent = String(new Date().getFullYear()); });

  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}());
