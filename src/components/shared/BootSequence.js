import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { keyframes } from '@emotion/react';

/* ─── KEYFRAMES ─── */
const scanlineDrift = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
`;

const progressGlow = keyframes`
  0% { box-shadow: 0 0 4px rgba(255,255,255,0.2); }
  50% { box-shadow: 0 0 12px rgba(255,255,255,0.5); }
  100% { box-shadow: 0 0 4px rgba(255,255,255,0.2); }
`;

const glitchFlash = keyframes`
  0%   { opacity: 0; }
  5%   { opacity: 1; }
  10%  { opacity: 0; }
  15%  { opacity: 0.7; }
  20%  { opacity: 0; }
  25%  { opacity: 0.9; }
  30%  { opacity: 0; }
  35%  { opacity: 1; }
  40%  { opacity: 0; }
  100% { opacity: 0; }
`;

const cursorBlink = keyframes`
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
`;

const matrixFall = keyframes`
  0% { transform: translateY(-100%); opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
`;

const hexScroll = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
`;

const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* ─── STYLES ─── */
const Screen = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: #050508;
  display: flex;
  font-family: 'Courier New', Courier, monospace;
  overflow: hidden;
  color: #d4d4d8;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(255, 255, 255, 0.01) 2px,
      rgba(255, 255, 255, 0.01) 4px
    );
    pointer-events: none;
    z-index: 5;
  }

  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 50px;
    background: linear-gradient(180deg, transparent, rgba(255,255,255,0.025), transparent);
    animation: ${scanlineDrift} 3.5s linear infinite;
    pointer-events: none;
    z-index: 6;
  }
`;

const MatrixRain = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
  opacity: 0.08;
`;

const MatrixColumn = styled.div`
  position: absolute;
  top: -100%;
  font-size: 11px;
  line-height: 1.2;
  color: #ffffff;
  writing-mode: vertical-rl;
  animation: ${matrixFall} ${({ speed }) => speed}s linear infinite;
  animation-delay: ${({ delay }) => delay}s;
  left: ${({ left }) => left}%;
  white-space: nowrap;
  letter-spacing: 2px;
`;

const HexStream = styled.div`
  position: absolute;
  right: 12px;
  top: 0;
  bottom: 0;
  width: 90px;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
  opacity: 0.06;
  font-size: 9px;
  line-height: 1.4;
  color: #ffffff;
`;

const HexInner = styled.div`
  animation: ${hexScroll} 20s linear infinite;
`;

const LeftPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2rem 1.5rem;
  position: relative;
  z-index: 3;
  max-height: 100vh;
  overflow: hidden;
`;

const RightPanel = styled.div`
  width: 320px;
  border-left: 1px solid rgba(255,255,255,0.06);
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  z-index: 3;
  overflow: hidden;

  @media (max-width: 768px) {
    display: none;
  }
