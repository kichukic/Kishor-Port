import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';

const BackgroundCanvas = styled.canvas`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  opacity: 0.75;
`;

const getPointAlongPath = (points, progress) => {
  if (points.length < 2) return null;
  const segments = [];
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i+1].x - points[i].x;
    const dy = points[i+1].y - points[i].y;
    const len = Math.sqrt(dx * dx + dy * dy);
    segments.push({ from: points[i], to: points[i+1], len });
    totalLength += len;
  }
  const targetDist = totalLength * Math.max(0, Math.min(1, progress));
  let currentDist = 0;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (currentDist + seg.len >= targetDist) {
      const segProgress = (targetDist - currentDist) / seg.len;
      return {
        x: seg.from.x + (seg.to.x - seg.from.x) * segProgress,
        y: seg.from.y + (seg.to.y - seg.from.y) * segProgress
      };
    }
    currentDist += seg.len;
  }
  return points[points.length - 1];
};

const createTraceObject = (path, extra = {}) => {
  return {
    points: path,
    pad: path[path.length - 1],
    startPad: path[0],
    pulseProgress: Math.random() * -2.0,
    pulseSpeed: 0.003 + Math.random() * 0.004,
    opacity: 0.22 + Math.random() * 0.12, // High visibility base opacity
    ...extra
  };
};

