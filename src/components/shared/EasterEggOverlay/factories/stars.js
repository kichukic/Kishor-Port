export function createStars(W, H) {
  const stars = [];
  // Far layer — tiny, slow, dim
  for (let i = 0; i < 65; i++) {
    const roll = Math.random();
    let hue = 0, sat = 0;
    if (roll > 0.7) { hue = 215; sat = 50; }
    stars.push({
      x: Math.random() * W, y: Math.random() * H,
      r: 0.3 + Math.random() * 0.5,
      speed: 0.15 + Math.random() * 0.35,
      opacity: 0.15 + Math.random() * 0.2,
      hue, sat, glow: 0,
    });
  }
  // Mid layer — medium, moderate speed
  for (let i = 0; i < 45; i++) {
    const roll = Math.random();
    let hue = 0, sat = 0;
    if (roll > 0.65) { hue = 215; sat = 65; }
    else if (roll > 0.45) { hue = 45; sat = 60; }
    stars.push({
      x: Math.random() * W, y: Math.random() * H,
      r: 0.5 + Math.random() * 0.7,
      speed: 0.5 + Math.random() * 1.0,
      opacity: 0.3 + Math.random() * 0.3,
      hue, sat, glow: 3,
    });
  }
  // Near layer — bright, fast, glowing
  for (let i = 0; i < 22; i++) {
    const roll = Math.random();
    let hue = 0, sat = 0;
    if (roll > 0.75) { hue = 215; sat = 75; }
    else if (roll > 0.55) { hue = 45; sat = 70; }
    else if (roll > 0.92) { hue = 0; sat = 65; }
    stars.push({
      x: Math.random() * W, y: Math.random() * H,
      r: 1.0 + Math.random() * 1.0,
      speed: 1.5 + Math.random() * 1.5,
      opacity: 0.5 + Math.random() * 0.4,
      hue, sat, glow: 6,
    });
  }
  return stars;
}

export function createNebulae(W, H) {
  return [
    { x: Math.random() * W, y: Math.random() * H * 0.6, r: 180 + Math.random() * 120, color: 'rgba(80,20,120,0.06)', speed: 0.08 + Math.random() * 0.05 },
    { x: Math.random() * W, y: Math.random() * H * 0.6, r: 150 + Math.random() * 100, color: 'rgba(20,60,100,0.05)', speed: 0.06 + Math.random() * 0.04 },
    { x: Math.random() * W, y: Math.random() * H * 0.6, r: 130 + Math.random() * 90, color: 'rgba(10,80,80,0.04)', speed: 0.05 + Math.random() * 0.03 },
  ];
}

export function createShootingStars(W, H) {
  return [];
}

