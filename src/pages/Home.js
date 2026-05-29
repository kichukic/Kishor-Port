import React, { useState } from "react";
import Hero from "../components/Hero/Hero";
import Projects from "../components/Projects/Projects";
import SystemBanner from "../components/shared/SystemBanner";
import Experience from "../components/Experience/Experience";
import Skills from "../components/Skills/Skills";
import About from "../components/About/About";
import Certification from "../components/certifications/certifications";
import Contact from "../components/Contact/Contact";
import Footer from "../components/Footer/Footer";
import FixSocialIcon from "../components/SocialIcon/FixSocialIcon";
import ScrollToTop from "../components/SocialIcon/ScrollToTop";
import Header from "../components/Header/Header";
import Dropdown from "../components/Dropdown/Dropdown";
import BinaryPortal from "../components/Hero/BinaryPortal";

function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  const shapes = [
    // Left margin stream columns
    { size: 280, x: '-6%', top: '4%', delay: 0.0, duration: 10 },
    { size: 230, x: '4%', top: '38%', delay: 0.5, duration: 13 },
    { size: 310, x: '-4%', top: '68%', delay: 0.25, duration: 11 },

    // Right margin stream columns
    { size: 260, x: '82%', top: '6%', delay: 0.35, duration: 12 },
    { size: 320, x: '75%', top: '35%', delay: 0.75, duration: 14 },
    { size: 270, x: '85%', top: '70%', delay: 0.15, duration: 9 },
  ];

  return (
    <>
      {shapes.map((s, i) => (
        <BinaryPortal
          key={i}
          size={s.size}
          x={s.x}
          top={s.top}
          delay={s.delay}
          duration={s.duration}
        />
      ))}
      <Header toggle={toggle} />
      <Dropdown isOpen={isOpen} toggle={toggle} />
      <Hero />
      <Projects />
      <SystemBanner />
      <Experience />
      <Skills />
      <About />
      <Certification />
      <Contact />
      <FixSocialIcon />
      <ScrollToTop />
      <Footer />
    </>
  );
}

export default Home;
