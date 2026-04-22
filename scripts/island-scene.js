// =========================================================================
// Island scene (light mode) — builds into a shared Pixi.Application.
// Sky gradient, sun, drifting clouds (click to part), mountains, palms,
// beach, ocean waves, foam.
// =========================================================================

export function buildIslandScene(app, PIXI) {
  const container = new PIXI.Container();
  container.eventMode = "static";

  const W = () => app.renderer.width / app.renderer.resolution;
  const H = () => app.renderer.height / app.renderer.resolution;

  // Sky gradient --------------------------------------------------------
  const sky = new PIXI.Graphics();
  function drawSky() {
    sky.clear();
    const w = W(), h = H();
    const stops = [
      { o: 0, c: 0xffd4a3 },
      { o: 0.45, c: 0xffb58c },
      { o: 1, c: 0x9ad4e6 },
    ];
    const slices = 48;
    for (let i = 0; i < slices; i++) {
      const t = i / (slices - 1);
      let lo = stops[0], hi = stops[stops.length - 1];
      for (let j = 0; j < stops.length - 1; j++) {
        if (t >= stops[j].o && t <= stops[j + 1].o) { lo = stops[j]; hi = stops[j + 1]; break; }
      }
      const lt = (t - lo.o) / Math.max(0.0001, hi.o - lo.o);
      const r = Math.round(((lo.c >> 16) & 0xff) * (1 - lt) + ((hi.c >> 16) & 0xff) * lt);
      const g = Math.round(((lo.c >> 8) & 0xff) * (1 - lt) + ((hi.c >> 8) & 0xff) * lt);
      const b = Math.round((lo.c & 0xff) * (1 - lt) + (hi.c & 0xff) * lt);
      sky.rect(0, (i / slices) * h, w, h / slices + 1).fill(((r << 16) | (g << 8) | b) >>> 0);
    }
  }
  container.addChild(sky);

  // Sun -----------------------------------------------------------------
  const sun = new PIXI.Graphics();
  function drawSun() {
    sun.clear();
    const x = W() * 0.75;
    const y = H() * 0.22;
    for (let r = 110; r > 0; r -= 12) {
      const alpha = 0.08 + (110 - r) / 200;
      sun.circle(x, y, r).fill({ color: 0xfff2b8, alpha });
    }
    sun.circle(x, y, 46).fill(0xfffbea);
  }
  container.addChild(sun);

  // Mountains -----------------------------------------------------------
  const mountains = new PIXI.Graphics();
  function drawMountains() {
    mountains.clear();
    const h = H();
    const w = W();
    const baseY = h * 0.62;
    mountains.moveTo(-20, baseY + 40);
    mountains.lineTo(w * 0.15, baseY - 60);
    mountains.lineTo(w * 0.28, baseY + 10);
    mountains.lineTo(w * 0.42, baseY - 80);
    mountains.lineTo(w * 0.55, baseY + 5);
    mountains.lineTo(w * 0.7, baseY - 50);
    mountains.lineTo(w * 0.88, baseY + 20);
    mountains.lineTo(w + 20, baseY + 40);
    mountains.lineTo(w + 20, h + 20);
    mountains.lineTo(-20, h + 20);
    mountains.closePath();
    mountains.fill({ color: 0x2d5a36, alpha: 0.55 });
    mountains.moveTo(-20, baseY + 80);
    mountains.lineTo(w * 0.2, baseY + 10);
    mountains.lineTo(w * 0.35, baseY + 70);
    mountains.lineTo(w * 0.5, baseY);
    mountains.lineTo(w * 0.68, baseY + 40);
    mountains.lineTo(w * 0.82, baseY - 10);
    mountains.lineTo(w + 20, baseY + 60);
    mountains.lineTo(w + 20, h + 20);
    mountains.lineTo(-20, h + 20);
    mountains.closePath();
    mountains.fill({ color: 0x1f3d24, alpha: 0.95 });
  }
  container.addChild(mountains);

  // Beach --------------------------------------------------------------
  const beach = new PIXI.Graphics();
  function drawBeach() {
    beach.clear();
    const h = H(), w = W();
    const y = h * 0.82;
    beach.rect(0, y, w, h - y).fill(0xf5e2b8);
    beach.rect(0, y - 2, w, 4).fill({ color: 0xe9cf97, alpha: 0.6 });
  }
  container.addChild(beach);

  // Ocean --------------------------------------------------------------
  const ocean = new PIXI.Graphics();
  const wavePath = [];
  function drawOcean(t) {
    ocean.clear();
    const w = W(), h = H();
    const baseY = h * 0.78;
    const pts = 48;
    wavePath.length = 0;
    for (let i = 0; i <= pts; i++) {
      const x = (i / pts) * w;
      const y = baseY + Math.sin(i * 0.4 + t * 0.002) * 4 + Math.sin(i * 0.2 + t * 0.0011) * 3;
      wavePath.push({ x, y });
    }
    ocean.moveTo(0, baseY + 8);
    wavePath.forEach((p) => ocean.lineTo(p.x, p.y));
    ocean.lineTo(w, h * 0.82);
    ocean.lineTo(0, h * 0.82);
    ocean.closePath();
    ocean.fill({ color: 0x3f92b0, alpha: 0.9 });
    ocean.moveTo(0, baseY + 4);
    wavePath.forEach((p) => ocean.lineTo(p.x, p.y - 2));
    ocean.stroke({ color: 0xffffff, alpha: 0.55, width: 1.2 });
  }
  container.addChild(ocean);

  // Clouds --------------------------------------------------------------
  const cloudLayer = new PIXI.Container();
  cloudLayer.eventMode = "static";
  container.addChild(cloudLayer);
  const clouds = [];
  function makeCloud(x, y, scale) {
    const c = new PIXI.Container();
    c.x = x; c.y = y;
    c.eventMode = "static";
    c.cursor = "pointer";
    const g = new PIXI.Graphics();
    const r = 26 * scale;
    [[-30, 0], [-10, -8], [10, -4], [24, 4], [-4, 8]].forEach(([dx, dy]) => {
      g.circle(dx * scale, dy * scale, r).fill({ color: 0xffffff, alpha: 0.95 });
    });
    c.addChild(g);
    c.hitArea = new PIXI.Rectangle(-60 * scale, -30 * scale, 120 * scale, 60 * scale);
    c.on("pointerdown", () => {
      c.targetOffset = (Math.random() - 0.5) * 160;
    });
    c.speed = 0.05 + Math.random() * 0.06;
    c.bob = Math.random() * Math.PI * 2;
    c.targetOffset = 0;
    c.offset = 0;
    cloudLayer.addChild(c);
    clouds.push(c);
    return c;
  }

  // Palms --------------------------------------------------------------
  const palms = new PIXI.Container();
  container.addChild(palms);
  const palmList = [];
  function buildPalm(x, yBase, flip) {
    const p = new PIXI.Container();
    p.x = x; p.y = yBase;
    const trunk = new PIXI.Graphics();
    trunk.moveTo(0, 0).bezierCurveTo(4 * (flip ? -1 : 1), -30, -6 * (flip ? -1 : 1), -70, 2 * (flip ? -1 : 1), -120);
    trunk.stroke({ color: 0x0f2e16, width: 6, cap: "round" });
    p.addChild(trunk);
    const top = new PIXI.Container();
    top.x = 2 * (flip ? -1 : 1); top.y = -120;
    for (let i = 0; i < 7; i++) {
      const frond = new PIXI.Graphics();
      const angle = -Math.PI / 2 + (i - 3) * 0.38;
      const len = 70;
      const ex = Math.cos(angle) * len;
      const ey = Math.sin(angle) * len;
      frond.moveTo(0, 0).quadraticCurveTo(ex * 0.5, ey * 0.5 - 12, ex, ey);
      frond.stroke({ color: 0x0f2e16, width: 4, cap: "round" });
      top.addChild(frond);
    }
    top.pivot.set(0, 0);
    p.top = top;
    p.addChild(top);
    palms.addChild(p);
    palmList.push(p);
    return p;
  }

  function layout() {
    drawSky();
    drawSun();
    drawMountains();
    drawBeach();
    drawOcean(0);

    cloudLayer.removeChildren();
    clouds.length = 0;
    const count = Math.max(3, Math.round(W() / 280));
    for (let i = 0; i < count; i++) {
      makeCloud((i / count) * W() + Math.random() * 60, 60 + Math.random() * 120, 0.7 + Math.random() * 0.6);
    }

    palms.removeChildren();
    palmList.length = 0;
    buildPalm(W() * 0.12, H() * 0.85, false);
    buildPalm(W() * 0.88, H() * 0.84, true);
    if (W() > 900) buildPalm(W() * 0.78, H() * 0.88, false);
  }
  layout();

  const onResize = () => layout();
  app.renderer.on("resize", onResize);

  // Ticker --------------------------------------------------------------
  const t0 = performance.now();
  const tick = () => {
    if (!container.visible) return;
    const now = performance.now();
    const t = now - t0;
    drawOcean(t);
    clouds.forEach((c) => {
      c.x += c.speed;
      c.bob += 0.01;
      c.offset += (c.targetOffset - c.offset) * 0.04;
      c.y += Math.sin(c.bob) * 0.06 + c.offset * 0.003;
      c.targetOffset *= 0.96;
      if (c.x - 80 > W()) c.x = -80;
    });
    palmList.forEach((p, i) => {
      p.top.rotation = Math.sin(t * 0.0009 + i) * 0.04;
    });
  };
  app.ticker.add(tick);

  return {
    container,
    destroy() {
      app.ticker.remove(tick);
      app.renderer.off("resize", onResize);
      container.destroy({ children: true });
    },
  };
}
