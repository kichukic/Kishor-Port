import React from "react";
import Hero from "../components/Hero/Hero";
import Projects from "../components/Projects/Projects";
import About from "../components/About/About";
import Contact from "../components/Contact/Contact";
import Footer from "../components/Footer/Footer";
import FixSocialIcon from "../components/SocialIcon/FixSocialIcon";
import ScrollToTop from "../components/SocialIcon/ScrollToTop";
import Certification from "../components/certifications/certifications";
function Home() {
  return (
    <>
      <Hero />
      <Projects />
      <About />
      <Certification/>
      <Contact />
      <FixSocialIcon />
      <Footer />
      <ScrollToTop />
    
    </>
  );
}

export default Home;
