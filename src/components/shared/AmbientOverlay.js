import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  transition: background 1.5s ease;
  background: ${({ tint }) => tint || 'transparent'};
`;

const sectionTints = {
  hero: 'transparent',
  projects: 'radial-gradient(ellipse at center, rgba(0, 100, 255, 0.07) 0%, transparent 70%)',
  experience: 'radial-gradient(ellipse at center, rgba(255, 150, 0, 0.05) 0%, transparent 70%)',
  skills: 'radial-gradient(ellipse at center, rgba(0, 200, 200, 0.05) 0%, transparent 70%)',
  about: 'radial-gradient(ellipse at center, rgba(150, 0, 255, 0.04) 0%, transparent 70%)',
  certification: 'radial-gradient(ellipse at center, rgba(0, 255, 100, 0.04) 0%, transparent 70%)',
  contact: 'radial-gradient(ellipse at center, rgba(0, 255, 80, 0.05) 0%, transparent 70%)',
};

function AmbientOverlay() {
  const [activeSection, setActiveSection] = useState('hero');
  const observerRef = useRef(null);

  useEffect(() => {
    const sections = document.querySelectorAll('[id]');
    const visibleSections = [];

    sections.forEach((section) => {
      const id = section.getAttribute('id');
      if (!sectionTints[id]) return;
      visibleSections.push(section);
    });

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            if (sectionTints[id]) {
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

    visibleSections.forEach((section) => {
      observerRef.current.observe(section);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return <Overlay tint={sectionTints[activeSection]} />;
}

export default AmbientOverlay;
