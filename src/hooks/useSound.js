import { useCallback } from 'react';
import { useAudio } from './useAudio';

export function useSound() {
  const { play, throttledPlay } = useAudio();

  const click = useCallback(() => play('click', 0.3), [play]);
  const hover = useCallback(() => throttledPlay('hover', 0.15, 200), [throttledPlay]);
  const hoverDeep = useCallback(() => throttledPlay('hoverDeep', 0.2, 250), [throttledPlay]);
  const toggleOpen = useCallback(() => play('toggle', 0.3), [play]);
  const toggleClose = useCallback(() => play('toggleClose', 0.3), [play]);
  const copy = useCallback(() => play('copy', 0.35), [play]);
  const scrollUp = useCallback(() => play('scrollTop', 0.3), [play]);
  const scramble = useCallback(() => throttledPlay('scramble', 0.08, 100), [throttledPlay]);
  const sectionEnter = useCallback(() => play('sectionEnter', 0.25), [play]);
  const cardReveal = useCallback(() => play('cardReveal', 0.2), [play]);
  const progressFill = useCallback(() => play('progressFill', 0.12), [play]);
  const skillPing = useCallback(() => throttledPlay('skillNodePing', 0.15, 300), [throttledPlay]);
  const skillClick = useCallback(() => play('skillNodeClick', 0.25), [play]);
  const nodeFly = useCallback(() => play('nodeFly', 0.2), [play]);
  const nodeArrive = useCallback(() => play('nodeArrive', 0.1), [play]);
  const timelinePulse = useCallback(() => play('timelinePulse', 0.15), [play]);
  const databaseSync = useCallback(() => throttledPlay('databaseSync', 0.05, 200), [throttledPlay]);
  const terminalType = useCallback(() => throttledPlay('terminalType', 0.06, 50), [throttledPlay]);
  const terminalDone = useCallback(() => play('terminalDone', 0.12), [play]);
  const bootPhase = useCallback(() => play('bootPhase', 0.25), [play]);
  const bootComplete = useCallback(() => play('bootComplete', 0.35), [play]);
  const achievement = useCallback(() => play('achievement', 0.4), [play]);
  const konamiKey = useCallback(() => play('konamiKey', 0.15), [play]);
  const konamiFail = useCallback(() => play('konamiFail', 0.1), [play]);
  const contactSend = useCallback(() => play('contactSend', 0.25), [play]);
  const socialHover = useCallback(() => throttledPlay('socialHover', 0.12, 200), [throttledPlay]);
  const parallaxSwoosh = useCallback(() => throttledPlay('parallaxSwoosh', 0.05, 200), [throttledPlay]);

  return {
    click, hover, hoverDeep, toggleOpen, toggleClose, copy, scrollUp,
    scramble, sectionEnter, cardReveal, progressFill,
    skillPing, skillClick, nodeFly, nodeArrive,
    timelinePulse, databaseSync,
    terminalType, terminalDone,
    bootPhase, bootComplete, achievement,
    konamiKey, konamiFail,
    contactSend, socialHover, parallaxSwoosh,
  };
}
