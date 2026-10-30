import {
  TAU, clamp, wrapAngle, approach, rand, dist, damp, easeOutCubic, easeInOut, ropeStep,
  parseColor, rgba, mixColor, LEG_LEN, HEAD_OFFSET, SPEED,
} from './util';
import {
  canUseHighlights, collectWalkable, findWords, charRect, wordAt, textRange, textStyle, inRect, isOffscreen,
} from './text';
import { webPoint, drawWeb } from './web';
import { startRandomAct, startNamedAct, ACT_NAMES } from './acts';

const HIGHLIGHT_NAME = 'spider-bite';
const STEP_DIST = 24;
const STEP_TIME = 0.12;
const TURN_RATE = 3.2; // rad/s
const PAD = 6; // how far off a line of text still counts as "on" it
const GRAVITY = 1400;
const MAX_FLOATERS = 16;
const RED = [255, 28, 48]; // eyes, markings, anything predatory — deliberately not themed
const RED_GLOW = 'rgba(255, 20, 40, 0.9)';

const LEG_LAYOUT = [
  { hip: [6, 4], rest: [50, 48] },
  { hip: [2, 4.5], rest: [18, 64] },
  { hip: [-3, 4.5], rest: [-18, 62] },
  { hip: [-8, 4], rest: [-48, 46] },
];

const BLUE = [150, 180, 255]; // leg and word-box tint, blended with the theme ink

function createSpider(x, y, joint) {
  const legs = [];
  [-1, 1].forEach((side) => {
    LEG_LAYOUT.forEach((l, j) => {
      legs.push({
        side,
        j,
        hip: { x: l.hip[0], y: l.hip[1] * side },
        rest: { x: l.rest[0], y: l.rest[1] * side },
        foot: null,
        from: { x: 0, y: 0 },
        stepping: false,
        t: 0,
        lift: 0,
        word: null, // Range of the word this foot stands on
        color: null, // that word's colour
      });
    });
  });
  return {
    x, y,
    angle: 0,
    speed: 0,
    scale: 1, // follows the size of the text underfoot
    scaleTarget: 1,
    spread: 1, // leg stance; < 1 when curled up
    eyes: 1,
    ink: null, // current line colour, blended from theme + text underfoot
    mode: 'wander',
    target: null,
    path: null,
    stuck: 0,
    blocked: false,
    free: false, // allowed off text this frame
    tuck: false, // legs folded (dangling)
    grapple: null,
    grappleCooldown: 0,
    dash: 0, // darting until this time
    pause: 0,
    idle: 0,
    chomp: 0,
    beam: null,
    label: null,
    joint, // colour of its knee and foot dots, so the two can be told apart
    act: null,
    nextAct: rand(3, 5),
    legs,
  };
}

