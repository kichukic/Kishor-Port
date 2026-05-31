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
  'Database': { cx: 0.78, cy: 0.35 },
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
  const orbitalParticlesRef = useRef([]);

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
            angle,
            spreadRadius,
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

      // Draw Central Holographic Black Hole Singularity (Gravitational Accretion Disk)
      const centerX = w / 2;
      const centerY = h / 2;
      ctx.save();

      // Ensure orbitalParticlesRef is initialized with matter particles orbiting the 3D black hole in a tight accretion band
      if (orbitalParticlesRef.current.length === 0) {
        const numParticles = 180; // Higher density for a rich, continuous ring
        const particles = [];
        for (let i = 0; i < numParticles; i++) {
          // Particles are strictly confined to a tight 14px band centered at 50px
          const radius = 43 + Math.random() * 14;
          
          // Random elegant category colors or pure white for the core light
          const colorRand = Math.random();
          let color;
          if (colorRand < 0.4) {
            color = { r: 255, g: 255, b: 255 }; // Glowing white
          } else if (colorRand < 0.6) {
            color = { r: 0, g: 200, b: 150 }; // Database mint
          } else if (colorRand < 0.8) {
            color = { r: 100, g: 180, b: 255 }; // DevOps light blue
          } else {
            color = { r: 200, g: 150, b: 255 }; // Languages lavender
          }

          particles.push({
            id: i,
            radius,
            angle: Math.random() * Math.PI * 2,
            // Keplerian speed: closer particles orbit much faster!
            speed: (0.016 + Math.random() * 0.008) * (50 / radius),
            char: Math.random() < 0.5 ? '0' : '1',
            size: 5.5 + Math.random() * 5.0,
            opacity: 0.2 + (1 - radius / 57) * 0.6, // Closer is brighter
            stable: Math.random() < 0.9, // 90% stable accretion ring, 10% falling matter
            color
          });
        }
        orbitalParticlesRef.current = particles;
      }

      // Physics update: Rotate particles and decay infalling matter
      orbitalParticlesRef.current.forEach((p) => {
        if (p.stable) {
          p.angle += p.speed;
        } else {
          p.radius -= 0.35; // Matter decays rapidly into singularity
          const speedMultiplier = Math.max(1, 55 / Math.max(12, p.radius));
          p.angle += p.speed * speedMultiplier;

          // Respawn in the outer accretion ring
          if (p.radius <= 14) {
            p.radius = 50 + Math.random() * 7;
            p.angle = Math.random() * Math.PI * 2;
          }
        }

        // Bit flips inside the stream
        if (Math.random() < 0.008) {
          p.char = p.char === '0' ? '1' : '0';
        }
      });

      // 1. Draw gravitational lensing warped Einstein rings of space-time
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 0.8;
      for (let r = 26; r <= 80; r += 26) {
        ctx.beginPath();
        const ringPulse = Math.sin(timeRef.current * 0.8 + r) * 1.5;
        ctx.arc(centerX, centerY, r + ringPulse, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Projection coefficients for accretion disk and Einstein lensing halos
      const alpha = 0.16; // Front tilt aspect ratio (flat horizontal disc)
      const beta = 0.88;  // Back wings tilt aspect ratio (highly vertical circular wings)
      const trailLength = 5; // Long elegant trails

      // 2. Draw continuous volumetric glows for the lensed back wings (behind Event Horizon)
      // Wide faint volumetric gas glow
      ctx.lineWidth = 15;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.008)';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 50, 50 * beta, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 50, 50 * beta, 0, 0, Math.PI);
      ctx.stroke();

      // Sharp central core gas glow
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.022)';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 50, 50 * beta, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 50, 50 * beta, 0, 0, Math.PI);
      ctx.stroke();

      // 3. Draw Back Particles & Lensed Wings (behind Event Horizon, theta in [pi, 2*pi])
      orbitalParticlesRef.current.forEach((p) => {
        for (let k = 0; k < trailLength; k++) {
          // Calculate angle for this trail item (backwards along trajectory)
          const tAngle = p.angle - k * (0.05 * (48 / p.radius));
          const tRadius = p.stable ? p.radius : p.radius + k * 0.35;
          
          // Normalize angle to [0, 2*pi]
          const normAngle = ((tAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          
          // Skip if in front layer (front particles handled in front pass)
          if (normAngle >= 0 && normAngle <= Math.PI) continue;

          // Gravitational lensing: light from the back splits into TWO symmetric wings
          // wrapping over the top and under the bottom of the Singularity
          const tx_up = centerX + tRadius * Math.cos(tAngle);
          const ty_up = centerY + tRadius * Math.sin(tAngle) * beta;
          
          const tx_down = centerX + tRadius * Math.cos(tAngle);
          const ty_down = centerY - tRadius * Math.sin(tAngle) * beta;

          const size = p.size * (1 - (k / trailLength) * 0.45);
          const baseOpacity = p.opacity * (1 - (k / trailLength) * 0.7);
          
          // Cascading binary stream ripple effect (bits slide down the trail)
          const rippleChar = Math.floor(p.id + k + timeRef.current * 8) % 2 === 0 ? '0' : '1';
          const shimmer = 0.85 + Math.sin(timeRef.current * 4 + p.id + k) * 0.15;
          const opacity = baseOpacity * shimmer * 0.65; // Wings are slightly softer

          // Spaghettification: stretch vertically near center (for infalling matter)
          const isNear = p.radius < 26;
          const stretch = isNear ? 1.0 + (26 - p.radius) / 10 : 1.0;

          ctx.font = `bold ${Math.round(size)}px 'Courier New', monospace`;
          ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${opacity})`;

          // Upper wing draw
          ctx.save();
          ctx.translate(tx_up, ty_up);
          ctx.scale(1.0, stretch);
          ctx.fillText(rippleChar, 0, 0);
          ctx.restore();

          // Lower wing draw
          ctx.save();
          ctx.translate(tx_down, ty_down);
          ctx.scale(1.0, stretch);
          ctx.fillText(rippleChar, 0, 0);
          ctx.restore();
        }
      });

      // 4. Draw Event Horizon Singularity (The central pitch-black sphere and glowing quantum accretion boundaries)
      ctx.beginPath();
      ctx.arc(centerX, centerY, 16, 0, Math.PI * 2);
      const voidGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 16);
      voidGradient.addColorStop(0, '#020204');
      voidGradient.addColorStop(0.85, '#06060a');
      voidGradient.addColorStop(1, '#0b0b12');
      ctx.fillStyle = voidGradient;
      ctx.fill();

      // Quantum emerald boundary ring (extreme redshift/quantum interface glow)
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.12)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 16, 0, Math.PI * 2);
      ctx.stroke();

      // Event horizon glowing boundary ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 16, 0, Math.PI * 2);
      ctx.stroke();

      // Outer accretion halo (vibrating boundary glow)
      const haloPulse = 1.0 + Math.sin(timeRef.current * 4) * 0.08;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 4.5 * haloPulse;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 18, 0, Math.PI * 2);
      ctx.stroke();

      // 5. Draw continuous volumetric glows for the front accretion disk (in front of Event Horizon)
      // Wide faint volumetric gas glow
      ctx.lineWidth = 15;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.012)';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 50, 50 * alpha, 0, 0, Math.PI);
      ctx.stroke();

      // Sharp central core gas glow
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.032)';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 50, 50 * alpha, 0, 0, Math.PI);
      ctx.stroke();

      // 6. Draw Front Particles & Accretion Disk (in front of Event Horizon, theta in [0, pi])
      orbitalParticlesRef.current.forEach((p) => {
        for (let k = 0; k < trailLength; k++) {
          const tAngle = p.angle - k * (0.05 * (48 / p.radius));
          const tRadius = p.stable ? p.radius : p.radius + k * 0.35;
          
          const normAngle = ((tAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          
          // Skip if in back layer
          if (normAngle < 0 || normAngle > Math.PI) continue;

          // Front accretion disk is projected as a flat tilted horizontal ellipse
          const tx = centerX + tRadius * Math.cos(tAngle);
          const ty = centerY + tRadius * Math.sin(tAngle) * alpha;

          const size = p.size * (1 - (k / trailLength) * 0.45);
          const baseOpacity = p.opacity * (1 - (k / trailLength) * 0.7);
          const rippleChar = Math.floor(p.id + k + timeRef.current * 8) % 2 === 0 ? '0' : '1';
          
          const shimmer = 0.85 + Math.sin(timeRef.current * 4 + p.id + k) * 0.15;
          const opacity = baseOpacity * shimmer * 0.95; // Brighter in front

          // Spaghettification: stretch horizontally near center
          const isNear = p.radius < 26;
          const stretch = isNear ? 1.0 + (26 - p.radius) / 10 : 1.0;

          ctx.font = `bold ${Math.round(size)}px 'Courier New', monospace`;
          ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${opacity})`;

          ctx.save();
          ctx.translate(tx, ty);
          ctx.scale(stretch, 1.0);
          ctx.fillText(rippleChar, 0, 0);
          ctx.restore();
        }
      });

      ctx.restore();

      // Animate nodes to position
      nodes.forEach((node) => {
        const delay = (node.baseX / w + node.baseY / h) * 0.3;
        const nodeProgress = Math.max(0, Math.min(1, (bp - delay * 0.5) / 0.5));
        const ease = 1 - Math.pow(1 - nodeProgress, 3);

        // Retrieve category center and cluster index
        const center = categoryPositions[node.category];
        const catIdx = Object.keys(categoryPositions).indexOf(node.category);
        
        // Increased organic drift of the category center to make nodes flow more dynamically (X: 32px, Y: 24px)
        const driftX = Math.sin(timeRef.current * 0.25 + catIdx * 1.5) * 32;
        const driftY = Math.cos(timeRef.current * 0.18 + catIdx * 2.0) * 24;
        
        const clusterCenterX = center.cx * w + driftX;
        const clusterCenterY = center.cy * h + driftY;
        
        // Rotate node around its drifting category center locally
        const currentAngle = (node.angle || 0) + timeRef.current * 0.12 * node.floatSpeed;
        const nodeSpread = node.spreadRadius || 40;
        
        // Strictly clamp targets within bounds (leaving 30px boundary padding) so they NEVER exit the container!
        const clampX = (val) => Math.max(30, Math.min(w - 30, val));
        const clampY = (val) => Math.max(30, Math.min(h - 30, val));

        const orbitX = clampX(clusterCenterX + Math.cos(currentAngle) * nodeSpread);
        const orbitY = clampY(clusterCenterY + Math.sin(currentAngle) * nodeSpread);

        if (node.isFlyingHome) {
          node.flyProgress += 0.014; // Smooth flight home speed (approx 1.2s flight)
          if (node.flyProgress >= 1.0) {
            node.isFlyingHome = false;
            node.arrived = true;
            node.x = orbitX;
            node.y = orbitY;
          } else {
            // Smooth ease-in-out curve for Bezier interpolation
            const t = node.flyProgress;
            const mt = 1 - t;
            const c0 = mt * mt * mt;
            const c1 = 3 * mt * mt * t;
            const c2 = 3 * mt * t * t;
            const c3 = t * t * t;

            // Target is the moving orbital slot coordinate!
            node.x = c0 * node.flyPath.p0.x + c1 * node.flyPath.p1.x + c2 * node.flyPath.p2.x + c3 * orbitX;
            node.y = c0 * node.flyPath.p0.y + c1 * node.flyPath.p1.y + c2 * node.flyPath.p2.y + c3 * orbitY;

            // Spawn binary codes trail sparks that float dynamically behind
            if (Math.random() < 0.55) {
              dataParticlesRef.current.push({
                isTrail: true,
                x: node.x,
                y: node.y,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5 + 0.4, // Slight downward drift
                size: 1.0 + Math.random() * 2.0,
                opacity: 0.95,
                char: Math.random() < 0.5 ? '0' : '1',
                color: node.color || { r: 255, g: 255, b: 255 },
                decay: 0.015 + Math.random() * 0.015
              });
            }
          }
        } else if (nodeProgress > 0 && !node.arrived) {
          // Fly into the moving orbital slot coordinate!
          node.x = node.x + (orbitX - node.x) * ease * 0.08;
          node.y = node.y + (orbitY - node.y) * ease * 0.08;
          if (nodeProgress >= 0.99) {
            node.arrived = true;
            node.x = orbitX;
            node.y = orbitY;
          }
        }

        if (node.arrived) {
          // Localized micro-floating layered over dynamic orbital coordinates
          const floatX = Math.sin(timeRef.current * node.floatSpeed + node.floatOffset) * 6;
          const floatY = Math.cos(timeRef.current * node.floatSpeed * 0.7 + node.floatOffset) * 8;
          node.x = orbitX + floatX;
          node.y = orbitY + floatY;
        }

        // Drag override
        if (draggedNodeRef.current === node) {
          node.x = mx + dragOffsetRef.current.x;
          node.y = my + dragOffsetRef.current.y;
        }
      });

      // Enforce node-to-node collision avoidance with extra separation distance to prevent overlaps
      const minDistance = 58; // Increased separation distance for extra breathing room and label clarity
      for (let step = 0; step < 3; step++) {
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i];
            const b = nodes[j];
            
            // Only resolve collisions for active, docked nodes
            if (!a.arrived || !b.arrived) continue;
            if (draggedNodeRef.current === a || draggedNodeRef.current === b) continue;
            
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < minDistance && dist > 0) {
              const overlap = minDistance - dist;
              // Push vector (50/50 division of displacement force)
              const forceX = (dx / dist) * overlap * 0.5;
              const forceY = (dy / dist) * overlap * 0.5;
              
              a.x -= forceX;
              a.y -= forceY;
              b.x += forceX;
              b.y += forceY;
            }
          }
        }
      }

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
        if (p.isTrail) {
          // Update trail particle kinematics and fade
          p.x += p.vx;
          p.y += p.vy;
          p.opacity -= p.decay;
          if (p.opacity <= 0) return false;

          ctx.font = `bold ${Math.round(8 + p.size * 2)}px 'Courier New', monospace`;
          ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity})`;
          ctx.fillText(p.char, p.x, p.y);
          return true;
        }

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

      // Draw category labels dynamically centered above each rotating cluster
      ctx.font = "bold 10px 'Courier New', monospace";
      ctx.textAlign = 'center';
      categories.forEach((cat) => {
        if (isolated && isolated !== cat.category) return;
        const catNodes = nodes.filter(n => n.category === cat.category && (n.arrived || n.isFlyingHome));
        if (catNodes.length === 0) return;
        
        let sumX = 0, sumY = 0;
        catNodes.forEach(n => {
          sumX += n.x;
          sumY += n.y;
        });
        const avgX = sumX / catNodes.length;
        const avgY = sumY / catNodes.length;
        
        const color = categoryColors[cat.category] || { r: 255, g: 255, b: 255 };
        const labelOpacity = 0.25 + Math.sin(timeRef.current * 1.5) * 0.05;
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${labelOpacity})`;
        ctx.fillText(cat.category.toUpperCase(), avgX, avgY - Math.min(w, h) * 0.15);
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
        if (!node.arrived && !node.isFlyingHome) continue;
        const dist = Math.sqrt((mx - node.x) ** 2 + (my - node.y) ** 2);
        if (dist < 22) {
          draggedNodeRef.current = node;
          node.isFlyingHome = false; // Intercept mid-flight and grab it
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
          
          const baseX = center.cx * w + Math.cos(angle) * spreadRadius;
          const baseY = center.cy * h + Math.sin(angle) * spreadRadius;

          const catIdx = Object.keys(categoryPositions).indexOf(cat.category);
          
          // Compute look-ahead moving target orbital location for landing slot
          const futureTime = timeRef.current + (1.0 / 0.014) * 0.016;
          
          const driftX = Math.sin(futureTime * 0.25 + catIdx * 1.5) * 32;
          const driftY = Math.cos(futureTime * 0.18 + catIdx * 2.0) * 24;
          
          const clusterCenterX = center.cx * w + driftX;
          const clusterCenterY = center.cy * h + driftY;
          
          const currentAngle = angle + futureTime * 0.12 * node.floatSpeed;
          
          const clampX = (val) => Math.max(30, Math.min(w - 30, val));
          const clampY = (val) => Math.max(30, Math.min(h - 30, val));

          const homeX = clampX(clusterCenterX + Math.cos(currentAngle) * spreadRadius);
          const homeY = clampY(clusterCenterY + Math.sin(currentAngle) * spreadRadius);

          // Generate 2 beautiful random waypoints for curved flight detour
          const angle1 = Math.random() * Math.PI * 2;
          const dist1 = 80 + Math.random() * 100;

          const p1 = {
            x: clampX(node.x + Math.cos(angle1) * dist1),
            y: clampY(node.y + Math.sin(angle1) * dist1)
          };

          const angle2 = Math.random() * Math.PI * 2;
          const dist2 = 60 + Math.random() * 80;
          const p2 = {
            x: clampX(homeX + Math.cos(angle2) * dist2),
            y: clampY(homeY + Math.sin(angle2) * dist2)
          };

          const p3 = { x: homeX, y: homeY };

          node.flyPath = { p0: { x: node.x, y: node.y }, p1, p2, p3 };
          node.flyProgress = 0;
          node.isFlyingHome = true;
          node.arrived = false; // Take off!

          node.baseX = baseX;
          node.baseY = baseY;
          node.targetX = baseX;
          node.targetY = baseY;
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
