import React, { useEffect, useRef, useCallback } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { keyframes } from '@emotion/react';
import { useSound } from '../../hooks/useSound';

/* ─── STYLED SHELL ─── */
const scanLines = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 0 4px; }
`;

const GameOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #000008;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Courier New', Courier, monospace;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(255, 255, 255, 0.012) 2px,
      rgba(255, 255, 255, 0.012) 4px
    );
    animation: ${scanLines} 0.1s linear infinite;
    pointer-events: none;
    z-index: 10;
  }
`;

const GameCanvas = styled.canvas`
  display: block;
  image-rendering: pixelated;
  cursor: none;
`;

const GameUI = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 2px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(0, 0, 8, 0.8);
  z-index: 20;
  pointer-events: none;
`;

const HudGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
`;

const HudItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const HudLabel = styled.span`
  font-size: 0.55rem;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const HudValue = styled.span`
  font-size: 0.85rem;
  font-weight: bold;
  color: ${({ color }) => color || '#ffffff'};
`;

const PowerUpBar = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: center;
`;

const PowerChip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  border: 1px solid ${({ color }) => color || '#ffffff'};
  background: ${({ color }) => color ? color + '18' : 'rgba(255,255,255,0.06)'};
  font-size: 0.6rem;
  letter-spacing: 1px;
  color: ${({ color }) => color || '#ffffff'};
`;

const PowerTimerTrack = styled.div`
  width: 40px;
  height: 3px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 2px;
  overflow: hidden;
`;

const PowerTimerFill = styled.div`
  height: 100%;
  border-radius: 2px;
  background: ${({ color }) => color || '#ffffff'};
  width: ${({ pct }) => pct}%;
  transition: width 0.15s linear;
`;

const EscHint = styled.div`
  position: absolute;
  bottom: 0.75rem;
  right: 1.5rem;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.25);
  letter-spacing: 2px;
  z-index: 20;
  pointer-events: none;
`;

const GameTitle = styled.div`
  position: absolute;
  bottom: 0.75rem;
  left: 1.5rem;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.15);
  letter-spacing: 3px;
  text-transform: uppercase;
  z-index: 20;
  pointer-events: none;
`;

const OverlayMessage = styled(motion.div)`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 8, 0.88);
  z-index: 30;
  gap: 1.5rem;
`;

const MsgTitle = styled.div`
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: 6px;
  text-transform: uppercase;
  color: ${({ color }) => color || '#ffffff'};
  text-shadow: 0 0 30px ${({ color }) => color || 'rgba(255,255,255,0.3)'};
`;

const MsgSub = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 3px;
  text-align: center;
`;

const MsgBtn = styled.button`
  margin-top: 0.5rem;
  padding: 0.65rem 2rem;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  font-weight: bold;
  letter-spacing: 3px;
  text-transform: uppercase;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #ffffff;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.8);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.15);
  }
`;

/* ─── PERSISTENT BADGE ─── */
const badgePulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.4); }
  50% { box-shadow: 0 0 30px 10px rgba(0, 255, 136, 0.2); }
  100% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0); }
`;

const AchievementUnlockedBadge = styled(motion.div)`
  position: fixed;
  top: 85px;
  right: 20px;
  z-index: 10000;
  padding: 0.6rem 1rem;
  border-radius: 10px;
  background: rgba(0, 255, 136, 0.08);
  border: 1px solid rgba(0, 255, 136, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.75rem;
  font-weight: 600;
  color: #00ff88;
  letter-spacing: 0.5px;
  backdrop-filter: blur(12px);
  animation: ${badgePulse} 2s ease-in-out infinite;
`;

const BadgeDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00ff88;
  display: inline-block;
  animation: statusPulse 1.8s infinite ease-in-out;

  @keyframes statusPulse {
    0% { opacity: 0.4; box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.4); }
    50% { opacity: 1; box-shadow: 0 0 0 4px rgba(0, 255, 136, 0.1); }
    100% { opacity: 0.4; box-shadow: 0 0 0 0 rgba(0, 255, 136, 0); }
  }
`;

/* ════════════════════════════════════════════
   GAME CONSTANTS
   ════════════════════════════════════════════ */
const SHIP_W = 32, SHIP_H = 28;
const ENEMY_W = 28, ENEMY_H = 22;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 9;
const MISSILE_SPEED = 6;
const ENEMY_BULLET_SPEED = 3.5;
const MAX_LIVES = 3;
const BASE_SHOOT_COOLDOWN = 220;
const CRATE_W = 26, CRATE_H = 26;
const POWERUP_DURATION = 600;
const WAVES_PER_LEVEL = 3;   // boss every 3 waves

// Boss configs indexed by level (cycles)
const BOSS_DEFS = [
  { name: 'SENTINEL',  hp: 20, score: 200, color: '#ff4444', W: 72, H: 52, speed: 1.4 },
  { name: 'DESTROYER', hp: 35, score: 400, color: '#ff8800', W: 84, H: 64, speed: 1.8 },
  { name: 'OVERLORD',  hp: 55, score: 600, color: '#cc44ff', W: 96, H: 76, speed: 2.2 },
];

// Power-up types
const PU = {
  HOMING:    { label: 'HOMING',    color: '#00eeff', icon: '⬡' },
  RAPIDFIRE: { label: 'RAPID',     color: '#ffcc00', icon: '◈' },
  SHIELD:    { label: 'SHIELD',    color: '#ff44ff', icon: '◉' },
};
const PU_KEYS = Object.keys(PU);


/* ════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════ */
function createStars(W, H, count = 120) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: 0.4 + Math.random() * 1.2,
    speed: 0.3 + Math.random() * 1.2,
    opacity: 0.2 + Math.random() * 0.6,
  }));
}

