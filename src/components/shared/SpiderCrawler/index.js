import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { createSpiderEngine } from './engine';
import { makePalette } from './util';

const STORAGE_KEY = 'spider-enabled';

const Canvas = styled.canvas`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 100001; /* above the boot screen (99999), so the spiders join in there too */
`;

// Same glass treatment as the audio toggle on the opposite corner.
const ToggleBtn = styled.button`
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 9991;
  height: 44px;
  padding: 0 0.9rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.glassBorder};
  background: ${({ theme }) => theme.glassBg};
  backdrop-filter: ${({ theme }) => theme.backdrop};
  box-shadow: ${({ theme }) => theme.glassShadow};
  color: ${({ theme, dim }) => (dim ? theme.textMuted : theme.text)};
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.7rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-3px);
    border-color: ${({ theme }) => theme.inputFocus};
    background: ${({ theme }) => theme.surfaceHover};
  }
`;

export default function SpiderCrawler({ paused = false, showToggle = true, pair = false }) {
  const theme = useTheme();
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const paletteRef = useRef(null);
  const [enabled, setEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) return saved === '1';
    } catch (e) { /* storage unavailable */ }
    return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  });

  // The engine reads the palette every frame, so theme changes restyle it live.
  const palette = useMemo(() => makePalette(theme), [theme]);
  useEffect(() => {
    paletteRef.current = palette;
  }, [palette]);

  useEffect(() => {
    const engine = createSpiderEngine(canvasRef.current, { getPalette: () => paletteRef.current });
    engineRef.current = engine;
    return () => engine.destroy();
  }, []);

  useEffect(() => {
    engineRef.current.setPair(pair);
  }, [pair]);

  useEffect(() => {
    engineRef.current.setActive(enabled && !paused);
    try { localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0'); } catch (e) { /* ignore */ }
  }, [enabled, paused]);

  return (
    <>
      <Canvas ref={canvasRef} />
      {!paused && showToggle && (
        <ToggleBtn dim={!enabled} onClick={() => setEnabled((v) => !v)}>
          {enabled ? '🕷 Hide Spider' : '🕷 Show Spider'}
        </ToggleBtn>
      )}
    </>
  );
}
