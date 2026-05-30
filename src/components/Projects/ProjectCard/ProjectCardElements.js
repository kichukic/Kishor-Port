import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { motion } from 'framer-motion';

export const Card = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;

  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 12px 40px rgba(255, 255, 255, 0.08);
    transform: translateY(-8px);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

export const CardLeft = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    max-width: 350px;
    object-fit: contain;
    filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.08));
    animation: ${float} 6s ease-in-out infinite;
    mix-blend-mode: screen;
  }
`;

export const CardRight = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const ProjectTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin-bottom: 0.75rem;
`;

export const ProjectDesc = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textSecondary};
  line-height: 1.7;
  margin-bottom: 1rem;
`;

export const TechStack = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

export const TechTag = styled.span`
  padding: 0.3rem 0.8rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 20px;
  background: ${({ theme }) => theme.tagBg};
  color: ${({ theme }) => theme.tagText};
  border: 1px solid ${({ theme }) => theme.glow};
`;

export const BtnGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

export const Btn = styled.a`
  padding: 0.6rem 1.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ primary, theme }) =>
    primary ? theme.gradient : 'transparent'};
  color: ${({ primary }) => (primary ? '#fff' : 'inherit')};
  border: ${({ primary, theme }) =>
    primary ? 'none' : `1px solid ${theme.neon}`};
  color: ${({ primary, theme }) => (primary ? '#fff' : theme.neon)};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadow};
  }
`;
