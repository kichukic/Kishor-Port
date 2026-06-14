import React, { useEffect, useRef, useCallback } from 'react';
import { isMobile } from './constants';
import {
  SHIP_W, SHIP_H, ENEMY_W, ENEMY_H,
  PLAYER_SPEED, BULLET_SPEED, MISSILE_SPEED, ENEMY_BULLET_SPEED,
  MAX_LIVES, MAX_HEALTH, BASE_SHOOT_COOLDOWN, CRATE_W, CRATE_H,
  LEVEL_DURATION, POWERUP_DURATION, LIFE_DROP_CHANCE,
  PU, PU_KEYS, COMBO_TIMEOUT, COMBO_MAX, BEAM_DURATION, GHOST_DURATION, MAGNET_DURATION, SCORE2X_DURATION,
  BOSS_DEFS,
} from './constants';
import {
  GameUI, GameCanvas, HudGroup, HudItem, HudLabel, HudValue,
  PowerUpBar, PowerChip, PowerTimerTrack, PowerTimerFill,
  EscHint, GameTitle, OverlayMessage, MsgTitle, MsgSub, MsgBtn,
} from './styles';
import { createStars, createNebulae, createShootingStars } from './factories/stars';
import { createAsteroids, makeAsteroid } from './factories/asteroids';
import { spawnEnemy } from './factories/enemy';
import { spawnCrate } from './factories/crate';
import { spawnBoss, spawnMiniBoss } from './factories/boss';
import { createExplosion } from './factories/explosions';
import { lsGetBest, lsSetBest, lsGetSave, lsSetSave, lsClearSave } from './utils/localStorage';
import { ACHIEVEMENTS, getUnlocked, unlock } from './achievements';
import { createRunStats, saveRunStats, getAccuracy } from './stats';

