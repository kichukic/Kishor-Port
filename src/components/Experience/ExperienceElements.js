import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { motion } from 'framer-motion';

export const ExperienceGrid = styled.div`
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 3rem;
  align-items: start;
  width: 100%;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
`;

export const SidebarContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  position: sticky;
  top: 90px;

  @media (max-width: 992px) {
    position: relative;
    top: 0;
    max-width: 500px;
    margin: 0 auto;
  }
`;

export const SidebarTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1.5rem;
`;

export const SidebarGif = styled.img`
  width: 100%;
  max-width: 240px;
  height: auto;
  filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.1));
  margin-bottom: 1.5rem;
  animation: floatReplica 6s ease-in-out infinite;

  @keyframes floatReplica {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
`;

export const LiveSyncCounter = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: #00ff88;
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.2);
`;

export const SyncLabel = styled.div`
  font-size: 0.75rem;
  color: #a1a1aa;
  margin-top: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const TimelineWrapper = styled.div`
  position: relative;
  width: 100%;
  margin: 0 auto;

  &::before {
    content: '';
    position: absolute;
    left: 24px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: ${({ theme }) => theme.gradient};
    opacity: 0.4;
  }
`;

export const TimelineItem = styled(motion.div)`
  position: relative;
  padding-left: 60px;
  padding-bottom: 3rem;
  width: 100%;

  &:last-child {
    padding-bottom: 0;
  }
`;

const glowRipple = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4), 0 0 0 0 rgba(255, 255, 255, 0.2);
  }
  55% {
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0.2), 0 0 0 20px rgba(255, 255, 255, 0.05);
  }
  100% {
    box-shadow: 0 0 0 20px rgba(255, 255, 255, 0), 0 0 0 40px rgba(255, 255, 255, 0);
  }
`;

export const Dot = styled.div`
  position: absolute;
  left: 16px;
  top: 6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: ${({ theme }) => theme.body};
  border: 3px solid #ffffff;
  z-index: 2;
  animation: ${glowRipple} 2.5s infinite ease-out;
`;

export const Card = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 1.5rem;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 12px 40px rgba(255, 255, 255, 0.08);
    transform: translateY(-8px) scale(1.02);
  }
`;

export const Role = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin-bottom: 0.25rem;
`;

export const Company = styled.div`
  font-size: 0.95rem;
  color: #ffffff;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

export const Period = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textMuted};
  margin-bottom: 1rem;
  font-weight: 400;
`;

export const Description = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textSecondary};
  line-height: 1.7;
  margin-bottom: 1rem;
`;

export const TechTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const TechTag = styled.span`
  padding: 0.25rem 0.7rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 20px;
  background: ${({ theme }) => theme.tagBg};
  color: ${({ theme }) => theme.tagText};
  border: 1px solid ${({ theme }) => theme.glow};
`;
