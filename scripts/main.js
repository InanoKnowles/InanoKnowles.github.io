// =========================================================================
// Inano Knowles — portfolio interactions
// Vanilla ES modules. No build step. Loads Pixi + Motion One from CDN.
// =========================================================================

import { animate, stagger } from "https://cdn.jsdelivr.net/npm/motion@11.15.0/+esm";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// --- Dynamic year ---------------------------------------------------------
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// --- Kia orana console greeting ------------------------------------------
(function consoleGreeting() {
  const banner = [
    "%c Kia orana! ",
    "%c If you're reading this, you're curious — I like that.",
    "%c Try typing 'aroa' anywhere on the page. Meitaki. 🌺",
  ].join("\n");
  const style1 = "background:#d9412a;color:#fffaf1;padding:4px 10px;border-radius:4px;font-weight:700;";
  const style2 = "color:#1f86a0;font-family:monospace;";
  const style3 = "color:#d9412a;font-style:italic;";
  try {
    console.log(banner, style1, style2, style3);
  } catch (e) {}
})();

// --- Tivaevae motif renderer ---------------------------------------------
// Renders an SVG quilt motif into any [data-motif] span.
// data-motif="<px size>"  data-motif-color="<css>"  data-motif-accent="<css>"
function renderMotif(el) {
  const size = Number(el.dataset.motif) || 220;
  const color = el.dataset.motifColor || "var(--accent)";
  const accent = el.dataset.motifAccent || "var(--accent-2)";
  const petals = 8;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.42;
  const innerR = size * 0.2;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("role", "presentation");
  svg.style.display = "block";
  svg.style.overflow = "visible";

  // Faint outer ring
  const ring = document.createElementNS(svgNS, "circle");
  ring.setAttribute("cx", String(cx));
  ring.setAttribute("cy", String(cy));
  ring.setAttribute("r", String(outerR * 1.08));
  ring.setAttribute("fill", "none");
  ring.setAttribute("stroke", color);
  ring.setAttribute("stroke-opacity", "0.25");
  ring.setAttribute("stroke-dasharray", "2 4");
  ring.setAttribute("stroke-width", "1");
  svg.appendChild(ring);

  // Petals
  for (let i = 0; i < petals; i++) {
    const angle = (i / petals) * Math.PI * 2;
    const px = cx + Math.cos(angle) * outerR * 0.55;
    const py = cy + Math.sin(angle) * outerR * 0.55;
    const petal = document.createElementNS(svgNS, "ellipse");
    petal.setAttribute("cx", String(px));
    petal.setAttribute("cy", String(py));
    petal.setAttribute("rx", String(outerR * 0.42));
    petal.setAttribute("ry", String(outerR * 0.22));
    petal.setAttribute("fill", color);
    petal.setAttribute("fill-opacity", "0.8");
    petal.setAttribute("transform", `rotate(${(angle * 180) / Math.PI} ${px} ${py})`);
    svg.appendChild(petal);

    const petalInner = document.createElementNS(svgNS, "ellipse");
    petalInner.setAttribute("cx", String(px));
    petalInner.setAttribute("cy", String(py));
    petalInner.setAttribute("rx", String(outerR * 0.22));
    petalInner.setAttribute("ry", String(outerR * 0.1));
    petalInner.setAttribute("fill", accent);
    petalInner.setAttribute("fill-opacity", "0.95");
    petalInner.setAttribute("transform", `rotate(${(angle * 180) / Math.PI} ${px} ${py})`);
    svg.appendChild(petalInner);
  }

  // Inner rosette
  for (let i = 0; i < petals; i++) {
    const angle = (i / petals) * Math.PI * 2 + Math.PI / petals;
    const px = cx + Math.cos(angle) * innerR * 0.9;
    const py = cy + Math.sin(angle) * innerR * 0.9;
    const dot = document.createElementNS(svgNS, "circle");
    dot.setAttribute("cx", String(px));
    dot.setAttribute("cy", String(py));
    dot.setAttribute("r", String(innerR * 0.22));
    dot.setAttribute("fill", accent);
    dot.setAttribute("fill-opacity", "0.9");
    svg.appendChild(dot);
  }

  // Centre
  const core = document.createElementNS(svgNS, "circle");
  core.setAttribute("cx", String(cx));
  core.setAttribute("cy", String(cy));
  core.setAttribute("r", String(innerR * 0.48));
  core.setAttribute("fill", color);
  svg.appendChild(core);

  const coreDot = document.createElementNS(svgNS, "circle");
  coreDot.setAttribute("cx", String(cx));
  coreDot.setAttribute("cy", String(cy));
  coreDot.setAttribute("r", String(innerR * 0.18));
  coreDot.setAttribute("fill", accent);
  svg.appendChild(coreDot);

  el.innerHTML = "";
  el.appendChild(svg);
}

document.querySelectorAll("[data-motif]").forEach(renderMotif);

// --- Reveal on scroll -----------------------------------------------------
if (prefersReducedMotion) {
  document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
  document.querySelectorAll(".section").forEach((el) => el.classList.add("is-visible"));
} else {
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => revealObs.observe(el));

  const sectionObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          sectionObs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -20% 0px", threshold: 0.05 }
  );
  document.querySelectorAll(".section").forEach((el) => sectionObs.observe(el));
}

