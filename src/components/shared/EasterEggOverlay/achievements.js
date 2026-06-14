const STORAGE_KEY = 'retroSpaceAchievements';

export const ACHIEVEMENTS = [
  { id: 'first_blood',      name: 'First Blood',       desc: 'Kill your first enemy',          icon: '🎯' },
  { id: 'century',          name: 'Century',           desc: 'Kill 100 enemies in one run',    icon: '💯' },
  { id: 'combo_king',       name: 'Combo King',        desc: 'Reach a 5× combo',              icon: '🔥' },
  { id: 'untouchable',      name: 'Untouchable',       desc: 'Clear a level without damage',   icon: '🛡️' },
  { id: 'boss_slayer',      name: 'Boss Slayer',       desc: 'Defeat your first boss',         icon: '⚔️' },
  { id: 'speed_demon',      name: 'Speed Demon',       desc: 'Kill 10 enemies in 5 seconds',   icon: '⚡' },
  { id: 'survivor',         name: 'Survivor',          desc: 'Reach wave 10',                  icon: '🌊' },
  { id: 'marathon',         name: 'Marathon',          desc: 'Reach wave 25',                  icon: '🏃' },
  { id: 'ghost_protocol',   name: 'Ghost Protocol',    desc: 'Use Ghost powerup 5 times',      icon: '👻' },
  { id: 'perfect_boss',     name: 'Perfect Boss',      desc: 'Defeat a boss without taking damage', icon: '✨' },
  { id: 'no_hit_run',       name: 'No Hit Run',        desc: 'Complete level 5 without damage', icon: '💎' },
  { id: 'overdrive_master', name: 'Overdrive Master',  desc: 'Use Overdrive 10 times',         icon: '⚡' },
  { id: 'collector',        name: 'Collector',         desc: 'Collect 50 powerups',            icon: '📦' },
  { id: 'millionaire',      name: 'Millionaire',       desc: 'Score 100,000 points',           icon: '💰' },
  { id: 'miniboss_hunter',  name: 'Mini-Boss Hunter',  desc: 'Defeat 5 mini-bosses',           icon: '💀' },
  { id: 'bombardier',       name: 'Bombardier',        desc: 'Use Screen Bomb 10 times',       icon: '💣' },
  { id: 'endless',          name: 'Endless',           desc: 'Enter endless mode',              icon: '♾️' },
  { id: 'victory',          name: 'Victory',           desc: 'Beat the game',                   icon: '🏆' },
];

export function getUnlocked() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

export function unlock(id) {
  const unlocked = getUnlocked();
  if (!unlocked.includes(id)) {
    unlocked.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
    return true;
  }
  return false;
}

export function isUnlocked(id) {
  return getUnlocked().includes(id);
}
