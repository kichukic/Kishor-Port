import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const ContactGrid = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

export const ContactInfo = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
  max-width: 550px;
  width: 100%;
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
  justify-content: center;
  gap: 1rem;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.95rem;

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
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
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