function checkAchievements(state, scoreRef, waveRef, levelRef) {
  const { runStats, achievementTimers } = state;
  const checks = [
    ['first_blood',       () => runStats.kills >= 1],
    ['century',           () => runStats.kills >= 100],
    ['combo_king',        () => runStats.highestCombo >= 5],
    ['boss_slayer',       () => runStats.bossesKilled >= 1],
    ['survivor',          () => waveRef.current >= 10],
    ['marathon',          () => waveRef.current >= 25],
    ['ghost_protocol',    () => runStats.slowsUsed >= 5 || state.powerUps.GHOST > 0],
    ['overdrive_master',  () => runStats.overdrivesUsed >= 10],
    ['collector',         () => runStats.powerUpsCollected >= 50],
    ['millionaire',       () => scoreRef.current >= 100000],
    ['miniboss_hunter',   () => runStats.miniBossesKilled >= 5],
    ['bombardier',        () => runStats.bombsUsed >= 10],
    ['victory',           () => levelRef.current > 35],
  ];
  for (const [id, fn] of checks) {
    if (fn() && !achievementTimers[id] && unlock(id)) {
      achievementTimers[id] = true;
      const def = ACHIEVEMENTS.find(a => a.id === id);
      if (def) {
        state.newAchievements.push({ ...def, timer: 300 });
      }
    }
  }
}
import { drawShip } from './drawing/ship';
import { drawEnemy } from './drawing/enemy';
import { drawCrate } from './drawing/crate';
import { drawLifePickup } from './drawing/lifePickup';
import { drawMissile } from './drawing/missile';
import { drawBullet } from './drawing/bullet';
import { drawAsteroid } from './drawing/asteroid';
import { drawBoss, drawMiniBoss, drawLevelTimer, drawBossHpBar } from './drawing/boss';

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
  const bannerRef = useRef(null);
  const initRef = useRef(false);
  const gameStartTimeRef = useRef(Date.now());
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const initGame = useCallback((resumeData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width, H = canvas.height;

    scoreRef.current   = resumeData ? resumeData.score : 0;
    livesRef.current   = resumeData ? resumeData.lives : MAX_LIVES;
    waveRef.current    = resumeData ? resumeData.wave  : 1;
    levelRef.current   = resumeData ? resumeData.level : 1;
    gameStatusRef.current = 'playing';
    gameStartTimeRef.current = Date.now();
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
      miniBoss: null,
      miniBossActive: false,
      miniBossKillCount: 0,
      crates: [],
      explosions: [],
      stars: createStars(W, H),
      nebulae: createNebulae(W, H),
      shootingStars: createShootingStars(W, H),
      shootingStarTimer: 0,
      asteroids: createAsteroids(W, H),
      keys: {},
      touch: { active: false, originX: 0, originY: 0, dx: 0, dy: 0, fire: false, lastTap: 0 },
      lastShot: 0,
      spawnTimer: 0,
      spawnInterval: Math.max(35, 90 - waveRef.current * 6),
      crateTimer: 0,
      crateInterval: 420,
      enemiesKilled: 0,
      waveKillTarget: 8 + waveRef.current * 2,
      powerUps: { HOMING: 0, RAPIDFIRE: 0, SHIELD: 0, MULTISHOT: 0, BEAM: 0, GHOST: 0, MAGNET: 0, SCORE2X: 0 },
      levelTimer: initialLevelTimer,
      lifePickups: [],
      combo: 0,
      comboTimer: 0,
      shakeX: 0,
      shakeY: 0,
      shakeDecay: 0,
      floatingTexts: [],
      particles: [],
      spawnCycle: 0,
      abilities: { bombCD: 0, slowCD: 0, overdriveCD: 0, slowActive: 0, overdriveActive: 0 },
      hitStop: 0,
      screenFlash: 0,
      paused: false,
      deathPieces: [],
      deathTimer: 0,
      intermission: null,
      waveKills: 0,
      hazard: null,
      runStats: createRunStats(),
      newAchievements: [],
      achievementTimers: {},
      noDamageHits: 0,
      gameMode: 'normal',
      endlessCycle: 0,
      bossRushIndex: 0,
    };

    if (hudRef.current) hudRef.current.update(
      scoreRef.current, livesRef.current, waveRef.current, levelRef.current,
      { HOMING: 0, RAPIDFIRE: 0, SHIELD: 0, MULTISHOT: 0, BEAM: 0, GHOST: 0, MAGNET: 0, SCORE2X: 0 }, bestRef.current, MAX_HEALTH, 0
    );
    if (msgRef.current) msgRef.current.hide();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (!initRef.current) {
        initRef.current = true;
        initGame();
      } else {
        const s = stateRef.current;
        if (s) {
          s.W = canvas.width;
          s.H = canvas.height;
          s.stars = createStars(s.W, s.H);
          s.asteroids = createAsteroids(s.W, s.H);
        }
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const onKeyDown = (e) => {
      const s = stateRef.current;
      if (!s) return;
      s.keys[e.code] = true;
      if (e.code === 'Escape') { onCloseRef.current(); return; }
      if (e.code === 'KeyP') { s.paused = !s.paused; return; }
      if (s.paused) return;
      if (e.code === 'KeyQ' && s.abilities.bombCD <= 0) {
        s.abilities.bombCD = 900;
        s.enemyBullets.length = 0;
        for (const en of s.enemies) { en.hp -= 2; if (en.hp <= 0) en.alive = false; }
        if (s.bossActive && s.boss && s.boss.alive) { s.boss.hp -= 2; s.boss.flash = 8; }
        if (s.miniBossActive && s.miniBoss && s.miniBoss.alive) { s.miniBoss.hp -= 2; s.miniBoss.flash = 8; }
        s.shakeX = 8; s.shakeY = 8; s.shakeDecay = 0.88;
        s.floatingTexts.push({ x: s.player.x, y: s.player.y - 30, text: '💥 BOMB!', color: '#f59e0b', life: 60, vy: -1.5 });
        s.runStats.bombsUsed++;
        return;
      }
      if (e.code === 'KeyE' && s.abilities.slowCD <= 0 && s.abilities.slowActive <= 0) {
        s.abilities.slowCD = 1200;
        s.abilities.slowActive = 180;
        s.floatingTexts.push({ x: s.player.x, y: s.player.y - 30, text: '⏱ SLOW!', color: '#06b6d4', life: 60, vy: -1.5 });
        s.runStats.slowsUsed++;
        return;
      }
      if (e.code === 'KeyR' && s.abilities.overdriveCD <= 0 && s.abilities.overdriveActive <= 0) {
        s.abilities.overdriveCD = 1500;
        s.abilities.overdriveActive = 300;
        s.floatingTexts.push({ x: s.player.x, y: s.player.y - 30, text: '⚡ OVERDRIVE!', color: '#f59e0b', life: 60, vy: -1.5 });
        s.runStats.overdrivesUsed++;
        return;
      }
      const gameKeys = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyD','KeyW','KeyS','Space','KeyZ','KeyQ','KeyE','KeyR'];
      if (gameKeys.includes(e.code)) e.preventDefault();
    };
    const onKeyUp = (e) => {
      if (stateRef.current) stateRef.current.keys[e.code] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const getTouchPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0] || e.changedTouches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    };

    const onTouchStart = (e) => {
      const s = stateRef.current;
      if (!s) return;
      e.preventDefault();
      const pos = getTouchPos(e);

      if (pos.x >= s.W / 2) {
        const now = Date.now();
        if (now - s.touch.lastTap < 300) {
          s.paused = !s.paused;
          s.touch.lastTap = 0;
          return;
        }
        s.touch.lastTap = now;

        const btnR = 22;
        const abY = s.H - btnR - 24;
        const abGap = btnR * 2 + 12;
        const abStartX = s.W - btnR - 24 - abGap * 2;
        const abilityKeys = ['bomb', 'slow', 'overdrive'];
        const abilityCDKeys = ['bombCD', 'slowCD', 'overdriveCD'];
        for (let ai = 0; ai < 3; ai++) {
          const bx = abStartX + ai * abGap;
          const dx = pos.x - bx, dy = pos.y - abY;
          if (Math.sqrt(dx * dx + dy * dy) < btnR + 8) {
            const key = abilityKeys[ai];
            const cdKey = abilityCDKeys[ai];
            if (key === 'bomb' && s.abilities[cdKey] <= 0) {
              s.abilities.bombCD = 900;
              s.enemyBullets.length = 0;
              for (const en of s.enemies) { en.hp -= 2; if (en.hp <= 0) en.alive = false; }
              if (s.bossActive && s.boss && s.boss.alive) { s.boss.hp -= 2; s.boss.flash = 8; }
              if (s.miniBossActive && s.miniBoss && s.miniBoss.alive) { s.miniBoss.hp -= 2; s.miniBoss.flash = 8; }
              s.shakeX = 8; s.shakeY = 8; s.shakeDecay = 0.88;
        s.floatingTexts.push({ x: s.player.x, y: s.player.y - 30, text: '💥 BOMB!', color: '#f59e0b', life: 60, vy: -1.5 });
        s.runStats.bombsUsed++;
            } else if (key === 'slow' && s.abilities[cdKey] <= 0 && s.abilities.slowActive <= 0) {
              s.abilities.slowCD = 1200;
              s.abilities.slowActive = 180;
        s.floatingTexts.push({ x: s.player.x, y: s.player.y - 30, text: '⏱ SLOW!', color: '#06b6d4', life: 60, vy: -1.5 });
        s.runStats.slowsUsed++;
            } else if (key === 'overdrive' && s.abilities[cdKey] <= 0 && s.abilities.overdriveActive <= 0) {
              s.abilities.overdriveCD = 1500;
              s.abilities.overdriveActive = 300;
        s.floatingTexts.push({ x: s.player.x, y: s.player.y - 30, text: '⚡ OVERDRIVE!', color: '#f59e0b', life: 60, vy: -1.5 });
        s.runStats.overdrivesUsed++;
            }
            return;
          }
        }
      }

      if (pos.x < s.W / 2) {
        s.touch.active = true;
        s.touch.originX = pos.x;
        s.touch.originY = pos.y;
        s.touch.dx = 0;
        s.touch.dy = 0;
      } else {
        s.touch.fire = true;
      }
    };

    const onTouchMove = (e) => {
      const s = stateRef.current;
      if (!s || !s.touch.active) return;
      e.preventDefault();
      const pos = getTouchPos(e);
      const maxDist = 50;
      let dx = pos.x - s.touch.originX;
      let dy = pos.y - s.touch.originY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > maxDist) {
        dx = (dx / dist) * maxDist;
        dy = (dy / dist) * maxDist;
      }
      s.touch.dx = dx;
      s.touch.dy = dy;
    };

    const onTouchEnd = (e) => {
      const s = stateRef.current;
      if (!s) return;
      e.preventDefault();
      const pos = getTouchPos(e);
      if (pos.x >= s.W / 2) {
        s.touch.fire = false;
      } else {
        s.touch.active = false;
        s.touch.dx = 0;
        s.touch.dy = 0;
      }
    };

    if (isMobile) {
      canvas.addEventListener('touchstart', onTouchStart, { passive: false });
      canvas.addEventListener('touchmove', onTouchMove, { passive: false });
      canvas.addEventListener('touchend', onTouchEnd, { passive: false });
      canvas.addEventListener('touchcancel', onTouchEnd, { passive: false });
    }

    const loop = () => {
      try {
      const s = stateRef.current;
      if (!s) { rafRef.current = requestAnimationFrame(loop); return; }

      const { W, H, player, bullets, enemyBullets, enemies, crates, explosions, stars, keys } = s;
      const ctx = canvas.getContext('2d');
      if (!ctx) { rafRef.current = requestAnimationFrame(loop); return; }
      const now = Date.now();

      if (gameStatusRef.current !== 'playing') {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      if (s.particles.length > 500) s.particles.splice(0, s.particles.length - 400);
      if (explosions.length > 500) explosions.splice(0, explosions.length - 400);
      if (enemyBullets.length > 150) enemyBullets.splice(0, enemyBullets.length - 120);

      if (s.hitStop > 0) {
        s.hitStop--;
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      if (s.paused) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,8,0.7)';
        ctx.fillRect(0, 0, W, H);
        ctx.font = "bold 32px 'Courier New', monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 20;
        ctx.fillText('PAUSED', W / 2, H / 2 - 20);
        ctx.shadowBlur = 0;
        ctx.font = "14px 'Courier New', monospace";
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('PRESS P OR DOUBLE-TAP TO RESUME', W / 2, H / 2 + 25);
        ctx.restore();
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      if (s.deathTimer > 0) {
        s.deathTimer--;
        for (let i = s.deathPieces.length - 1; i >= 0; i--) {
          const dp = s.deathPieces[i];
          dp.x += dp.vx; dp.y += dp.vy;
          dp.rot += dp.rotSpeed;
          dp.life -= dp.decay;
          if (dp.life <= 0) s.deathPieces.splice(i, 1);
        }
        for (let i = explosions.length - 1; i >= 0; i--) {
          const ex = explosions[i];
          ex.x += ex.vx; ex.y += ex.vy;
          ex.vx *= 0.93; ex.vy *= 0.93;
          ex.life -= ex.decay;
          if (ex.life <= 0) explosions.splice(i, 1);
        }
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.x += p.vx; p.y += p.vy;
          p.vx *= 0.95; p.vy *= 0.95;
          p.life -= p.decay;
          if (p.life <= 0) s.particles.splice(i, 1);
        }
        ctx.save();
        ctx.fillStyle = '#000008';
        ctx.fillRect(0, 0, W, H);
        for (const dp of s.deathPieces) {
          ctx.globalAlpha = dp.life;
          ctx.save();
          ctx.translate(dp.x, dp.y);
          ctx.rotate(dp.rot);
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.moveTo(0, -8);
          ctx.lineTo(-6, 6);
          ctx.lineTo(0, 3);
          ctx.lineTo(6, 6);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
        explosions.forEach(ex => {
          ctx.globalAlpha = ex.life * 0.85;
          ctx.fillStyle = ex.color || '#ffffff';
          ctx.shadowColor = ex.color || '#ffffff';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(ex.x, ex.y, ex.r, 0, Math.PI * 2);
          ctx.fill();
        });
        s.particles.forEach(p => {
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.restore();
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      if (s.deathPieces.length > 0) s.deathPieces.length = 0;

      if (s.intermission) {
        s.intermission.timer--;
        const bn = s.intermission;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,8,0.8)';
        ctx.fillRect(0, 0, W, H);
        ctx.font = "bold 28px 'Courier New', monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 20;
        ctx.fillText(`LEVEL ${bn.level} CLEAR`, W / 2, H / 2 - 30);
        ctx.shadowBlur = 0;
        ctx.font = "14px 'Courier New', monospace";
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillText(`NEXT: LEVEL ${levelRef.current}`, W / 2, H / 2 + 10);
        if (bn.timer < 40) {
          ctx.globalAlpha = (40 - bn.timer) / 40;
          ctx.fillText('GET READY...', W / 2, H / 2 + 40);
          ctx.globalAlpha = 1;
        }
        ctx.restore();
        if (s.intermission.timer <= 0) {
          s.intermission = null;
          s.levelTimer = LEVEL_DURATION;
          bannerRef.current = { text: `✦ LEVEL ${levelRef.current} — ENGAGE`, color: '#00ff88', timer: 150 };
        }
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      if (isMobile && s.touch.active) {
        const deadzone = 8;
        const maxDist = 50;
        const tdx = s.touch.dx;
        const tdy = s.touch.dy;
        const tdist = Math.sqrt(tdx * tdx + tdy * tdy);
        if (tdist > deadzone) {
          const ratio = Math.min(tdist, maxDist) / maxDist;
          player.vx = (tdx / tdist) * PLAYER_SPEED * ratio;
          player.vy = (tdy / tdist) * PLAYER_SPEED * ratio;
        } else {
          player.vx *= 0.75;
          player.vy *= 0.75;
        }
      } else {
        if (keys['ArrowLeft']  || keys['KeyA']) player.vx = -PLAYER_SPEED;
        else if (keys['ArrowRight'] || keys['KeyD']) player.vx = PLAYER_SPEED;
        else player.vx *= 0.75;

        if (keys['ArrowUp']   || keys['KeyW']) player.vy = -PLAYER_SPEED;
        else if (keys['ArrowDown']  || keys['KeyS']) player.vy = PLAYER_SPEED;
        else player.vy *= 0.75;
      }

      player.x = Math.max(SHIP_W / 2, Math.min(W - SHIP_W / 2, player.x + player.vx));
      player.y = Math.max(SHIP_H / 2 + 48, Math.min(H - SHIP_H / 2, player.y + player.vy));
      if (player.invincible > 0) player.invincible--;
      if (player.flash > 0) player.flash--;

      if (Math.abs(player.vx) > 0.5 || Math.abs(player.vy) > 0.5) {
        s.particles.push({ x: player.x + (Math.random() - 0.5) * 4, y: player.y + SHIP_H / 2 - 2, vx: (Math.random() - 0.5) * 0.5, vy: 0.8 + Math.random() * 0.5, life: 1, decay: 0.05 + Math.random() * 0.03, r: 1 + Math.random() * 1.5, color: '#38bdf8' });
      }

      for (const k of PU_KEYS) {
        if (s.powerUps[k] > 0) s.powerUps[k]--;
      }

      const ab = s.abilities;
      if (ab.bombCD > 0) ab.bombCD--;
      if (ab.slowCD > 0) ab.slowCD--;
      if (ab.overdriveCD > 0) ab.overdriveCD--;
      if (ab.slowActive > 0) ab.slowActive--;
      if (ab.overdriveActive > 0) ab.overdriveActive--;

      const cooldown = s.powerUps.RAPIDFIRE > 0 ? BASE_SHOOT_COOLDOWN / 3 : BASE_SHOOT_COOLDOWN;
      const overdriveActive = s.abilities.overdriveActive > 0;
      const wantFire = isMobile ? true : (keys['Space'] || keys['KeyZ']);
      const beamActive = s.powerUps.BEAM > 0;
      if (wantFire && now - s.lastShot > (beamActive ? 0 : overdriveActive ? cooldown / 3 : cooldown)) {
        s.lastShot = now;
        if (s.powerUps.HOMING > 0) {
          const homingCount = bullets.filter(b => b.homing).length;
          if (homingCount < 8) {
            bullets.push({ x: player.x - 6, y: player.y - SHIP_H / 2, vx: 0, vy: -MISSILE_SPEED, homing: true });
            bullets.push({ x: player.x + 6, y: player.y - SHIP_H / 2, vx: 0, vy: -MISSILE_SPEED, homing: true });
          }
        } else if (beamActive) {
          bullets.push({ x: player.x, y: player.y - SHIP_H / 2 - 2, vx: 0, vy: -BULLET_SPEED * 2.5, homing: false, beam: true, w: 6 });
        } else if (s.powerUps.MULTISHOT > 0) {
          for (let i = -2; i <= 2; i++) {
            const ang = -Math.PI / 2 + i * 0.18;
            bullets.push({ x: player.x, y: player.y - SHIP_H / 2 - 2, vx: Math.cos(ang) * BULLET_SPEED, vy: Math.sin(ang) * BULLET_SPEED, homing: false });
          }
        } else {
          bullets.push({ x: player.x, y: player.y - SHIP_H / 2 - 2, vx: 0, vy: -BULLET_SPEED, homing: false });
          s.runStats.shotsFired++;
          if (s.powerUps.RAPIDFIRE > 0) {
            bullets.push({ x: player.x - 12, y: player.y - SHIP_H / 4, vx: -0.8, vy: -BULLET_SPEED * 0.9, homing: false });
            bullets.push({ x: player.x + 12, y: player.y - SHIP_H / 4, vx: 0.8, vy: -BULLET_SPEED * 0.9, homing: false });
          }
        }
      }

      stars.forEach(star => {
        star.y += star.speed;
        if (star.y > H) { star.y = -2; star.x = Math.random() * W; }
      });

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

      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        if (b.homing) {
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
            const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
            if (spd > MISSILE_SPEED) { b.vx = (b.vx / spd) * MISSILE_SPEED; b.vy = (b.vy / spd) * MISSILE_SPEED; }
          }
        }
        b.x += b.vx;
        b.y += b.vy;
        if (b.y < -20 || b.y > H + 20 || b.x < -20 || b.x > W + 20) bullets.splice(i, 1);
      }

      if (!s.bossActive) {
        if (s.levelTimer > 0) {
          s.levelTimer--;
          if (s.levelTimer === 0) {
            s.bossActive = true;
            s.boss = spawnBoss(W, levelRef.current);
            s.enemies.length = 0;
            s.enemyBullets.length = 0;
            bannerRef.current = { text: `⚠ BOSS INCOMING — ${s.boss.name}`, color: s.boss.color, timer: 150 };
            if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health, s.combo);
          }
        }
        s.spawnTimer++;
        if (s.spawnTimer >= s.spawnInterval) {
          s.spawnTimer = 0;
          const maxOnScreen = 18 + waveRef.current * 2;
          s.spawnCycle = (s.spawnCycle || 0) + 1;
          if (s.spawnCycle % 5 === 0 && waveRef.current >= 2 && enemies.length + 5 <= maxOnScreen) {
            const fType = Math.floor(Math.random() * Math.min(5, 1 + Math.floor(waveRef.current / 2)));
            if (fType === 0) {
              for (let j = -1; j <= 1; j++) {
                const fe = spawnEnemy(W, H, waveRef.current, s.gameMode === 'endless' ? 1 + s.endlessCycle * 0.5 : 1);
                fe.x = W / 2 + j * 55; fe.y = -30; fe.vx = j * 0.6; fe.vy = fe.baseSpeed;
                enemies.push(fe);
              }
            } else if (fType === 1) {
              for (let j = 0; j < 4; j++) {
                const fe = spawnEnemy(W, H, waveRef.current, s.gameMode === 'endless' ? 1 + s.endlessCycle * 0.5 : 1);
                fe.x = W * 0.2 + j * (W * 0.2); fe.y = -30; fe.vy = fe.baseSpeed;
                enemies.push(fe);
              }
            } else if (fType === 2) {
              for (let j = 0; j < 5; j++) {
                const fe = spawnEnemy(W, H, waveRef.current, s.gameMode === 'endless' ? 1 + s.endlessCycle * 0.5 : 1);
                const ang = (j / 5) * Math.PI * 2;
                fe.x = W / 2 + Math.cos(ang) * 60; fe.y = -30 + Math.sin(ang) * 30; fe.vy = fe.baseSpeed * 0.8;
                enemies.push(fe);
              }
            } else if (fType === 3) {
              for (let j = 0; j < 2; j++) {
                const fe = spawnEnemy(W, H, waveRef.current, s.gameMode === 'endless' ? 1 + s.endlessCycle * 0.5 : 1);
                fe.x = j === 0 ? -30 : W + 30; fe.y = 80 + Math.random() * (H * 0.2); fe.vx = j === 0 ? fe.baseSpeed : -fe.baseSpeed; fe.vy = 0.3;
                enemies.push(fe);
              }
              for (let j = 0; j < 2; j++) {
                const fe = spawnEnemy(W, H, waveRef.current, s.gameMode === 'endless' ? 1 + s.endlessCycle * 0.5 : 1);
                fe.x = W / 2 + (j === 0 ? -30 : 30); fe.y = -30; fe.vy = fe.baseSpeed;
                enemies.push(fe);
              }
            } else {
              for (let j = 0; j < 3; j++) {
                const fe = spawnEnemy(W, H, waveRef.current, s.gameMode === 'endless' ? 1 + s.endlessCycle * 0.5 : 1);
                fe.x = W / 2; fe.y = -30 - j * 35; fe.vy = fe.baseSpeed;
                enemies.push(fe);
              }
            }
          } else {
            const spawnCount = waveRef.current >= 5 ? (Math.random() < 0.35 ? 3 : Math.random() < 0.5 ? 2 : 1) : 1;
            for (let sp = 0; sp < spawnCount && enemies.length < maxOnScreen; sp++) {
              enemies.push(spawnEnemy(W, H, waveRef.current, s.gameMode === 'endless' ? 1 + s.endlessCycle * 0.5 : 1));
            }
          }
          s.spawnInterval = Math.max(28, 80 - waveRef.current * 5);
        }
      }

      s.crateTimer++;
      if (s.crateTimer >= s.crateInterval) {
        s.crateTimer = 0;
        crates.push(spawnCrate(W));
        s.crateInterval = 380 + Math.random() * 120;
      }

      for (let i = crates.length - 1; i >= 0; i--) {
        const c = crates[i];
        c.y += c.vy;
        c.wobble += 0.03;
        if (c.y > H + CRATE_H) { crates.splice(i, 1); continue; }
        if (
          Math.abs(c.x - player.x) < (CRATE_W / 2 + SHIP_W / 2) &&
          Math.abs(c.y - player.y) < (CRATE_H / 2 + SHIP_H / 2)
        ) {
          if (c.type === 'BOMB') {
            enemyBullets.length = 0;
            for (const en of s.enemies) { en.hp -= 3; if (en.hp <= 0) en.alive = false; }
            if (s.bossActive && s.boss && s.boss.alive) { s.boss.hp -= 3; s.boss.flash = 10; }
            if (s.miniBossActive && s.miniBoss && s.miniBoss.alive) { s.miniBoss.hp -= 3; s.miniBoss.flash = 10; }
            s.shakeX = 8; s.shakeY = 8; s.shakeDecay = 0.9;
            explosions.push(...createExplosion(c.x, c.y, 20));
          } else {
            const tierMult = c.tier === 'mega' ? 2 : c.tier === 'enhanced' ? 1.5 : 1;
            const baseDur = c.type === 'GHOST' ? GHOST_DURATION : c.type === 'BEAM' ? BEAM_DURATION : c.type === 'MAGNET' ? MAGNET_DURATION : c.type === 'SCORE2X' ? SCORE2X_DURATION : POWERUP_DURATION;
            s.powerUps[c.type] = Math.floor(baseDur * tierMult);
            if (c.tier === 'mega') {
              enemyBullets.length = 0;
              for (const en of s.enemies) { en.hp -= 1; if (en.hp <= 0) en.alive = false; }
              s.shakeX = 5; s.shakeY = 5; s.shakeDecay = 0.9;
            }
          }
          if (c.type === 'SHIELD') player.invincible = POWERUP_DURATION;
          if (c.type === 'GHOST') player.invincible = GHOST_DURATION;
          s.floatingTexts.push({ x: c.x, y: c.y, text: c.type === 'BOMB' ? '💥 BOMB!' : PU[c.type].label, color: c.type === 'BOMB' ? '#f59e0b' : PU[c.type].color, life: 60, vy: -1.2 });
          s.runStats.powerUpsCollected++;
          explosions.push(...createExplosion(c.x, c.y, 8));
          crates.splice(i, 1);
          if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health, s.combo);
          continue;
        }
      }

      for (let i = s.lifePickups.length - 1; i >= 0; i--) {
        const lp = s.lifePickups[i];
        lp.y += lp.vy;
        lp.wobble += 0.04;
        if (lp.y > H + 20) { s.lifePickups.splice(i, 1); continue; }
        if (
          Math.abs(lp.x - player.x) < (16 + SHIP_W / 2) &&
          Math.abs(lp.y - player.y) < (16 + SHIP_H / 2)
        ) {
          if (player.health < MAX_HEALTH) player.health++;
          else if (livesRef.current < MAX_LIVES) livesRef.current++;
          explosions.push(...createExplosion(lp.x, lp.y, 10));
          s.lifePickups.splice(i, 1);
          if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health, s.combo);
          continue;
        }
      }

      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (!e.alive) {
          explosions.push(...createExplosion(e.x, e.y, 14, e.color));
          enemies.splice(i, 1);
          continue;
        }
        e.timer++;
        const slowMult = s.abilities.slowActive > 0 ? 0.3 : 1;
        if (e.move === 'sine') {
          e.vx = Math.sin(e.timer * 0.06) * e.baseSpeed * 0.8;
        } else if (e.move === 'chase') {
          const dx = player.x - e.x;
          e.vx += dx * 0.0025;
          e.vx = Math.max(-e.baseSpeed * 0.9, Math.min(e.baseSpeed * 0.9, e.vx));
        } else if (e.move === 'zigzag') {
          if (e.timer % 90 === 0) e.vx *= -1;
        } else if (e.move === 'dash') {
          if (e.y < H * 0.4) { e.vy = e.baseSpeed * 0.4; }
          else { e.vy = e.baseSpeed * 1.8; if (e.power === 'speed_boost') e.vx = Math.sin(e.timer * 0.1) * 2; }
        } else if (e.move === 'wobble') {
          e.vx = Math.sin(e.timer * 0.12) * 2;
          e.vy = e.baseSpeed * 0.85;
        } else if (e.move === 'strafe') {
          if (e.y < H * 0.15) { e.vy = e.baseSpeed * 0.6; e.vx = 0; }
          else { e.vy = 0; e.vx = Math.sin(e.timer * 0.04) * e.baseSpeed * 1.4; }
        } else if (e.move === 'orbit') {
          if (!e.orbitCX) {
            e.orbitCX = e.x;
            e.orbitCY = Math.min(H * 0.35, e.y);
            e.orbitR = 50 + Math.random() * 60;
            e.orbitSpeed = 0.025 + Math.random() * 0.015;
            e.vy = 0;
          }
          const ang = e.timer * e.orbitSpeed;
          e.x = e.orbitCX + Math.cos(ang) * e.orbitR;
          e.y = e.orbitCY + Math.sin(ang) * e.orbitR * 0.5;
          e.vx = 0;
        } else if (e.move === 'flank') {
          const targetX = player.x + (e.x > player.x ? 120 : -120);
          const dxFlank = targetX - e.x;
          e.vx += dxFlank * 0.003;
          e.vx = Math.max(-e.baseSpeed, Math.min(e.baseSpeed, e.vx));
          if (e.y < H * 0.2) e.vy = e.baseSpeed * 0.5;
          else if (e.y > H * 0.35) e.vy = -e.baseSpeed * 0.2;
        } else if (e.move === 'swarm') {
          let avgX = 0, avgY = 0, count = 0;
          for (const other of enemies) {
            if (other === e || !other.alive) continue;
            const d = Math.abs(other.x - e.x) + Math.abs(other.y - e.y);
            if (d < 120) { avgX += other.x; avgY += other.y; count++; }
          }
          if (count > 0) {
            avgX /= count; avgY /= count;
            e.vx += (avgX - e.x) * 0.0008;
            e.vy += (avgY - e.y) * 0.0008;
          }
          const dxSwarm = player.x - e.x;
          e.vx += dxSwarm * 0.0012;
          e.vx = Math.max(-e.baseSpeed * 0.9, Math.min(e.baseSpeed * 0.9, e.vx));
          e.vy = e.baseSpeed * 0.7;
        } else if (e.move === 'telegraph') {
          if (!e.telegraphState) { e.telegraphState = 'approach'; e.telegraphTimer = 0; }
          e.telegraphTimer++;
          if (e.telegraphState === 'approach') {
            if (e.y < H * 0.25) e.vy = e.baseSpeed * 0.4;
            else { e.vy = 0; e.telegraphState = 'charge'; e.telegraphTimer = 0; }
          } else if (e.telegraphState === 'charge') {
            if (e.telegraphTimer < 30) {
              e.vx = 0; e.vy = 0;
              e.flash = 1;
            } else {
              const dxTG = player.x - e.x;
              const distTG = Math.sqrt(dxTG * dxTG + (player.y - e.y) * (player.y - e.y)) || 1;
              e.vx = (dxTG / distTG) * e.baseSpeed * 2.5;
              e.vy = ((player.y - e.y) / distTG) * e.baseSpeed * 2.5;
              e.telegraphState = 'dash';
              e.telegraphTimer = 0;
            }
          } else if (e.telegraphState === 'dash') {
            if (e.telegraphTimer > 60) { e.telegraphState = 'approach'; e.telegraphTimer = 0; }
          }
        }
        if (e.power === 'teleport' && e.timer % 140 === 0) {
          e.x += (Math.random() - 0.5) * 85;
          e.x = Math.max(40, Math.min(W - 40, e.x));
          explosions.push(...createExplosion(e.x, e.y, 4));
        }
        if (e.power === 'cloaker') {
          e.cloaked = (e.timer % 200 > 140);
        }
        if (e.power === 'regen' && e.hp < e.maxHp && e.timer % 120 === 0) {
          e.hp = Math.min(e.maxHp, e.hp + 1);
        }
        if (e.power === 'tractor') {
          const dxTr = player.x - e.x;
          const dyTr = player.y - e.y;
          const distTr = Math.sqrt(dxTr * dxTr + dyTr * dyTr) || 1;
          if (distTr < 250) {
            player.x += (dxTr / distTr) * 0.6;
            player.y += (dyTr / distTr) * 0.3;
          }
        }
        if (e.power === 'clone' && e.hp <= 0 && !e.cloned && enemies.length < 35) {
          e.cloned = true;
          for (let j = 0; j < 2; j++) {
            enemies.push({ ...e, x: e.x + (j === 0 ? -18 : 18), y: e.y, hp: Math.max(1, Math.floor(e.maxHp * 0.5)), maxHp: Math.max(1, Math.floor(e.maxHp * 0.5)), timer: 0, shootTimer: 60 + Math.random() * 100, shield: 0, alive: true, power: 'normal' });
          }
        }
        e.x += e.vx * slowMult;
        e.y += e.vy * slowMult;
        if (e.y > H + 60 || e.x < -120 || e.x > W + 120) { enemies.splice(i, 1); continue; }

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
            enemyBullets.push({ x: e.x, y: e.y - ENEMY_H / 2, vx: 0, vy: -ENEMY_BULLET_SPEED * 0.8 });
          } else if (e.power === 'suicide') {
            e.shootTimer = 99999;
          } else if (e.power === 'targeted') {
            const tSpeed = ENEMY_BULLET_SPEED * 1.6;
            enemyBullets.push({ x: e.x, y: e.y + ENEMY_H / 2, vx: (dx / dist) * tSpeed, vy: (dy / dist) * tSpeed });
          } else {
            enemyBullets.push({ x: e.x, y: e.y + ENEMY_H / 2, vx: (dx / dist) * ENEMY_BULLET_SPEED, vy: (dy / dist) * ENEMY_BULLET_SPEED });
          }
        }

        for (let b = bullets.length - 1; b >= 0; b--) {
          const bx = bullets[b].x, by = bullets[b].y;
          if (e.cloaked) continue;
          if (bx > e.x - ENEMY_W / 2 && bx < e.x + ENEMY_W / 2 && by > e.y - ENEMY_H / 2 && by < e.y + ENEMY_H / 2) {
            if (!overdriveActive) bullets.splice(b, 1);
            if (e.shield > 0) { e.shield--; explosions.push(...createExplosion(bx, by, 3)); break; }
            e.hp--;
            s.runStats.shotsHit++;
            explosions.push(...createExplosion(bx, by, 3));
            if (e.hp <= 0) {
              e.alive = false;
              if (e.power === 'splitter' && enemies.length < 35) {
                for (let j = 0; j < 2; j++) {
                  enemies.push({ name: 'Mini Swarmer', x: e.x + (j === 0 ? -15 : 15), y: e.y, vx: (j === 0 ? -1.2 : 1.2) * (e.baseSpeed * 0.8), vy: e.vy * 1.1, baseSpeed: e.baseSpeed, hp: 1, maxHp: 1, color: '#a855f7', shape: 'tri', move: 'sine', power: 'normal', timer: 0, shootTimer: 45 + Math.random() * 90, shield: 0, alive: true });
                }
              } else if (e.power === 'bomb') {
                for (let j = 0; j < 6; j++) {
                  const ang = (Math.PI * 2 / 6) * j;
                  enemyBullets.push({ x: e.x, y: e.y, vx: Math.cos(ang) * ENEMY_BULLET_SPEED * 0.85, vy: Math.sin(ang) * ENEMY_BULLET_SPEED * 0.85 });
                }
              }
              const comboMultiplier = Math.min(COMBO_MAX, 1 + s.combo);
              const scoreMultiplier = s.powerUps.SCORE2X > 0 ? 2 : 1;
              const scoreGain = e.maxHp * 15 * comboMultiplier * scoreMultiplier;
              scoreRef.current += scoreGain;
              lsSetBest(scoreRef.current);
              bestRef.current = lsGetBest();
              s.combo++;
              s.comboTimer = COMBO_TIMEOUT;
              s.waveKills = (s.waveKills || 0) + 1;
              s.runStats.kills++;
              if (s.combo > s.runStats.highestCombo) s.runStats.highestCombo = s.combo;
              s.shakeX = 3; s.shakeY = 3; s.shakeDecay = 0.85;
              const comboText = comboMultiplier > 1 ? ` ×${comboMultiplier}` : '';
              s.floatingTexts.push({ x: e.x, y: e.y, text: `+${scoreGain}${comboText}`, color: comboMultiplier >= 5 ? '#ff4444' : comboMultiplier >= 4 ? '#ff8800' : comboMultiplier >= 3 ? '#ffcc00' : comboMultiplier >= 2 ? '#ffffff' : 'rgba(255,255,255,0.7)', life: 50, vy: -1.5 });
              for (let pi = 0; pi < 4; pi++) {
                const pa = Math.random() * Math.PI * 2;
                const ps = 1 + Math.random() * 2;
                s.particles.push({ x: e.x, y: e.y, vx: Math.cos(pa) * ps, vy: Math.sin(pa) * ps, life: 1, decay: 0.03 + Math.random() * 0.02, r: 1.5 + Math.random() * 1.5, color: e.color });
              }
              s.miniBossKillCount++;
              if (s.miniBossKillCount >= 30 && !s.miniBossActive && !s.bossActive) {
                s.miniBoss = spawnMiniBoss(W, waveRef.current);
                s.miniBossActive = true;
                s.miniBossKillCount = 0;
                bannerRef.current = { text: `💀 ${s.miniBoss.name} APPROACHES`, color: s.miniBoss.color, timer: 150 };
              }
              if (Math.random() < LIFE_DROP_CHANCE && (livesRef.current < MAX_LIVES || player.health < MAX_HEALTH)) {
                s.lifePickups.push({ x: e.x, y: e.y, vy: 1.2 + Math.random() * 0.5, wobble: Math.random() * Math.PI * 2, alive: true });
              }
              if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health, s.combo);
            }
            break;
          }
        }
      }

      for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const eb = enemyBullets[i];
        eb.prevX = eb.x; eb.prevY = eb.y;
        const ebslow = s.abilities.slowActive > 0 ? 0.3 : 1;
        eb.x += eb.vx * ebslow; eb.y += eb.vy * ebslow;
        if (eb.y > H + 20 || eb.x < -20 || eb.x > W + 20 || eb.y < -20) { enemyBullets.splice(i, 1); continue; }
        const shielded = s.powerUps.SHIELD > 0 || s.powerUps.GHOST > 0;
        if (player.invincible <= 0 && !shielded && Math.abs(eb.x - player.x) < SHIP_W / 2 - 4 && Math.abs(eb.y - player.y) < SHIP_H / 2 - 4) {
          enemyBullets.splice(i, 1);
          s.combo = 0; s.comboTimer = 0;
          s.shakeX = 5; s.shakeY = 5; s.shakeDecay = 0.85;
          player.invincible = 90; player.flash = 18;
          player.health--;
          if (player.health <= 0) {
            livesRef.current--;
            player.health = MAX_HEALTH;
            s.deathPieces = [];
            for (let dp = 0; dp < 5; dp++) {
              const angle = (dp / 5) * Math.PI * 2 + Math.random() * 0.5;
              s.deathPieces.push({ x: player.x, y: player.y, vx: Math.cos(angle) * (1.5 + Math.random() * 2), vy: Math.sin(angle) * (1.5 + Math.random() * 2), rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.15, life: 1, decay: 0.007 });
            }
            s.deathTimer = 90;
          }
          explosions.push(...createExplosion(player.x, player.y, 8));
          if (livesRef.current <= 0) { gameStatusRef.current = 'gameover'; s.runStats.highScore = scoreRef.current; saveRunStats(s.runStats); lsSetBest(scoreRef.current); lsClearSave(); bestRef.current = lsGetBest(); if (msgRef.current) msgRef.current.show('gameover'); }
          if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health, s.combo);
        }
      }

      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (!e.alive || e.cloaked) continue;
        const shielded = s.powerUps.SHIELD > 0 || s.powerUps.GHOST > 0;
        if (player.invincible <= 0 && !shielded && Math.abs(e.x - player.x) < (SHIP_W + ENEMY_W) / 2 - 6 && Math.abs(e.y - player.y) < (SHIP_H + ENEMY_H) / 2 - 6) {
          e.alive = false;
          s.combo = 0; s.comboTimer = 0;
          s.shakeX = 5; s.shakeY = 5; s.shakeDecay = 0.85;
          player.invincible = 90; player.flash = 18;
          player.health--;
          if (player.health <= 0) {
            livesRef.current--;
            player.health = MAX_HEALTH;
            s.deathPieces = [];
            for (let dp = 0; dp < 5; dp++) {
              const angle = (dp / 5) * Math.PI * 2 + Math.random() * 0.5;
              s.deathPieces.push({ x: player.x, y: player.y, vx: Math.cos(angle) * (1.5 + Math.random() * 2), vy: Math.sin(angle) * (1.5 + Math.random() * 2), rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.15, life: 1, decay: 0.007 });
            }
            s.deathTimer = 90;
          }
          explosions.push(...createExplosion(player.x, player.y, 8));
          if (livesRef.current <= 0) { gameStatusRef.current = 'gameover'; s.runStats.highScore = scoreRef.current; saveRunStats(s.runStats); lsSetBest(scoreRef.current); lsClearSave(); bestRef.current = lsGetBest(); if (msgRef.current) msgRef.current.show('gameover'); }
          if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health, s.combo);
        }
      }

      if (s.bossActive && s.boss) {
        const boss = s.boss;
        if (!boss.alive) {
          s.shakeX = 10; s.shakeY = 10; s.shakeDecay = 0.88;
          s.screenFlash = 10;
          explosions.push(...createExplosion(boss.x, boss.y, 20, boss.color));
          for (let i = 0; i < 2; i++) explosions.push(...createExplosion(boss.x + (Math.random() - 0.5) * boss.W, boss.y + (Math.random() - 0.5) * boss.H, 8, boss.color));
          scoreRef.current += boss.score * (s.powerUps.SCORE2X > 0 ? 2 : 1);
          lsSetBest(scoreRef.current);
          bestRef.current = lsGetBest();
          s.runStats.bossesKilled++;
          s.boss = null; s.bossActive = false;

          if (levelRef.current >= 35 && s.gameMode === 'normal') {
            gameStatusRef.current = 'victory';
            s.runStats.highScore = scoreRef.current;
            saveRunStats(s.runStats);
            lsSetBest(scoreRef.current);
            lsClearSave();
            bestRef.current = lsGetBest();
            if (msgRef.current) msgRef.current.show('victory');
            rafRef.current = requestAnimationFrame(loop);
            return;
          }

          if (s.gameMode === 'bossrush') {
            s.bossRushIndex = (s.bossRushIndex + 1) % BOSS_DEFS.length;
          }
          if (s.gameMode === 'endless' && levelRef.current >= 35) {
            s.endlessCycle++;
          }

          s.intermission = { timer: 120, level: levelRef.current, kills: s.waveKills || 0 };
          crates.push({ x: boss.x - 20, y: boss.y, vy: 1, wobble: 0, type: PU_KEYS[Math.floor(Math.random() * PU_KEYS.length)] });
          crates.push({ x: boss.x + 20, y: boss.y, vy: 1, wobble: Math.PI, type: PU_KEYS[Math.floor(Math.random() * PU_KEYS.length)] });
          if (levelRef.current % 3 === 0) {
            const hTypes = ['asteroid_storm', 'black_hole', 'solar_flare'];
            s.hazard = { type: hTypes[Math.floor(Math.random() * hTypes.length)], timer: 600, x: W / 2, y: H * 0.35, phase: 0 };
          }
          levelRef.current++; waveRef.current++;
          s.spawnInterval = Math.max(28, 80 - waveRef.current * 5);
          s.waveKillTarget = 8 + waveRef.current * 2;
          s.enemiesKilled = 0;
          s.waveKills = 0;
          if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health, s.combo);
        } else {
          boss.timer++;
          if (boss.flash > 0) boss.flash--;
          if (boss.entering) {
            boss.y += 2.5 * (s.abilities.slowActive > 0 ? 0.3 : 1);
            if (boss.y >= 130) boss.entering = false;
          } else {
            if (boss.move === 'sweep') { boss.x += boss.vx; if (boss.x > W - boss.W / 2 - 20 || boss.x < boss.W / 2 + 20) boss.vx *= -1; boss.y = 130 + 20 * Math.sin(boss.timer * 0.015); }
            else if (boss.move === 'sine') { const spd = boss.phase === 2 ? 1.5 : 1; boss.x = W / 2 + (W * 0.38) * Math.sin(boss.timer * 0.018 * spd); boss.y = 140 + 40 * Math.sin(boss.timer * 0.025); }
            else if (boss.move === 'figure8') { const spd = boss.phase === 2 ? 1.4 : 1; boss.x = W / 2 + (W * 0.35) * Math.sin(boss.timer * 0.02 * spd); boss.y = 140 + 55 * Math.sin(boss.timer * 0.04 * spd); }
            else if (boss.move === 'butterfly') { const spd = boss.phase === 2 ? 1.3 : 1; boss.x = W / 2 + (W * 0.38) * Math.sin(boss.timer * 0.022 * spd); boss.y = 150 + 60 * Math.cos(boss.timer * 0.044 * spd); }
            else if (boss.move === 'bounce') { const spd = boss.phase === 2 ? 1.4 : 1; boss.x += boss.vx * spd; boss.y += boss.vy * spd; if (boss.x > W - boss.W / 2 - 20 || boss.x < boss.W / 2 + 20) boss.vx *= -1; if (boss.y > 240 || boss.y < 120) boss.vy *= -1; }
            else if (boss.move === 'circle') { const spd = boss.phase === 2 ? 1.3 : 1; const radius = Math.min(W * 0.25, 120); boss.x = W / 2 + radius * Math.cos(boss.timer * 0.015 * spd); boss.y = 160 + radius * 0.5 * Math.sin(boss.timer * 0.015 * spd); }
            else { const spd = boss.phase === 2 ? 1.3 : 1; boss.x = W / 2 + (W * 0.3) * Math.sin(boss.timer * 0.012); boss.y = 160 + 90 * Math.sin(boss.timer * 0.03 * spd); }
            if (boss.hp <= boss.maxHp / 2 && boss.phase === 1) {
              boss.phase = 2;
              boss.flash = 18;
              s.screenFlash = 8;
              s.shakeX = 6; s.shakeY = 6; s.shakeDecay = 0.85;
              bannerRef.current = { text: `! ${boss.name} — PHASE 2 !`, color: '#ff2222', timer: 120 };
            }
          }
          if (!boss.entering && boss.shape === 'carrier' && boss.timer % 600 === 0 && enemies.length < 6) {
            for (let j = -1; j <= 1; j += 2) {
              enemies.push({ name: 'Scout Drone', x: boss.x + j * 30, y: boss.y + boss.H / 2, vx: j * 1.5, vy: 2, baseSpeed: 2, hp: 1, maxHp: 1, color: boss.color, shape: 'tri', move: 'straight', power: 'normal', timer: 0, shootTimer: 80 + Math.random() * 60, shield: 0, alive: true });
            }
          }
          if (!boss.entering) {
            const shootRate = boss.phase === 2 ? 35 : 65;
            boss.shootTimer--;
            if (boss.shootTimer <= 0) {
              boss.shootTimer = shootRate;
              const bspd = ENEMY_BULLET_SPEED + boss.tier * 0.5;
              if (boss.attack === 'spread') { const shots = boss.phase === 2 ? 5 : 3; for (let i = 0; i < shots; i++) { const ang = (Math.PI / 2) + (i - (shots - 1) / 2) * 0.28; enemyBullets.push({ x: boss.x, y: boss.y + boss.H / 2, vx: Math.cos(ang) * bspd, vy: Math.sin(ang) * bspd }); } }
              else if (boss.attack === 'burst') { const dx = player.x - boss.x, dy = player.y - boss.y; const dist = Math.sqrt(dx * dx + dy * dy) || 1; const shots = boss.phase === 2 ? 5 : 3; for (let i = 0; i < shots; i++) { const spread = (Math.random() - 0.5) * 0.4; enemyBullets.push({ x: boss.x, y: boss.y + boss.H / 2, vx: (dx / dist) * bspd + spread, vy: (dy / dist) * bspd + spread }); } }
              else if (boss.attack === 'spiral') { const spiralCount = boss.phase === 2 ? 8 : 6; for (let i = 0; i < spiralCount; i++) { const ang = (boss.timer * 0.06) + (i / spiralCount) * Math.PI * 2; enemyBullets.push({ x: boss.x, y: boss.y, vx: Math.cos(ang) * bspd, vy: Math.sin(ang) * bspd }); } if (boss.phase === 2) { const dx = player.x - boss.x, dy = player.y - boss.y; const dist = Math.sqrt(dx * dx + dy * dy) || 1; enemyBullets.push({ x: boss.x, y: boss.y, vx: (dx / dist) * bspd * 1.4, vy: (dy / dist) * bspd * 1.4 }); } }
              else if (boss.attack === 'pods') { enemyBullets.push({ x: boss.x - 20, y: boss.y + boss.H / 4, vx: 0, vy: bspd }); enemyBullets.push({ x: boss.x + 20, y: boss.y + boss.H / 4, vx: 0, vy: bspd }); if (boss.phase === 2) { for (let i = 0; i < 8; i++) { const ang = (i / 8) * Math.PI * 2; enemyBullets.push({ x: boss.x, y: boss.y, vx: Math.cos(ang) * bspd * 0.9, vy: Math.sin(ang) * bspd * 0.9 }); } } }
              else if (boss.attack === 'sweep') { const sweepCount = boss.phase === 2 ? 6 : 4; const baseAng = (Math.PI / 2) + Math.sin(boss.timer * 0.07) * 0.5; for (let i = 0; i < sweepCount; i++) { const ang = baseAng + (i - (sweepCount - 1) / 2) * 0.15; enemyBullets.push({ x: boss.x, y: boss.y + boss.H / 2, vx: Math.cos(ang) * bspd, vy: Math.sin(ang) * bspd }); } if (boss.phase === 2 && boss.timer % 2 === 0) { enemyBullets.push({ x: boss.x - 10, y: boss.y + boss.H / 2, vx: 0, vy: bspd * 1.3 }); enemyBullets.push({ x: boss.x + 10, y: boss.y + boss.H / 2, vx: 0, vy: bspd * 1.3 }); } }
              else if (boss.attack === 'ring') { const ringCount = boss.phase === 2 ? 16 : 10; for (let i = 0; i < ringCount; i++) { const ang = (i / ringCount) * Math.PI * 2; enemyBullets.push({ x: boss.x, y: boss.y, vx: Math.cos(ang) * bspd * 0.85, vy: Math.sin(ang) * bspd * 0.85 }); } }
              else if (boss.attack === 'targeted') { const dx = player.x - boss.x, dy = player.y - boss.y; const dist = Math.sqrt(dx * dx + dy * dy) || 1; enemyBullets.push({ x: boss.x, y: boss.y + boss.H / 2, vx: (dx / dist) * bspd * 1.5, vy: (dy / dist) * bspd * 1.5 }); if (boss.phase === 2) { enemyBullets.push({ x: boss.x - 15, y: boss.y, vx: (dx / dist) * bspd * 1.3, vy: (dy / dist) * bspd * 1.3 }); enemyBullets.push({ x: boss.x + 15, y: boss.y, vx: (dx / dist) * bspd * 1.3, vy: (dy / dist) * bspd * 1.3 }); } }
              else { const streams = boss.phase === 2 ? 6 : 4; for (let i = 0; i < streams; i++) { const bx = boss.x - boss.W / 2 + (i / (streams - 1)) * boss.W; enemyBullets.push({ x: bx, y: boss.y + boss.H / 2, vx: 0, vy: bspd * 0.95 }); } }
            }
          }
          for (let b = bullets.length - 1; b >= 0; b--) {
            const bx = bullets[b].x, by = bullets[b].y;
            if (bx > boss.x - boss.W / 2 && bx < boss.x + boss.W / 2 && by > boss.y - boss.H / 2 && by < boss.y + boss.H / 2) {
              bullets.splice(b, 1); boss.hp--; boss.flash = 6;
              s.shakeX = 2; s.shakeY = 2; s.shakeDecay = 0.88;
              s.floatingTexts.push({ x: bx, y: by, text: '-1', color: '#ff4444', life: 30, vy: -1 });
              for (let pi = 0; pi < 2; pi++) {
                const pa = Math.random() * Math.PI * 2;
                s.particles.push({ x: bx, y: by, vx: Math.cos(pa) * (1 + Math.random() * 2), vy: Math.sin(pa) * (1 + Math.random() * 2), life: 1, decay: 0.04 + Math.random() * 0.03, r: 1.5 + Math.random() * 2, color: boss.color });
              }
              if (boss.hp <= 0) boss.alive = false;
              if (boss.hp % 5 === 0 || boss.hp <= 0) {
                if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health, s.combo);
              }
              break;
            }
          }
          const bossShielded = s.powerUps.SHIELD > 0 || s.powerUps.GHOST > 0;
          if (player.invincible <= 0 && !bossShielded && boss.alive && Math.abs(boss.x - player.x) < (boss.W + SHIP_W) / 2 - 10 && Math.abs(boss.y - player.y) < (boss.H + SHIP_H) / 2 - 10) {
          s.combo = 0; s.comboTimer = 0;
          s.shakeX = 5; s.shakeY = 5; s.shakeDecay = 0.85;
          player.invincible = 90; player.flash = 18;
          player.health--;
          s.runStats.damageTaken++;
          s.noDamageHits++;
          if (player.health <= 0) {
            livesRef.current--;
            player.health = MAX_HEALTH;
            s.runStats.deaths++;
            s.noDamageHits = 0;
            s.deathPieces = [];
            for (let dp = 0; dp < 5; dp++) {
              const angle = (dp / 5) * Math.PI * 2 + Math.random() * 0.5;
              s.deathPieces.push({ x: player.x, y: player.y, vx: Math.cos(angle) * (1.5 + Math.random() * 2), vy: Math.sin(angle) * (1.5 + Math.random() * 2), rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.15, life: 1, decay: 0.007 });
            }
            s.deathTimer = 90;
          }
          explosions.push(...createExplosion(player.x, player.y, 8));
          if (livesRef.current <= 0) { gameStatusRef.current = 'gameover'; s.runStats.highScore = scoreRef.current; saveRunStats(s.runStats); lsSetBest(scoreRef.current); lsClearSave(); bestRef.current = lsGetBest(); if (msgRef.current) msgRef.current.show('gameover'); }
            if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health, s.combo);
          }
        }
      }

      if (s.miniBossActive && s.miniBoss) {
        const mb = s.miniBoss;
        if (!mb.alive) {
          s.shakeX = 7; s.shakeY = 7; s.shakeDecay = 0.86;
          s.screenFlash = 7;
          explosions.push(...createExplosion(mb.x, mb.y, 16, mb.color));
          for (let i = 0; i < 2; i++) explosions.push(...createExplosion(mb.x + (Math.random() - 0.5) * mb.W, mb.y + (Math.random() - 0.5) * mb.H, 6, mb.color));
          scoreRef.current += mb.score * (s.powerUps.SCORE2X > 0 ? 2 : 1);
          lsSetBest(scoreRef.current);
          bestRef.current = lsGetBest();
          s.runStats.miniBossesKilled++;
          s.miniBoss = null; s.miniBossActive = false;
          bannerRef.current = { text: `✦ ${mb.name} DESTROYED`, color: '#00ff88', timer: 120 };
          crates.push({ x: mb.x, y: mb.y, vy: 1, wobble: 0, type: PU_KEYS[Math.floor(Math.random() * PU_KEYS.length)] });
          if (Math.random() < 0.4) {
            s.lifePickups.push({ x: mb.x, y: mb.y, vy: 1.2, wobble: Math.random() * Math.PI * 2, alive: true });
          }
          if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health, s.combo);
        } else {
          mb.timer++;
          if (mb.flash > 0) mb.flash--;
          if (mb.entering) {
            mb.y += 2;
            if (mb.y >= 120) { mb.entering = false; mb.wanderTX = W / 2; mb.wanderTY = H * 0.4; mb.wanderTimer = 0; }
          } else {
            const spd = mb.hp <= mb.maxHp * 0.5 ? 1.3 : 1;
            mb.wanderTimer = (mb.wanderTimer || 0) + 1;
            if (!mb.wanderTX || mb.wanderTimer > 120 + Math.random() * 100) {
              mb.wanderTX = 60 + Math.random() * (W - 120);
              mb.wanderTY = 60 + Math.random() * (H * 0.65);
              mb.wanderTimer = 0;
            }
            const dwx = mb.wanderTX - mb.x;
            const dwy = mb.wanderTY - mb.y;
            const dwDist = Math.sqrt(dwx * dwx + dwy * dwy) || 1;
            const moveSpeed = 0.8 * spd;
            mb.vx = (dwx / dwDist) * moveSpeed;
            mb.vy = (dwy / dwDist) * moveSpeed;
            mb.x += mb.vx;
            mb.y += mb.vy;
            mb.x = Math.max(mb.W / 2 + 10, Math.min(W - mb.W / 2 - 10, mb.x));
            mb.y = Math.max(50, Math.min(H * 0.72, mb.y));
          }
          if (mb.hp <= mb.maxHp * 0.5 && mb.phase === 1) {
            mb.phase = 2;
            mb.flash = 15;
            s.screenFlash = 6;
            s.shakeX = 4; s.shakeY = 4; s.shakeDecay = 0.85;
            bannerRef.current = { text: `! ${mb.name} ENRAGES !`, color: '#ff2222', timer: 100 };
          }
          if (!mb.entering) {
            const shootRate = mb.phase === 2 ? 30 : 55;
            mb.shootTimer--;
            if (mb.shootTimer <= 0) {
              mb.shootTimer = shootRate;
              const bspd = ENEMY_BULLET_SPEED * 1.1;
              if (mb.attack === 'spread') {
                const shots = mb.phase === 2 ? 5 : 3;
                for (let i = 0; i < shots; i++) {
                  const ang = (Math.PI / 2) + (i - (shots - 1) / 2) * 0.3;
                  enemyBullets.push({ x: mb.x, y: mb.y + mb.H / 2, vx: Math.cos(ang) * bspd, vy: Math.sin(ang) * bspd });
                }
              } else if (mb.attack === 'spiral') {
                const count = mb.phase === 2 ? 8 : 5;
                for (let i = 0; i < count; i++) {
                  const ang = (mb.timer * 0.07) + (i / count) * Math.PI * 2;
                  enemyBullets.push({ x: mb.x, y: mb.y, vx: Math.cos(ang) * bspd, vy: Math.sin(ang) * bspd });
                }
              } else if (mb.attack === 'burst') {
                const dx = player.x - mb.x, dy = player.y - mb.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const shots = mb.phase === 2 ? 5 : 3;
                for (let i = 0; i < shots; i++) {
                  const spread = (Math.random() - 0.5) * 0.5;
                  enemyBullets.push({ x: mb.x, y: mb.y + mb.H / 2, vx: (dx / dist) * bspd + spread, vy: (dy / dist) * bspd + spread });
                }
              } else if (mb.attack === 'ring') {
                const count = mb.phase === 2 ? 12 : 8;
                for (let i = 0; i < count; i++) {
                  const ang = (i / count) * Math.PI * 2;
                  enemyBullets.push({ x: mb.x, y: mb.y, vx: Math.cos(ang) * bspd * 0.9, vy: Math.sin(ang) * bspd * 0.9 });
                }
              } else if (mb.attack === 'sweep') {
                const count = mb.phase === 2 ? 6 : 4;
                const baseAng = (Math.PI / 2) + Math.sin(mb.timer * 0.08) * 0.6;
                for (let i = 0; i < count; i++) {
                  const ang = baseAng + (i - (count - 1) / 2) * 0.18;
                  enemyBullets.push({ x: mb.x, y: mb.y + mb.H / 2, vx: Math.cos(ang) * bspd, vy: Math.sin(ang) * bspd });
                }
              } else if (mb.attack === 'targeted') {
                const dx = player.x - mb.x, dy = player.y - mb.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const tSpd = bspd * 1.4;
                enemyBullets.push({ x: mb.x, y: mb.y + mb.H / 2, vx: (dx / dist) * tSpd, vy: (dy / dist) * tSpd });
                if (mb.phase === 2) {
                  enemyBullets.push({ x: mb.x - 12, y: mb.y, vx: (dx / dist) * tSpd * 0.9, vy: (dy / dist) * tSpd * 0.9 });
                  enemyBullets.push({ x: mb.x + 12, y: mb.y, vx: (dx / dist) * tSpd * 0.9, vy: (dy / dist) * tSpd * 0.9 });
                }
              }
            }
          }

          for (let b = bullets.length - 1; b >= 0; b--) {
            const bx = bullets[b].x, by = bullets[b].y;
            if (bx > mb.x - mb.W / 2 && bx < mb.x + mb.W / 2 && by > mb.y - mb.H / 2 && by < mb.y + mb.H / 2) {
              bullets.splice(b, 1); mb.hp--; mb.flash = 6;
              s.shakeX = 2; s.shakeY = 2; s.shakeDecay = 0.88;
              s.floatingTexts.push({ x: bx, y: by, text: '-1', color: '#ff4444', life: 30, vy: -1 });
              if (Math.random() < 0.5) s.particles.push({ x: bx, y: by, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3, life: 1, decay: 0.05, r: 2, color: mb.color });
              if (mb.hp <= 0) mb.alive = false;
              break;
            }
          }

          const mbShielded = s.powerUps.SHIELD > 0 || s.powerUps.GHOST > 0;
          if (player.invincible <= 0 && !mbShielded && mb.alive && Math.abs(mb.x - player.x) < (mb.W + SHIP_W) / 2 - 8 && Math.abs(mb.y - player.y) < (mb.H + SHIP_H) / 2 - 8) {
            mb.alive = false;
            s.combo = 0; s.comboTimer = 0;
            s.shakeX = 6; s.shakeY = 6; s.shakeDecay = 0.85;
            player.invincible = 90; player.flash = 18;
            player.health--;
            if (player.health <= 0) {
              livesRef.current--;
              player.health = MAX_HEALTH;
              s.deathPieces = [];
              for (let dp = 0; dp < 5; dp++) {
                const angle = (dp / 5) * Math.PI * 2 + Math.random() * 0.5;
                s.deathPieces.push({ x: player.x, y: player.y, vx: Math.cos(angle) * (1.5 + Math.random() * 2), vy: Math.sin(angle) * (1.5 + Math.random() * 2), rot: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.15, life: 1, decay: 0.007 });
              }
              s.deathTimer = 90;
            }
            explosions.push(...createExplosion(player.x, player.y, 10));
            if (livesRef.current <= 0) { gameStatusRef.current = 'gameover'; s.runStats.highScore = scoreRef.current; saveRunStats(s.runStats); lsSetBest(scoreRef.current); lsClearSave(); bestRef.current = lsGetBest(); if (msgRef.current) msgRef.current.show('gameover'); }
            if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health, s.combo);
          }
        }
      }

      for (let i = explosions.length - 1; i >= 0; i--) {
        const ex = explosions[i];
        ex.x += ex.vx; ex.y += ex.vy;
        ex.vx *= 0.93; ex.vy *= 0.93;
        ex.life -= ex.decay;
        if (ex.life <= 0) explosions.splice(i, 1);
      }

      if (s.comboTimer > 0) { s.comboTimer--; if (s.comboTimer <= 0) s.combo = 0; }
      if (s.shakeDecay > 0) {
        s.shakeX *= s.shakeDecay; s.shakeY *= s.shakeDecay;
        if (Math.abs(s.shakeX) < 0.2) s.shakeX = 0;
        if (Math.abs(s.shakeY) < 0.2) s.shakeY = 0;
      }

      for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
        const ft = s.floatingTexts[i];
        ft.y += ft.vy; ft.life--;
        if (ft.life <= 0) s.floatingTexts.splice(i, 1);
      }

      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.95; p.vy *= 0.95;
        p.life -= p.decay;
        if (p.life <= 0) s.particles.splice(i, 1);
      }

      if (s.powerUps.GHOST > 0 && s.powerUps.GHOST % 20 === 0) {
        s.particles.push({ x: player.x + (Math.random() - 0.5) * 16, y: player.y + (Math.random() - 0.5) * 16, vx: (Math.random() - 0.5) * 1.5, vy: -0.5 - Math.random(), life: 1, decay: 0.04, r: 2 + Math.random() * 2, color: '#a855f7' });
      }

      ctx.save();
      if (s.shakeX !== 0 || s.shakeY !== 0) {
        ctx.translate(Math.round(s.shakeX * (Math.random() - 0.5) * 2), Math.round(s.shakeY * (Math.random() - 0.5) * 2));
      }
      if (s.abilities.slowActive > 0) {
        ctx.fillStyle = 'rgba(6, 182, 212, 0.06)';
        ctx.fillRect(0, 0, W, H);
      }
      if (s.abilities.overdriveActive > 0) {
        ctx.fillStyle = `rgba(245, 158, 11, ${0.03 + 0.02 * Math.sin(Date.now() / 80)})`;
        ctx.fillRect(0, 0, W, H);
      }

      if (s.screenFlash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${s.screenFlash * 0.12})`;
        ctx.fillRect(0, 0, W, H);
        s.screenFlash--;
      }

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#000008';
      ctx.fillRect(0, 0, W, H);

      if (s.nebulae) {
        for (const n of s.nebulae) {
          n.y += n.speed;
          if (n.y - n.r > H + 50) { n.y = -n.r; n.x = Math.random() * W; }
          const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
          grad.addColorStop(0, n.color);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (s.shootingStars) {
        s.shootingStarTimer = (s.shootingStarTimer || 0) + 1;
        if (s.shootingStarTimer > 180 + Math.random() * 200 && s.shootingStars.length < 2) {
          s.shootingStars.push({ x: Math.random() * W, y: -10, vx: 3 + Math.random() * 4, vy: 5 + Math.random() * 4, life: 1, length: 30 + Math.random() * 30 });
          s.shootingStarTimer = 0;
        }
        for (let i = s.shootingStars.length - 1; i >= 0; i--) {
          const ss = s.shootingStars[i];
          ss.x += ss.vx; ss.y += ss.vy; ss.life -= 0.03;
          if (ss.life <= 0 || ss.y > H + 20) { s.shootingStars.splice(i, 1); continue; }
          ctx.save();
          ctx.globalAlpha = ss.life * 0.8;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(ss.x, ss.y);
          ctx.lineTo(ss.x - ss.vx * (ss.length / 8), ss.y - ss.vy * (ss.length / 8));
          ctx.stroke();
          ctx.globalAlpha = ss.life;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(ss.x, ss.y, 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        ctx.globalAlpha = star.opacity;
        if (star.glow > 0) { ctx.shadowColor = `hsla(${star.hue},${star.sat}%,80%,${star.opacity * 0.6})`; ctx.shadowBlur = star.glow; }
        ctx.fillStyle = `hsla(${star.hue},${star.sat}%,${star.sat > 0 ? 85 : 97}%,1)`;
        ctx.beginPath(); ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;

      s.asteroids.forEach(a => drawAsteroid(ctx, a, W, H));
      crates.forEach(c => drawCrate(ctx, c));
      s.lifePickups.forEach(lp => drawLifePickup(ctx, lp));

      enemyBullets.forEach(eb => {
        if (eb.prevX !== undefined) {
          ctx.strokeStyle = 'rgba(255, 120, 80, 0.25)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(eb.prevX, eb.prevY);
          ctx.lineTo(eb.x, eb.y);
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(255, 120, 80, 0.9)';
        ctx.shadowColor = '#ff7050';
        ctx.shadowBlur = 6;
        ctx.fillRect(eb.x - 1.5, eb.y - 5, 3, 10);
      });
      ctx.shadowBlur = 0;

      bullets.forEach(b => { if (b.beam) { ctx.fillStyle = '#ff6644'; ctx.shadowColor = '#ff4444'; ctx.shadowBlur = 10; ctx.fillRect(b.x - b.w / 2, b.y - 8, b.w, 16); ctx.fillStyle = '#ffffff'; ctx.fillRect(b.x - 1, b.y - 6, 2, 12); } else if (b.homing) drawMissile(ctx, b); else drawBullet(ctx, b); });
      ctx.shadowBlur = 0;

      enemies.forEach(e => drawEnemy(ctx, e));

      if (player.invincible <= 0 || Math.floor(player.invincible / (player.invincible < 20 ? 3 : 6)) % 2 === 0) {
        drawShip(ctx, player.x, player.y, player.flash > 0, s.powerUps.SHIELD > 0, player.vx, player.vy);
        if (player.invincible > 0 && player.invincible < 20) {
          ctx.save();
          ctx.globalAlpha = 0.25 + 0.15 * Math.sin(Date.now() / 40);
          ctx.fillStyle = '#ff2222';
          ctx.beginPath();
          ctx.arc(player.x, player.y, SHIP_W / 2 + 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      for (const dp of s.deathPieces) {
        if (dp.life <= 0) continue;
        ctx.save();
        ctx.globalAlpha = dp.life;
        ctx.translate(dp.x, dp.y);
        ctx.rotate(dp.rot);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(-6, 6);
        ctx.lineTo(0, 3);
        ctx.lineTo(6, 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      explosions.forEach(ex => {
        ctx.globalAlpha = ex.life * 0.85;
        if (ex.color) {
          ctx.fillStyle = ex.life > 0.5 ? ex.color : (ex.life > 0.25 ? 'rgba(255,200,100,0.8)' : 'rgba(255,255,255,0.3)');
          ctx.shadowColor = ex.color;
        } else {
          ctx.fillStyle = ex.life > 0.5 ? '#ffffff' : 'rgba(255,200,100,0.8)';
          ctx.shadowColor = '#ffffff';
        }
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(ex.x, ex.y, ex.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;

      if (s.bossActive && s.boss) { drawBoss(ctx, s.boss); drawBossHpBar(ctx, s.boss, W); }
      else { drawLevelTimer(ctx, s.levelTimer, LEVEL_DURATION, W); }

      if (s.miniBossActive && s.miniBoss) {
        drawMiniBoss(ctx, s.miniBoss);
        const mb = s.miniBoss;
        const mbPct = mb.hp / mb.maxHp;
        const mbBarW = Math.min(W * 0.35, 280);
        const mbBarH = 5;
        const mbBx = (W - mbBarW) / 2;
        const mbBy = 44;
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(mbBx, mbBy, mbBarW, mbBarH);
        const mbColor = mbPct > 0.6 ? '#ff4444' : mbPct > 0.3 ? '#ff8800' : '#ffcc00';
        ctx.fillStyle = mbColor;
        ctx.shadowColor = mbColor;
        ctx.shadowBlur = 6;
        ctx.fillRect(mbBx, mbBy, mbBarW * mbPct, mbBarH);
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = "bold 8px 'Courier New', monospace";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`💀 ${mb.name}${mb.phase === 2 ? ' — ENRAGED' : ''}`, W / 2, mbBy - 2);
      }

      if (bannerRef.current && bannerRef.current.timer > 0) {
        const bn = bannerRef.current;
        bn.timer--;
        const alpha = bn.timer > 120 ? 1 : bn.timer / 120;
        ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = 'rgba(0,0,8,0.72)'; ctx.fillRect(0, H / 2 - 36, W, 72);
        ctx.font = "bold 22px 'Courier New', monospace"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = bn.color; ctx.shadowColor = bn.color; ctx.shadowBlur = 24; ctx.fillText(bn.text, W / 2, H / 2); ctx.restore();
      }

      if (isMobile) {
        const joyR = 50, knobR = 18, joyX = joyR + 24, joyY = H - joyR - 24;
        ctx.save(); ctx.globalAlpha = 0.2; ctx.strokeStyle = '#00ffcc'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(joyX, joyY, joyR, 0, Math.PI * 2); ctx.stroke();
        if (s.touch.active) {
          const clampedDx = Math.max(-joyR, Math.min(joyR, s.touch.dx));
          const clampedDy = Math.max(-joyR, Math.min(joyR, s.touch.dy));
          ctx.globalAlpha = 0.45; ctx.fillStyle = '#00ffcc'; ctx.beginPath(); ctx.arc(joyX + clampedDx, joyY + clampedDy, knobR, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.globalAlpha = 0.25; ctx.fillStyle = '#00ffcc'; ctx.beginPath(); ctx.arc(joyX, joyY, knobR, 0, Math.PI * 2); ctx.fill();
        }

        const btnR = 22;
        const abY = H - btnR - 24;
        const abGap = btnR * 2 + 12;
        const abStartX = W - btnR - 24 - abGap * 2;
        const abilities = [
          { key: 'bomb', label: 'Q', color: '#f59e0b', cd: s.abilities.bombCD, maxCD: 900 },
          { key: 'slow', label: 'E', color: '#06b6d4', cd: s.abilities.slowCD, maxCD: 1200 },
          { key: 'overdrive', label: 'R', color: '#f59e0b', cd: s.abilities.overdriveCD, maxCD: 1500 },
        ];
        for (let ai = 0; ai < abilities.length; ai++) {
          const ab = abilities[ai];
          const bx = abStartX + ai * abGap;
          const pct = ab.cd > 0 ? ab.cd / ab.maxCD : 0;
          ctx.save();
          ctx.globalAlpha = pct > 0 ? 0.15 : 0.3;
          ctx.strokeStyle = ab.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(bx, abY, btnR, 0, Math.PI * 2);
          ctx.stroke();
          if (pct > 0) {
            ctx.globalAlpha = 0.1;
            ctx.fillStyle = ab.color;
            ctx.beginPath();
            ctx.arc(bx, abY, btnR, -Math.PI / 2, -Math.PI / 2 + (1 - pct) * Math.PI * 2);
            ctx.lineTo(bx, abY);
            ctx.fill();
          }
          ctx.globalAlpha = pct > 0 ? 0.25 : 0.6;
          ctx.font = "bold 13px 'Courier New', monospace";
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = ab.color;
          ctx.fillText(ab.label, bx, abY);
          if (pct > 0) {
            ctx.globalAlpha = 0.3;
            ctx.font = "7px 'Courier New', monospace";
            ctx.fillText(`${Math.ceil(ab.cd / 60)}s`, bx, abY + 13);
          }
          ctx.restore();
        }
        ctx.restore();
      }

      s.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      s.floatingTexts.forEach(ft => {
        ctx.globalAlpha = Math.min(1, ft.life / 15);
        ctx.font = `bold ${ft.life > 35 ? 14 : 11}px 'Courier New', monospace`;
        ctx.textAlign = 'center';
        ctx.fillStyle = ft.color;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 8;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.shadowBlur = 0;
      });
      ctx.globalAlpha = 1;

      if (s.combo >= 2) {
        const comboAlpha = s.comboTimer / COMBO_TIMEOUT;
        const comboScale = 1 + (s.combo >= 5 ? 0.15 * Math.sin(Date.now() / 100) : 0);
        const comboColor = s.combo >= 5 ? '#ff4444' : s.combo >= 4 ? '#ff8800' : s.combo >= 3 ? '#ffcc00' : '#ffffff';
        ctx.save();
        ctx.globalAlpha = 0.5 + comboAlpha * 0.5;
        ctx.font = `bold ${Math.round(22 * comboScale)}px 'Courier New', monospace`;
        ctx.textAlign = 'center';
        ctx.fillStyle = comboColor;
        ctx.shadowColor = comboColor;
        ctx.shadowBlur = 16;
        ctx.fillText(`${s.combo}× COMBO`, W / 2, 100);
        if (s.comboTimer > 0 && s.comboTimer < 30) {
          const warnAlpha = 0.3 + 0.5 * Math.abs(Math.sin(Date.now() / 50));
          ctx.strokeStyle = `rgba(255,40,40,${warnAlpha})`;
          ctx.lineWidth = 3;
          ctx.shadowColor = '#ff2828';
          ctx.shadowBlur = 12;
          const tw = ctx.measureText(`${s.combo}× COMBO`).width;
          ctx.strokeRect(W / 2 - tw / 2 - 12, 82, tw + 24, 32);
        }
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      if (s.powerUps.BEAM > 0 && (isMobile || (keys['Space'] || keys['KeyZ']))) {
        const beamW = 6;
        ctx.save();
        const beamGrad = ctx.createLinearGradient(player.x, 0, player.x, player.y - SHIP_H / 2);
        beamGrad.addColorStop(0, 'rgba(255,60,60,0)');
        beamGrad.addColorStop(0.3, 'rgba(255,120,60,0.8)');
        beamGrad.addColorStop(0.7, 'rgba(255,60,60,0.9)');
        beamGrad.addColorStop(1, '#ffffff');
        ctx.fillStyle = beamGrad;
        ctx.shadowColor = '#ff4444';
        ctx.shadowBlur = 16;
        ctx.fillRect(player.x - beamW / 2, 0, beamW, player.y - SHIP_H / 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(player.x - 1.5, 0, 3, player.y - SHIP_H / 2);
        ctx.shadowBlur = 0;
        ctx.restore();

        for (let i = enemies.length - 1; i >= 0; i--) {
          const e = enemies[i];
          if (!e.alive || e.cloaked) continue;
          if (Math.abs(e.x - player.x) < beamW / 2 + ENEMY_W / 2 && e.y < player.y) {
            e.hp -= 0.3;
            if (e.hp <= 0) e.alive = false;
          }
        }
      }

      if (s.powerUps.GHOST > 0) {
        ctx.save();
        ctx.globalAlpha = 0.2 + 0.05 * Math.sin(Date.now() / 80);
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(player.x, player.y, SHIP_W / 2 + 6, SHIP_H / 2 + 4, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      if (s.powerUps.MAGNET > 0) {
        ctx.save();
        ctx.globalAlpha = 0.12;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(player.x, player.y, 120, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        for (const c of crates) {
          const dxM = player.x - c.x, dyM = player.y - c.y;
          const distM = Math.sqrt(dxM * dxM + dyM * dyM);
          if (distM < 150) {
            c.x += (dxM / distM) * 2;
            c.y += (dyM / distM) * 2;
          }
        }
        for (const lp of s.lifePickups) {
          const dxM = player.x - lp.x, dyM = player.y - lp.y;
          const distM = Math.sqrt(dxM * dxM + dyM * dyM);
          if (distM < 150) {
            lp.x += (dxM / distM) * 2;
            lp.y += (dyM / distM) * 2;
          }
        }
      }

      if (s.hazard) {
        s.hazard.timer--;
        s.hazard.phase++;
        const h = s.hazard;
        if (h.timer <= 0) {
          s.hazard = null;
        } else {
          if (h.type === 'asteroid_storm') {
            if (h.phase % 12 === 0) {
              const side = Math.random() < 0.5 ? -30 : W + 30;
              const angle = Math.atan2(H * 0.8 - 0, side < 0 ? W * 0.5 : -W * 0.5);
              const spd = 3 + Math.random() * 3;
              const da = makeAsteroid(W, H, false);
              da.x = side; da.y = Math.random() * H * 0.3;
              da.vx = Math.cos(angle) * spd * (side < 0 ? 1 : -1);
              da.vy = Math.abs(Math.sin(angle)) * spd + 1;
              da.dangerous = true;
              if (s.asteroids.length < 60) s.asteroids.push(da);
            }
            if (h.phase % 60 === 0) {
              s.floatingTexts.push({ x: W / 2, y: 25, text: '☄ ASTEROID STORM', color: '#f97316', life: 60, vy: 0 });
            }
          } else if (h.type === 'black_hole') {
            h.x = W / 2 + Math.sin(h.phase * 0.008) * W * 0.15;
            h.y = H * 0.35 + Math.cos(h.phase * 0.006) * H * 0.1;
            const pullStrength = 0.4;
            const pullR = 180;
            for (const en of enemies) {
              const dxBH = h.x - en.x, dyBH = h.y - en.y;
              const distBH = Math.sqrt(dxBH * dxBH + dyBH * dyBH);
              if (distBH < pullR) {
                en.x += (dxBH / distBH) * pullStrength * (1 - distBH / pullR);
                en.y += (dyBH / distBH) * pullStrength * (1 - distBH / pullR);
              }
            }
            const dxBP = h.x - player.x, dyBP = h.y - player.y;
            const distBP = Math.sqrt(dxBP * dxBP + dyBP * dyBP);
            if (distBP < pullR) {
              player.x += (dxBP / distBP) * pullStrength * 0.3 * (1 - distBP / pullR);
              player.y += (dyBP / distBP) * pullStrength * 0.3 * (1 - distBP / pullR);
            }
            ctx.save();
            const bhGrad = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, pullR);
            bhGrad.addColorStop(0, 'rgba(80, 0, 120, 0.35)');
            bhGrad.addColorStop(0.4, 'rgba(40, 0, 80, 0.15)');
            bhGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = bhGrad;
            ctx.beginPath();
            ctx.arc(h.x, h.y, pullR, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = `rgba(140,60,200,${0.3 + 0.2 * Math.sin(h.phase * 0.05)})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(h.x, h.y, 25 + 5 * Math.sin(h.phase * 0.08), 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
            if (h.phase % 60 === 0) {
              s.floatingTexts.push({ x: W / 2, y: 25, text: '🕳 BLACK HOLE', color: '#8b5cf6', life: 60, vy: 0 });
            }
          } else if (h.type === 'solar_flare') {
            const flareY = (h.phase * 2) % (H + 40) - 20;
            const telegraph = h.phase % 180 < 30;
            ctx.save();
            if (telegraph) {
              ctx.strokeStyle = `rgba(255,200,0,${0.15 + 0.1 * Math.sin(h.phase * 0.2)})`;
              ctx.lineWidth = H * 0.06;
              ctx.beginPath();
              ctx.moveTo(0, flareY);
              ctx.lineTo(W, flareY);
              ctx.stroke();
            } else if (h.phase % 180 < 60) {
              ctx.fillStyle = 'rgba(255,180,0,0.12)';
              ctx.fillRect(0, flareY - 15, W, 30);
              if (Math.abs(player.y - flareY) < 25 && player.invincible <= 0) {
                const shielded = s.powerUps.SHIELD > 0 || s.powerUps.GHOST > 0;
                if (!shielded) {
                  player.health--;
                  player.invincible = 45;
                  player.flash = 12;
                  s.shakeX = 4; s.shakeY = 4; s.shakeDecay = 0.85;
                  if (player.health <= 0) { livesRef.current--; player.health = MAX_HEALTH; }
                  if (livesRef.current <= 0) { gameStatusRef.current = 'gameover'; s.runStats.highScore = scoreRef.current; saveRunStats(s.runStats); lsSetBest(scoreRef.current); lsClearSave(); bestRef.current = lsGetBest(); if (msgRef.current) msgRef.current.show('gameover'); }
                }
              }
            }
            ctx.restore();
            if (h.phase % 180 === 0) {
              s.floatingTexts.push({ x: W / 2, y: 25, text: '☀ SOLAR FLARE', color: '#eab308', life: 60, vy: 0 });
            }
          }
          for (const a of s.asteroids) {
            if (a.dangerous && a.y > 0 && a.y < H) {
              if (Math.abs(a.x - player.x) < a.r + SHIP_W / 2 && Math.abs(a.y - player.y) < a.r + SHIP_H / 2) {
                if (player.invincible <= 0) {
                  const shielded = s.powerUps.SHIELD > 0 || s.powerUps.GHOST > 0;
                  if (!shielded) {
                    player.health--;
                    player.invincible = 60;
                    player.flash = 15;
                    s.shakeX = 4; s.shakeY = 4; s.shakeDecay = 0.85;
                    if (player.health <= 0) { livesRef.current--; player.health = MAX_HEALTH; }
                    if (livesRef.current <= 0) { gameStatusRef.current = 'gameover'; s.runStats.highScore = scoreRef.current; saveRunStats(s.runStats); lsSetBest(scoreRef.current); lsClearSave(); bestRef.current = lsGetBest(); if (msgRef.current) msgRef.current.show('gameover'); }
                  }
                  a.dangerous = false;
                }
              }
              for (let ei = enemies.length - 1; ei >= 0; ei--) {
                const en = enemies[ei];
                if (en.alive && Math.abs(a.x - en.x) < a.r + ENEMY_W / 2 && Math.abs(a.y - en.y) < a.r + ENEMY_H / 2) {
                  en.hp -= 2;
                  if (en.hp <= 0) en.alive = false;
                  a.dangerous = false;
                }
              }
            }
          }
        }
      }

      ctx.restore();

      s.runStats.timePlayed = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);

      checkAchievements(s, scoreRef, waveRef, levelRef);

      for (let i = s.newAchievements.length - 1; i >= 0; i--) {
        const ach = s.newAchievements[i];
        ach.timer--;
        if (ach.timer <= 0) { s.newAchievements.splice(i, 1); continue; }
        const achAlpha = ach.timer > 240 ? 1 : ach.timer / 240;
        const achY = 60 + i * 45;
        ctx.save();
        ctx.globalAlpha = achAlpha;
        ctx.fillStyle = 'rgba(0,20,10,0.85)';
        ctx.beginPath();
        const rx = W / 2 - 140, ry = achY - 18, rw = 280, rh = 36, rr = 6;
        ctx.beginPath();
        ctx.moveTo(rx + rr, ry);
        ctx.lineTo(rx + rw - rr, ry);
        ctx.arcTo(rx + rw, ry, rx + rw, ry + rr, rr);
        ctx.lineTo(rx + rw, ry + rh - rr);
        ctx.arcTo(rx + rw, ry + rh, rx + rw - rr, ry + rh, rr);
        ctx.lineTo(rx + rr, ry + rh);
        ctx.arcTo(rx, ry + rh, rx, ry + rh - rr, rr);
        ctx.lineTo(rx, ry + rr);
        ctx.arcTo(rx, ry, rx + rr, ry, rr);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.font = "bold 11px 'Courier New', monospace";
        ctx.textAlign = 'center';
        ctx.fillStyle = '#00ff88';
        ctx.fillText(`${ach.icon} ${ach.name}`, W / 2, achY - 3);
        ctx.font = "8px 'Courier New', monospace";
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText(ach.desc, W / 2, achY + 11);
        ctx.restore();
      }

      autoSaveTimerRef.current++;
      if (autoSaveTimerRef.current >= 300) { autoSaveTimerRef.current = 0; lsSetSave({ score: scoreRef.current, lives: livesRef.current, wave: waveRef.current, level: levelRef.current, levelTimer: s.levelTimer }); }

      rafRef.current = requestAnimationFrame(loop);
      } catch (err) {
        console.error('Game loop error:', err);
        rafRef.current = requestAnimationFrame(loop);
      }
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (isMobile) {
        canvas.removeEventListener('touchstart', onTouchStart);
        canvas.removeEventListener('touchmove', onTouchMove);
        canvas.removeEventListener('touchend', onTouchEnd);
        canvas.removeEventListener('touchcancel', onTouchEnd);
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      initRef.current = false;
    };
  }, []);

  const existingSave = React.useMemo(() => lsGetSave(), []);
  const [hudState, setHudState] = React.useState({
    score: 0, lives: MAX_LIVES, health: MAX_HEALTH, wave: 1, level: 1,
    powerUps: { HOMING: 0, RAPIDFIRE: 0, SHIELD: 0, MULTISHOT: 0, BEAM: 0, GHOST: 0, MAGNET: 0, SCORE2X: 0 },
    best: lsGetBest(),
    boss: null,
    combo: 0,
  });
  const [msgState, setMsgState] = React.useState(
    existingSave ? { visible: true, type: 'resume' } : { visible: false, type: null }
  );

  React.useEffect(() => {
    hudRef.current = {
      update: (score, lives, wave, level, powerUps, best, health, combo) =>
        setHudState({ score, lives, health: health ?? MAX_HEALTH, wave, level: level ?? 1, powerUps: powerUps || { HOMING: 0, RAPIDFIRE: 0, SHIELD: 0, MULTISHOT: 0, BEAM: 0, GHOST: 0, MAGNET: 0, SCORE2X: 0 }, best: best ?? lsGetBest(), boss: (stateRef.current && stateRef.current.bossActive && stateRef.current.boss) ? stateRef.current.boss : null, combo: combo ?? 0 }),
    };
    msgRef.current = {
      show: (type) => setMsgState({ visible: true, type }),
      hide: () => setMsgState({ visible: false, type: null }),
    };
  }, []);

  const heartsStr = '♥'.repeat(Math.max(0, hudState.lives)) + '♡'.repeat(Math.max(0, MAX_LIVES - hudState.lives));
  const activePowerUps = PU_KEYS.filter(k => hudState.powerUps[k] > 0);
  const isBossWave = hudState.boss !== null;

  return (
    <>
      <GameUI>
        <HudGroup>
          <HudItem><HudLabel>Score</HudLabel><HudValue>{String(hudState.score).padStart(6, '0')}</HudValue></HudItem>
          <HudItem><HudLabel>Best</HudLabel><HudValue color="#ffcc00">{String(hudState.best).padStart(6, '0')}</HudValue></HudItem>
          {hudState.combo >= 2 && (
            <HudItem><HudLabel>Combo</HudLabel><HudValue color={hudState.combo >= 5 ? '#ff4444' : hudState.combo >= 4 ? '#ff8800' : hudState.combo >= 3 ? '#ffcc00' : '#ffffff'}>{hudState.combo}×</HudValue></HudItem>
          )}
          <HudItem><HudLabel>Level</HudLabel><HudValue color={isBossWave ? '#ff4444' : '#ff8844'}>{hudState.level}</HudValue></HudItem>
          <HudItem><HudLabel>Wave</HudLabel><HudValue color="#00ff88">{hudState.wave}</HudValue></HudItem>
          <HudItem>
            <HudLabel>Lives</HudLabel>
            <HudValue color="#ff6666">{heartsStr}</HudValue>
            <div style={{ display: 'flex', gap: 3, marginTop: 3 }}>
              {Array.from({ length: MAX_HEALTH }, (_, i) => (
                <div key={i} style={{ width: 14, height: 4, borderRadius: 2, background: i < hudState.health ? '#22ff66' : 'rgba(255,255,255,0.12)', transition: 'background 0.2s' }} />
              ))}
            </div>
          </HudItem>
        </HudGroup>
        <PowerUpBar>
          {activePowerUps.map(k => (
            <PowerChip key={k} color={PU[k].color}>
              {PU[k].icon} {PU[k].label}
              <PowerTimerTrack><PowerTimerFill color={PU[k].color} pct={Math.round((hudState.powerUps[k] / POWERUP_DURATION) * 100)} /></PowerTimerTrack>
            </PowerChip>
          ))}
        </PowerUpBar>
        <HudItem>
          <HudLabel>Controls</HudLabel>
          <HudValue style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>{isMobile ? 'DRAG TO MOVE · AUTO-FIRE · TAP Q/E/R' : '←→ MOVE · SPACE FIRE'}</HudValue>
          <HudValue style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)' }}>{isMobile ? 'DOUBLE-TAP TO PAUSE' : 'Q BOMB · E SLOW · R OVERDRIVE'}</HudValue>
        </HudItem>
      </GameUI>
      <GameCanvas ref={canvasRef} />
      {msgState.visible && (
        <OverlayMessage initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          {msgState.type === 'resume' ? (
            <>
              <MsgTitle color="#00eeff">SAVE DETECTED</MsgTitle>
              <MsgSub>
                WAVE {existingSave?.wave} · SCORE {String(existingSave?.score ?? 0).padStart(6, '0')} · LIVES {existingSave?.lives}
                <br />
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem' }}>Continue your last run or start fresh?</span>
              </MsgSub>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <MsgBtn onClick={() => { initGame(existingSave); setMsgState({ visible: false, type: null }); }}>▶ RESUME</MsgBtn>
                <MsgBtn onClick={() => { lsClearSave(); initGame(); setMsgState({ visible: false, type: null }); }}>↺ NEW GAME</MsgBtn>
                <MsgBtn onClick={onClose}>✕ EXIT</MsgBtn>
              </div>
            </>
          ) : (
            <>
              <MsgTitle color={msgState.type === 'gameover' ? '#ff4444' : msgState.type === 'victory' ? '#00ff88' : '#ff4444'}>{msgState.type === 'gameover' ? 'GAME OVER' : msgState.type === 'victory' ? 'VICTORY!' : 'GAME OVER'}</MsgTitle>
              <MsgSub>
                FINAL SCORE: {String(hudState.score).padStart(6, '0')} | WAVE: {hudState.wave}
                <br />
                {hudState.score >= hudState.best && hudState.score > 0 && <span style={{ color: '#ffcc00' }}>★ NEW HIGH SCORE!</span>}
              </MsgSub>
              {stateRef.current && stateRef.current.runStats && (
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', marginTop: '0.5rem' }}>
                  <span>KILLS: {stateRef.current.runStats.kills}</span>
                  <span>BOSSES: {stateRef.current.runStats.bossesKilled}</span>
                  <span>COMBO: {stateRef.current.runStats.highestCombo}×</span>
                  <span>ACC: {getAccuracy(stateRef.current.runStats)}%</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <MsgBtn onClick={() => { lsClearSave(); initGame(); setMsgState({ visible: false, type: null }); }}>↺ RESTART</MsgBtn>
                {msgState.type === 'victory' && (
                  <>
                    <MsgBtn onClick={() => { lsClearSave(); initGame(); stateRef.current.gameMode = 'endless'; setMsgState({ visible: false, type: null }); }} style={{ borderColor: '#00ff88', color: '#00ff88' }}>♾ ENDLESS</MsgBtn>
                    <MsgBtn onClick={() => { lsClearSave(); initGame(); stateRef.current.gameMode = 'bossrush'; stateRef.current.bossRushIndex = 0; setMsgState({ visible: false, type: null }); }} style={{ borderColor: '#f59e0b', color: '#f59e0b' }}>⚔ BOSS RUSH</MsgBtn>
                  </>
                )}
                <MsgBtn onClick={onClose}>✕ EXIT</MsgBtn>
              </div>
            </>
          )}
        </OverlayMessage>
      )}
      <EscHint>[ P ] PAUSE · [ ESC ] EXIT</EscHint>
      <GameTitle>RETRO SPACE — HIJACK.DEV</GameTitle>
    </>
  );
}

export default RetroSpaceGame;
