const LS_BEST = 'retrospace_best';
const LS_SAVE = 'retrospace_save';

function lsGetBest() { return parseInt(localStorage.getItem(LS_BEST) || '0', 10); }
function lsSetBest(n) { if (n > lsGetBest()) localStorage.setItem(LS_BEST, String(n)); }
function lsGetSave() { try { return JSON.parse(localStorage.getItem(LS_SAVE)); } catch { return null; } }
function lsSetSave(obj) { localStorage.setItem(LS_SAVE, JSON.stringify(obj)); }
function lsClearSave() { localStorage.removeItem(LS_SAVE); }

export { lsGetBest, lsSetBest, lsGetSave, lsSetSave, lsClearSave };
