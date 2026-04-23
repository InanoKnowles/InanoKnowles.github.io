// =============================================================================
// Inano Knowles — portfolio bundle
// Plain IIFE — no import / no export / no type="module"
// Requires: Pixi.js v8 loaded as global PIXI before this script
// =============================================================================
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. Animate polyfill (Web Animations API wrapper matching Motion One API)
  // ---------------------------------------------------------------------------
  function stagger(interval, opts) {
    var start = (opts && opts.start) || 0;
    return function (i) { return start + i * interval; };
  }

  function animate(targets, props, opts) {
    var els;
    if (targets instanceof Element) {
      els = [targets];
    } else if (targets instanceof NodeList || targets instanceof HTMLCollection) {
      els = Array.prototype.slice.call(targets);
    } else if (Array.isArray(targets)) {
      els = targets;
    } else {
      els = [targets];
    }

    var dur = ((opts && opts.duration) || 0.3) * 1000;
    var easingArg = (opts && opts.easing);
    var easing;
    if (Array.isArray(easingArg)) {
      easing = 'cubic-bezier(' + easingArg[0] + ',' + easingArg[1] + ',' + easingArg[2] + ',' + easingArg[3] + ')';
    } else {
      easing = easingArg || 'ease';
    }
    var baseDelay = opts && opts.delay;

    function valAt(key, n) {
      var v = props[key];
      if (!Array.isArray(v)) return v;
      return n === 0 ? v[0] : v[v.length - 1];
    }

    var hasTransform = (props.x !== undefined || props.y !== undefined ||
      props.rotate !== undefined || props.scale !== undefined);

    var promises = els.map(function (el, i) {
      var delay = 0;
      if (typeof baseDelay === 'function') delay = baseDelay(i) * 1000;
      else if (typeof baseDelay === 'number') delay = baseDelay * 1000;

      var fromFrame = {};
      var toFrame = {};

      if (props.opacity !== undefined) {
        fromFrame.opacity = String(valAt('opacity', 0));
        toFrame.opacity = String(valAt('opacity', 1));
      }

      if (hasTransform) {
        var fx = props.x !== undefined ? valAt('x', 0) : 0;
        var fy = props.y !== undefined ? valAt('y', 0) : 0;
        var fr = props.rotate !== undefined ? valAt('rotate', 0) : 0;
        var fs = props.scale !== undefined ? valAt('scale', 0) : 1;
        var tx = props.x !== undefined ? valAt('x', 1) : 0;
        var ty = props.y !== undefined ? valAt('y', 1) : 0;
        var tr = props.rotate !== undefined ? valAt('rotate', 1) : 0;
        var ts = props.scale !== undefined ? valAt('scale', 1) : 1;
        fromFrame.transform = 'translateX(' + fx + 'px) translateY(' + fy + 'px) rotate(' + fr + 'deg) scale(' + fs + ')';
        toFrame.transform = 'translateX(' + tx + 'px) translateY(' + ty + 'px) rotate(' + tr + 'deg) scale(' + ts + ')';
      }

      var anim = el.animate([fromFrame, toFrame], {
        duration: dur,
        delay: delay,
        easing: easing,
        fill: 'forwards'
      });
      return anim.finished;
    });

    return { finished: Promise.all(promises) };
  }

  // ---------------------------------------------------------------------------
  // 2. Globals
  // ---------------------------------------------------------------------------
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  // Path resolution for sprite sheet — works from root and from pages/
  var SPRITE_SHEET_URL = (function () {
    var origin = window.location.origin || '';
    var parts = window.location.pathname.split('/');
    var repoRoot = '';
    for (var i = 0; i < parts.length; i++) {
      if (parts[i] === 'pages') { repoRoot = parts.slice(0, i).join('/'); break; }
    }
    if (!repoRoot && parts.length > 1) repoRoot = parts.slice(0, -1).join('/');
    return origin + repoRoot + '/assets/themed-decorative-imgs/deepsea.png';
  }());

  // ---------------------------------------------------------------------------
  // 3. Dynamic year
  // ---------------------------------------------------------------------------
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---------------------------------------------------------------------------
  // 4. Kia orana console greeting
  // ---------------------------------------------------------------------------
  (function () {
    var banner = [
      '%c Kia orana! ',
      '%c If you\'re reading this, you\'re curious — I like that.',
      '%c Try typing \'aroa\' anywhere on the page. Meitaki. 🌺',
    ].join('\n');
    try {
      console.log(banner,
        'background:#d9412a;color:#fffaf1;padding:4px 10px;border-radius:4px;font-weight:700;',
        'color:#1f86a0;font-family:monospace;',
        'color:#d9412a;font-style:italic;'
      );
    } catch (e) {}
  }());

  // ---------------------------------------------------------------------------
  // 5. Tivaevae motif renderer
  // ---------------------------------------------------------------------------
  function renderMotif(el) {
    var size = Number(el.dataset.motif) || 220;
    var color = el.dataset.motifColor || 'var(--accent)';
    var accent = el.dataset.motifAccent || 'var(--accent-2)';
    var petals = 8;
    var cx = size / 2, cy = size / 2;
    var outerR = size * 0.42, innerR = size * 0.2;

    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
    svg.setAttribute('width', String(size));
    svg.setAttribute('height', String(size));
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('role', 'presentation');
    svg.style.display = 'block';
    svg.style.overflow = 'visible';

    var ring = document.createElementNS(ns, 'circle');
    ring.setAttribute('cx', String(cx));
    ring.setAttribute('cy', String(cy));
    ring.setAttribute('r', String(outerR * 1.08));
    ring.setAttribute('fill', 'none');
    ring.setAttribute('stroke', color);
    ring.setAttribute('stroke-opacity', '0.25');
    ring.setAttribute('stroke-dasharray', '2 4');
    ring.setAttribute('stroke-width', '1');
    svg.appendChild(ring);

    for (var i = 0; i < petals; i++) {
      var angle = (i / petals) * Math.PI * 2;
      var px = cx + Math.cos(angle) * outerR * 0.55;
      var py = cy + Math.sin(angle) * outerR * 0.55;
      var petal = document.createElementNS(ns, 'ellipse');
      petal.setAttribute('cx', String(px));
      petal.setAttribute('cy', String(py));
      petal.setAttribute('rx', String(outerR * 0.42));
      petal.setAttribute('ry', String(outerR * 0.22));
      petal.setAttribute('fill', color);
      petal.setAttribute('fill-opacity', '0.8');
      petal.setAttribute('transform', 'rotate(' + ((angle * 180) / Math.PI) + ' ' + px + ' ' + py + ')');
      svg.appendChild(petal);

      var pi = document.createElementNS(ns, 'ellipse');
      pi.setAttribute('cx', String(px));
      pi.setAttribute('cy', String(py));
      pi.setAttribute('rx', String(outerR * 0.22));
      pi.setAttribute('ry', String(outerR * 0.1));
      pi.setAttribute('fill', accent);
      pi.setAttribute('fill-opacity', '0.95');
      pi.setAttribute('transform', 'rotate(' + ((angle * 180) / Math.PI) + ' ' + px + ' ' + py + ')');
      svg.appendChild(pi);
    }

    for (var j = 0; j < petals; j++) {
      var a2 = (j / petals) * Math.PI * 2 + Math.PI / petals;
      var dx = cx + Math.cos(a2) * innerR * 0.9;
      var dy = cy + Math.sin(a2) * innerR * 0.9;
      var dot = document.createElementNS(ns, 'circle');
      dot.setAttribute('cx', String(dx));
      dot.setAttribute('cy', String(dy));
      dot.setAttribute('r', String(innerR * 0.22));
      dot.setAttribute('fill', accent);
      dot.setAttribute('fill-opacity', '0.9');
      svg.appendChild(dot);
    }

    var core = document.createElementNS(ns, 'circle');
    core.setAttribute('cx', String(cx));
    core.setAttribute('cy', String(cy));
    core.setAttribute('r', String(innerR * 0.48));
    core.setAttribute('fill', color);
    svg.appendChild(core);

    var coreDot = document.createElementNS(ns, 'circle');
    coreDot.setAttribute('cx', String(cx));
    coreDot.setAttribute('cy', String(cy));
    coreDot.setAttribute('r', String(innerR * 0.18));
    coreDot.setAttribute('fill', accent);
    svg.appendChild(coreDot);

    el.innerHTML = '';
    el.appendChild(svg);
  }

  document.querySelectorAll('[data-motif]').forEach(renderMotif);

  // ---------------------------------------------------------------------------
  // 6. Reveal on scroll
  // ---------------------------------------------------------------------------
  if (prefersReducedMotion) {
    document.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('is-visible'); });
    document.querySelectorAll('.section').forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    document.querySelectorAll('[data-reveal]').forEach(function (el) { revealObs.observe(el); });

    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          sectionObs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -20% 0px', threshold: 0.05 });
    document.querySelectorAll('.section').forEach(function (el) { sectionObs.observe(el); });
  }

  // ---------------------------------------------------------------------------
  // 7. Theme toggle (with ripple) — single listener here, inline script only restores localStorage
  // ---------------------------------------------------------------------------
  function applyTheme(next, origin) {
    var current = root.getAttribute('data-theme') || 'light';
    if (current === next) return;

    if (prefersReducedMotion || !origin) {
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('inano-theme', next); } catch (e) {}
      return;
    }

    var ripple = document.createElement('div');
    ripple.className = 'theme-ripple';
    ripple.style.setProperty('--tr-x', origin.x + 'px');
    ripple.style.setProperty('--tr-y', origin.y + 'px');
    document.body.appendChild(ripple);

    requestAnimationFrame(function () { ripple.classList.add('is-expanding'); });

    window.setTimeout(function () {
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('inano-theme', next); } catch (e) {}
    }, 280);

    window.setTimeout(function () {
      ripple.classList.add('is-fading');
      window.setTimeout(function () { ripple.remove(); }, 500);
    }, 650);
  }

  var themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var current = root.getAttribute('data-theme') || 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      var rect = themeToggle.getBoundingClientRect();
      applyTheme(next, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    });
  }

  // ---------------------------------------------------------------------------
  // 8. Hamburger menu
  // ---------------------------------------------------------------------------
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobile-menu');

  function setMenuOpen(open) {
    if (!hamburger || !mobileMenu) return;
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    hamburger.classList.toggle('is-open', open);
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('no-scroll', open);
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      setMenuOpen(hamburger.getAttribute('aria-expanded') !== 'true');
    });
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenuOpen(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && hamburger.getAttribute('aria-expanded') === 'true') {
        setMenuOpen(false);
        hamburger.focus();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 9. Smooth scroll for same-page hash links
  // ---------------------------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href');
      if (!href || href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  // ---------------------------------------------------------------------------
  // 10. Tivaevae bloom overlay
  // ---------------------------------------------------------------------------
  var bloom = document.getElementById('tivaevae-bloom');

  function triggerBloom() {
    if (!bloom) return;
    bloom.classList.remove('is-active');
    void bloom.offsetWidth;
    bloom.classList.add('is-active');
    window.setTimeout(function () { bloom.classList.remove('is-active'); }, 2600);
  }

  var wordmark = document.getElementById('wordmark') || document.querySelector('.wordmark');
  if (wordmark) {
    var _clicks = 0, _clickTimer = null;
    wordmark.addEventListener('click', function (e) {
      _clicks++;
      if (_clickTimer) clearTimeout(_clickTimer);
      _clickTimer = window.setTimeout(function () { _clicks = 0; }, 600);
      if (_clicks >= 3) {
        e.preventDefault();
        _clicks = 0;
        triggerBloom();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 11. Formspree contact form
  // ---------------------------------------------------------------------------
  var form = document.getElementById('contact-form');
  var formStatus = document.getElementById('form-status');
  var formSubmit = document.getElementById('form-submit');

  if (form && formStatus && formSubmit) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var honey = form.querySelector('input[name="_gotcha"]');
      if (honey && honey.value) {
        formStatus.textContent = 'Meitaki! Message received.';
        formStatus.dataset.state = 'ok';
        form.reset();
        return;
      }

      var action = form.getAttribute('action') || '';
      if (action.includes('REPLACE_WITH_YOUR_FORMSPREE_ID')) {
        formStatus.textContent = 'Form isn\'t wired up yet — email kia.orana@inano.dev instead.';
        formStatus.dataset.state = 'warn';
        return;
      }

      formStatus.textContent = 'Paddling your note across\u2026';
      formStatus.dataset.state = 'sending';
      formSubmit.disabled = true;

      fetch(action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (res) {
          if (res.ok) {
            formStatus.textContent = 'Meitaki ma\'ata! Your message landed safely.';
            formStatus.dataset.state = 'ok';
            form.reset();
            triggerBloom();
          } else {
            return res.json().catch(function () { return {}; }).then(function (body) {
              var msg = body && body.errors ? body.errors.map(function (x) { return x.message; }).join(', ') : 'Something drifted off course. Try again?';
              formStatus.textContent = msg;
              formStatus.dataset.state = 'error';
            });
          }
        })
        .catch(function () {
          formStatus.textContent = 'The wind took that one — try again, or email kia.orana@inano.dev.';
          formStatus.dataset.state = 'error';
        })
        .finally(function () {
          formSubmit.disabled = false;
        });
    });
  }

  // ---------------------------------------------------------------------------
  // 12. "aroa" keystroke easter egg
  // ---------------------------------------------------------------------------
  (function () {
    var target = 'aroa', buffer = '';
    window.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      var key = e.key.length === 1 ? e.key.toLowerCase() : '';
      if (!key) return;
      buffer = (buffer + key).slice(-target.length);
      if (buffer === target) { buffer = ''; triggerBloom(); }
    });
  }());

  // ---------------------------------------------------------------------------
  // 13. Hibiscus cursor trail (hero only)
  // ---------------------------------------------------------------------------
  var heroTrail = document.getElementById('hero-trail');
  var heroSection = document.querySelector('.hero');
  if (heroTrail && heroSection && !prefersReducedMotion) {
    var _lastSpawn = 0;
    var SPAWN_MS = 70;
    var palette = ['#d9412a', '#eac57c', '#1f86a0', '#f26142'];
    var petalSvg = function (color) {
      return '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 2C9 6 6 7 4 11c-2 4 2 9 8 9s10-5 8-9c-2-4-5-5-8-9z" fill="' + color + '" fill-opacity="0.85"/><circle cx="12" cy="13" r="2" fill="#fffaf1"/></svg>';
    };

    heroSection.addEventListener('pointermove', function (e) {
      var now = performance.now();
      if (now - _lastSpawn < SPAWN_MS) return;
      _lastSpawn = now;

      var rect = heroTrail.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;

      var petal = document.createElement('span');
      petal.className = 'hero-trail-petal';
      petal.style.left = x + 'px';
      petal.style.top = y + 'px';
      petal.innerHTML = petalSvg(palette[Math.floor(Math.random() * palette.length)]);
      heroTrail.appendChild(petal);

      var drift = (Math.random() - 0.5) * 80;
      var fall = 60 + Math.random() * 40;
      var rot = (Math.random() - 0.5) * 180;

      animate(petal, { x: [0, drift], y: [0, fall], rotate: [0, rot], opacity: [0.95, 0], scale: [0.6, 1] },
        { duration: 1.1, easing: 'ease-out' })
        .finished
        .then(function () { petal.remove(); })
        .catch(function () { petal.remove(); });
    });
  }

  // ---------------------------------------------------------------------------
  // 14. Hero headline flourish
  // ---------------------------------------------------------------------------
  if (!prefersReducedMotion) {
    var lines = document.querySelectorAll('.hero-title .hero-title-line');
    if (lines.length) {
      animate(lines, { opacity: [0, 1], y: [24, 0] },
        { duration: 0.9, delay: stagger(0.12), easing: [0.16, 1, 0.3, 1] });
    }
  }

  // ---------------------------------------------------------------------------
  // 15. Island scene
  // ---------------------------------------------------------------------------
  window._buildIslandScene = function (app, PIXI) {
    var container = new PIXI.Container();
    container.eventMode = 'static';

    var W = function () { return app.renderer.width / app.renderer.resolution; };
    var H = function () { return app.renderer.height / app.renderer.resolution; };

    var sky = new PIXI.Graphics();
    function drawSky() {
      sky.clear();
      var w = W(), h = H();
      var stops = [{ o: 0, c: 0xffd4a3 }, { o: 0.45, c: 0xffb58c }, { o: 1, c: 0x9ad4e6 }];
      var slices = 48;
      for (var i = 0; i < slices; i++) {
        var t = i / (slices - 1);
        var lo = stops[0], hi = stops[stops.length - 1];
        for (var j = 0; j < stops.length - 1; j++) {
          if (t >= stops[j].o && t <= stops[j + 1].o) { lo = stops[j]; hi = stops[j + 1]; break; }
        }
        var lt = (t - lo.o) / Math.max(0.0001, hi.o - lo.o);
        var r = Math.round(((lo.c >> 16) & 0xff) * (1 - lt) + ((hi.c >> 16) & 0xff) * lt);
        var g = Math.round(((lo.c >> 8) & 0xff) * (1 - lt) + ((hi.c >> 8) & 0xff) * lt);
        var b = Math.round((lo.c & 0xff) * (1 - lt) + (hi.c & 0xff) * lt);
        sky.rect(0, (i / slices) * h, w, h / slices + 1).fill(((r << 16) | (g << 8) | b) >>> 0);
      }
    }
    container.addChild(sky);

    var sun = new PIXI.Graphics();
    function drawSun() {
      sun.clear();
      var x = W() * 0.75, y = H() * 0.22;
      for (var r = 110; r > 0; r -= 12) {
        var alpha = 0.08 + (110 - r) / 200;
        sun.circle(x, y, r).fill({ color: 0xfff2b8, alpha: alpha });
      }
      sun.circle(x, y, 46).fill(0xfffbea);
    }
    container.addChild(sun);

    var mountains = new PIXI.Graphics();
    function drawMountains() {
      mountains.clear();
      var h = H(), w = W(), baseY = h * 0.62;
      mountains.moveTo(-20, baseY + 40).lineTo(w * 0.15, baseY - 60).lineTo(w * 0.28, baseY + 10)
        .lineTo(w * 0.42, baseY - 80).lineTo(w * 0.55, baseY + 5).lineTo(w * 0.7, baseY - 50)
        .lineTo(w * 0.88, baseY + 20).lineTo(w + 20, baseY + 40).lineTo(w + 20, h + 20)
        .lineTo(-20, h + 20).closePath().fill({ color: 0x2d5a36, alpha: 0.55 });
      mountains.moveTo(-20, baseY + 80).lineTo(w * 0.2, baseY + 10).lineTo(w * 0.35, baseY + 70)
        .lineTo(w * 0.5, baseY).lineTo(w * 0.68, baseY + 40).lineTo(w * 0.82, baseY - 10)
        .lineTo(w + 20, baseY + 60).lineTo(w + 20, h + 20).lineTo(-20, h + 20).closePath()
        .fill({ color: 0x1f3d24, alpha: 0.95 });
    }
    container.addChild(mountains);

    var beach = new PIXI.Graphics();
    function drawBeach() {
      beach.clear();
      var h = H(), w = W(), y = h * 0.82;
      beach.rect(0, y, w, h - y).fill(0xf5e2b8);
      beach.rect(0, y - 2, w, 4).fill({ color: 0xe9cf97, alpha: 0.6 });
    }
    container.addChild(beach);

    var ocean = new PIXI.Graphics();
    var wavePath = [];
    function drawOcean(t) {
      ocean.clear();
      var w = W(), h = H(), baseY = h * 0.78, pts = 48;
      wavePath.length = 0;
      for (var i = 0; i <= pts; i++) {
        var x = (i / pts) * w;
        var y = baseY + Math.sin(i * 0.4 + t * 0.002) * 4 + Math.sin(i * 0.2 + t * 0.0011) * 3;
        wavePath.push({ x: x, y: y });
      }
      ocean.moveTo(0, baseY + 8);
      wavePath.forEach(function (p) { ocean.lineTo(p.x, p.y); });
      ocean.lineTo(w, h * 0.82).lineTo(0, h * 0.82).closePath().fill({ color: 0x3f92b0, alpha: 0.9 });
      ocean.moveTo(0, baseY + 4);
      wavePath.forEach(function (p) { ocean.lineTo(p.x, p.y - 2); });
      ocean.stroke({ color: 0xffffff, alpha: 0.55, width: 1.2 });
    }
    container.addChild(ocean);

    var cloudLayer = new PIXI.Container();
    cloudLayer.eventMode = 'static';
    container.addChild(cloudLayer);
    var clouds = [];
    function makeCloud(x, y, scale) {
      var c = new PIXI.Container();
      c.x = x; c.y = y;
      c.eventMode = 'static';
      c.cursor = 'pointer';
      var g = new PIXI.Graphics();
      var r = 26 * scale;
      [[-30, 0], [-10, -8], [10, -4], [24, 4], [-4, 8]].forEach(function (d) {
        g.circle(d[0] * scale, d[1] * scale, r).fill({ color: 0xffffff, alpha: 0.95 });
      });
      c.addChild(g);
      c.hitArea = new PIXI.Rectangle(-60 * scale, -30 * scale, 120 * scale, 60 * scale);
      c.on('pointerdown', function () { c.targetOffset = (Math.random() - 0.5) * 160; });
      c.speed = 0.05 + Math.random() * 0.06;
      c.bob = Math.random() * Math.PI * 2;
      c.targetOffset = 0;
      c.offset = 0;
      cloudLayer.addChild(c);
      clouds.push(c);
    }

    var palms = new PIXI.Container();
    container.addChild(palms);
    var palmList = [];
    function buildPalm(x, yBase, flip) {
      var p = new PIXI.Container();
      p.x = x; p.y = yBase;
      var trunk = new PIXI.Graphics();
      var f = flip ? -1 : 1;
      trunk.moveTo(0, 0).bezierCurveTo(4 * f, -30, -6 * f, -70, 2 * f, -120);
      trunk.stroke({ color: 0x0f2e16, width: 6, cap: 'round' });
      p.addChild(trunk);
      var top = new PIXI.Container();
      top.x = 2 * f; top.y = -120;
      for (var i = 0; i < 7; i++) {
        var angle = -Math.PI / 2 + (i - 3) * 0.38;
        var len = 70;
        var ex = Math.cos(angle) * len, ey = Math.sin(angle) * len;
        var frond = new PIXI.Graphics();
        frond.moveTo(0, 0).quadraticCurveTo(ex * 0.5, ey * 0.5 - 12, ex, ey);
        frond.stroke({ color: 0x0f2e16, width: 4, cap: 'round' });
        top.addChild(frond);
      }
      p.top = top;
      p.addChild(top);
      palms.addChild(p);
      palmList.push(p);
    }

    function layout() {
      drawSky(); drawSun(); drawMountains(); drawBeach(); drawOcean(0);
      cloudLayer.removeChildren(); clouds.length = 0;
      var count = Math.max(3, Math.round(W() / 280));
      for (var i = 0; i < count; i++) {
        makeCloud((i / count) * W() + Math.random() * 60, 60 + Math.random() * 120, 0.7 + Math.random() * 0.6);
      }
      palms.removeChildren(); palmList.length = 0;
      buildPalm(W() * 0.12, H() * 0.85, false);
      buildPalm(W() * 0.88, H() * 0.84, true);
      if (W() > 900) buildPalm(W() * 0.78, H() * 0.88, false);
    }
    layout();

    var onResize = function () { layout(); };
    app.renderer.on('resize', onResize);

    var _t0 = performance.now();
    var tick = function () {
      if (!container.visible) return;
      var t = performance.now() - _t0;
      drawOcean(t);
      clouds.forEach(function (c) {
        c.x += c.speed;
        c.bob += 0.01;
        c.offset += (c.targetOffset - c.offset) * 0.04;
        c.y += Math.sin(c.bob) * 0.06 + c.offset * 0.003;
        c.targetOffset *= 0.96;
        if (c.x - 80 > W()) c.x = -80;
      });
      palmList.forEach(function (p, i) {
        p.top.rotation = Math.sin(t * 0.0009 + i) * 0.04;
      });
    };
    app.ticker.add(tick);

    return {
      container: container,
      destroy: function () {
        app.ticker.remove(tick);
        app.renderer.off('resize', onResize);
        container.destroy({ children: true });
      }
    };
  };

  // ---------------------------------------------------------------------------
  // 16. Underwater scene (sprite sheet)
  // ---------------------------------------------------------------------------
  var CREATURES = {
    fish_small_blue:     { x: 53,   y: 96,  w: 131, h: 103 },
    fish_small_purple:   { x: 235,  y: 96,  w: 151, h: 103 },
    fish_small_teal:     { x: 434,  y: 96,  w: 131, h: 103 },
    fish_small_orange:   { x: 650,  y: 96,  w: 106, h: 103 },
    fish_small_striped:  { x: 799,  y: 96,  w: 116, h: 103 },
    fish_small_yellow:   { x: 972,  y: 96,  w: 131, h: 103 },
    fish_small_silver:   { x: 1146, y: 96,  w: 134, h: 103 },
    fish_small_pink:     { x: 1318, y: 96,  w: 157, h: 103 },
    fish_med_blue:       { x: 62,   y: 246, w: 203, h: 113 },
    fish_med_purple:     { x: 315,  y: 246, w: 177, h: 113 },
    fish_med_red:        { x: 546,  y: 246, w: 206, h: 113 },
    fish_med_boxfish:    { x: 791,  y: 246, w: 184, h: 113 },
    fish_med_anglerfish: { x: 1025, y: 246, w: 216, h: 113 },
    fish_med_violet:     { x: 1270, y: 246, w: 192, h: 113 },
    fish_large_grouper:  { x: 69,   y: 406, w: 388, h: 128 },
    fish_large_shark:    { x: 514,  y: 406, w: 471, h: 128 },
    fish_large_ray:      { x: 1043, y: 406, w: 336, h: 128 },
    jelly_cyan:          { x: 23,   y: 561, w: 182, h: 193 },
    jelly_pink:          { x: 223,  y: 561, w: 133, h: 193 },
    jelly_blue:          { x: 411,  y: 561, w: 136, h: 193 },
    jelly_lavender:      { x: 584,  y: 561, w: 135, h: 193 },
    jelly_gold:          { x: 756,  y: 561, w: 131, h: 193 },
    jelly_moon:          { x: 927,  y: 561, w: 124, h: 193 },
    octopus:             { x: 1072, y: 561, w: 159, h: 193 },
    squid:               { x: 1267, y: 561, w: 235, h: 193 }
  };

  function cropTexture(PIXI, sheetImg, name) {
    var spec = CREATURES[name];
    if (!spec || !sheetImg) return null;
    var cv = document.createElement('canvas');
    cv.width = spec.w; cv.height = spec.h;
    var ctx = cv.getContext('2d');
    ctx.drawImage(sheetImg, spec.x, spec.y, spec.w, spec.h, 0, 0, spec.w, spec.h);
    return PIXI.Texture.from(cv);
  }

  window._buildUnderwaterScene = function (app, PIXI, sheetImg) {
    var container = new PIXI.Container();
    container.eventMode = 'static';

    var W = function () { return app.renderer.width / app.renderer.resolution; };
    var H = function () { return app.renderer.height / app.renderer.resolution; };

    // Water gradient
    var water = new PIXI.Graphics();
    function drawWater() {
      water.clear();
      var w = W(), h = H();
      var stops = [{ o: 0, c: 0x021022 }, { o: 0.5, c: 0x073e5f }, { o: 1, c: 0x02131f }];
      var slices = 64;
      for (var i = 0; i < slices; i++) {
        var t = i / (slices - 1);
        var lo = stops[0], hi = stops[stops.length - 1];
        for (var j = 0; j < stops.length - 1; j++) {
          if (t >= stops[j].o && t <= stops[j + 1].o) { lo = stops[j]; hi = stops[j + 1]; break; }
        }
        var lt = (t - lo.o) / Math.max(0.0001, hi.o - lo.o);
        var r = Math.round(((lo.c >> 16) & 0xff) * (1 - lt) + ((hi.c >> 16) & 0xff) * lt);
        var g = Math.round(((lo.c >> 8) & 0xff) * (1 - lt) + ((hi.c >> 8) & 0xff) * lt);
        var b = Math.round((lo.c & 0xff) * (1 - lt) + (hi.c & 0xff) * lt);
        water.rect(0, (i / slices) * h, w, h / slices + 1).fill(((r << 16) | (g << 8) | b) >>> 0);
      }
    }
    container.addChild(water);

    // Moon halo
    var moon = new PIXI.Graphics();
    function drawMoon() {
      moon.clear();
      var x = W() * 0.25, y = H() * 0.2;
      for (var r = 130; r > 0; r -= 14) {
        moon.circle(x, y, r).fill({ color: 0x9ccbe8, alpha: 0.05 });
      }
      moon.circle(x, y, 40).fill({ color: 0xe0eef8, alpha: 0.9 });
      moon.circle(x + 8, y - 4, 34).fill({ color: 0x021022, alpha: 0.2 });
    }
    container.addChild(moon);

    // God rays
    var rays = new PIXI.Graphics();
    function drawRays(t) {
      rays.clear();
      var w = W(), h = H(), count = 6;
      for (var i = 0; i < count; i++) {
        var x = (i / count) * w + Math.sin(t * 0.0004 + i) * 18;
        rays.moveTo(x - 15, 0).lineTo(x + 15, 0).lineTo(x + 70, h * 0.7).lineTo(x - 70, h * 0.7)
          .closePath().fill({ color: 0xa5d4ec, alpha: 0.04 });
      }
    }
    container.addChild(rays);

    // Coral floor
    var coral = new PIXI.Graphics();
    function drawCoral() {
      coral.clear();
      var w = W(), h = H(), baseY = h * 0.96;
      coral.rect(0, baseY, w, h - baseY).fill(0x0a2942);
      for (var x = -20; x < w + 20; x += 18) {
        var hBump = 8 + ((x * 37) % 14);
        coral.moveTo(x, baseY).bezierCurveTo(x + 6, baseY - hBump, x + 12, baseY - hBump, x + 18, baseY)
          .fill({ color: 0x0f3552, alpha: 0.8 });
      }
      [[w * 0.12, baseY - 10, 0xb86a5a], [w * 0.4, baseY - 8, 0x8a4a6a],
       [w * 0.72, baseY - 12, 0xb86a5a], [w * 0.9, baseY - 6, 0x6a4a8a]].forEach(function (d) {
        for (var b = 0; b < 6; b++) {
          coral.circle(d[0] + (b - 3) * 6, d[1] - Math.abs(b - 3) * 4, 7 + Math.abs(b - 3) * 2)
            .fill({ color: d[2], alpha: 0.85 });
        }
      });
    }
    container.addChild(coral);

    // Seaweed
    var seaweed = new PIXI.Container();
    container.addChild(seaweed);
    var seaweedList = [];
    function buildSeaweed() {
      seaweed.removeChildren(); seaweedList.length = 0;
      var count = Math.max(5, Math.round(W() / 220));
      for (var i = 0; i < count; i++) {
        var s = new PIXI.Graphics();
        s.x = (i / count) * W() + Math.random() * 40;
        s.y = H() * 0.96;
        s.phase = Math.random() * Math.PI * 2;
        s.swHeight = 80 + Math.random() * 60;
        seaweed.addChild(s); seaweedList.push(s);
      }
    }
    function drawSeaweed(t) {
      seaweedList.forEach(function (s) {
        s.clear();
        var segs = 8, pts = [];
        for (var k = 0; k <= segs; k++) {
          var ky = (k / segs) * -s.swHeight;
          var wobble = Math.sin(t * 0.0018 + s.phase + k * 0.4) * (k / segs) * 10;
          pts.push({ x: wobble, y: ky });
        }
        s.moveTo(pts[0].x, pts[0].y);
        for (var k2 = 1; k2 < pts.length; k2++) s.lineTo(pts[k2].x, pts[k2].y);
        s.stroke({ color: 0x1f7a5e, width: 5, cap: 'round', alpha: 0.85 });
      });
    }

    // Bubbles
    var bubbles = new PIXI.Container();
    container.addChild(bubbles);
    var bubbleList = [];
    function spawnBubble(x, y, vy) {
      var g = new PIXI.Graphics();
      var r = 2 + Math.random() * 6;
      g.circle(0, 0, r).stroke({ color: 0xffffff, alpha: 0.4, width: 1 });
      g.circle(-r * 0.3, -r * 0.3, r * 0.3).fill({ color: 0xffffff, alpha: 0.4 });
      g.x = x !== undefined ? x : Math.random() * W();
      g.y = y !== undefined ? y : H() + 20;
      g.vy = vy !== undefined ? vy : 0.5 + Math.random() * 0.8;
      g.wob = Math.random() * Math.PI * 2;
      bubbles.addChild(g); bubbleList.push(g);
    }
    function burstBubbles(x, y, n) {
      for (var i = 0; i < n; i++) {
        spawnBubble(x + (Math.random() - 0.5) * 24, y + (Math.random() - 0.5) * 10, 0.8 + Math.random() * 1.4);
      }
    }

    // ---- Creature sprites (from deepsea.png) ----
    var creatureLayer = new PIXI.Container();
    container.addChild(creatureLayer);
    var creatureList = [];

    var SMALL_NAMES = ['fish_small_blue', 'fish_small_purple', 'fish_small_teal', 'fish_small_orange',
      'fish_small_striped', 'fish_small_yellow', 'fish_small_silver', 'fish_small_pink'];
    var MED_NAMES = ['fish_med_blue', 'fish_med_purple', 'fish_med_red', 'fish_med_boxfish',
      'fish_med_anglerfish', 'fish_med_violet'];
    var LARGE_NAMES = ['fish_large_grouper', 'fish_large_shark', 'fish_large_ray'];
    var JELLY_NAMES = ['jelly_cyan', 'jelly_pink', 'jelly_blue', 'jelly_lavender',
      'jelly_gold', 'jelly_moon', 'octopus', 'squid'];

    function buildCreatures() {
      creatureLayer.removeChildren(); creatureList.length = 0;
      if (!sheetImg) return;

      var w = W(), h = H();

      // Large fish — 3 sprites, deep, slow
      LARGE_NAMES.forEach(function (name, idx) {
        var tex = cropTexture(PIXI, sheetImg, name);
        if (!tex) return;
        var s = new PIXI.Sprite(tex);
        s.blendMode = 'screen';
        s.anchor.set(0.5, 0.5);
        s.alpha = 0.5;
        var targetH = h * 0.16;
        s.scale.set(targetH / CREATURES[name].h);
        s.x = (idx / LARGE_NAMES.length) * w + Math.random() * 200;
        s.y = h * 0.65 + Math.random() * h * 0.15;
        s.vx = (0.18 + Math.random() * 0.14) * (Math.random() < 0.5 ? 1 : -1);
        s.swimType = 'large';
        s.bob = Math.random() * Math.PI * 2;
        if (s.vx < 0) s.scale.x *= -1;
        creatureLayer.addChild(s); creatureList.push(s);
      });

      // Medium fish — 6 sprites, mid-water
      MED_NAMES.forEach(function (name, idx) {
        var tex = cropTexture(PIXI, sheetImg, name);
        if (!tex) return;
        var s = new PIXI.Sprite(tex);
        s.blendMode = 'screen';
        s.anchor.set(0.5, 0.5);
        s.alpha = 0.75;
        var targetH = h * 0.10;
        s.scale.set(targetH / CREATURES[name].h);
        s.x = Math.random() * w;
        s.y = h * 0.3 + Math.random() * h * 0.4;
        s.vx = (0.4 + Math.random() * 0.35) * (Math.random() < 0.5 ? 1 : -1);
        s.swimType = 'med';
        s.bob = Math.random() * Math.PI * 2;
        s._baseScaleX = targetH / CREATURES[name].h;
        if (s.vx < 0) s.scale.x = -s._baseScaleX;
        creatureLayer.addChild(s); creatureList.push(s);
      });

      // Small fish — at least 7, upper-mid water, clickable
      var smallCount = Math.max(7, Math.round(w / 200));
      for (var si = 0; si < smallCount; si++) {
        var sName = SMALL_NAMES[si % SMALL_NAMES.length];
        var tex2 = cropTexture(PIXI, sheetImg, sName);
        if (!tex2) continue;
        var sf = new PIXI.Sprite(tex2);
        sf.blendMode = 'screen';
        sf.anchor.set(0.5, 0.5);
        sf.alpha = 0.85;
        var targetH2 = h * 0.055;
        sf.scale.set(targetH2 / CREATURES[sName].h);
        sf.x = Math.random() * w;
        sf.y = h * 0.2 + Math.random() * h * 0.35;
        sf.vx = (0.6 + Math.random() * 0.5) * (Math.random() < 0.5 ? 1 : -1);
        sf.swimType = 'small';
        sf.bob = Math.random() * Math.PI * 2;
        sf._baseScaleX = targetH2 / CREATURES[sName].h;
        if (sf.vx < 0) sf.scale.x = -sf._baseScaleX;
        sf.eventMode = 'static';
        sf.cursor = 'pointer';
        sf.hitArea = new PIXI.Rectangle(-sf._baseScaleX * 60, -sf._baseScaleX * 50, sf._baseScaleX * 120, sf._baseScaleX * 100);
        (function (s) {
          s.on('pointerdown', function () {
            burstBubbles(s.x, s.y, 5 + Math.floor(Math.random() * 4));
            s.vx = (s.vx >= 0 ? 1 : -1) * (2.5 + Math.random() * 1.2);
          });
        }(sf));
        creatureLayer.addChild(sf); creatureList.push(sf);
      }

      // Jellyfish, octopus, squid — drift upward, pulse
      JELLY_NAMES.forEach(function (name, idx) {
        var tex3 = cropTexture(PIXI, sheetImg, name);
        if (!tex3) return;
        var jf = new PIXI.Sprite(tex3);
        jf.blendMode = 'screen';
        jf.anchor.set(0.5, 0.5);
        jf.alpha = 0.65;
        var targetH3 = h * 0.14;
        var baseScale = targetH3 / CREATURES[name].h;
        jf.scale.set(baseScale);
        jf.x = (idx / JELLY_NAMES.length) * w + Math.random() * (w / JELLY_NAMES.length);
        jf.y = h * 0.4 + Math.random() * h * 0.5;
        jf.vy = 0.25 + Math.random() * 0.2;
        jf.sway = Math.random() * Math.PI * 2;
        jf.swimType = 'jelly';
        jf._baseScale = baseScale;
        jf._pulse = Math.random() * Math.PI * 2;
        creatureLayer.addChild(jf); creatureList.push(jf);
      });
    }

    function layout() {
      drawWater(); drawMoon(); drawCoral(); buildSeaweed(); buildCreatures();
    }
    layout();

    var onResize = function () { layout(); };
    app.renderer.on('resize', onResize);

    var _t0 = performance.now();
    var _bubbleTimer = 0;

    var tick = function (ticker) {
      if (!container.visible) return;
      var t = performance.now() - _t0;
      drawRays(t);
      drawSeaweed(t);

      var w = W(), h = H();

      // Animate creatures
      creatureList.forEach(function (s) {
        if (s.swimType === 'large') {
          s.bob += 0.008;
          s.x += s.vx;
          s.y += Math.sin(s.bob) * 0.15;
          s.vx *= 0.9995;
          if (s.vx > 0 && s.x > w + 300) { s.x = -300; s.y = h * 0.6 + Math.random() * h * 0.2; }
          if (s.vx < 0 && s.x < -300) { s.x = w + 300; s.y = h * 0.6 + Math.random() * h * 0.2; }
        } else if (s.swimType === 'med') {
          s.bob += 0.015;
          s.x += s.vx;
          s.y += Math.sin(s.bob) * 0.25;
          s.vx *= 0.9998;
          var bsx = s._baseScaleX || (h * 0.10 / 113);
          s.scale.x = s.vx < 0 ? -bsx : bsx;
          if (s.vx > 0 && s.x > w + 200) { s.x = -200; s.y = h * 0.3 + Math.random() * h * 0.4; }
          if (s.vx < 0 && s.x < -200) { s.x = w + 200; s.y = h * 0.3 + Math.random() * h * 0.4; }
        } else if (s.swimType === 'small') {
          s.bob += 0.025;
          s.x += s.vx;
          s.y += Math.sin(s.bob) * 0.3;
          s.vx *= 0.9997;
          var bsx2 = s._baseScaleX || (h * 0.055 / 103);
          s.scale.x = s.vx < 0 ? -bsx2 : bsx2;
          if (s.vx > 0 && s.x > w + 100) { s.x = -100; s.y = h * 0.2 + Math.random() * h * 0.35; }
          if (s.vx < 0 && s.x < -100) { s.x = w + 100; s.y = h * 0.2 + Math.random() * h * 0.35; }
        } else if (s.swimType === 'jelly') {
          s._pulse += 0.04;
          s.sway += 0.018;
          s.y -= s.vy;
          s.x += Math.sin(s.sway) * 0.4;
          var pulseFactor = 1 + Math.sin(s._pulse) * 0.04;
          var bs = s._baseScale || (h * 0.14 / 193);
          s.scale.set(bs * pulseFactor);
          if (s.y < -200) {
            s.y = h + 100;
            s.x = Math.random() * w;
          }
        }
      });

      // Bubbles
      _bubbleTimer += (ticker && ticker.deltaMS) || 16;
      if (_bubbleTimer > 220) { _bubbleTimer = 0; spawnBubble(); }
      for (var i = bubbleList.length - 1; i >= 0; i--) {
        var b = bubbleList[i];
        b.y -= b.vy;
        b.wob += 0.03;
        b.x += Math.sin(b.wob) * 0.4;
        if (b.y < -20) { b.destroy(); bubbleList.splice(i, 1); }
      }
    };
    app.ticker.add(tick);

    return {
      container: container,
      destroy: function () {
        app.ticker.remove(tick);
        app.renderer.off('resize', onResize);
        container.destroy({ children: true });
      }
    };
  };

  // ---------------------------------------------------------------------------
  // 17. Scene loader — boot Pixi, load sprite sheet, mount both scenes
  // ---------------------------------------------------------------------------
  var sceneLight = document.getElementById('scene-light');
  var sceneDark = document.getElementById('scene-dark');

  function updateSceneVisibility() {
    var theme = root.getAttribute('data-theme') || 'light';
    if (sceneLight) sceneLight.classList.toggle('is-active', theme === 'light');
    if (sceneDark) sceneDark.classList.toggle('is-active', theme === 'dark');
  }
  updateSceneVisibility();
  new MutationObserver(updateSceneVisibility).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  function bootScenes(sheetImgOrNull) {
    if (prefersReducedMotion) return;
    if (typeof PIXI === 'undefined') { console.warn('Pixi not loaded'); return; }
    var sceneBg = document.querySelector('.scene-background');
    if (!sceneBg) return;

    var app = new PIXI.Application();
    app.init({
      width: window.innerWidth,
      height: window.innerHeight,
      background: 0xffd4a3,
      antialias: true,
      autoDensity: true,
      preference: 'webgl',
      resolution: Math.min(window.devicePixelRatio || 1, 2)
    }).then(function () {
      var canvas = app.canvas;
      canvas.style.cssText = 'display:block;width:100%;height:100%;position:absolute;inset:0;';
      sceneBg.appendChild(canvas);

      window.addEventListener('resize', function () {
        app.renderer.resize(window.innerWidth, window.innerHeight);
      });

      var islandScene = window._buildIslandScene(app, PIXI);
      var underwaterScene = window._buildUnderwaterScene(app, PIXI, sheetImgOrNull);
      app.stage.addChild(islandScene.container);
      app.stage.addChild(underwaterScene.container);

      function syncVisibility() {
        var theme = root.getAttribute('data-theme') || 'light';
        islandScene.container.visible = (theme === 'light');
        underwaterScene.container.visible = (theme === 'dark');
        app.renderer.background.color = theme === 'dark' ? 0x021022 : 0xffd4a3;
      }
      syncVisibility();
      new MutationObserver(syncVisibility).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    }).catch(function (err) {
      console.warn('Pixi init failed:', err);
    });
  }

  // Load sprite sheet first, then boot scenes
  var sheetImg = new Image();
  sheetImg.crossOrigin = 'anonymous';
  sheetImg.onload = function () { bootScenes(sheetImg); };
  sheetImg.onerror = function () {
    console.warn('deepsea.png not found — underwater creatures disabled');
    bootScenes(null);
  };
  sheetImg.src = SPRITE_SHEET_URL;

}());
