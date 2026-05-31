import React, { useState, useRef } from 'react';
import { TypeAnimation } from 'react-type-animation';
import { FiArrowDown, FiGithub, FiLinkedin } from 'react-icons/fi';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
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
import ScrambleText from '../shared/ScrambleText';

function Hero() {
  const { theme } = useTheme();
  const [showScroll, setShowScroll] = useState(false);
  const sectionRef = useRef(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const leftX = useTransform(smoothX, [-0.5, 0.5], [20, -20]);
  const leftY = useTransform(smoothY, [-0.5, 0.5], [15, -15]);

  const rightX = useTransform(smoothX, [-0.5, 0.5], [-30, 30]);
  const rightY = useTransform(smoothY, [-0.5, 0.5], [-20, 20]);

  const termX = useTransform(smoothX, [-0.5, 0.5], [10, -10]);
  const termY = useTransform(smoothY, [-0.5, 0.5], [8, -8]);

  const handleMouseMove = (e) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <HeroSection
      id="hero"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >

      <div className="Container">
        <HeroContent>
          <HeroLeft
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ x: leftX, y: leftY }}
          >
            <Greeting
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ScrambleText text="Hello, I'm" speed={18} />
            </Greeting>

            <Name
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="highlight"><ScrambleText text="Kishor TH" speed={20} /></span>
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
            style={{ x: rightX, y: rightY }}
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
        <motion.div style={{ x: termX, y: termY }}>
          <TerminalConsole />
        </motion.div>
      </div>
    </HeroSection>
  );
}

export default Hero;