function spawnEnemy(W, H, wave) {
  const edge = Math.random();
  const speed = 1.2 + wave * 0.18 + Math.random() * 0.7;
  let x, y, vx, vy, type;
  type = Math.floor(Math.random() * 3);

  if (edge < 0.5) {
    x = 40 + Math.random() * (W - 80);
    y = -ENEMY_H - 10;
    vx = (Math.random() - 0.5) * speed * 1.2;
    vy = speed;
  } else if (edge < 0.75) {
    x = -ENEMY_W - 10;
    y = 80 + Math.random() * (H * 0.6);
    vx = speed * 1.1;
    vy = (Math.random() - 0.3) * speed * 0.7;
  } else {
    x = W + ENEMY_W + 10;
    y = 80 + Math.random() * (H * 0.6);
    vx = -speed * 1.1;
    vy = (Math.random() - 0.3) * speed * 0.7;
  }

  return { x, y, vx, vy, type, hp: type === 2 ? 2 : 1, timer: 0, shootTimer: 80 + Math.random() * 200, alive: true };
}

function spawnCrate(W) {
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

function createExplosion(x, y, count = 14) {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.8 + Math.random() * 3.5;
    return {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.03 + Math.random() * 0.04,
      r: 1.5 + Math.random() * 3,
    };
  });
}

