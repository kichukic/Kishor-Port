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
const MAX_LIVES = 4;
const LIFE_DROP_CHANCE = 0.08;
const MAX_HEALTH = 3;
const BASE_SHOOT_COOLDOWN = 220;
const CRATE_W = 26, CRATE_H = 26;
const LEVEL_DURATION = 7200; // 2 minutes (120 seconds * 60 FPS)
const WAVES_PER_LEVEL = 3;   // wave formatting reference
const POWERUP_DURATION = 600; // 10 seconds (600 frames at 60 FPS)

// Boss configs indexed by level (cycles)
const BOSS_DEFS = [
  { name: 'SENTINEL',    hp: 65,  score: 200,  color: '#ff4444', W: 72,  H: 52,  speed: 1.4, shape: 'saucer',      move: 'sweep',     attack: 'spread' },
  { name: 'DESTROYER',   hp: 110, score: 400,  color: '#ff8800', W: 84,  H: 64,  speed: 1.8, shape: 'destroyer',   move: 'sine',      attack: 'burst' },
  { name: 'OVERLORD',    hp: 175, score: 600,  color: '#cc44ff', W: 96,  H: 76,  speed: 2.2, shape: 'overlord',    move: 'figure8',   attack: 'spiral' },
  { name: 'VORTEX',      hp: 240, score: 800,  color: '#00f5ff', W: 80,  H: 80,  speed: 2.0, shape: 'vortex',      move: 'butterfly', attack: 'pods' },
  { name: 'DOOMBRINGER', hp: 320, score: 1000, color: '#ff0055', W: 110, H: 90,  speed: 1.2, shape: 'heavy',       move: 'bounce',    attack: 'sweep' },
  { name: 'ARMAGEDDON',  hp: 380, score: 1200, color: '#eab308', W: 100, H: 100, speed: 1.5, shape: 'star',        move: 'circle',    attack: 'ring' },
  { name: 'TEMPEST',     hp: 440, score: 1400, color: '#06b6d4', W: 90,  H: 80,  speed: 2.4, shape: 'spikey',      move: 'sine',      attack: 'targeted' },
  { name: 'GOLIATH',     hp: 500, score: 1600, color: '#f97316', W: 115, H: 95,  speed: 1.1, shape: 'heavy',       move: 'sweep',     attack: 'comb' },
  { name: 'LEVIATHAN',   hp: 570, score: 1800, color: '#3b82f6', W: 120, H: 100, speed: 1.3, shape: 'carrier',     move: 'figure8',   attack: 'pods' },
  { name: 'HYPERION',    hp: 640, score: 2000, color: '#a855f7', W: 95,  H: 85,  speed: 1.9, shape: 'tri_fighter', move: 'butterfly', attack: 'burst' },
  { name: 'APOCALYPSE',  hp: 720, score: 2200, color: '#ef4444', W: 110, H: 110, speed: 1.6, shape: 'star',        move: 'bounce',    attack: 'spiral' },
  { name: 'OBLIVION',    hp: 800, score: 2400, color: '#ec4899', W: 85,  H: 85,  speed: 2.5, shape: 'orb',         move: 'circle',    attack: 'ring' },
  { name: 'RAGNAROK',    hp: 880, score: 2600, color: '#f59e0b', W: 105, H: 95,  speed: 1.7, shape: 'spikey',      move: 'swoop',     attack: 'sweep' },
  { name: 'PROMETHEUS',  hp: 960, score: 2800, color: '#10b981', W: 95,  H: 95,  speed: 2.1, shape: 'destroyer',   move: 'sweep',     attack: 'comb' },
  { name: 'VALKYRIE',    hp: 1050, score: 3000, color: '#06b6d4', W: 80,  H: 70,  speed: 2.7, shape: 'tri_fighter', move: 'sine',      attack: 'targeted' },
  { name: 'NEMESIS',     hp: 1150, score: 3200, color: '#8b5cf6', W: 90,  H: 90,  speed: 2.0, shape: 'vortex',      move: 'figure8',   attack: 'spiral' },
  { name: 'ECLIPSE',     hp: 1250, score: 3400, color: '#64748b', W: 100, H: 80,  speed: 1.8, shape: 'saucer',      move: 'circle',    attack: 'ring' },
  { name: 'TITAN',       hp: 1360, score: 3600, color: '#d97706', W: 115, H: 105, speed: 1.3, shape: 'heavy',       move: 'bounce',    attack: 'burst' },
  { name: 'KRAKEN',      hp: 1480, score: 3800, color: '#0284c7', W: 120, H: 100, speed: 1.5, shape: 'carrier',     move: 'swoop',     attack: 'pods' },
  { name: 'BEHEMOTH',    hp: 1600, score: 4000, color: '#dc2626', W: 130, H: 110, speed: 1.0, shape: 'heavy',       move: 'sweep',     attack: 'sweep' },
  { name: 'CENTURION',   hp: 1720, score: 4200, color: '#4f46e5', W: 95,  H: 85,  speed: 2.2, shape: 'destroyer',   move: 'butterfly', attack: 'targeted' },
  { name: 'DREADNOUGHT', hp: 1850, score: 4400, color: '#b91c1c', W: 120, H: 100, speed: 1.2, shape: 'heavy',       move: 'bounce',    attack: 'comb' },
  { name: 'ZEUS',        hp: 1980, score: 4600, color: '#eab308', W: 100, H: 100, speed: 2.3, shape: 'star',        move: 'figure8',   attack: 'spiral' },
  { name: 'ODIN',        hp: 2120, score: 4800, color: '#38bdf8', W: 105, H: 95,  speed: 2.0, shape: 'overlord',    move: 'sine',      attack: 'pods' },
  { name: 'CHIMERA',     hp: 2260, score: 5000, color: '#a855f7', W: 90,  H: 90,  speed: 2.4, shape: 'vortex',      move: 'circle',    attack: 'ring' },
  { name: 'SPECTRE',     hp: 2400, score: 5200, color: '#94a3b8', W: 85,  H: 75,  speed: 2.6, shape: 'saucer',      move: 'butterfly', attack: 'burst' },
  { name: 'PHANTOM',     hp: 2550, score: 5400, color: '#c084fc', W: 80,  H: 80,  speed: 2.8, shape: 'orb',         move: 'sine',      attack: 'targeted' },
  { name: 'WRAITH',      hp: 2700, score: 5600, color: '#22d3ee', W: 85,  H: 75,  speed: 2.7, shape: 'tri_fighter', move: 'figure8',   attack: 'pods' },
  { name: 'BANSHEE',     hp: 2860, score: 5800, color: '#f43f5e', W: 90,  H: 80,  speed: 2.5, shape: 'spikey',      move: 'swoop',     attack: 'sweep' },
  { name: 'REAPER',      hp: 3020, score: 6000, color: '#4b5563', W: 100, H: 90,  speed: 1.9, shape: 'star',        move: 'sweep',     attack: 'spiral' },
  { name: 'HARBINGER',   hp: 3190, score: 6200, color: '#ea580c', W: 110, H: 95,  speed: 1.6, shape: 'destroyer',   move: 'bounce',    attack: 'comb' },
  { name: 'VANGUARD',    hp: 3360, score: 6400, color: '#16a34a', W: 95,  H: 85,  speed: 2.1, shape: 'tri_fighter', move: 'sine',      attack: 'burst' },
  { name: 'DEVASTATOR',  hp: 3540, score: 6600, color: '#e11d48', W: 120, H: 105, speed: 1.3, shape: 'heavy',       move: 'figure8',   attack: 'ring' },
  { name: 'CONQUEROR',   hp: 3720, score: 6800, color: '#4f46e5', W: 115, H: 100, speed: 1.5, shape: 'carrier',     move: 'butterfly', attack: 'pods' },
  { name: 'INFINITY',    hp: 4000, score: 8000, color: '#06b6d4', W: 125, H: 110, speed: 1.8, shape: 'swoop',     attack: 'spiral' },
];

// Power-up types
const PU = {
  HOMING:    { label: 'HOMING',    color: '#00eeff', icon: '⬡' },
  RAPIDFIRE: { label: 'RAPID',     color: '#ffcc00', icon: '◈' },
  SHIELD:    { label: 'SHIELD',    color: '#ff44ff', icon: '◉' },
};
const PU_KEYS = Object.keys(PU);

