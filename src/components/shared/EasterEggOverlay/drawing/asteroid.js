export function drawAsteroid(ctx, a, W, H) {
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
