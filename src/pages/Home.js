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

function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <>
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