// 55 Unique enemy configurations
const ENEMY_DEFS = [
  { name: 'Scout',          hp: 1, speed: 1.5, color: '#94a3b8', shape: 'tri',     move: 'straight', power: 'normal' },
  { name: 'Drifter',        hp: 1, speed: 1.2, color: '#38bdf8', shape: 'saucer',  move: 'sine',     power: 'normal' },
  { name: 'Interceptor',    hp: 2, speed: 2.2, color: '#f59e0b', shape: 'diamond', move: 'chase',    power: 'normal' },
  { name: 'Void Striker',   hp: 1, speed: 3.0, color: '#8b5cf6', shape: 'tri',     move: 'dash',     power: 'speed_boost' },
  { name: 'Shield Drone',   hp: 3, speed: 1.0, color: '#ec4899', shape: 'orb',     move: 'sine',     power: 'shielded' },
  { name: 'Twin Gunner',    hp: 2, speed: 1.4, color: '#ef4444', shape: 'heavy',   move: 'straight', power: 'double' },
  { name: 'Kamikaze',       hp: 1, speed: 3.5, color: '#dc2626', shape: 'tri',     move: 'chase',    power: 'suicide' },
  { name: 'Ghost',          hp: 2, speed: 1.8, color: '#cbd5e1', shape: 'diamond', move: 'zigzag',   power: 'teleport' },
  { name: 'Bomber',         hp: 3, speed: 1.1, color: '#f97316', shape: 'heavy',   move: 'straight', power: 'bomb' },
  { name: 'Weaver Swarm',   hp: 1, speed: 1.6, color: '#a855f7', shape: 'tri',     move: 'sine',     power: 'splitter' },
  { name: 'Aegis Sentinel', hp: 4, speed: 0.9, color: '#22d3ee', shape: 'orb',     move: 'sine',     power: 'shielded' },
  { name: 'Striker X',      hp: 2, speed: 2.5, color: '#eab308', shape: 'cross',    move: 'zigzag',   power: 'normal' },
  { name: 'Star Swarmer',   hp: 1, speed: 1.8, color: '#10b981', shape: 'spikey',   move: 'wobble',   power: 'normal' },
  { name: 'Vortex Scout',   hp: 2, speed: 2.0, color: '#06b6d4', shape: 'saucer',  move: 'sine',     power: 'spread' },
  { name: 'Hellbound',      hp: 3, speed: 2.2, color: '#ff0055', shape: 'tri',     move: 'chase',    power: 'suicide' },
  { name: 'Apex Drone',     hp: 3, speed: 1.5, color: '#8b5cf6', shape: 'heavy',   move: 'straight', power: 'double' },
  { name: 'Doom Seeker',    hp: 2, speed: 2.1, color: '#ef4444', shape: 'diamond', move: 'chase',    power: 'bomb' },
  { name: 'Void Weaver',    hp: 2, speed: 1.7, color: '#a855f7', shape: 'saucer',  move: 'sine',     power: 'spread' },
  { name: 'Nova Striker',   hp: 1, speed: 3.2, color: '#f43f5e', shape: 'tri',     move: 'dash',     power: 'speed_boost' },
  { name: 'Shield Swarm',   hp: 2, speed: 1.3, color: '#00f5ff', shape: 'orb',     move: 'wobble',   power: 'shielded' },
  { name: 'Blink Fighter',  hp: 2, speed: 2.0, color: '#fcd34d', shape: 'diamond', move: 'zigzag',   power: 'teleport' },
  { name: 'Carrier Escort', hp: 4, speed: 1.1, color: '#38bdf8', shape: 'heavy',   move: 'straight', power: 'double' },
  { name: 'Splitter Pod',   hp: 3, speed: 1.4, color: '#10b981', shape: 'saucer',  move: 'sine',     power: 'splitter' },
  { name: 'Spectre Sentry', hp: 2, speed: 1.9, color: '#94a3b8', shape: 'cross',    move: 'wobble',   power: 'rear_shot' },
  { name: 'Apocalypse Fly', hp: 2, speed: 2.8, color: '#dc2626', shape: 'tri',     move: 'chase',    power: 'suicide' },
  { name: 'Solar Drone',    hp: 2, speed: 2.0, color: '#f59e0b', shape: 'spikey',   move: 'sine',     power: 'spread' },
  { name: 'Nebula Weaver',  hp: 3, speed: 1.3, color: '#a855f7', shape: 'saucer',  move: 'wobble',   power: 'splitter' },
  { name: 'Shadow Drone',   hp: 3, speed: 1.8, color: '#64748b', shape: 'diamond', move: 'zigzag',   power: 'teleport' },
  { name: 'Obsidian Orb',   hp: 5, speed: 0.8, color: '#111827', shape: 'orb',     move: 'straight', power: 'shielded' },
  { name: 'Heavy Blast',    hp: 4, speed: 1.2, color: '#ef4444', shape: 'heavy',   move: 'sine',     power: 'bomb' },
  { name: 'Pulsar Scout',   hp: 1, speed: 2.4, color: '#0ea5e9', shape: 'tri',     move: 'zigzag',   power: 'normal' },
  { name: 'Quasar Fighter', hp: 3, speed: 2.0, color: '#ec4899', shape: 'diamond', move: 'chase',    power: 'normal' },
  { name: 'Avenger Pod',    hp: 3, speed: 1.6, color: '#10b981', shape: 'saucer',  move: 'sine',     power: 'rear_shot' },
  { name: 'Revenant Fly',   hp: 2, speed: 3.1, color: '#d97706', shape: 'tri',     move: 'dash',     power: 'speed_boost' },
  { name: 'Valkyrie Guard', hp: 4, speed: 1.5, color: '#22d3ee', shape: 'cross',    move: 'wobble',   power: 'spread' },
  { name: 'Titan Swarm',    hp: 3, speed: 1.3, color: '#8b5cf6', shape: 'heavy',   move: 'straight', power: 'splitter' },
  { name: 'Gladiator Orb',  hp: 4, speed: 1.1, color: '#f43f5e', shape: 'orb',     move: 'sine',     power: 'shielded' },
  { name: 'Warlock Pod',    hp: 3, speed: 1.7, color: '#b91c1c', shape: 'saucer',  move: 'chase',    power: 'bomb' },
  { name: 'Sonic Dasher',   hp: 2, speed: 3.4, color: '#06b6d4', shape: 'tri',     move: 'dash',     power: 'suicide' },
  { name: 'Eclipse Sentry', hp: 3, speed: 1.8, color: '#4b5563', shape: 'diamond', move: 'zigzag',   power: 'teleport' },
  { name: 'Solar Flare',    hp: 2, speed: 2.3, color: '#f59e0b', shape: 'spikey',   move: 'sine',     power: 'spread' },
  { name: 'Nova Fighter',   hp: 3, speed: 2.2, color: '#eab308', shape: 'tri',     move: 'chase',    power: 'double' },
  { name: 'Neutron Guard',  hp: 5, speed: 1.0, color: '#0ea5e9', shape: 'heavy',   move: 'straight', power: 'shielded' },
  { name: 'Nebula Sentry',  hp: 3, speed: 1.5, color: '#a855f7', shape: 'saucer',  move: 'wobble',   power: 'rear_shot' },
  { name: 'Comet Dasher',   hp: 2, speed: 3.6, color: '#dc2626', shape: 'tri',     move: 'dash',     power: 'speed_boost' },
  { name: 'Apex Predator',  hp: 4, speed: 1.9, color: '#ec4899', shape: 'diamond', move: 'chase',    power: 'spread' },
  { name: 'Warlord Drone',  hp: 5, speed: 1.2, color: '#b91c1c', shape: 'heavy',   move: 'sine',     power: 'double' },
  { name: 'Goliath Heavy',  hp: 6, speed: 0.9, color: '#f97316', shape: 'heavy',   move: 'straight', power: 'bomb' },
  { name: 'Tyrant Striker', hp: 3, speed: 2.7, color: '#d97706', shape: 'tri',     move: 'zigzag',   power: 'normal' },
  { name: 'Chaos Weaver',   hp: 3, speed: 1.8, color: '#8b5cf6', shape: 'saucer',  move: 'sine',     power: 'splitter' },
  { name: 'Apocalypse Guard',hp: 5, speed: 1.4, color: '#ef4444', shape: 'orb',     move: 'wobble',   power: 'shielded' },
  { name: 'Omega Intercept', hp: 3, speed: 3.0, color: '#00f5ff', shape: 'diamond', move: 'chase',    power: 'suicide' },
  { name: 'Quantum Void',   hp: 4, speed: 2.1, color: '#a855f7', shape: 'cross',    move: 'zigzag',   power: 'teleport' },
  { name: 'Infinity Sentry',hp: 6, speed: 1.5, color: '#38bdf8', shape: 'heavy',   move: 'sine',     power: 'double' },
  { name: 'Nemesis Drone',  hp: 4, speed: 2.3, color: '#ff0055', shape: 'spikey',   move: 'chase',    power: 'spread' },
];


