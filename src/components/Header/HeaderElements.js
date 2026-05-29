import styled from '@emotion/styled';
import { Link as ScrollLink } from 'react-scroll';
import { FaBars } from 'react-icons/fa';

export const Nav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: ${({ theme, scrolled }) =>
    scrolled ? theme.glassBg : 'transparent'};
  backdrop-filter: ${({ scrolled, theme }) =>
    scrolled ? theme.backdrop : 'none'};
  border-bottom: ${({ scrolled, theme }) =>
    scrolled ? `1px solid ${theme.glassBorder}` : 'none'};
  transition: all 0.3s ease;
  height: 70px;
  display: flex;
  align-items: center;
`;

export const NavInner = styled.div`
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.3rem;
  font-weight: 700;
  background: ${({ theme }) => theme.gradientText};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  cursor: default;
`;

export const NavMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;

  @media screen and (max-width: 768px) {
    display: none;
  }
`;

export const NavLink = styled(ScrollLink)`
  padding: 0.5rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.textSecondary};
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  letter-spacing: 0.3px;

  &:hover {
    color: ${({ theme }) => theme.neon};
    background: ${({ theme }) => theme.tagBg};
  }

  &.active {
    color: ${({ theme }) => theme.neon};
  }
`;

export const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const ResumeBtn = styled.a`
  padding: 0.5rem 1.2rem;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 10px;
  background: ${({ theme }) => theme.gradient};
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.3px;
  border: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadow};
  }

  @media screen and (max-width: 768px) {
    display: none;
  }
`;

export const MobileMenuBtn = styled(FaBars)`
  display: none;
  color: ${({ theme }) => theme.text};
  font-size: 1.4rem;
  cursor: pointer;

  @media screen and (max-width: 768px) {
    display: block;
  }
`;
