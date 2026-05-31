import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { keyframes } from '@emotion/react';

const scanlineDrift = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
`;

const progressGlow = keyframes`
  0% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.3); }
  50% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.5); }
  100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.3); }
`;

const glitchFlash = keyframes`
  0% { opacity: 0; }
  5% { opacity: 1; }
  10% { opacity: 0; }
  15% { opacity: 0.8; }
  20% { opacity: 0; }
  25% { opacity: 1; }
  30% { opacity: 0; }
  100% { opacity: 0; }
`;

const Screen = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: #0a0a0f;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Courier New', Courier, monospace;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(255, 255, 255, 0.012) 2px,
      rgba(255, 255, 255, 0.012) 4px
    );
    pointer-events: none;
    z-index: 1;
  }

  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 40px;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(255, 255, 255, 0.03) 50%,
      transparent 100%
    );
    animation: ${scanlineDrift} 3s linear infinite;
    pointer-events: none;
    z-index: 2;
  }
`;

const TerminalBody = styled.div`
  width: 90%;
  max-width: 700px;
  padding: 2rem;
  position: relative;
  z-index: 3;
`;

const LogLine = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.6rem;
  font-size: 0.85rem;
  line-height: 1.5;
  opacity: 0;
  transform: translateY(4px);
  animation: lineAppear 0.2s forwards ease-out;

  @keyframes lineAppear {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Tag = styled.span`
  color: ${({ color }) => color || '#a1a1aa'};
  font-weight: bold;
  flex-shrink: 0;
`;

const Status = styled.span`
  color: #00ff88;
  font-weight: bold;
  margin-left: auto;
`;

const ProgressBarContainer = styled.div`
  width: 90%;
  max-width: 700px;
  height: 3px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
  z-index: 3;
  margin-top: 2rem;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #a1a1aa, #ffffff);
  border-radius: 2px;
  width: ${({ progress }) => progress}%;
  transition: width 0.3s ease-out;
  animation: ${progressGlow} 1.5s infinite ease-in-out;
`;

const GlitchOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.05);
  pointer-events: none;
  z-index: 10;
  animation: ${glitchFlash} 0.4s forwards;
`;

const bootMessages = [
  { tag: '[SYSTEM]', color: '#ffffff', text: 'Initializing portfolio shell', delay: 200 },
  { tag: '[AUTH]', color: '#00ff88', text: 'Authenticating visitor credentials', delay: 500 },
  { tag: '[LOAD]', color: '#ffffff', text: 'Fetching project repository', delay: 400 },
  { tag: '[NODE]', color: '#a1a1aa', text: 'Connecting to backend services', delay: 450 },
  { tag: '[CACHE]', color: '#ffffff', text: 'Warming up skill database', delay: 350 },
  { tag: '[NET]', color: '#a1a1aa', text: 'Establishing WebSocket handshake', delay: 300 },
  { tag: '[BUILD]', color: '#ffffff', text: 'Compiling component tree', delay: 400 },
  { tag: '[READY]', color: '#00ff88', text: 'Access granted. Welcome, Developer.', delay: 200 },
];

function BootSequence({ onComplete }) {
  const [lines, setLines] = useState([]);
  const [progress, setProgress] = useState(0);
  const [showGlitch, setShowGlitch] = useState(false);
  const [done, setDone] = useState(false);
  const timersRef = useRef([]);

  useEffect(() => {
    let cumulativeDelay = 100;

    bootMessages.forEach((msg, index) => {
      const timer = setTimeout(() => {
        setLines(prev => [...prev, msg]);
        setProgress(((index + 1) / bootMessages.length) * 100);
      }, cumulativeDelay);

      timersRef.current.push(timer);
      cumulativeDelay += msg.delay + 80;
    });

    const glitchTimer = setTimeout(() => {
      setShowGlitch(true);
    }, cumulativeDelay + 200);
    timersRef.current.push(glitchTimer);

    const doneTimer = setTimeout(() => {
      setDone(true);
    }, cumulativeDelay + 600);
    timersRef.current.push(doneTimer);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, cumulativeDelay + 1000);
    timersRef.current.push(completeTimer);

    return () => {
      timersRef.current.forEach(t => clearTimeout(t));
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!done && (
        <Screen
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <TerminalBody>
            {lines.map((line, i) => (
              <LogLine key={i}>
                <Tag color={line.color}>{line.tag}</Tag>
                <span style={{ color: '#d4d4d8' }}>{line.text}</span>
                <Status>[OK]</Status>
              </LogLine>
            ))}
            <LogLine>
              <Tag color="#ffffff">{'>'}</Tag>
              <span style={{
                color: '#ffffff',
                display: 'inline-block',
                width: '8px',
                height: '15px',
                background: '#ffffff',
                verticalAlign: 'middle',
                animation: 'cursorBlink 1s infinite steps(2)',
              }} />
            </LogLine>
          </TerminalBody>
          <ProgressBarContainer>
            <ProgressBarFill progress={progress} />
          </ProgressBarContainer>
          {showGlitch && <GlitchOverlay />}
        </Screen>
      )}
    </AnimatePresence>
  );
}

export default BootSequence;