/* ════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════ */
function createStars(W, H) {
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

function createAsteroids(W, H) {
  const asteroids = [];
  for (let i = 0; i < 18; i++) {
    asteroids.push(makeAsteroid(W, H, true));
  }
  return asteroids;
}

function makeAsteroid(W, H, randomY) {
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

function drawAsteroid(ctx, a, W, H) {
  const size = a.baseSize * a.scale;
  if (size < 2) return;
  ctx.save();
  ctx.translate(a.x, a.y);
  ctx.rotate(a.rotation);
  ctx.globalAlpha = a.opacity * Math.min(1, a.scale / (a.depth * 0.6));

  const grad = ctx.createRadialGradient(-size * 0.2, -size * 0.2, size * 0.05, 0, 0, size);
  grad.addColorStop(0, `hsl(${a.hue},${a.sat + 8}%,${a.light + 18}%)`);
  grad.addColorStop(0.5, `hsl(${a.hue},${a.sat}%,${a.light}%)`);
  grad.addColorStop(1, `hsl(${a.hue},${a.sat}%,${a.light - 12}%)`);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(a.points[0].x * size, a.points[0].y * size);
  for (let i = 1; i < a.points.length; i++) {
    ctx.lineTo(a.points[i].x * size, a.points[i].y * size);
  }
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = `hsl(${a.hue},${a.sat + 5}%,${a.light + 10}%)`;
  ctx.lineWidth = 0.5 + a.scale * 0.5;
  ctx.stroke();

  for (const cr of a.craters) {
    const crSize = cr.cr * size;
    if (crSize < 1) continue;
    ctx.fillStyle = `hsla(${a.hue},${a.sat - 3}%,${a.light - 8}%,0.5)`;
    ctx.beginPath();
    ctx.arc(cr.cx * size, cr.cy * size, crSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `hsla(${a.hue},${a.sat + 5}%,${a.light + 5}%,0.3)`;
    ctx.lineWidth = 0.4;
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

function spawnEnemy(W, H, wave) {
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
function drawShip(ctx, x, y, flash, shielded, vx = 0, vy = 0) {
  ctx.save();
  ctx.translate(x, y);

  // Bank (roll) angle based on horizontal velocity vx
  const rollAngle = vx * 0.04; 
  ctx.rotate(rollAngle);

  const isFlashing = flash;
  const time = Date.now();
  const flamePulse = 1 + 0.3 * Math.sin(time / 40);
  // vy influence (thrust gets slightly longer when moving forward, smaller backward)
  const vyFactor = vy < 0 ? 1.4 : (vy > 0 ? 0.6 : 1.0);
  const flameLength = (8 + Math.random() * 6) * flamePulse * vyFactor;

  // 1. ENGINE THRUSTERS & FLAMES
  ctx.fillStyle = '#334155';
  ctx.fillRect(-6, SHIP_H / 2 - 4, 3, 5); // left nozzle
  ctx.fillRect(3, SHIP_H / 2 - 4, 3, 5);  // right nozzle

  // Left Engine Flame
  let gradFlame = ctx.createLinearGradient(0, SHIP_H / 2, 0, SHIP_H / 2 + flameLength);
  gradFlame.addColorStop(0, 'rgba(0, 240, 255, 1)');     // Hot cyan core
  gradFlame.addColorStop(0.3, 'rgba(0, 100, 255, 0.8)'); // Deep blue
  gradFlame.addColorStop(1, 'rgba(0, 0, 255, 0)');        // Fade out
  
  ctx.fillStyle = isFlashing ? 'rgba(255, 50, 50, 0.8)' : gradFlame;
  ctx.shadowColor = isFlashing ? '#ff0000' : '#00aaff';
  ctx.shadowBlur = 12;
  
  ctx.beginPath();
  ctx.ellipse(-4.5, SHIP_H / 2 + 1, 3, flameLength, 0, 0, Math.PI * 2);
  ctx.fill();

  // Right Engine Flame
  ctx.beginPath();
  ctx.ellipse(4.5, SHIP_H / 2 + 1, 3, flameLength, 0, 0, Math.PI * 2);
  ctx.fill();

  // Inner white hot core
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(-4.5, SHIP_H / 2 + 1, 1.2, flameLength * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(4.5, SHIP_H / 2 + 1, 1.2, flameLength * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. SHIELD EFFECT (drawn under ship hulls)
  if (shielded) {
    const shieldOsc = 0.5 + 0.3 * Math.sin(time / 150);
    ctx.strokeStyle = `rgba(168, 85, 247, ${0.45 + 0.25 * Math.sin(time / 100)})`;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 15 + 7 * Math.sin(time / 120);
    
    // Draw outer energy circle
    ctx.beginPath();
    ctx.arc(0, 0, SHIP_W / 2 + 8, 0, Math.PI * 2);
    ctx.stroke();

    // Draw inner thin hexagonal aura/rings
    ctx.strokeStyle = `rgba(6, 182, 212, ${0.3 * shieldOsc})`;
    ctx.lineWidth = 1;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    for (let j = 0; j < 6; j++) {
      const angle = (j * Math.PI / 3) + (time * 0.001);
      const rad = SHIP_W / 2 + 3;
      const sx = Math.cos(angle) * rad;
      const sy = Math.sin(angle) * rad;
      if (j === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // 3. SHIP CHASSIS / METALLIC WINGS (Drawn on top)
  let bodyGrad = ctx.createLinearGradient(-SHIP_W / 2, 0, SHIP_W / 2, 0);
  if (isFlashing) {
    bodyGrad.addColorStop(0, '#ff6666');
    bodyGrad.addColorStop(0.5, '#ffaaaa');
    bodyGrad.addColorStop(1, '#ff6666');
  } else {
    bodyGrad.addColorStop(0, '#1e293b'); // Dark slate wing base
    bodyGrad.addColorStop(0.35, '#475569'); // Metallic slate gray
    bodyGrad.addColorStop(0.5, '#f8fafc'); // Bright silver ridge highlight
    bodyGrad.addColorStop(0.65, '#475569');
    bodyGrad.addColorStop(1, '#1e293b');
  }

  ctx.fillStyle = bodyGrad;
  ctx.shadowColor = isFlashing ? '#ff4444' : '#38bdf8';
  ctx.shadowBlur = 8;

  // Complex wing shape
  ctx.beginPath();
  ctx.moveTo(0, -SHIP_H / 2); // nose
  ctx.lineTo(-6, -SHIP_H / 4); // left canopy shoulder
  ctx.lineTo(-SHIP_W / 2, SHIP_H / 2 - 4); // left wingtip
  ctx.lineTo(-SHIP_W / 4, SHIP_H / 4); // left wing notch
  ctx.lineTo(-8, SHIP_H / 2 - 3); // left tail fin base
  ctx.lineTo(0, SHIP_H / 2 - 8); // engine notch
  ctx.lineTo(8, SHIP_H / 2 - 3); // right tail fin base
  ctx.lineTo(SHIP_W / 4, SHIP_H / 4); // right wing notch
  ctx.lineTo(SHIP_W / 2, SHIP_H / 2 - 4); // right wingtip
  ctx.lineTo(6, -SHIP_H / 4); // right canopy shoulder
  ctx.closePath();
  ctx.fill();

  // 4. WINGTIP WEAPON PODS & LIGHTS
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-SHIP_W / 2, SHIP_H / 2 - 12, 2.5, 8); // left gun barrel
  ctx.fillRect(SHIP_W / 2 - 2.5, SHIP_H / 2 - 12, 2.5, 8); // right gun barrel

  if (!isFlashing) {
    ctx.shadowBlur = 8;
    // Left Wingtip Light (Red)
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.beginPath();
    ctx.arc(-SHIP_W / 2 + 1.2, SHIP_H / 2 - 4, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Right Wingtip Light (Green)
    ctx.fillStyle = '#22c55e';
    ctx.shadowColor = '#22c55e';
    ctx.beginPath();
    ctx.arc(SHIP_W / 2 - 1.2, SHIP_H / 2 - 4, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. CENTER FUSELAGE HIGHLIGHT PANEL
  let accentGrad = ctx.createLinearGradient(0, -SHIP_H / 3, 0, SHIP_H / 3);
  accentGrad.addColorStop(0, '#38bdf8'); // Glowing cyan
  accentGrad.addColorStop(1, '#0284c7'); // Darker cyber blue
  ctx.fillStyle = isFlashing ? '#ff0000' : accentGrad;
  ctx.shadowColor = isFlashing ? '#ff0000' : '#0ea5e9';
  ctx.shadowBlur = 6;
  
  ctx.beginPath();
  ctx.moveTo(0, -SHIP_H / 3);
  ctx.lineTo(-3.5, -1);
  ctx.lineTo(-2, SHIP_H / 6);
  ctx.lineTo(0, SHIP_H / 4);
  ctx.lineTo(2, SHIP_H / 6);
  ctx.lineTo(3.5, -1);
  ctx.closePath();
  ctx.fill();

  // 6. GLASS CANOPY (Cockpit)
  let canopyGrad = ctx.createLinearGradient(0, -10, 0, 4);
  canopyGrad.addColorStop(0, '#38bdf8'); // Glowing neon cyan cockpit
  canopyGrad.addColorStop(1, '#0369a1'); // Deep ocean blue base
  ctx.fillStyle = isFlashing ? '#ff8888' : canopyGrad;
  ctx.shadowColor = isFlashing ? '#ff4444' : '#38bdf8';
  ctx.shadowBlur = 6;

  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(-4, 0);
  ctx.lineTo(-3, 4);
  ctx.lineTo(3, 4);
  ctx.lineTo(4, 0);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawEnemy(ctx, e) {
  const { shape, color, hp, maxHp, timer, shield } = e;
  const t = Date.now() / 200;
  const pulse = 0.8 + 0.2 * Math.sin(t + e.x);

  ctx.save();
  ctx.translate(e.x, e.y);

  // Outer glow
  ctx.shadowColor = color;
  ctx.shadowBlur = 8 + 4 * pulse;

  // Active shield ring indicator
  if (shield > 0) {
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, ENEMY_W / 2 + 3.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = color;

  if (shape === 'tri') {
    // 1. Engine exhaust
    const flameL = 6 + Math.random() * 6;
    let flameGrad = ctx.createLinearGradient(0, -ENEMY_H / 2, 0, -ENEMY_H / 2 - flameL);
    flameGrad.addColorStop(0, color);
    flameGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.ellipse(0, -ENEMY_H / 2 + 2, 2.5, flameL, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Wings (dual color gradients for metallic feel)
    let wingGrad = ctx.createLinearGradient(-ENEMY_W / 2, 0, ENEMY_W / 2, 0);
    wingGrad.addColorStop(0, '#1e293b');
    wingGrad.addColorStop(0.3, color);
    wingGrad.addColorStop(0.5, '#f8fafc'); // highlight
    wingGrad.addColorStop(0.7, color);
    wingGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = wingGrad;

    ctx.beginPath();
    ctx.moveTo(0, ENEMY_H / 2); // Nose pointing DOWN
    ctx.lineTo(-ENEMY_W / 2, -ENEMY_H / 2); // left wingtip
    ctx.lineTo(-ENEMY_W / 4, -ENEMY_H / 6); // left wing notch
    ctx.lineTo(0, -ENEMY_H / 2.5); // engine bay
    ctx.lineTo(ENEMY_W / 4, -ENEMY_H / 6); // right wing notch
    ctx.lineTo(ENEMY_W / 2, -ENEMY_H / 2); // right wingtip
    ctx.closePath();
    ctx.fill();

    // 3. Canopy cockpit
    let canopyGrad = ctx.createLinearGradient(0, -2, 0, ENEMY_H / 3);
    canopyGrad.addColorStop(0, '#ffffff');
    canopyGrad.addColorStop(1, color);
    ctx.fillStyle = canopyGrad;
    ctx.beginPath();
    ctx.moveTo(0, ENEMY_H / 4);
    ctx.lineTo(-3, 0);
    ctx.lineTo(0, -4);
    ctx.lineTo(3, 0);
    ctx.closePath();
    ctx.fill();

    // 4. Panel lines
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-ENEMY_W / 3, -ENEMY_H / 3);
    ctx.lineTo(0, ENEMY_H / 6);
    ctx.lineTo(ENEMY_W / 3, -ENEMY_H / 3);
    ctx.stroke();

  } else if (shape === 'saucer') {
    // 1. Bottom metallic base
    let diskGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, ENEMY_W / 2);
    diskGrad.addColorStop(0, '#475569');
    diskGrad.addColorStop(0.7, color);
    diskGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = diskGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, ENEMY_W / 1.8, ENEMY_H / 2.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Neon ring groove
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, ENEMY_W / 2.4, ENEMY_H / 4.2, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Cockpit dome
    let domeGrad = ctx.createRadialGradient(0, -2, 1, 0, -2, ENEMY_W / 4.5);
    domeGrad.addColorStop(0, '#ffffff');
    domeGrad.addColorStop(0.4, color);
    domeGrad.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = domeGrad;
    ctx.beginPath();
    ctx.ellipse(0, -2, ENEMY_W / 4.5, ENEMY_H / 6.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. Rotating perimeter lights
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 4; i++) {
      const ang = (timer * 0.04) + (i * Math.PI) / 2;
      const px = Math.cos(ang) * (ENEMY_W / 2.1);
      const py = Math.sin(ang) * (ENEMY_H / 3.4);
      ctx.beginPath();
      ctx.arc(px, py, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (shape === 'diamond') {
    // 4 shaded facets for crystalline look
    const dw = ENEMY_W / 2;
    const dh = ENEMY_H / 2;

    // Top-Left facet
    let g1 = ctx.createLinearGradient(-dw, 0, 0, 0);
    g1.addColorStop(0, color); g1.addColorStop(1, '#ffffff');
    ctx.fillStyle = g1;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(-dw, 0); ctx.lineTo(0, -dh); ctx.closePath(); ctx.fill();

    // Top-Right facet
    let g2 = ctx.createLinearGradient(dw, 0, 0, 0);
    g2.addColorStop(0, color); g2.addColorStop(1, '#ffffff');
    ctx.fillStyle = g2;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(dw, 0); ctx.lineTo(0, -dh); ctx.closePath(); ctx.fill();

    // Bottom-Left facet
    let g3 = ctx.createLinearGradient(-dw, 0, 0, 0);
    g3.addColorStop(0, color); g3.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = g3;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(-dw, 0); ctx.lineTo(0, dh); ctx.closePath(); ctx.fill();

    // Bottom-Right facet
    let g4 = ctx.createLinearGradient(dw, 0, 0, 0);
    g4.addColorStop(0, color); g4.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = g4;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(dw, 0); ctx.lineTo(0, dh); ctx.closePath(); ctx.fill();

    // High intensity center core
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

  } else if (shape === 'orb') {
    // 1. Outer curved shield wings
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, ENEMY_W / 2.2, -Math.PI / 3, (4 * Math.PI) / 3);
    ctx.stroke();

    // 2. Metallic core
    let ballGrad = ctx.createRadialGradient(-3, -3, 1, 0, 0, ENEMY_W / 3.2);
    ballGrad.addColorStop(0, '#f8fafc');
    ballGrad.addColorStop(0.3, color);
    ballGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = ballGrad;
    ctx.beginPath();
    ctx.arc(0, 0, ENEMY_W / 3.2, 0, Math.PI * 2);
    ctx.fill();

    // 3. Horizontal lens/eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-ENEMY_W / 6, -1.5, ENEMY_W / 3, 3);

    // 4. Orbiting energy dots
    ctx.fillStyle = '#ffffff';
    const ang = timer * 0.06;
    ctx.beginPath();
    ctx.arc(Math.cos(ang) * (ENEMY_W / 2.1), Math.sin(ang) * (ENEMY_W / 2.1), 1.8, 0, Math.PI * 2);
    ctx.fill();

  } else if (shape === 'spikey') {
    // 1. Inner core
    let coreGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, ENEMY_W / 4.2);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.5, color);
    coreGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, ENEMY_W / 4.2, 0, Math.PI * 2);
    ctx.fill();

    // 2. Sharp vector spikes (8-point star with gradients)
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4 + (timer * 0.02);
      const r = i % 2 === 0 ? ENEMY_W / 2 : ENEMY_W / 3.5;
      
      let spGrad = ctx.createLinearGradient(0, 0, Math.cos(angle) * r, Math.sin(angle) * r);
      spGrad.addColorStop(0, color);
      spGrad.addColorStop(0.8, color);
      spGrad.addColorStop(1, '#ffffff');
      
      ctx.strokeStyle = spGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      ctx.stroke();

      // Small glowing tip node
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * r, Math.sin(angle) * r, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (shape === 'heavy') {
    // 1. Wing thrusters exhaust
    ctx.fillStyle = 'rgba(255, 100, 0, 0.85)';
    const flameH = 5 + Math.random() * 5;
    ctx.fillRect(-ENEMY_W / 3 - 1, -ENEMY_H / 2 - flameH, 2.5, flameH);
    ctx.fillRect(ENEMY_W / 3 - 1.5, -ENEMY_H / 2 - flameH, 2.5, flameH);

    // 2. Armored wing plating
    ctx.fillStyle = '#334155';
    ctx.fillRect(-ENEMY_W / 2, -ENEMY_H / 2.2, ENEMY_W / 4.5, ENEMY_H * 0.82);
    ctx.fillRect(ENEMY_W / 2 - ENEMY_W / 4.5, -ENEMY_H / 2.2, ENEMY_W / 4.5, ENEMY_H * 0.82);

    // 3. Central heavy chassis
    let bodyGrad = ctx.createLinearGradient(0, -ENEMY_H / 2, 0, ENEMY_H / 2);
    bodyGrad.addColorStop(0, '#1e293b');
    bodyGrad.addColorStop(0.4, color);
    bodyGrad.addColorStop(0.5, '#cbd5e1'); // highlight ridge
    bodyGrad.addColorStop(0.6, color);
    bodyGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bodyGrad;

    ctx.beginPath();
    ctx.moveTo(0, ENEMY_H / 2); // heavy beak
    ctx.lineTo(-ENEMY_W / 3.5, ENEMY_H / 4);
    ctx.lineTo(-ENEMY_W / 3.5, -ENEMY_H / 2);
    ctx.lineTo(ENEMY_W / 3.5, -ENEMY_H / 2);
    ctx.lineTo(ENEMY_W / 3.5, ENEMY_H / 4);
    ctx.closePath();
    ctx.fill();

    // 4. Panel warning decals
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-3, -ENEMY_H / 3, 6, 2);

  } else {
    // Interceptor X-Wing
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;

    // Wing struts
    ctx.beginPath();
    ctx.moveTo(-ENEMY_W / 2.1, -ENEMY_H / 2.1);
    ctx.lineTo(ENEMY_W / 2.1, ENEMY_H / 2.1);
    ctx.moveTo(ENEMY_W / 2.1, -ENEMY_H / 2.1);
    ctx.lineTo(-ENEMY_W / 2.1, ENEMY_H / 2.1);
    ctx.stroke();

    // Fuselage
    let fusGrad = ctx.createLinearGradient(0, -ENEMY_H / 2.3, 0, ENEMY_H / 2.3);
    fusGrad.addColorStop(0, '#0f172a');
    fusGrad.addColorStop(0.5, color);
    fusGrad.addColorStop(1, '#334155');
    ctx.fillStyle = fusGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, ENEMY_W / 5.2, ENEMY_H / 2.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing weapon node barrels
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-ENEMY_W / 2.1, ENEMY_H / 2.1, 2, 0, Math.PI * 2);
    ctx.arc(ENEMY_W / 2.1, ENEMY_H / 2.1, 2, 0, Math.PI * 2);
    ctx.arc(ENEMY_W / 2.1, -ENEMY_H / 2.1, 2, 0, Math.PI * 2);
    ctx.arc(-ENEMY_W / 2.1, -ENEMY_H / 2.1, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Engine exhaust for all shapes
  const flk = Math.random();
  if (shape === 'tri') {
    // Twin thruster jets from wing notches
    for (const side of [-1, 1]) {
      const fx = side * ENEMY_W / 4;
      const fy = -ENEMY_H / 2.5;
      const fLen = 5 + flk * 7;
      const fGrad = ctx.createLinearGradient(fx, fy, fx, fy - fLen);
      fGrad.addColorStop(0, color);
      fGrad.addColorStop(0.3, '#ffffff');
      fGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = fGrad;
      ctx.beginPath();
      ctx.moveTo(fx - 2, fy);
      ctx.lineTo(fx, fy - fLen);
      ctx.lineTo(fx + 2, fy);
      ctx.closePath();
      ctx.fill();
    }
  } else if (shape === 'saucer') {
    // Tractor beam glow underneath + perimeter micro-thrusters
    const tbGrad = ctx.createRadialGradient(0, ENEMY_H / 4, 1, 0, ENEMY_H / 4, ENEMY_W / 4);
    tbGrad.addColorStop(0, `rgba(0,255,200,${0.3 + flk * 0.3})`);
    tbGrad.addColorStop(1, 'rgba(0,255,200,0)');
    ctx.fillStyle = tbGrad;
    ctx.beginPath();
    ctx.ellipse(0, ENEMY_H / 4, ENEMY_W / 4, 6 + flk * 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // 3 micro-thruster cones on top
    for (let i = -1; i <= 1; i++) {
      const tx = i * ENEMY_W / 5;
      const tLen = 3 + flk * 4;
      const tGrad = ctx.createLinearGradient(tx, -ENEMY_H / 3, tx, -ENEMY_H / 3 - tLen);
      tGrad.addColorStop(0, '#ffffff');
      tGrad.addColorStop(0.5, color);
      tGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = tGrad;
      ctx.beginPath();
      ctx.moveTo(tx - 1.5, -ENEMY_H / 3);
      ctx.lineTo(tx, -ENEMY_H / 3 - tLen);
      ctx.lineTo(tx + 1.5, -ENEMY_H / 3);
      ctx.closePath();
      ctx.fill();
    }
  } else if (shape === 'diamond') {
    // Crystal shard energy trail from top
    const cLen = 6 + flk * 8;
    const cGrad = ctx.createLinearGradient(0, -ENEMY_H / 2, 0, -ENEMY_H / 2 - cLen);
    cGrad.addColorStop(0, '#ffffff');
    cGrad.addColorStop(0.3, color);
    cGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = cGrad;
    ctx.beginPath();
    ctx.moveTo(-3, -ENEMY_H / 2);
    ctx.lineTo(0, -ENEMY_H / 2 - cLen);
    ctx.lineTo(3, -ENEMY_H / 2);
    ctx.closePath();
    ctx.fill();
    // Side sparkles
    ctx.fillStyle = `rgba(255,255,255,${0.3 + flk * 0.4})`;
    ctx.beginPath();
    ctx.arc(-ENEMY_W / 3, -ENEMY_H / 4, 1 + flk, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ENEMY_W / 3, -ENEMY_H / 4, 1 + flk, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === 'orb') {
    // Pulsing energy exhaust ring at top
    const ringR = 4 + flk * 3;
    ctx.strokeStyle = `rgba(255,255,255,${0.4 + flk * 0.4})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, -ENEMY_W / 2.2, ringR, 2, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Inner glow
    const oGrad = ctx.createRadialGradient(0, -ENEMY_W / 2.5, 0, 0, -ENEMY_W / 2.5, 5);
    oGrad.addColorStop(0, `rgba(255,255,255,${0.5 + flk * 0.3})`);
    oGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = oGrad;
    ctx.beginPath();
    ctx.arc(0, -ENEMY_W / 2.5, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === 'spikey') {
    // Tendril tip flares at top 3 spikes
    for (let i = -1; i <= 1; i++) {
      const angle = (timer * 0.02) + i * 0.4 - Math.PI / 2;
      const tipX = Math.cos(angle) * ENEMY_W / 2;
      const tipY = Math.sin(angle) * ENEMY_W / 2;
      const fR = 2 + flk * 2;
      const fGrad = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, fR);
      fGrad.addColorStop(0, '#ffffff');
      fGrad.addColorStop(0.5, color);
      fGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = fGrad;
      ctx.beginPath();
      ctx.arc(tipX, tipY, fR, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (shape === 'heavy') {
    // Dual heavy thruster exhausts from top
    for (const side of [-1, 1]) {
      const hx = side * ENEMY_W / 3;
      const hy = -ENEMY_H / 2;
      const hLen = 7 + flk * 8;
      const hGrad = ctx.createLinearGradient(hx, hy, hx, hy - hLen);
      hGrad.addColorStop(0, '#ff8800');
      hGrad.addColorStop(0.2, '#ffffff');
      hGrad.addColorStop(0.6, color);
      hGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = hGrad;
      ctx.beginPath();
      ctx.moveTo(hx - 3, hy);
      ctx.quadraticCurveTo(hx, hy - hLen, hx + 3, hy);
      ctx.closePath();
      ctx.fill();
    }
    // Center vent
    const cvGrad = ctx.createRadialGradient(0, -ENEMY_H / 2, 0, 0, -ENEMY_H / 2, 4);
    cvGrad.addColorStop(0, `rgba(255,200,100,${0.4 + flk * 0.3})`);
    cvGrad.addColorStop(1, 'rgba(255,200,100,0)');
    ctx.fillStyle = cvGrad;
    ctx.beginPath();
    ctx.arc(0, -ENEMY_H / 2, 4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Cross: 4 wing-tip engine glows
    const pts = [[-1,-1],[1,-1],[1,1],[-1,1]];
    for (const [sx, sy] of pts) {
      const ex = sx * ENEMY_W / 2.1;
      const ey = sy * ENEMY_H / 2.1;
      const eR = 2.5 + flk * 2;
      const eGrad = ctx.createRadialGradient(ex, ey, 0, ex, ey, eR);
      eGrad.addColorStop(0, '#ffffff');
      eGrad.addColorStop(0.4, color);
      eGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = eGrad;
      ctx.beginPath();
      ctx.arc(ex, ey, eR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // HP Bar overlay for high HP targets
  if (maxHp > 1 && hp > 0) {
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(-12, -ENEMY_H / 2 - 8, 24, 3);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(-12, -ENEMY_H / 2 - 8, 24 * (hp / maxHp), 3);
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

/* ─── DRAW: Life Pickup ─── */
function drawLifePickup(ctx, lp) {
  const t = Date.now() / 300;
  const glow = 0.6 + 0.4 * Math.sin(t + lp.wobble);

  ctx.save();
  ctx.translate(lp.x, lp.y);
  ctx.shadowColor = '#22ff66';
  ctx.shadowBlur = 14 + 8 * glow;

  // Outer ring
  ctx.strokeStyle = `rgba(34, 255, 102, ${0.5 + 0.3 * glow})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.stroke();

  // Heart shape
  ctx.fillStyle = '#22ff66';
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.bezierCurveTo(-7, -1, -7, -7, 0, -5);
  ctx.bezierCurveTo(7, -7, 7, -1, 0, 4);
  ctx.fill();

  // Inner white highlight
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.arc(-2.5, -3, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Falling trail dots
  ctx.globalAlpha = 0.3;
  ctx.shadowBlur = 0;
  for (let i = 1; i <= 3; i++) {
    ctx.fillStyle = '#22ff66';
    ctx.beginPath();
    ctx.arc(0, 12 + i * 5, 1.5, 0, Math.PI * 2);
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

function drawBoss(ctx, boss) {
  const { x, y, W: BW, H: BH, color, hp, maxHp, phase, timer, flash, shape } = boss;
  const t = Date.now() / 200;
  const pulse = 0.8 + 0.2 * Math.sin(t);
  const rage = phase === 2;
  const isFlashing = flash > 0;

  ctx.save();
  ctx.translate(x, y);

  // Outer hull glow
  ctx.shadowColor = isFlashing ? '#ffffff' : (rage ? '#ff0000' : color);
  ctx.shadowBlur = 20 + 10 * pulse;

  if (shape === 'saucer') {
    // Wide flat saucer
    ctx.fillStyle = isFlashing ? '#ffffff' : (rage ? `rgba(255,80,80,${pulse})` : `rgba(255,100,100,${pulse * 0.9})`);
    ctx.beginPath();
    ctx.ellipse(0, 0, BW / 2, BH / 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isFlashing ? '#ffffff' : (rage ? '#ff4444' : color);
    ctx.beginPath();
    ctx.ellipse(0, -BH / 6, BW / 4, BH / 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Cannon ports
    ctx.fillStyle = isFlashing ? '#ffffff' : '#44444c';
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.arc(i * (BW / 5.5), BH / 5, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (shape === 'destroyer') {
    // Angular destroyer hull
    ctx.fillStyle = isFlashing ? '#ffffff' : (rage ? `rgba(255,140,0,${pulse})` : `rgba(255,160,80,${pulse * 0.9})`);
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
    ctx.fillStyle = isFlashing ? '#ffffff' : (rage ? '#ff8800' : color);
    ctx.beginPath();
    ctx.ellipse(0, 0, BW / 12, BH / 12, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === 'overlord') {
    // OVERLORD — multi-wing form
    ctx.fillStyle = isFlashing ? '#ffffff' : (rage ? `rgba(200,0,255,${pulse})` : `rgba(180,80,255,${pulse * 0.85})`);
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
    ctx.fillStyle = isFlashing ? '#ffffff' : '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, BW / 14, BH / 10, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === 'vortex') {
    // Rotating star/vortex wheel
    ctx.save();
    ctx.rotate(timer * 0.04);
    
    // Spinning blades (6 blades)
    ctx.fillStyle = isFlashing ? '#ffffff' : (rage ? '#ff3333' : color);
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 3);
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(0, -BH / 2);
      ctx.lineTo(8, -BH / 2);
      ctx.lineTo(4, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Outer glow ring
    ctx.strokeStyle = isFlashing ? '#ffffff' : `rgba(255,255,255,${0.5 + 0.3 * pulse})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, BW / 3.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Solid core sphere (doesn't rotate)
    ctx.fillStyle = isFlashing ? '#ffffff' : (rage ? `rgba(255,50,50,${pulse})` : `rgba(0,240,255,${pulse * 0.9})`);
    ctx.beginPath();
    ctx.arc(0, 0, BW / 4.8, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === 'heavy' || shape === 'battleship') {
    // Heavy battleship
    // Thrusters
    ctx.fillStyle = '#475569';
    ctx.fillRect(-BW / 3, -BH / 2 - 2, BW / 6, 6);
    ctx.fillRect(BW / 3 - BW / 6, -BH / 2 - 2, BW / 6, 6);

    // Main heavy armor plate
    ctx.fillStyle = isFlashing ? '#ffffff' : (rage ? `rgba(255, 0, 50, ${pulse})` : `rgba(180, 20, 50, ${pulse * 0.9})`);
    ctx.beginPath();
    ctx.moveTo(0, BH / 2); // front nose beak
    ctx.lineTo(-BW / 2, BH / 4); // left wing tip
    ctx.lineTo(-BW / 2.5, -BH / 2); // left rear
    ctx.lineTo(BW / 2.5, -BH / 2); // right rear
    ctx.lineTo(BW / 2, BH / 4); // right wing tip
    ctx.closePath();
    ctx.fill();

    // Twin massive shoulder cannons
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-BW / 3.5, -BH / 4, 7, BH / 2 + 10);
    ctx.fillRect(BW / 3.5 - 7, -BH / 4, 7, BH / 2 + 10);
    // Cannon tips
    ctx.fillStyle = isFlashing ? '#ffffff' : '#94a3b8';
    ctx.fillRect(-BW / 3.5 - 1, BH / 4 + 6, 9, 4);
    ctx.fillRect(BW / 3.5 - 8, BH / 4 + 6, 9, 4);

    // Core power cell
    ctx.fillStyle = isFlashing ? '#ffffff' : (rage ? '#ff0033' : color);
    ctx.beginPath();
    ctx.ellipse(0, 0, BW / 7, BH / 7, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === 'star') {
    // Star core shape
    ctx.fillStyle = isFlashing ? '#ffffff' : (rage ? '#ef4444' : color);
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 + (timer * 0.015);
      const r = i % 2 === 0 ? BW / 2 : BW / 4;
      ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    ctx.closePath();
    ctx.fill();

    // Star inner core eye
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, BW / 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, BW / 12, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === 'spikey') {
    // Spike point core
    ctx.fillStyle = isFlashing ? '#ffffff' : (rage ? '#dc2626' : color);
    ctx.beginPath();
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8 + (timer * 0.005);
      const r = i % 2 === 0 ? BW / 2 : BW / 3.2;
      ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    ctx.closePath();
    ctx.fill();

    // Central neon circle
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, BW / 5, 0, Math.PI * 2);
    ctx.stroke();
  } else if (shape === 'carrier') {
    // Large wide carrier deck
    ctx.fillStyle = isFlashing ? '#ffffff' : (rage ? `rgba(220, 38, 38, ${pulse})` : `rgba(47, 55, 69, ${pulse})`);
    ctx.fillRect(-BW / 2, -BH / 2, BW, BH);

    // Deck runways
    ctx.fillStyle = isFlashing ? '#ffffff' : '#1e293b';
    ctx.fillRect(-BW / 2 + 10, -BH / 4, BW - 20, BH / 2);
    
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-BW / 2 + 20, -2, BW - 40, 4); // yellow warning center stripe

    // Side sensor arrays
    ctx.fillStyle = color;
    ctx.fillRect(-BW / 2 - 4, -BH / 3, 4, BH * 0.6);
    ctx.fillRect(BW / 2, -BH / 3, 4, BH * 0.6);
  } else if (shape === 'tri_fighter') {
    // Trident nose fighter
    ctx.fillStyle = isFlashing ? '#ffffff' : (rage ? '#f43f5e' : color);
    ctx.beginPath();
    ctx.moveTo(0, BH / 2); // front beak
    ctx.lineTo(-BW / 2, -BH / 4); // left wingtip
    ctx.lineTo(-BW / 4, -BH / 2); // left inner wing
    ctx.lineTo(0, -BH / 8); // center notch
    ctx.lineTo(BW / 4, -BH / 2); // right inner wing
    ctx.lineTo(BW / 2, -BH / 4); // right wingtip
    ctx.closePath();
    ctx.fill();

    // Laser nozzles
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-BW / 3, BH / 8, 4, 10);
    ctx.fillRect(BW / 3 - 4, BH / 8, 4, 10);
  } else {
    // ORB: Glowing central sphere with orbiting sub-orbs
    ctx.fillStyle = isFlashing ? '#ffffff' : (rage ? '#ff0055' : color);
    ctx.beginPath();
    ctx.arc(0, 0, BW / 3, 0, Math.PI * 2);
    ctx.fill();

    // Orbiting mini energy shields
    ctx.fillStyle = isFlashing ? '#ffffff' : color;
    const subShields = 3;
    for (let i = 0; i < subShields; i++) {
      const angle = (timer * 0.05) + (i * Math.PI * 2) / subShields;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * (BW / 2.2), Math.sin(angle) * (BW / 2.2), 6, 0, Math.PI * 2);
      ctx.fill();
    }
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

function drawLevelTimer(ctx, timer, duration, W) {
  if (timer <= 0) return;
  const pct = Math.max(0, Math.min(1, timer / duration));
  const barW = 200;
  const barH = 6;
  const bx = (W - barW) / 2;
  const by = 52; // below HUD

  // Calculate minutes and seconds
  const totalSeconds = Math.ceil(timer / 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeStr = `BOSS IN: ${minutes}:${String(seconds).padStart(2, '0')}`;

  ctx.save();
  // Text
  ctx.font = "10px 'Courier New', monospace";
  ctx.fillStyle = '#00f5ff';
  ctx.shadowColor = '#00f5ff';
  ctx.shadowBlur = 6;
  ctx.textAlign = 'center';
  ctx.fillText(timeStr, W / 2, by - 6);

  // Bar Track
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.shadowBlur = 0;
  ctx.fillRect(bx, by, barW, barH);

  // Bar Fill (Cyan glow)
  ctx.fillStyle = '#00f5ff';
  ctx.shadowColor = '#00f5ff';
  ctx.shadowBlur = 8;
  ctx.fillRect(bx, by, barW * pct, barH);

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

    const initialLevelTimer = (resumeData && typeof resumeData.levelTimer === 'number') ? resumeData.levelTimer : LEVEL_DURATION;

    stateRef.current = {
      W, H,
      player: { x: W / 2, y: H - 60, vx: 0, vy: 0, flash: 0, invincible: 0, health: MAX_HEALTH },
      bullets: [],
      enemyBullets: [],
      enemies: [],
      boss: null,
      bossActive: false,
      crates: [],
      explosions: [],
      stars: createStars(W, H),
      asteroids: createAsteroids(W, H),
      keys: {},
      lastShot: 0,
      spawnTimer: 0,
      spawnInterval: Math.max(35, 90 - waveRef.current * 6),
      crateTimer: 0,
      crateInterval: 420,
      enemiesKilled: 0,
      waveKillTarget: 8 + waveRef.current * 2,
      powerUps: { HOMING: 0, RAPIDFIRE: 0, SHIELD: 0 },
      levelTimer: initialLevelTimer,
      lifePickups: [],
    };

    if (hudRef.current) hudRef.current.update(
      scoreRef.current, livesRef.current, waveRef.current, levelRef.current,
      { HOMING: 0, RAPIDFIRE: 0, SHIELD: 0 }, bestRef.current, MAX_HEALTH
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

      /* ── Asteroids ── */
      for (let i = s.asteroids.length - 1; i >= 0; i--) {
        const a = s.asteroids[i];
        a.y += a.vy;
        a.x += a.vx + Math.sin(a.wobblePhase) * a.wobbleAmp;
        a.rotation += a.rotSpeed;
        a.wobblePhase += a.wobbleSpeed;
        const progress = 1 - (a.y / (H + 100));
        a.scale = a.depth * Math.max(0.15, progress * 1.3);
        if (a.y > H + 80) {
          s.asteroids[i] = makeAsteroid(W, H, false);
        }
      }

      /* ── Bullet update ── */
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];

        if (b.homing) {
          // Find nearest live enemy/boss
          let nearest = null, nearestDist = Infinity;
          for (const e of enemies) {
            const dx = e.x - b.x, dy = e.y - b.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < nearestDist) { nearestDist = d; nearest = e; }
          }
          if (s.bossActive && s.boss && s.boss.alive) {
            const dx = s.boss.x - b.x, dy = s.boss.y - b.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < nearestDist) { nearestDist = d; nearest = s.boss; }
          }
          if (nearest) {
            const dx = nearest.x - b.x, dy = nearest.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
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
        // Countdown Level Timer
        if (s.levelTimer > 0) {
          s.levelTimer--;
          if (s.levelTimer === 0) {
            // Timer expired — Trigger Boss Incoming!
            s.bossActive = true;
            s.boss = spawnBoss(W, levelRef.current);
            s.enemies = [];
            s.enemyBullets = [];
            bannerRef.current = { text: `⚠ BOSS INCOMING — ${s.boss.name}`, color: s.boss.color, timer: 150 };
            if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health);
          }
        }

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
          if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health);
          continue;
        }
      }

      /* ── Life pickup update ── */
      for (let i = s.lifePickups.length - 1; i >= 0; i--) {
        const lp = s.lifePickups[i];
        lp.y += lp.vy;
        lp.wobble += 0.04;

        if (lp.y > H + 20) { s.lifePickups.splice(i, 1); continue; }

        if (
          Math.abs(lp.x - player.x) < (16 + SHIP_W / 2) &&
          Math.abs(lp.y - player.y) < (16 + SHIP_H / 2)
        ) {
          if (player.health < MAX_HEALTH) {
            player.health++;
          } else if (livesRef.current < MAX_LIVES) {
            livesRef.current++;
          }
          explosions.push(...createExplosion(lp.x, lp.y, 10));
          s.lifePickups.splice(i, 1);
          if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health);
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

        // Procedural movements
        if (e.move === 'sine') {
          e.vx = Math.sin(e.timer * 0.06) * e.baseSpeed * 0.8;
        } else if (e.move === 'chase') {
          const dx = player.x - e.x;
          e.vx += dx * 0.0025;
          e.vx = Math.max(-e.baseSpeed * 0.9, Math.min(e.baseSpeed * 0.9, e.vx));
        } else if (e.move === 'zigzag') {
          if (e.timer % 90 === 0) e.vx *= -1;
        } else if (e.move === 'dash') {
          if (e.y < H * 0.4) {
            e.vy = e.baseSpeed * 0.4;
          } else {
            e.vy = e.baseSpeed * 1.8;
            if (e.power === 'speed_boost') e.vx = Math.sin(e.timer * 0.1) * 2;
          }
        } else if (e.move === 'wobble') {
          e.vx = Math.sin(e.timer * 0.12) * 2;
          e.vy = e.baseSpeed * 0.85;
        }

        if (e.power === 'teleport' && e.timer % 140 === 0) {
          e.x += (Math.random() - 0.5) * 85;
          e.x = Math.max(40, Math.min(W - 40, e.x));
          explosions.push(...createExplosion(e.x, e.y, 4));
        }

        e.x += e.vx;
        e.y += e.vy;

        if (e.y > H + 60 || e.x < -120 || e.x > W + 120) { enemies.splice(i, 1); continue; }

        // Enemy shoots
        e.shootTimer--;
        if (e.shootTimer <= 0) {
          e.shootTimer = 100 + Math.random() * 180;
          const dx = player.x - e.x, dy = player.y - e.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          if (e.power === 'spread') {
            for (let j = 0; j < 3; j++) {
              const ang = Math.PI / 2 + (j - 1) * 0.25;
              enemyBullets.push({ x: e.x, y: e.y + ENEMY_H / 2, vx: Math.cos(ang) * ENEMY_BULLET_SPEED, vy: Math.sin(ang) * ENEMY_BULLET_SPEED });
            }
          } else if (e.power === 'double') {
            enemyBullets.push({ x: e.x - 6, y: e.y + ENEMY_H / 2, vx: 0, vy: ENEMY_BULLET_SPEED });
            enemyBullets.push({ x: e.x + 6, y: e.y + ENEMY_H / 2, vx: 0, vy: ENEMY_BULLET_SPEED });
          } else if (e.power === 'rear_shot' && e.y < player.y) {
            enemyBullets.push({ x: e.x, y: e.y + ENEMY_H / 2, vx: (dx / dist) * ENEMY_BULLET_SPEED, vy: (dy / dist) * ENEMY_BULLET_SPEED });
            enemyBullets.push({ x: e.x, y: e.y - ENEMY_H / 2, vx: 0, vy: -ENEMY_BULLET_SPEED * 0.8 }); // back shot
          } else if (e.power === 'suicide') {
            e.shootTimer = 99999;
          } else {
            enemyBullets.push({
              x: e.x, y: e.y + ENEMY_H / 2,
              vx: (dx / dist) * ENEMY_BULLET_SPEED,
              vy: (dy / dist) * ENEMY_BULLET_SPEED,
            });
          }
        }

        /* ── Bullet-enemy collision ── */
        for (let b = bullets.length - 1; b >= 0; b--) {
          const bx = bullets[b].x, by = bullets[b].y;
          if (
            bx > e.x - ENEMY_W / 2 && bx < e.x + ENEMY_W / 2 &&
            by > e.y - ENEMY_H / 2 && by < e.y + ENEMY_H / 2
          ) {
            bullets.splice(b, 1);

            if (e.shield > 0) {
              e.shield--;
              explosions.push(...createExplosion(bx, by, 3));
              break;
            }

            e.hp--;
            explosions.push(...createExplosion(bx, by, 3));

            if (e.hp <= 0) {
              e.alive = false;

              if (e.power === 'splitter') {
                for (let j = 0; j < 2; j++) {
                  enemies.push({
                    name: 'Mini Swarmer',
                    x: e.x + (j === 0 ? -15 : 15),
                    y: e.y,
                    vx: (j === 0 ? -1.2 : 1.2) * (e.baseSpeed * 0.8),
                    vy: e.vy * 1.1,
                    baseSpeed: e.baseSpeed,
                    hp: 1,
                    maxHp: 1,
                    color: '#a855f7',
                    shape: 'tri',
                    move: 'sine',
                    power: 'normal',
                    timer: 0,
                    shootTimer: 45 + Math.random() * 90,
                    shield: 0,
                    alive: true,
                  });
                }
              } else if (e.power === 'bomb') {
                for (let j = 0; j < 6; j++) {
                  const ang = (Math.PI * 2 / 6) * j;
                  enemyBullets.push({
                    x: e.x,
                    y: e.y,
                    vx: Math.cos(ang) * ENEMY_BULLET_SPEED * 0.85,
                    vy: Math.sin(ang) * ENEMY_BULLET_SPEED * 0.85,
                  });
                }
              }

              scoreRef.current += e.maxHp * 15;
              lsSetBest(scoreRef.current);
              bestRef.current = lsGetBest();
              if (Math.random() < LIFE_DROP_CHANCE && (livesRef.current < MAX_LIVES || player.health < MAX_HEALTH)) {
                s.lifePickups.push({
                  x: e.x, y: e.y,
                  vy: 1.2 + Math.random() * 0.5,
                  wobble: Math.random() * Math.PI * 2,
                  alive: true,
                });
              }
              if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health);
            }
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
          player.health--;
          if (player.health <= 0) {
            livesRef.current--;
            player.health = MAX_HEALTH;
          }
          explosions.push(...createExplosion(player.x, player.y, 8));
          if (livesRef.current <= 0) {
            gameStatusRef.current = 'gameover';
            lsSetBest(scoreRef.current);
            lsClearSave();
            bestRef.current = lsGetBest();
            if (msgRef.current) msgRef.current.show('gameover');
          }
          if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health);
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
          player.health--;
          if (player.health <= 0) {
            livesRef.current--;
            player.health = MAX_HEALTH;
          }
          explosions.push(...createExplosion(player.x, player.y, 8));
          if (livesRef.current <= 0) {
            gameStatusRef.current = 'gameover';
            lsSetBest(scoreRef.current);
            lsClearSave();
            bestRef.current = lsGetBest();
            if (msgRef.current) msgRef.current.show('gameover');
          }
          if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health);
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
          s.levelTimer = LEVEL_DURATION; // Reset survival timer
          levelRef.current++;
          waveRef.current++;
          s.spawnInterval = Math.max(35, 90 - waveRef.current * 6);
          s.waveKillTarget = 8 + waveRef.current * 2;
          s.enemiesKilled = 0;
          bannerRef.current = { text: `✦ LEVEL ${levelRef.current} — ENGAGE`, color: '#00ff88', timer: 150 };
          if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health);
        } else {
          boss.timer++;
          if (boss.flash > 0) boss.flash--;

          // Entry animation
          if (boss.entering) {
            boss.y += 2.5; // fast entry
            if (boss.y >= 130) { boss.entering = false; }
          } else {
            // Movement based on boss.move parameter
            if (boss.move === 'sweep') {
              boss.x += boss.vx;
              if (boss.x > W - boss.W / 2 - 20 || boss.x < boss.W / 2 + 20) boss.vx *= -1;
              boss.y = 130 + 20 * Math.sin(boss.timer * 0.015);
            }
            else if (boss.move === 'sine') {
              const spd = boss.phase === 2 ? 1.5 : 1;
              boss.x = W / 2 + (W * 0.38) * Math.sin(boss.timer * 0.018 * spd);
              boss.y = 140 + 40 * Math.sin(boss.timer * 0.025);
            }
            else if (boss.move === 'figure8') {
              const spd = boss.phase === 2 ? 1.4 : 1;
              boss.x = W / 2 + (W * 0.35) * Math.sin(boss.timer * 0.02 * spd);
              boss.y = 140 + 55 * Math.sin(boss.timer * 0.04 * spd);
            }
            else if (boss.move === 'butterfly') {
              const spd = boss.phase === 2 ? 1.3 : 1;
              boss.x = W / 2 + (W * 0.38) * Math.sin(boss.timer * 0.022 * spd);
              boss.y = 150 + 60 * Math.cos(boss.timer * 0.044 * spd);
            }
            else if (boss.move === 'bounce') {
              const spd = boss.phase === 2 ? 1.4 : 1;
              boss.x += boss.vx * spd;
              boss.y += boss.vy * spd;
              if (boss.x > W - boss.W / 2 - 20 || boss.x < boss.W / 2 + 20) boss.vx *= -1;
              if (boss.y > 240 || boss.y < 120) boss.vy *= -1;
            }
            else if (boss.move === 'circle') {
              const spd = boss.phase === 2 ? 1.3 : 1;
              const radius = Math.min(W * 0.25, 120);
              boss.x = W / 2 + radius * Math.cos(boss.timer * 0.015 * spd);
              boss.y = 160 + radius * 0.5 * Math.sin(boss.timer * 0.015 * spd);
            }
            else { // swoop
              const spd = boss.phase === 2 ? 1.3 : 1;
              boss.x = W / 2 + (W * 0.3) * Math.sin(boss.timer * 0.012);
              boss.y = 160 + 90 * Math.sin(boss.timer * 0.03 * spd);
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

              // Attacks based on boss.attack parameter
              if (boss.attack === 'spread') {
                const shots = boss.phase === 2 ? 5 : 3;
                for (let i = 0; i < shots; i++) {
                  const ang = (Math.PI / 2) + (i - (shots - 1) / 2) * 0.28;
                  enemyBullets.push({ x: boss.x, y: boss.y + boss.H / 2, vx: Math.cos(ang) * bspd, vy: Math.sin(ang) * bspd });
                }
              } else if (boss.attack === 'burst') {
                const dx = player.x - boss.x, dy = player.y - boss.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const shots = boss.phase === 2 ? 5 : 3;
                for (let i = 0; i < shots; i++) {
                  const spread = (Math.random() - 0.5) * 0.4;
                  enemyBullets.push({ x: boss.x, y: boss.y + boss.H / 2, vx: (dx / dist) * bspd + spread, vy: (dy / dist) * bspd + spread });
                }
              } else if (boss.attack === 'spiral') {
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
              } else if (boss.attack === 'pods') {
                enemyBullets.push({ x: boss.x - 20, y: boss.y + boss.H / 4, vx: 0, vy: bspd });
                enemyBullets.push({ x: boss.x + 20, y: boss.y + boss.H / 4, vx: 0, vy: bspd });
                if (boss.phase === 2) {
                  const ringCount = 8;
                  for (let i = 0; i < ringCount; i++) {
                    const ang = (i / ringCount) * Math.PI * 2;
                    enemyBullets.push({ x: boss.x, y: boss.y, vx: Math.cos(ang) * bspd * 0.9, vy: Math.sin(ang) * bspd * 0.9 });
                  }
                }
              } else if (boss.attack === 'sweep') {
                const sweepCount = boss.phase === 2 ? 6 : 4;
                const baseAng = (Math.PI / 2) + Math.sin(boss.timer * 0.07) * 0.5;
                for (let i = 0; i < sweepCount; i++) {
                  const ang = baseAng + (i - (sweepCount - 1) / 2) * 0.15;
                  enemyBullets.push({ x: boss.x, y: boss.y + boss.H / 2, vx: Math.cos(ang) * bspd, vy: Math.sin(ang) * bspd });
                }
                if (boss.phase === 2 && boss.timer % 2 === 0) {
                  enemyBullets.push({ x: boss.x - 10, y: boss.y + boss.H / 2, vx: 0, vy: bspd * 1.3 });
                  enemyBullets.push({ x: boss.x + 10, y: boss.y + boss.H / 2, vx: 0, vy: bspd * 1.3 });
                }
              } else if (boss.attack === 'ring') {
                const ringCount = boss.phase === 2 ? 16 : 10;
                for (let i = 0; i < ringCount; i++) {
                  const ang = (i / ringCount) * Math.PI * 2;
                  enemyBullets.push({ x: boss.x, y: boss.y, vx: Math.cos(ang) * bspd * 0.85, vy: Math.sin(ang) * bspd * 0.85 });
                }
              } else if (boss.attack === 'targeted') {
                const dx = player.x - boss.x, dy = player.y - boss.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                enemyBullets.push({ x: boss.x, y: boss.y + boss.H / 2, vx: (dx / dist) * bspd * 1.5, vy: (dy / dist) * bspd * 1.5 });
                if (boss.phase === 2) {
                  enemyBullets.push({ x: boss.x - 15, y: boss.y, vx: (dx / dist) * bspd * 1.3, vy: (dy / dist) * bspd * 1.3 });
                  enemyBullets.push({ x: boss.x + 15, y: boss.y, vx: (dx / dist) * bspd * 1.3, vy: (dy / dist) * bspd * 1.3 });
                }
              } else { // comb
                const streams = boss.phase === 2 ? 6 : 4;
                for (let i = 0; i < streams; i++) {
                  const bx = boss.x - boss.W / 2 + (i / (streams - 1)) * boss.W;
                  enemyBullets.push({ x: bx, y: boss.y + boss.H / 2, vx: 0, vy: bspd * 0.95 });
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
              boss.flash = 6;
              if (boss.hp <= 0) boss.alive = false;
              if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health);
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
            player.health--;
            if (player.health <= 0) {
              livesRef.current--;
              player.health = MAX_HEALTH;
            }
            explosions.push(...createExplosion(player.x, player.y, 8));
            if (livesRef.current <= 0) {
              gameStatusRef.current = 'gameover';
              lsSetBest(scoreRef.current); lsClearSave();
              bestRef.current = lsGetBest();
              if (msgRef.current) msgRef.current.show('gameover');
            }
            if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health);
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
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        ctx.globalAlpha = star.opacity;
        if (star.glow > 0) {
          ctx.shadowColor = `hsla(${star.hue},${star.sat}%,80%,${star.opacity * 0.6})`;
          ctx.shadowBlur = star.glow;
        }
        ctx.fillStyle = `hsla(${star.hue},${star.sat}%,${star.sat > 0 ? 85 : 97}%,1)`;
        ctx.beginPath(); ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Asteroids
      s.asteroids.forEach(a => drawAsteroid(ctx, a, W, H));

      // Crates
      crates.forEach(c => drawCrate(ctx, c));
      s.lifePickups.forEach(lp => drawLifePickup(ctx, lp));

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
        drawShip(ctx, player.x, player.y, player.flash > 0, s.powerUps.SHIELD > 0, player.vx, player.vy);
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
      } else {
        // Draw Level Timer (Time to Boss)
        drawLevelTimer(ctx, s.levelTimer, LEVEL_DURATION, W);
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
        lsSetSave({ score: scoreRef.current, lives: livesRef.current, wave: waveRef.current, level: levelRef.current, levelTimer: s.levelTimer });
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
    score: 0, lives: MAX_LIVES, health: MAX_HEALTH, wave: 1, level: 1,
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
      update: (score, lives, wave, level, powerUps, best, health) =>
        setHudState({
          score,
          lives,
          health: health ?? MAX_HEALTH,
          wave,
          level: level ?? 1,
          powerUps: powerUps || { HOMING: 0, RAPIDFIRE: 0, SHIELD: 0 },
          best: best ?? lsGetBest(),
          boss: (stateRef.current && stateRef.current.bossActive && stateRef.current.boss) ? stateRef.current.boss : null
        }),
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
  const isBossWave = hudState.boss !== null;

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
            <div style={{ display: 'flex', gap: 3, marginTop: 3 }}>
              {Array.from({ length: MAX_HEALTH }, (_, i) => (
                <div
                  key={i}
                  style={{
                    width: 14,
                    height: 4,
                    borderRadius: 2,
                    background: i < hudState.health ? '#22ff66' : 'rgba(255,255,255,0.12)',
                    transition: 'background 0.2s',
                  }}
                />
              ))}
            </div>
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
           RETRO_SPACE_UNLOCKED
        </AchievementUnlockedBadge>
      )}
    </AnimatePresence>
  );
}

export { EasterEggOverlay, AchievementBadgePersistent };
