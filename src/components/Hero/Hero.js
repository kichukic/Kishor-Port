import React, { useState } from 'react';
import { TypeAnimation } from 'react-type-animation';
import { FiArrowDown, FiGithub, FiLinkedin } from 'react-icons/fi';
import {
  HeroSection,
  HeroContent,
  HeroLeft,
  HeroRight,
  Greeting,
  Name,
  Subtitle,
  Description,
  HeroButtons,
  PrimaryBtn,
  SecondaryBtn,
  HeroImage,
  ScrollIndicator,
  ScrollDot,
  FloatingShape,
} from './HeroElements';
import { useTheme } from '../../hooks/useTheme';
import BackendDevHero from '../../images/backend_dev_hero.gif';
import TerminalConsole from './TerminalConsole';

function Hero() {
  const { theme } = useTheme();
  const [showScroll, setShowScroll] = useState(false);

  const shapes = [
    { size: 60, x: '10%', y: '15%', delay: 0 },
    { size: 40, x: '85%', y: '20%', delay: 0.3 },
    { size: 30, x: '75%', y: '70%', delay: 0.6 },
    { size: 50, x: '15%', y: '75%', delay: 0.2 },
  ];

  return (
    <HeroSection id="hero">
      {shapes.map((s, i) => (
        <FloatingShape
          key={i}
          style={{
            width: s.size,
            height: s.size,
            left: s.x,
            top: s.y,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            delay: s.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      <div className="Container">
        <HeroContent>
          <HeroLeft
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Greeting
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Hello, I'm
            </Greeting>

            <Name
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="highlight">Kishor TH</span>
            </Name>

            <Subtitle
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <TypeAnimation
                sequence={[
                  'Backend Developer',
                  3000,
                  'Node.js Specialist',
                  3000,
                  'Problem Solver',
                  3000,
                  'API Architect',
                  3000,
                  () => setShowScroll(true),
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
                cursor={true}
                className="typing"
              />
            </Subtitle>

            <Description
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              Dynamic Node.js developer with 3 years of experience building
              scalable backend systems, robust APIs, and cloud-native solutions
              on AWS and GCP. Currently building AI-driven platforms with LLM integration.
            </Description>

            <HeroButtons
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <PrimaryBtn
                href="https://github.com/kichukic"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiGithub /> View Work
              </PrimaryBtn>
              <SecondaryBtn
                href="https://www.linkedin.com/in/kishor-th-6a257a107/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiLinkedin /> LinkedIn
              </SecondaryBtn>
            </HeroButtons>
          </HeroLeft>

          <HeroRight
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <HeroImage
              src={BackendDevHero}
              alt="Backend Development Architecture"
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                y: {
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
            />
          </HeroRight>
        </HeroContent>
        <TerminalConsole />
      </div>

      {showScroll && (
        <ScrollIndicator
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span>Scroll</span>
          <ScrollDot
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <FiArrowDown size={14} />
        </ScrollIndicator>
      )}
    </HeroSection>
  );
}

export default Hero;
