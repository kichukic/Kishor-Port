export function createAsteroids(W, H) {
  const asteroids = [];
  for (let i = 0; i < 18; i++) {
    asteroids.push(makeAsteroid(W, H, true));
  }
  return asteroids;
}

export function makeAsteroid(W, H, randomY) {
  const depth = 0.2 + Math.random() * 0.8;
  const baseSize = 12 + depth * 48;
  const verts = 7 + Math.floor(Math.random() * 5);
  const points = [];
  for (let v = 0; v < verts; v++) {
    const angle = (v / verts) * Math.PI * 2;
    const jitter = 0.5 + Math.random() * 0.5;
    points.push({ x: Math.cos(angle) * jitter, y: Math.sin(angle) * jitter });
  }
  const hue = 18 + Math.random() * 35;
  const sat = 8 + Math.random() * 18;
  const light = 25 + Math.random() * 20;
  const craterCount = 2 + Math.floor(Math.random() * 4);
  const craters = [];
  for (let c = 0; c < craterCount; c++) {
    const ca = Math.random() * Math.PI * 2;
    const cr = Math.random() * 0.6;
    craters.push({
      cx: Math.cos(ca) * cr,
      cy: Math.sin(ca) * cr,
      cr: 0.08 + Math.random() * 0.18,
    });
  }
  return {
    x: -40 + Math.random() * (W + 80),
    y: randomY ? Math.random() * (H + 200) - 200 : -60 - Math.random() * 120,
    depth,
    scale: depth,
    targetScale: depth,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.012 * (1 + (1 - depth)),
    vy: (0.3 + depth * 1.8) * (0.7 + Math.random() * 0.6),
    vx: (Math.random() - 0.5) * 0.3,
    wobblePhase: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.005 + Math.random() * 0.01,
    wobbleAmp: 0.2 + Math.random() * 0.4,
    points,
    hue, sat, light,
    craters,
    baseSize,
    opacity: 0.2 + depth * 0.5,
  };
}
