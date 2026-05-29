import React from 'react';
import { motion } from 'framer-motion';
import { skillCategories } from '../../data/skills';
import SectionWrapper from '../shared/SectionWrapper';
import {
  SkillsGrid,
  CategoryCard,
  CategoryTitle,
  SkillRow,
  SkillHeader,
  SkillInfo,
  SkillIcon,
  SkillName,
  SkillLevel,
  ProgressTrack,
  ProgressFill,
} from './SkillsElements';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

function Skills() {
  return (
    <SectionWrapper id="skills" title="Skills & Proficiency">
      <SkillsGrid
        as={motion.div}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {skillCategories.map((cat) => (
          <CategoryCard key={cat.category} variants={cardVariants}>
            <CategoryTitle>{cat.category}</CategoryTitle>
            {cat.skills.map((skill) => (
              <SkillRow key={skill.name}>
                <SkillHeader>
                  <SkillInfo>
                    <SkillIcon src={skill.icon} alt={skill.name} />
                    <SkillName>{skill.name}</SkillName>
                  </SkillInfo>
                  <SkillLevel>{skill.level}%</SkillLevel>
                </SkillHeader>
                <ProgressTrack>
                  <ProgressFill
                    level={skill.level}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                  />
                </ProgressTrack>
              </SkillRow>
            ))}
          </CategoryCard>
        ))}
      </SkillsGrid>
    </SectionWrapper>
  );
}

export default Skills;
