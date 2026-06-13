import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSound } from '../../../hooks/useSound';
import { GameOverlay } from './styles';
import RetroSpaceGame from './RetroSpaceGame';

function EasterEggOverlay({ show, onClose }) {
  const { achievement } = useSound();
  React.useEffect(() => { if (show) achievement(); }, [show, achievement]);

  return (
    <AnimatePresence>
      {show && (
        <GameOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <RetroSpaceGame onClose={onClose} />
        </GameOverlay>
      )}
    </AnimatePresence>
  );
}

export default EasterEggOverlay;
