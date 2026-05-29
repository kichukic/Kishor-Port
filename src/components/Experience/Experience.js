import React from 'react';
import { experienceData } from '../../data/experience';
import SectionWrapper from '../shared/SectionWrapper';
import {
  TimelineWrapper,
  TimelineItem,
  Dot,
  Card,
  Role,
  Company,
  Period,
  Description,
  TechTags,
  TechTag,
} from './ExperienceElements';

function Experience() {
  return (
    <SectionWrapper id="experience" title="Experience">
      <TimelineWrapper>
        {experienceData.map((exp, index) => {
          const side = index % 2 === 0 ? 'left' : 'right';
          return (
            <TimelineItem
              key={exp.id}
              side={side}
              initial={{ opacity: 0, x: side === 'left' ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Dot side={side} />
              <Card>
                <Role>{exp.role}</Role>
                <Company>{exp.company}</Company>
                <Period>{exp.period}</Period>
                <Description>{exp.description}</Description>
                <TechTags>
                  {exp.tech.map((t) => (
                    <TechTag key={t}>{t}</TechTag>
                  ))}
                </TechTags>
              </Card>
            </TimelineItem>
          );
        })}
      </TimelineWrapper>
    </SectionWrapper>
  );
}

export default Experience;
