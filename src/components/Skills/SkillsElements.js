import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
`;

export const CategoryCard = styled(motion.div)`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${({ theme }) => theme.neonSecondary};
    box-shadow: ${({ theme }) => theme.shadowSecondary};
    transform: translateY(-4px);
  }
`;

export const CategoryTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const SkillRow = styled.div`
  margin-bottom: 1.2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const SkillHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.4rem;
`;

export const SkillInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

export const SkillIcon = styled.img`
  width: 20px;
  height: 20px;
  object-fit: contain;
`;

export const SkillName = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
`;

export const SkillLevel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #ffffff;
`;

export const ProgressTrack = styled.div`
  width: 100%;
  height: 6px;
  background: ${({ theme }) => theme.progressBg};
  border-radius: 3px;
  overflow: hidden;
`;

export const ProgressFill = styled(motion.div)`
  height: 100%;
  border-radius: 3px;
  background: ${({ theme }) => theme.gradient};
  width: ${({ level }) => level}%;
`;
