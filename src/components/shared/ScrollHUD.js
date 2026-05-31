import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

const dotPulse = keyframes`
  0% { box-shadow: 0 0 4px rgba(255, 255, 255, 0.4); }
  50% { box-shadow: 0 0 12px rgba(255, 255, 255, 0.7); }
  100% { box-shadow: 0 0 4px rgba(255, 255, 255, 0.4); }
`;

const HudContainer = styled.div`
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Track = styled.div`
  width: 2px;
  height: 180px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 1px;
  position: relative;
  overflow: hidden;
`;

const Fill = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.2));
  border-radius: 1px;
  height: ${({ progress }) => progress}%;
  transition: height 0.15s ease-out;
`;

const Dot = styled.div`
  position: absolute;
  top: ${({ progress }) => progress}%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffffff;
  transition: top 0.15s ease-out;
  animation: ${dotPulse} 2s infinite ease-in-out;
  z-index: 2;
`;

const SectionLabel = styled.div`
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.6rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 1px;
  text-transform: uppercase;
  white-space: nowrap;
  position: absolute;
  right: 14px;
  top: 50%;
  transform: rotate(180deg) translateY(50%);
  transition: color 0.3s ease;

  ${({ isActive }) => isActive && `
    color: rgba(255, 255, 255, 0.9);
  `}
`;

const Percent = styled.div`
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.6rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  min-width: 32px;
`;

const sectionMap = [
  { id: 'hero', label: 'HERO' },
  { id: 'projects', label: 'PROJECTS' },
  { id: 'experience', label: 'EXPERIENCE' },
  { id: 'skills', label: 'SKILLS' },
  { id: 'about', label: 'ABOUT' },
  { id: 'certification', label: 'CERTS' },
  { id: 'contact', label: 'CONTACT' },
];

function ScrollHUD() {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');
  const observerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollPercent(Math.min(100, Math.max(0, percent)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sections = [];

    sectionMap.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) sections.push(el);
    });

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            if (sectionMap.find(s => s.id === id)) {
              setActiveSection(id);
            }
          }
        });
      },
      {
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0,
      }
    );

    sections.forEach((section) => {
      observerRef.current.observe(section);
    });

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  const currentLabel = sectionMap.find(s => s.id === activeSection)?.label || '';

  return (
    <HudContainer>
      <Percent>{Math.round(scrollPercent)}%</Percent>
      <Track>
        <Fill progress={scrollPercent} />
        <Dot progress={scrollPercent} />
      </Track>
      <SectionLabel isActive>{currentLabel}</SectionLabel>
    </HudContainer>
  );
}

export default ScrollHUD;
