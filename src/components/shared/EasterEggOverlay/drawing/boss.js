import { shadeColor } from './enemy';
import { BOSS_DEFS } from '../constants';

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
