import React from 'react';
import { useTextScramble } from '../../hooks/useTextScramble';

function ScrambleText({ text, speed = 25, delay = 0, className, style, ...props }) {
  const { displayText, scramble } = useTextScramble(text, speed, delay);

  return (
    <span 
      className={className} 
      onMouseEnter={scramble}
      style={{ cursor: 'default', ...style }}
      {...props}
    >
      {displayText}
    </span>
  );
}

export default ScrambleText;
