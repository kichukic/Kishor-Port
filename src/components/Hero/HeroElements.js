import styled from '@emotion/styled';
import { Link as LinkScroll } from 'react-scroll';
import { motion } from 'framer-motion';

export const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
  padding-top: 70px;
  overflow: hidden;
`;

export const HeroContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 3rem;
  width: 100%;

  @media (max-width: 992px) {
    flex-direction: column-reverse;
    text-align: center;
    gap: 2rem;
  }
`;

export const HeroLeft = styled(motion.div)`
  flex: 1.2;
`;

export const HeroRight = styled(motion.div)`
  flex: 0.8;
  display: flex;
  justify-content: center;
`;

export const Greeting = styled(motion.span)`
  font-size: 1rem;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 0.5rem;
  display: block;
  letter-spacing: 1px;
`;

export const Name = styled(motion.h1)`
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 0.5rem;

  .highlight {
    background: ${({ theme }) => theme.gradientText};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

export const Subtitle = styled(motion.div)`
  font-size: 1.4rem;
  color: ${({ theme }) => theme.textSecondary};
  font-weight: 400;
  margin-bottom: 1.5rem;
  min-height: 2rem;

  .typing {
    color: #ffffff;
  }

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

export const Description = styled(motion.p)`
  font-size: 1rem;
  color: ${({ theme }) => theme.textMuted};
  max-width: 540px;
  line-height: 1.7;
  margin-bottom: 2rem;

  @media (max-width: 992px) {
    margin: 0 auto 2rem;
  }
`;

export const HeroButtons = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 992px) {
    justify-content: center;
  }
`;

export const PrimaryBtn = styled.a`
  padding: 0.75rem 2rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 10px;
  background: ${({ theme }) => theme.gradient};
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${({ theme }) => theme.shadow};
  }
`;

export const SecondaryBtn = styled.a`
  padding: 0.75rem 2rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 10px;
  background: transparent;
  color: ${({ theme }) => theme.neon};
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${({ theme }) => theme.neon};
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${({ theme }) => theme.tagBg};
    box-shadow: ${({ theme }) => theme.shadow};
  }
`;

export const HeroImage = styled(motion.img)`
  width: 440px;
  height: auto;
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.15));

  @media (max-width: 768px) {
    width: 290px;
  }
`;

export const ScrollIndicator = styled(motion.div)`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.8rem;
  cursor: pointer;
`;

export const ScrollDot = styled(motion.div)`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ theme }) => theme.neon};
`;

export const FloatingShape = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.neon};
  opacity: 0.15;
  pointer-events: none;
`;
