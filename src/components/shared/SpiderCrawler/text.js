const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'BUTTON', 'SELECT', 'OPTION', 'CANVAS', 'CODE', 'PRE']);

export function canUseHighlights() {
  return typeof window !== 'undefined' && window.CSS && CSS.highlights && typeof window.Highlight === 'function';
}

export const inRect = (r, x, y, pad) => x >= r.l - pad && x <= r.r + pad && y >= r.t - pad && y <= r.b + pad;

export const isOffscreen = (r) =>
  r.bottom < 20 || r.top > window.innerHeight - 20 || r.right < 20 || r.left > window.innerWidth - 20;

// Text that can be hidden through ::highlight — gradient text (background-clip: text) can't be.
function isEdibleElement(el) {
  if (!el || SKIP_TAGS.has(el.tagName) || el.closest('[aria-hidden="true"], [contenteditable="true"]')) return false;
  const cs = getComputedStyle(el);
  if (cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.5) return false;
  if (cs.webkitTextFillColor && cs.webkitTextFillColor !== cs.color) return false;
  if ((cs.backgroundClip || cs.webkitBackgroundClip) === 'text') return false;
  return true;
}

// Line boxes of all visible text in the viewport — the only ground the spider walks on.
export function collectWalkable() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const out = [];
  const visible = new Map();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return /\S/.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  const range = document.createRange();
  let node;
  while ((node = walker.nextNode()) && out.length < 400) {
    const el = node.parentElement;
    if (!el || SKIP_TAGS.has(el.tagName)) continue;
    range.selectNodeContents(node);
    const b = range.getBoundingClientRect();
    if (b.bottom < 0 || b.top > h || b.right < 0 || b.left > w || b.width < 2) continue;
    let vis = visible.get(el);
    if (vis === undefined) {
      vis = !el.closest('[aria-hidden="true"]') &&
        (el.checkVisibility ? el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) : true);
      visible.set(el, vis);
    }
    if (!vis) continue;
    for (const r of range.getClientRects()) {
      if (r.width < 4 || r.height < 6 || r.bottom < 0 || r.top > h) continue;
      out.push({ l: r.left, t: r.top, r: r.right, b: r.bottom });
    }
  }
  return out;
}

// Visible, hideable words in the viewport, as { node, start, end, el, color }.
export function findWords(limit = 40) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return /[A-Za-z]{3}/.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  const range = document.createRange();
  let node;
  while ((node = walker.nextNode()) && out.length < limit * 4) {
    const el = node.parentElement;
    range.selectNodeContents(node);
    const r = range.getBoundingClientRect();
    if (r.bottom < 60 || r.top > h - 60 || r.right < 40 || r.left > w - 40 || r.width === 0) continue;
    if (!isEdibleElement(el)) continue;
    const color = getComputedStyle(el).color;
    const re = /[A-Za-z]+/g;
    let m;
    while ((m = re.exec(node.nodeValue))) {
      if (m[0].length < 3) continue;
      range.setStart(node, m.index);
      range.setEnd(node, m.index + m[0].length);
      const wr = range.getBoundingClientRect();
      if (wr.width === 0 || wr.height > 90 || wr.top < 60 || wr.bottom > h - 60 || wr.left < 40 || wr.right > w - 40) continue;
      out.push({ node, start: m.index, end: m.index + m[0].length, el, color, text: m[0] });
    }
  }
  return out;
}

export function textRange(node, start, end) {
  const r = document.createRange();
  r.setStart(node, start);
  r.setEnd(node, end);
  return r;
}

export function charRect(node, i) {
  if (!node.isConnected || i >= node.nodeValue.length) return null;
  const range = textRange(node, i, i + 1);
  const rect = range.getBoundingClientRect();
  return rect.width || rect.height ? { rect, range } : null;
}

// The word under a viewport point, as a Range, or null if the point isn't on text.
export function wordAt(x, y) {
  let node;
  let offset;
  if (document.caretPositionFromPoint) {
    const p = document.caretPositionFromPoint(x, y);
    if (!p) return null;
    node = p.offsetNode;
    offset = p.offset;
  } else if (document.caretRangeFromPoint) {
    const r = document.caretRangeFromPoint(x, y);
    if (!r) return null;
    node = r.startContainer;
    offset = r.startOffset;
  } else {
    return null;
  }
  if (!node || node.nodeType !== 3 || SKIP_TAGS.has(node.parentElement?.tagName)) return null;
  const text = node.nodeValue;
  let s = offset;
  let e = offset;
  while (s > 0 && /\S/.test(text[s - 1])) s--;
  while (e < text.length && /\S/.test(text[e])) e++;
  if (e <= s) return null;
  const range = textRange(node, s, e);
  // Caret lookups snap to the closest text, so check the foot is really on it.
  const rect = range.getBoundingClientRect();
  if (x < rect.left - 4 || x > rect.right + 4 || y < rect.top - 4 || y > rect.bottom + 4) return null;
  return range;
}

// How a range's text actually renders (CSS text-transform), plus a canvas font that matches it.
export function textStyle(range, el) {
  const cs = getComputedStyle(el);
  let text = range.toString();
  const atWordStart = range.startOffset === 0 || /\s/.test(range.startContainer.nodeValue[range.startOffset - 1]);
  if (cs.textTransform === 'uppercase') text = text.toUpperCase();
  else if (cs.textTransform === 'lowercase') text = text.toLowerCase();
  else if (cs.textTransform === 'capitalize' && atWordStart) text = text.charAt(0).toUpperCase() + text.slice(1);
  return {
    text,
    font: `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`,
    fontSize: parseFloat(cs.fontSize) || 16,
    color: cs.color,
    spacing: cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing,
  };
}
