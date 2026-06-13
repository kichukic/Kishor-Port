import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AchievementUnlockedBadge, BadgeDot } from './styles';

function AchievementBadgePersistent({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <AchievementUnlockedBadge
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <BadgeDot />
           RETRO_SPACE_UNLOCKED
        </AchievementUnlockedBadge>
      )}
    </AnimatePresence>
  );
}

export default AchievementBadgePersistent;
