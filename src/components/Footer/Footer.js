import React from 'react';
import styled from '@emotion/styled';
import { FiGithub, FiLinkedin, FiHeart } from 'react-icons/fi';
import { useTheme } from '../../hooks/useTheme';

const FooterWrapper = styled.footer`
  position: relative;
  z-index: 1;
  padding: 4rem 0 2rem;
  border-top: 1px solid ${({ theme }) => theme.glassBorder};
  background: ${({ theme }) => theme.body};
`;

const FooterInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const FooterBrand = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  background: ${({ theme }) => theme.gradientText};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 1rem;
`;

const FooterLink = styled.a`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  color: ${({ theme }) => theme.textSecondary};
  font-size: 1.2rem;
  transition: all 0.2s;

  &:hover {
    color: ${({ theme }) => theme.neon};
    border-color: ${({ theme }) => theme.neon};
    transform: translateY(-3px);
  }
`;

const FooterText = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textMuted};
  display: flex;
  align-items: center;
  gap: 0.4rem;

  svg {
    color: ${({ theme }) => theme.neon};
  }
`;

function Footer() {
  return (
    <FooterWrapper>
      <div className="Container">
        <FooterInner>
          <FooterBrand>Kishor.TH</FooterBrand>
          <FooterLinks>
            <FooterLink
              href="https://github.com/kichukic"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <FiGithub />
            </FooterLink>
            <FooterLink
              href="https://www.linkedin.com/in/kishor-th-6a257a107/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <FiLinkedin />
            </FooterLink>
          </FooterLinks>
          <FooterText>
            Built with <FiHeart /> by Kishor TH &copy; {new Date().getFullYear()}
          </FooterText>
        </FooterInner>
      </div>
    </FooterWrapper>
  );
}

export default Footer;
