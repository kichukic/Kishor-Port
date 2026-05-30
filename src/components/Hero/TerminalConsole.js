import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { motion, useScroll, useTransform } from 'framer-motion';

const TerminalWrapper = styled(motion.div)`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  border-radius: 12px;
  width: 100%;
  max-width: 900px;
  margin: 3rem auto 0;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), 0 0 30px rgba(255, 255, 255, 0.02);
  overflow: hidden;
  font-family: 'Courier New', Courier, monospace;
`;

const TerminalHeader = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const WindowButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const DotBtn = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.color};
  display: inline-block;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const TerminalTitle = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.5px;
`;

const ServerStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
`;

const StatusIndicator = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffffff;
  display: inline-block;
  animation: pulseLight 1.8s infinite ease-in-out;

  @keyframes pulseLight {
    0% { opacity: 0.4; box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
    50% { opacity: 1; box-shadow: 0 0 0 5px rgba(255, 255, 255, 0.2); }
    100% { opacity: 0.4; box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
  }
`;

const TerminalBody = styled.div`
  padding: 1.5rem;
  font-size: 0.85rem;
  line-height: 1.6;
  color: #d4d4d8;
  min-height: 280px;
  max-height: 380px;
  overflow-y: auto;
  text-align: left;

  ::-webkit-scrollbar {
    width: 4px;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
`;

const LogLine = styled.div`
  margin-bottom: 0.5rem;
  display: flex;
  gap: 0.75rem;
  opacity: 0;
  animation: logShow 0.3s forwards ease-out;

  @keyframes logShow {
    to { opacity: 1; }
  }

  @media (max-width: 576px) {
    flex-direction: column;
    gap: 0.15rem;
    align-items: flex-start;
  }
`;

const LogTag = styled.span`
  color: ${props => props.color || '#a1a1aa'};
  font-weight: bold;
  flex-shrink: 0;
`;

const LogContent = styled.span`
  color: ${props => props.color || '#d4d4d8'};

  .highlight {
    color: #ffffff;
    font-weight: bold;
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.25);
  }
`;

const Cursor = styled.span`
  display: inline-block;
  width: 8px;
  height: 15px;
  background: #ffffff;
  margin-left: 4px;
  vertical-align: middle;
  animation: cursorBlink 1s infinite steps(2);

  @keyframes cursorBlink {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
  }
`;

const initialLogs = [
  { tag: 'kishor@backend-node:~$', color: '#00ff88', text: 'curl -s https://api.kishor.dev/resume' },
  { tag: '[SYSTEM]', color: '#ffffff', text: 'Fetching profile package... OK (142ms)' },
  { tag: '================== KISHOR TH ==================', color: '#ffffff', text: '' },
  { tag: 'Role:', color: '#ffffff', text: 'Node.js Developer (4 Years Experience)' },
  { tag: 'Contact:', color: '#a1a1aa', text: 'Aluva, Kerala | kishor.th@hotmail.com' },
  { tag: 'Links:', color: '#a1a1aa', text: 'github.com/kichukic | kichukic.github.io/Kishor-Port' },
  { tag: '================== CORE SKILLS ==================', color: '#ffffff', text: '' },
  { tag: 'Technical:', color: '#00ff88', text: 'JavaScript (ES6+), TypeScript, Node.js, Express.js, REST APIs, WebSockets' },
  { tag: 'Databases:', color: '#ffffff', text: 'MongoDB (Aggregations), MySQL, Redis (Caching)' },
  { tag: 'Cloud/Ops:', color: '#a1a1aa', text: 'AWS (EC2, S3), GCP, GitHub Actions, Jenkins, Bitbucket' },
  { tag: 'Tools/Misc:', color: '#a1a1aa', text: 'VS Code, WebStorm, Docker, Docker Compose, Postman, Jest, Mocha' },
  { tag: 'Languages:', color: '#ffffff', text: 'English (Fluent), Malayalam (Proficient), Hindi (Fluent)' },
  { tag: '================== WORK EXPERIENCE ==================', color: '#ffffff', text: '' },
  { tag: 'Tamcherry:', color: '#00ff88', text: 'Node.js Developer (Dec 2024 - Present)' },
  { tag: '  * Zolio:', color: '#d4d4d8', text: 'Architected scalable APIs using Node.js, Express, MongoDB for AI platform' },
  { tag: '  * LLM API:', color: '#d4d4d8', text: 'Integrated OpenAI/Gemini for question generation & candidate evaluation' },
  { tag: '  * DevOps:', color: '#d4d4d8', text: 'Led Bitbucket/GitHub Actions CI/CD setup, AWS infrastructure, Redis caching' },
  { tag: 'Alcodex:', color: '#00ff88', text: 'Node.js Developer (Mar 2022 - Nov 2024)' },
  { tag: '  * Envitus:', color: '#d4d4d8', text: 'Developed IoT suite for real-time monitoring of hyperlocal air quality' },
  { tag: '  * Querying:', color: '#d4d4d8', text: 'Designed MongoDB aggregations for efficient AQI analytics' },
  { tag: '  * CI/CD:', color: '#d4d4d8', text: 'Automated code testing & AWS/GCP deployments via GitHub Actions' },
  { tag: 'Resurs:', color: '#00ff88', text: 'Node.js Intern (Oct 2021 - Mar 2022)' },
  { tag: '  * Chat:', color: '#d4d4d8', text: 'Developed real-time chat application with WebSockets & JWT authentication' },
  { tag: '================== PROJECTS ==================', color: '#ffffff', text: '' },
  { tag: 'Zolio.ai:', color: '#00ff88', text: 'AI automated recruitment platform conducting L1/L2 interview assessments.' },
  { tag: 'Chat App:', color: '#00ff88', text: 'Real-time WebSocket instant messaging with MongoDB storage and JWT security' },
  { tag: '================== CERTIFICATIONS ==================', color: '#ffffff', text: '' },
  { tag: 'Certs:', color: '#00ff88', text: 'AWS Certified Solutions Architect | Google Cloud Professional Cloud Architect' },
  { tag: '================== EDUCATION ==================', color: '#ffffff', text: '' },
  { tag: 'College:', color: '#a1a1aa', text: 'B.com (Sep 2014 - Oct 2018) @ C.E.T. College of Management' },
  { tag: 'School:', color: '#a1a1aa', text: 'Plustwo (Aug 2013 - Aug 2014) @ Eloor GHSS' },
  { tag: '[SYSTEM]', color: '#00ff88', text: 'Resume successfully loaded. kishor@backend-node:~$' }
];

// Simple helper to highlight success terms monochromatic style
const formatLogText = (text) => {
  const terms = [
    'Node.js', 'Express.js', 'MongoDB', 'MySQL', 'Redis', 'AWS', 'GCP', 
    'Docker', 'Docker Compose', 'WebSockets', 'JWT', 'TypeScript', 
    'OpenAI', 'Gemini', 'Zolio', 'Envitus', 'Chat App', 'Bitbucket', 
    'GitHub Actions', 'Jenkins', 'Postman', 'Jest', 'Mocha', 'REST APIs', 
    'Solutions Architect', 'Cloud Architect', 'Successful', 'OK'
  ];
  let formatted = text;
  terms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'g');
    formatted = formatted.replace(regex, `<span class="highlight">${term}</span>`);
  });
  return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
};

function TerminalConsole() {
  const [logs, setLogs] = useState([]);
  const [activeLogIndex, setActiveLogIndex] = useState(0);
  const [currentTypedText, setCurrentTypedText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const containerRef = useRef(null);
  const bodyRef = useRef(null);

  const { scrollY } = useScroll();

  // Gradually shrink (1.0 -> 0.75) and fade (1.0 -> 0.0) over a 800px scroll window for a slower transition
  const scale = useTransform(scrollY, [0, 800], [1, 0.75]);
  const opacity = useTransform(scrollY, [0, 800], [1, 0]);

  useEffect(() => {
    const currentLine = initialLogs[activeLogIndex % initialLogs.length];
    if (!currentLine) return;

    if (charIndex < currentLine.text.length) {
      // Type character-by-character
      const timer = setTimeout(() => {
        setCurrentTypedText(prev => prev + currentLine.text[charIndex]);
        setCharIndex(prev => prev + 1);
      }, 15 + Math.random() * 20); // Smooth typing character speed (15ms - 35ms)
      return () => clearTimeout(timer);
    } else {
      // Pause briefly on the completed line to make it readable, then commit to log history
      const timer = setTimeout(() => {
        setLogs(prev => {
          const next = [...prev, currentLine];
          // Keep a buffer of the last 80 terminal lines to preserve browser memory
          if (next.length > 80) {
            return next.slice(next.length - 80);
          }
          return next;
        });

        // Advance to the next line and reset character index
        setActiveLogIndex(prev => prev + 1);
        setCurrentTypedText('');
        setCharIndex(0);
      }, 700); // 700ms pause after a full line completes before starting the next one
      return () => clearTimeout(timer);
    }
  }, [activeLogIndex, charIndex]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [logs, currentTypedText]);

  const activeLine = initialLogs[activeLogIndex % initialLogs.length];

  return (
    <TerminalWrapper
      ref={containerRef}
      style={{ scale, opacity }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      <TerminalHeader>
        <WindowButtons>
          <DotBtn color="rgba(255, 255, 255, 0.4)" />
          <DotBtn color="rgba(255, 255, 255, 0.25)" />
          <DotBtn color="rgba(255, 255, 255, 0.15)" />
        </WindowButtons>
        <TerminalTitle>bash - kishor@backend-node: ~</TerminalTitle>
        <ServerStatus>
          <StatusIndicator />
          PORT: 3000
        </ServerStatus>
      </TerminalHeader>
      <TerminalBody ref={bodyRef}>
        {logs.map((log, i) => (
          <LogLine key={i}>
            <LogTag color={log.color}>{log.tag}</LogTag>
            <LogContent>{formatLogText(log.text)}</LogContent>
          </LogLine>
        ))}
        {activeLine && (
          <LogLine style={{ opacity: 1 }}>
            <LogTag color={activeLine.color}>{activeLine.tag}</LogTag>
            <LogContent>{formatLogText(currentTypedText)}</LogContent>
          </LogLine>
        )}
        <LogLine style={{ opacity: 1 }}>
          <LogTag color="#ffffff">kishor@backend-node:~$&nbsp;</LogTag>
          <Cursor />
        </LogLine>
      </TerminalBody>
    </TerminalWrapper>
  );
}

export default TerminalConsole;