function SkillsMotherboardBackground() {
  const canvasRef = useRef(null);
  const tracesRef = useRef([]);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const section = canvas.parentElement;
    if (!section) return;

    // Force relative positioning on parent container for perfect absolute overlay
    section.style.position = 'relative';

    const ctx = canvas.getContext('2d');
    let w, h;

    const generateTraces = (secW, secH) => {
      const traces = [];
      
      // Resiliently locate the constellation container canvas parent
      const canvases = section.querySelectorAll('canvas');
      let chipElement = null;
      canvases.forEach(c => {
        if (c !== canvas) {
          chipElement = c.parentElement;
        }
      });

      const cardElements = section.querySelectorAll('[data-category-card="true"]');

      if (!chipElement) return;

      const parentRect = section.getBoundingClientRect();
      const chipRect = chipElement.getBoundingClientRect();

      const chipX = chipRect.left - parentRect.left;
      const chipY = chipRect.top - parentRect.top;
      const chipW = chipRect.width;
      const chipH = chipRect.height;

      // Align startY exactly with the horizontal grid lines (which act as physical border ticks/connectors!)
      const gridIndicesLeft = [2, 3, 4, 6, 8, 9, 10]; // grid ticks at y = 80, 120, 160, 240, 320, 360, 400px
      const gridIndicesRight = [2, 3, 5, 7, 8, 9, 10]; // staggered right grid ticks

      // 1. Generate Left Edge Traces aligned exactly to side grid ticks
      gridIndicesLeft.forEach(k => {
        const startY = chipY + 40 * k;
        const targetX = 15 + Math.random() * 40; 
        const diagonalOffset = Math.min(60, (startY - chipY - chipH / 2) * 0.45);
        const path = [
          { x: chipX, y: startY },
          { x: chipX - 50, y: startY }, // Lengthy parallel lead
          { x: chipX - 80, y: startY - diagonalOffset },
          { x: chipX - 120, y: startY - diagonalOffset },
          { x: targetX, y: startY - diagonalOffset }
        ];
        traces.push(createTraceObject(path, { isLeftTrace: true, chipX, chipY, chipW, chipH }));
      });

      // 2. Generate Right Edge Traces aligned exactly to side grid ticks
      gridIndicesRight.forEach(k => {
        const startY = chipY + 40 * k;
        const targetX = secW - 15 - Math.random() * 40; 
        const diagonalOffset = Math.min(60, (startY - chipY - chipH / 2) * 0.45);
        const path = [
          { x: chipX + chipW, y: startY },
          { x: chipX + chipW + 50, y: startY }, // Lengthy parallel lead
          { x: chipX + chipW + 80, y: startY - diagonalOffset },
          { x: chipX + chipW + 120, y: startY - diagonalOffset },
          { x: targetX, y: startY - diagonalOffset }
        ];
        traces.push(createTraceObject(path, { isRightTrace: true, chipX, chipY, chipW, chipH }));
      });

      // 3. Generate Bottom Edge Traces wiring to cards (45px lengthy leads down before bending)
      if (cardElements && cardElements.length > 0) {
        cardElements.forEach((card, idx) => {
          const cardRect = card.getBoundingClientRect();
          const cardX = cardRect.left - parentRect.left;
          const cardY = cardRect.top - parentRect.top;
          const cardW = cardRect.width;

          const startX1 = chipX + (idx / 4) * chipW + chipW * 0.08;
          const startX2 = chipX + (idx / 4) * chipW + chipW * 0.17;

          const targetX1 = cardX + cardW * 0.28;
          const targetX2 = cardX + cardW * 0.72;

          const path1 = [
            { x: startX1, y: chipY + chipH },
            { x: startX1, y: chipY + chipH + 45 }, // Lengthy lead straight down
            { x: targetX1, y: cardY - 30 },
            { x: targetX1, y: cardY }
          ];

          const path2 = [
            { x: startX2, y: chipY + chipH },
            { x: startX2, y: chipY + chipH + 45 }, // Lengthy lead straight down
            { x: targetX2, y: cardY - 30 },
            { x: targetX2, y: cardY }
          ];

          traces.push(createTraceObject(path1, { isBottomTrace: true, chipX, chipY, chipW, chipH }));
          traces.push(createTraceObject(path2, { isBottomTrace: true, chipX, chipY, chipW, chipH }));
        });
      }

      // 4. Generate Top Edge Traces (40px lengthy leads straight up before bending)
      const numTop = 6;
      for (let i = 0; i < numTop; i++) {
        const startX = chipX + 60 + (i / (numTop - 1)) * (chipW - 120);
        const targetY = Math.max(15, chipY - 60 - Math.random() * 40);
        const path = [
          { x: startX, y: chipY },
          { x: startX, y: chipY - 40 }, // Lengthy lead straight up
          { x: startX - 25, y: chipY - 65 },
          { x: startX - 25, y: targetY }
        ];
        traces.push(createTraceObject(path, { isTopTrace: true, chipX, chipY, chipW, chipH }));
      }

      tracesRef.current = traces;
    };

    const resize = () => {
      const rect = section.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * 2;
      canvas.height = h * 2;
      ctx.scale(2, 2);
      generateTraces(w, h);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Draw active circuit trace paths in high-fidelity white theme
      tracesRef.current.forEach(t => {
        ctx.strokeStyle = `rgba(255, 255, 255, ${t.opacity})`;
        ctx.lineWidth = 1.0; // Slightly thicker traces
        ctx.beginPath();
        ctx.moveTo(t.points[0].x, t.points[0].y);
        for (let idx = 1; idx < t.points.length; idx++) {
          ctx.lineTo(t.points[idx].x, t.points[idx].y);
        }
        ctx.stroke();

        // Draw physical micro-connector socket on the container borders
        ctx.strokeStyle = `rgba(255, 255, 255, ${t.opacity * 1.8})`;
        ctx.lineWidth = 1.2;

        if (t.isLeftTrace) {
          // Draw nice physical slot sticking out: [
          ctx.beginPath();
          ctx.moveTo(t.chipX + 2, t.startPad.y - 4);
          ctx.lineTo(t.chipX - 4, t.startPad.y - 4);
          ctx.lineTo(t.chipX - 4, t.startPad.y + 4);
          ctx.lineTo(t.chipX + 2, t.startPad.y + 4);
          ctx.stroke();

          // Solid internal contact point
          ctx.fillStyle = `rgba(255, 255, 255, ${t.opacity * 2.2})`;
          ctx.fillRect(t.chipX - 2, t.startPad.y - 2, 2, 4);
        } else if (t.isRightTrace) {
          // Draw nice physical slot sticking out: ]
          ctx.beginPath();
          ctx.moveTo(t.chipX + t.chipW - 2, t.startPad.y - 4);
          ctx.lineTo(t.chipX + t.chipW + 4, t.startPad.y - 4);
          ctx.lineTo(t.chipX + t.chipW + 4, t.startPad.y + 4);
          ctx.lineTo(t.chipX + t.chipW - 2, t.startPad.y + 4);
          ctx.stroke();

          // Solid internal contact point
          ctx.fillStyle = `rgba(255, 255, 255, ${t.opacity * 2.2})`;
          ctx.fillRect(t.chipX + t.chipW, t.startPad.y - 2, 2, 4);
        } else if (t.isBottomTrace) {
          // Draw bottom connector socket
          ctx.beginPath();
          ctx.moveTo(t.startPad.x - 4, t.chipY + t.chipH - 2);
          ctx.lineTo(t.startPad.x - 4, t.chipY + t.chipH + 4);
          ctx.lineTo(t.startPad.x + 4, t.chipY + t.chipH + 4);
          ctx.lineTo(t.startPad.x + 4, t.chipY + t.chipH - 2);
          ctx.stroke();

          ctx.fillStyle = `rgba(255, 255, 255, ${t.opacity * 2.2})`;
          ctx.fillRect(t.startPad.x - 2, t.chipY + t.chipH, 4, 2);
        } else if (t.isTopTrace) {
          // Draw top connector socket
          ctx.beginPath();
          ctx.moveTo(t.startPad.x - 4, t.chipY + 2);
          ctx.lineTo(t.startPad.x - 4, t.chipY - 4);
          ctx.lineTo(t.startPad.x + 4, t.chipY - 4);
          ctx.lineTo(t.startPad.x + 4, t.chipY + 2);
          ctx.stroke();

          ctx.fillStyle = `rgba(255, 255, 255, ${t.opacity * 2.2})`;
          ctx.fillRect(t.startPad.x - 2, t.chipY - 2, 4, 2);
        }

        // Draw end connection pad
        ctx.beginPath();
        ctx.arc(t.pad.x, t.pad.y, 2.0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${t.opacity * 1.8})`;
        ctx.fill();

        // Update electrical signal flow
        t.pulseProgress += t.pulseSpeed;
        if (t.pulseProgress >= 1.0) {
          t.pulseProgress = -Math.random() * 2.0;
        }

        // Draw flowing neon stardust energy pulse spark (glowing white)
        if (t.pulseProgress > 0) {
          const pos = getPointAlongPath(t.points, t.pulseProgress);
          if (pos) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      });

      animFrameRef.current = requestAnimationFrame(draw);
    };

    // Stagger layout trigger slightly to allow DOM structures to settle
    const timer = setTimeout(() => {
      resize();
      draw();
    }, 150);

    window.addEventListener('resize', resize);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <BackgroundCanvas ref={canvasRef} />;
}

export default SkillsMotherboardBackground;
