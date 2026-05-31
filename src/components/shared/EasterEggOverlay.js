import React from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { keyframes } from '@emotion/react';

const crtWarp = keyframes`
  0% { transform: scale(1) rotate(0deg); filter: brightness(1); }
  10% { transform: scale(1.02) rotate(-0.5deg); filter: brightness(1.5); }
  20% { transform: scale(0.98) rotate(0.5deg); filter: brightness(0.8); }
  30% { transform: scale(1.01) rotate(-0.3deg); filter: brightness(1.3); }
  50% { transform: scale(1) rotate(0deg); filter: brightness(1); }
  100% { transform: scale(1) rotate(0deg); filter: brightness(1); }
`;

const scanLines = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 0 4px; }
`;

const glitchFlicker = keyframes`
  0%, 100% { opacity: 1; }
  10% { opacity: 0.8; }
  11% { opacity: 1; }
  30% { opacity: 0.9; }
  31% { opacity: 1; }
  50% { opacity: 0.85; }
  51% { opacity: 1; }
  70% { opacity: 0.95; }
  71% { opacity: 1; }
`;

const badgePulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.4); }
  50% { transform: scale(1.05); box-shadow: 0 0 30px 10px rgba(0, 255, 136, 0.2); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 255, 136, 0); }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(10, 10, 15, 0.92);
  backdrop-filter: blur(8px);
  animation: ${crtWarp} 0.6s ease-out;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(255, 255, 255, 0.015) 2px,
      rgba(255, 255, 255, 0.015) 4px
    );
    animation: ${scanLines} 0.1s linear infinite;
    pointer-events: none;
  }
`;

const AchievementBadge = styled(motion.div)`
  padding: 2rem 3rem;
  border: 2px solid rgba(0, 255, 136, 0.4);
  border-radius: 16px;
  background: rgba(0, 255, 136, 0.05);
  text-align: center;
  animation: ${badgePulse} 2s ease-in-out infinite, ${glitchFlicker} 3s ease-in-out infinite;
  position: relative;
  z-index: 1;
`;

const TrophyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 15px rgba(0, 255, 136, 0.5));
`;

const Title = styled.h2`
  font-family: 'Courier New', Courier, monospace;
  font-size: 1.8rem;
  font-weight: 700;
  color: #00ff88;
  text-transform: uppercase;
  letter-spacing: 3px;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5), 2px 2px 0 rgba(255, 0, 64, 0.3), -2px -2px 0 rgba(0, 255, 249, 0.3);
`;

const Subtitle = styled.p`
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 1px;
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

function EasterEggOverlay({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AchievementBadge
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <TrophyIcon>&#127942;</TrophyIcon>
            <Title>Achievement Unlocked</Title>
            <Subtitle>KONAMI_CODE_ACTIVATED</Subtitle>
          </AchievementBadge>
        </Overlay>
      )}
    </AnimatePresence>
  );
}

function AchievementBadgePersistent({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <AchievementUnlockedBadge
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <BadgeDot />
          ACHIEVEMENT_UNLOCKED
        </AchievementUnlockedBadge>
      )}
    </AnimatePresence>
  );
}

export { EasterEggOverlay, AchievementBadgePersistent };
