import React, { useEffect } from "react";
import { stackList } from "../../data/ProjectData";
import "./style.css"




import {
  Image,
  Technologies,
  Tech,
  TechImg,
  TechName,
  ContactWrapper,
} from "./certificationelements";
import ScrollAnimation from "react-animate-on-scroll";
import Abouts from "../../images/About.png";

function Certification() {
  useEffect(() => {
    // Dynamically add the stylesheet for the TestDome certificate
    const stylesheet = "https://www.testdome.com/content/certificates/embed.css";
    const link = document.createElement("link");
    link.href = stylesheet;
    link.type = "text/css";
    link.rel = "stylesheet";
    link.media = "screen,print";
    document.getElementsByTagName("head")[0].appendChild(link);
  }, []);

  return (
    <ContactWrapper id="about">
      <div className="Container">
        <div className="SectionTitle">Certifications</div>
        <div className="BigCard">
          <ScrollAnimation animateIn="fadeInLeft">
            <Image src={Abouts} />
          </ScrollAnimation>

          <div className="AboutBio">
            <ScrollAnimation animateIn="slideInRight">
              <div className="tagline2">
             <div className="title">
             JavaScript and Node.js Certification – TestDome
             </div>

Demonstrates proficiency in JavaScript and Node.js concepts, verified through practical testing by TestDome.
              </div>
            </ScrollAnimation>
          </div>
<div className="test">
      {/* TestDome Certificate Embed */}
     <ScrollAnimation animateIn="slideInLeft">

     <a
            href="https://www.testdome.com/certificates/c5787b627ec24062819a4b56b15389c8"
            className="testdome-certificate-stamp silver large-certification"
          >
            <span className="testdome-certificate-name">Kishor TH</span>
            <span className="testdome-certificate-test-name">JavaScript and Node.js</span>
            <span className="testdome-certificate-card-logo">
              TestDome<br />Certificate
            </span>
          </a>   
     </ScrollAnimation>

         <ScrollAnimation animateIn="slideInRight">
         <a
            href="https://storage.googleapis.com/programminghub/certificate%2F1731939730616.jpg"
            className="testdome-certificate-stamp silver large-certification"
          >
            <span className="testdome-certificate-name">Kishor TH</span>
            <span className="testdome-certificate-test-name"> Node.js</span>
            <img
      src="https://storage.googleapis.com/programminghub/certificate%2F1731939730616.jpg"
      alt="JavaScript and Node.js Certification"
      className="certificate-image"
    />
            <span className="testdome-certificate-card-logo">
              Programming Hub<br />Certificate
            </span>
          </a>   
         </ScrollAnimation>
</div>
        </div>
      </div>
    </ContactWrapper>
  );
}

export default Certification;
