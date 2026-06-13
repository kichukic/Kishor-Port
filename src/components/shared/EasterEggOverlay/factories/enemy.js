import { ENEMY_DEFS } from '../constants';

export function spawnEnemy(W, H, wave) {
  const maxIdx = Math.min(ENEMY_DEFS.length, 6 + wave * 3);
  const defIdx = Math.floor(Math.random() * maxIdx);
  const def = ENEMY_DEFS[defIdx];

  const edge = Math.random();
  const speed = def.speed * (1 + wave * 0.04) + Math.random() * 0.4;
  let x, y, vx, vy;

  if (edge < 0.5) {
    x = 40 + Math.random() * (W - 80);
    y = -30;
    vx = (Math.random() - 0.5) * speed * 0.5;
    vy = speed;
  } else if (edge < 0.75) {
    x = -30;
    y = 80 + Math.random() * (H * 0.45);
    vx = speed * 0.9;
    vy = (Math.random() - 0.3) * speed * 0.4;
  } else {
    x = W + 30;
    y = 80 + Math.random() * (H * 0.45);
    vx = -speed * 0.9;
    vy = (Math.random() - 0.3) * speed * 0.4;
  }

  if (def.move === 'zigzag') {
    vx = (Math.random() > 0.5 ? 1 : -1) * speed * 0.8;
  } else if (def.move === 'chase' || def.move === 'dash') {
    vx = 0;
  }

  return {
    name: def.name,
    x, y,
    vx, vy,
    baseSpeed: speed,
    hp: def.hp,
    maxHp: def.hp,
    color: def.color,
    shape: def.shape,
    move: def.move,
    power: def.power,
    timer: 0,
    shootTimer: 60 + Math.random() * 160,
    shield: def.power === 'shielded' ? 1 : 0,
    alive: true,
  };
}
