import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const AboutContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 3rem;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
`;

export const AboutLeft = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const ProfileImage = styled(motion.img)`
  width: 320px;
  height: auto;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.1));

  @media (max-width: 768px) {
    width: 220px;
  }
`;

export const AboutRight = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Bio = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textSecondary};
  line-height: 1.8;
`;

export const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;

  @media (max-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${({ theme }) => theme.neon};
    box-shadow: ${({ theme }) => theme.shadow};
  }
`;

export const StatNumber = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  background: ${({ theme }) => theme.gradientText};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const StatLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textMuted};
  margin-top: 0.25rem;
`;
