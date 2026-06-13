export function drawMissile(ctx, b) {
  ctx.save();
  ctx.translate(b.x, b.y);

  const angle = Math.atan2(b.vy, b.vx);
  ctx.rotate(angle + Math.PI / 2);

  ctx.fillStyle = '#00eeff';
  ctx.shadowColor = '#00eeff';
  ctx.shadowBlur = 10;

  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(-4, 4);
  ctx.lineTo(0, 2);
  ctx.lineTo(4, 4);
  ctx.closePath();
  ctx.fill();

  const ft = Date.now() / 60;
  ctx.fillStyle = `rgba(255,${150 + Math.sin(ft) * 80},0,0.8)`;
  ctx.beginPath();
  ctx.ellipse(0, 5 + Math.abs(Math.sin(ft)) * 3, 2.5, 4 + Math.abs(Math.sin(ft)) * 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