`;

const glitchText = keyframes`
  0% { text-shadow: 2px 0 #ff0040, -2px 0 #00fff9; clip-path: inset(20% 0 60% 0); }
  10% { text-shadow: -2px 0 #ff0040, 2px 0 #00fff9; clip-path: inset(80% 0 0% 0); }
  20% { text-shadow: 1px 0 #ff0040, -1px 0 #00fff9; clip-path: inset(10% 0 70% 0); }
  30% { text-shadow: -1px 0 #ff0040, 1px 0 #00fff9; clip-path: inset(50% 0 20% 0); }
  40% { text-shadow: 3px 0 #ff0040, -3px 0 #00fff9; clip-path: inset(0% 0 90% 0); }
  50% { text-shadow: 0px 0 #ff0040, 0px 0 #00fff9; clip-path: inset(40% 0 30% 0); }
  60% { text-shadow: -1px 0 #ff0040, 1px 0 #00fff9; clip-path: inset(70% 0 10% 0); }
  70% { text-shadow: 2px 0 #ff0040, -2px 0 #00fff9; clip-path: inset(30% 0 50% 0); }
  80% { text-shadow: -1px 0 #ff0040, 1px 0 #00fff9; clip-path: inset(60% 0 20% 0); }
  90% { text-shadow: 1px 0 #ff0040, -1px 0 #00fff9; clip-path: inset(10% 0 80% 0); }
  100% { text-shadow: 0 0 transparent; clip-path: inset(0% 0 0% 0); }
`;

const GlitchLogo = styled.div`
  font-size: 3.5rem;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 12px;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  position: relative;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);

  ${({ animate }) => animate && `
    animation: ${glitchText} 0.4s steps(1) forwards;
  `}

  &::before,
  &::after {
    content: 'HIJACK';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  &::before {
    color: #ff0040;
    animation: ${glitchText} 0.4s steps(1) forwards;
    z-index: -1;
  }

  &::after {
    color: #00fff9;
    animation: ${glitchText} 0.4s steps(1) reverse forwards;
    z-index: -1;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
    letter-spacing: 6px;
  }
`;

const LogoSubtext = styled.div`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 4px;
  text-transform: uppercase;
  margin-bottom: 2rem;
  text-align: center;
`;

const AsciiLogo = styled.pre`
  font-size: 0.55rem;
  line-height: 1.1;
  color: #ffffff;
  text-shadow: 0 0 8px rgba(255,255,255,0.3);
  margin-bottom: 1.5rem;
  white-space: pre;
  overflow: hidden;

  @media (max-width: 768px) {
    font-size: 0.35rem;
  }
`;

const PhaseHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
`;

const PhaseTag = styled.span`
  color: ${({ color }) => color};
  font-weight: bold;
  font-size: 0.75rem;
  letter-spacing: 1px;
`;

const PhaseTitle = styled.span`
  color: rgba(255,255,255,0.5);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const LogLine = styled.div`
  display: flex;
  gap: 0.6rem;
  margin-bottom: 0.35rem;
  font-size: 0.78rem;
  line-height: 1.4;
  animation: ${fadeSlideIn} 0.15s forwards ease-out;
`;

const Tag = styled.span`
  color: ${({ color }) => color || '#a1a1aa'};
  font-weight: bold;
  flex-shrink: 0;
  min-width: ${({ minWidth }) => minWidth || 'auto'};
`;

const CodeBlock = styled.div`
  font-size: 0.7rem;
  color: rgba(255,255,255,0.25);
  margin: 0.5rem 0;
  padding-left: 1rem;
  border-left: 1px solid rgba(255,255,255,0.06);
  animation: ${fadeSlideIn} 0.2s forwards ease-out;
  line-height: 1.5;
  white-space: pre;
  overflow: hidden;
`;

const ProgressBarOuter = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(255,255,255,0.06);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 0.4rem;
`;

const ProgressBarInner = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #666, #fff);
  border-radius: 2px;
  width: ${({ progress }) => progress}%;
  transition: width 0.2s ease-out;
  animation: ${progressGlow} 1.5s infinite ease-in-out;
`;

const ProgressBarGreen = styled(ProgressBarInner)`
  background: linear-gradient(90deg, #00aa55, #00ff88);
`;

const StatusBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1rem;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  font-size: 0.7rem;
`;

const StatusItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
`;

const StatusLabel = styled.span`
  color: rgba(255,255,255,0.3);
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatusValue = styled.span`
  color: ${({ color }) => color || '#ffffff'};
  font-weight: bold;
  font-size: 0.75rem;
`;

const SubProgressItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
`;

const SubProgressLabel = styled.span`
  color: rgba(255,255,255,0.4);
  min-width: 90px;
`;

const SubProgressTrack = styled.div`
  flex: 1;
  height: 3px;
  background: rgba(255,255,255,0.06);
  border-radius: 2px;
  overflow: hidden;
`;

const SubProgressFill = styled.div`
  height: 100%;
  background: ${({ color }) => color || '#ffffff'};
  border-radius: 2px;
  width: ${({ progress }) => progress}%;
  transition: width 0.3s ease-out;
`;

const Cursor = styled.span`
  display: inline-block;
  width: 7px;
  height: 13px;
  background: #ffffff;
  vertical-align: middle;
  margin-left: 2px;
  animation: ${cursorBlink} 1s infinite steps(2);
`;

const GlitchOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  z-index: 20;
  pointer-events: none;
  animation: ${glitchFlash} 0.6s forwards;
`;

const GlitchSlice = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: ${({ h }) => h}px;
  top: ${({ top }) => top}%;
  background: rgba(255,255,255,0.08);
  transform: translateX(${({ offset }) => offset}px);
`;

const FinalScreen = styled(motion.div)`
  position: absolute;
  inset: 0;
  z-index: 15;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #050508;
`;

const ReadyText = styled(motion.pre)`
  font-size: 0.9rem;
  color: #00ff88;
  text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
  text-align: center;
  line-height: 1.4;
  white-space: pre;
`;

/* ─── DATA ─── */
const hexChars = '0123456789ABCDEF';
const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ{}[];:=><+-$#@!%^&*~';

const bootPhases = [
  {
    phase: 'BIOS',
    color: '#ffffff',
    lines: [
      { tag: 'POST', text: 'Power-On Self Test.....................', status: 'PASS' },
      { tag: 'MEM', text: 'Memory Check: 16384 MB DDR5...........', status: 'OK' },
      { tag: 'CPU', text: 'Node.js Runtime v20.x detected.........', status: 'OK' },
      { tag: 'GPU', text: 'Canvas API renderer initialized........', status: 'OK' },
    ],
  },
  {
    phase: 'SYSTEM',
    color: '#a1a1aa',
    lines: [
      { tag: 'FSCK', text: 'Checking filesystem integrity..........', status: 'PASS' },
      { tag: 'LOAD', text: 'Loading kernel modules................', status: 'OK' },
      { tag: 'INIT', text: 'Starting init process.................', status: 'OK' },
      { tag: 'SYNC', text: 'Clock synchronization..................', status: 'OK' },
    ],
  },
  {
    phase: 'NETWORK',
    color: '#6688cc',
    lines: [
      { tag: 'ETH0', text: 'Establishing TCP handshake.............', status: 'OK' },
      { tag: 'DNS', text: 'Resolving hijack.dev..................', status: 'OK' },
      { tag: 'TLS', text: 'TLS 1.3 handshake complete............', status: 'OK' },
      { tag: 'WS', text: 'WebSocket connection established.......', status: 'OK' },
    ],
  },
  {
    phase: 'AUTH',
    color: '#00ff88',
    lines: [
      { tag: 'JWT', text: 'Verifying JSON Web Token..............', status: 'VALID' },
      { tag: 'SESS', text: 'Session store hydrated................', status: 'OK' },
      { tag: 'ACL', text: 'Access control list loaded............', status: 'OK' },
      { tag: '2FA', text: 'Two-factor authentication bypassed....', status: 'OK' },
    ],
  },
  {
    phase: 'DEPENDENCIES',
    color: '#cc8844',
    lines: [
      { tag: 'NPM', text: 'Installing react@17.0.2...............', status: 'OK' },
      { tag: 'NPM', text: 'Installing framer-motion@6.5.1........', status: 'OK' },
      { tag: 'NPM', text: 'Installing @mui/material@5.13.3.......', status: 'OK' },
      { tag: 'NPM', text: 'Installing styled-components@5.3.11..', status: 'OK' },
      { tag: 'NPM', text: 'Installing react-type-animation@3.0.1.', status: 'OK' },
      { tag: 'NPM', text: 'Installing @emailjs/browser@4.4.1.....', status: 'OK' },
    ],
  },
  {
    phase: 'BUILD',
    color: '#cc44cc',
    lines: [
      { tag: 'COMP', text: 'Compiling App.js......................', status: 'OK' },
      { tag: 'COMP', text: 'Compiling Hero/Hero.js................', status: 'OK' },
      { tag: 'COMP', text: 'Compiling TerminalConsole.js...........', status: 'OK' },
      { tag: 'COMP', text: 'Compiling Skills/Skills.js.............', status: 'OK' },
      { tag: 'COMP', text: 'Compiling Projects/ProjectCard.js......', status: 'OK' },
      { tag: 'TREE', text: 'Building component dependency tree.....', status: 'OK' },
      { tag: 'OPT', text: 'Tree-shaking unused exports............', status: 'OK' },
      { tag: 'GZIP', text: 'Gzip compression: 154.72 kB...........', status: 'OK' },
    ],
  },
  {
    phase: 'DEPLOY',
    color: '#00ff88',
    lines: [
      { tag: 'GH', text: 'Pushing to GitHub Pages repository.....', status: 'OK' },
      { tag: 'CDN', text: 'Invalidating CloudFront cache.........', status: 'OK' },
      { tag: 'SSL', text: 'Certificate renewal verified..........', status: 'OK' },
      { tag: 'DNS', text: 'DNS propagation complete..............', status: 'OK' },
      { tag: 'LIVE', text: 'Site is live at hijack.dev............', status: 'UP' },
    ],
  },
];

const codeSnippets = [
  `const express = require('express');
const app = express();
app.use(express.json());`,
  `router.get('/api/v1/auth', authenticate, (req, res) => {
  const user = await User.findById(req.userId);
  res.status(200).json({ status: 'OK', user });
});`,
  `const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '7d' });
await redis.set(\`session:\${user._id}\`, token, 'EX', 604800);`,
  `const io = new Server(httpServer, { cors: { origin: '*' } });
io.on('connection', (socket) => {
  socket.emit('sync_block', latestBlock);
});`,
  `const aggregationPipeline = [
  { $match: { status: 'active' } },
  { $group: { _id: '$category', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
];`,
  `app.use((err, req, res, next) => {
  logger.error(\`\${err.message}\`, { stack: err.stack });
  res.status(500).json({ error: 'Internal Server Error' });
});`,
];

const matrixColumns = Array.from({ length: 30 }, (_, i) => ({
  left: (i / 30) * 100,
  speed: 4 + Math.random() * 8,
  delay: Math.random() * 5,
  chars: Array.from({ length: 20 }, () =>
    matrixChars[Math.floor(Math.random() * matrixChars.length)]
  ).join(''),
}));

const hexStream = Array.from({ length: 120 }, () =>
  Array.from({ length: 8 }, () =>
    hexChars[Math.floor(Math.random() * hexChars.length)]
  ).join(' ')
).join('\n');

/* ─── COMPONENT ─── */
function BootSequence({ onComplete }) {
  const [currentPhase, setCurrentPhase] = useState(-1);
  const [visibleLines, setVisibleLines] = useState([]);
  const [currentCode, setCurrentCode] = useState(null);
  const [mainProgress, setMainProgress] = useState(0);
  const [subProgress, setSubProgress] = useState({});
  const [showFinal, setShowFinal] = useState(false);
  const [showGlitch, setShowGlitch] = useState(false);
  const [done, setDone] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const timersRef = useRef([]);
  const bodyRef = useRef(null);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    let phaseDelay = 300;
    let totalLines = 0;
    const allLineCount = bootPhases.reduce((sum, p) => sum + p.lines.length, 0);

    // Logo reveal
    const logoTimer = setTimeout(() => {
      setCurrentPhase(0);
    }, 200);
    timersRef.current.push(logoTimer);
    phaseDelay = 800;

    bootPhases.forEach((phase, phaseIndex) => {
      // Phase header
      const headerTimer = setTimeout(() => {
        setCurrentPhase(phaseIndex);
        setMainProgress((phaseIndex / bootPhases.length) * 100);
      }, phaseDelay);
      timersRef.current.push(headerTimer);
      phaseDelay += 150;

      phase.lines.forEach((line, lineIndex) => {
        const lineTimer = setTimeout(() => {
          setVisibleLines(prev => [...prev, { ...line, phase: phaseIndex }]);
          totalLines++;
          setSubProgress(prev => ({
            ...prev,
            [phaseIndex]: ((lineIndex + 1) / phase.lines.length) * 100,
          }));
        }, phaseDelay);
        timersRef.current.push(lineTimer);

        // Insert code snippet occasionally
        if (lineIndex === 1 && phaseIndex < codeSnippets.length) {
          const codeTimer = setTimeout(() => {
            setCurrentCode(codeSnippets[phaseIndex]);
          }, phaseDelay + 100);
          timersRef.current.push(codeTimer);

          const codeClearTimer = setTimeout(() => {
            setCurrentCode(null);
          }, phaseDelay + 800);
          timersRef.current.push(codeClearTimer);
        }

        phaseDelay += 80 + Math.random() * 60;
      });

      phaseDelay += 120;
    });

    // Final sequence
    const finalTimer = setTimeout(() => {
      setMainProgress(100);
      setShowGlitch(true);
    }, phaseDelay + 100);
    timersRef.current.push(finalTimer);

    const finalScreenTimer = setTimeout(() => {
      setShowFinal(true);
    }, phaseDelay + 700);
    timersRef.current.push(finalScreenTimer);

    const doneTimer = setTimeout(() => {
      setDone(true);
    }, phaseDelay + 1800);
    timersRef.current.push(doneTimer);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, phaseDelay + 2200);
    timersRef.current.push(completeTimer);

    return () => clearTimers();
  }, [onComplete, clearTimers]);

  // Auto-scroll terminal
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [visibleLines, currentCode]);

  return (
    <AnimatePresence>
      {!done && (
        <Screen exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
          {/* Matrix Rain Background */}
          <MatrixRain>
            {matrixColumns.map((col, i) => (
              <MatrixColumn
                key={i}
                left={col.left}
                speed={col.speed}
                delay={col.delay}
              >
                {col.chars}
              </MatrixColumn>
            ))}
          </MatrixRain>

          {/* Hex Stream Sidebar */}
          <HexStream>
            <HexInner>{hexStream}</HexInner>
          </HexStream>

          {/* Left Panel - Main Terminal */}
          <LeftPanel>
            {/* Animated Glitch Logo */}
            <GlitchLogo animate>HIJACK</GlitchLogo>
            <LogoSubtext>Backend Developer</LogoSubtext>

            {/* Terminal Body */}
            <div ref={bodyRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
              {bootPhases.map((phase, phaseIndex) => {
                const phaseLines = visibleLines.filter(l => l.phase === phaseIndex);
                if (phaseIndex > currentPhase || phaseLines.length === 0) return null;

                return (
                  <div key={phaseIndex} style={{ marginBottom: '1rem' }}>
                    <PhaseHeader>
                      <PhaseTag color={phase.color}>{`[${phase.phase}]`}</PhaseTag>
                      <PhaseTitle>Phase {phaseIndex + 1}/{bootPhases.length}</PhaseTitle>
                      {subProgress[phaseIndex] >= 100 && (
                        <span style={{ color: '#00ff88', fontSize: '0.7rem', marginLeft: 'auto' }}>
                          COMPLETE
                        </span>
                      )}
                    </PhaseHeader>

                    {phaseLines.map((line, i) => (
                      <LogLine key={i}>
                        <Tag color="#00ff88" minWidth="50px">{line.tag}</Tag>
                        <span style={{ flex: 1, color: '#d4d4d8' }}>{line.text}</span>
                        <Tag color={line.status === 'OK' || line.status === 'PASS' || line.status === 'VALID' || line.status === 'UP' ? '#00ff88' : '#ffffff'}>
                          [{line.status}]
                        </Tag>
                      </LogLine>
                    ))}

                    {/* Sub progress bar */}
                    <ProgressBarOuter style={{ marginTop: '0.5rem' }}>
                      <ProgressBarGreen progress={subProgress[phaseIndex] || 0} />
                    </ProgressBarOuter>
                  </div>
                );
              })}

              {/* Code snippet */}
              {currentCode && (
                <CodeBlock>{currentCode}</CodeBlock>
              )}

              {/* Active cursor */}
              {showCursor && !showFinal && (
                <LogLine>
                  <Tag color="#ffffff">{'>'}</Tag>
                  <Cursor />
                </LogLine>
              )}
            </div>

            {/* Main Progress Bar */}
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>
                  OVERALL PROGRESS
                </span>
                <span style={{ fontSize: '0.65rem', color: '#ffffff', fontFamily: 'Courier New' }}>
                  {Math.round(mainProgress)}%
                </span>
              </div>
              <ProgressBarOuter>
                <ProgressBarInner progress={mainProgress} />
              </ProgressBarOuter>
            </div>
          </LeftPanel>

          {/* Right Panel - System Info */}
          <RightPanel>
            <StatusBar>
              <StatusItem>
                <StatusLabel>CPU</StatusLabel>
                <StatusValue color="#00ff88">Node.js</StatusValue>
              </StatusItem>
              <StatusItem>
                <StatusLabel>RAM</StatusLabel>
                <StatusValue>16 GB</StatusValue>
              </StatusItem>
              <StatusItem>
                <StatusLabel>UPTIME</StatusLabel>
                <StatusValue color="#00ff88">99.9%</StatusValue>
              </StatusItem>
            </StatusBar>

            <div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Subsystem Status
              </div>
              {bootPhases.map((phase, i) => (
                <SubProgressItem key={i} style={{ marginBottom: '0.6rem' }}>
                  <SubProgressLabel style={{ color: subProgress[i] >= 100 ? '#00ff88' : 'rgba(255,255,255,0.3)' }}>
                    {phase.phase}
                  </SubProgressLabel>
                  <SubProgressTrack>
                    <SubProgressFill
                      progress={subProgress[i] || 0}
                      color={subProgress[i] >= 100 ? '#00ff88' : 'rgba(255,255,255,0.4)'}
                    />
                  </SubProgressTrack>
                  <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', minWidth: '28px', textAlign: 'right' }}>
                    {Math.round(subProgress[i] || 0)}%
                  </span>
                </SubProgressItem>
              ))}
            </div>

            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: 'auto' }}>
              <div style={{ marginBottom: '0.3rem' }}>Stack: React 17 + Express + MongoDB</div>
              <div style={{ marginBottom: '0.3rem' }}>Cloud: AWS EC2 + S3 + GitHub Actions</div>
              <div>Runtime: Node.js v20.x (ES Modules)</div>
            </div>
          </RightPanel>

          {/* Glitch Overlay */}
          {showGlitch && (
            <GlitchOverlay>
              {[...Array(8)].map((_, i) => (
                <GlitchSlice
                  key={i}
                  h={2 + Math.random() * 15}
                  top={Math.random() * 100}
                  offset={(Math.random() - 0.5) * 40}
                />
              ))}
            </GlitchOverlay>
          )}

          {/* Final Ready Screen */}
          {showFinal && (
            <FinalScreen
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                style={{ textAlign: 'center' }}
              >
                <GlitchLogo animate style={{ fontSize: '4rem', marginBottom: '1rem' }}>HIJACK</GlitchLogo>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#00ff88',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  fontFamily: 'Courier New, monospace',
                  textShadow: '0 0 15px rgba(0, 255, 136, 0.5)',
                  marginTop: '1.5rem',
                }}>
                  ACCESS GRANTED — WELCOME, USER.
                </div>
              </motion.div>
            </FinalScreen>
          )}
          </Screen>
      )}
    </AnimatePresence>
  );
}

export default BootSequence;
