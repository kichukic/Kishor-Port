import React, { useState } from "react";
import Dropdown from "../Dropdown/Dropdown";
import Header from "../Header/Header";
import {
  HeroContainer,
  HeroWrapper,
  HeroLeft,
  HeroRight,
  Image,
  ScrollDown,
  ScrollLink,
} from "./HeroElements";
import { TypeAnimation } from 'react-type-animation';
import ScrollAnimation from "react-animate-on-scroll";

function Hero() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const toggle = () => {
    setIsOpen(!isOpen);
  };
  return (
    <main>
      <Dropdown isOpen={isOpen} toggle={toggle} />
      <Header toggle={toggle} />
      <HeroContainer>
        <HeroWrapper>
          <HeroLeft>
            <ScrollAnimation animateIn="fadeIn" >
              <TypeAnimation
                cursor={true}
                sequence={[
                  'Hi, I\'m Kishor.',
                  () => setShowSubtitle(true)
                ]}
                speed={{ type: "keyStrokeDelayInMs", value: 150 }}
                wrapper="h1"
                repeat={0}
              />
              {showSubtitle &&
                <TypeAnimation
                  cursor={true}
                  sequence={[
                    500,
                    'A Backend Developer.',
                    8000,
                    700,
                    'A problem solver.',
                    700,
                    'An innovative thinker.',
                    700,
                    'A....',
                    700,
                    'A.... cool guy?',
                    700,
                    "Ok...",
                    700,
                    "Ok...  I'm running out of ideas...",
                    700,
                    "Uhh...",
                    700,
                    "Uhh... you can scroll down to see my projects now...",
                    300,
                    () => setShowScrollDown(true),
                    700,
                    "Seriously, my projects are really cool, go check them out!",
                    700,
                    "You're uh...",
                    700,
                    "You're uh... still here?",
                    700,
                    "Ok, this has been fun, but I'm gonna restart the loop now...",
                    1000,
                    "See ya! :)",
                    500,
                  ]}
                  speed={50}
                  deletionSpeed={65}
                  wrapper="h5"
                  repeat={Infinity}
                />
              }
            </ScrollAnimation>

          </HeroLeft>
          <HeroRight>
            <ScrollAnimation animateIn="fadeIn">
              <Image
                src="https://westus31-mediap.svc.ms/transform/thumbnail?provider=spo&farmid=193933&inputFormat=png&cs=MDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDQ4MTcxMGE0fFNQTw&docid=https%3A%2F%2Fmy.microsoftpersonalcontent.com%2F_api%2Fv2.0%2Fdrives%2Fb!m8img1Ftu0yAqIgrZByUoAejJR3Rtf1AkiDh2bh0UwAp3QKo0QBuSIzAa-W3Rl2B%2Fitems%2F017LRROJ2OYSHRQZGJHFD2ON7M2B2SWPDL%3Ftempauth%3Dv1e.eyJzaXRlaWQiOiI4M2E2Yzg5Yi02ZDUxLTRjYmItODBhOC04ODJiNjQxYzk0YTAiLCJhcHBpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDA0ODE3MTBhNCIsImF1ZCI6IjAwMDAwMDAzLTAwMDAtMGZmMS1jZTAwLTAwMDAwMDAwMDAwMC9teS5taWNyb3NvZnRwZXJzb25hbGNvbnRlbnQuY29tQDkxODgwNDBkLTZjNjctNGM1Yi1iMTEyLTM2YTMwNGI2NmRhZCIsImV4cCI6IjE3MzA2MzUyMDAifQ.2x7NSQovWucMUHCSJCmtJlRySAr8FGR4DDpWqoH9g7svU7mRPKXDgNeuUXdghnDd0hFXQNuICVQEbC2Ev2PdEgxEIulXG7p4ovdWVD5YrXx7tYDh4X1p5Wff22DoEQhz1LunKmttjtJwwb1ravtHftMLUsoxCeZDsmaOC5Fs-znWwkxXA1AtYdvVlmTNv0akHB_UI12WMktoTJBr8-kMMExqFpWmNu63AD74x6dAYwRFMj_-wI7yYxUjy3ZWxQlhT9bTKziXO7ylNysSI9K4LZlsnXrEK8UQGHB3kmB2rFNKsY4OeZdd4PyxTHCkpbmzlHCzlVjk9jzZr5FgoT0mIgqMn5FQx2gcfbhq9wlNdFkm8q5kQgKCVZ6MQxmrz9JT.P1IfBEGY8kAriiWrltrbQXciE07xxYQakxFsNgim0J4%26version%3DPublished&cb=63866215074&encodeFailures=1&width=1278&height=945"
                alt="man-svgrepo"
              />
            </ScrollAnimation>
          </HeroRight>
        </HeroWrapper>
        {showScrollDown &&<ScrollAnimation animateIn="flipInX" offset={0}>
        <ScrollDown to="projects" id="scrollDown">
          <ScrollLink>
            Scroll down
            <img
              src="/scroll-down.svg"
              alt="scroll-down"
            />
          </ScrollLink>
        </ScrollDown>
        </ScrollAnimation>}
      </HeroContainer>
    </main>
  );
}

export default Hero;
