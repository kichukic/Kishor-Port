import React, { useState, useEffect } from 'react';
import {
  Nav,
  NavInner,
  Logo,
  NavMenu,
  NavLink,
  NavActions,
  ResumeBtn,
  MobileMenuBtn,
  StatusBadge,
  StatusDot,
} from './HeaderElements';
import { useSound } from '../../hooks/useSound';

const Header = ({ toggle }) => {
  const [scrolled, setScrolled] = useState(false);
  const [uptime, setUptime] = useState(0);
  const { hover, click, toggleOpen } = useSound();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setUptime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleToggle = () => {
    toggleOpen();
    toggle();
  };

  return (
    <Nav scrolled={scrolled ? 1 : 0}>
      <NavInner>
        <Logo>Kishor.TH</Logo>
        <StatusBadge>
          <StatusDot />
          ONLINE {formatUptime(uptime)}
        </StatusBadge>
        <NavMenu>
          <NavLink to="projects" smooth spy offset={-70} duration={500} onMouseEnter={hover} onClick={click}>
            Projects
          </NavLink>
          <NavLink to="experience" smooth spy offset={-70} duration={500} onMouseEnter={hover} onClick={click}>
            Experience
          </NavLink>
          <NavLink to="skills" smooth spy offset={-70} duration={500} onMouseEnter={hover} onClick={click}>
            Skills
          </NavLink>
          <NavLink to="about" smooth spy offset={-70} duration={500} onMouseEnter={hover} onClick={click}>
            About
          </NavLink>
          <NavLink to="contact" smooth spy offset={-70} duration={500} onMouseEnter={hover} onClick={click}>
            Contact
          </NavLink>
        </NavMenu>
        <NavActions>
          <ResumeBtn
            href="https://www.linkedin.com/in/kishor-th-6a257a107/"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={hover}
            onClick={click}
          >
            Resume
          </ResumeBtn>
          <MobileMenuBtn onClick={handleToggle} />
        </NavActions>
      </NavInner>
    </Nav>
  );
};

export default Header;
