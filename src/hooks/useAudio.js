import { useContext, useCallback, useRef } from 'react';
import { AudioContext } from '../context/AudioContext';
import { playSound, resumeContext } from '../audio/soundEngine';

export function useAudio() {
  const { muted } = useContext(AudioContext);
  const lastPlayRef = useRef({});

  const play = useCallback((name, volume = 0.3) => {
    if (muted) return;
    resumeContext();
    playSound(name, volume);
  }, [muted]);

  const throttledPlay = useCallback((name, volume = 0.3, throttleMs = 150) => {
    if (muted) return;
    const now = Date.now();
    const last = lastPlayRef.current[name] || 0;
    if (now - last < throttleMs) return;
    lastPlayRef.current[name] = now;
    resumeContext();
    playSound(name, volume);
  }, [muted]);

  return { play, throttledPlay, muted };
}
