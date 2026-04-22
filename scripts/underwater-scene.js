// =========================================================================
// Underwater scene (dark mode) — builds into a shared Pixi.Application.
// Water gradient, moon halo, god rays, swaying seaweed, bubbles,
// fish (click to scuttle), coral, distant school of fish.
// =========================================================================

export function buildUnderwaterScene(app, PIXI) {
  const container = new PIXI.Container();
  container.eventMode = "static";

  const W = () => app.renderer.width / app.renderer.resolution;
  const H = () => app.renderer.height / app.renderer.resolution;

  // Water gradient ------------------------------------------------------
  const water = new PIXI.Graphics();
  function drawWater() {
    water.clear();
    const w = W(), h = H();
    const stops = [
      { o: 0, c: 0x021022 },
      { o: 0.5, c: 0x073e5f },
      { o: 1, c: 0x02131f },
    ];
    const slices = 64;
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
      water.rect(0, (i / slices) * h, w, h / slices + 1).fill(((r << 16) | (g << 8) | b) >>> 0);
    }
  }
  container.addChild(water);

  // Moon halo -----------------------------------------------------------
  const moon = new PIXI.Graphics();
  function drawMoon() {
    moon.clear();
    const x = W() * 0.25;
    const y = H() * 0.2;
    for (let r = 130; r > 0; r -= 14) {
      moon.circle(x, y, r).fill({ color: 0x9ccbe8, alpha: 0.05 });
    }
    moon.circle(x, y, 40).fill({ color: 0xe0eef8, alpha: 0.9 });
    moon.circle(x + 8, y - 4, 34).fill({ color: 0x021022, alpha: 0.2 });
  }
  container.addChild(moon);

  // God rays -----------------------------------------------------------
  const rays = new PIXI.Graphics();
  function drawRays(t) {
    rays.clear();
    const w = W(), h = H();
    const count = 6;
    for (let i = 0; i < count; i++) {
      const x = (i / count) * w + Math.sin(t * 0.0004 + i) * 18;
      const topWidth = 30;
      const bottomWidth = 140;
      rays.moveTo(x - topWidth / 2, 0);
      rays.lineTo(x + topWidth / 2, 0);
      rays.lineTo(x + bottomWidth / 2, h * 0.7);
      rays.lineTo(x - bottomWidth / 2, h * 0.7);
      rays.closePath();
      rays.fill({ color: 0xa5d4ec, alpha: 0.04 });
    }
  }
  container.addChild(rays);

  // Distant school ------------------------------------------------------
  const distant = new PIXI.Container();
  container.addChild(distant);
  const distantFish = [];
  function seedDistantSchool() {
    distant.removeChildren();
    distantFish.length = 0;
    for (let i = 0; i < 20; i++) {
      const g = new PIXI.Graphics();
      g.ellipse(0, 0, 4, 1.6).fill({ color: 0x9ccbe8, alpha: 0.5 });
      g.x = Math.random() * W();
      g.y = H() * 0.35 + Math.random() * H() * 0.3;
      g.vx = 0.25 + Math.random() * 0.2;
      g.phase = Math.random() * Math.PI * 2;
      distant.addChild(g);
      distantFish.push(g);
    }
  }

  // Coral ---------------------------------------------------------------
  const coral = new PIXI.Graphics();
  function drawCoral() {
    coral.clear();
    const w = W(), h = H();
    const baseY = h * 0.96;
    coral.rect(0, baseY, w, h - baseY).fill(0x0a2942);
    for (let x = -20; x < w + 20; x += 18) {
      const hBump = 8 + ((x * 37) % 14);
      coral.moveTo(x, baseY).bezierCurveTo(x + 6, baseY - hBump, x + 12, baseY - hBump, x + 18, baseY);
      coral.fill({ color: 0x0f3552, alpha: 0.8 });
    }
    [[w * 0.12, baseY - 10, 0xb86a5a], [w * 0.4, baseY - 8, 0x8a4a6a], [w * 0.72, baseY - 12, 0xb86a5a], [w * 0.9, baseY - 6, 0x6a4a8a]].forEach(([cx, cy, col]) => {
      for (let b = 0; b < 6; b++) {
        coral.circle(cx + (b - 3) * 6, cy - Math.abs(b - 3) * 4, 7 + Math.abs(b - 3) * 2).fill({ color: col, alpha: 0.85 });
      }
    });
  }
  container.addChild(coral);

  // Seaweed -------------------------------------------------------------
  const seaweed = new PIXI.Container();
  container.addChild(seaweed);
  const seaweedList = [];
  function buildSeaweed() {
    seaweed.removeChildren();
    seaweedList.length = 0;
    const count = Math.max(5, Math.round(W() / 220));
    for (let i = 0; i < count; i++) {
      const s = new PIXI.Graphics();
      s.x = (i / count) * W() + Math.random() * 40;
      s.y = H() * 0.96;
      s.phase = Math.random() * Math.PI * 2;
      s.height = 80 + Math.random() * 60;
      seaweed.addChild(s);
      seaweedList.push(s);
    }
  }
  function drawSeaweed(t) {
    seaweedList.forEach((s) => {
      s.clear();
      const segs = 8;
      const pts = [];
      for (let k = 0; k <= segs; k++) {
        const ky = (k / segs) * -s.height;
        const wobble = Math.sin(t * 0.0018 + s.phase + k * 0.4) * (k / segs) * 10;
        pts.push({ x: wobble, y: ky });
      }
      s.moveTo(pts[0].x, pts[0].y);
      for (let k = 1; k < pts.length; k++) s.lineTo(pts[k].x, pts[k].y);
      s.stroke({ color: 0x1f7a5e, width: 5, cap: "round", alpha: 0.85 });
    });
  }

  // Fish (foreground) ---------------------------------------------------
  const fishLayer = new PIXI.Container();
  fishLayer.eventMode = "static";
  container.addChild(fishLayer);
  const fishList = [];
  function buildFish() {
    fishLayer.removeChildren();
    fishList.length = 0;
    const count = Math.max(4, Math.round(W() / 360));
    const palette = [0xf26142, 0xeac57c, 0x48a9c0, 0xd9412a, 0x9ccbe8];
    for (let i = 0; i < count; i++) {
      const f = new PIXI.Container();
      f.eventMode = "static";
      f.cursor = "pointer";
      const color = palette[i % palette.length];
      const body = new PIXI.Graphics();
      body.ellipse(0, 0, 16, 7).fill({ color, alpha: 0.95 });
      body.moveTo(-14, 0).lineTo(-22, -6).lineTo(-22, 6).closePath().fill({ color, alpha: 0.9 });
      body.circle(6, -2, 1.4).fill(0x021022);
      f.addChild(body);
      f.x = Math.random() * W();
      f.y = H() * 0.35 + Math.random() * H() * 0.4;
      f.vx = (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 0.7);
      f.bob = Math.random() * Math.PI * 2;
      f.spin = 0;
      f.hitArea = new PIXI.Rectangle(-24, -12, 48, 24);
      f.on("pointerdown", () => {
        if (Math.random() < 0.5) {
          // Spin on the spot — zero out forward motion so the twirl reads cleanly.
          f.spin = Math.PI * 2 * (Math.random() < 0.5 ? -1 : 1);
          f.vx *= 0.15;
        } else {
          // Panic: burst bubbles at the fish and scuttle away in its facing direction.
          burstBubbles(f.x, f.y, 6 + Math.floor(Math.random() * 5));
          const dir = f.vx >= 0 ? 1 : -1;
          f.vx = dir * (2.2 + Math.random() * 1.4);
        }
      });
      fishLayer.addChild(f);
      fishList.push(f);
    }
  }

  // Bubbles -------------------------------------------------------------
  const bubbles = new PIXI.Container();
  container.addChild(bubbles);
  const bubbleList = [];
  function spawnBubble(x, y, vy) {
    const g = new PIXI.Graphics();
    const r = 2 + Math.random() * 6;
    g.circle(0, 0, r).stroke({ color: 0xffffff, alpha: 0.4, width: 1 });
    g.circle(-r * 0.3, -r * 0.3, r * 0.3).fill({ color: 0xffffff, alpha: 0.4 });
    g.x = x !== undefined ? x : Math.random() * W();
    g.y = y !== undefined ? y : H() + 20;
    g.vy = vy !== undefined ? vy : 0.5 + Math.random() * 0.8;
    g.wob = Math.random() * Math.PI * 2;
    bubbles.addChild(g);
    bubbleList.push(g);
  }
  function burstBubbles(x, y, n) {
    for (let i = 0; i < n; i++) {
      const jx = (Math.random() - 0.5) * 24;
      const jy = (Math.random() - 0.5) * 10;
      spawnBubble(x + jx, y + jy, 0.8 + Math.random() * 1.4);
    }
  }

  function layout() {
    drawWater();
    drawMoon();
    drawCoral();
    buildSeaweed();
    buildFish();
    seedDistantSchool();
  }
  layout();

  const onResize = () => layout();
  app.renderer.on("resize", onResize);

  // Ticker --------------------------------------------------------------
  const t0 = performance.now();
  let bubbleTimer = 0;
  const tick = (ticker) => {
    if (!container.visible) return;
    const now = performance.now();
    const t = now - t0;
    drawRays(t);
    drawSeaweed(t);

    distantFish.forEach((g) => {
      g.x += g.vx;
      g.y += Math.sin(t * 0.002 + g.phase) * 0.1;
      if (g.x > W() + 10) g.x = -10;
    });

    fishList.forEach((f) => {
      f.bob += 0.02;
      f.x += f.vx;
      f.y += Math.sin(f.bob) * 0.3;
      f.vx *= 0.999;
      if (f.spin !== 0) {
        f.rotation += f.spin * 0.08;
        f.spin *= 0.9;
        if (Math.abs(f.spin) < 0.02) { f.spin = 0; f.rotation = 0; }
      } else {
        f.scale.x = f.vx < 0 ? -1 : 1;
      }
      if (f.x > W() + 40) f.x = -40;
      if (f.x < -40) f.x = W() + 40;
    });

    bubbleTimer += ticker.deltaMS;
    if (bubbleTimer > 220) {
      bubbleTimer = 0;
      spawnBubble();
    }
    for (let i = bubbleList.length - 1; i >= 0; i--) {
      const b = bubbleList[i];
      b.y -= b.vy;
      b.wob += 0.03;
      b.x += Math.sin(b.wob) * 0.4;
      if (b.y < -20) {
        b.destroy();
        bubbleList.splice(i, 1);
      }
    }
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
