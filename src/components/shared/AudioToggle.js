import React, { useContext } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { AudioContext } from '../../context/AudioContext';

const ToggleBtn = styled(motion.button)`
  position: fixed;
  bottom: 20px;
  right: 74px;
  z-index: 100000;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  color: ${({ muted }) => (muted ? 'rgba(255,255,255,0.3)' : '#ffffff')};
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.06);
  }
`;

const SoundBars = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
`;

const Bar = styled.span`
  width: 3px;
  border-radius: 1px;
  background: currentColor;
  transition: height 0.2s ease;
  height: ${({ active, h }) => (active ? h : '3px')};
`;

function AudioToggle() {
  const { muted, toggleMute } = useContext(AudioContext);

  return (
    <ToggleBtn
      onClick={toggleMute}
      muted={muted}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.4 }}
      title={muted ? 'Unmute sounds' : 'Mute sounds'}
      aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
    >
      <SoundBars>
        <Bar active={!muted} h="6px" />
        <Bar active={!muted} h="12px" />
        <Bar active={!muted} h="16px" />
        <Bar active={!muted} h="10px" />
      </SoundBars>
    </ToggleBtn>
  );
}

export default AudioToggle;
