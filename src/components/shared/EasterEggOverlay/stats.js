const STORAGE_KEY = 'retroSpaceStats';
const RUN_KEY = 'retroSpaceRunStats';

export function createRunStats() {
  return {
    kills: 0,
    bossesKilled: 0,
    miniBossesKilled: 0,
    shotsFired: 0,
    shotsHit: 0,
    highestCombo: 0,
    timePlayed: 0,
    damageTaken: 0,
    powerUpsCollected: 0,
    bombsUsed: 0,
    slowsUsed: 0,
    overdrivesUsed: 0,
    wavesCleared: 0,
    deaths: 0,
  };
}

export function saveRunStats(stats) {
  try {
    const best = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const keys = ['kills','bossesKilled','miniBossesKilled','highestCombo','powerUpsCollected','bombsUsed','slowsUsed','overdrivesUsed','wavesCleared'];
    for (const k of keys) {
      if (!best[k] || stats[k] > best[k]) best[k] = stats[k];
    }
    if (!best.highScore || stats.highScore > best.highScore) best.highScore = stats.highScore;
    best.totalKills = (best.totalKills || 0) + stats.kills;
    best.totalDeaths = (best.totalDeaths || 0) + stats.deaths;
    best.totalGames = (best.totalGames || 0) + 1;
    best.totalTime = (best.totalTime || 0) + stats.timePlayed;
    best.totalBossesDefeated = (best.totalBossesDefeated || 0) + stats.bossesKilled;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(best));
  } catch {}
}

export function getLifetimeStats() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}

export function getAccuracy(stats) {
  if (!stats.shotsFired) return 0;
  return Math.round((stats.shotsHit / stats.shotsFired) * 100);
}
