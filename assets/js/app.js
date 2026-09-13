/* Achouak Yassine — Noir. Motion is slow and few; restraint is the point. */
(function () {
  'use strict';
  var D = document, W = window;
  D.documentElement.classList.add('js');
  var $ = function (s, c) { return (c || D).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || D).querySelectorAll(s)); };
  var calm = W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = W.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var G = W.gsap, ST = W.ScrollTrigger;
  if (G && ST) G.registerPlugin(ST);

  var lenis = null;
  if (!calm && W.Lenis) {
    lenis = new Lenis({ duration: 1.3, smoothWheel: true, touchMultiplier: 1.3 });
    if (G && ST) {
      lenis.on('scroll', ST.update);
      G.ticker.add(function (t) { lenis.raf(t * 1000); });
      G.ticker.lagSmoothing(0);
    } else (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }(0));
  }
  function lock(on) { if (lenis) on ? lenis.stop() : lenis.start(); D.body.style.overflow = on ? 'hidden' : ''; }

  /* ---- page transition ---- */
  var curtain = $('#curtain'), cw = $('#curtain .cw'), KEY = 'ay:t';
  function playIn() {
    var f = false;
    try { f = sessionStorage.getItem(KEY) === '1'; sessionStorage.removeItem(KEY); } catch (e) {}
    if (!curtain || !G || calm || !f) { if (curtain) curtain.style.transform = 'translateY(100%)'; return; }
    G.set(curtain, { yPercent: 0 }); G.set(cw, { opacity: 1 });
    G.timeline().to(cw, { opacity: 0, duration: .4 })
      .to(curtain, { yPercent: -100, duration: 1.05, ease: 'expo.inOut' }, '-=.15')
      .set(curtain, { yPercent: 100 });
  }
  function go(url, label) {
    if (!curtain || !G || calm) { W.location.href = url; return; }
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    if (cw) cw.textContent = label || '';
    G.set(curtain, { yPercent: 100 }); G.set(cw, { opacity: 0 });
    G.timeline().to(curtain, { yPercent: 0, duration: .9, ease: 'expo.inOut' })
      .to(cw, { opacity: 1, duration: .35 }, '-=.3')
      .call(function () { W.location.href = url; });
  }
  D.addEventListener('click', function (e) {
    var a = e.target.closest('a'); if (!a) return;
    var h = a.getAttribute('href') || '';
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    if (!/\.html($|[?#])/.test(h)) return;
    if (a.host && a.host !== location.host) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault(); go(h, a.dataset.label || a.textContent.trim());
  });
  W.addEventListener('pageshow', function (e) { if (e.persisted && curtain) curtain.style.transform = 'translateY(100%)'; });

  /* ---- preloader ---- */
  function boot() {
    var pre = $('#pre');
    if (!pre) { playIn(); reveal(); return; }
    var fill = $('#pre .b i'), num = $('#pre .c');
    var imgs = $$('img:not([loading="lazy"])'), total = imgs.length || 1, done = 0, ended = false;
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
      lock(false);
      if (!G || calm) { pre.remove(); reveal(); return; }
      G.timeline({ delay: .2, onComplete: function () { pre.remove(); reveal(); } })
        .to('#pre .n, #pre .b, #pre .c', { opacity: 0, duration: .5, stagger: .05 })
        .to(pre, { opacity: 0, duration: .7 }, '-=.2');
    }
    lock(true);
    imgs.forEach(function (i) {
      if (i.complete) tick();
      else { i.addEventListener('load', tick, { once: true }); i.addEventListener('error', tick, { once: true }); }
    });
    if (!imgs.length) end();
    setTimeout(end, calm ? 200 : 2800);
  }

  /* ---- reveals: slow, few ---- */
  function reveal() {
    playIn();
    var rv = $$('[data-rv]'), cl = $$('[data-clip]');
    if (!G || calm) {
      rv.forEach(function (n) { n.style.opacity = 1; });
      cl.forEach(function (n) { n.style.clipPath = 'none'; var i = n.querySelector('img'); if (i) i.style.transform = 'none'; });
      return;
    }
    function group(n) { return n.closest('[data-g]') || n.closest('section') || n.parentElement; }
    var seen = new Map();
    rv.concat(cl).forEach(function (n) {
      var r = group(n); if (!seen.has(r)) seen.set(r, []); seen.get(r).push(n);
    });
    function run(list) {
      list.forEach(function (n, i) {
        if (n.hasAttribute('data-clip')) {
          var img = n.querySelector('img');
          G.timeline({ delay: i * .08 })
            .to(n, { clipPath: 'inset(0 0 0% 0)', duration: 1.5, ease: 'expo.out' })
            .to(img, { scale: 1, duration: 1.9, ease: 'expo.out' }, 0);
        } else {
          G.to(n, { opacity: 1, duration: 1.2, ease: 'power2.out', delay: i * .09 });
        }
      });
    }
    if (!ST) { seen.forEach(run); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        run(seen.get(e.target) || []); io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 });
    seen.forEach(function (_, r) { io.observe(r); });
    setTimeout(function () {
      rv.forEach(function (n) { n.style.opacity = 1; });
      cl.forEach(function (n) { n.style.clipPath = 'none'; });
    }, 6000);

    var hero = $('#stage .bg img');
    if (hero) {
      G.fromTo(hero, { scale: 1.1 }, { scale: 1, duration: 2.6, ease: 'expo.out' });
      G.to(hero, { yPercent: 10, ease: 'none',
        scrollTrigger: { trigger: '#stage', start: 'top top', end: 'bottom top', scrub: true } });
    }
  }

  /* ---- nav ---- */
  (function () {
    var n = $('.nav'); if (!n) return;
    var f = function (y) { n.classList.toggle('stuck', y > 40); };
    f(W.scrollY || 0);
    W.addEventListener('scroll', function () { f(W.scrollY || 0); }, { passive: true });
    if (lenis) lenis.on('scroll', function (e) { f(e.scroll); });
  }());

  (function () {
    var b = $('#burger'), m = $('#menu'); if (!b || !m) return;
    function set(on) {
      m.classList.toggle('open', on); b.setAttribute('aria-expanded', String(on));
      b.setAttribute('aria-label', on ? 'Close menu' : 'Open menu'); lock(on);
      if (on) { var f = m.querySelector('a'); if (f) f.focus(); }
    }
    b.addEventListener('click', function () { set(!m.classList.contains('open')); });
    D.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && m.classList.contains('open')) { set(false); b.focus(); }
    });
  }());

  /* ---- chapter peek ---- */
  (function () {
    var pk = $('#peek'); if (!pk || !fine || calm || !G) return;
    var img = pk.querySelector('img');
    var xt = G.quickTo(pk, 'x', { duration: .7, ease: 'power3' });
    var yt = G.quickTo(pk, 'y', { duration: .7, ease: 'power3' });
    W.addEventListener('pointermove', function (e) { xt(e.clientX); yt(e.clientY); }, { passive: true });
    $$('.ch').forEach(function (c) {
      c.addEventListener('pointerenter', function () {
        if (c.dataset.peek) img.src = c.dataset.peek;
        G.to(pk, { opacity: 1, duration: .5 });
        $$('.ch').forEach(function (o) { if (o !== c) G.to(o, { opacity: .35, duration: .4 }); });
      });
      c.addEventListener('pointerleave', function () {
        G.to(pk, { opacity: 0, duration: .4 });
        $$('.ch').forEach(function (o) { G.to(o, { opacity: 1, duration: .4 }); });
      });
    });
  }());

  /* ---- lightbox: this is where colour comes back ---- */
  (function () {
    var box = $('#lb'); if (!box || !W.PHOTOS) return;
    var img = $('#lb-img'), ix = $('#lb-ix'), tt = $('#lb-tt'), st = $('#lb-st'), cg = $('#lb-cg');
    var i = 0, last = null;
    function paint() {
      var p = W.PHOTOS[i];
      img.src = p.src; img.alt = p.title; img.width = p.w; img.height = p.h;
      ix.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(W.PHOTOS.length).padStart(2, '0');
      tt.textContent = p.title; st.textContent = p.story; cg.textContent = p.cat;
    }
    function open(n) {
      last = D.activeElement; i = n; paint();
      box.classList.add('open'); box.setAttribute('aria-hidden', 'false'); lock(true); $('#lb-close').focus();
    }
    function close() {
      box.classList.remove('open'); box.setAttribute('aria-hidden', 'true'); lock(false);
      if (last && last.focus) last.focus();
    }
    function step(d) { i = (i + d + W.PHOTOS.length) % W.PHOTOS.length; paint(); }
    $$('[data-lb]').forEach(function (b) {
      b.addEventListener('click', function () { open(parseInt(b.dataset.lb, 10) || 0); });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(parseInt(b.dataset.lb, 10) || 0); }
      });
    });
    $('#lb-close').addEventListener('click', close);
    $('#lb-prev').addEventListener('click', function () { step(-1); });
    $('#lb-next').addEventListener('click', function () { step(1); });
    D.addEventListener('keydown', function (e) {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
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
      if (Math.abs(d) > 55) step(d < 0 ? 1 : -1);
    }, { passive: true });
  }());

  $$('[data-book]').forEach(function (b) {
    b.addEventListener('click', function () {
      var s = $('#c-subj'); if (s) s.value = b.dataset.book + ' — enquiry';
      var f = $('#enquiry');
      if (f) { if (lenis) lenis.scrollTo(f, { offset: -40 }); else f.scrollIntoView({ behavior: calm ? 'auto' : 'smooth' }); }
      setTimeout(function () { var n = $('#c-name'); if (n) n.focus({ preventScroll: true }); }, calm ? 0 : 900);
    });
  });

  (function () {
    var form = $('#contact-form'); if (!form) return;
    var m = $('#c-msg'), c = $('#c-count');
    if (m && c) { var s = function () { c.textContent = m.value.length + ' / 600'; }; m.addEventListener('input', s); s(); }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var body = $('#c-msg').value.trim() + '\n\n—\n' + $('#c-name').value.trim();
      var mail = $('#c-mail').value.trim(); if (mail) body += '\n' + mail;
      location.href = 'mailto:achouakdyassine@gmail.com?subject='
        + encodeURIComponent($('#c-subj').value.trim() || 'Booking enquiry')
        + '&body=' + encodeURIComponent(body);
    });
  }());

  (function () {
    var b = $('#copy-mail'); if (!b) return;
    var l = $('#copy-mail-label'), o = l ? l.textContent : '';
    b.addEventListener('click', function () {
      var a = 'achouakdyassine@gmail.com';
      function ok() { if (l) { l.textContent = 'Copied'; setTimeout(function () { l.textContent = o; }, 1800); } }
      if (navigator.clipboard) navigator.clipboard.writeText(a).then(ok, function () { location.href = 'mailto:' + a; });
      else location.href = 'mailto:' + a;
    });
  }());

  $$('[data-year]').forEach(function (n) { n.textContent = String(new Date().getFullYear()); });
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
}());
