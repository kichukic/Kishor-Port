import { SHIP_W, SHIP_H } from '../constants';

export function drawShip(ctx, x, y, flash, shielded, vx = 0, vy = 0) {
  ctx.save();
  ctx.translate(x, y);

  const rollAngle = vx * 0.04;
  ctx.rotate(rollAngle);

  const isFlashing = flash;
  const time = Date.now();
  const flamePulse = 1 + 0.3 * Math.sin(time / 40);
  const vyFactor = vy < 0 ? 1.4 : (vy > 0 ? 0.6 : 1.0);
  const flameLength = (8 + Math.random() * 6) * flamePulse * vyFactor;

  ctx.fillStyle = '#334155';
  ctx.fillRect(-6, SHIP_H / 2 - 4, 3, 5);
  ctx.fillRect(3, SHIP_H / 2 - 4, 3, 5);

  let gradFlame = ctx.createLinearGradient(0, SHIP_H / 2, 0, SHIP_H / 2 + flameLength);
  gradFlame.addColorStop(0, 'rgba(0, 240, 255, 1)');
  gradFlame.addColorStop(0.3, 'rgba(0, 100, 255, 0.8)');
  gradFlame.addColorStop(1, 'rgba(0, 0, 255, 0)');

  ctx.fillStyle = isFlashing ? 'rgba(255, 50, 50, 0.8)' : gradFlame;
  ctx.shadowColor = isFlashing ? '#ff0000' : '#00aaff';
  ctx.shadowBlur = 12;

  ctx.beginPath();
  ctx.ellipse(-4.5, SHIP_H / 2 + 1, 3, flameLength, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(4.5, SHIP_H / 2 + 1, 3, flameLength, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(-4.5, SHIP_H / 2 + 1, 1.2, flameLength * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(4.5, SHIP_H / 2 + 1, 1.2, flameLength * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  if (shielded) {
    const shieldOsc = 0.5 + 0.3 * Math.sin(time / 150);
    ctx.strokeStyle = `rgba(168, 85, 247, ${0.45 + 0.25 * Math.sin(time / 100)})`;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 15 + 7 * Math.sin(time / 120);

    ctx.beginPath();
    ctx.arc(0, 0, SHIP_W / 2 + 8, 0, Math.PI * 2);
    ctx.stroke();

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

  let bodyGrad = ctx.createLinearGradient(-SHIP_W / 2, 0, SHIP_W / 2, 0);
  if (isFlashing) {
    bodyGrad.addColorStop(0, '#ff6666');
    bodyGrad.addColorStop(0.5, '#ffaaaa');
    bodyGrad.addColorStop(1, '#ff6666');
  } else {
    bodyGrad.addColorStop(0, '#1e293b');
    bodyGrad.addColorStop(0.35, '#475569');
    bodyGrad.addColorStop(0.5, '#f8fafc');
    bodyGrad.addColorStop(0.65, '#475569');
    bodyGrad.addColorStop(1, '#1e293b');
  }

  ctx.fillStyle = bodyGrad;
  ctx.shadowColor = isFlashing ? '#ff4444' : '#38bdf8';
  ctx.shadowBlur = 8;

  ctx.beginPath();
  ctx.moveTo(0, -SHIP_H / 2);
  ctx.lineTo(-6, -SHIP_H / 4);
  ctx.lineTo(-SHIP_W / 2, SHIP_H / 2 - 4);
  ctx.lineTo(-SHIP_W / 4, SHIP_H / 4);
  ctx.lineTo(-8, SHIP_H / 2 - 3);
  ctx.lineTo(0, SHIP_H / 2 - 8);
  ctx.lineTo(8, SHIP_H / 2 - 3);
  ctx.lineTo(SHIP_W / 4, SHIP_H / 4);
  ctx.lineTo(SHIP_W / 2, SHIP_H / 2 - 4);
  ctx.lineTo(6, -SHIP_H / 4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-SHIP_W / 2, SHIP_H / 2 - 12, 2.5, 8);
  ctx.fillRect(SHIP_W / 2 - 2.5, SHIP_H / 2 - 12, 2.5, 8);

  if (!isFlashing) {
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.beginPath();
    ctx.arc(-SHIP_W / 2 + 1.2, SHIP_H / 2 - 4, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#22c55e';
    ctx.shadowColor = '#22c55e';
    ctx.beginPath();
    ctx.arc(SHIP_W / 2 - 1.2, SHIP_H / 2 - 4, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  let accentGrad = ctx.createLinearGradient(0, -SHIP_H / 3, 0, SHIP_H / 3);
  accentGrad.addColorStop(0, '#38bdf8');
  accentGrad.addColorStop(1, '#0284c7');
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

  let canopyGrad = ctx.createLinearGradient(0, -10, 0, 4);
  canopyGrad.addColorStop(0, '#38bdf8');
  canopyGrad.addColorStop(1, '#0369a1');
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
