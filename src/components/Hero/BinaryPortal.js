import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const PortalCircle = styled(motion.div)`
  position: fixed;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
`;

const PortalCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
  opacity: 0.95;
`;

function BinaryPortal({ size, x, top, delay, duration }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Double dimensions for retina high-DPI sharpness
    canvas.width = size * 2;
    canvas.height = size * 2;

    const gridSpacing = 28;
    const xLines = Math.floor(canvas.width / gridSpacing);
    const yLines = Math.floor(canvas.height / gridSpacing);

    // Dynamic database of actual Node.js / Express backend code fragments
    const codeSnippets = [
      "const express = require('express');",
      "const app = express();",
      "app.use(express.json());",
      "router.get('/api/v1/auth', authenticate);",
      "const user = await User.findById(req.userId);",
      "await redis.set(key, JSON.stringify(data));",
      "res.status(200).json({ status: 'OK' });",
      "const token = jwt.sign({ id }, secret);",
      "db.on('connected', () => logger.info());",
      "const socket = io.connect(server);",
      "socket.emit('sync_block', payload);",
      "const result = await cluster.run();",
      "logger.info('API Gateway bootstrap successful');",
      "module.exports = router;",
      "if (error) return next(error);",
      "const cached = await cache.get(id);",
      "res.setHeader('Cache-Control', 'public');",
      "return new Promise((resolve) => {});"
    ];

    // Initialize horizontal sliding code blocks (appearing on grid and moving left!)
    const activeBlocks = [];
    const numBlocks = 7; // Number of floating code fragments running simultaneously

    for (let k = 0; k < numBlocks; k++) {
      activeBlocks.push({
        text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
        // Stagger horizontally from center to off-screen right
        x: canvas.width * 0.4 + Math.random() * canvas.width * 0.8,
        // Align vertical coordinate perfectly to a horizontal grid line
        y: (1 + Math.floor(Math.random() * (yLines - 1))) * gridSpacing,
        speed: 0.35 + Math.random() * 0.45, // Slow, premium horizontal slide speed
        opacity: 0.5 + Math.random() * 0.5,
        scale: 0.95 + Math.random() * 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      // 1. Draw coordinate grid lines (HUD backdrop)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([]);

      for (let i = 0; i <= xLines; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSpacing, 0);
        ctx.lineTo(i * gridSpacing, canvas.height);
        ctx.stroke();
      }

      for (let j = 0; j <= yLines; j++) {
        ctx.beginPath();
        ctx.moveTo(0, j * gridSpacing);
        ctx.lineTo(canvas.width, j * gridSpacing);
        ctx.stroke();
      }

      // 2. Draw tiny intersection crosshair coordinate ticks
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 0.6;
      for (let i = 1; i < xLines; i++) {
        for (let j = 1; j < yLines; j++) {
          const cx = i * gridSpacing;
          const cy = j * gridSpacing;
          ctx.beginPath();
          ctx.moveTo(cx - 3, cy);
          ctx.lineTo(cx + 3, cy);
          ctx.moveTo(cx, cy - 3);
          ctx.lineTo(cx, cy + 3);
          ctx.stroke();
        }
      }

      // 3. Draw Corner Viewfinder brackets (Target boundaries)
      const len = 14;
      const offset = 8;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;

      // Top-Left L
      ctx.beginPath();
      ctx.moveTo(offset, offset + len);
      ctx.lineTo(offset, offset);
      ctx.lineTo(offset + len, offset);
      ctx.stroke();

      // Top-Right L
      ctx.beginPath();
      ctx.moveTo(canvas.width - offset - len, offset);
      ctx.lineTo(canvas.width - offset, offset);
      ctx.lineTo(canvas.width - offset, offset + len);
      ctx.stroke();

      // Bottom-Left L
      ctx.beginPath();
      ctx.moveTo(offset, canvas.height - offset - len);
      ctx.lineTo(offset, canvas.height - offset);
      ctx.lineTo(offset + len, canvas.height - offset);
      ctx.stroke();

      // Bottom-Right L
      ctx.beginPath();
      ctx.moveTo(canvas.width - offset - len, canvas.height - offset);
      ctx.lineTo(canvas.width - offset, canvas.height - offset);
      ctx.lineTo(canvas.width - offset, canvas.height - offset - len);
      ctx.stroke();

      // 4. Draw & Update Horizontal Sliding Code Blocks
      ctx.font = "bold 11px 'Courier New', monospace";

      activeBlocks.forEach((block) => {
        // Slide leftward
        block.x -= block.speed;

        // Calculate text boundary box to handle clean wrapping reset
        const textWidth = ctx.measureText(block.text).width;

        // Reset block once it slides fully past the left border
        if (block.x < -textWidth) {
          block.text = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
          block.x = canvas.width + Math.random() * 80;
          block.y = (1 + Math.floor(Math.random() * (yLines - 1))) * gridSpacing;
          block.speed = 0.35 + Math.random() * 0.45;
        }

        // Calculate smooth horizontal fade-in (on right) and fade-out (on left)
        const fadeIn = Math.min(1, (canvas.width - block.x) / 40);
        const fadeOut = Math.min(1, (block.x + textWidth) / 40);
        
        // Vertical coordinate boundary fade
        const yFade = Math.sin((block.y / canvas.height) * Math.PI);
        
        const finalOpacity = Math.max(0, fadeIn * fadeOut * yFade * block.opacity * 0.85);

        if (finalOpacity > 0.05) {
          ctx.save();
          
          // Apply slight coordinate scale
          ctx.translate(block.x, block.y);
          ctx.scale(block.scale, block.scale);

          // Draw trailing line glow highlight under code text
          ctx.strokeStyle = `rgba(255, 255, 255, ${finalOpacity * 0.12})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, 4);
          ctx.lineTo(textWidth, 4);
          ctx.stroke();

          // Render active code text
          ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
          ctx.fillText(block.text, 0, 0);

          // Draw an active blinking terminal block cursor at the end of the line
          const isCursorVisible = Math.floor(Date.now() / 320) % 2 === 0;
          if (isCursorVisible) {
            ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity * 0.85})`;
            ctx.fillRect(textWidth + 2, -9, 4, 10);
          }

          ctx.restore();
        }
      });

      // 5. Draw subtle corner metadata labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
      ctx.font = "8px 'Courier New', monospace";
      ctx.fillText("[COMPILING_LNK]", offset + 6, offset + 10);
      ctx.fillText("DEC: 0x5C8B", canvas.width - offset - 60, canvas.height - offset - 4);

      ctx.restore();
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [size]);

  return (
    <PortalCircle
      style={{
        width: size,
        height: size,
        left: x,
        top: top,
      }}
      animate={{
        y: [0, -15, 0],
        opacity: [0.65, 0.85, 0.65], // High-visibility visibility glow
        rotate: [0, 1, 0],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        delay: delay,
        ease: 'easeInOut',
      }}
    >
      <PortalCanvas ref={canvasRef} />
    </PortalCircle>
  );
}

export default BinaryPortal;
