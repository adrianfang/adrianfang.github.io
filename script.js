/* ============================================================
   Adrian Fang — site behaviour
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Year ─────────────────────────────────────────────── */
  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ── Nav: background on scroll + active section ────────── */
  var nav = document.getElementById('nav');
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var targets = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  function onScroll() {
    nav.classList.toggle('stuck', window.scrollY > 24);

    var mark = window.scrollY + window.innerHeight * 0.34;
    var current = -1;
    targets.forEach(function (el, i) {
      if (el.offsetTop <= mark) current = i;
    });
    links.forEach(function (a, i) { a.classList.toggle('active', i === current); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Reveal on enter ───────────────────────────────────── */
  var revealables = document.querySelectorAll('.reveal, .timeline > li');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('in'); });
  }

  /* ── Card cursor glow ──────────────────────────────────── */
  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ── Ambient particle field ────────────────────────────── */
  var canvas = document.getElementById('field');
  if (!canvas || reduced) { if (canvas) canvas.style.display = 'none'; return; }

  var ctx = canvas.getContext('2d');
  var w = 0, h = 0, dpr = 1;
  var nodes = [];
  var pointer = { x: -9999, y: -9999 };
  var scrollY = window.scrollY;

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    var count = Math.round(Math.min(96, Math.max(26, (w * h) / 20000)));
    nodes = [];
    for (var i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.3 + 0.5,
        a: Math.random() * 0.4 + 0.18
      });
    }
  }

  window.addEventListener('resize', size);
  window.addEventListener('pointermove', function (e) { pointer.x = e.clientX; pointer.y = e.clientY; });
  window.addEventListener('pointerleave', function () { pointer.x = pointer.y = -9999; });
  window.addEventListener('scroll', function () { scrollY = window.scrollY; }, { passive: true });

  var LINK_DIST = 132;
  var POINTER_DIST = 190;

  function frame() {
    ctx.clearRect(0, 0, w, h);
    var drift = (scrollY * 0.02) % h;

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;

      if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;

      var py = n.y - drift;
      if (py < -20) py += h + 40;

      // pointer halo
      var dx = pointer.x - n.x, dy = pointer.y - py;
      var pd = Math.sqrt(dx * dx + dy * dy);
      var near = pd < POINTER_DIST ? 1 - pd / POINTER_DIST : 0;

      ctx.beginPath();
      ctx.arc(n.x, py, n.r + near * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = near > 0
        ? 'rgba(224,72,59,' + (n.a * 0.5 + near * 0.5).toFixed(3) + ')'
        : 'rgba(190,185,180,' + (n.a * 0.32).toFixed(3) + ')';
      ctx.fill();

      // links
      for (var j = i + 1; j < nodes.length; j++) {
        var m = nodes[j];
        var my = m.y - drift;
        if (my < -20) my += h + 40;
        var lx = n.x - m.x, ly = py - my;
        var d2 = lx * lx + ly * ly;
        if (d2 > LINK_DIST * LINK_DIST) continue;
        var t = 1 - Math.sqrt(d2) / LINK_DIST;
        ctx.beginPath();
        ctx.moveTo(n.x, py);
        ctx.lineTo(m.x, my);
        ctx.strokeStyle = near > 0.15
          ? 'rgba(224,72,59,' + (t * 0.22 * near + t * 0.05).toFixed(3) + ')'
          : 'rgba(150,148,146,' + (t * 0.06).toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    requestAnimationFrame(frame);
  }

  size();
  requestAnimationFrame(frame);
})();
