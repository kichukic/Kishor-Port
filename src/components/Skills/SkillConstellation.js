import React, { useRef, useEffect, useState } from 'react';
import styled from '@emotion/styled';

const ConstellationContainer = styled.div`
  width: 100%;
  height: 450px;
  position: relative;
  margin-bottom: 3rem;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(255, 255, 255, 0.04);
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
`;

const Tooltip = styled.div`
  position: absolute;
  padding: 0.5rem 0.8rem;
  background: rgba(10, 10, 15, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  backdrop-filter: blur(8px);
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.75rem;
  color: #ffffff;
  pointer-events: none;
  z-index: 10;
  white-space: nowrap;
  transform: translate(-50%, -120%);
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 0.2s ease;
`;

const TooltipName = styled.div`
  font-weight: 700;
  margin-bottom: 2px;
`;

const TooltipLevel = styled.div`
  color: #00ff88;
  font-size: 0.7rem;
`;

const TooltipCategory = styled.div`
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.65rem;
`;

const categoryColors = {
  'Backend': { r: 255, g: 255, b: 255 },
  'Database': { r: 0, g: 200, b: 150 },
  'DevOps & Cloud': { r: 100, g: 180, b: 255 },
  'Languages & Tools': { r: 200, g: 150, b: 255 },
};

const categoryPositions = {
  'Backend': { cx: 0.2, cy: 0.35 },
  'Database': { cx: 0.75, cy: 0.25 },
  'DevOps & Cloud': { cx: 0.75, cy: 0.7 },
  'Languages & Tools': { cx: 0.2, cy: 0.7 },
};

function SkillConstellation({ categories }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, name: '', level: 0, category: '' });
  const nodesRef = useRef([]);
  const animFrameRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    let w, h;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * 2;
      canvas.height = h * 2;
      ctx.scale(2, 2);
      layoutNodes();
    };

    const layoutNodes = () => {
      const nodes = [];
      categories.forEach((cat) => {
        const center = categoryPositions[cat.category] || { cx: 0.5, cy: 0.5 };
        const color = categoryColors[cat.category] || { r: 255, g: 255, b: 255 };
        const skills = cat.skills;
        const radius = Math.min(w, h) * 0.12;
        const angleStep = (Math.PI * 2) / skills.length;

        skills.forEach((skill, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const spreadRadius = radius * (0.6 + (skill.level / 100) * 0.4);
          const baseX = center.cx * w + Math.cos(angle) * spreadRadius;
          const baseY = center.cy * h + Math.sin(angle) * spreadRadius;

          nodes.push({
            x: baseX,
            y: baseY,
            baseX,
            baseY,
            radius: 3 + (skill.level / 100) * 4,
            name: skill.name,
            level: skill.level,
            category: cat.category,
            color,
            floatOffset: Math.random() * Math.PI * 2,
            floatSpeed: 0.3 + Math.random() * 0.4,
          });
        });
      });
      nodesRef.current = nodes;
    };

    const draw = () => {
      timeRef.current += 0.016;
      ctx.clearRect(0, 0, w, h);

      const nodes = nodesRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      nodes.forEach((node) => {
        const floatX = Math.sin(timeRef.current * node.floatSpeed + node.floatOffset) * 3;
        const floatY = Math.cos(timeRef.current * node.floatSpeed * 0.7 + node.floatOffset) * 4;
        node.x = node.baseX + floatX;
        node.y = node.baseY + floatY;
      });

      // Draw connections within same category
      categories.forEach((cat) => {
        const catNodes = nodes.filter(n => n.category === cat.category);
        const color = categoryColors[cat.category] || { r: 255, g: 255, b: 255 };

        for (let i = 0; i < catNodes.length; i++) {
          for (let j = i + 1; j < catNodes.length; j++) {
            const a = catNodes[i];
            const b = catNodes[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = Math.min(w, h) * 0.25;

            if (dist < maxDist) {
              const opacity = (1 - dist / maxDist) * 0.25;
              const isHighlighted =
                Math.sqrt((mx - a.x) ** 2 + (my - a.y) ** 2) < 50 ||
                Math.sqrt((mx - b.x) ** 2 + (my - b.y) ** 2) < 50;

              ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${isHighlighted ? opacity * 3 : opacity})`;
              ctx.lineWidth = isHighlighted ? 1.2 : 0.6;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
      });

      // Draw faint cross-category connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (nodes[i].category === nodes[j].category) continue;
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < Math.min(w, h) * 0.15) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.lineWidth = 0.4;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      let hoveredNode = null;
      nodes.forEach((node) => {
        const distToMouse = Math.sqrt((mx - node.x) ** 2 + (my - node.y) ** 2);
        const isHovered = distToMouse < 20;
        if (isHovered) hoveredNode = node;

        const baseOpacity = 0.4 + (node.level / 100) * 0.6;
        const drawRadius = isHovered ? node.radius * 1.8 : node.radius;
        const drawOpacity = isHovered ? 1 : baseOpacity;

        // Glow
        ctx.shadowBlur = isHovered ? 20 : 8;
        ctx.shadowColor = `rgba(${node.color.r}, ${node.color.g}, ${node.color.b}, ${drawOpacity * 0.6})`;

        // Outer ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, drawRadius + 2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${node.color.r}, ${node.color.g}, ${node.color.b}, ${drawOpacity * 0.3})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Inner fill
        ctx.beginPath();
        ctx.arc(node.x, node.y, drawRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${node.color.r}, ${node.color.g}, ${node.color.b}, ${drawOpacity})`;
        ctx.fill();

        // Label
        ctx.shadowBlur = 0;
        ctx.font = `${isHovered ? '11px' : '9px'} 'Courier New', monospace`;
        ctx.fillStyle = `rgba(255, 255, 255, ${isHovered ? 0.9 : 0.35})`;
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y + drawRadius + 14);

        if (isHovered) {
          ctx.font = "9px 'Courier New', monospace";
          ctx.fillStyle = '#00ff88';
          ctx.fillText(`${node.level}%`, node.x, node.y + drawRadius + 26);
        }
      });

      ctx.shadowBlur = 0;

      if (hoveredNode) {
        setTooltip({
          visible: true,
          x: hoveredNode.x,
          y: hoveredNode.y - hoveredNode.radius - 8,
          name: hoveredNode.name,
          level: hoveredNode.level,
          category: hoveredNode.category,
        });
      } else {
        setTooltip(prev => prev.visible ? { ...prev, visible: false } : prev);
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    const handleMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
      setTooltip(prev => ({ ...prev, visible: false }));
    };

    resize();
    draw();

    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('mouseleave', handleLeave);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouse);
      canvas.removeEventListener('mouseleave', handleLeave);
    };
  }, [categories]);

  return (
    <ConstellationContainer ref={containerRef}>
      <Canvas ref={canvasRef} />
      <Tooltip visible={tooltip.visible} style={{ left: tooltip.x, top: tooltip.y }}>
        <TooltipName>{tooltip.name}</TooltipName>
        <TooltipLevel>{tooltip.level}% proficiency</TooltipLevel>
        <TooltipCategory>{tooltip.category}</TooltipCategory>
      </Tooltip>
    </ConstellationContainer>
  );
}

export default SkillConstellation;
