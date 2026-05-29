import React, { useState, useEffect } from 'react';
import { experienceData } from '../../data/experience';
import SectionWrapper from '../shared/SectionWrapper';
import {
  ExperienceGrid,
  SidebarContainer,
  SidebarTitle,
  SidebarGif,
  LiveSyncCounter,
  SyncLabel,
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

import DbStackGif from '../../images/db_stack_tall.gif';

function Experience() {
  const [blocks, setBlocks] = useState(1480402);

  useEffect(() => {
    const timer = setInterval(() => {
      setBlocks(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <SectionWrapper id="experience" title="Experience">
      <ExperienceGrid>
        <SidebarContainer
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SidebarTitle>Database Replication Sync</SidebarTitle>
          <SidebarGif src={DbStackGif} alt="Database Replication Cluster" />
          <LiveSyncCounter>
            {blocks.toLocaleString()}
          </LiveSyncCounter>
          <SyncLabel>Blocks Synchronized</SyncLabel>
        </SidebarContainer>

        <TimelineWrapper>
          {experienceData.map((exp, index) => {
            return (
              <TimelineItem
                key={exp.id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Dot />
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
      </ExperienceGrid>
    </SectionWrapper>
  );
}

export default Experience;

