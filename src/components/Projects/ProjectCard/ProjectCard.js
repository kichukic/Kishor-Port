import React from 'react';
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

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

function ProjectCard() {
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
        >
          <CardLeft>
            <img src={project.img} alt={project.title} />
          </CardLeft>
          <CardRight>
            <ProjectTitle>{project.title}</ProjectTitle>
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
                  <FiGithub /> Code
                </Btn>
              )}
              {project.demo_url && (
                <Btn
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FiExternalLink /> Live Demo
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
