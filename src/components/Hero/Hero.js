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
} from './HeroElements';
import { useTheme } from '../../hooks/useTheme';
import BackendDevHero from '../../images/backend_dev_hero.gif';
import TerminalConsole from './TerminalConsole';

function Hero() {
  const { theme } = useTheme();
  const [showScroll, setShowScroll] = useState(false);

  return (
    <HeroSection id="hero">

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
              Dynamic Node.js developer with 4 years of experience building
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
    </HeroSection>
  );
}

export default Hero;
