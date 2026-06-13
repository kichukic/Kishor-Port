import React, { useEffect, useRef, useCallback } from 'react';
import { isMobile } from './constants';
import {
  SHIP_W, SHIP_H, ENEMY_W, ENEMY_H,
  PLAYER_SPEED, BULLET_SPEED, MISSILE_SPEED, ENEMY_BULLET_SPEED,
  MAX_LIVES, MAX_HEALTH, BASE_SHOOT_COOLDOWN, CRATE_W, CRATE_H,
  LEVEL_DURATION, POWERUP_DURATION, LIFE_DROP_CHANCE,
  PU, PU_KEYS,
} from './constants';
import {
  GameUI, GameCanvas, HudGroup, HudItem, HudLabel, HudValue,
  PowerUpBar, PowerChip, PowerTimerTrack, PowerTimerFill,
  EscHint, GameTitle, OverlayMessage, MsgTitle, MsgSub, MsgBtn,
} from './styles';
import { createStars } from './factories/stars';
import { createAsteroids, makeAsteroid } from './factories/asteroids';
import { spawnEnemy } from './factories/enemy';
import { spawnCrate } from './factories/crate';
import { spawnBoss } from './factories/boss';
import { createExplosion } from './factories/explosions';
import { lsGetBest, lsSetBest, lsGetSave, lsSetSave, lsClearSave } from './utils/localStorage';
import { drawShip } from './drawing/ship';
import { drawEnemy } from './drawing/enemy';
import { drawCrate } from './drawing/crate';
import { drawLifePickup } from './drawing/lifePickup';
import { drawMissile } from './drawing/missile';
import { drawBullet } from './drawing/bullet';
import { drawAsteroid } from './drawing/asteroid';
import { drawBoss, drawLevelTimer, drawBossHpBar } from './drawing/boss';

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
      touch: { active: false, originX: 0, originY: 0, dx: 0, dy: 0, fire: false },
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
      const s = stateRef.current;
      if (!s) { rafRef.current = requestAnimationFrame(loop); return; }

      const { W, H, player, bullets, enemyBullets, enemies, crates, explosions, stars, keys } = s;
      const ctx = canvas.getContext('2d');
      const now = Date.now();

      if (gameStatusRef.current !== 'playing') {
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

      for (const k of PU_KEYS) {
        if (s.powerUps[k] > 0) s.powerUps[k]--;
      }

      const cooldown = s.powerUps.RAPIDFIRE > 0 ? BASE_SHOOT_COOLDOWN / 3 : BASE_SHOOT_COOLDOWN;
      const wantFire = isMobile ? true : (keys['Space'] || keys['KeyZ']);
      if (wantFire && now - s.lastShot > cooldown) {
        s.lastShot = now;
        if (s.powerUps.HOMING > 0) {
          bullets.push({ x: player.x - 6, y: player.y - SHIP_H / 2, vx: 0, vy: -MISSILE_SPEED, homing: true });
          bullets.push({ x: player.x + 6, y: player.y - SHIP_H / 2, vx: 0, vy: -MISSILE_SPEED, homing: true });
        } else {
          bullets.push({ x: player.x, y: player.y - SHIP_H / 2 - 2, vx: 0, vy: -BULLET_SPEED, homing: false });
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
          s.powerUps[c.type] = POWERUP_DURATION;
          if (c.type === 'SHIELD') player.invincible = POWERUP_DURATION;
          explosions.push(...createExplosion(c.x, c.y, 8));
          crates.splice(i, 1);
          if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health);
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
          if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health);
          continue;
        }
      }

      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (!e.alive) {
          explosions.push(...createExplosion(e.x, e.y));
          enemies.splice(i, 1);
          continue;
        }
        e.timer++;
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
        }
        if (e.power === 'teleport' && e.timer % 140 === 0) {
          e.x += (Math.random() - 0.5) * 85;
          e.x = Math.max(40, Math.min(W - 40, e.x));
          explosions.push(...createExplosion(e.x, e.y, 4));
        }
        e.x += e.vx;
        e.y += e.vy;
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
          } else {
            enemyBullets.push({ x: e.x, y: e.y + ENEMY_H / 2, vx: (dx / dist) * ENEMY_BULLET_SPEED, vy: (dy / dist) * ENEMY_BULLET_SPEED });
          }
        }

        for (let b = bullets.length - 1; b >= 0; b--) {
          const bx = bullets[b].x, by = bullets[b].y;
          if (bx > e.x - ENEMY_W / 2 && bx < e.x + ENEMY_W / 2 && by > e.y - ENEMY_H / 2 && by < e.y + ENEMY_H / 2) {
            bullets.splice(b, 1);
            if (e.shield > 0) { e.shield--; explosions.push(...createExplosion(bx, by, 3)); break; }
            e.hp--;
            explosions.push(...createExplosion(bx, by, 3));
            if (e.hp <= 0) {
              e.alive = false;
              if (e.power === 'splitter') {
                for (let j = 0; j < 2; j++) {
                  enemies.push({ name: 'Mini Swarmer', x: e.x + (j === 0 ? -15 : 15), y: e.y, vx: (j === 0 ? -1.2 : 1.2) * (e.baseSpeed * 0.8), vy: e.vy * 1.1, baseSpeed: e.baseSpeed, hp: 1, maxHp: 1, color: '#a855f7', shape: 'tri', move: 'sine', power: 'normal', timer: 0, shootTimer: 45 + Math.random() * 90, shield: 0, alive: true });
                }
              } else if (e.power === 'bomb') {
                for (let j = 0; j < 6; j++) {
                  const ang = (Math.PI * 2 / 6) * j;
                  enemyBullets.push({ x: e.x, y: e.y, vx: Math.cos(ang) * ENEMY_BULLET_SPEED * 0.85, vy: Math.sin(ang) * ENEMY_BULLET_SPEED * 0.85 });
                }
              }
              scoreRef.current += e.maxHp * 15;
              lsSetBest(scoreRef.current);
              bestRef.current = lsGetBest();
              if (Math.random() < LIFE_DROP_CHANCE && (livesRef.current < MAX_LIVES || player.health < MAX_HEALTH)) {
                s.lifePickups.push({ x: e.x, y: e.y, vy: 1.2 + Math.random() * 0.5, wobble: Math.random() * Math.PI * 2, alive: true });
              }
              if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health);
            }
            break;
          }
        }
      }

      for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const eb = enemyBullets[i];
        eb.x += eb.vx; eb.y += eb.vy;
        if (eb.y > H + 20 || eb.x < -20 || eb.x > W + 20 || eb.y < -20) { enemyBullets.splice(i, 1); continue; }
        const shielded = s.powerUps.SHIELD > 0;
        if (player.invincible <= 0 && !shielded && Math.abs(eb.x - player.x) < SHIP_W / 2 - 4 && Math.abs(eb.y - player.y) < SHIP_H / 2 - 4) {
          enemyBullets.splice(i, 1);
          player.invincible = 90; player.flash = 18;
          player.health--;
          if (player.health <= 0) { livesRef.current--; player.health = MAX_HEALTH; }
          explosions.push(...createExplosion(player.x, player.y, 8));
          if (livesRef.current <= 0) { gameStatusRef.current = 'gameover'; lsSetBest(scoreRef.current); lsClearSave(); bestRef.current = lsGetBest(); if (msgRef.current) msgRef.current.show('gameover'); }
          if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health);
        }
      }

      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const shielded = s.powerUps.SHIELD > 0;
        if (player.invincible <= 0 && !shielded && Math.abs(e.x - player.x) < (SHIP_W + ENEMY_W) / 2 - 6 && Math.abs(e.y - player.y) < (SHIP_H + ENEMY_H) / 2 - 6) {
          e.alive = false;
          player.invincible = 90; player.flash = 18;
          player.health--;
          if (player.health <= 0) { livesRef.current--; player.health = MAX_HEALTH; }
          explosions.push(...createExplosion(player.x, player.y, 8));
          if (livesRef.current <= 0) { gameStatusRef.current = 'gameover'; lsSetBest(scoreRef.current); lsClearSave(); bestRef.current = lsGetBest(); if (msgRef.current) msgRef.current.show('gameover'); }
          if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health);
        }
      }

      if (s.bossActive && s.boss) {
        const boss = s.boss;
        if (!boss.alive) {
          explosions.push(...createExplosion(boss.x, boss.y, 40));
          for (let i = 0; i < 3; i++) explosions.push(...createExplosion(boss.x + (Math.random() - 0.5) * boss.W, boss.y + (Math.random() - 0.5) * boss.H, 12));
          scoreRef.current += boss.score;
          lsSetBest(scoreRef.current);
          bestRef.current = lsGetBest();
          s.boss = null; s.bossActive = false; s.levelTimer = LEVEL_DURATION;
          levelRef.current++; waveRef.current++;
          s.spawnInterval = Math.max(35, 90 - waveRef.current * 6);
          s.waveKillTarget = 8 + waveRef.current * 2;
          s.enemiesKilled = 0;
          bannerRef.current = { text: `✦ LEVEL ${levelRef.current} — ENGAGE`, color: '#00ff88', timer: 150 };
          if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health);
        } else {
          boss.timer++;
          if (boss.flash > 0) boss.flash--;
          if (boss.entering) {
            boss.y += 2.5;
            if (boss.y >= 130) boss.entering = false;
          } else {
            if (boss.move === 'sweep') { boss.x += boss.vx; if (boss.x > W - boss.W / 2 - 20 || boss.x < boss.W / 2 + 20) boss.vx *= -1; boss.y = 130 + 20 * Math.sin(boss.timer * 0.015); }
            else if (boss.move === 'sine') { const spd = boss.phase === 2 ? 1.5 : 1; boss.x = W / 2 + (W * 0.38) * Math.sin(boss.timer * 0.018 * spd); boss.y = 140 + 40 * Math.sin(boss.timer * 0.025); }
            else if (boss.move === 'figure8') { const spd = boss.phase === 2 ? 1.4 : 1; boss.x = W / 2 + (W * 0.35) * Math.sin(boss.timer * 0.02 * spd); boss.y = 140 + 55 * Math.sin(boss.timer * 0.04 * spd); }
            else if (boss.move === 'butterfly') { const spd = boss.phase === 2 ? 1.3 : 1; boss.x = W / 2 + (W * 0.38) * Math.sin(boss.timer * 0.022 * spd); boss.y = 150 + 60 * Math.cos(boss.timer * 0.044 * spd); }
            else if (boss.move === 'bounce') { const spd = boss.phase === 2 ? 1.4 : 1; boss.x += boss.vx * spd; boss.y += boss.vy * spd; if (boss.x > W - boss.W / 2 - 20 || boss.x < boss.W / 2 + 20) boss.vx *= -1; if (boss.y > 240 || boss.y < 120) boss.vy *= -1; }
            else if (boss.move === 'circle') { const spd = boss.phase === 2 ? 1.3 : 1; const radius = Math.min(W * 0.25, 120); boss.x = W / 2 + radius * Math.cos(boss.timer * 0.015 * spd); boss.y = 160 + radius * 0.5 * Math.sin(boss.timer * 0.015 * spd); }
            else { const spd = boss.phase === 2 ? 1.3 : 1; boss.x = W / 2 + (W * 0.3) * Math.sin(boss.timer * 0.012); boss.y = 160 + 90 * Math.sin(boss.timer * 0.03 * spd); }
            if (boss.hp <= boss.maxHp / 2 && boss.phase === 1) { boss.phase = 2; bannerRef.current = { text: `! ${boss.name} — PHASE 2 !`, color: '#ff2222', timer: 120 }; }
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
              if (boss.hp <= 0) boss.alive = false;
              if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health);
              break;
            }
          }
          const bossShielded = s.powerUps.SHIELD > 0;
          if (player.invincible <= 0 && !bossShielded && boss.alive && Math.abs(boss.x - player.x) < (boss.W + SHIP_W) / 2 - 10 && Math.abs(boss.y - player.y) < (boss.H + SHIP_H) / 2 - 10) {
            player.invincible = 90; player.flash = 18;
            player.health--;
            if (player.health <= 0) { livesRef.current--; player.health = MAX_HEALTH; }
            explosions.push(...createExplosion(player.x, player.y, 8));
            if (livesRef.current <= 0) { gameStatusRef.current = 'gameover'; lsSetBest(scoreRef.current); lsClearSave(); bestRef.current = lsGetBest(); if (msgRef.current) msgRef.current.show('gameover'); }
            if (hudRef.current) hudRef.current.update(scoreRef.current, livesRef.current, waveRef.current, levelRef.current, { ...s.powerUps }, bestRef.current, player.health);
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

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#000008';
      ctx.fillRect(0, 0, W, H);

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

      enemyBullets.forEach(eb => { ctx.fillStyle = 'rgba(255, 120, 80, 0.9)'; ctx.shadowColor = '#ff7050'; ctx.shadowBlur = 6; ctx.fillRect(eb.x - 1.5, eb.y - 5, 3, 10); });
      ctx.shadowBlur = 0;

      bullets.forEach(b => { if (b.homing) drawMissile(ctx, b); else drawBullet(ctx, b); });
      ctx.shadowBlur = 0;

      enemies.forEach(e => drawEnemy(ctx, e));

      if (player.invincible <= 0 || Math.floor(player.invincible / 6) % 2 === 0) {
        drawShip(ctx, player.x, player.y, player.flash > 0, s.powerUps.SHIELD > 0, player.vx, player.vy);
      }

      explosions.forEach(ex => { ctx.globalAlpha = ex.life * 0.85; ctx.fillStyle = ex.life > 0.5 ? '#ffffff' : 'rgba(255,200,100,0.8)'; ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 6; ctx.beginPath(); ctx.arc(ex.x, ex.y, ex.r, 0, Math.PI * 2); ctx.fill(); });
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;

      if (s.bossActive && s.boss) { drawBoss(ctx, s.boss); drawBossHpBar(ctx, s.boss, W); }
      else { drawLevelTimer(ctx, s.levelTimer, LEVEL_DURATION, W); }

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
        ctx.restore();
      }

      autoSaveTimerRef.current++;
      if (autoSaveTimerRef.current >= 300) { autoSaveTimerRef.current = 0; lsSetSave({ score: scoreRef.current, lives: livesRef.current, wave: waveRef.current, level: levelRef.current, levelTimer: s.levelTimer }); }

      rafRef.current = requestAnimationFrame(loop);
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
    };
  }, [initGame, onClose]);

  const existingSave = React.useMemo(() => lsGetSave(), []);
  const [hudState, setHudState] = React.useState({
    score: 0, lives: MAX_LIVES, health: MAX_HEALTH, wave: 1, level: 1,
    powerUps: { HOMING: 0, RAPIDFIRE: 0, SHIELD: 0 },
    best: lsGetBest(),
    boss: null,
  });
  const [msgState, setMsgState] = React.useState(
    existingSave ? { visible: true, type: 'resume' } : { visible: false, type: null }
  );

  React.useEffect(() => {
    hudRef.current = {
      update: (score, lives, wave, level, powerUps, best, health) =>
        setHudState({ score, lives, health: health ?? MAX_HEALTH, wave, level: level ?? 1, powerUps: powerUps || { HOMING: 0, RAPIDFIRE: 0, SHIELD: 0 }, best: best ?? lsGetBest(), boss: (stateRef.current && stateRef.current.bossActive && stateRef.current.boss) ? stateRef.current.boss : null }),
    };
    msgRef.current = {
      show: (type) => setMsgState({ visible: true, type }),
      hide: () => setMsgState({ visible: false, type: null }),
    };
    if (!existingSave) initGame();
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
          <HudValue style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>{isMobile ? 'DRAG TO MOVE · AUTO-FIRE' : '←→ MOVE · SPACE FIRE'}</HudValue>
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
              <MsgTitle color={msgState.type === 'gameover' ? '#ff4444' : '#00ff88'}>{msgState.type === 'gameover' ? 'GAME OVER' : 'YOU WIN'}</MsgTitle>
              <MsgSub>
                FINAL SCORE: {String(hudState.score).padStart(6, '0')} | WAVE: {hudState.wave}
                <br />
                {hudState.score >= hudState.best && hudState.score > 0 && <span style={{ color: '#ffcc00' }}>★ NEW HIGH SCORE!</span>}
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

export default RetroSpaceGame;
