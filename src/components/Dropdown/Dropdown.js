import React from 'react';
import styled from '@emotion/styled';
import { Link as ScrollLink } from 'react-scroll';
import { FaTimes } from 'react-icons/fa';
import { useTheme } from '../../hooks/useTheme';

const Sidebar = styled.div`
  background: ${({ theme }) => theme.body};
  position: fixed;
  height: 100%;
  width: 100%;
  left: 0;
  z-index: 999;
  transition: 0.3s ease-in-out;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  opacity: ${({ isOpen }) => (isOpen ? '1' : '0')};
  top: ${({ isOpen }) => (isOpen ? '0' : '-100%')};
  pointer-events: ${({ isOpen }) => (isOpen ? 'auto' : 'none')};
`;

const CloseIcon = styled(FaTimes)`
  font-size: 1.8rem;
  color: ${({ theme }) => theme.text};
  position: absolute;
  right: 1.5rem;
  top: 1.5rem;
  cursor: pointer;
`;

const NavMenu = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

const NavLink = styled(ScrollLink)`
  color: ${({ theme }) => theme.text};
  font-size: 1.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.neon};
  }
`;

const ResumeBtn = styled.a`
  margin-top: 3rem;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 10px;
  background: ${({ theme }) => theme.gradient};
  color: #fff;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
`;

function Dropdown({ isOpen, toggle }) {
  const { theme } = useTheme();

  const links = [
    { to: 'projects', label: 'Projects' },
    { to: 'experience', label: 'Experience' },
    { to: 'skills', label: 'Skills' },
    { to: 'about', label: 'About' },
    { to: 'contact', label: 'Contact' },
  ];

  return (
    <Sidebar isOpen={isOpen} theme={theme} onClick={toggle}>
      <CloseIcon onClick={toggle} />
      <NavMenu>
        {links.map((link) => (
          <NavLink
            key={link.to}
            onClick={toggle}
            to={link.to}
            smooth
            spy
            offset={-70}
            duration={500}
          >
            {link.label}
          </NavLink>
        ))}
      </NavMenu>
      <ResumeBtn
        href="https://www.linkedin.com/in/kishor-th-6a257a107/"
        target="_blank"
        rel="noopener noreferrer"
        onClick={toggle}
      >
        Resume
      </ResumeBtn>
    </Sidebar>
  );
}

export default Dropdown;
