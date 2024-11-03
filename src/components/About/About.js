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
            src="https://westus31-mediap.svc.ms/transform/thumbnail?provider=spo&farmid=193933&inputFormat=png&cs=MDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDQ4MTcxMGE0fFNQTw&docid=https%3A%2F%2Fmy.microsoftpersonalcontent.com%2F_api%2Fv2.0%2Fdrives%2Fb!m8img1Ftu0yAqIgrZByUoAejJR3Rtf1AkiDh2bh0UwAp3QKo0QBuSIzAa-W3Rl2B%2Fitems%2F017LRROJ2OYSHRQZGJHFD2ON7M2B2SWPDL%3Ftempauth%3Dv1e.eyJzaXRlaWQiOiI4M2E2Yzg5Yi02ZDUxLTRjYmItODBhOC04ODJiNjQxYzk0YTAiLCJhcHBpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDA0ODE3MTBhNCIsImF1ZCI6IjAwMDAwMDAzLTAwMDAtMGZmMS1jZTAwLTAwMDAwMDAwMDAwMC9teS5taWNyb3NvZnRwZXJzb25hbGNvbnRlbnQuY29tQDkxODgwNDBkLTZjNjctNGM1Yi1iMTEyLTM2YTMwNGI2NmRhZCIsImV4cCI6IjE3MzA2MzUyMDAifQ.2x7NSQovWucMUHCSJCmtJlRySAr8FGR4DDpWqoH9g7svU7mRPKXDgNeuUXdghnDd0hFXQNuICVQEbC2Ev2PdEgxEIulXG7p4ovdWVD5YrXx7tYDh4X1p5Wff22DoEQhz1LunKmttjtJwwb1ravtHftMLUsoxCeZDsmaOC5Fs-znWwkxXA1AtYdvVlmTNv0akHB_UI12WMktoTJBr8-kMMExqFpWmNu63AD74x6dAYwRFMj_-wI7yYxUjy3ZWxQlhT9bTKziXO7ylNysSI9K4LZlsnXrEK8UQGHB3kmB2rFNKsY4OeZdd4PyxTHCkpbmzlHCzlVjk9jzZr5FgoT0mIgqMn5FQx2gcfbhq9wlNdFkm8q5kQgKCVZ6MQxmrz9JT.P1IfBEGY8kAriiWrltrbQXciE07xxYQakxFsNgim0J4%26version%3DPublished&cb=63866215074&encodeFailures=1&width=1278&height=945"
            alt="man-svgrepo"
          />
        </ScrollAnimation>
          <div className="AboutBio">
            <ScrollAnimation animateIn="slideInRight">
            Hello! My name is <strong>Kishor TH</strong>. With over 3 years of experience as a Node.js developer, I specialize in building scalable and efficient backend systems. My expertise lies in crafting robust APIs with Node.js and Express, alongside solid database management skills with MongoDB and MySQL. From designing architecture to optimizing performance, I’m dedicated to delivering reliable solutions that support high-traffic applications.
            </ScrollAnimation>

            <br /><br />
            
            <ScrollAnimation animateIn="fadeInLeft">
            I have hands-on experience with cloud deployment on both AWS and GCP, ensuring seamless and secure deployments that meet scalability demands. Working in Linux environments has further honed my technical skills, and I prioritize automation and CI/CD practices, leveraging tools like GitHub Actions to streamline development and deployment processes.
                       </ScrollAnimation>

            <br /><br />

            <ScrollAnimation animateIn="slideInRight">
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