// --- Theme toggle (with ripple) ------------------------------------------
const themeToggle = document.getElementById("theme-toggle");
const root = document.documentElement;

function applyTheme(next, origin) {
  const current = root.getAttribute("data-theme") || "light";
  if (current === next) return;

  if (prefersReducedMotion || !origin) {
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("inano-theme", next); } catch (e) {}
    return;
  }

  // Ripple overlay from button centre
  const ripple = document.createElement("div");
  ripple.className = "theme-ripple";
  ripple.style.setProperty("--tr-x", `${origin.x}px`);
  ripple.style.setProperty("--tr-y", `${origin.y}px`);
  document.body.appendChild(ripple);

  requestAnimationFrame(() => {
    ripple.classList.add("is-expanding");
  });

  window.setTimeout(() => {
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("inano-theme", next); } catch (e) {}
  }, 280);

  window.setTimeout(() => {
    ripple.classList.add("is-fading");
    window.setTimeout(() => ripple.remove(), 500);
  }, 650);
}

if (themeToggle) {
  themeToggle.addEventListener("click", (e) => {
    const current = root.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    const rect = themeToggle.getBoundingClientRect();
    applyTheme(next, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  });
}

// --- Hamburger menu -------------------------------------------------------
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobile-menu");

function setMenuOpen(open) {
  if (!hamburger || !mobileMenu) return;
  hamburger.setAttribute("aria-expanded", open ? "true" : "false");
  hamburger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  hamburger.classList.toggle("is-open", open);
  mobileMenu.classList.toggle("is-open", open);
  mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
  document.body.classList.toggle("no-scroll", open);
}

if (hamburger && mobileMenu) {
  hamburger.addEventListener("click", () => {
    setMenuOpen(hamburger.getAttribute("aria-expanded") !== "true");
  });
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && hamburger.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false);
      hamburger.focus();
    }
  });
}

// --- Smooth scroll for same-page hash links ------------------------------
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    if (typeof target.setAttribute === "function") {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
  });
});

// --- Formspree contact form (async, no tab change) -----------------------
const form = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");
const formSubmit = document.getElementById("form-submit");

if (form && formStatus && formSubmit) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Honeypot: if filled, pretend success and bail.
    const honey = form.querySelector('input[name="_gotcha"]');
    if (honey && honey.value) {
      formStatus.textContent = "Meitaki! Message received.";
      formStatus.dataset.state = "ok";
      form.reset();
      return;
    }

    const action = form.getAttribute("action") || "";
    if (action.includes("REPLACE_WITH_YOUR_FORMSPREE_ID")) {
      formStatus.textContent = "Form isn't wired up yet — email kia.orana@inano.dev instead.";
      formStatus.dataset.state = "warn";
      return;
    }

    formStatus.textContent = "Paddling your note across…";
    formStatus.dataset.state = "sending";
    formSubmit.disabled = true;

    try {
      const data = new FormData(form);
      const res = await fetch(action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        formStatus.textContent = "Meitaki ma'ata! Your message landed safely.";
        formStatus.dataset.state = "ok";
        form.reset();
        triggerBloom();
      } else {
        const body = await res.json().catch(() => ({}));
        const msg = body && body.errors ? body.errors.map((x) => x.message).join(", ") : "Something drifted off course. Try again?";
        formStatus.textContent = msg;
        formStatus.dataset.state = "error";
      }
    } catch (err) {
      formStatus.textContent = "The wind took that one — try again, or email kia.orana@inano.dev.";
      formStatus.dataset.state = "error";
    } finally {
      formSubmit.disabled = false;
    }
  });
}

// --- Tivaevae bloom overlay (triple-click + form success) ----------------
const bloom = document.getElementById("tivaevae-bloom");

function triggerBloom() {
  if (!bloom) return;
  bloom.classList.remove("is-active");
  // Force reflow so the animation restarts.
  void bloom.offsetWidth;
  bloom.classList.add("is-active");
  window.setTimeout(() => bloom.classList.remove("is-active"), 2600);
}

const wordmark = document.getElementById("wordmark") || document.querySelector(".wordmark");
if (wordmark) {
  let clicks = 0;
  let clickTimer = null;
  wordmark.addEventListener("click", (e) => {
    clicks++;
    if (clickTimer) clearTimeout(clickTimer);
    clickTimer = window.setTimeout(() => { clicks = 0; }, 600);
    if (clicks >= 3) {
      e.preventDefault();
      clicks = 0;
      triggerBloom();
    }
  });
}

// --- "aroa" keystroke easter egg ------------------------------------------
(function aroaEasterEgg() {
  const target = "aroa";
  let buffer = "";
  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : "";
    if (!key) return;
    buffer = (buffer + key).slice(-target.length);
    if (buffer === target) {
      buffer = "";
      triggerBloom();
    }
  });
})();

