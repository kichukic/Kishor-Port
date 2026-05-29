import React, { useEffect } from 'react';
import SectionWrapper from '../shared/SectionWrapper';
import {
  CertsGrid,
  CertCard,
  CertTitle,
  CertIssuer,
  CertImage,
  CertLink,
} from './certificationelements';
import './style.css';

function Certification() {
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://www.testdome.com/content/certificates/embed.css';
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.media = 'screen,print';
    document.head.appendChild(link);
  }, []);

  const certs = [
    {
      title: 'JavaScript & Node.js',
      issuer: 'TestDome',
      image: '',
      link: 'https://www.testdome.com/certificates/c5787b627ec24062819a4b56b15389c8',
      isEmbed: true,
    },
    {
      title: 'Node.js',
      issuer: 'Programming Hub',
      image: 'https://storage.googleapis.com/programminghub/certificate%2F1731939730616.jpg',
      link: 'https://storage.googleapis.com/programminghub/certificate%2F1731939730616.jpg',
      isEmbed: false,
    },
  ];

  return (
    <SectionWrapper id="certifications" title="Certifications">
      <CertsGrid>
        {certs.map((cert, index) => (
          <CertCard
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <CertTitle>{cert.title}</CertTitle>
            <CertIssuer>{cert.issuer}</CertIssuer>

            {cert.isEmbed ? (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
                <a
                  href={cert.link}
                  className="testdome-certificate-stamp silver large-certification"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="testdome-certificate-name">Kishor TH</span>
                  <span className="testdome-certificate-test-name">JavaScript and Node.js</span>
                  <span className="testdome-certificate-card-logo">TestDome<br />Certificate</span>
                </a>
              </div>
            ) : (
              <CertImage src={cert.image} alt={cert.title} />
            )}

            <CertLink href={cert.link} target="_blank" rel="noopener noreferrer">
              View Certificate
            </CertLink>
          </CertCard>
        ))}
      </CertsGrid>
    </SectionWrapper>
  );
}

export default Certification;
