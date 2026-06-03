import React from 'react';
import { useTextScramble } from '../../hooks/useTextScramble';
import { useSound } from '../../hooks/useSound';

function ScrambleText({ text, speed = 25, delay = 0, className, style, ...props }) {
  const { displayText, scramble: triggerScramble } = useTextScramble(text, speed, delay);
  const { scramble } = useSound();

  const handleMouseEnter = () => {
    triggerScramble();
    scramble();
  };

  return (
    <span 
      className={className} 
      onMouseEnter={handleMouseEnter}
      style={{ cursor: 'default', ...style }}
      {...props}
    >
      {displayText}
    </span>
  );
}

export default ScrambleText;
