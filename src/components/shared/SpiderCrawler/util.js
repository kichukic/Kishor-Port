export const TAU = Math.PI * 2;

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
export const approach = (v, t, d) => (v < t ? Math.min(t, v + d) : Math.max(t, v - d));
export const rand = (a, b) => a + Math.random() * (b - a);
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const damp = (rate, dt) => 1 - Math.exp(-rate * dt); // fraction of the gap to close this frame
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Body-local frame: +x is forward, +y is the spider's right side. Sizes are at scale 1.
export const LEG_LEN = 40; // femur and tibia length
export const HEAD_OFFSET = 14; // body centre -> mouth
export const TAIL = 13; // body centre -> spinnerets
export const SPEED = { wander: 34, follow: 50, hunt: 60, eat: 16, tow: 40 };

// A point hanging on a rope from `a`. Position-based, so a moving anchor drags it along naturally.
export function ropeStep(p, a, len, dt, gravity = 900, drag = 1.2) {
  if (dt <= 0) return;
  const ox = p.x;
  const oy = p.y;
  p.vy += gravity * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  const dx = p.x - a.x;
  const dy = p.y - a.y;
  const d = Math.hypot(dx, dy);
  if (d > len && d > 0) {
    p.x = a.x + (dx / d) * len;
    p.y = a.y + (dy / d) * len;
  }
  const k = Math.exp(-drag * dt);
  p.vx = ((p.x - ox) / dt) * k;
  p.vy = ((p.y - oy) / dt) * k;
}

let probe = null;
const colorCache = new Map();

// Any CSS colour -> [r, g, b, a], using the canvas to normalise it.
export function parseColor(input) {
  if (colorCache.has(input)) return colorCache.get(input);
  if (!probe) probe = document.createElement('canvas').getContext('2d');
  probe.fillStyle = '#000000';
  probe.fillStyle = input || '#000000';
  const v = String(probe.fillStyle);
  let out;
  if (v[0] === '#') {
    out = [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16), 1];
  } else {
    const n = (v.match(/[\d.]+/g) || ['0', '0', '0']).map(Number);
    out = v.startsWith('color(') ? [n[0] * 255, n[1] * 255, n[2] * 255, n[3] ?? 1] : [n[0], n[1], n[2], n[3] ?? 1];
  }
  colorCache.set(input, out);
  return out;
}

export const rgba = (c, a = 1) => `rgba(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0}, ${a})`;
export const mixColor = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const luminance = (c) => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;

// Everything the spider draws is derived from the site theme, so a theme change restyles it.
export function makePalette(theme = {}) {
  const bg = parseColor(theme.body || '#0a0a0f');
  const ink = parseColor(theme.text || '#ffffff');
  return {
    ink,
    bg,
    accent: parseColor(theme.neon || theme.accent || theme.text || '#ffffff'),
    muted: parseColor(theme.textMuted || theme.text || '#d4d4d8'),
    glow: theme.glow || rgba(ink, 0.25),
    dark: luminance(bg) < 0.5,
    mono: "'Courier New', Courier, monospace",
  };
}
