import React, { useRef, useCallback } from 'react';
import { FiGithub, FiExternalLink } from 'react-icons/fi';
import { projectsData } from '../../../data/projects';
import {
  Card,
  CardLeft,
  CardRight,
  ProjectTitle,
  ProjectDesc,
  TechStack,
  TechTag,
  BtnGroup,
  Btn,
} from './ProjectCardElements';
import ScrambleText from '../../shared/ScrambleText';

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

function ProjectCard() {
  const cardRefs = useRef([]);

  const handleMouseMove = useCallback((index, e) => {
    const card = cardRefs.current[index];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  }, []);

  const handleMouseLeave = useCallback((index) => {
    const card = cardRefs.current[index];
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  }, []);

  return (
    <>
      {projectsData.map((project, index) => (
        <Card
          key={project.id}
          custom={index}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={cardVariants}
          ref={(el) => (cardRefs.current[index] = el)}
          onMouseMove={(e) => handleMouseMove(index, e)}
          onMouseLeave={() => handleMouseLeave(index)}
        >
          <CardLeft>
            <img src={project.img} alt={project.title} />
          </CardLeft>
          <CardRight>
            <ProjectTitle>
              <ScrambleText text={project.title} speed={22} />
            </ProjectTitle>
            <ProjectDesc>{project.description}</ProjectDesc>
            <TechStack>
              {project.tech_stack.map((tech) => (
                <TechTag key={tech}>{tech}</TechTag>
              ))}
            </TechStack>
            <BtnGroup>
              {project.github_url && (
                <Btn
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  primary
                >
                  <FiGithub /> <ScrambleText text="Code" speed={15} />
                </Btn>
              )}
              {project.demo_url && (
                <Btn
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FiExternalLink /> <ScrambleText text="Live Demo" speed={15} />
                </Btn>
              )}
            </BtnGroup>
          </CardRight>
        </Card>
      ))}
    </>
  );
}

export default ProjectCard;
