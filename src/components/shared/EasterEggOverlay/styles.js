import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { keyframes } from '@emotion/react';

/* ─── STYLED SHELL ─── */
const scanLines = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 0 4px; }
`;

const GameOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #000008;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Courier New', Courier, monospace;

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
    animation: ${scanLines} 0.1s linear infinite;
    pointer-events: none;
    z-index: 10;
  }
`;

const GameCanvas = styled.canvas`
  display: block;
  image-rendering: pixelated;
  cursor: none;
  touch-action: none;
`;

const GameUI = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 2px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(0, 0, 8, 0.8);
  z-index: 20;
  pointer-events: none;
`;

const HudGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
`;

const HudItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const HudLabel = styled.span`
  font-size: 0.55rem;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const HudValue = styled.span`
  font-size: 0.85rem;
  font-weight: bold;
  color: ${({ color }) => color || '#ffffff'};
`;

const PowerUpBar = styled.div`
  display: flex;
  gap: 0.6rem;
  align-items: center;
`;

const PowerChip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  border: 1px solid ${({ color }) => color || '#ffffff'};
  background: ${({ color }) => color ? color + '18' : 'rgba(255,255,255,0.06)'};
  font-size: 0.6rem;
  letter-spacing: 1px;
  color: ${({ color }) => color || '#ffffff'};
`;

const PowerTimerTrack = styled.div`
  width: 40px;
  height: 3px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 2px;
  overflow: hidden;
`;

const PowerTimerFill = styled.div`
  height: 100%;
  border-radius: 2px;
  background: ${({ color }) => color || '#ffffff'};
  width: ${({ pct }) => pct}%;
  transition: width 0.15s linear;
`;

const EscHint = styled.div`
  position: absolute;
  bottom: 0.75rem;
  right: 1.5rem;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.25);
  letter-spacing: 2px;
  z-index: 20;
  pointer-events: none;
`;

const GameTitle = styled.div`
  position: absolute;
  bottom: 0.75rem;
  left: 1.5rem;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.15);
  letter-spacing: 3px;
  text-transform: uppercase;
  z-index: 20;
  pointer-events: none;
`;

const OverlayMessage = styled(motion.div)`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 8, 0.88);
  z-index: 30;
  gap: 1.5rem;
`;

const MsgTitle = styled.div`
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: 6px;
  text-transform: uppercase;
  color: ${({ color }) => color || '#ffffff'};
  text-shadow: 0 0 30px ${({ color }) => color || 'rgba(255,255,255,0.3)'};
`;

const MsgSub = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 3px;
  text-align: center;
`;

const MsgBtn = styled.button`
  margin-top: 0.5rem;
  padding: 0.65rem 2rem;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  font-weight: bold;
  letter-spacing: 3px;
  text-transform: uppercase;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #ffffff;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.8);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.15);
  }
`;

/* ─── PERSISTENT BADGE ─── */
const badgePulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.4); }
  50% { box-shadow: 0 0 30px 10px rgba(0, 255, 136, 0.2); }
  100% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0); }
`;

const AchievementUnlockedBadge = styled(motion.div)`
  position: fixed;
  top: 85px;
  right: 20px;
  z-index: 10000;
  padding: 0.6rem 1rem;
  border-radius: 10px;
  background: rgba(0, 255, 136, 0.08);
  border: 1px solid rgba(0, 255, 136, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.75rem;
  font-weight: 600;
  color: #00ff88;
  letter-spacing: 0.5px;
  backdrop-filter: blur(12px);
  animation: ${badgePulse} 2s ease-in-out infinite;
`;

const BadgeDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00ff88;
  display: inline-block;
  animation: statusPulse 1.8s infinite ease-in-out;

  @keyframes statusPulse {
    0% { opacity: 0.4; box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.4); }
    50% { opacity: 1; box-shadow: 0 0 0 4px rgba(0, 255, 136, 0.1); }
    100% { opacity: 0.4; box-shadow: 0 0 0 0 rgba(0, 255, 136, 0); }
  }
`;

export {
  scanLines,
  GameOverlay,
  GameCanvas,
  GameUI,
  HudGroup,
  HudItem,
  HudLabel,
  HudValue,
  PowerUpBar,
  PowerChip,
  PowerTimerTrack,
  PowerTimerFill,
  EscHint,
  GameTitle,
  OverlayMessage,
  MsgTitle,
  MsgSub,
  MsgBtn,
  badgePulse,
  AchievementUnlockedBadge,
  BadgeDot,
};
