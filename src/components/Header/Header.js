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

const Header = ({ toggle }) => {
  const [scrolled, setScrolled] = useState(false);
  const [uptime, setUptime] = useState(0);

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

  return (
    <Nav scrolled={scrolled ? 1 : 0}>
      <NavInner>
        <Logo>Kishor.TH</Logo>
        <StatusBadge>
          <StatusDot />
          ONLINE {formatUptime(uptime)}
        </StatusBadge>
        <NavMenu>
          <NavLink to="projects" smooth spy offset={-70} duration={500}>
            Projects
          </NavLink>
          <NavLink to="experience" smooth spy offset={-70} duration={500}>
            Experience
          </NavLink>
          <NavLink to="skills" smooth spy offset={-70} duration={500}>
            Skills
          </NavLink>
          <NavLink to="about" smooth spy offset={-70} duration={500}>
            About
          </NavLink>
          <NavLink to="contact" smooth spy offset={-70} duration={500}>
            Contact
          </NavLink>
        </NavMenu>
        <NavActions>
          <ResumeBtn
            href="https://www.linkedin.com/in/kishor-th-6a257a107/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Resume
          </ResumeBtn>
          <MobileMenuBtn onClick={toggle} />
        </NavActions>
      </NavInner>
    </Nav>
  );
};

export default Header;