// --- Hibiscus cursor trail (hero only) -----------------------------------
// Listen on the hero section (heroTrail has pointer-events:none to avoid
// blocking hero buttons, so we attach to the parent section instead).
const heroTrail = document.getElementById("hero-trail");
const heroSection = document.querySelector(".hero");
if (heroTrail && heroSection && !prefersReducedMotion) {
  let lastSpawn = 0;
  const SPAWN_MS = 70;
  const palette = ["#d9412a", "#eac57c", "#1f86a0", "#f26142"];
  const petalSvg = (color) =>
    `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 2C9 6 6 7 4 11c-2 4 2 9 8 9s10-5 8-9c-2-4-5-5-8-9z" fill="${color}" fill-opacity="0.85"/><circle cx="12" cy="13" r="2" fill="#fffaf1"/></svg>`;

  heroSection.addEventListener("pointermove", (e) => {
    const now = performance.now();
    if (now - lastSpawn < SPAWN_MS) return;
    lastSpawn = now;

    const rect = heroTrail.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const petal = document.createElement("span");
    petal.className = "hero-trail-petal";
    petal.style.left = `${x}px`;
    petal.style.top = `${y}px`;
    petal.innerHTML = petalSvg(palette[Math.floor(Math.random() * palette.length)]);
    heroTrail.appendChild(petal);

    const drift = (Math.random() - 0.5) * 80;
    const fall = 60 + Math.random() * 40;
    const rot = (Math.random() - 0.5) * 180;

    animate(
      petal,
      { x: [0, drift], y: [0, fall], rotate: [0, rot], opacity: [0.95, 0], scale: [0.6, 1] },
      { duration: 1.1, easing: "ease-out" }
    ).finished.then(() => petal.remove()).catch(() => petal.remove());
  });
}

// --- Hero headline flourish ---------------------------------------------
if (!prefersReducedMotion) {
  const lines = document.querySelectorAll(".hero-title .hero-title-line");
  if (lines.length) {
    animate(
      lines,
      { opacity: [0, 1], y: [24, 0] },
      { duration: 0.9, delay: stagger(0.12), easing: [0.16, 1, 0.3, 1] }
    );
  }
}

// --- Scene loader ---------------------------------------------------------
// Boot both Pixi scenes and crossfade based on theme.
const sceneLight = document.getElementById("scene-light");
const sceneDark = document.getElementById("scene-dark");

function updateSceneVisibility() {
  const theme = root.getAttribute("data-theme") || "light";
  if (sceneLight) sceneLight.classList.toggle("is-active", theme === "light");
  if (sceneDark) sceneDark.classList.toggle("is-active", theme === "dark");
}
updateSceneVisibility();

const themeObserver = new MutationObserver(updateSceneVisibility);
themeObserver.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

// Lazy-load Pixi scenes.
// One Pixi.Application is shared between both scenes — instantiating a
// second PIXI.Application throws "Extension type batcher already has a
// handler" in Pixi 8. Each scene mounts its own Container into the shared
// stage and is toggled via visibility.
(async function bootScenes() {
  if (prefersReducedMotion) return;
  const sceneBg = document.querySelector(".scene-background");
  if (!sceneBg) return;
  try {
    // Use the pre-bundled dist/pixi.min.mjs — esm.sh splits Pixi into
    // multiple modules and the second load throws
    // "Extension type batcher already has a handler".
    const [PIXI, island, underwater] = await Promise.all([
      import("https://cdn.jsdelivr.net/npm/pixi.js@8.8.1/dist/pixi.min.mjs"),
      import("./island-scene.js"),
      import("./underwater-scene.js"),
    ]);
    const app = new PIXI.Application();
    await app.init({
      width: sceneBg.clientWidth || window.innerWidth,
      height: sceneBg.clientHeight || window.innerHeight,
      background: 0xffd4a3,
      antialias: true,
      autoDensity: true,
      preference: "webgl",
      resolution: Math.min(window.devicePixelRatio || 1, 2),
    });
    const canvas = app.canvas;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    sceneBg.appendChild(canvas);

    const fitCanvas = () => {
      const w = sceneBg.clientWidth || window.innerWidth;
      const h = sceneBg.clientHeight || window.innerHeight;
      if (w && h) app.renderer.resize(w, h);
    };
    new ResizeObserver(fitCanvas).observe(sceneBg);

    // Build both scenes as containers attached to the shared stage.
    const islandScene = island.buildIslandScene
      ? island.buildIslandScene(app, PIXI)
      : null;
    const underwaterScene = underwater.buildUnderwaterScene
      ? underwater.buildUnderwaterScene(app, PIXI)
      : null;
    if (islandScene) app.stage.addChild(islandScene.container);
    if (underwaterScene) app.stage.addChild(underwaterScene.container);

    const syncVisibility = () => {
      const theme = root.getAttribute("data-theme") || "light";
      if (islandScene) islandScene.container.visible = theme === "light";
      if (underwaterScene) underwaterScene.container.visible = theme === "dark";
      // Keep background matching active theme.
      app.renderer.background.color = theme === "dark" ? 0x021022 : 0xffd4a3;
    };
    syncVisibility();
    new MutationObserver(syncVisibility).observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  } catch (err) {
    console.warn("Pixi scenes failed to load — falling back to CSS background.", err);
  }
})();