export function createSpiderEngine(canvas, { getPalette }) {
  const ctx = canvas.getContext('2d');
  let dpr = 1;
  let raf = 0;
  let last = performance.now();
  let active = false;
  let wasActive = false;
  let walkAt = -1;
  let walkDirty = true;

  // Two spiders, swinging in from opposite edges onto the first text they find.
  const spiders = [
    createSpider(-40, window.innerHeight * 0.45, [255, 77, 125]),
    createSpider(window.innerWidth + 40, window.innerHeight * 0.55, [255, 176, 59]),
  ];
  spiders[1].angle = Math.PI;
  spiders[1].nextAct = rand(6, 9);
  // Most functions work on "the current spider"; the loop points this at each one in turn.
  let spider = spiders[0];
  // While the pair is out (boot screen) they roam the whole viewport; afterwards it's text only.
  let roam = true;
  const inView = (p, m) => ({ x: clamp(p.x, m, window.innerWidth - m), y: clamp(p.y, m, window.innerHeight - m) });
  const pointer = { x: -1000, y: -1000, lx: -1000, ly: -1000, vx: 0, vy: 0, lastMove: -10 };
  const scroll = { x: window.scrollX, y: window.scrollY };
  const crumbs = [];
  const floaters = []; // words and letters lifted off the page
  const webs = [];
  const eaten = []; // { ranges, regrowAt }
  const volatile = new WeakSet(); // elements whose text changes by itself (typing effects)

  const highlight = canUseHighlights() ? new window.Highlight() : null;
  let styleEl = null;
  if (highlight) {
    CSS.highlights.set(HIGHLIGHT_NAME, highlight);
    styleEl = document.createElement('style');
    styleEl.textContent = `::highlight(${HIGHLIGHT_NAME}) { color: transparent; text-shadow: none; text-decoration: none; }`;
    document.head.appendChild(styleEl);
  }

  // Everything the behaviours in acts.js get to use.
  const W = {
    time: 0,
    spider,
    spiders,
    other: (s) => spiders.find((x) => x !== s),
    as,
    takeOver,
    release,
    fleeFrom,
    pointer,
    webs,
    eaten,
    walk: [],
    lastAct: null,
    wordChanged,
    toWorld,
    steer,
    turnTo,
    travel,
    startGrapple,
    approachWord,
    pickWanderTarget,
    nearestOnText,
    pickWord,
    rangeOf: (w) => textRange(w.node, w.start, w.end),
    lift,
    hide: (range) => highlight.add(range),
    seek,
    hangOn,
    fling,
    sendHome,
    say,
    spawnSpark,
    spawnCrumbs,
    canTouchText: () => !!highlight && floaters.length < MAX_FLOATERS && eaten.length < 3,
  };

  const resize = () => {
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    walkDirty = true;
  };
  const onPointerMove = (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.lastMove = W.time;
  };
  const onPointerDown = (e) => {
    if (!active) return;
    const click = { x: e.clientX, y: e.clientY };
    // Swat a word that's dangling or flying about.
    const hit = floaters.find((f) => f.state !== 'held' && f.state !== 'home' &&
      Math.abs(click.x - f.x) < f.w / 2 + 6 && Math.abs(click.y - f.y) < f.h / 2 + 6);
    if (hit) {
      fling(hit, rand(-260, 260), -rand(250, 450), rand(-10, 10), 2);
      return;
    }
    // Poke a spider and it zips off to some far-away text.
    const poked = spiders.find((s) => !s.grapple && dist(click, s) < 45 * s.scale);
    if (!poked) return;
    as(poked, () => {
      // Interrupting a duo act frees the partner too.
      spiders.forEach((s) => { if (s !== poked && s.act && s.act.puppet) release(s); });
      endAct();
      say('> !!');
      fleeFrom(poked, click);
    });
  };

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerdown', onPointerDown, { passive: true });

  // ---------------------------------------------------------------- geometry

  function use(s) {
    spider = s;
    W.spider = s;
  }

  // Run fn with `s` as the current spider (used by duo acts to steer the partner).
  function as(s, fn) {
    const prev = spider;
    use(s);
    try {
      return fn();
    } finally {
      use(prev);
    }
  }

  function toWorld(p, s = spider) {
    const k = s.scale;
    const c = Math.cos(s.angle);
    const sn = Math.sin(s.angle);
    return { x: s.x + (p.x * c - p.y * sn) * k, y: s.y + (p.x * sn + p.y * c) * k };
  }

  // Two-bone IK with equal bones; the knee bends away from the body and rises with the step.
  function kneeFor(hip, foot, lift) {
    const L = LEG_LEN * spider.scale;
    const dx = foot.x - hip.x;
    const dy = foot.y - hip.y;
    const len = Math.hypot(dx, dy) || 1;
    const d = Math.min(len, L * 2 - 0.01);
    const h = Math.sqrt(Math.max(0, L * L - (d / 2) * (d / 2))) + lift * 5;
    const mx = (hip.x + foot.x) / 2;
    const my = (hip.y + foot.y) / 2;
    let px = -dy / len;
    let py = dx / len;
    if ((mx - spider.x) * px + (my - spider.y) * py < 0) { px = -px; py = -py; }
    return { x: mx + px * h, y: my + py * h };
  }

  function isWalkable(x, y) {
    if (roam) return x > 10 && y > 10 && x < window.innerWidth - 10 && y < window.innerHeight - 10;
    return W.walk.some((r) => inRect(r, x, y, PAD));
  }

  // Closest point on text; `band` keeps the result near the middle of the line.
  function nearestOnText(p, band = 0.3) {
    if (roam) return inView(p, 30);
    return nearestTextPoint(p, band);
  }

  function nearestTextPoint(p, band = 0.3) {
    let best = null;
    let bestD = Infinity;
    for (const r of W.walk) {
      const h = r.b - r.t;
      const x = clamp(p.x, r.l, r.r);
      const y = clamp(p.y, r.t + h * band, r.b - h * band);
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bestD) { bestD = d; best = { x, y }; }
    }
    return best;
  }

  // Can it walk there in a straight line without leaving the text? The ends get some slack.
  function pathOnText(a, b) {
    if (roam) return true;
    const d = dist(a, b);
    const steps = Math.ceil(d / 6);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      if (d * t < 8 || d * (1 - t) < 24) continue;
      if (!isWalkable(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)) return false;
    }
    return true;
  }

  // Keep everything glued to the page while it scrolls.
  function shiftAll(dx, dy) {
    const move = (p) => { if (p) { p.x += dx; p.y += dy; } };
    spiders.forEach((s) => {
      move(s);
      move(s.target);
      s.legs.forEach((l) => { move(l.foot); move(l.from); });
      if (s.grapple) { move(s.grapple.to); move(s.grapple.from); }
      if (s.act && s.act.shift) s.act.shift(dx, dy);
      s.path = null;
    });
    crumbs.forEach(move);
    floaters.forEach((f) => {
      move(f);
      move(f.tip);
      if (f.seek) { move(f.seek.from); move(f.seek.to); }
      move(f.restPos);
    });
    webs.forEach((w) => {
      w.cx += dx;
      w.cy += dy;
      w.anchors.forEach((a) => move(a.to));
    });
    W.walk.forEach((r) => { r.l += dx; r.r += dx; r.t += dy; r.b += dy; });
  }

  function pickWanderTarget() {
    if (roam) {
      const m = 40;
      return { x: rand(m, window.innerWidth - m), y: rand(m, window.innerHeight - m) };
    }
    if (!W.walk.length) return null;
    // Mostly stroll along nearby lines, sometimes head somewhere further.
    const near = W.walk.filter((r) => Math.hypot(clamp(spider.x, r.l, r.r) - spider.x, (r.t + r.b) / 2 - spider.y) < 220);
    const pool = near.length && Math.random() < 0.8 ? near : W.walk;
    const r = pool[Math.floor(Math.random() * pool.length)];
    return { x: rand(r.l, r.r), y: (r.t + r.b) / 2 };
  }

  function wordChanged(word) {
    if (word.node.isConnected && word.node.nodeValue === word.snapshot) return false;
    volatile.add(word.el);
    return true;
  }

  function isTaken(node, start, end) {
    let taken = false;
    highlight.forEach((r) => {
      if (r.startContainer === node && r.startOffset < end && r.endOffset > start) taken = true;
    });
    return taken;
  }

  // A visible word nobody else is playing with, favouring ones close to `near`.
  function pickWord({ near = spider, minLen = 3, maxLen = 9, maxDist = Infinity } = {}) {
    if (!highlight) return null;
    const words = findWords(60).filter((w) => w.text.length >= minLen && w.text.length <= maxLen &&
      !volatile.has(w.el) && !isTaken(w.node, w.start, w.end));
    let best = null;
    let bestScore = Infinity;
    for (let i = 0; i < Math.min(14, words.length); i++) {
      const w = words[Math.floor(Math.random() * words.length)];
      const c = charRect(w.node, w.start);
      if (!c) continue;
      const d = Math.hypot(c.rect.left - near.x, c.rect.top - near.y);
      if (d > maxDist) continue;
      const score = d * rand(0.6, 1.4);
      if (score < bestScore) { bestScore = score; best = w; }
    }
    if (best) best.snapshot = best.node.nodeValue;
    return best;
  }

  function textColor(range) {
    const el = range.startContainer.parentElement;
    if (!el) return null;
    const c = parseColor(getComputedStyle(el).color);
    return c[3] < 0.5 ? null : c;
  }

  // ---------------------------------------------------------------- movement

  // Returns true once within stopDist of (tx, ty).
  function steer(tx, ty, maxSpeed, dt, stopDist = 4, jitter = 0) {
    const dx = tx - spider.x;
    const dy = ty - spider.y;
    const d = Math.hypot(dx, dy);
    if (d < stopDist) {
      spider.speed = approach(spider.speed, 0, 260 * dt);
      return true;
    }
    const diff = wrapAngle(Math.atan2(dy, dx) + jitter - spider.angle);
    spider.angle += clamp(diff, -TURN_RATE * dt, TURN_RATE * dt);
    const align = Math.max(0, Math.cos(diff));
    const target = Math.max(maxSpeed * Math.min(1, d / 70), 8) * align * align;
    spider.speed = approach(spider.speed, target, 180 * dt);
    return false;
  }

  function turnTo(angle, dt) {
    const diff = wrapAngle(angle - spider.angle);
    spider.angle += clamp(diff, -TURN_RATE * dt, TURN_RATE * dt);
    return Math.abs(diff) < 0.08;
  }

  // Walk there along the text if possible, otherwise fire a line and zip across the gap.
  function travel(tx, ty, maxSpeed, dt, stopDist, jitter = 0) {
    const p = spider.path;
    if (!p || Math.hypot(p.x - tx, p.y - ty) > 4 || W.time - p.at > 0.6) {
      spider.path = { x: tx, y: ty, at: W.time, ok: pathOnText(spider, { x: tx, y: ty }) };
    }
    if (!spider.path.ok || spider.stuck > 1.5) {
      if (Math.hypot(tx - spider.x, ty - spider.y) < stopDist) return true;
      if (spider.grappleCooldown <= 0) startGrapple({ x: tx, y: ty });
      else spider.speed = approach(spider.speed, 0, 300 * dt);
      return false;
    }
    const arrived = steer(tx, ty, maxSpeed, dt, stopDist, jitter);
    spider.stuck = !arrived && spider.blocked ? spider.stuck + dt : 0;
    return arrived;
  }

  // Walk up to just before a word, facing along it. 'moving' | 'ready' | 'fail'.
  function approachWord(word, dt, speed = SPEED.hunt) {
    if (wordChanged(word)) return 'fail';
    const c = charRect(word.node, word.start);
    if (!c || isOffscreen(c.rect)) return 'fail';
    const S = spider.scale;
    const tx = c.rect.left - (HEAD_OFFSET - 2) * S;
    const ty = c.rect.top + c.rect.height / 2;
    spider.free = Math.hypot(tx - spider.x, ty - spider.y) < 40 * S;
    if (!travel(tx, ty, speed * S, dt, 5)) return 'moving';
    return turnTo(0, dt) ? 'ready' : 'moving';
  }

  function startGrapple(to) {
    spider.grapple = { to: { x: to.x, y: to.y }, from: null, t: 0, phase: 'aim' };
    spider.speed = 0;
    spider.path = null;
    spider.stuck = 0;
    spider.tuck = false;
  }

  function updateGrapple(dt) {
    const g = spider.grapple;
    if (g.phase === 'aim') {
      if (turnTo(Math.atan2(g.to.y - spider.y, g.to.x - spider.x), dt * 2)) { g.phase = 'shoot'; g.t = 0; }
      return;
    }
    if (g.phase === 'shoot') {
      g.t += dt / 0.15;
      if (g.t >= 1) {
        g.phase = 'reel';
        g.t = 0;
        g.from = { x: spider.x, y: spider.y };
        g.dur = clamp(dist(g.from, g.to) / 520, 0.2, 0.75);
      }
      return;
    }
    g.t = Math.min(1, g.t + dt / g.dur);
    const e = easeInOut(g.t);
    spider.x = g.from.x + (g.to.x - g.from.x) * e;
    spider.y = g.from.y + (g.to.y - g.from.y) * e;
    if (g.t >= 1) {
      spider.grapple = null;
      spider.grappleCooldown = 1;
    }
  }

  function endAct() {
    if (spider.act && spider.act.abort) spider.act.abort();
    spider.act = null;
    spider.nextAct = W.time + rand(4, 7);
    spider.tuck = false;
    spider.spread = 1;
    spider.eyes = 1;
  }

  function beginAct(next) {
    spider.act = next;
    next.startedAt = W.time;
    next.deadline = W.time + (next.maxTime || 25);
    spider.mode = 'act';
    spider.target = null;
    spider.path = null;
  }

  // Duo acts: the initiator takes the other spider over (it idles while being steered), then lets it go.
  function takeOver(s, label) {
    as(s, () => {
      endAct();
      beginAct({ puppet: true, maxTime: 30, update: () => { s.free = true; return false; } });
      s.grapple = null;
      if (label) say(label);
    });
  }

  function release(s) {
    s.act = null;
    s.mode = 'wander';
    s.target = null;
    s.path = null;
    s.tuck = false;
    s.spread = 1;
    s.eyes = 1;
    s.nextAct = W.time + rand(4, 8);
  }

  // Zip `s` off to text far away from `from`.
  function fleeFrom(s, from) {
    if (!W.walk.length) return;
    let best = null;
    for (let i = 0; i < 12; i++) {
      const r = W.walk[Math.floor(Math.random() * W.walk.length)];
      const p = { x: rand(r.l, r.r), y: (r.t + r.b) / 2 };
      if (!best || dist(p, from) > dist(best, from)) best = p;
    }
    as(s, () => {
      spider.mode = 'wander';
      spider.target = null;
      spider.pause = rand(0.8, 1.5);
      startGrapple(best);
    });
  }

  function think(dt) {
    spider.chomp = approach(spider.chomp, 0, dt * 3);
    spider.beam = null;
    spider.free = false;
    spider.grappleCooldown -= dt;

    if (spider.grapple) { updateGrapple(dt); return; }

    const act = spider.act;
    if (act) {
      if (W.time > act.deadline) endAct();
      else if (act.update(dt)) {
        // A quick fizzle (word vanished, nothing reachable) shouldn't cost a long wait.
        spider.nextAct = W.time + (W.time - act.startedAt < 1.5 ? rand(0.5, 1.5) : rand(5, 10));
        spider.act = null;
      }
      if (!spider.act) { spider.mode = 'wander'; spider.target = null; spider.path = null; }
      return;
    }

    // Lost its footing (page scrolled, text changed): swing to the nearest text.
    if (!isWalkable(spider.x, spider.y)) {
      const p = nearestOnText(spider);
      if (p && spider.grappleCooldown <= 0) startGrapple(p);
      else spider.speed = approach(spider.speed, 0, 300 * dt);
      return;
    }

    if (W.time > spider.nextAct) {
      const next = startRandomAct(W);
      if (next) {
        beginAct(next);
        return;
      }
      spider.nextAct = W.time + 3;
    }

    const S = spider.scale;
    const pointerActive = W.time - pointer.lastMove < 2.5;
    const pointerDist = Math.hypot(pointer.x - spider.x, pointer.y - spider.y);
    if (pointerActive && pointerDist > 70 * S) {
      const goal = nearestOnText(pointer);
      if (goal) {
        if (spider.mode !== 'follow' || !spider.target || dist(goal, spider.target) > 30) spider.target = goal;
        spider.mode = 'follow';
        if (travel(spider.target.x, spider.target.y, SPEED.follow * S, dt, 6)) {
          turnTo(Math.atan2(pointer.y - spider.y, pointer.x - spider.x), dt);
        }
        return;
      }
    }
    if (spider.mode === 'follow') {
      // Caught up: sit and watch the cursor for a moment.
      spider.speed = approach(spider.speed, 0, 200 * dt);
      turnTo(Math.atan2(pointer.y - spider.y, pointer.x - spider.x), dt);
      if (!pointerActive) { spider.mode = 'wander'; spider.target = null; spider.pause = rand(1, 2.5); }
      return;
    }

    // Wander: creep, freeze, twitch, dart.
    if (spider.pause > 0) {
      spider.pause -= dt;
      spider.speed = approach(spider.speed, 0, 200 * dt);
      if (Math.random() < dt * 0.9) spider.angle += rand(-0.4, 0.4); // sudden head snap
      return;
    }
    if (!spider.target) spider.target = pickWanderTarget();
    if (!spider.target) return;
    if (spider.dash < W.time && Math.random() < dt * 0.25) spider.dash = W.time + rand(0.25, 0.5);
    const pace = spider.dash > W.time ? 2.6 : 0.45 + 0.4 * Math.abs(Math.sin(W.time * 1.3));
    const jitter = Math.sin(W.time * 1.7) * 0.12;
    if (travel(spider.target.x, spider.target.y, SPEED.wander * S * pace, dt, 8, jitter)) {
      spider.target = null;
      spider.pause = Math.random() < 0.7 ? rand(0.6, 2.8) : 0;
    }
  }

  function updateLegs(dt) {
    const S = spider.scale;
    // Folded in while zipping along a line or dangling from one.
    if (spider.tuck || (spider.grapple && spider.grapple.phase === 'reel')) {
      spider.legs.forEach((leg, i) => {
        const k = 0.45 + (spider.tuck ? Math.sin(W.time * 9 + i * 1.7) * 0.08 : 0);
        leg.foot = toWorld({ x: leg.rest.x * k, y: leg.rest.y * k });
        leg.stepping = false;
        leg.lift = 0.6;
        leg.word = null;
        leg.color = null;
      });
      return;
    }

    const vx = Math.cos(spider.angle) * spider.speed;
    const vy = Math.sin(spider.angle) * spider.speed;
    const still = spider.speed < 2;
    spider.idle = still ? spider.idle + dt : 0;
    const stepTime = STEP_TIME + (spider.speed < 25 ? 0.06 : 0);
    const reach = LEG_LEN * 2 * S;

    const info = spider.legs.map((leg) => {
      const hipW = toWorld(leg.hip);
      let restW = toWorld({ x: leg.rest.x * spider.spread, y: leg.rest.y * spider.spread });
      restW.x += vx * 0.12;
      restW.y += vy * 0.12;
      // Feet reach for the nearest bit of text.
      const snap = nearestTextPoint(restW, 0);
      if (snap && dist(snap, restW) < 18 * S && dist(snap, hipW) < reach - 2) restW = snap;
      if (!leg.foot) leg.foot = { ...restW };
      if (!leg.stepping) leg.lift = 0;
      return { leg, hipW, restW, d: dist(leg.foot, restW) };
    });
    const isStepping = (side, j) => spider.legs.some((l) => l.stepping && ((l.side === side && Math.abs(l.j - j) === 1) || (l.side !== side && l.j === j)));

    info.sort((a, b) => b.d - a.d).forEach(({ leg, hipW, restW, d }) => {
      if (leg.stepping) {
        leg.t = Math.min(1, leg.t + dt / stepTime);
        const e = easeOutCubic(leg.t);
        leg.foot.x = leg.from.x + (restW.x - leg.from.x) * e;
        leg.foot.y = leg.from.y + (restW.y - leg.from.y) * e;
        leg.lift = Math.min(1, Math.sin(Math.PI * leg.t) * 1.6);
        if (leg.t >= 1) {
          leg.stepping = false;
          leg.lift = 0;
          leg.word = wordAt(leg.foot.x, leg.foot.y);
          leg.color = leg.word ? textColor(leg.word) : null;
        }
        return;
      }
      const overstretched = dist(leg.foot, hipW) > reach - 1;
      const wants = d > STEP_DIST * S || (still && spider.idle > 0.25 && d > 4 * S) || overstretched;
      if (wants && (overstretched || !isStepping(leg.side, leg.j))) {
        leg.stepping = true;
        leg.t = 0;
        leg.word = null;
        leg.from.x = leg.foot.x;
        leg.from.y = leg.foot.y;
      }
    });
  }

  // Grow on big headings, shrink on small print, and take on the colour of the text underfoot.
  function adaptToSurface(dt, P) {
    const under = W.walk.find((r) => inRect(r, spider.x, spider.y, PAD));
    if (under) spider.scaleTarget = clamp((under.b - under.t) / 19, 0.8, 1.4);
    spider.scale += (spider.scaleTarget - spider.scale) * damp(1.5, dt);

    const tinted = spider.legs.filter((l) => l.color);
    let target = P.ink;
    if (tinted.length) {
      const avg = [0, 1, 2].map((ch) => tinted.reduce((s, l) => s + l.color[ch], 0) / tinted.length);
      target = mixColor(P.ink, avg, 0.5);
    }
    spider.ink = spider.ink ? mixColor(spider.ink, target, damp(3, dt)) : target.slice(0, 3);
  }

  // ---------------------------------------------------------------- lifted words

  function lift(range, el) {
    if (!highlight || floaters.length >= MAX_FLOATERS + 10) return null;
    const rect = range.getBoundingClientRect();
    if (!rect.width) return null;
    const st = textStyle(range, el);
    ctx.font = st.font;
    ctx.textBaseline = 'alphabetic';
    const m = ctx.measureText(st.text);
    const asc = m.fontBoundingBoxAscent ?? st.fontSize * 0.8;
    const desc = m.fontBoundingBoxDescent ?? st.fontSize * 0.2;
    highlight.add(range);
    const f = {
      ...st,
      range,
      w: rect.width,
      h: rect.height,
      base: (asc - desc) / 2, // baseline offset from the vertical centre
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      angle: 0,
      vx: 0,
      vy: 0,
      va: 0,
      alpha: 1,
      seed: rand(0, 10),
      restAngle: 0,
      restPos: null,
      shake: 0,
      jiggle: 0.05,
      wrapped: 0, // silk cocoon opacity
      scale: 1,
      state: 'held', // held | flying | rope | seek | rest | home
      owner: spider, // whose mouth it's held in
      until: Infinity,
      homeT: 0,
      tip: null,
      anchorOf: null,
      web: null,
      seek: null,
    };
    floaters.push(f);
    return f;
  }

  // Fly to `to`. Afterwards: then(f) if given, else rest there (tilted by `angle`, optionally
  // shaking by `shake` px / `jiggle` rad) until time `rest`, then go home.
  function seek(f, to, { dur = 0.45, delay = 0, arc = 0, angle = 0, rest = 0, then = null, shake = 0, jiggle = 0.05, scale, alpha } = {}) {
    f.state = 'seek';
    f.seek = {
      from: { x: f.x, y: f.y }, to: { x: to.x, y: to.y }, a0: f.angle, a1: angle, t0: W.time + delay, dur, arc, rest, then,
      s0: f.scale, s1: scale ?? f.scale, al0: f.alpha, al1: alpha ?? f.alpha,
    };
    f.shake = shake;
    f.jiggle = jiggle;
  }

  // Tie the top-centre of the word to a rope hanging from anchorOf().
  function hangOn(f, anchorOf, len, web = null, until = Infinity) {
    f.state = 'rope';
    f.anchorOf = anchorOf;
    f.len = len;
    f.web = web;
    f.until = until;
    f.tip = { x: f.x + (Math.sin(f.angle) * f.h) / 2, y: f.y - (Math.cos(f.angle) * f.h) / 2, vx: rand(-80, 80), vy: 0 };
  }

  function fling(f, vx, vy, va, life) {
    f.state = 'flying';
    f.vx = vx;
    f.vy = vy;
    f.va = va;
    f.until = W.time + life;
    f.web = null;
    f.seek = null;
    f.anchorOf = null;
  }

  function sendHome(f) {
    f.state = 'home';
    f.homeT = 0;
    f.web = null;
    f.seek = null;
    f.anchorOf = null;
  }

  function dropFloater(i) {
    highlight.delete(floaters[i].range);
    floaters.splice(i, 1);
  }

  function updateFloaters(dt) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    for (let i = floaters.length - 1; i >= 0; i--) {
      const f = floaters[i];
      const home = f.range.getBoundingClientRect();
      f.away = Math.hypot(home.left + home.width / 2 - f.x, home.top + home.height / 2 - f.y);
      switch (f.state) {
        case 'held': {
          const o = f.owner;
          const mouth = toWorld({ x: 13, y: 0 }, o);
          const reach = f.w / 2 + 1;
          f.x = mouth.x + Math.cos(o.angle) * reach;
          f.y = mouth.y + Math.sin(o.angle) * reach;
          f.angle = o.angle;
          break;
        }
        case 'flying': {
          f.vy += GRAVITY * dt;
          f.x += f.vx * dt;
          f.y += f.vy * dt;
          f.angle += f.va * dt;
          const hw = f.w / 2;
          const hh = f.h / 2;
          if (f.y + hh > vh) {
            f.y = vh - hh;
            f.vy = Math.abs(f.vy) < 60 ? 0 : -f.vy * 0.45;
            f.vx *= 0.75;
            f.va *= 0.6;
          }
          if (f.y - hh < 0 && f.vy < 0) { f.y = hh; f.vy *= -0.4; }
          if (f.x - hw < 0) { f.x = hw; f.vx = Math.abs(f.vx) * 0.6; }
          if (f.x + hw > vw) { f.x = vw - hw; f.vx = -Math.abs(f.vx) * 0.6; }
          if (W.time > f.until) sendHome(f);
          break;
        }
        case 'rope': {
          const a = f.anchorOf();
          // The cursor can swat dangling words.
          if (Math.hypot(pointer.x - f.x, pointer.y - f.y) < f.w / 2 + 12) {
            f.tip.vx += pointer.vx * 0.06;
            f.tip.vy += pointer.vy * 0.06;
          }
          ropeStep(f.tip, a, f.len, dt, 900, 1.1);
          const dx = f.tip.x - a.x;
          const dy = f.tip.y - a.y;
          const want = Math.hypot(dx, dy) > 0.5 ? -Math.atan2(dx, dy) : 0;
          f.angle += wrapAngle(want - f.angle) * damp(14, dt);
          f.x = f.tip.x - (Math.sin(f.angle) * f.h) / 2;
          f.y = f.tip.y + (Math.cos(f.angle) * f.h) / 2;
          if (W.time > f.until) sendHome(f);
          break;
        }
        case 'seek': {
          const s = f.seek;
          if (W.time < s.t0) break;
          const u = Math.min(1, (W.time - s.t0) / s.dur);
          const e = easeInOut(u);
          f.x = s.from.x + (s.to.x - s.from.x) * e;
          f.y = s.from.y + (s.to.y - s.from.y) * e - Math.sin(Math.PI * u) * s.arc;
          f.angle = s.a0 + wrapAngle(s.a1 - s.a0) * e;
          f.scale = s.s0 + (s.s1 - s.s0) * e;
          f.alpha = s.al0 + (s.al1 - s.al0) * e;
          if (u >= 1) {
            f.seek = null;
            if (s.then) s.then(f);
            else {
              f.state = 'rest';
              f.until = s.rest || W.time + 2;
              f.restAngle = s.a1;
              f.restPos = { ...s.to };
            }
          }
          break;
        }
        case 'rest':
          f.angle = f.restAngle + Math.sin(W.time * (f.shake ? 40 : 6) + f.seed) * f.jiggle;
          if (f.shake) {
            f.x = f.restPos.x + rand(-f.shake, f.shake);
            f.y = f.restPos.y + rand(-f.shake, f.shake);
          }
          if (W.time > f.until) sendHome(f);
          break;
        case 'home': {
          // Drift back into its slot in the page, then reappear for real.
          f.homeT += dt;
          f.wrapped = Math.max(0, f.wrapped - dt * 1.5);
          if (!f.range.startContainer.isConnected || (!home.width && !home.height)) {
            f.alpha -= dt * 3;
            if (f.alpha <= 0) dropFloater(i);
            break;
          }
          const k = damp(7, dt);
          const hx = home.left + home.width / 2;
          const hy = home.top + home.height / 2;
          f.x += (hx - f.x) * k;
          f.y += (hy - f.y) * k;
          f.angle = wrapAngle(f.angle) * (1 - k);
          f.scale += (1 - f.scale) * k;
          f.alpha += (1 - f.alpha) * k;
          if ((Math.hypot(hx - f.x, hy - f.y) < 0.8 && Math.abs(f.angle) < 0.02 && Math.abs(f.scale - 1) < 0.02 && f.alpha > 0.97) || f.homeT > 2.5) dropFloater(i);
          break;
        }
        default:
          break;
      }
    }
  }

  function updateWebs(dt) {
    for (let i = webs.length - 1; i >= 0; i--) {
      const web = webs[i];
      web.hooks.forEach((h) => Object.assign(h.pt, webPoint(web, h.spoke, h.k, W.time)));
      if (web.expires && W.time > web.expires && !web.fading) {
        // Snap! Everything hanging in it drops and finds its way home.
        web.fading = true;
        floaters.forEach((f) => {
          if (f.web === web) fling(f, rand(-40, 40), rand(-60, 0), rand(-3, 3), rand(0.9, 1.5));
        });
      }
      if (web.fading) {
        web.alpha -= dt / 1.2;
        if (web.alpha <= 0) webs.splice(i, 1);
      }
    }
  }

  function regrow() {
    for (let i = eaten.length - 1; i >= 0; i--) {
      const e = eaten[i];
      if (W.time < e.regrowAt) continue;
      // One letter back every ~70ms.
      if (W.time - (e.lastRegrow || 0) > 0.07) {
        const r = e.ranges.shift();
        if (r) highlight.delete(r);
        e.lastRegrow = W.time;
      }
      if (!e.ranges.length) eaten.splice(i, 1);
    }
  }

  // ---------------------------------------------------------------- effects

  function say(text, s = spider) {
    s.label = { text, t: W.time };
  }

  function spawnSpark(x, y) {
    if (crumbs.length >= 160) return;
    const a = rand(-Math.PI, 0);
    const v = rand(60, 160);
    crumbs.push({ kind: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.3, 0.6) });
  }

  function spawnCrumbs(rect, color) {
    for (let i = 0; i < 7 && crumbs.length < 160; i++) {
      crumbs.push({
        kind: 'crumb',
        x: rect.left + rand(0, rect.width),
        y: rect.top + rand(rect.height * 0.2, rect.height * 0.8),
        vx: rand(-40, 40),
        vy: rand(-70, -10),
        size: rand(1, 2.6),
        rot: rand(0, Math.PI),
        vr: rand(-8, 8),
        life: 1,
        color,
      });
    }
  }

  // ---------------------------------------------------------------- drawing

  function dots(points, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    points.forEach((p) => {
      ctx.moveTo(p.x + r, p.y);
      ctx.arc(p.x, p.y, r, 0, TAU);
    });
    ctx.fill();
  }

  function legColor() {
    return mixColor(spider.ink, BLUE, 0.5);
  }

  // Outline every word a planted foot is standing on.
  function drawWordBoxes() {
    const seen = new Set();
    ctx.strokeStyle = rgba(legColor(), 0.75);
    ctx.fillStyle = rgba(legColor(), 0.07);
    ctx.lineWidth = 1;
    spider.legs.forEach((leg) => {
      if (!leg.word || leg.stepping) return;
      const r = leg.word.getBoundingClientRect();
      if (!r.width) return;
      const key = `${Math.round(r.left)},${Math.round(r.top)}`;
      if (seen.has(key)) return;
      seen.add(key);
      ctx.fillRect(r.left - 2, r.top - 1, r.width + 4, r.height + 2);
      ctx.strokeRect(r.left - 2, r.top - 1, r.width + 4, r.height + 2);
    });
  }

  // Corner brackets around the word it's after.
  function drawTargetLock() {
    const w = spider.act && spider.act.lockWord && spider.act.lockWord();
    if (!w || w.start >= w.end) return;
    const a = charRect(w.node, w.start);
    const b = charRect(w.node, w.end - 1);
    if (!a || !b) return;
    const x1 = a.rect.left - 3;
    const y1 = Math.min(a.rect.top, b.rect.top) - 2;
    const x2 = b.rect.right + 3;
    const y2 = Math.max(a.rect.bottom, b.rect.bottom) + 2;
    const k = 5;
    ctx.save();
    ctx.strokeStyle = rgba(RED, 1);
    ctx.globalAlpha = 0.55 + 0.35 * Math.sin(W.time * 10);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y1 + k); ctx.lineTo(x1, y1); ctx.lineTo(x1 + k, y1);
    ctx.moveTo(x2 - k, y1); ctx.lineTo(x2, y1); ctx.lineTo(x2, y1 + k);
    ctx.moveTo(x2, y2 - k); ctx.lineTo(x2, y2); ctx.lineTo(x2 - k, y2);
    ctx.moveTo(x1 + k, y2); ctx.lineTo(x1, y2); ctx.lineTo(x1, y2 - k);
    ctx.stroke();
    ctx.restore();
  }

  function drawParticles(dt, P) {
    for (let i = crumbs.length - 1; i >= 0; i--) {
      const c = crumbs[i];
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.vy += (c.kind === 'spark' ? 380 : 260) * dt;
      c.life -= dt * (c.kind === 'spark' ? 1 : 1.4);
      if (c.life <= 0) {
        crumbs.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = Math.min(1, c.life * 2);
      if (c.kind === 'spark') {
        ctx.strokeStyle = rgba(c.life > 0.3 ? P.accent : RED, 1);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x - c.vx * 0.03, c.y - c.vy * 0.03);
        ctx.stroke();
      } else {
        c.rot += c.vr * dt;
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
      }
      ctx.restore();
    }
  }

  function drawGrappleLine(P) {
    const g = spider.grapple;
    if (!g || g.phase === 'aim') return;
    const head = toWorld({ x: 11, y: 0 });
    const k = g.phase === 'shoot' ? g.t : 1;
    const tip = { x: head.x + (g.to.x - head.x) * k, y: head.y + (g.to.y - head.y) * k };
    ctx.strokeStyle = rgba(P.muted, 0.7);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(head.x, head.y);
    ctx.lineTo(tip.x, tip.y);
    ctx.stroke();
    dots([tip], 2, rgba(P.accent, 1));
  }

  // Long hair-thin legs with pink-red joints, a small capsule body — like the reference.
  function drawLegs() {
    const w = Math.sqrt(spider.scale);
    const geo = spider.legs.map((leg) => {
      const hip = toWorld(leg.hip);
      const foot = { x: leg.foot.x - leg.lift * 2, y: leg.foot.y - leg.lift * 4 };
      return { hip, foot, knee: kneeFor(hip, foot, leg.lift) };
    });
    ctx.strokeStyle = rgba(legColor(), 0.9);
    ctx.lineWidth = 1.2 * w;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    geo.forEach(({ hip, knee, foot }) => {
      ctx.moveTo(hip.x, hip.y);
      ctx.lineTo(knee.x, knee.y);
      ctx.lineTo(foot.x, foot.y);
    });
    ctx.stroke();
    dots(geo.flatMap((g) => [g.knee, g.foot]), 2.1 * w, rgba(spider.joint, 0.95));
  }

  function drawBody(P) {
    const k = spider.scale;
    ctx.save();
    ctx.translate(spider.x, spider.y);
    ctx.rotate(spider.angle);
    ctx.scale(k, k);
    // Capsule body
    ctx.fillStyle = rgba(P.bg, 0.9);
    ctx.strokeStyle = rgba(legColor(), 0.95);
    ctx.lineWidth = 1.3 / Math.sqrt(k);
    ctx.beginPath();
    ctx.moveTo(-8, -4.5);
    ctx.lineTo(7, -4.5);
    ctx.arc(7, 0, 4.5, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(-8, 4.5);
    ctx.arc(-8, 0, 4.5, Math.PI / 2, -Math.PI / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // White head plate
    ctx.fillStyle = rgba(spider.ink, 0.95);
    ctx.fillRect(3, -2.2, 4.4, 4.4);
    // Fangs
    const open = 0.2 + spider.chomp * 0.6;
    ctx.lineWidth = 1 / Math.sqrt(k);
    ctx.beginPath();
    [-1, 1].forEach((side) => {
      ctx.moveTo(11, side * 1.5);
      ctx.lineTo(11 + Math.cos(open) * 3.5, side * (1.5 + Math.sin(open) * 3.5));
    });
    ctx.stroke();
    // Small red eyes
    const glow = clamp(spider.eyes, 0, 1.6);
    ctx.shadowColor = RED_GLOW;
    ctx.shadowBlur = 6 * glow;
    dots([{ x: 9.6, y: -1.6 }, { x: 9.6, y: 1.6 }], 0.85, rgba(RED, clamp(0.15 + 0.85 * glow, 0, 1)));
    ctx.restore();
  }

  function drawFloaters(P) {
    floaters.forEach((f) => {
      if (f.state === 'rope') {
        const a = f.anchorOf();
        ctx.strokeStyle = rgba(P.muted, 0.6 * f.alpha);
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(f.tip.x, f.tip.y);
        ctx.stroke();
      }
      ctx.save();
      ctx.globalAlpha = f.alpha;
      ctx.translate(f.x, f.y);
      ctx.rotate(f.angle);
      if (f.scale !== 1) ctx.scale(f.scale, f.scale);
      // A faint glass plate keeps a stolen word readable over other text; it fades as it lands home.
      const plate = f.text.length > 1 ? clamp(f.away / 40, 0, 1) : 0;
      if (plate > 0) {
        ctx.fillStyle = rgba(P.bg, 0.6 * plate);
        ctx.strokeStyle = rgba(P.ink, 0.14 * plate);
        ctx.lineWidth = 1;
        ctx.fillRect(-f.w / 2 - 4, -f.h / 2 - 1, f.w + 8, f.h + 2);
        ctx.strokeRect(-f.w / 2 - 4, -f.h / 2 - 1, f.w + 8, f.h + 2);
      }
      ctx.font = f.font;
      ctx.fillStyle = f.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      if ('letterSpacing' in ctx) ctx.letterSpacing = f.spacing;
      ctx.fillText(f.text, 0, f.base);
      // Cocooned words are bound in criss-crossing silk.
      if (f.wrapped) {
        ctx.strokeStyle = rgba(P.muted, 0.75 * clamp(f.wrapped, 0, 1));
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        const hw = f.w / 2 + 3;
        const hh = f.h / 2 + 1;
        for (let x = -hw; x < hw; x += 5) {
          ctx.moveTo(x, -hh);
          ctx.lineTo(x + 7, hh);
          ctx.moveTo(x + 7, -hh);
          ctx.lineTo(x, hh);
        }
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  function drawBeam(P) {
    const b = spider.beam;
    if (!b) return;
    const from = toWorld({ x: 11, y: 0 });
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = rgba(RED, 1);
    ctx.shadowColor = RED_GLOW;
    ctx.shadowBlur = 8;
    ctx.globalAlpha = 0.6 + Math.random() * 0.4;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.restore();
    dots([b], 1.5 + Math.random(), rgba(P.accent, 1));
  }

  // Terminal-style caption that types itself out above the spider.
  function drawLabel(P) {
    const l = spider.label;
    if (!l) return;
    const age = W.time - l.t;
    if (age > 2.4) {
      spider.label = null;
      return;
    }
    const shown = l.text.slice(0, Math.floor(age * 28));
    const cursor = shown.length < l.text.length || Math.floor(age * 3) % 2 === 0 ? '_' : ' ';
    ctx.save();
    ctx.font = `10px ${P.mono}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const w = ctx.measureText(`${l.text}_`).width + 10;
    const x = spider.x - w / 2;
    const y = Math.max(4, spider.y - 34 * spider.scale - 14);
    ctx.globalAlpha = Math.min(1, (2.4 - age) / 0.5);
    ctx.fillStyle = rgba(P.bg, 0.7);
    ctx.strokeStyle = rgba(P.ink, 0.18);
    ctx.lineWidth = 1;
    ctx.fillRect(x, y, w, 15);
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, 14);
    ctx.fillStyle = rgba(P.ink, 0.85);
    ctx.fillText(shown + cursor, x + 5, y + 8);
    ctx.restore();
  }

  // ---------------------------------------------------------------- loop

  function resetAll() {
    spiders.forEach((s) => as(s, endAct));
    floaters.forEach((f) => highlight.delete(f.range));
    floaters.length = 0;
    eaten.forEach((e) => e.ranges.forEach((r) => highlight.delete(r)));
    eaten.length = 0;
    webs.length = 0;
    crumbs.length = 0;
    spiders.forEach((s) => {
      s.grapple = null;
      s.label = null;
    });
  }

  const render = (now) => {
    raf = requestAnimationFrame(render);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    if (!active) {
      if (wasActive) resetAll();
      wasActive = false;
      return;
    }
    wasActive = true;
    W.time += dt;
    const P = getPalette();

    // Cursor velocity, for swatting dangling things.
    const step = Math.max(dt, 1e-3);
    pointer.vx = clamp(pointer.vx * 0.5 + ((pointer.x - pointer.lx) / step) * 0.5, -2500, 2500);
    pointer.vy = clamp(pointer.vy * 0.5 + ((pointer.y - pointer.ly) / step) * 0.5, -2500, 2500);
    pointer.lx = pointer.x;
    pointer.ly = pointer.y;

    const sx = window.scrollX - scroll.x;
    const sy = window.scrollY - scroll.y;
    if (sx || sy) {
      shiftAll(-sx, -sy);
      scroll.x = window.scrollX;
      scroll.y = window.scrollY;
      walkDirty = true;
    }
    if (walkAt < 0 || W.time - walkAt > 0.5 || (walkDirty && W.time - walkAt > 0.12)) {
      W.walk = collectWalkable();
      walkAt = W.time;
      walkDirty = false;
    }

    spiders.forEach((s) => {
      use(s);
      think(dt);
      if (!spider.grapple) {
        const nx = spider.x + Math.cos(spider.angle) * spider.speed * dt;
        const ny = spider.y + Math.sin(spider.angle) * spider.speed * dt;
        if (spider.free || !isWalkable(spider.x, spider.y) || isWalkable(nx, ny)) {
          spider.x = nx;
          spider.y = ny;
          spider.blocked = false;
        } else {
          spider.speed = 0;
          spider.blocked = true;
        }
      }
      adaptToSurface(dt, P);
      updateLegs(dt);
    });
    // A departing spider is gone once its exit zip has carried it off screen.
    for (let i = spiders.length - 1; i > 0; i--) {
      if (spiders[i].leaving && !spiders[i].grapple) spiders.splice(i, 1);
    }
    use(spiders[0]);
    updateWebs(dt);
    if (highlight) {
      updateFloaters(dt);
      regrow();
    }

    const each = (fn) => spiders.forEach((s) => { use(s); fn(s); });
    each(drawWordBoxes);
    webs.forEach((web) => drawWeb(ctx, web, P, W.time));
    each((s) => {
      drawTargetLock();
      if (s.act && s.act.draw) s.act.draw(ctx, P);
    });
    drawParticles(dt, P);
    each(() => {
      drawGrappleLine(P);
      drawLegs();
      drawBody(P);
    });
    drawFloaters(P);
    each(() => {
      drawBeam(P);
      drawLabel(P);
    });
  };
  raf = requestAnimationFrame(render);

  // Dev-only console hook for trying behaviours by hand, e.g. __spider.act('web').
  if (process.env.NODE_ENV === 'development') {
    window.__spider = {
      acts: ACT_NAMES,
      act(name, i = 0) {
        const s = spiders[i];
        if (!active || !s || s.grapple) return false;
        return as(s, () => {
          endAct();
          const next = startNamedAct(W, name);
          if (next) beginAct(next);
          return !!next;
        });
      },
      state: (i = 0) => {
        const s = spiders[i];
        if (!s) return null;
        return { x: s.x, y: s.y, scale: s.scale, mode: s.mode, act: s.act ? W.lastAct : null };
      },
    };
  }

  return {
    setActive(value) {
      active = value;
    },
    // Two spiders on the boot screen; once that's done, the second one says bye and zips off.
    setPair(value) {
      roam = value;
      const s = spiders[1];
      if (value || !s || s.leaving) return;
      spiders.forEach((x) => as(x, () => {
        if (x.act && (x.act.duo || x.act.puppet)) endAct();
      }));
      if (!active) {
        spiders.splice(1, 1);
        use(spiders[0]);
        return;
      }
      as(s, () => {
        endAct();
        say('> bye');
        startGrapple({ x: s.x < window.innerWidth / 2 ? -80 : window.innerWidth + 80, y: s.y });
      });
      s.leaving = true;
    },
    destroy() {
      delete window.__spider;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      if (highlight) {
        CSS.highlights.delete(HIGHLIGHT_NAME);
        styleEl.remove();
      }
    },
  };
}
