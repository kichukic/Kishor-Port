import { useState, useEffect, useCallback, useRef } from 'react';

const CYBER_CHARS = '01XY[]{}#$_-+/*%&?^@!';

export function useTextScramble(originalText, speed = 25, delay = 0) {
  const [displayText, setDisplayText] = useState(originalText);
  const intervalRef = useRef(null);
  const frameRef = useRef(0);

  const scramble = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    frameRef.current = 0;
    const originalLength = originalText.length;
    
    intervalRef.current = setInterval(() => {
      const scrambled = originalText
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' ';
          
          // Once frame progresses past index * 3, we lock the original letter in
          if (index < frameRef.current / 3) {
            return originalText[index];
          }
          
          // Randomly return a cyber character
          return CYBER_CHARS[Math.floor(Math.random() * CYBER_CHARS.length)];
        })
        .join('');
        
      setDisplayText(scrambled);
      
      if (frameRef.current >= originalLength * 3) {
        clearInterval(intervalRef.current);
        setDisplayText(originalText);
      }
      
      frameRef.current += 1;
    }, speed);
  }, [originalText, speed]);

  useEffect(() => {
    let timer;
    if (delay > 0) {
      timer = setTimeout(scramble, delay);
    } else {
      scramble();
    }
    
    return () => {
      if (timer) clearTimeout(timer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [originalText, scramble, delay]);

  return { displayText, scramble };
}
