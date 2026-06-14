const DAILY_KEY = 'retroSpaceDailyBest';

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getDailySeed() {
  const today = new Date().toISOString().slice(0, 10);
  return hashString(today);
}

export function createSeededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export function getDailyBest() {
  try {
    const data = JSON.parse(localStorage.getItem(DAILY_KEY));
    const today = new Date().toISOString().slice(0, 10);
    if (data && data.date === today) return data.score;
    return 0;
  } catch { return 0; }
}

export function setDailyBest(score) {
  const today = new Date().toISOString().slice(0, 10);
  const current = getDailyBest();
  if (score > current) {
    localStorage.setItem(DAILY_KEY, JSON.stringify({ date: today, score }));
  }
}
