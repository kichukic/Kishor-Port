import React, { createContext, useState, useCallback, useEffect } from 'react';

export const AudioContext = createContext();

export function AudioProvider({ children }) {
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem('audio-muted') === 'true';
    } catch {
      return false;
    }
  });

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const next = !prev;
      try {
        localStorage.setItem('audio-muted', String(next));
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('audio-muted', String(muted));
    } catch {}
  }, [muted]);

  return (
    <AudioContext.Provider value={{ muted, toggleMute }}>
      {children}
    </AudioContext.Provider>
  );
}
