export function drawLifePickup(ctx, lp) {
  const t = Date.now() / 300;
  const glow = 0.6 + 0.4 * Math.sin(t + lp.wobble);

  ctx.save();
  ctx.translate(lp.x, lp.y);
  ctx.shadowColor = '#22ff66';
  ctx.shadowBlur = 14 + 8 * glow;

  ctx.strokeStyle = `rgba(34, 255, 102, ${0.5 + 0.3 * glow})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#22ff66';
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.bezierCurveTo(-7, -1, -7, -7, 0, -5);
  ctx.bezierCurveTo(7, -7, 7, -1, 0, 4);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.arc(-2.5, -3, 1.5, 0, Math.PI * 2);
  ctx.fill();

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
