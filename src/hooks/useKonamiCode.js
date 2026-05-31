import { useState, useEffect, useCallback } from 'react';

const KONAMI_SEQUENCE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA',
];

export function useKonamiCode() {
  const [activated, setActivated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showBanner, setShowBanner] = useState(false);

  const handleKeyDown = useCallback((e) => {
    if (activated) return;

    const expectedKey = KONAMI_SEQUENCE[progress];

    if (e.code === expectedKey) {
      const nextProgress = progress + 1;
      setProgress(nextProgress);

      if (nextProgress === KONAMI_SEQUENCE.length) {
        setActivated(true);
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 4000);
      }
    } else {
      setProgress(0);
    }
  }, [progress, activated]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { activated, showBanner, progress, total: KONAMI_SEQUENCE.length };
}
