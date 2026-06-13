import { ENEMY_W, ENEMY_H } from '../constants';

function shadeColor(hex, percent) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  r = Math.max(0, Math.min(255, r + Math.round(r * percent / 100)));
  g = Math.max(0, Math.min(255, g + Math.round(g * percent / 100)));
  b = Math.max(0, Math.min(255, b + Math.round(b * percent / 100)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function drawEnemy(ctx, e) {
  const { shape, color, hp, maxHp, timer, shield } = e;
  const isFlashing = e.flash > 0;
  const t = Date.now() / 200;
  const pulse = 0.8 + 0.2 * Math.sin(t + e.x);

  ctx.save();
  ctx.translate(e.x, e.y);

  if (e.cloaked) {
    ctx.globalAlpha = 0.15 + 0.1 * Math.sin(Date.now() / 150);
  }

  ctx.shadowColor = color;
  ctx.shadowBlur = 8 + 4 * pulse;

  if (shield > 0) {
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, ENEMY_W / 2 + 3.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = color;

  const flk = Math.random();
  const flamePulse = 1 + 0.3 * Math.sin(Date.now() / 40 + e.x);

  if (shape === 'tri') {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-ENEMY_W / 4 - 1.5, -ENEMY_H / 2 - 2, 3, 4);
    ctx.fillRect(ENEMY_W / 4 - 1.5, -ENEMY_H / 2 - 2, 3, 4);
    for (const side of [-1, 1]) {
      const fx = side * ENEMY_W / 4;
      const fy = -ENEMY_H / 2 + 1;
      const fLen = (7 + flk * 5) * flamePulse;
      let fGrad = ctx.createLinearGradient(fx, fy, fx, fy - fLen);
      fGrad.addColorStop(0, isFlashing ? '#ff8888' : color);
      fGrad.addColorStop(0.3, isFlashing ? '#ffaaaa' : shadeColor(color, 40));
      fGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = fGrad;
      ctx.shadowColor = isFlashing ? '#ff4444' : color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(fx, fy, 3, fLen, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = isFlashing ? '#ffcccc' : '#ffffff';
      ctx.beginPath();
      ctx.ellipse(fx, fy, 1.2, fLen * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    let wingGrad = ctx.createLinearGradient(-ENEMY_W / 2, 0, ENEMY_W / 2, 0);
    wingGrad.addColorStop(0, '#1e293b');
    wingGrad.addColorStop(0.3, color);
    wingGrad.addColorStop(0.5, '#f8fafc');
    wingGrad.addColorStop(0.7, color);
    wingGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = wingGrad;

    ctx.beginPath();
    ctx.moveTo(0, ENEMY_H / 2);
    ctx.lineTo(-ENEMY_W / 2, -ENEMY_H / 2);
    ctx.lineTo(-ENEMY_W / 4, -ENEMY_H / 6);
    ctx.lineTo(0, -ENEMY_H / 2.5);
    ctx.lineTo(ENEMY_W / 4, -ENEMY_H / 6);
    ctx.lineTo(ENEMY_W / 2, -ENEMY_H / 2);
    ctx.closePath();
    ctx.fill();

    let canopyGrad = ctx.createLinearGradient(0, -2, 0, ENEMY_H / 3);
    canopyGrad.addColorStop(0, '#ffffff');
    canopyGrad.addColorStop(1, color);
    ctx.fillStyle = canopyGrad;
    ctx.beginPath();
    ctx.moveTo(0, ENEMY_H / 4);
    ctx.lineTo(-3, 0);
    ctx.lineTo(0, -4);
    ctx.lineTo(3, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-ENEMY_W / 3, -ENEMY_H / 3);
    ctx.lineTo(0, ENEMY_H / 6);
    ctx.lineTo(ENEMY_W / 3, -ENEMY_H / 3);
    ctx.stroke();

  } else if (shape === 'saucer') {
    for (let i = -1; i <= 1; i++) {
      const tx = i * ENEMY_W / 5;
      const ty = -ENEMY_H / 3.5;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(tx - 1.5, ty - 2, 3, 3);
      const tLen = (5 + flk * 4) * flamePulse;
      let tGrad = ctx.createLinearGradient(tx, ty, tx, ty - tLen);
      tGrad.addColorStop(0, isFlashing ? '#ff8888' : color);
      tGrad.addColorStop(0.3, isFlashing ? '#ffaaaa' : shadeColor(color, 40));
      tGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = tGrad;
      ctx.shadowColor = isFlashing ? '#ff4444' : color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(tx, ty, 2.5, tLen, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = isFlashing ? '#ffcccc' : '#ffffff';
      ctx.beginPath();
      ctx.ellipse(tx, ty, 1, tLen * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    let diskGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, ENEMY_W / 2);
    diskGrad.addColorStop(0, '#475569');
    diskGrad.addColorStop(0.7, color);
    diskGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = diskGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, ENEMY_W / 1.8, ENEMY_H / 2.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, ENEMY_W / 2.4, ENEMY_H / 4.2, 0, 0, Math.PI * 2);
    ctx.stroke();

    let domeGrad = ctx.createRadialGradient(0, -2, 1, 0, -2, ENEMY_W / 4.5);
    domeGrad.addColorStop(0, '#ffffff');
    domeGrad.addColorStop(0.4, color);
    domeGrad.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = domeGrad;
    ctx.beginPath();
    ctx.ellipse(0, -2, ENEMY_W / 4.5, ENEMY_H / 6.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 4; i++) {
      const ang = (timer * 0.04) + (i * Math.PI) / 2;
      const px = Math.cos(ang) * (ENEMY_W / 2.1);
      const py = Math.sin(ang) * (ENEMY_H / 3.4);
      ctx.beginPath();
      ctx.arc(px, py, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (shape === 'diamond') {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-2, -ENEMY_H / 2 - 1, 4, 3);
    const dLen = (8 + flk * 5) * flamePulse;
    let dGrad = ctx.createLinearGradient(0, -ENEMY_H / 2, 0, -ENEMY_H / 2 - dLen);
    dGrad.addColorStop(0, isFlashing ? '#ff8888' : '#ffffff');
    dGrad.addColorStop(0.2, isFlashing ? '#ffaaaa' : color);
    dGrad.addColorStop(0.6, isFlashing ? '#ffcccc' : shadeColor(color, 30));
    dGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = dGrad;
    ctx.shadowColor = isFlashing ? '#ff4444' : color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.ellipse(0, -ENEMY_H / 2, 4, dLen, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isFlashing ? '#ffcccc' : '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, -ENEMY_H / 2, 1.5, dLen * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    const dw = ENEMY_W / 2;
    const dh = ENEMY_H / 2;

    let g1 = ctx.createLinearGradient(-dw, 0, 0, 0);
    g1.addColorStop(0, color); g1.addColorStop(1, '#ffffff');
    ctx.fillStyle = g1;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(-dw, 0); ctx.lineTo(0, -dh); ctx.closePath(); ctx.fill();

    let g2 = ctx.createLinearGradient(dw, 0, 0, 0);
    g2.addColorStop(0, color); g2.addColorStop(1, '#ffffff');
    ctx.fillStyle = g2;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(dw, 0); ctx.lineTo(0, -dh); ctx.closePath(); ctx.fill();

    let g3 = ctx.createLinearGradient(-dw, 0, 0, 0);
    g3.addColorStop(0, color); g3.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = g3;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(-dw, 0); ctx.lineTo(0, dh); ctx.closePath(); ctx.fill();

    let g4 = ctx.createLinearGradient(dw, 0, 0, 0);
    g4.addColorStop(0, color); g4.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = g4;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(dw, 0); ctx.lineTo(0, dh); ctx.closePath(); ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

  } else if (shape === 'orb') {
    for (const side of [-1, 1]) {
      const ox = side * ENEMY_W / 3;
      const oy = -ENEMY_H / 5;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(ox - 1.5, oy - 2, 3, 3);
      const oLen = (5 + flk * 4) * flamePulse;
      let oGrad = ctx.createLinearGradient(ox, oy, ox, oy - oLen);
      oGrad.addColorStop(0, isFlashing ? '#ff8888' : color);
      oGrad.addColorStop(0.3, isFlashing ? '#ffaaaa' : shadeColor(color, 40));
      oGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = oGrad;
      ctx.shadowColor = isFlashing ? '#ff4444' : color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(ox, oy, 2.5, oLen, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = isFlashing ? '#ffcccc' : '#ffffff';
      ctx.beginPath();
      ctx.ellipse(ox, oy, 1, oLen * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, ENEMY_W / 2.2, -Math.PI / 3, (4 * Math.PI) / 3);
    ctx.stroke();

    let ballGrad = ctx.createRadialGradient(-3, -3, 1, 0, 0, ENEMY_W / 3.2);
    ballGrad.addColorStop(0, '#f8fafc');
    ballGrad.addColorStop(0.3, color);
    ballGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = ballGrad;
    ctx.beginPath();
    ctx.arc(0, 0, ENEMY_W / 3.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-ENEMY_W / 6, -1.5, ENEMY_W / 3, 3);

    ctx.fillStyle = '#ffffff';
    const ang = timer * 0.06;
    ctx.beginPath();
    ctx.arc(Math.cos(ang) * (ENEMY_W / 2.1), Math.sin(ang) * (ENEMY_W / 2.1), 1.8, 0, Math.PI * 2);
    ctx.fill();

  } else if (shape === 'spikey') {
    for (let i = -1; i <= 1; i++) {
      const angle = (timer * 0.02) + i * 0.4 - Math.PI / 2;
      const tipX = Math.cos(angle) * ENEMY_W / 2;
      const tipY = Math.sin(angle) * ENEMY_W / 2;
      const sLen = (4 + flk * 3) * flamePulse;
      let sGrad = ctx.createLinearGradient(tipX, tipY, tipX, tipY - sLen);
      sGrad.addColorStop(0, isFlashing ? '#ff8888' : color);
      sGrad.addColorStop(0.3, isFlashing ? '#ffaaaa' : shadeColor(color, 40));
      sGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sGrad;
      ctx.shadowColor = isFlashing ? '#ff4444' : color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(tipX, tipY, 2, sLen, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = isFlashing ? '#ffcccc' : '#ffffff';
      ctx.beginPath();
      ctx.ellipse(tipX, tipY, 0.8, sLen * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    let coreGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, ENEMY_W / 4.2);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.5, color);
    coreGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, ENEMY_W / 4.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4 + (timer * 0.02);
      const r = i % 2 === 0 ? ENEMY_W / 2 : ENEMY_W / 3.5;

      let spGrad = ctx.createLinearGradient(0, 0, Math.cos(angle) * r, Math.sin(angle) * r);
      spGrad.addColorStop(0, color);
      spGrad.addColorStop(0.8, color);
      spGrad.addColorStop(1, '#ffffff');

      ctx.strokeStyle = spGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * r, Math.sin(angle) * r, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

  } else if (shape === 'heavy') {
    for (const side of [-1, 1]) {
      const hx = side * ENEMY_W / 3;
      const hy = -ENEMY_H / 2;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(hx - 2.5, hy - 2, 5, 4);
      const hLen = (9 + flk * 6) * flamePulse;
      let hGrad = ctx.createLinearGradient(hx, hy, hx, hy - hLen);
      hGrad.addColorStop(0, isFlashing ? '#ff8888' : '#ff8800');
      hGrad.addColorStop(0.15, isFlashing ? '#ffaaaa' : '#ffffff');
      hGrad.addColorStop(0.4, isFlashing ? '#ffcccc' : color);
      hGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = hGrad;
      ctx.shadowColor = isFlashing ? '#ff4444' : '#ff8800';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.ellipse(hx, hy, 3.5, hLen, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = isFlashing ? '#ffcccc' : '#ffffff';
      ctx.beginPath();
      ctx.ellipse(hx, hy, 1.5, hLen * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#334155';
    ctx.fillRect(-ENEMY_W / 2, -ENEMY_H / 2.2, ENEMY_W / 4.5, ENEMY_H * 0.82);
    ctx.fillRect(ENEMY_W / 2 - ENEMY_W / 4.5, -ENEMY_H / 2.2, ENEMY_W / 4.5, ENEMY_H * 0.82);

    let bodyGrad = ctx.createLinearGradient(0, -ENEMY_H / 2, 0, ENEMY_H / 2);
    bodyGrad.addColorStop(0, '#1e293b');
    bodyGrad.addColorStop(0.4, color);
    bodyGrad.addColorStop(0.5, '#cbd5e1');
    bodyGrad.addColorStop(0.6, color);
    bodyGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bodyGrad;

    ctx.beginPath();
    ctx.moveTo(0, ENEMY_H / 2);
    ctx.lineTo(-ENEMY_W / 3.5, ENEMY_H / 4);
    ctx.lineTo(-ENEMY_W / 3.5, -ENEMY_H / 2);
    ctx.lineTo(ENEMY_W / 3.5, -ENEMY_H / 2);
    ctx.lineTo(ENEMY_W / 3.5, ENEMY_H / 4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-3, -ENEMY_H / 3, 6, 2);

  } else if (shape === 'serpent') {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, -ENEMY_H / 2 - 2, 4, 4);
    const sLen2 = (7 + flk * 5) * flamePulse;
    let sGrad2 = ctx.createLinearGradient(0, -ENEMY_H / 2, 0, -ENEMY_H / 2 - sLen2);
    sGrad2.addColorStop(0, isFlashing ? '#ff8888' : color);
    sGrad2.addColorStop(0.3, isFlashing ? '#ffaaaa' : shadeColor(color, 40));
    sGrad2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sGrad2;
    ctx.shadowColor = isFlashing ? '#ff4444' : color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.ellipse(0, -ENEMY_H / 2, 3, sLen2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isFlashing ? '#ffcccc' : '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, -ENEMY_H / 2, 1.2, sLen2 * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let i = 0; i <= 12; i++) {
      const seg = i / 12;
      const sx2 = Math.sin(seg * Math.PI * 3 + timer * 0.08) * (ENEMY_W / 3.5);
      const sy2 = -ENEMY_H / 2 + seg * ENEMY_H;
      if (i === 0) ctx.moveTo(sx2, sy2);
      else ctx.lineTo(sx2, sy2);
    }
    ctx.stroke();

    ctx.lineWidth = 1;
    ctx.strokeStyle = shadeColor(color, 40);
    ctx.beginPath();
    for (let i = 0; i <= 12; i++) {
      const seg = i / 12;
      const sx2 = Math.sin(seg * Math.PI * 3 + timer * 0.08) * (ENEMY_W / 3.5) + 2;
      const sy2 = -ENEMY_H / 2 + seg * ENEMY_H + 1;
      if (i === 0) ctx.moveTo(sx2, sy2);
      else ctx.lineTo(sx2, sy2);
    }
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(0, -ENEMY_H / 3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

  } else if (shape === 'cyclops') {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-ENEMY_W / 4, -ENEMY_H / 2 - 2, 3, 4);
    ctx.fillRect(ENEMY_W / 4, -ENEMY_H / 2 - 2, 3, 4);
    for (const side of [-1, 1]) {
      const cx = side * ENEMY_W / 4;
      const cy = -ENEMY_H / 2 + 1;
      const cLen = (6 + flk * 4) * flamePulse;
      let cGrad = ctx.createLinearGradient(cx, cy, cx, cy - cLen);
      cGrad.addColorStop(0, isFlashing ? '#ff8888' : color);
      cGrad.addColorStop(0.3, isFlashing ? '#ffaaaa' : shadeColor(color, 40));
      cGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = cGrad;
      ctx.shadowColor = isFlashing ? '#ff4444' : color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 2.5, cLen, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = isFlashing ? '#ffcccc' : '#ffffff';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 1, cLen * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    let bodyGrad2 = ctx.createLinearGradient(0, -ENEMY_H / 2, 0, ENEMY_H / 2);
    bodyGrad2.addColorStop(0, shadeColor(color, 30));
    bodyGrad2.addColorStop(0.5, color);
    bodyGrad2.addColorStop(1, shadeColor(color, -30));
    ctx.fillStyle = bodyGrad2;
    ctx.beginPath();
    ctx.ellipse(0, 0, ENEMY_W / 2.2, ENEMY_H / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = shadeColor(color, -20);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, ENEMY_W / 2.2, ENEMY_H / 2, 0, 0, Math.PI * 2);
    ctx.stroke();

    const eyeR = ENEMY_W / 4;
    let eyeGrad = ctx.createRadialGradient(0, -1, 1, 0, -1, eyeR);
    eyeGrad.addColorStop(0, '#ffffff');
    eyeGrad.addColorStop(0.2, '#ffffff');
    eyeGrad.addColorStop(0.45, '#ef4444');
    eyeGrad.addColorStop(0.7, shadeColor(color, -40));
    eyeGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.arc(0, -1, eyeR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, -1, eyeR * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-eyeR * 0.15, -eyeR * 0.3, eyeR * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, -1, eyeR + 2, -0.5, 0.5);
    ctx.stroke();

  } else if (shape === 'manta') {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, -ENEMY_H / 2 - 2, 3, 4);
    const mLen = (6 + flk * 4) * flamePulse;
    let mGrad = ctx.createLinearGradient(0, -ENEMY_H / 2, 0, -ENEMY_H / 2 - mLen);
    mGrad.addColorStop(0, isFlashing ? '#ff8888' : color);
    mGrad.addColorStop(0.3, isFlashing ? '#ffaaaa' : shadeColor(color, 40));
    mGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = mGrad;
    ctx.shadowColor = isFlashing ? '#ff4444' : color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.ellipse(0, -ENEMY_H / 2, 3, mLen, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isFlashing ? '#ffcccc' : '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, -ENEMY_H / 2, 1.2, mLen * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    let wingGrad2 = ctx.createLinearGradient(-ENEMY_W, 0, ENEMY_W, 0);
    wingGrad2.addColorStop(0, shadeColor(color, -40));
    wingGrad2.addColorStop(0.4, color);
    wingGrad2.addColorStop(0.5, shadeColor(color, 30));
    wingGrad2.addColorStop(0.6, color);
    wingGrad2.addColorStop(1, shadeColor(color, -40));
    ctx.fillStyle = wingGrad2;
    ctx.beginPath();
    ctx.moveTo(0, -ENEMY_H / 4);
    ctx.quadraticCurveTo(-ENEMY_W / 1.6, -ENEMY_H / 3, -ENEMY_W / 1.1, ENEMY_H / 6);
    ctx.quadraticCurveTo(-ENEMY_W / 2, ENEMY_H / 3, 0, ENEMY_H / 4);
    ctx.quadraticCurveTo(ENEMY_W / 2, ENEMY_H / 3, ENEMY_W / 1.1, ENEMY_H / 6);
    ctx.quadraticCurveTo(ENEMY_W / 1.6, -ENEMY_H / 3, 0, -ENEMY_H / 4);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-ENEMY_W / 2.5, ENEMY_H / 6);
    ctx.quadraticCurveTo(0, -ENEMY_H / 6, ENEMY_W / 2.5, ENEMY_H / 6);
    ctx.stroke();

    let headGrad = ctx.createRadialGradient(0, -2, 1, 0, -2, ENEMY_W / 4);
    headGrad.addColorStop(0, '#ffffff');
    headGrad.addColorStop(0.4, color);
    headGrad.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(0, -ENEMY_H / 5, ENEMY_W / 5, ENEMY_H / 4, 0, 0, Math.PI * 2);
    ctx.fill();

    for (const side of [-1, 1]) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(side * ENEMY_W / 6, -ENEMY_H / 4, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const tailAng = Math.PI / 2 + (i - 1) * 0.3;
      ctx.beginPath();
      ctx.moveTo(0, ENEMY_H / 4);
      ctx.lineTo(Math.cos(tailAng) * (ENEMY_W / 2), ENEMY_H / 2 + i * 3);
      ctx.stroke();
    }

  } else {
    const pts = [[-1,-1],[1,-1],[1,1],[-1,1]];
    for (const [sx, sy] of pts) {
      const ex = sx * ENEMY_W / 2.1;
      const ey = sy * ENEMY_H / 2.1;
      const eLen = (5 + flk * 3) * flamePulse;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(ex - sx * 2 - 1, ey - sy * 2 - 1, 2, 2);
      let eGrad = ctx.createLinearGradient(ex, ey, ex + sx * eLen, ey + sy * eLen);
      eGrad.addColorStop(0, isFlashing ? '#ff8888' : color);
      eGrad.addColorStop(0.3, isFlashing ? '#ffaaaa' : shadeColor(color, 40));
      eGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = eGrad;
      ctx.shadowColor = isFlashing ? '#ff4444' : color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(ex + sx * eLen * 0.3, ey + sy * eLen * 0.3, 2, eLen * 0.6, Math.atan2(sy, sx), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = isFlashing ? '#ffcccc' : '#ffffff';
      ctx.beginPath();
      ctx.ellipse(ex + sx * eLen * 0.15, ey + sy * eLen * 0.15, 0.8, eLen * 0.25, Math.atan2(sy, sx), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;

    ctx.beginPath();
    ctx.moveTo(-ENEMY_W / 2.1, -ENEMY_H / 2.1);
    ctx.lineTo(ENEMY_W / 2.1, ENEMY_H / 2.1);
    ctx.moveTo(ENEMY_W / 2.1, -ENEMY_H / 2.1);
    ctx.lineTo(-ENEMY_W / 2.1, ENEMY_H / 2.1);
    ctx.stroke();

    let fusGrad = ctx.createLinearGradient(0, -ENEMY_H / 2.3, 0, ENEMY_H / 2.3);
    fusGrad.addColorStop(0, '#0f172a');
    fusGrad.addColorStop(0.5, color);
    fusGrad.addColorStop(1, '#334155');
    ctx.fillStyle = fusGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, ENEMY_W / 5.2, ENEMY_H / 2.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-ENEMY_W / 2.1, ENEMY_H / 2.1, 2, 0, Math.PI * 2);
    ctx.arc(ENEMY_W / 2.1, ENEMY_H / 2.1, 2, 0, Math.PI * 2);
    ctx.arc(ENEMY_W / 2.1, -ENEMY_H / 2.1, 2, 0, Math.PI * 2);
    ctx.arc(-ENEMY_W / 2.1, -ENEMY_H / 2.1, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  if (maxHp > 1 && hp > 0) {
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(-12, -ENEMY_H / 2 - 8, 24, 3);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(-12, -ENEMY_H / 2 - 8, 24 * (hp / maxHp), 3);
  }

  ctx.restore();
}
