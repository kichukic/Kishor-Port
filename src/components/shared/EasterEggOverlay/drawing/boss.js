import { shadeColor } from './enemy';
import { BOSS_DEFS } from '../constants';

export function drawMiniBoss(ctx, boss) {
  const { x, y, W: BW, H: BH, color, hp, maxHp, timer, flash } = boss;
  const t = Date.now() / 200;
  const pulse = 0.8 + 0.2 * Math.sin(t);
  const rage = hp <= maxHp * 0.5;
  const isFlashing = flash > 0;

  ctx.save();
  ctx.translate(x, y);

  ctx.shadowColor = isFlashing ? '#ffffff' : (rage ? '#ff0000' : color);
  ctx.shadowBlur = 25 + 12 * pulse;

  // ── TENTACLES (behind body) ──
  const tentCount = 6;
  for (let i = 0; i < tentCount; i++) {
    const baseAngle = (i / tentCount) * Math.PI * 2 + timer * 0.008;
    const len = BW * 0.5 + Math.sin(timer * 0.03 + i * 1.2) * 12;

    ctx.strokeStyle = isFlashing ? '#ffffff' : shadeColor(color, -20);
    ctx.lineWidth = 3.5 - i * 0.3;
    ctx.lineCap = 'round';
    ctx.beginPath();

    const segments = 8;
    for (let s = 0; s <= segments; s++) {
      const seg = s / segments;
      const wobble = Math.sin(timer * 0.06 + i * 0.9 + seg * 3) * (10 + seg * 14);
      const tx = Math.cos(baseAngle) * len * seg + wobble * Math.cos(baseAngle + Math.PI / 2);
      const ty = Math.sin(baseAngle) * len * seg * 0.6 + wobble * Math.sin(baseAngle + Math.PI / 2);
      if (s === 0) ctx.moveTo(tx, ty);
      else ctx.lineTo(tx, ty);
    }
    ctx.stroke();

    // tentacle tip glow
    const tipWobble = Math.sin(timer * 0.06 + i * 0.9 + 3) * (10 + 14);
    const tipX = Math.cos(baseAngle) * len + tipWobble * Math.cos(baseAngle + Math.PI / 2);
    const tipY = Math.sin(baseAngle) * len * 0.6 + tipWobble * Math.sin(baseAngle + Math.PI / 2);
    ctx.fillStyle = isFlashing ? '#ffffff' : (rage ? '#ff2222' : shadeColor(color, 30));
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(tipX, tipY, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // ── MAIN BODY — organic alien hull ──
  ctx.fillStyle = isFlashing ? '#ffffff' : (rage ? '#4a0000' : shadeColor(color, -15));
  ctx.beginPath();
  ctx.moveTo(0, -BH * 0.45);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const wobbleR = 1 + Math.sin(timer * 0.02 + a * 3) * 0.08;
    const rx = BW * 0.42 * wobbleR;
    const ry = BH * 0.38 * wobbleR;
    const px = Math.cos(a) * rx;
    const py = Math.sin(a) * ry;
    ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // body shell shading
  let bodyGrad = ctx.createRadialGradient(-BW * 0.1, -BH * 0.1, BW * 0.05, 0, 0, BW * 0.45);
  bodyGrad.addColorStop(0, isFlashing ? '#ffffff' : shadeColor(color, 30));
  bodyGrad.addColorStop(0.5, isFlashing ? '#ffffff' : color);
  bodyGrad.addColorStop(1, isFlashing ? '#ffffff' : shadeColor(color, -40));
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, BW * 0.38, BH * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── ARMORED PLATES ──
  ctx.strokeStyle = isFlashing ? '#ffffff' : shadeColor(color, -30);
  ctx.lineWidth = 1.8;
  for (let i = 0; i < 5; i++) {
    const plateA = (i / 5) * Math.PI * 2 + timer * 0.005;
    const pr = BW * 0.22;
    ctx.beginPath();
    ctx.arc(Math.cos(plateA) * pr * 0.5, Math.sin(plateA) * pr * 0.5, BW * 0.1, plateA - 0.6, plateA + 0.6);
    ctx.stroke();
  }

  // ── MOUTH / MAW ──
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.ellipse(0, BH * 0.08, BW * 0.12, BH * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  const mawGlow = isFlashing ? '#ffffff' : (rage ? '#ff0000' : '#ff4444');
  ctx.fillStyle = mawGlow;
  ctx.shadowColor = mawGlow;
  ctx.shadowBlur = 12 + 4 * pulse;
  ctx.beginPath();
  ctx.ellipse(0, BH * 0.08, BW * 0.08, BH * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();

  // teeth
  ctx.fillStyle = '#ffffff';
  ctx.shadowBlur = 0;
  const teethCount = 8;
  for (let i = 0; i < teethCount; i++) {
    const ta = (i / teethCount) * Math.PI * 2;
    const tx = Math.cos(ta) * BW * 0.11;
    const ty = BH * 0.08 + Math.sin(ta) * BH * 0.08;
    const tLen = 3 + Math.sin(timer * 0.1 + i) * 1.5;
    const tAngle = ta + Math.PI;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + Math.cos(tAngle - 0.3) * tLen, ty + Math.sin(tAngle - 0.3) * tLen);
    ctx.lineTo(tx + Math.cos(tAngle + 0.3) * tLen, ty + Math.sin(tAngle + 0.3) * tLen);
    ctx.closePath();
    ctx.fill();
  }

  // ── EYES (3 menacing eyes) ──
  const eyePositions = [
    { ex: -BW * 0.16, ey: -BH * 0.12, r: BW * 0.07 },
    { ex: BW * 0.16,  ey: -BH * 0.12, r: BW * 0.07 },
    { ex: 0,          ey: -BH * 0.22, r: BW * 0.055 },
  ];

  for (const eye of eyePositions) {
    // eye socket
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(eye.ex, eye.ey, eye.r * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // iris
    let eyeGrad = ctx.createRadialGradient(eye.ex, eye.ey, 0, eye.ex, eye.ey, eye.r);
    eyeGrad.addColorStop(0, isFlashing ? '#ffffff' : '#ffffff');
    eyeGrad.addColorStop(0.25, isFlashing ? '#ffffff' : (rage ? '#ff0000' : '#ff4444'));
    eyeGrad.addColorStop(0.6, isFlashing ? '#ffffff' : shadeColor(color, 20));
    eyeGrad.addColorStop(1, '#000000');
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.arc(eye.ex, eye.ey, eye.r, 0, Math.PI * 2);
    ctx.fill();

    // pupil — tracks player loosely
    const pupilOffX = Math.sin(timer * 0.02) * eye.r * 0.25;
    const pupilOffY = Math.cos(timer * 0.025) * eye.r * 0.2;
    ctx.fillStyle = isFlashing ? '#ff4444' : '#000000';
    ctx.beginPath();
    ctx.arc(eye.ex + pupilOffX, eye.ey + pupilOffY, eye.r * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // eye highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eye.ex - eye.r * 0.2, eye.ey - eye.r * 0.25, eye.r * 0.18, 0, Math.PI * 2);
    ctx.fill();

    // eye glow ring
    ctx.strokeStyle = isFlashing ? '#ffffff' : (rage ? 'rgba(255,0,0,0.5)' : `rgba(255,80,80,${0.3 + 0.2 * pulse})`);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(eye.ex, eye.ey, eye.r + 3 + Math.sin(t * 3 + eye.ex) * 2, 0, Math.PI * 2);
    ctx.stroke();
  }

  // ── CORE ENERGY (glowing center) ──
  const coreR = BW * 0.08;
  let coreGrad = ctx.createRadialGradient(0, -BH * 0.05, 0, 0, -BH * 0.05, coreR * 2);
  coreGrad.addColorStop(0, isFlashing ? '#ffffff' : '#ffffff');
  coreGrad.addColorStop(0.2, isFlashing ? '#ffffff' : (rage ? '#ff0000' : '#ff6666'));
  coreGrad.addColorStop(0.5, isFlashing ? '#ffffff' : shadeColor(color, 40));
  coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = coreGrad;
  ctx.shadowColor = isFlashing ? '#ffffff' : (rage ? '#ff0000' : color);
  ctx.shadowBlur = 20 + 8 * pulse;
  ctx.beginPath();
  ctx.arc(0, -BH * 0.05, coreR * 2, 0, Math.PI * 2);
  ctx.fill();

  // core center
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, -BH * 0.05, coreR * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // ── SPINE RIDGES ──
  ctx.strokeStyle = isFlashing ? '#ffffff' : shadeColor(color, 20);
  ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) {
    const sy = -BH * 0.35 + i * BH * 0.1;
    const sw = BW * 0.08 + Math.sin(timer * 0.04 + i * 0.7) * 2;
    ctx.beginPath();
    ctx.moveTo(-sw, sy);
    ctx.lineTo(0, sy - 4);
    ctx.lineTo(sw, sy);
    ctx.stroke();
  }

  // ── RAGE AURA (phase 2) ──
  if (rage) {
    ctx.strokeStyle = `rgba(255,0,0,${0.4 + 0.3 * Math.sin(t * 3)})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, BW * 0.5 + 8 + 4 * Math.sin(t * 4), 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255,0,0,${0.2 + 0.15 * Math.sin(t * 5)})`;
    ctx.beginPath();
    ctx.arc(0, 0, BW * 0.6 + 6 * Math.sin(t * 2), 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawBoss(ctx, boss) {
  const { x, y, W: BW, H: BH, color, hp, maxHp, phase, timer, flash, shape } = boss;
  const t = Date.now() / 200;
  const pulse = 0.8 + 0.2 * Math.sin(t);
  const rage = phase === 2;
  const isFlashing = flash > 0;

  ctx.save();
  ctx.translate(x, y);

  ctx.shadowColor = isFlashing ? '#ffffff' : (rage ? '#ff0000' : color);
  ctx.shadowBlur = 20 + 10 * pulse;

  if (shape === 'saucer') {
    ctx.fillStyle = isFlashing ? '#ffffff' : (rage ? `rgba(255,80,80,${pulse})` : `rgba(255,100,100,${pulse * 0.9})`);
    ctx.beginPath();
    ctx.ellipse(0, 0, BW / 2, BH / 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isFlashing ? '#ffffff' : (rage ? '#ff4444' : color);
    ctx.beginPath();
    ctx.ellipse(0, -BH / 6, BW / 4, BH / 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isFlashing ? '#ffffff' : '#44444c';
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.arc(i * (BW / 5.5), BH / 5, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (shape === 'destroyer') {
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
    ctx.fillStyle = isFlashing ? '#ffffff' : (rage ? `rgba(200,0,255,${pulse})` : `rgba(180,80,255,${pulse * 0.85})`);
    ctx.beginPath();
    ctx.ellipse(0, 0, BW / 4, BH / 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-BW / 4, 0);
    ctx.lineTo(-BW / 2, -BH / 3);
    ctx.lineTo(-BW / 2, BH / 4);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(BW / 4, 0);
    ctx.lineTo(BW / 2, -BH / 3);
    ctx.lineTo(BW / 2, BH / 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = isFlashing ? '#ffffff' : '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, BW / 14, BH / 10, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === 'vortex') {
    ctx.save();
    ctx.rotate(timer * 0.04);

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

    ctx.strokeStyle = isFlashing ? '#ffffff' : `rgba(255,255,255,${0.5 + 0.3 * pulse})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, BW / 3.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = isFlashing ? '#ffffff' : (rage ? `rgba(255,50,50,${pulse})` : `rgba(0,240,255,${pulse * 0.9})`);
    ctx.beginPath();
    ctx.arc(0, 0, BW / 4.8, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === 'heavy' || shape === 'battleship') {
    ctx.fillStyle = '#475569';
    ctx.fillRect(-BW / 3, -BH / 2 - 2, BW / 6, 6);
    ctx.fillRect(BW / 3 - BW / 6, -BH / 2 - 2, BW / 6, 6);

    ctx.fillStyle = isFlashing ? '#ffffff' : (rage ? `rgba(255, 0, 50, ${pulse})` : `rgba(180, 20, 50, ${pulse * 0.9})`);
    ctx.beginPath();
    ctx.moveTo(0, BH / 2);
    ctx.lineTo(-BW / 2, BH / 4);
    ctx.lineTo(-BW / 2.5, -BH / 2);
    ctx.lineTo(BW / 2.5, -BH / 2);
    ctx.lineTo(BW / 2, BH / 4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-BW / 3.5, -BH / 4, 7, BH / 2 + 10);
    ctx.fillRect(BW / 3.5 - 7, -BH / 4, 7, BH / 2 + 10);
    ctx.fillStyle = isFlashing ? '#ffffff' : '#94a3b8';
    ctx.fillRect(-BW / 3.5 - 1, BH / 4 + 6, 9, 4);
    ctx.fillRect(BW / 3.5 - 8, BH / 4 + 6, 9, 4);

    ctx.fillStyle = isFlashing ? '#ffffff' : (rage ? '#ff0033' : color);
    ctx.beginPath();
    ctx.ellipse(0, 0, BW / 7, BH / 7, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === 'star') {
    ctx.fillStyle = isFlashing ? '#ffffff' : (rage ? '#ef4444' : color);
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 + (timer * 0.015);
      const r = i % 2 === 0 ? BW / 2 : BW / 4;
      ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, BW / 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, BW / 12, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === 'spikey') {
    ctx.fillStyle = isFlashing ? '#ffffff' : (rage ? '#dc2626' : color);
    ctx.beginPath();
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8 + (timer * 0.005);
      const r = i % 2 === 0 ? BW / 2 : BW / 3.2;
      ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, BW / 5, 0, Math.PI * 2);
    ctx.stroke();
  } else if (shape === 'carrier') {
    ctx.fillStyle = isFlashing ? '#ffffff' : (rage ? `rgba(220, 38, 38, ${pulse})` : `rgba(47, 55, 69, ${pulse})`);
    ctx.fillRect(-BW / 2, -BH / 2, BW, BH);

    ctx.fillStyle = isFlashing ? '#ffffff' : '#1e293b';
    ctx.fillRect(-BW / 2 + 10, -BH / 4, BW - 20, BH / 2);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-BW / 2 + 20, -2, BW - 40, 4);

    ctx.fillStyle = color;
    ctx.fillRect(-BW / 2 - 4, -BH / 3, 4, BH * 0.6);
    ctx.fillRect(BW / 2, -BH / 3, 4, BH * 0.6);
  } else if (shape === 'tri_fighter') {
    ctx.fillStyle = isFlashing ? '#ffffff' : (rage ? '#f43f5e' : color);
    ctx.beginPath();
    ctx.moveTo(0, BH / 2);
    ctx.lineTo(-BW / 2, -BH / 4);
    ctx.lineTo(-BW / 4, -BH / 2);
    ctx.lineTo(0, -BH / 8);
    ctx.lineTo(BW / 4, -BH / 2);
    ctx.lineTo(BW / 2, -BH / 4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-BW / 3, BH / 8, 4, 10);
    ctx.fillRect(BW / 3 - 4, BH / 8, 4, 10);
  } else {
    ctx.fillStyle = isFlashing ? '#ffffff' : (rage ? '#ff0055' : color);
    ctx.beginPath();
    ctx.arc(0, 0, BW / 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isFlashing ? '#ffffff' : color;
    const subShields = 3;
    for (let i = 0; i < subShields; i++) {
      const angle = (timer * 0.05) + (i * Math.PI * 2) / subShields;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * (BW / 2.2), Math.sin(angle) * (BW / 2.2), 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (rage) {
    ctx.strokeStyle = `rgba(255,0,0,${0.4 + 0.3 * Math.sin(t * 3)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, BW / 2 + 10 + 4 * Math.sin(t * 4), 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawLevelTimer(ctx, timer, duration, W) {
  if (timer <= 0) return;
  const pct = Math.max(0, Math.min(1, timer / duration));
  const barW = 200;
  const barH = 6;
  const bx = (W - barW) / 2;
  const by = 52;

  const totalSeconds = Math.ceil(timer / 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeStr = `BOSS IN: ${minutes}:${String(seconds).padStart(2, '0')}`;

  ctx.save();
  ctx.font = "10px 'Courier New', monospace";
  ctx.fillStyle = '#00f5ff';
  ctx.shadowColor = '#00f5ff';
  ctx.shadowBlur = 6;
  ctx.textAlign = 'center';
  ctx.fillText(timeStr, W / 2, by - 6);

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.shadowBlur = 0;
  ctx.fillRect(bx, by, barW, barH);

  ctx.fillStyle = '#00f5ff';
  ctx.shadowColor = '#00f5ff';
  ctx.shadowBlur = 8;
  ctx.fillRect(bx, by, barW * pct, barH);

  ctx.restore();
}

export function drawBossHpBar(ctx, boss, W) {
  const pct = boss.hp / boss.maxHp;
  const barW = Math.min(W * 0.5, 400);
  const barH = 6;
  const bx = (W - barW) / 2;
  const by = 52;

  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(bx, by, barW, barH);

  const hpColor = pct > 0.6 ? '#ff4444' : pct > 0.3 ? '#ff8800' : '#ffcc00';
  ctx.fillStyle = hpColor;
  ctx.shadowColor = hpColor;
  ctx.shadowBlur = 8;
  ctx.fillRect(bx, by, barW * pct, barH);
  ctx.shadowBlur = 0;

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = "bold 9px 'Courier New', monospace";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(`⚠ ${boss.name}${boss.phase === 2 ? ' — PHASE 2' : ''}`, W / 2, by - 3);
}
