import React from 'react';
import SectionWrapper from '../shared/SectionWrapper';
import {
  AboutContent,
  AboutLeft,
  ProfileImage,
  AboutRight,
  Bio,
  StatsRow,
  StatCard,
  StatNumber,
  StatLabel,
} from './AboutElements';
import Abouts from '../../images/about_me_vector.gif';

function About() {
  return (
    <SectionWrapper id="about" title="About Me">
      <AboutContent>
        <AboutLeft
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <ProfileImage
            src={Abouts}
            alt="Kishor TH"
            animate={{
              y: [0, -12, 0],
            }}
            transition={{
              y: {
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
            whileHover={{ scale: 1.05 }}
          />
        </AboutLeft>

        <AboutRight
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Bio>
            Dynamic <strong>Node.js developer</strong> with 3 years of experience in
            building scalable, efficient backend solutions. Expertise in{' '}
            <strong>Node.js</strong>, <strong>Express.js</strong>,{' '}
            <strong>MongoDB</strong>, and <strong>MySQL</strong>, along with cloud
            proficiency in <strong>AWS</strong> and <strong>GCP</strong>.
          </Bio>
          <Bio>
            Currently leading backend development for <strong>Zolio</strong>, an AI-driven
            interview platform at Tamcherry Technologies — integrating LLM APIs
            (OpenAI/Gemini), managing AWS infrastructure, and implementing Redis
            caching for low-latency performance. Previously built{' '}
            <strong>Envitus</strong>, a scalable IoT air quality monitoring suite,
            with full CI/CD pipelines and cloud deployment.
          </Bio>
          <Bio>
            Skilled in Linux environments with strong problem-solving abilities
            and a passion for continuous learning. Proficient in{' '}
            <strong>English</strong>, <strong>Malayalam</strong>, and{' '}
            <strong>Hindi</strong>.
          </Bio>

          <StatsRow>
            <StatCard
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <StatNumber>3+</StatNumber>
              <StatLabel>Years Experience</StatLabel>
            </StatCard>
            <StatCard
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <StatNumber>10+</StatNumber>
              <StatLabel>Projects</StatLabel>
            </StatCard>
            <StatCard
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <StatNumber>15+</StatNumber>
              <StatLabel>Technologies</StatLabel>
            </StatCard>
          </StatsRow>
        </AboutRight>
      </AboutContent>
    </SectionWrapper>
  );
}

export default About;
