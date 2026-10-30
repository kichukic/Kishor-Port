import { TAU, rand, dist, rgba, shuffle } from './util';

const RINGS = 9;

// An orb web centred at (cx, cy). `anchorFor(point)` finds nearby text to tie guy lines to.
export function makeWeb(cx, cy, r, anchorFor) {
  const n = 9 + Math.floor(Math.random() * 3);
  const spokes = Array.from({ length: n }, (_, i) => ({ a: (i / n) * TAU + rand(-0.12, 0.12), len: r * rand(0.85, 1.1) }));
  const web = { cx, cy, r, spokes, hooks: [], anchors: [], build: 0, spiral: 0, alpha: 1, expires: 0, fading: false, seed: rand(0, 100) };

  // Hang points sit on spokes pointing down or sideways so words dangle clear of the hub.
  const hookable = shuffle(spokes.map((_, i) => i).filter((i) => Math.sin(spokes[i].a) > -0.2));
  web.hooks = hookable.slice(0, 4).map((spoke) => ({ spoke, k: rand(0.5, 0.85), pt: { x: 0, y: 0 }, used: false }));

  // Guy lines from the top and sides out to the nearest text.
  [-Math.PI / 2, 0, Math.PI].forEach((target) => {
    let best = 0;
    spokes.forEach((s, i) => {
      if (Math.cos(s.a - target) > Math.cos(spokes[best].a - target)) best = i;
    });
    const end = webPoint(web, best, 1, 0);
    const to = anchorFor(end);
    if (to && dist(to, end) < 180) web.anchors.push({ spoke: best, to });
  });
  return web;
}

// A point k (0 = hub, 1 = rim) along spoke i, with a gentle sway.
export function webPoint(web, i, k, time) {
  const s = web.spokes[(i + web.spokes.length) % web.spokes.length];
  const sx = Math.sin(time * 0.9 + web.seed) * 1.2;
  const sy = Math.cos(time * 1.3 + web.seed) * 0.8;
  return { x: web.cx + sx + Math.cos(s.a) * s.len * k, y: web.cy + sy + Math.sin(s.a) * s.len * k };
}

export function drawWeb(ctx, web, P, time) {
  const n = web.spokes.length;
  const shown = web.build * n;
  const hub = webPoint(web, 0, 0, time);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = rgba(P.muted, 0.55 * web.alpha);
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  for (let i = 0; i < n && i < shown; i++) {
    const e = webPoint(web, i, Math.min(1, shown - i), time);
    ctx.moveTo(hub.x, hub.y);
    ctx.lineTo(e.x, e.y);
  }
  if (web.build >= 1) {
    for (let i = 0; i <= n; i++) {
      const p = webPoint(web, i, 1, time);
      if (i) ctx.lineTo(p.x, p.y);
      else ctx.moveTo(p.x, p.y);
    }
    web.anchors.forEach(({ spoke, to }) => {
      const p = webPoint(web, spoke, 1, time);
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(to.x, to.y);
    });
  }
  ctx.stroke();

  // Capture spiral, wound outward one segment at a time.
  const segs = Math.floor(web.spiral * RINGS * n);
  if (segs > 0) {
    ctx.strokeStyle = rgba(P.muted, 0.4 * web.alpha);
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    for (let s = 0; s <= segs; s++) {
      const p = webPoint(web, s % n, 0.18 + (s / n) * (0.78 / RINGS), time);
      if (s) ctx.lineTo(p.x, p.y);
      else ctx.moveTo(p.x, p.y);
    }
    ctx.stroke();
  }
}
