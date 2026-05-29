import React from 'react';
import { FiGithub, FiLinkedin } from 'react-icons/fi';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const SocialBar = styled(motion.div)`
  position: fixed;
  left: 1.5rem;
  bottom: 50%;
  transform: translateY(50%);
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  @media (max-width: 1000px) {
    display: none;
  }
`;

const SocialItem = styled.a`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.glassBg};
  border: 1px solid ${({ theme }) => theme.glassBorder};
  backdrop-filter: ${({ theme }) => theme.backdrop};
  color: ${({ theme }) => theme.textSecondary};
  font-size: 1.2rem;
  transition: all 0.2s;

  &:hover {
    color: ${({ theme }) => theme.neon};
    border-color: ${({ theme }) => theme.neon};
    box-shadow: ${({ theme }) => theme.shadow};
    transform: translateX(4px);
  }
`;

function FixSocialIcon() {
  return (
    <SocialBar
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
    >
      <SocialItem
        href="https://github.com/kichukic"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
      >
        <FiGithub />
      </SocialItem>
      <SocialItem
        href="https://www.linkedin.com/in/kishor-th-6a257a107/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
      >
        <FiLinkedin />
      </SocialItem>
    </SocialBar>
  );
}

export default FixSocialIcon;
