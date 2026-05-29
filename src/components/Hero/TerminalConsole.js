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
  { tag: '[SYSTEM]', color: '#ffffff', text: 'Initializing portfolio backend kernel v3.12.0...' },
  { tag: '[CONFIG]', color: '#a1a1aa', text: 'Parsing local environmental schema config.json... OK' },
  { tag: '[DB_CONN]', color: '#ffffff', text: 'Connecting to AWS RDS master database instance... Connected' },
  { tag: '[REDIS]', color: '#a1a1aa', text: 'Binding TCP session socket store to memory cluster... Connected (0.84ms)' },
  { tag: '[MQ_GATE]', color: '#d4d4d8', text: 'Launching RabbitMQ daemon listeners... 4 task queues established' },
  { tag: '[DAEMON]', color: '#ffffff', text: 'Express API gateway successfully bound on SSL port 3000' },
  { tag: '[SOCKETS]', color: '#ffffff', text: 'Listening for active Socket.IO connections (heartbeat frequency: 25s)' },
  { tag: '[AI_MODEL]', color: '#a1a1aa', text: 'Preloading Zolio evaluation model weights into memory buffer... Loaded (430ms)' },
  { tag: '[CRON]', color: '#d4d4d8', text: 'Triggering scheduled cron daemon: [AQI_Hyperlocal_Sync] (frequency: 5m)' },
];

const loopLogs = [
  { tag: '[GET]', color: '#ffffff', text: '200 OK - /api/v1/projects (Client IP: 198.51.100.12 - Latency: 8ms)' },
  { tag: '[SOCKETS]', color: '#ffffff', text: 'Handshake successful - Establish connection client_id: z7Y9f_3' },
  { tag: '[CACHE]', color: '#a1a1aa', text: 'Redis hit for cache key: /api/v1/skills (Response served instantly)' },
  { tag: '[CRON]', color: '#d4d4d8', text: 'CronJob AQI_Hyperlocal_Sync execution starting... OK' },
  { tag: '[DB_QUERY]', color: '#ffffff', text: 'SELECT * FROM experience WHERE visible = 1... 3 rows fetched (2.1ms)' },
  { tag: '[POST]', color: '#ffffff', text: '201 Created - /api/v1/contact/handshake (Encrypted packet secure)' },
  { tag: '[AI_EVAL]', color: '#a1a1aa', text: 'Zolio LLM analysis triggered - prompt tokens: 1042 - completion tokens: 531' },
];

// Simple helper to highlight success terms monochromatic style
const formatLogText = (text) => {
  const terms = ['OK', 'Connected', 'Bound', 'Listening', 'Loaded', 'Success', 'established', 'starting'];
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
  const containerRef = useRef(null);

  const { scrollY } = useScroll();

  // Rapidly shrink (1.0 -> 0.75) and fade (1.0 -> 0.0) over a tiny 250px scroll window
  const scale = useTransform(scrollY, [0, 250], [1, 0.75]);
  const opacity = useTransform(scrollY, [0, 250], [1, 0]);

  useEffect(() => {
    if (activeLogIndex < initialLogs.length) {
      const timer = setTimeout(() => {
        setLogs(prev => [...prev, initialLogs[activeLogIndex]]);
        setActiveLogIndex(prev => prev + 1);
      }, 500 + Math.random() * 500);
      return () => clearTimeout(timer);
    } else {
      // Loop logs
      const timer = setTimeout(() => {
        const randomLog = loopLogs[Math.floor(Math.random() * loopLogs.length)];
        // Keep logs limit
        setLogs(prev => {
          const next = [...prev, randomLog];
          if (next.length > 20) {
            return next.slice(next.length - 20);
          }
          return next;
        });
        setActiveLogIndex(prev => prev + 1); // trigger infinite update
      }, 1500 + Math.random() * 1500);
      return () => clearTimeout(timer);
    }
  }, [activeLogIndex]);

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
      <TerminalBody>
        {logs.map((log, i) => (
          <LogLine key={i}>
            <LogTag color={log.color}>{log.tag}</LogTag>
            <LogContent>{formatLogText(log.text)}</LogContent>
          </LogLine>
        ))}
        <LogLine style={{ opacity: 1 }}>
          <LogTag color="#ffffff">kishor@backend-node:~$&nbsp;</LogTag>
          <Cursor />
        </LogLine>
      </TerminalBody>
    </TerminalWrapper>
  );
}

export default TerminalConsole;

