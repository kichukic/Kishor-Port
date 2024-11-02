import React from "react";
import { stackList } from "../../data/ProjectData";
import {
  Image,
  Technologies,
  Tech,
  TechImg,
  TechName,
  ContactWrapper,
} from "./AboutElements";
import ScrollAnimation from "react-animate-on-scroll";
function About() {
  return (
    <ContactWrapper id="about">
      <div className="Container">
        <div className="SectionTitle">About Me</div>
        <div className="BigCard">
        <ScrollAnimation animateIn="fadeInLeft">
          <Image
            src="/man-svgrepo-com.svg"
            alt="man-svgrepo"
          />
        </ScrollAnimation>
          <div className="AboutBio">
            <ScrollAnimation animateIn="fadeInLeft">
            Hello! My name is <strong>Kishor TH</strong>. With over 3 years of experience as a Node.js developer, I specialize in building scalable and efficient backend systems. My expertise lies in crafting robust APIs with Node.js and Express, alongside solid database management skills with MongoDB and MySQL. From designing architecture to optimizing performance, I’m dedicated to delivering reliable solutions that support high-traffic applications.
            </ScrollAnimation>

            <br /><br />
            
            <ScrollAnimation animateIn="fadeInLeft">
            I have hands-on experience with cloud deployment on both AWS and GCP, ensuring seamless and secure deployments that meet scalability demands. Working in Linux environments has further honed my technical skills, and I prioritize automation and CI/CD practices, leveraging tools like GitHub Actions to streamline development and deployment processes.
                       </ScrollAnimation>

            <br /><br />

            <ScrollAnimation animateIn="fadeInLeft">
            Beyond technical skills, I’m a continuous learner with a passion for problem-solving and innovation. I thrive on challenges that push me to grow and keep up with the latest in backend technologies. Whether working independently or within a collaborative team, I’m committed to creating impactful solutions that meet user and business needs effectively.
                           <div className="tagline2">
                I have become confident using the following technologies:
              </div>
            </ScrollAnimation>
            

            <Technologies>
              {stackList.map((stack, index) => (
                <ScrollAnimation animateIn="fadeInLeft" key={index}>
                  <Tech key={index} className="tech">
                    <TechImg src={stack.img} alt={stack.name} />
                    <TechName>{stack.name}</TechName>
                  </Tech>
                </ScrollAnimation>
              ))}
            </Technologies>
          </div>

        </div>
      </div>
    </ContactWrapper>
  );
}

export default About;