/* ─── DRAW: Ship ─── */
function drawShip(ctx, x, y, flash, shielded) {
  ctx.save();
  ctx.translate(x, y);

  if (shielded) {
    const t = Date.now() / 200;
    ctx.strokeStyle = `rgba(255,68,255,${0.5 + 0.3 * Math.sin(t)})`;
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ff44ff';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(0, 0, SHIP_W / 2 + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  ctx.fillStyle = flash ? 'rgba(255,80,80,0.9)' : '#ffffff';
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 10;

  ctx.beginPath();
  ctx.moveTo(0, -SHIP_H / 2);
  ctx.lineTo(-SHIP_W / 2 + 4, SHIP_H / 2);
  ctx.lineTo(-SHIP_W / 4, SHIP_H / 4);
  ctx.lineTo(0, SHIP_H / 2 - 6);
  ctx.lineTo(SHIP_W / 4, SHIP_H / 4);
  ctx.lineTo(SHIP_W / 2 - 4, SHIP_H / 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = flash ? '#ff4444' : `rgba(180,220,255,${0.5 + 0.3 * Math.sin(Date.now() / 80)})`;
  ctx.beginPath();
  ctx.ellipse(0, SHIP_H / 2 - 3, 5, 4 + 2 * Math.abs(Math.sin(Date.now() / 80)), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/* ─── DRAW: Enemy ─── */
function drawEnemy(ctx, e) {
  ctx.save();
  ctx.translate(e.x, e.y);
  const t = Date.now() / 300;
  const pulse = 0.85 + 0.15 * Math.sin(t + e.x);

  if (e.type === 0) {
    ctx.fillStyle = `rgba(255,255,255,${pulse * 0.9})`;
    ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(0, 0, ENEMY_W / 2, ENEMY_H / 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,8,0.8)';
    ctx.beginPath(); ctx.ellipse(0, -3, ENEMY_W / 4, ENEMY_H / 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${pulse * 0.4})`;
    ctx.beginPath(); ctx.ellipse(0, -3, ENEMY_W / 8, ENEMY_H / 8, 0, 0, Math.PI * 2); ctx.fill();
  } else if (e.type === 1) {
    ctx.fillStyle = `rgba(200,200,255,${pulse})`;
    ctx.shadowColor = '#aaaaff'; ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, ENEMY_H / 2); ctx.lineTo(-ENEMY_W / 2, -ENEMY_H / 4);
    ctx.lineTo(-ENEMY_W / 4, 0); ctx.lineTo(0, -ENEMY_H / 2);
    ctx.lineTo(ENEMY_W / 4, 0); ctx.lineTo(ENEMY_W / 2, -ENEMY_H / 4);
    ctx.closePath(); ctx.fill();
  } else {
    ctx.fillStyle = `rgba(255,200,100,${pulse})`;
    ctx.shadowColor = '#ffcc44'; ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(0, ENEMY_H / 2); ctx.lineTo(-ENEMY_W / 2, -ENEMY_H / 2);
    ctx.lineTo(0, -ENEMY_H / 4); ctx.lineTo(ENEMY_W / 2, -ENEMY_H / 2);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff';
    for (let i = 0; i < e.hp; i++) { ctx.beginPath(); ctx.arc(-3 + i * 6, -8, 2, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
}

/* ─── DRAW: Power-up Crate ─── */
function drawCrate(ctx, c) {
  const info = PU[c.type];
  const t = Date.now() / 400;
  const glow = 0.5 + 0.4 * Math.sin(t + c.wobble);

  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.shadowColor = info.color;
  ctx.shadowBlur = 12 + 8 * glow;

  // Box
  ctx.strokeStyle = info.color;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.85;
  ctx.strokeRect(-CRATE_W / 2, -CRATE_H / 2, CRATE_W, CRATE_H);

  // Cross straps
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(-CRATE_W / 2, 0); ctx.lineTo(CRATE_W / 2, 0);
  ctx.moveTo(0, -CRATE_H / 2); ctx.lineTo(0, CRATE_H / 2);
  ctx.stroke();

  // Inner glow fill
  ctx.globalAlpha = 0.1 + 0.08 * glow;
  ctx.fillStyle = info.color;
  ctx.fillRect(-CRATE_W / 2, -CRATE_H / 2, CRATE_W, CRATE_H);

  // Icon text
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = info.color;
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(info.label.slice(0, 3), 0, 0);

  // Falling trail dots
  ctx.globalAlpha = 0.3;
  for (let i = 1; i <= 3; i++) {
    ctx.fillStyle = info.color;
    ctx.beginPath();
    ctx.arc(0, CRATE_H / 2 + i * 5, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.restore();
}

/* ─── DRAW: Homing Missile ─── */
function drawMissile(ctx, b) {
  ctx.save();
  ctx.translate(b.x, b.y);

  const angle = Math.atan2(b.vy, b.vx);
  ctx.rotate(angle + Math.PI / 2);

  ctx.fillStyle = '#00eeff';
  ctx.shadowColor = '#00eeff';
  ctx.shadowBlur = 10;

  // Missile body
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(-4, 4);
  ctx.lineTo(0, 2);
  ctx.lineTo(4, 4);
  ctx.closePath();
  ctx.fill();

  // Flame trail
  const ft = Date.now() / 60;
  ctx.fillStyle = `rgba(255,${150 + Math.sin(ft) * 80},0,0.8)`;
  ctx.beginPath();
  ctx.ellipse(0, 5 + Math.abs(Math.sin(ft)) * 3, 2.5, 4 + Math.abs(Math.sin(ft)) * 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/* ─── DRAW: Regular Bullet ─── */
function drawBullet(ctx, b) {
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 8;
  ctx.fillRect(b.x - 1.5, b.y, 3, 14);
  ctx.shadowBlur = 0;
}

/* ─── BOSS HELPERS ─── */
function spawnBoss(W, level) {
  const defIdx = (level - 1) % BOSS_DEFS.length;
  const def = BOSS_DEFS[defIdx];
  const tier = Math.floor((level - 1) / BOSS_DEFS.length); // extra laps
  return {
    x: W / 2,
    y: -def.H,
    vx: def.speed * (1 + tier * 0.2),
    vy: def.speed * 0.5,
    hp: def.hp + tier * 10,
    maxHp: def.hp + tier * 10,
    score: def.score + tier * 100,
    name: def.name,
    color: def.color,
    W: def.W, H: def.H,
    timer: 0,
    shootTimer: 80,
    phase: 1,        // 1 or 2 (triggers at 50% HP)
    entering: true,  // still flying into the screen
    alive: true,
    tier,
  };
}

function drawBoss(ctx, boss) {
  const { x, y, W: BW, H: BH, color, hp, maxHp, phase, timer } = boss;
  const t = Date.now() / 200;
  const pulse = 0.8 + 0.2 * Math.sin(t);
  const rage = phase === 2;

  ctx.save();
  ctx.translate(x, y);

  // Outer hull glow
  ctx.shadowColor = rage ? '#ff0000' : color;
  ctx.shadowBlur = 20 + 10 * pulse;

  if (boss.name === 'SENTINEL') {
    // Wide flat saucer
    ctx.fillStyle = rage ? `rgba(255,80,80,${pulse})` : `rgba(255,100,100,${pulse * 0.9})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, BW / 2, BH / 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rage ? '#ff4444' : color;
    ctx.beginPath();
    ctx.ellipse(0, -BH / 6, BW / 4, BH / 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Cannon ports
    ctx.fillStyle = '#ffffff';
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.arc(i * (BW / 5.5), BH / 5, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (boss.name === 'DESTROYER') {
    // Angular destroyer hull
    ctx.fillStyle = rage ? `rgba(255,140,0,${pulse})` : `rgba(255,160,80,${pulse * 0.9})`;
    ctx.beginPath();
    ctx.moveTo(0, -BH / 2);
    ctx.lineTo(-BW / 2, -BH / 6);
    ctx.lineTo(-BW / 3, BH / 4);
    ctx.lineTo(0, BH / 2);
    ctx.lineTo(BW / 3, BH / 4);
    ctx.lineTo(BW / 2, -BH / 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#000008';
    ctx.beginPath();
    ctx.ellipse(0, 0, BW / 6, BH / 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rage ? '#ff8800' : color;
    ctx.beginPath();
    ctx.ellipse(0, 0, BW / 12, BH / 12, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // OVERLORD — multi-wing form
    ctx.fillStyle = rage ? `rgba(200,0,255,${pulse})` : `rgba(180,80,255,${pulse * 0.85})`;
    // Central core
    ctx.beginPath();
    ctx.ellipse(0, 0, BW / 4, BH / 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Left wing
    ctx.beginPath();
    ctx.moveTo(-BW / 4, 0);
    ctx.lineTo(-BW / 2, -BH / 3);
    ctx.lineTo(-BW / 2, BH / 4);
    ctx.closePath();
    ctx.fill();
    // Right wing
    ctx.beginPath();
    ctx.moveTo(BW / 4, 0);
    ctx.lineTo(BW / 2, -BH / 3);
    ctx.lineTo(BW / 2, BH / 4);
    ctx.closePath();
    ctx.fill();
    // Core eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, BW / 14, BH / 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Phase 2 rage ring
  if (rage) {
    ctx.strokeStyle = `rgba(255,0,0,${0.4 + 0.3 * Math.sin(t * 3)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, BW / 2 + 10 + 4 * Math.sin(t * 4), 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawBossHpBar(ctx, boss, W) {
  const pct = boss.hp / boss.maxHp;
  const barW = Math.min(W * 0.5, 400);
  const barH = 6;
  const bx = (W - barW) / 2;
  const by = 52; // below HUD

  // Track
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(bx, by, barW, barH);

  // Fill color by HP%
  const hpColor = pct > 0.6 ? '#ff4444' : pct > 0.3 ? '#ff8800' : '#ffcc00';
  ctx.fillStyle = hpColor;
  ctx.shadowColor = hpColor;
  ctx.shadowBlur = 8;
  ctx.fillRect(bx, by, barW * pct, barH);
  ctx.shadowBlur = 0;

  // Label
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = "bold 9px 'Courier New', monospace";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(`⚠ ${boss.name}${boss.phase === 2 ? ' — PHASE 2' : ''}`, W / 2, by - 3);
}


/* ─── LocalStorage helpers ─── */
const LS_BEST  = 'retrospace_best';
const LS_SAVE  = 'retrospace_save';

function lsGetBest()  { return parseInt(localStorage.getItem(LS_BEST)  || '0', 10); }
function lsSetBest(n) { if (n > lsGetBest()) localStorage.setItem(LS_BEST, String(n)); }
function lsGetSave()  { try { return JSON.parse(localStorage.getItem(LS_SAVE)); } catch { return null; } }
function lsSetSave(obj) { localStorage.setItem(LS_SAVE, JSON.stringify(obj)); }
function lsClearSave()  { localStorage.removeItem(LS_SAVE); }

/* ════════════════════════════════════════════
   GAME COMPONENT
   ════════════════════════════════════════════ */
function RetroSpaceGame({ onClose }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const rafRef = useRef(null);
  const scoreRef = useRef(0);
  const livesRef = useRef(MAX_LIVES);
  const waveRef = useRef(1);
  const levelRef = useRef(1);
  const gameStatusRef = useRef('playing');
  const hudRef = useRef(null);
  const msgRef = useRef(null);
  const autoSaveTimerRef = useRef(0);
  const bestRef = useRef(lsGetBest());
  const bannerRef = useRef(null); // { text, color, timer }

  const initGame = useCallback((resumeData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width, H = canvas.height;

    scoreRef.current   = resumeData ? resumeData.score : 0;
    livesRef.current   = resumeData ? resumeData.lives : MAX_LIVES;
    waveRef.current    = resumeData ? resumeData.wave  : 1;
    levelRef.current   = resumeData ? resumeData.level : 1;
    gameStatusRef.current = 'playing';
    autoSaveTimerRef.current = 0;
    bestRef.current = lsGetBest();

    const waveKillTarget = resumeData ? (8 + waveRef.current * 2) : 8;

    stateRef.current = {
      W, H,
      player: { x: W / 2, y: H - 60, vx: 0, vy: 0, flash: 0, invincible: 0 },
      bullets: [],
      enemyBullets: [],
      enemies: [],
      boss: null,
      bossActive: false,
      crates: [],
      explosions: [],
      stars: createStars(W, H),
      keys: {},
      lastShot: 0,
      spawnTimer: 0,
      spawnInterval: Math.max(35, 90 - waveRef.current * 6),
      crateTimer: 0,
      crateInterval: 420,
      enemiesKilled: 0,
      waveKillTarget,
      powerUps: { HOMING: 0, RAPIDFIRE: 0, SHIELD: 0 },
    };

    if (hudRef.current) hudRef.current.update(
      scoreRef.current, livesRef.current, waveRef.current, levelRef.current,
      { HOMING: 0, RAPIDFIRE: 0, SHIELD: 0 }, bestRef.current
    );
    if (msgRef.current) msgRef.current.hide();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initGame();
    };
    resize();
    window.addEventListener('resize', resize);

    const onKeyDown = (e) => {
      const s = stateRef.current;
      if (!s) return;
      s.keys[e.code] = true;
      if (e.code === 'Escape') { onClose(); return; }
      e.preventDefault();
    };
    const onKeyUp = (e) => {
      if (stateRef.current) stateRef.current.keys[e.code] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    /* ══════════ GAME LOOP ══════════ */
    const loop = () => {
      const s = stateRef.current;
      if (!s) { rafRef.current = requestAnimationFrame(loop); return; }

      const { W, H, player, bullets, enemyBullets, enemies, crates, explosions, stars, keys } = s;
      const ctx = canvas.getContext('2d');
      const now = Date.now();

      if (gameStatusRef.current !== 'playing') {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      /* ── Player movement (all 4 directions) ── */
      if (keys['ArrowLeft']  || keys['KeyA']) player.vx = -PLAYER_SPEED;
      else if (keys['ArrowRight'] || keys['KeyD']) player.vx = PLAYER_SPEED;
      else player.vx *= 0.75;

      if (keys['ArrowUp']   || keys['KeyW']) player.vy = -PLAYER_SPEED;
      else if (keys['ArrowDown']  || keys['KeyS']) player.vy = PLAYER_SPEED;
      else player.vy *= 0.75;

      player.x = Math.max(SHIP_W / 2, Math.min(W - SHIP_W / 2, player.x + player.vx));
      player.y = Math.max(SHIP_H / 2 + 48, Math.min(H - SHIP_H / 2, player.y + player.vy)); // 48 = HUD height
      if (player.invincible > 0) player.invincible--;
      if (player.flash > 0) player.flash--;

      /* ── Power-up tick ── */
      for (const k of PU_KEYS) {
        if (s.powerUps[k] > 0) s.powerUps[k]--;
      }

      /* ── Shoot ── */
      const cooldown = s.powerUps.RAPIDFIRE > 0 ? BASE_SHOOT_COOLDOWN / 3 : BASE_SHOOT_COOLDOWN;
      if ((keys['Space'] || keys['KeyZ']) && now - s.lastShot > cooldown) {
        s.lastShot = now;
        if (s.powerUps.HOMING > 0) {
          // Fire 2 homing missiles
          bullets.push({ x: player.x - 6, y: player.y - SHIP_H / 2, vx: 0, vy: -MISSILE_SPEED, homing: true });
          bullets.push({ x: player.x + 6, y: player.y - SHIP_H / 2, vx: 0, vy: -MISSILE_SPEED, homing: true });
        } else {
          bullets.push({ x: player.x, y: player.y - SHIP_H / 2 - 2, vx: 0, vy: -BULLET_SPEED, homing: false });
          if (s.powerUps.RAPIDFIRE > 0) {
            // Side shots when rapid fire
            bullets.push({ x: player.x - 12, y: player.y - SHIP_H / 4, vx: -0.8, vy: -BULLET_SPEED * 0.9, homing: false });
            bullets.push({ x: player.x + 12, y: player.y - SHIP_H / 4, vx: 0.8, vy: -BULLET_SPEED * 0.9, homing: false });
          }
        }
      }

      /* ── Stars ── */
      stars.forEach(star => {
        star.y += star.speed;
        if (star.y > H) { star.y = -2; star.x = Math.random() * W; }
      });

      /* ── Bullet update ── */
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];

        if (b.homing) {
          // Find nearest live enemy
          let nearest = null, nearestDist = Infinity;
          for (const e of enemies) {
            const dx = e.x - b.x, dy = e.y - b.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < nearestDist) { nearestDist = d; nearest = e; }
          }
          if (nearest) {
            const dx = nearest.x - b.x, dy = nearest.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            b.vx += (dx / dist) * 0.5;
            b.vy += (dy / dist) * 0.5;
            // Clamp speed
            const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
            if (spd > MISSILE_SPEED) { b.vx = (b.vx / spd) * MISSILE_SPEED; b.vy = (b.vy / spd) * MISSILE_SPEED; }
          }
        }

        b.x += b.vx;
        b.y += b.vy;
        if (b.y < -20 || b.y > H + 20 || b.x < -20 || b.x > W + 20) bullets.splice(i, 1);
      }

      /* ── Spawn enemies (only when no boss active) ── */
      if (!s.bossActive) {
        s.spawnTimer++;
        if (s.spawnTimer >= s.spawnInterval) {
          s.spawnTimer = 0;
          enemies.push(spawnEnemy(W, H, waveRef.current));
          s.spawnInterval = Math.max(35, 90 - waveRef.current * 6);
        }
      }

      /* ── Spawn crates ── */
      s.crateTimer++;
      if (s.crateTimer >= s.crateInterval) {
        s.crateTimer = 0;
        crates.push(spawnCrate(W));
        s.crateInterval = 380 + Math.random() * 120;
      }

      /* ── Crate update ── */
      for (let i = crates.length - 1; i >= 0; i--) {
        const c = crates[i];
        c.y += c.vy;
        c.wobble += 0.03;

        if (c.y > H + CRATE_H) { crates.splice(i, 1); continue; }

        // Player picks up crate
        if (
          Math.abs(c.x - player.x) < (CRATE_W / 2 + SHIP_W / 2) &&
          Math.abs(c.y - player.y) < (CRATE_H / 2 + SHIP_H / 2)
        ) {
          s.powerUps[c.type] = POWERUP_DURATION;
          if (c.type === 'SHIELD') {
            player.invincible = POWERUP_DURATION;
          }
          explosions.push(...createExplosion(c.x, c.y, 8));
          crates.splice(i, 1);
          if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current);
          continue;
        }
      }

      /* ── Enemy update ── */
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (!e.alive) {
          explosions.push(...createExplosion(e.x, e.y));
          enemies.splice(i, 1);
          continue;
        }

        e.timer++;
        if (e.type === 1) {
          e.vx += Math.sin(e.timer * 0.08) * 0.18;
          e.vx = Math.max(-4, Math.min(4, e.vx));
        } else if (e.type === 2) {
          const dx = player.x - e.x;
          e.vx += dx * 0.0015;
          e.vx = Math.max(-3.5, Math.min(3.5, e.vx));
        }

        e.x += e.vx;
        e.y += e.vy;

        if (e.y > H + 60 || e.x < -120 || e.x > W + 120) { enemies.splice(i, 1); continue; }

        // Enemy shoots
        e.shootTimer--;
        if (e.shootTimer <= 0) {
          e.shootTimer = 100 + Math.random() * 180;
          const dx = player.x - e.x, dy = player.y - e.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          enemyBullets.push({
            x: e.x, y: e.y + ENEMY_H / 2,
            vx: (dx / dist) * ENEMY_BULLET_SPEED,
            vy: (dy / dist) * ENEMY_BULLET_SPEED,
          });
        }

        /* ── Bullet-enemy collision ── */
        for (let b = bullets.length - 1; b >= 0; b--) {
          const bx = bullets[b].x, by = bullets[b].y;
          if (
            bx > e.x - ENEMY_W / 2 && bx < e.x + ENEMY_W / 2 &&
            by > e.y - ENEMY_H / 2 && by < e.y + ENEMY_H / 2
          ) {
            bullets.splice(b, 1);
            e.hp--;
            if (e.hp <= 0) {
              e.alive = false;
              scoreRef.current += e.type === 2 ? 30 : e.type === 1 ? 20 : 10;
              s.enemiesKilled++;
              if (s.enemiesKilled >= s.waveKillTarget) {
                waveRef.current++;
                s.enemiesKilled = 0;
                s.waveKillTarget = 8 + waveRef.current * 2;

                // Boss wave?
                if (waveRef.current % WAVES_PER_LEVEL === 0) {
                  s.bossActive = true;
                  const bossLevel = Math.ceil(waveRef.current / WAVES_PER_LEVEL);
                  levelRef.current = bossLevel;
                  s.boss = spawnBoss(W, bossLevel);
                  s.enemies = [];
                  s.enemyBullets = [];
                  bannerRef.current = { text: `⚠ BOSS INCOMING — ${s.boss.name}`, color: s.boss.color, timer: 150 };
                  if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current);
                  break;
                }
              }
            }
            if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current);
            break;
          }
        }
      }

      /* ── Enemy bullets ── */
      for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const eb = enemyBullets[i];
        eb.x += eb.vx; eb.y += eb.vy;
        if (eb.y > H + 20 || eb.x < -20 || eb.x > W + 20 || eb.y < -20) { enemyBullets.splice(i, 1); continue; }

        const shielded = s.powerUps.SHIELD > 0;
        if (
          player.invincible <= 0 && !shielded &&
          Math.abs(eb.x - player.x) < SHIP_W / 2 - 4 &&
          Math.abs(eb.y - player.y) < SHIP_H / 2 - 4
        ) {
          enemyBullets.splice(i, 1);
          player.invincible = 90; player.flash = 18;
          livesRef.current--;
          explosions.push(...createExplosion(player.x, player.y, 8));
          if (livesRef.current <= 0) {
            gameStatusRef.current = 'gameover';
            lsSetBest(scoreRef.current);
            lsClearSave();
            bestRef.current = lsGetBest();
            if (msgRef.current) msgRef.current.show('gameover');
          }
          if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current);
        }
      }
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const shielded = s.powerUps.SHIELD > 0;
        if (
          player.invincible <= 0 && !shielded &&
          Math.abs(e.x - player.x) < (SHIP_W + ENEMY_W) / 2 - 6 &&
          Math.abs(e.y - player.y) < (SHIP_H + ENEMY_H) / 2 - 6
        ) {
          e.alive = false;
          player.invincible = 90; player.flash = 18;
          livesRef.current--;
          explosions.push(...createExplosion(player.x, player.y, 8));
          if (livesRef.current <= 0) {
            gameStatusRef.current = 'gameover';
            lsSetBest(scoreRef.current);
            lsClearSave();
            bestRef.current = lsGetBest();
            if (msgRef.current) msgRef.current.show('gameover');
          }
          if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current);
        }
      }

      /* ── BOSS UPDATE ── */
      if (s.bossActive && s.boss) {
        const boss = s.boss;

        if (!boss.alive) {
          // Boss defeated — big explosion
          explosions.push(...createExplosion(boss.x, boss.y, 40));
          for (let i = 0; i < 3; i++)
            explosions.push(...createExplosion(
              boss.x + (Math.random() - 0.5) * boss.W,
              boss.y + (Math.random() - 0.5) * boss.H, 12
            ));
          scoreRef.current += boss.score;
          lsSetBest(scoreRef.current);
          bestRef.current = lsGetBest();
          s.boss = null;
          s.bossActive = false;
          waveRef.current++;
          levelRef.current = Math.ceil(waveRef.current / WAVES_PER_LEVEL);
          s.spawnInterval = Math.max(35, 90 - waveRef.current * 6);
          s.waveKillTarget = 8 + waveRef.current * 2;
          s.enemiesKilled = 0;
          bannerRef.current = { text: `✦ LEVEL ${levelRef.current} — ENGAGE`, color: '#00ff88', timer: 150 };
          if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current);
        } else {
          boss.timer++;

          // Entry animation
          if (boss.entering) {
            boss.y += 2.5; // fast entry
            if (boss.y >= 130) { boss.entering = false; }
          } else {
            // SENTINEL: left-right sweep
            if (boss.name === 'SENTINEL') {
              boss.x += boss.vx;
              if (boss.x > W - boss.W / 2 - 20 || boss.x < boss.W / 2 + 20) boss.vx *= -1;
              boss.y = 130 + 20 * Math.sin(boss.timer * 0.015);
            }
            // DESTROYER: sine wave float
            else if (boss.name === 'DESTROYER') {
              const spd = boss.phase === 2 ? 1.5 : 1;
              boss.x = W / 2 + (W * 0.38) * Math.sin(boss.timer * 0.018 * spd);
              boss.y = 140 + 40 * Math.sin(boss.timer * 0.025);
            }
            // OVERLORD: figure-8
            else {
              const spd = boss.phase === 2 ? 1.4 : 1;
              boss.x = W / 2 + (W * 0.35) * Math.sin(boss.timer * 0.02 * spd);
              boss.y = 140 + 55 * Math.sin(boss.timer * 0.04 * spd);
            }

            // Trigger Phase 2 at 50% HP
            if (boss.hp <= boss.maxHp / 2 && boss.phase === 1) {
              boss.phase = 2;
              bannerRef.current = { text: `! ${boss.name} — PHASE 2 !`, color: '#ff2222', timer: 120 };
            }
          }

          // Boss shoots (not while entering)
          if (!boss.entering) {
            const shootRate = boss.phase === 2 ? 35 : 65;
            boss.shootTimer--;
            if (boss.shootTimer <= 0) {
              boss.shootTimer = shootRate;
              const bspd = ENEMY_BULLET_SPEED + boss.tier * 0.5;

              if (boss.name === 'SENTINEL') {
                const shots = boss.phase === 2 ? 5 : 3;
                for (let i = 0; i < shots; i++) {
                  const ang = (Math.PI / 2) + (i - (shots - 1) / 2) * 0.28;
                  enemyBullets.push({ x: boss.x, y: boss.y + boss.H / 2, vx: Math.cos(ang) * bspd, vy: Math.sin(ang) * bspd });
                }
              } else if (boss.name === 'DESTROYER') {
                const dx = player.x - boss.x, dy = player.y - boss.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const shots = boss.phase === 2 ? 5 : 3;
                for (let i = 0; i < shots; i++) {
                  const spread = (Math.random() - 0.5) * 0.4;
                  enemyBullets.push({ x: boss.x, y: boss.y + boss.H / 2, vx: (dx / dist) * bspd + spread, vy: (dy / dist) * bspd + spread });
                }
              } else {
                // OVERLORD: spiral
                const spiralCount = boss.phase === 2 ? 8 : 6;
                for (let i = 0; i < spiralCount; i++) {
                  const ang = (boss.timer * 0.06) + (i / spiralCount) * Math.PI * 2;
                  enemyBullets.push({ x: boss.x, y: boss.y, vx: Math.cos(ang) * bspd, vy: Math.sin(ang) * bspd });
                }
                if (boss.phase === 2) {
                  const dx = player.x - boss.x, dy = player.y - boss.y;
                  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                  enemyBullets.push({ x: boss.x, y: boss.y, vx: (dx / dist) * bspd * 1.4, vy: (dy / dist) * bspd * 1.4 });
                }
              }
            }
          }

          // Player bullets hit boss
          for (let b = bullets.length - 1; b >= 0; b--) {
            const bx = bullets[b].x, by = bullets[b].y;
            if (
              bx > boss.x - boss.W / 2 && bx < boss.x + boss.W / 2 &&
              by > boss.y - boss.H / 2 && by < boss.y + boss.H / 2
            ) {
              bullets.splice(b, 1);
              boss.hp--;
              if (boss.hp <= 0) boss.alive = false;
              if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current);
              break;
            }
          }

          // Boss body collision with player
          const bossShielded = s.powerUps.SHIELD > 0;
          if (
            player.invincible <= 0 && !bossShielded && boss.alive &&
            Math.abs(boss.x - player.x) < (boss.W + SHIP_W) / 2 - 10 &&
            Math.abs(boss.y - player.y) < (boss.H + SHIP_H) / 2 - 10
          ) {
            player.invincible = 90; player.flash = 18;
            livesRef.current--;
            explosions.push(...createExplosion(player.x, player.y, 8));
            if (livesRef.current <= 0) {
              gameStatusRef.current = 'gameover';
              lsSetBest(scoreRef.current); lsClearSave();
              bestRef.current = lsGetBest();
              if (msgRef.current) msgRef.current.show('gameover');
            }
            if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current);
          }
        }
      }

      /* ── Explosions ── */
      for (let i = explosions.length - 1; i >= 0; i--) {
        const ex = explosions[i];
        ex.x += ex.vx; ex.y += ex.vy;
        ex.vx *= 0.93; ex.vy *= 0.93;
        ex.life -= ex.decay;
        if (ex.life <= 0) explosions.splice(i, 1);
      }

      /* ══════════ DRAW ══════════ */
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#000008';
      ctx.fillRect(0, 0, W, H);

      // Stars
      stars.forEach(star => {
        ctx.globalAlpha = star.opacity;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Crates
      crates.forEach(c => drawCrate(ctx, c));

      // Enemy bullets
      enemyBullets.forEach(eb => {
        ctx.fillStyle = 'rgba(255, 120, 80, 0.9)';
        ctx.shadowColor = '#ff7050'; ctx.shadowBlur = 6;
        ctx.fillRect(eb.x - 1.5, eb.y - 5, 3, 10);
      });
      ctx.shadowBlur = 0;

      // Player bullets
      bullets.forEach(b => {
        if (b.homing) drawMissile(ctx, b);
        else drawBullet(ctx, b);
      });
      ctx.shadowBlur = 0;

      // Enemies
      enemies.forEach(e => drawEnemy(ctx, e));

      // Player
      if (player.invincible <= 0 || Math.floor(player.invincible / 6) % 2 === 0) {
        drawShip(ctx, player.x, player.y, player.flash > 0, s.powerUps.SHIELD > 0);
      }

      // Explosions
      explosions.forEach(ex => {
        ctx.globalAlpha = ex.life * 0.85;
        ctx.fillStyle = ex.life > 0.5 ? '#ffffff' : 'rgba(255,200,100,0.8)';
        ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(ex.x, ex.y, ex.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;

      // Boss
      if (s.bossActive && s.boss) {
        drawBoss(ctx, s.boss);
        drawBossHpBar(ctx, s.boss, W);
      }

      // Incoming banner (BOSS / LEVEL UP)
      if (bannerRef.current && bannerRef.current.timer > 0) {
        const bn = bannerRef.current;
        bn.timer--;
        const alpha = bn.timer > 120 ? 1 : bn.timer / 120;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgba(0,0,8,0.72)';
        ctx.fillRect(0, H / 2 - 36, W, 72);
        ctx.font = "bold 22px 'Courier New', monospace";
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = bn.color;
        ctx.shadowColor = bn.color; ctx.shadowBlur = 24;
        ctx.fillText(bn.text, W / 2, H / 2);
        ctx.restore();
      }

      /* ── Auto-save every 300 frames (~5s) ── */
      autoSaveTimerRef.current++;
      if (autoSaveTimerRef.current >= 300) {
        autoSaveTimerRef.current = 0;
        lsSetSave({ score: scoreRef.current, lives: livesRef.current, wave: waveRef.current, level: levelRef.current });
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [initGame, onClose]);

  /* ─ HUD + save state ─ */
  const existingSave = React.useMemo(() => lsGetSave(), []);
  const [hudState, setHudState] = React.useState({
    score: 0, lives: MAX_LIVES, wave: 1, level: 1,
    powerUps: { HOMING: 0, RAPIDFIRE: 0, SHIELD: 0 },
    best: lsGetBest(),
    boss: null,
  });
  const [msgState, setMsgState] = React.useState(
    existingSave
      ? { visible: true, type: 'resume' }  // auto-show resume prompt
      : { visible: false, type: null }
  );

  React.useEffect(() => {
    hudRef.current = {
      update: (score, lives, wave, level, powerUps, best, boss) =>
        setHudState({ score, lives, wave, level: level ?? 1, powerUps: powerUps || { HOMING: 0, RAPIDFIRE: 0, SHIELD: 0 }, best: best ?? lsGetBest(), boss: boss ?? null }),
    };
    msgRef.current = {
      show: (type) => setMsgState({ visible: true, type }),
      hide: () => setMsgState({ visible: false, type: null }),
    };
    // If no existing save, start immediately
    if (!existingSave) initGame();
  }, []);

  const heartsStr = '♥'.repeat(Math.max(0, hudState.lives)) + '♡'.repeat(Math.max(0, MAX_LIVES - hudState.lives));
  const activePowerUps = PU_KEYS.filter(k => hudState.powerUps[k] > 0);
  const isBossWave = hudState.wave > 0 && hudState.wave % WAVES_PER_LEVEL === 0;

  return (
    <>
      <GameUI>
        <HudGroup>
          <HudItem>
            <HudLabel>Score</HudLabel>
            <HudValue>{String(hudState.score).padStart(6, '0')}</HudValue>
          </HudItem>
          <HudItem>
            <HudLabel>Best</HudLabel>
            <HudValue color="#ffcc00">{String(hudState.best).padStart(6, '0')}</HudValue>
          </HudItem>
          <HudItem>
            <HudLabel>Level</HudLabel>
            <HudValue color={isBossWave ? '#ff4444' : '#ff8844'}>{hudState.level}</HudValue>
          </HudItem>
          <HudItem>
            <HudLabel>Wave</HudLabel>
            <HudValue color="#00ff88">{hudState.wave}</HudValue>
          </HudItem>
          <HudItem>
            <HudLabel>Lives</HudLabel>
            <HudValue color="#ff6666">{heartsStr}</HudValue>
          </HudItem>
        </HudGroup>

        {/* Active power-up chips */}
        <PowerUpBar>
          {activePowerUps.map(k => (
            <PowerChip key={k} color={PU[k].color}>
              {PU[k].icon} {PU[k].label}
              <PowerTimerTrack>
                <PowerTimerFill
                  color={PU[k].color}
                  pct={Math.round((hudState.powerUps[k] / POWERUP_DURATION) * 100)}
                />
              </PowerTimerTrack>
            </PowerChip>
          ))}
        </PowerUpBar>

        <HudItem>
          <HudLabel>Controls</HudLabel>
          <HudValue style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>←→ MOVE · SPACE FIRE</HudValue>
        </HudItem>
      </GameUI>

      <GameCanvas ref={canvasRef} />

      {msgState.visible && (
        <OverlayMessage
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {msgState.type === 'resume' ? (
            <>
              <MsgTitle color="#00eeff">SAVE DETECTED</MsgTitle>
              <MsgSub>
                WAVE {existingSave?.wave} · SCORE {String(existingSave?.score ?? 0).padStart(6, '0')} · LIVES {existingSave?.lives}
                <br />
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem' }}>Continue your last run or start fresh?</span>
              </MsgSub>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <MsgBtn onClick={() => {
                  initGame(existingSave);
                  setMsgState({ visible: false, type: null });
                }}>▶ RESUME</MsgBtn>
                <MsgBtn onClick={() => {
                  lsClearSave();
                  initGame();
                  setMsgState({ visible: false, type: null });
                }}>↺ NEW GAME</MsgBtn>
                <MsgBtn onClick={onClose}>✕ EXIT</MsgBtn>
              </div>
            </>
          ) : (
            <>
              <MsgTitle color={msgState.type === 'gameover' ? '#ff4444' : '#00ff88'}>
                {msgState.type === 'gameover' ? 'GAME OVER' : 'YOU WIN'}
              </MsgTitle>
              <MsgSub>
                FINAL SCORE: {String(hudState.score).padStart(6, '0')} | WAVE: {hudState.wave}
                <br />
                {hudState.score >= hudState.best && hudState.score > 0 && (
                  <span style={{ color: '#ffcc00' }}>★ NEW HIGH SCORE!</span>
                )}
              </MsgSub>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <MsgBtn onClick={() => { lsClearSave(); initGame(); setMsgState({ visible: false, type: null }); }}>↺ RESTART</MsgBtn>
                <MsgBtn onClick={onClose}>✕ EXIT</MsgBtn>
              </div>
            </>
          )}
        </OverlayMessage>
      )}

      <EscHint>[ ESC ] EXIT GAME</EscHint>
      <GameTitle>RETRO SPACE — HIJACK.DEV</GameTitle>
    </>
  );
}

/* ════════════════════════════════════════════
   EXPORTS
   ════════════════════════════════════════════ */
function EasterEggOverlay({ show, onClose }) {
  const { achievement } = useSound();
  React.useEffect(() => { if (show) achievement(); }, [show, achievement]);

  return (
    <AnimatePresence>
      {show && (
        <GameOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <RetroSpaceGame onClose={onClose} />
        </GameOverlay>
      )}
    </AnimatePresence>
  );
}

function AchievementBadgePersistent({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <AchievementUnlockedBadge
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <BadgeDot />
          🚀 RETRO_SPACE_UNLOCKED
        </AchievementUnlockedBadge>
      )}
    </AnimatePresence>
  );
}

export { EasterEggOverlay, AchievementBadgePersistent };
