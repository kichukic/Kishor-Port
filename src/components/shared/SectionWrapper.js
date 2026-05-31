import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

const glitchAnim1 = keyframes`
  0% { clip-path: inset(40% 0 61% 0); transform: translate(-2px, -1px); }
  20% { clip-path: inset(92% 0 1% 0); transform: translate(1px, 2px); }
  40% { clip-path: inset(43% 0 1% 0); transform: translate(-1px, -2px); }
  60% { clip-path: inset(25% 0 58% 0); transform: translate(2px, 1px); }
  80% { clip-path: inset(54% 0 7% 0); transform: translate(-1px, 2px); }
  100% { clip-path: inset(58% 0 43% 0); transform: translate(0); }
`;

const glitchAnim2 = keyframes`
  0% { clip-path: inset(65% 0 13% 0); transform: translate(2px, 1px); }
  20% { clip-path: inset(17% 0 63% 0); transform: translate(-1px, -2px); }
  40% { clip-path: inset(79% 0 2% 0); transform: translate(1px, 2px); }
  60% { clip-path: inset(33% 0 45% 0); transform: translate(-2px, -1px); }
  80% { clip-path: inset(5% 0 82% 0); transform: translate(1px, -2px); }
  100% { clip-path: inset(42% 0 30% 0); transform: translate(0); }
`;

const Wrapper = styled.section`
  padding: 6rem 0;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 4rem 0;
  }
`;

const TitleContainer = styled.div`
  text-align: center;
  margin-bottom: 3.5rem;
  position: relative;
  display: inline-block;
  left: 50%;
  transform: translateX(-50%);
  width: auto;
`;

const GlitchTitle = styled(motion.h2)`
  font-size: 2.2rem;
  font-weight: 700;
  background: ${({ theme }) => theme.gradientText};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  display: inline-block;

  &::before,
  &::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${({ theme }) => theme.gradientText};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    pointer-events: none;
    opacity: 0;
  }

  ${({ isGlitching }) => isGlitching && `
    &::before {
      opacity: 0.8;
      animation: ${glitchAnim1} 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
      text-shadow: 2px 0 #ff0040, -2px 0 #00fff9;
      -webkit-text-fill-color: initial;
      background: transparent;
    }

    &::after {
      opacity: 0.8;
      animation: ${glitchAnim2} 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both reverse;
      text-shadow: -2px 0 #ff0040, 2px 0 #00fff9;
      -webkit-text-fill-color: initial;
      background: transparent;
    }
  `}

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: ${({ theme }) => theme.gradient};
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    font-size: 1.7rem;
  }
`;

export default function SectionWrapper({ id, title, children }) {
  const titleRef = useRef(null);
  const isInView = useInView(titleRef, { once: true, margin: '-60px' });
  const [isGlitching, setIsGlitching] = React.useState(false);

  React.useEffect(() => {
    if (isInView && title) {
      setIsGlitching(true);
      const timer = setTimeout(() => setIsGlitching(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isInView, title]);

  return (
    <Wrapper id={id}>
      <div className="Container">
        {title && (
          <TitleContainer ref={titleRef}>
            <GlitchTitle
              data-text={title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              isGlitching={isGlitching}
            >
              {title}
            </GlitchTitle>
          </TitleContainer>
        )}
        {children}
      </div>
    </Wrapper>
  );
}
