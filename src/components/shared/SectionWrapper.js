import React from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';

const Wrapper = styled.section`
  padding: 6rem 0;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 4rem 0;
  }
`;

const StyledTitle = styled(motion.h2)`
  font-size: 2.2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3.5rem;
  background: ${({ theme }) => theme.gradientText};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  display: inline-block;
  left: 50%;
  transform: translateX(-50%);

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
  return (
    <Wrapper id={id}>
      <div className="Container">
        {title && (
          <StyledTitle
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
          >
            {title}
          </StyledTitle>
        )}
        {children}
      </div>
    </Wrapper>
  );
}
