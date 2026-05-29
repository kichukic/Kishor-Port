import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 3rem;
  align-items: center;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

export const ContactLeft = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

export const ContactRight = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

export const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 1.5rem;
  width: 100%;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 2.5rem;

  @media (max-width: 768px) {
    align-items: center;
    text-align: center;
    padding: 1.5rem;
  }
`;

export const ConnectionVectorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  position: relative;
  overflow: hidden;
`;

export const ConnectionVectorGif = styled.img`
  width: 100%;
  max-width: 440px;
  height: auto;
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.12));
  animation: floatSocket 5s ease-in-out infinite;

  @keyframes floatSocket {
    0% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-10px) scale(1.02); }
    100% { transform: translateY(0px) scale(1); }
  }

  @media (max-width: 768px) {
    max-width: 320px;
  }
`;


export const InfoTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
`;

export const InfoText = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.textSecondary};
  line-height: 1.7;
`;

export const InfoItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.95rem;

  @media (max-width: 768px) {
    justify-content: center;
  }

  svg {
    font-size: 1.3rem;
    color: ${({ theme }) => theme.neon};
    flex-shrink: 0;
  }

  a {
    color: ${({ theme }) => theme.neon};
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export const SocialRow = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
  margin-top: 1rem;
  width: 100%;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

export const SocialLink = styled.a`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  color: ${({ theme }) => theme.textSecondary};
  font-size: 1.3rem;
  transition: all 0.2s;

  &:hover {
    color: ${({ theme }) => theme.neon};
    border-color: ${({ theme }) => theme.neon};
    box-shadow: ${({ theme }) => theme.shadow};
    transform: translateY(-3px);
  }
`;

export const Form = styled(motion.form)`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  border-radius: 16px;
  padding: 2rem;
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.85rem 1rem;
  font-size: 0.9rem;
  font-family: inherit;
  border-radius: 10px;
  background: ${({ theme }) => theme.inputBg};
  border: 1px solid ${({ theme }) => theme.inputBorder};
  color: ${({ theme }) => theme.text};
  outline: none;
  transition: all 0.2s;

  &::placeholder {
    color: ${({ theme }) => theme.textMuted};
  }

  &:focus {
    border-color: ${({ theme }) => theme.neon};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.inputFocus};
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 0.85rem 1rem;
  font-size: 0.9rem;
  font-family: inherit;
  border-radius: 10px;
  background: ${({ theme }) => theme.inputBg};
  border: 1px solid ${({ theme }) => theme.inputBorder};
  color: ${({ theme }) => theme.text};
  outline: none;
  transition: all 0.2s;
  resize: vertical;
  min-height: 120px;

  &::placeholder {
    color: ${({ theme }) => theme.textMuted};
  }

  &:focus {
    border-color: ${({ theme }) => theme.neon};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.inputFocus};
  }
`;

export const SubmitBtn = styled.button`
  padding: 0.85rem 2rem;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  border-radius: 10px;
  background: ${({ theme, disabled }) =>
    disabled ? theme.textMuted : theme.gradient};
  color: #fff;
  border: none;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadow};
  }
`;

export const StatusMsg = styled(motion.div)`
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 500;
  background: ${({ success, theme }) =>
    success ? 'rgba(0, 255, 100, 0.1)' : 'rgba(255, 50, 50, 0.1)'};
  color: ${({ success }) => (success ? '#00ff64' : '#ff3232')};
  border: 1px solid
    ${({ success }) => (success ? 'rgba(0, 255, 100, 0.2)' : 'rgba(255, 50, 50, 0.2)')};
`;
