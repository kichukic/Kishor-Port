import { PU, PU_KEYS, CRATE_W, CRATE_H } from '../constants';

export function spawnCrate(W) {
  const type = PU_KEYS[Math.floor(Math.random() * PU_KEYS.length)];
  return {
    x: CRATE_W + Math.random() * (W - CRATE_W * 2),
    y: -CRATE_H,
    vy: 1.4 + Math.random() * 0.6,
    type,
    wobble: Math.random() * Math.PI * 2,
    alive: true,
  };
}
