import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { motion } from 'framer-motion';

export const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
`;

export const CategoryCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 1.5rem;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 12px 40px rgba(255, 255, 255, 0.08);
    transform: translateY(-8px);
  }
`;

export const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

export const CategoryTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
`;

export const CategoryVectorIcon = styled.img`
  width: 50px;
  height: 50px;
  object-fit: contain;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.2));
  animation: floatIcon 4s ease-in-out infinite;

  @keyframes floatIcon {
    0% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-4px) rotate(3deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }
`;

export const SkillRow = styled.div`
  margin-bottom: 1.2rem;
  transition: all 0.2s ease;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    transform: translateX(4px);
  }

  &:hover img {
    transform: scale(1.2) rotate(5deg);
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
  transition: transform 0.25s ease;
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
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

export const ProgressFill = styled(motion.div)`
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #a1a1aa 0%, #ffffff 50%, #a1a1aa 100%);
  width: ${({ level }) => level}%;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.6) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    animation: ${shimmer} 2.5s infinite linear;
  }
`;

