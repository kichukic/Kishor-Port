import { useState, useEffect, useCallback, useRef } from 'react';

const KONAMI_SEQUENCE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
];

const SWIPE_THRESHOLD = 30;
const SWIPE_MAP = {
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
};

function getSwipeDirection(dx, dy) {
  if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return null;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  }
  return dy > 0 ? 'down' : 'up';
}

export function useKonamiCode() {
  const [activated, setActivated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showBanner, setShowBanner] = useState(false);
  const [swipeDir, setSwipeDir] = useState(null);
  const touchStartRef = useRef(null);

  const advance = useCallback((keyCode) => {
    if (activated) return;

    setProgress((prev) => {
      if (KONAMI_SEQUENCE[prev] === keyCode) {
        const next = prev + 1;
        if (next === KONAMI_SEQUENCE.length) {
          setActivated(true);
          setShowBanner(true);
          setTimeout(() => setShowBanner(false), 4000);
        }
        return next;
      }
      return 0;
    });
  }, [activated]);

  const handleKeyDown = useCallback((e) => {
    advance(e.code);
  }, [advance]);

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const dir = getSwipeDirection(dx, dy);
    if (!dir) return;

    setSwipeDir(dir);
    setTimeout(() => setSwipeDir(null), 400);

    advance(SWIPE_MAP[dir]);
  }, [advance]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleKeyDown, handleTouchStart, handleTouchEnd]);

  return { activated, showBanner, progress, total: KONAMI_SEQUENCE.length, swipeDir };
}
