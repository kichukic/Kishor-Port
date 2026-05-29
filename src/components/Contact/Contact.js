import React, { useState } from 'react';
import { FiMail, FiMapPin, FiGithub, FiLinkedin } from 'react-icons/fi';
import { MdContentCopy } from 'react-icons/md';
import { IconButton, Tooltip, Zoom } from '@mui/material';
import SectionWrapper from '../shared/SectionWrapper';
import {
  ContactGrid,
  ContactLeft,
  ContactRight,
  ContactInfo,
  InfoTitle,
  InfoText,
  InfoItem,
  SocialRow,
  SocialLink,
  ConnectionVectorContainer,
  ConnectionVectorGif,
} from './ContactElements';

import ContactConnectionGif from '../../images/contact_connection_vector.gif';

function Contact() {
  const [showTooltip, setShowTooltip] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText('kishor.th@hotmail.com');
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 700);
  };

  return (
    <SectionWrapper id="contact" title="Get In Touch">
      <ContactGrid>
        <ContactLeft
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <ContactInfo>
            <InfoTitle>Let's Establish a Connection</InfoTitle>
            <InfoText>
              I'm always open to discussing new projects, backend systems, creative ideas, or
              opportunities to be part of your vision. Feel free to reach out via socket handshake!
            </InfoText>

            <InfoItem>
              <FiMail />
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                kishor.th@hotmail.com
                <Tooltip
                  PopperProps={{ disablePortal: true }}
                  open={showTooltip}
                  title="Copied!"
                  TransitionComponent={Zoom}
                  disableFocusListener
                  disableHoverListener
                  disableTouchListener
                  placement="top"
                >
                  <IconButton onClick={copyEmail} size="small" sx={{ color: 'inherit' }}>
                    <MdContentCopy size={16} />
                  </IconButton>
                </Tooltip>
              </span>
            </InfoItem>

            <InfoItem>
              <FiMapPin />
              <span>Remote / Worldwide</span>
            </InfoItem>

            <SocialRow>
              <SocialLink
                href="https://github.com/kichukic"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <FiGithub />
              </SocialLink>
              <SocialLink
                href="https://www.linkedin.com/in/kishor-th-6a257a107/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <FiLinkedin />
              </SocialLink>
            </SocialRow>
          </ContactInfo>
        </ContactLeft>
        <ContactRight
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <ConnectionVectorContainer>
            <ConnectionVectorGif src={ContactConnectionGif} alt="API Socket Connection Tunnel" />
          </ConnectionVectorContainer>
        </ContactRight>
      </ContactGrid>
    </SectionWrapper>
  );
}

export default Contact;

