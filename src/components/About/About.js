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
            src="https://westus31-mediap.svc.ms/transform/thumbnail?provider=spo&farmid=193933&inputFormat=jpg&cs=MDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDQ4MTcxMGE0fFNQTw&docid=https%3A%2F%2Fmy.microsoftpersonalcontent.com%2F_api%2Fv2.0%2Fdrives%2Fb!m8img1Ftu0yAqIgrZByUoAejJR3Rtf1AkiDh2bh0UwAp3QKo0QBuSIzAa-W3Rl2B%2Fitems%2F017LRROJ3Z6XZOSGMS5VGK5ARQK34YKSW3%3Ftempauth%3Dv1e.eyJzaXRlaWQiOiI4M2E2Yzg5Yi02ZDUxLTRjYmItODBhOC04ODJiNjQxYzk0YTAiLCJhcHBpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDA0ODE3MTBhNCIsImF1ZCI6IjAwMDAwMDAzLTAwMDAtMGZmMS1jZTAwLTAwMDAwMDAwMDAwMC9teS5taWNyb3NvZnRwZXJzb25hbGNvbnRlbnQuY29tQDkxODgwNDBkLTZjNjctNGM1Yi1iMTEyLTM2YTMwNGI2NmRhZCIsImV4cCI6IjE3MzA2MzUyMDAifQ.syuXjGOza9zl-eSdX1IMlp1sFsF9X3w_m_corwOS3qmBf1x74UTtED8dPgXmDbbGs142PNl6q6i6WxuBcfEJzJz8OdcG7rXrzYKd2yaNleDGV6l6W30QfaaNfg7aPCWoqY54xwrUvvM7VbELDChQEDEzVw76k0uMPDQhccf3idvTEFxLNA0_owwXj6atXGwPxKCRv19j5K4RwQnpwZYInlOveiFyM4jaXczapjf_X6-8vcrGQbYzkJF1r102r-r-NLpgBSmcUij7OAYkBUOoMiSGrU0CPIx6gxmmF36mdSKtlibHv5Nbzt3iG9KiZ4_5KVRn44WLC7cgdAvqFlMtWJ8zPPGhWnPYxmPlRL_lAkRusvMcST1YqesIm27DdoSo.nWT6YjzcSZcHw83HaiClEpQmDXYOACx-5FkYfki14vE%26version%3DPublished&cb=63866174395&encodeFailures=1&width=236&height=236"
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
