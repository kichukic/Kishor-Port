import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const CertsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

export const CertCard = styled(motion.div)`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${({ theme }) => theme.neonSecondary};
    box-shadow: ${({ theme }) => theme.shadowSecondary};
    transform: translateY(-4px);
  }
`;

export const CertTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin-bottom: 0.5rem;
`;

export const CertIssuer = styled.p`
  font-size: 0.85rem;
  color: #ffffff;
  margin-bottom: 1rem;
  font-weight: 500;
`;

export const CertImage = styled.img`
  width: 100%;
  max-width: 250px;
  border-radius: 12px;
  margin: 0 auto 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

export const CertLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.2rem;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 8px;
  background: ${({ theme }) => theme.gradient};
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadowSecondary};
  }
`;
