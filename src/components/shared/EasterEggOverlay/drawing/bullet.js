export function drawBullet(ctx, b) {
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 8;
  ctx.fillRect(b.x - 1.5, b.y, 3, 14);
  ctx.shadowBlur = 0;
}
