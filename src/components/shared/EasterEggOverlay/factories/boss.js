import { BOSS_DEFS, ENEMY_BULLET_SPEED } from '../constants';

export function spawnBoss(W, level) {
  const defIdx = (level - 1) % BOSS_DEFS.length;
  const def = BOSS_DEFS[defIdx];
  const tier = Math.floor((level - 1) / BOSS_DEFS.length); // extra laps
  return {
    x: W / 2,
    y: -def.H,
    vx: def.speed * (1 + tier * 0.2),
    vy: def.speed * 0.5,
    hp: def.hp + tier * 100,
    maxHp: def.hp + tier * 100,
    score: def.score + tier * 500,
    name: def.name,
    color: def.color,
    W: def.W, H: def.H,
    shape: def.shape,
    move: def.move,
    attack: def.attack,
    timer: 0,
    shootTimer: 80,
    phase: 1,        // 1 or 2 (triggers at 50% HP)
    entering: true,  // still flying into the screen
    alive: true,
    tier,
    flash: 0,
  };
}
