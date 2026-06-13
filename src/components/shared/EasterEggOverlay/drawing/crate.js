import { PU, CRATE_W, CRATE_H } from '../constants';

export function drawCrate(ctx, c) {
  const info = PU[c.type];
  const t = Date.now() / 400;
  const glow = 0.5 + 0.4 * Math.sin(t + c.wobble);

  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.shadowColor = info.color;
  ctx.shadowBlur = 12 + 8 * glow;

  ctx.strokeStyle = info.color;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.85;
  ctx.strokeRect(-CRATE_W / 2, -CRATE_H / 2, CRATE_W, CRATE_H);

  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(-CRATE_W / 2, 0); ctx.lineTo(CRATE_W / 2, 0);
  ctx.moveTo(0, -CRATE_H / 2); ctx.lineTo(0, CRATE_H / 2);
  ctx.stroke();

  ctx.globalAlpha = 0.1 + 0.08 * glow;
  ctx.fillStyle = info.color;
  ctx.fillRect(-CRATE_W / 2, -CRATE_H / 2, CRATE_W, CRATE_H);

  ctx.globalAlpha = 0.9;
  ctx.fillStyle = info.color;
  ctx.font = "bold 11px 'Courier New', monospace";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(info.label.slice(0, 3), 0, 0);

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
