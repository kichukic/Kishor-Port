import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from '@emotion/styled';

const ConstellationContainer = styled.div`
  width: 100%;
  height: 500px;
  position: relative;
  margin-bottom: 3rem;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(255, 255, 255, 0.04);
  cursor: default;
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
`;

const Tooltip = styled.div`
  position: absolute;
  padding: 0.6rem 1rem;
  background: rgba(10, 10, 15, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  backdrop-filter: blur(12px);
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.75rem;
  color: #ffffff;
  pointer-events: none;
  z-index: 10;
  white-space: nowrap;
  transform: translate(-50%, -120%);
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 0.15s ease;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
`;

const TooltipName = styled.div`
  font-weight: 700;
  font-size: 0.8rem;
  margin-bottom: 3px;
`;

const TooltipLevel = styled.div`
  color: #00ff88;
  font-size: 0.7rem;
  margin-bottom: 2px;
`;

const TooltipCategory = styled.div`
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.65rem;
`;

const TooltipBar = styled.div`
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin-top: 4px;
  overflow: hidden;
`;

const TooltipBarFill = styled.div`
  height: 100%;
  background: #00ff88;
  border-radius: 2px;
  width: ${({ level }) => level}%;
`;

const categoryColors = {
  'Backend': { r: 255, g: 255, b: 255 },
  'Database': { r: 0, g: 200, b: 150 },
  'DevOps & Cloud': { r: 100, g: 180, b: 255 },
  'Languages & Tools': { r: 200, g: 150, b: 255 },
};

const categoryPositions = {
  'Backend': { cx: 0.22, cy: 0.35 },
  'Database': { cx: 0.78, cy: 0.25 },
  'DevOps & Cloud': { cx: 0.78, cy: 0.72 },
  'Languages & Tools': { cx: 0.22, cy: 0.72 },
};

