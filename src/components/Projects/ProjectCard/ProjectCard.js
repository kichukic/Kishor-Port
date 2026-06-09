import React, { useRef, useEffect, useCallback } from 'react';
import { FiGithub, FiExternalLink } from 'react-icons/fi';
import { projectsData } from '../../../data/projects';
import {
  Card,
  DustCanvas,
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
import { useSound } from '../../../hooks/useSound';

const PSIZE = 5;
const RADIUS = 55;
const STRENGTH = 1.8;
const RETURN_SPEED = 0.08;

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
  const canvasRefs = useRef([]);
  const rafRefs = useRef([]);
  const { hoverDeep, click } = useSound();

  useEffect(() => {
    const cleanups = [];

    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const canvas = canvasRefs.current[index];
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      let W, H, cols, rows, particles;
      let mouseX = -999, mouseY = -999, inside = false;

      function build() {
        W = card.offsetWidth;
        H = card.offsetHeight;
        canvas.width = W;
        canvas.height = H;
        cols = Math.ceil(W / PSIZE);
        rows = Math.ceil(H / PSIZE);
        particles = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const ox = c * PSIZE;
            const oy = r * PSIZE;
            const edge = ox < 2 || oy < 2 || ox > W - PSIZE - 2 || oy > H - PSIZE - 2;
            const alpha = edge ? 0.55 : (0.06 + Math.random() * 0.1);
            particles.push({
              ox, oy, x: ox, y: oy,
              vx: 0, vy: 0,
              color: `hsla(0,0%,95%,${alpha})`,
              size: PSIZE - 0.5,
            });
          }
        }
      }

      function loop() {
        ctx.clearRect(0, 0, W, H);
        if (!inside) {
          rafRefs.current[index] = requestAnimationFrame(loop);
          return;
        }

        for (const p of particles) {
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < RADIUS) {
            const force = (RADIUS - dist) / RADIUS;
            const angle = Math.atan2(dy, dx);
            const push = force * force * STRENGTH * (8 + Math.random() * 4);
            p.vx += Math.cos(angle) * push;
            p.vy += Math.sin(angle) * push;
          }

          p.vx += (p.ox - p.x) * RETURN_SPEED;
          p.vy += (p.oy - p.y) * RETURN_SPEED;
          p.vx *= 0.78;
          p.vy *= 0.78;
          p.x += p.vx;
          p.y += p.vy;

          const moved = Math.abs(p.x - p.ox) > 0.3 || Math.abs(p.y - p.oy) > 0.3;
          if (moved) {
            ctx.fillStyle = p.color;
            ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
          }
        }
        rafRefs.current[index] = requestAnimationFrame(loop);
      }

      function onEnter(e) {
        inside = true;
        const rect = card.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        if (!rafRefs.current[index]) rafRefs.current[index] = requestAnimationFrame(loop);
      }

      function onMove(e) {
        const rect = card.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
      }

      function onLeave() {
        inside = false;
        mouseX = -999;
        mouseY = -999;
      }

      build();
      rafRefs.current[index] = requestAnimationFrame(loop);

      const ro = new ResizeObserver(() => {
        build();
      });
      ro.observe(card);

      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);

      cleanups.push(() => {
        ro.disconnect();
        card.removeEventListener('mouseenter', onEnter);
        card.removeEventListener('mousemove', onMove);
        card.removeEventListener('mouseleave', onLeave);
        if (rafRefs.current[index]) cancelAnimationFrame(rafRefs.current[index]);
      });
    });

    return () => cleanups.forEach(fn => fn());
  }, []);

  const handleMouseMove = useCallback((index, e) => {
    const card = cardRefs.current[index];
    if (!card) return;
    hoverDeep();

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
                  onMouseEnter={hoverDeep}
                  onClick={click}
                >
                  <FiGithub /> <ScrambleText text="Code" speed={15} />
                </Btn>
              )}
              {project.demo_url && (
                <Btn
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={hoverDeep}
                  onClick={click}
                >
                  <FiExternalLink /> <ScrambleText text="Live Demo" speed={15} />
                </Btn>
              )}
            </BtnGroup>
          </CardRight>
          <DustCanvas
            ref={(el) => (canvasRefs.current[index] = el)}
          />
        </Card>
      ))}
    </>
  );
}

export default ProjectCard;