function SkillConstellation({ categories }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, name: '', level: 0, category: '' });
  const nodesRef = useRef([]);
  const particlesRef = useRef([]);
  const dataParticlesRef = useRef([]);
  const animFrameRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const timeRef = useRef(0);
  const buildProgressRef = useRef(0);
  const inViewRef = useRef(false);
  const draggedNodeRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const isolatedCategoryRef = useRef(null);
  const expandedNodeRef = useRef(null);

  const getInboundPosition = useCallback((targetX, targetY, w, h) => {
    const side = Math.floor(Math.random() * 4);
    switch (side) {
      case 0: return { x: Math.random() * w, y: -50 };
      case 1: return { x: w + 50, y: Math.random() * h };
      case 2: return { x: Math.random() * w, y: h + 50 };
      case 3: return { x: -50, y: Math.random() * h };
      default: return { x: 0, y: 0 };
    }
  }, []);

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
        const radius = Math.min(w, h) * 0.13;
        const angleStep = (Math.PI * 2) / skills.length;

        skills.forEach((skill, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const spreadRadius = radius * (0.5 + (skill.level / 100) * 0.5);
          const baseX = center.cx * w + Math.cos(angle) * spreadRadius;
          const baseY = center.cy * h + Math.sin(angle) * spreadRadius;
          const inbound = getInboundPosition(baseX, baseY, w, h);

          nodes.push({
            x: inbound.x,
            y: inbound.y,
            baseX,
            baseY,
            targetX: baseX,
            targetY: baseY,
            radius: 4 + (skill.level / 100) * 5,
            name: skill.name,
            level: skill.level,
            category: cat.category,
            color,
            floatOffset: Math.random() * Math.PI * 2,
            floatSpeed: 0.3 + Math.random() * 0.4,
            pulseSpeed: 1.5 + (skill.level / 100) * 2,
            pulseOffset: Math.random() * Math.PI * 2,
            arrived: false,
            arriveProgress: 0,
            expandProgress: 0,
          });
        });
      });
      nodesRef.current = nodes;
      particlesRef.current = [];
      dataParticlesRef.current = [];
    };

    const spawnDataParticles = () => {
      const nodes = nodesRef.current;
      if (dataParticlesRef.current.length > 60) return;

      categories.forEach((cat) => {
        const catNodes = nodes.filter(n => n.category === cat.category && n.arrived);
        for (let i = 0; i < catNodes.length; i++) {
          for (let j = i + 1; j < catNodes.length; j++) {
            const a = catNodes[i];
            const b = catNodes[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < Math.min(w, h) * 0.25 && Math.random() < 0.005) {
              dataParticlesRef.current.push({
                fromNode: a,
                toNode: b,
                progress: 0,
                speed: 0.008 + Math.random() * 0.012,
                color: a.color,
                size: 1.5 + Math.random() * 1.5,
              });
            }
          }
        }
      });
    };

    const draw = () => {
      timeRef.current += 0.016;
      ctx.clearRect(0, 0, w, h);

      const nodes = nodesRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const isolated = isolatedCategoryRef.current;

      // Build-in progress
      if (inViewRef.current && buildProgressRef.current < 1) {
        buildProgressRef.current = Math.min(1, buildProgressRef.current + 0.012);
      }
      const bp = buildProgressRef.current;

      // Draw background grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 0.5;
      const gridSize = 40;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Animate nodes to position
      nodes.forEach((node) => {
        const delay = (node.baseX / w + node.baseY / h) * 0.3;
        const nodeProgress = Math.max(0, Math.min(1, (bp - delay * 0.5) / 0.5));
        const ease = 1 - Math.pow(1 - nodeProgress, 3);

        if (nodeProgress > 0 && !node.arrived) {
          node.x = node.x + (node.targetX - node.x) * ease * 0.08;
          node.y = node.y + (node.targetY - node.y) * ease * 0.08;
          if (nodeProgress >= 0.99) {
            node.arrived = true;
            node.x = node.baseX;
            node.y = node.baseY;
          }
        }

        if (node.arrived) {
          // Floating
          const floatX = Math.sin(timeRef.current * node.floatSpeed + node.floatOffset) * 4;
          const floatY = Math.cos(timeRef.current * node.floatSpeed * 0.7 + node.floatOffset) * 5;
          node.x = node.baseX + floatX;
          node.y = node.baseY + floatY;
        }

        // Drag override
        if (draggedNodeRef.current === node) {
          node.x = mx + dragOffsetRef.current.x;
          node.y = my + dragOffsetRef.current.y;
        }
      });

      // Mouse repulsion
      nodes.forEach((node) => {
        if (draggedNodeRef.current === node || !node.arrived) return;
        const dx = mx - node.x;
        const dy = my - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80 && dist > 0) {
          const force = (80 - dist) / 80;
          const angle = Math.atan2(dy, dx);
          node.x -= Math.cos(angle) * force * 12;
          node.y -= Math.sin(angle) * force * 12;
        }
      });

      // Draw connections
      const allConnections = [];
      categories.forEach((cat) => {
        if (isolated && isolated !== cat.category) return;
        const catNodes = nodes.filter(n => n.category === cat.category);
        const color = categoryColors[cat.category] || { r: 255, g: 255, b: 255 };

        for (let i = 0; i < catNodes.length; i++) {
          for (let j = i + 1; j < catNodes.length; j++) {
            const a = catNodes[i];
            const b = catNodes[j];
            if (!a.arrived || !b.arrived) continue;
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = Math.min(w, h) * 0.28;

            if (dist < maxDist) {
              const opacity = (1 - dist / maxDist) * 0.3;
              const isHighlighted =
                Math.sqrt((mx - a.x) ** 2 + (my - a.y) ** 2) < 60 ||
                Math.sqrt((mx - b.x) ** 2 + (my - b.y) ** 2) < 60;

              allConnections.push({ a, b, color, opacity, isHighlighted, dist });
            }
          }
        }
      });

      // Draw cross-category faint connections
      if (!isolated) {
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            if (nodes[i].category === nodes[j].category) continue;
            if (!nodes[i].arrived || !nodes[j].arrived) continue;
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < Math.min(w, h) * 0.18) {
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
              ctx.lineWidth = 0.3;
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // Render connections
      allConnections.forEach(({ a, b, color, opacity, isHighlighted }) => {
        ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${isHighlighted ? opacity * 2.5 : opacity})`;
        ctx.lineWidth = isHighlighted ? 1.5 : 0.6;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      });

      // Spawn & update data flow particles
      spawnDataParticles();
      dataParticlesRef.current = dataParticlesRef.current.filter(p => {
        p.progress += p.speed;
        if (p.progress >= 1) return false;

        const x = p.fromNode.x + (p.toNode.x - p.fromNode.x) * p.progress;
        const y = p.fromNode.y + (p.toNode.y - p.fromNode.y) * p.progress;

        ctx.shadowBlur = 6;
        ctx.shadowColor = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0.6)`;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0.8)`;
        ctx.fill();
        ctx.shadowBlur = 0;

        return true;
      });

      // Draw category labels
      ctx.font = "bold 10px 'Courier New', monospace";
      ctx.textAlign = 'center';
      Object.entries(categoryPositions).forEach(([cat, pos]) => {
        if (isolated && isolated !== cat) return;
        const color = categoryColors[cat] || { r: 255, g: 255, b: 255 };
        const labelOpacity = 0.2 + Math.sin(timeRef.current * 1.5) * 0.05;
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${labelOpacity})`;
        ctx.fillText(cat.toUpperCase(), pos.cx * w, pos.cy * h - Math.min(w, h) * 0.16);
      });

      // Draw nodes
      let hoveredNode = null;
      nodes.forEach((node) => {
        if (!node.arrived) return;
        if (isolated && isolated !== node.category) {
          // Dim non-isolated nodes
          ctx.globalAlpha = 0.1;
        }

        const distToMouse = Math.sqrt((mx - node.x) ** 2 + (my - node.y) ** 2);
        const isHovered = distToMouse < 22;
        const isExpanded = expandedNodeRef.current === node;
        if (isHovered) hoveredNode = node;

        // Pulse
        const pulse = Math.sin(timeRef.current * node.pulseSpeed + node.pulseOffset) * 1.5;
        const baseOpacity = 0.5 + (node.level / 100) * 0.5;
        const drawRadius = isExpanded
          ? node.radius * 2.5
          : isHovered
            ? node.radius * 1.8 + pulse
            : node.radius + pulse * 0.5;
        const drawOpacity = isHovered || isExpanded ? 1 : baseOpacity;

        // Outer glow ring
        ctx.shadowBlur = isHovered || isExpanded ? 25 : 10;
        ctx.shadowColor = `rgba(${node.color.r}, ${node.color.g}, ${node.color.b}, ${drawOpacity * 0.5})`;

        ctx.beginPath();
        ctx.arc(node.x, node.y, drawRadius + 3, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${node.color.r}, ${node.color.g}, ${node.color.b}, ${drawOpacity * 0.2})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Inner fill
        ctx.beginPath();
        ctx.arc(node.x, node.y, drawRadius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, drawRadius);
        gradient.addColorStop(0, `rgba(${node.color.r}, ${node.color.g}, ${node.color.b}, ${drawOpacity})`);
        gradient.addColorStop(1, `rgba(${node.color.r}, ${node.color.g}, ${node.color.b}, ${drawOpacity * 0.3})`);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Level ring (artial arc showing proficiency)
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(node.x, node.y, drawRadius + 5, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * node.level / 100));
        ctx.strokeStyle = `rgba(${node.color.r}, ${node.color.g}, ${node.color.b}, ${drawOpacity * 0.4})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label
        ctx.font = `${isHovered || isExpanded ? '11px' : '9px'} 'Courier New', monospace`;
        ctx.fillStyle = `rgba(255, 255, 255, ${isHovered || isExpanded ? 0.95 : 0.4})`;
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y + drawRadius + 16);

        if (isHovered || isExpanded) {
          ctx.font = "bold 10px 'Courier New', monospace";
          ctx.fillStyle = '#00ff88';
          ctx.fillText(`${node.level}%`, node.x, node.y + drawRadius + 28);
        }

        ctx.globalAlpha = 1;
      });

      ctx.shadowBlur = 0;

      if (hoveredNode) {
        setTooltip({
          visible: true,
          x: hoveredNode.x,
          y: hoveredNode.y - hoveredNode.radius - 10,
          name: hoveredNode.name,
          level: hoveredNode.level,
          category: hoveredNode.category,
        });
      } else {
        setTooltip(prev => prev.visible ? { ...prev, visible: false } : prev);
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    const handleMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const nodes = nodesRef.current;
      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];
        if (!node.arrived) continue;
        const dist = Math.sqrt((mx - node.x) ** 2 + (my - node.y) ** 2);
        if (dist < 22) {
          draggedNodeRef.current = node;
          dragOffsetRef.current = { x: node.x - mx, y: node.y - my };
          canvas.style.cursor = 'grabbing';

          // Toggle expand on click
          if (expandedNodeRef.current === node) {
            expandedNodeRef.current = null;
          } else {
            expandedNodeRef.current = node;
          }
          return;
        }
      }
      expandedNodeRef.current = null;
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      if (draggedNodeRef.current) {
        draggedNodeRef.current.baseX = mouseRef.current.x + dragOffsetRef.current.x;
        draggedNodeRef.current.baseY = mouseRef.current.y + dragOffsetRef.current.y;
        draggedNodeRef.current.targetX = draggedNodeRef.current.baseX;
        draggedNodeRef.current.targetY = draggedNodeRef.current.baseY;
      }
    };

    const handleMouseUp = () => {
      if (draggedNodeRef.current) {
        const node = draggedNodeRef.current;
        // Spring back to original cluster center
        const cat = categories.find(c => c.category === node.category);
        if (cat) {
          const center = categoryPositions[cat.category];
          const catNodes = nodesRef.current.filter(n => n.category === cat.category);
          const idx = catNodes.indexOf(node);
          const radius = Math.min(w, h) * 0.13;
          const angleStep = (Math.PI * 2) / catNodes.length;
          const angle = angleStep * idx - Math.PI / 2;
          const spreadRadius = radius * (0.5 + (node.level / 100) * 0.5);
          node.baseX = center.cx * w + Math.cos(angle) * spreadRadius;
          node.baseY = center.cy * h + Math.sin(angle) * spreadRadius;
          node.targetX = node.baseX;
          node.targetY = node.baseY;
        }
        draggedNodeRef.current = null;
        canvas.style.cursor = 'default';
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
      setTooltip(prev => ({ ...prev, visible: false }));
      if (draggedNodeRef.current) {
        draggedNodeRef.current = null;
        canvas.style.cursor = 'default';
      }
    };

    resize();
    draw();

    window.addEventListener('resize', resize);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [categories, getInboundPosition]);

  // IntersectionObserver for build-in trigger
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          inViewRef.current = true;
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <ConstellationContainer ref={containerRef}>
      <Canvas ref={canvasRef} />
      <Tooltip visible={tooltip.visible} style={{ left: tooltip.x, top: tooltip.y }}>
        <TooltipName>{tooltip.name}</TooltipName>
        <TooltipLevel>{tooltip.level}% proficiency</TooltipLevel>
        <TooltipCategory>{tooltip.category}</TooltipCategory>
        <TooltipBar>
          <TooltipBarFill level={tooltip.level} />
        </TooltipBar>
      </Tooltip>
    </ConstellationContainer>
  );
}

export default SkillConstellation;
