// The spider's repertoire. Each act is a small state machine: update(dt) returns true when finished.
// Optional hooks: lockWord() for the target brackets, draw(ctx, palette), shift(dx, dy) on scroll,
// abort() to tidy up when interrupted.
import { TAU, rand, dist, wrapAngle, approach, damp, easeOutCubic, easeInOut, ropeStep, rgba, shuffle, TAIL, HEAD_OFFSET, SPEED } from './util';
import { charRect, isOffscreen } from './text';
import { makeWeb, webPoint } from './web';

// Shared opening for word acts: walk up to the word, then nibble at it for a moment.
// The returned step function reports 'busy', 'ready' or 'fail'.
function grabber(W, word, nibble = 0.3) {
  let ready = false;
  let elapsed = 0;
  let t = 0;
  return (dt) => {
    if (!ready) {
      elapsed += dt;
      const st = W.approachWord(word, dt);
      if (st === 'fail' || elapsed > 12) return 'fail';
      ready = st === 'ready';
      return 'busy';
    }
    W.spider.free = true;
    t += dt;
    W.spider.chomp = Math.abs(Math.sin(t * 14));
    return t > nibble ? 'ready' : 'busy';
  };
}

// Chew through a word letter by letter with the laser; it grows back later.
function eat(W) {
  const word = W.pickWord({ minLen: 3, maxLen: 9 });
  if (!word) return null;
  const ranges = [];
  let idx = word.start;
  let biteT = 0;
  let ready = false;
  let elapsed = 0;
  const finish = () => {
    if (ranges.length) W.eaten.push({ ranges: ranges.splice(0), regrowAt: W.time + rand(6, 10) });
    return true;
  };
  W.say(`> eat("${word.text}")`);
  return {
    lockWord: () => ({ node: word.node, start: idx, end: word.end }),
    update(dt) {
      const sp = W.spider;
      if (!ready) {
        elapsed += dt;
        const st = W.approachWord(word, dt);
        if (st === 'fail' || elapsed > 12) return finish();
        ready = st === 'ready';
        return false;
      }
      const c = W.wordChanged(word) ? null : charRect(word.node, idx);
      if (!c || isOffscreen(c.rect)) return finish();
      const cx = c.rect.left + c.rect.width / 2;
      const cy = c.rect.top + c.rect.height / 2;
      sp.free = true;
      if (!W.steer(cx - HEAD_OFFSET * sp.scale, cy, SPEED.eat * sp.scale, dt, 2.5)) return false;
      if (!W.turnTo(0, dt)) return false;
      biteT += dt;
      sp.chomp = 0.5 + 0.5 * Math.abs(Math.sin(biteT * 16));
      // The laser sweeps down through the letter while the fangs work.
      sp.beam = { x: cx + rand(-1, 1), y: c.rect.top + c.rect.height * (0.2 + 0.6 * (biteT / 0.32)) };
      if (Math.random() < 0.6) W.spawnSpark(sp.beam.x, sp.beam.y);
      if (biteT > 0.32) {
        W.hide(c.range);
        ranges.push(c.range);
        W.spawnCrumbs(c.rect, word.color);
        idx += 1;
        biteT = 0;
        if (idx >= word.end) return finish();
      }
      return false;
    },
    abort: finish,
  };
}

// Pick a word up, swing round and hurl it; it bounces about and then floats home.
function throwWord(W) {
  const word = W.pickWord({ minLen: 3, maxLen: 10 });
  if (!word) return null;
  const grab = grabber(W, word);
  let f = null;
  let phase = 'grab';
  let t = 0;
  const aim = -Math.PI / 2 + rand(-1.1, 1.1);
  W.say(`> throw("${word.text}")`);
  return {
    lockWord: () => (f ? null : word),
    update(dt) {
      const sp = W.spider;
      if (phase === 'grab') {
        const st = grab(dt);
        if (st === 'fail') return true;
        if (st === 'busy') return false;
        f = W.lift(W.rangeOf(word), word.el);
        if (!f) return true;
        phase = 'aim';
        return false;
      }
      sp.free = true;
      t += dt;
      if (phase === 'aim') {
        if (W.turnTo(aim, dt * 1.5) || t > 1.5) { phase = 'windup'; t = 0; }
        return false;
      }
      // A quick shiver, then let go.
      sp.angle += Math.sin(t * 60) * 0.015;
      if (t < 0.25) return false;
      const v = rand(420, 620);
      W.fling(f, Math.cos(sp.angle) * v, Math.sin(sp.angle) * v, rand(-9, 9), rand(2.2, 3.2));
      f = null;
      return true;
    },
    abort() {
      if (f) W.fling(f, 0, 0, rand(-3, 3), 1.2);
      f = null;
    },
  };
}

// Tie a word to its spinnerets and drag it around for a while.
function tow(W) {
  const word = W.pickWord({ minLen: 3, maxLen: 8 });
  if (!word) return null;
  const grab = grabber(W, word);
  let f = null;
  let left = rand(4, 6);
  const release = () => {
    if (f) W.sendHome(f);
    f = null;
    return true;
  };
  W.say(`> tow("${word.text}")`);
  return {
    lockWord: () => (f ? null : word),
    update(dt) {
      const sp = W.spider;
      if (!f) {
        const st = grab(dt);
        if (st === 'fail') return true;
        if (st === 'busy') return false;
        f = W.lift(W.rangeOf(word), word.el);
        if (!f) return true;
        W.hangOn(f, () => W.toWorld({ x: -TAIL, y: 0 }, sp), rand(14, 22) * sp.scale);
        sp.target = null;
        return false;
      }
      left -= dt;
      if (left <= 0) return release();
      if (!sp.target) sp.target = W.pickWanderTarget();
      if (sp.target && W.travel(sp.target.x, sp.target.y, SPEED.tow * sp.scale, dt, 8)) sp.target = null;
      return false;
    },
    abort: release,
  };
}

// Shuffle a word's letters around, then let them hop back into place.
function scramble(W) {
  const word = W.pickWord({ minLen: 4, maxLen: 9 });
  if (!word) return null;
  const grab = grabber(W, word, 0.45);
  W.say(`> scramble("${word.text}")`);
  return {
    lockWord: () => word,
    update(dt) {
      const st = grab(dt);
      if (st !== 'ready') return st === 'fail';
      const letters = [];
      for (let i = word.start; i < word.end; i++) {
        const c = charRect(word.node, i);
        if (!c) return true;
        letters.push(c);
      }
      const slots = letters.map(({ rect }) => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }));
      let order = slots.map((_, i) => i);
      while (order.every((v, i) => v === i)) order = shuffle(order);
      const until = W.time + rand(2.5, 4);
      letters.forEach(({ range }, i) => {
        const f = W.lift(range, word.el);
        if (f) W.seek(f, slots[order[i]], { dur: 0.45, delay: i * 0.05, arc: (i % 2 ? 1 : -1) * rand(8, 16), rest: until });
      });
      return true;
    },
  };
}

// Somewhere fairly empty near the spider, with room underneath for words to dangle.
function findWebSite(W) {
  const sp = W.spider;
  const r = rand(48, 62);
  let best = null;
  let bestScore = Infinity;
  for (let i = 0; i < 48; i++) {
    const a = (i / 16) * Math.PI * 2;
    const d = 120 + (i % 3) * 70;
    const x = sp.x + Math.cos(a) * d;
    const y = sp.y + Math.sin(a) * d;
    if (x < r + 20 || x > window.innerWidth - r - 20 || y < r + 70 || y > window.innerHeight - r - 110) continue;
    // Prefer open space with as little text behind it as possible, then closeness.
    const overlap = W.walk.filter((w) => w.r > x - r && w.l < x + r && w.b > y - r && w.t < y + r).length;
    const score = overlap + d / 400 + Math.random() * 0.3;
    if (score < bestScore) {
      bestScore = score;
      best = { x, y, r };
    }
  }
  return best;
}

// Spin an orb web, then fetch a few words and hang them in it. The web snaps later.
function spinWeb(W) {
  if (W.webs.length) return null;
  const site = findWebSite(W);
  if (!site) return null;
  const web = makeWeb(site.x, site.y, site.r, (p) => W.nearestOnText(p, 0));
  W.webs.push(web);
  W.say('> spin_web()');
  const want = 2 + Math.floor(Math.random() * 2);
  let phase = 'face';
  let t = 0;
  let hung = 0;
  let tries = 0;
  let word = null;
  let grab = null;
  let f = null;
  let hook = null;
  const done = () => {
    web.expires = W.time + rand(9, 13);
    if (f) W.fling(f, 0, 0, rand(-2, 2), 1.2);
    f = null;
    return true;
  };
  return {
    maxTime: 45,
    lockWord: () => (phase === 'fetch' && !f ? word : null),
    update(dt) {
      const sp = W.spider;
      if (phase === 'face') {
        if (W.turnTo(Math.atan2(web.cy - sp.y, web.cx - sp.x), dt)) phase = 'spokes';
        return false;
      }
      if (phase === 'spokes' || phase === 'spiral') {
        sp.free = true;
        sp.chomp = Math.abs(Math.sin(W.time * 18));
        if (phase === 'spokes') {
          web.build = Math.min(1, web.build + dt / 1.1);
          if (web.build >= 1) phase = 'spiral';
        } else {
          web.spiral = Math.min(1, web.spiral + dt / 1.4);
          if (web.spiral >= 1) phase = 'pick';
        }
        return false;
      }
      if (phase === 'pick') {
        hook = web.hooks.find((h) => !h.used);
        if (hung >= want || !hook || tries >= 5) return done();
        tries += 1;
        word = W.pickWord({ near: { x: web.cx, y: web.cy }, maxDist: 360, minLen: 3, maxLen: 8 });
        if (!word) return done();
        grab = grabber(W, word);
        phase = 'fetch';
        return false;
      }
      if (phase === 'fetch') {
        if (!f) {
          const st = grab(dt);
          if (st === 'fail') phase = 'pick';
          if (st !== 'ready') return false;
          f = W.lift(W.rangeOf(word), word.el);
          if (!f) {
            phase = 'pick';
            return false;
          }
        }
        sp.free = true;
        if (!W.turnTo(Math.atan2(hook.pt.y - sp.y, hook.pt.x - sp.x), dt)) return false;
        // Toss it up onto the web, where it gets tied on and left swinging.
        const h = hook;
        const len = rand(6, 14);
        h.used = true;
        W.seek(f, { x: h.pt.x, y: h.pt.y + len + f.h / 2 }, { dur: 0.5, arc: 50, then: (g) => W.hangOn(g, () => h.pt, len, web) });
        f = null;
        hung += 1;
        t = 0;
        phase = 'pause';
        return false;
      }
      sp.free = true;
      t += dt;
      if (t > 0.5) phase = 'pick';
      return false;
    },
    draw(ctx, P) {
      if (phase !== 'spokes' && phase !== 'spiral') return;
      // Silk streaming out to wherever the web is growing.
      const n = web.spokes.length;
      const i = phase === 'spokes' ? Math.min(n - 1, Math.floor(web.build * n)) : Math.floor(web.spiral * n * 9) % n;
      const k = phase === 'spokes' ? Math.min(1, web.build * n - i) : 0.18 + web.spiral * 0.78;
      const from = W.toWorld({ x: 11, y: 0 });
      const to = webPoint(web, i, k, W.time);
      ctx.strokeStyle = rgba(P.muted, 0.45);
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    },
    abort: done,
  };
}

// Drop off the text on a dragline, dangle for a bit, then climb back up.
function rappel(W) {
  const sp = W.spider;
  if (sp.y > window.innerHeight - 180) return null;
  const S = sp.scale;
  const drop = rand(70, 140) * S;
  const a0 = sp.angle;
  const hangFor = rand(1.6, 2.8);
  const anchor = W.toWorld({ x: -TAIL, y: 0 });
  const tip = { x: anchor.x, y: anchor.y, vx: 0, vy: 0 };
  let phase = 'drop';
  let t = 0;
  let len = 0;
  W.say('> rappel()');
  return {
    update(dt) {
      sp.free = true;
      sp.speed = 0;
      t += dt;
      if (phase === 'drop') {
        len = drop * easeOutCubic(Math.min(1, t / 0.9));
        if (t > 0.9) { phase = 'hang'; t = 0; }
      } else if (phase === 'hang') {
        if (Math.random() < dt * 0.8) tip.vx += rand(-70, 70); // kicks its legs
        if (t > hangFor) { phase = 'climb'; t = 0; }
      } else if (phase === 'climb') {
        len = drop * (1 - easeInOut(Math.min(1, t / 1.1)));
        if (t > 1.1) { phase = 'settle'; len = 0; }
      }
      // The cursor can bat it about while it dangles.
      const p = W.pointer;
      if (Math.hypot(p.x - sp.x, p.y - sp.y) < 40 * S) {
        tip.vx += p.vx * 0.05;
        tip.vy += p.vy * 0.05;
      }
      ropeStep(tip, anchor, len, dt, 900, 1.5);
      sp.tuck = phase !== 'settle';
      // Hangs head-down below its spinnerets, then turns back the way it was facing.
      const hanging = len > 4 ? Math.atan2(tip.y - anchor.y, tip.x - anchor.x) : Math.PI / 2;
      sp.angle += wrapAngle((phase === 'settle' ? a0 : hanging) - sp.angle) * damp(8, dt);
      sp.x = tip.x + Math.cos(sp.angle) * TAIL * S;
      sp.y = tip.y + Math.sin(sp.angle) * TAIL * S;
      return phase === 'settle' && Math.abs(wrapAngle(a0 - sp.angle)) < 0.05;
    },
    draw(ctx, P) {
      ctx.strokeStyle = rgba(P.muted, 0.6);
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(anchor.x, anchor.y);
      ctx.lineTo(tip.x, tip.y);
      ctx.stroke();
    },
    shift(dx, dy) {
      anchor.x += dx;
      anchor.y += dy;
      tip.x += dx;
      tip.y += dy;
    },
    abort() {
      sp.tuck = false;
    },
  };
}

// Rear back, then strike — at the cursor if it's close, otherwise at a nearby bit of text.
function lunge(W) {
  const sp = W.spider;
  const p = W.pointer;
  const atCursor = W.time - p.lastMove < 3 && Math.hypot(p.x - sp.x, p.y - sp.y) < 260;
  const target = atCursor ? W.nearestOnText(p) : W.pickWanderTarget();
  if (!target || Math.hypot(target.x - sp.x, target.y - sp.y) < 40) return null;
  let phase = 'rear';
  let t = 0;
  const reset = () => {
    sp.eyes = 1;
  };
  W.say(atCursor ? '> hunt(cursor)' : '> strike()');
  return {
    update(dt) {
      t += dt;
      const aim = Math.atan2(target.y - sp.y, target.x - sp.x);
      if (phase === 'rear') {
        // Face it and creep backwards, fangs spreading, eyes flaring.
        W.turnTo(aim, dt * 1.5);
        sp.speed = -12 * sp.scale;
        sp.chomp = Math.min(1, t * 2);
        sp.eyes = 1 + t;
        if (t > 0.6) { phase = 'strike'; t = 0; }
        return false;
      }
      if (phase === 'strike') {
        sp.free = true;
        sp.chomp = 1;
        W.turnTo(aim, dt * 3);
        sp.speed = 260 * sp.scale;
        if (Math.hypot(target.x - sp.x, target.y - sp.y) < 12 || t > 0.7) { phase = 'bite'; t = 0; }
        return false;
      }
      // Fangs snap shut a few times in a spray of sparks.
      sp.free = true;
      sp.speed = 0;
      sp.chomp = Math.abs(Math.sin(t * 25));
      if (Math.random() < 0.5) {
        const m = W.toWorld({ x: 13, y: 0 });
        W.spawnSpark(m.x, m.y);
      }
      if (t < 0.5) return false;
      reset();
      return true;
    },
    abort: reset,
  };
}

// Go still, eyes smouldering and flaring red, turning to watch the cursor. Hisses if it gets close.
function lurk(W) {
  const sp = W.spider;
  const dur = rand(3.5, 6);
  let t = 0;
  let hiss = -1;
  const reset = () => {
    sp.spread = 1;
    sp.eyes = 1;
  };
  W.say('> lurk()');
  return {
    update(dt) {
      t += dt;
      sp.speed = 0;
      const p = W.pointer;
      if (hiss < 0) {
        sp.spread = approach(sp.spread, 0.82, dt * 0.5); // crouch
        sp.eyes = 0.25 + Math.pow(Math.max(0, Math.sin(t * 1.6)), 8) * 1.4;
        if (W.time - p.lastMove < 4) W.turnTo(Math.atan2(p.y - sp.y, p.x - sp.x), dt * 0.4);
        if (W.time - p.lastMove < 0.5 && Math.hypot(p.x - sp.x, p.y - sp.y) < 80 * sp.scale) {
          hiss = 0;
          W.say('> hsssss');
        } else if (t > dur) {
          reset();
          return true;
        }
        return false;
      }
      // Rears up: eyes blaze, fangs flare, body shudders.
      hiss += dt;
      sp.eyes = 1.6;
      sp.chomp = 1;
      sp.spread = approach(sp.spread, 1.1, dt * 3);
      sp.angle += Math.sin(hiss * 70) * 0.025;
      if (hiss < 0.7) return false;
      reset();
      return true;
    },
    abort: reset,
  };
}

// ---------------------------------------------------------------- quick word tricks

// Common shape: walk to a word, nibble at it, then do `trick(word)` to it once.
function onWord(W, { label, minLen = 3, maxLen = 9, nibble = 0.3, word: given = null }, trick) {
  const word = given || W.pickWord({ minLen, maxLen });
  if (!word) return null;
  const grab = grabber(W, word, nibble);
  W.say(label(word));
  return {
    lockWord: () => word,
    update(dt) {
      const st = grab(dt);
      if (st !== 'ready') return st === 'fail';
      trick(word);
      return true;
    },
  };
}

// Each letter of a word with its on-page centre, or null if any of them can't be measured.
function letters(word) {
  const out = [];
  for (let i = word.start; i < word.end; i++) {
    const c = charRect(word.node, i);
    if (!c) return null;
    out.push({ range: c.range, slot: { x: c.rect.left + c.rect.width / 2, y: c.rect.top + c.rect.height / 2 } });
  }
  return out;
}

// Turn a word upside down for a few seconds.
const flip = (W) => onWord(W, { label: (w) => `> flip("${w.text}")` }, (word) => {
  const f = W.lift(W.rangeOf(word), word.el);
  if (f) W.seek(f, { x: f.x, y: f.y }, { dur: 0.5, arc: 14, angle: Math.PI, rest: W.time + rand(3, 4.5) });
});

// Rattle a word in place.
const shake = (W) => onWord(W, { label: (w) => `> shake("${w.text}")` }, (word) => {
  const f = W.lift(W.rangeOf(word), word.el);
  if (f) W.seek(f, { x: f.x, y: f.y }, { dur: 0.1, shake: 1.6, jiggle: 0.12, rest: W.time + rand(2, 3) });
});

// Boot a word off along the line.
const kick = (W) => onWord(W, { label: (w) => `> kick("${w.text}")`, nibble: 0.15 }, (word) => {
  const f = W.lift(W.rangeOf(word), word.el);
  if (f) W.fling(f, rand(380, 560), -rand(120, 260), rand(6, 12), rand(2, 3));
});

// Spell a word backwards for a moment.
const reverse = (W) => onWord(W, { label: (w) => `> reverse("${w.text}")`, minLen: 4 }, (word) => {
  const ls = letters(word);
  if (!ls) return;
  const until = W.time + rand(2.5, 3.5);
  ls.forEach(({ range }, i) => {
    const f = W.lift(range, word.el);
    if (f) W.seek(f, ls[ls.length - 1 - i].slot, { dur: 0.5, delay: i * 0.04, arc: 12 + i * 2, rest: until });
  });
});

// A Mexican wave runs through the letters.
const wave = (W) => onWord(W, { label: (w) => `> wave("${w.text}")`, minLen: 4, maxLen: 12 }, (word) => {
  const ls = letters(word);
  if (!ls) return;
  ls.forEach(({ range, slot }, i) => {
    const f = W.lift(range, word.el);
    if (!f) return;
    const up = { x: slot.x, y: slot.y - 12 };
    W.seek(f, up, {
      dur: 0.2, delay: i * 0.07,
      then: (g) => W.seek(g, slot, { dur: 0.2, then: (h) => W.seek(h, up, { dur: 0.2, then: (k) => W.seek(k, slot, { dur: 0.2, then: W.sendHome }) }) }),
    });
  });
});

// The letters lose their grip and tumble down the screen.
const crumble = (W) => onWord(W, { label: (w) => `> crumble("${w.text}")` }, (word) => {
  const ls = letters(word);
  if (!ls) return;
  ls.forEach(({ range }) => {
    const f = W.lift(range, word.el);
    if (f) W.fling(f, rand(-60, 60), rand(-80, 0), rand(-6, 6), rand(2, 3));
  });
});

// Wrap a word up in silk; it struggles a little, then breaks free.
const cocoon = (W) => onWord(W, { label: (w) => `> cocoon("${w.text}")`, nibble: 0.8 }, (word) => {
  const f = W.lift(W.rangeOf(word), word.el);
  if (!f) return;
  f.wrapped = 1;
  W.seek(f, { x: f.x, y: f.y }, { dur: 0.2, jiggle: 0.04, rest: W.time + rand(4, 6) });
});

// Let a word down on a thread from its own line, swinging.
const dangle = (W) => onWord(W, { label: (w) => `> dangle("${w.text}")` }, (word) => {
  const range = W.rangeOf(word);
  const f = W.lift(range, word.el);
  if (!f) return;
  const anchor = () => {
    const r = range.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top };
  };
  W.hangOn(f, anchor, rand(18, 30), null, W.time + rand(3.5, 5));
});

// Trade two nearby words' places.
function swap(W) {
  const a = W.pickWord({ minLen: 3, maxLen: 9 });
  const ca = a && charRect(a.node, a.start);
  if (!ca) return null;
  const b = W.pickWord({ near: { x: ca.rect.left, y: ca.rect.top }, minLen: 3, maxLen: 9, maxDist: 260 });
  if (!b || (b.node === a.node && b.start === a.start)) return null;
  return onWord(W, { word: a, label: () => `> swap("${a.text}", "${b.text}")` }, () => {
    const fa = W.lift(W.rangeOf(a), a.el);
    const fb = W.lift(W.rangeOf(b), b.el);
    if (!fa || !fb) {
      [fa, fb].forEach((f) => f && W.sendHome(f));
      return;
    }
    const until = W.time + rand(3, 4);
    const pa = { x: fa.x, y: fa.y };
    const pb = { x: fb.x, y: fb.y };
    W.seek(fa, pb, { dur: 0.6, arc: 30, rest: until });
    W.seek(fb, pa, { dur: 0.6, arc: -30, rest: until });
  });
}

// Spit a letter out at speed.
function spit(W) {
  const word = W.pickWord({ minLen: 3, maxLen: 12, maxDist: 400 });
  if (!word) return null;
  const c = charRect(word.node, word.start + Math.floor(Math.random() * (word.end - word.start)));
  if (!c) return null;
  const sp = W.spider;
  let t = 0;
  W.say('> spit()');
  return {
    update(dt) {
      t += dt;
      sp.speed = 0;
      sp.chomp = Math.min(1, t * 3);
      if (t < 0.35) return false;
      const f = W.lift(c.range, word.el);
      if (f) {
        const m = W.toWorld({ x: 13, y: 0 });
        f.x = m.x;
        f.y = m.y;
        const v = rand(380, 520);
        W.fling(f, Math.cos(sp.angle) * v, Math.sin(sp.angle) * v - 150, rand(-12, 12), 2.5);
        for (let i = 0; i < 6; i++) W.spawnSpark(m.x, m.y);
      }
      return true;
    },
  };
}

// Summon a few words into a wobbly tower on its back.
function stack(W) {
  const sp = W.spider;
  const words = [];
  for (let i = 0; i < 4 && words.length < 3; i++) {
    const w = W.pickWord({ minLen: 3, maxLen: 8, maxDist: 320 });
    if (w && !words.some((x) => x.node === w.node && x.start === w.start)) words.push(w);
  }
  if (words.length < 2) return null;
  let t = 0;
  let summoned = false;
  W.say('> stack()');
  return {
    update(dt) {
      t += dt;
      sp.speed = 0;
      sp.chomp = Math.abs(Math.sin(t * 10));
      if (!summoned && t > 0.4) {
        summoned = true;
        const until = W.time + rand(3.5, 4.5);
        let y = sp.y - 18 * sp.scale;
        words.forEach((w, i) => {
          const f = W.lift(W.rangeOf(w), w.el);
          if (!f) return;
          y -= f.h / 2;
          W.seek(f, { x: sp.x + rand(-4, 4), y }, { dur: 0.6, delay: i * 0.15, arc: 30, angle: rand(-0.06, 0.06), rest: until });
          y -= f.h / 2 + 2;
        });
      }
      return t > 1.2;
    },
  };
}

// Toss a word up and catch it, over and over.
function juggle(W) {
  const word = W.pickWord({ minLen: 3, maxLen: 7 });
  if (!word) return null;
  const grab = grabber(W, word);
  const sp = W.spider;
  let t = -1;
  W.say(`> juggle("${word.text}")`);
  return {
    lockWord: () => (t < 0 ? word : null),
    update(dt) {
      if (t < 0) {
        const st = grab(dt);
        if (st !== 'ready') return st === 'fail';
        const f = W.lift(W.rangeOf(word), word.el);
        if (!f) return true;
        const mouth = W.toWorld({ x: 16, y: 0 });
        const top = { x: mouth.x, y: mouth.y - 70 * sp.scale };
        const toss = (g, n) => W.seek(g, top, {
          dur: 0.35, angle: rand(-0.7, 0.7),
          then: (h) => W.seek(h, mouth, { dur: 0.3, then: (k) => (n > 1 ? toss(k, n - 1) : W.sendHome(k)) }),
        });
        toss(f, 4);
        t = 0;
        return false;
      }
      t += dt;
      sp.free = true;
      sp.speed = 0;
      sp.chomp = Math.abs(Math.sin(t * 6));
      return t > 2.7;
    },
  };
}

// Creep along a word with the red scanner, reading it letter by letter.
function scan(W) {
  const word = W.pickWord({ minLen: 4, maxLen: 12 });
  if (!word) return null;
  const grab = grabber(W, word, 0.1);
  let idx = -1;
  let t = 0;
  W.say(`> scan("${word.text}")`);
  return {
    lockWord: () => word,
    update(dt) {
      const sp = W.spider;
      if (idx < 0) {
        const st = grab(dt);
        if (st !== 'ready') return st === 'fail';
        idx = word.start;
      }
      const c = W.wordChanged(word) ? null : charRect(word.node, idx);
      if (!c) return true;
      sp.free = true;
      const cx = c.rect.left + c.rect.width / 2;
      W.steer(cx - HEAD_OFFSET * sp.scale, c.rect.top + c.rect.height / 2, SPEED.eat * sp.scale, dt, 2.5);
      t += dt;
      sp.beam = { x: cx, y: c.rect.top + c.rect.height * (0.5 + 0.45 * Math.sin(t * 20)) };
      if (t > 0.18) {
        t = 0;
        idx += 1;
      }
      return idx >= word.end;
    },
  };
}

// ---------------------------------------------------------------- moves

// Fire a line at far-off text and zip over to it.
function zip(W) {
  const sp = W.spider;
  if (!W.walk.length) return null;
  let best = null;
  for (let i = 0; i < 10; i++) {
    const r = W.walk[Math.floor(Math.random() * W.walk.length)];
    const p = { x: rand(r.l, r.r), y: (r.t + r.b) / 2 };
    if (!best || Math.hypot(p.x - sp.x, p.y - sp.y) > Math.hypot(best.x - sp.x, best.y - sp.y)) best = p;
  }
  if (Math.hypot(best.x - sp.x, best.y - sp.y) < 150) return null;
  let fired = false;
  W.say('> zip()');
  return {
    update() {
      if (fired) return true; // runs again once it has landed
      fired = true;
      W.startGrapple(best);
      return false;
    },
  };
}

// Crouch and pounce onto nearby text.
function hop(W) {
  const sp = W.spider;
  const to = W.pickWanderTarget();
  if (!to) return null;
  const d = Math.hypot(to.x - sp.x, to.y - sp.y);
  if (d < 40 || d > 260) return null;
  const from = { x: sp.x, y: sp.y };
  let phase = 'crouch';
  let t = 0;
  const reset = () => {
    sp.tuck = false;
    sp.spread = 1;
  };
  W.say('> jump()');
  return {
    update(dt) {
      t += dt;
      sp.speed = 0;
      sp.free = true;
      if (phase === 'crouch') {
        W.turnTo(Math.atan2(to.y - sp.y, to.x - sp.x), dt * 2);
        sp.spread = approach(sp.spread, 0.75, dt * 2);
        if (t > 0.35) { phase = 'air'; t = 0; }
        return false;
      }
      const u = Math.min(1, t / 0.45);
      sp.tuck = true;
      sp.spread = 1;
      sp.x = from.x + (to.x - from.x) * u;
      sp.y = from.y + (to.y - from.y) * u - Math.sin(Math.PI * u) * Math.min(80, d * 0.5);
      if (u < 1) return false;
      reset();
      return true;
    },
    shift(dx, dy) {
      [from, to].forEach((p) => { p.x += dx; p.y += dy; });
    },
    abort: reset,
  };
}

// March up and down the line it's on.
function patrol(W) {
  const sp = W.spider;
  const line = W.walk.find((r) => sp.x >= r.l - 6 && sp.x <= r.r + 6 && sp.y >= r.t - 6 && sp.y <= r.b + 6);
  if (!line || line.r - line.l < 120) return null;
  const y = (line.t + line.b) / 2;
  const ends = [{ x: line.l + 6, y }, { x: line.r - 6, y }];
  let end = Math.random() < 0.5 ? 0 : 1;
  let laps = 0;
  W.say('> patrol()');
  return {
    update(dt) {
      const p = ends[end];
      if (W.travel(p.x, p.y, 120 * sp.scale, dt, 8)) {
        end = 1 - end;
        laps += 1;
      }
      return laps >= 3;
    },
    shift(dx, dy) {
      ends.forEach((p) => { p.x += dx; p.y += dy; });
    },
  };
}

// Spin round and round after its own spinnerets.
function chase(W) {
  const sp = W.spider;
  const dir = Math.random() < 0.5 ? -1 : 1;
  const dur = rand(1.3, 2);
  let t = 0;
  W.say('> chase_tail()');
  return {
    update(dt) {
      t += dt;
      sp.speed = 0;
      sp.angle += dir * 9 * dt;
      sp.chomp = Math.abs(Math.sin(t * 14));
      return t > dur;
    },
  };
}

// ---------------------------------------------------------------- the two of them

// The partner is unavailable mid-zip or while already in a duo act.
const busy = (s) => !s || !!s.grapple || !!(s.act && (s.act.duo || s.act.puppet));
const face = (s, o) => { s.angle = Math.atan2(o.y - s.y, o.x - s.x); };

// Square up to the other spider: charge, circle, trade blows in a shower of sparks; the loser flees.
function fight(W) {
  const a = W.spider;
  const b = W.other(a);
  if (busy(b) || Math.hypot(b.x - a.x, b.y - a.y) > 600) return null;
  W.takeOver(b, '> !!!');
  W.say('> fight()');
  const loser = Math.random() < 0.5 ? a : b;
  const winner = loser === a ? b : a;
  let phase = 'charge';
  let t = 0;
  let c = null;
  let r = 0;
  let orbit = 0;
  const calm = () => { a.eyes = 1; b.eyes = 1; };
  return {
    duo: true,
    maxTime: 20,
    update(dt) {
      t += dt;
      a.free = true;
      b.free = true;
      if (phase === 'charge') {
        [[a, b], [b, a]].forEach(([s, o]) => {
          face(s, o);
          s.speed = 150 * s.scale;
          s.chomp = 1;
          s.eyes = 1.5;
        });
        const d = Math.hypot(b.x - a.x, b.y - a.y);
        if (d < 50 * a.scale || t > 4) {
          phase = 'circle';
          t = 0;
          c = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
          r = Math.max(18 * a.scale, d / 2);
          orbit = Math.atan2(a.y - c.y, a.x - c.x);
        }
        return false;
      }
      // Circle each other, then take turns lunging in.
      orbit += (phase === 'circle' ? 2.4 : 0.8) * dt;
      let ra = r;
      let rb = r;
      if (phase === 'clash') {
        const beat = (t / 0.32) % 2;
        const k = Math.sin(Math.PI * (beat % 1));
        if (beat < 1) ra = r * (1 - 0.6 * k);
        else rb = r * (1 - 0.6 * k);
        if (k > 0.85) for (let i = 0; i < 3; i++) W.spawnSpark(c.x + rand(-4, 4), c.y + rand(-4, 4));
      }
      a.x = c.x + Math.cos(orbit) * ra;
      a.y = c.y + Math.sin(orbit) * ra;
      b.x = c.x - Math.cos(orbit) * rb;
      b.y = c.y - Math.sin(orbit) * rb;
      [[a, b], [b, a]].forEach(([s, o]) => {
        face(s, o);
        s.speed = 0;
        s.chomp = Math.abs(Math.sin(t * 12));
      });
      if (phase === 'circle' && t > 1.3) {
        phase = 'clash';
        t = 0;
        W.say('> attack()', winner);
      } else if (phase === 'clash' && t > 2.6) {
        calm();
        W.release(b);
        W.say('> victory()', winner);
        W.say('> retreat()', loser);
        W.fleeFrom(loser, winner);
        return true;
      }
      return false;
    },
    shift(dx, dy) {
      if (c) { c.x += dx; c.y += dy; }
    },
    abort() {
      calm();
      W.release(b);
    },
  };
}

// Tag: chase the other spider across the text; whoever gets caught is "it" next.
function tag(W) {
  const a = W.spider;
  const b = W.other(a);
  if (busy(b)) return null;
  W.takeOver(b, '> run()');
  W.say('> tag()');
  let hunter = a;
  let prey = b;
  let swaps = 0;
  let t = 0;
  let wait = 0.6;
  let escape = null;
  return {
    duo: true,
    maxTime: 30,
    update(dt) {
      t += dt;
      W.as(prey, () => {
        prey.free = false;
        if (!escape || W.travel(escape.x, escape.y, 115 * prey.scale, dt, 10)) {
          // Head for whichever of a few spots is farthest from the hunter.
          let best = null;
          for (let i = 0; i < 6; i++) {
            const p = W.pickWanderTarget();
            if (p && (!best || dist(p, hunter) > dist(best, hunter))) best = p;
          }
          escape = best;
        }
      });
      wait -= dt;
      if (wait <= 0) {
        W.as(hunter, () => {
          const g = W.nearestOnText(prey) || prey;
          W.travel(g.x, g.y, 100 * hunter.scale, dt, 8);
          hunter.chomp = Math.abs(Math.sin(t * 10));
        });
      }
      if (Math.hypot(hunter.x - prey.x, hunter.y - prey.y) < 34 * hunter.scale) {
        for (let i = 0; i < 8; i++) W.spawnSpark(prey.x, prey.y);
        W.say('> tag!', hunter);
        W.say('> argh', prey);
        swaps += 1;
        if (swaps >= 3) {
          W.release(b);
          return true;
        }
        [hunter, prey] = [prey, hunter];
        escape = null;
        wait = 0.8; // head start
        t = 0;
      }
      if (t > 12) {
        W.release(b);
        return true;
      }
      return false;
    },
    abort() {
      W.release(b);
    },
  };
}

const BANTER = [
  ['> hello()', '> hsss'],
  ['> nice web', '> thx'],
  ['> got bugs?', '> 404'],
  ['> this line is mine', '> says who'],
  ['> sudo leave', '> permission denied'],
  ['> ping', '> pong'],
  ['> seen the cursor?', '> it went that way'],
];

// Wander up to the other spider and trade a few words.
function meet(W) {
  const a = W.spider;
  const b = W.other(a);
  if (busy(b)) return null;
  W.takeOver(b);
  W.say('> approach()');
  const lines = [];
  shuffle(BANTER.slice()).slice(0, 2).forEach(([x, y]) => lines.push([x, a], [y, b]));
  let met = false;
  let t = 0;
  let line = 0;
  return {
    duo: true,
    maxTime: 20,
    update(dt) {
      W.as(b, () => W.turnTo(Math.atan2(a.y - b.y, a.x - b.x), dt));
      if (!met) {
        const g = W.nearestOnText(b) || b;
        if (W.travel(g.x, g.y, 70 * a.scale, dt, 40 * a.scale) || Math.hypot(b.x - a.x, b.y - a.y) < 45 * a.scale) {
          met = true;
          t = 0;
        }
        return false;
      }
      t += dt;
      a.speed = 0;
      W.turnTo(Math.atan2(b.y - a.y, b.x - a.x), dt);
      if (line < lines.length && t > line * 1.1) {
        const [text, who] = lines[line];
        W.say(text, who);
        who.chomp = 1;
        line += 1;
      }
      if (t < lines.length * 1.1 + 0.8) return false;
      W.release(b);
      return true;
    },
    abort() {
      W.release(b);
    },
  };
}

// Lead the other spider around in single file.
function follow(W) {
  const a = W.spider;
  const b = W.other(a);
  if (busy(b)) return null;
  W.takeOver(b, '> following');
  W.say('> follow_me()');
  const dur = rand(6, 9);
  let t = 0;
  let target = null;
  return {
    duo: true,
    maxTime: 20,
    update(dt) {
      t += dt;
      if (!target) target = W.pickWanderTarget();
      if (target && W.travel(target.x, target.y, 55 * a.scale, dt, 8)) target = null;
      W.as(b, () => {
        b.free = false;
        const behind = W.toWorld({ x: -60, y: 0 }, a);
        const g = W.nearestOnText(behind) || behind;
        W.travel(g.x, g.y, 75 * b.scale, dt, 14);
      });
      if (t < dur) return false;
      W.release(b);
      return true;
    },
    abort() {
      W.release(b);
    },
  };
}

// ---------------------------------------------------------------- more word tricks

// Run a word through a list of seek steps ({ to, ...seek options }), then `end` (home by default).
function chain(W, f, steps, end = W.sendHome) {
  const [step, ...rest] = steps;
  if (!step) {
    end(f);
    return;
  }
  W.seek(f, step.to, { ...step, then: (g) => chain(W, g, rest, end) });
}

const liftWhole = (W, word) => W.lift(W.rangeOf(word), word.el);
const above = (p, dy) => ({ x: p.x, y: p.y - dy });

// Bounce a word like a ball.
const bounce = (W) => onWord(W, { label: (w) => `> bounce("${w.text}")` }, (word) => {
  const f = liftWhole(W, word);
  if (!f) return;
  const h = { x: f.x, y: f.y };
  chain(W, f, [18, 12, 6].flatMap((dy) => [{ to: above(h, dy), dur: 0.2 }, { to: h, dur: 0.2 }]));
});

// Spin a word round twice.
const spin = (W) => onWord(W, { label: (w) => `> spin("${w.text}")` }, (word) => {
  const f = liftWhole(W, word);
  if (!f) return;
  const h = { x: f.x, y: f.y };
  const quarter = [Math.PI / 2, Math.PI, -Math.PI / 2, 0];
  chain(W, f, [...quarter, ...quarter].map((angle) => ({ to: h, angle, dur: 0.14 })));
});

// Shrink a word down to a whisper, then let it grow back.
const shrink = (W) => onWord(W, { label: (w) => `> shrink("${w.text}")` }, (word) => {
  const f = liftWhole(W, word);
  if (!f) return;
  const h = { x: f.x, y: f.y };
  chain(W, f, [{ to: h, scale: 0.35, dur: 0.5 }, { to: h, scale: 0.35, dur: 1.6 }]);
});

// Pump a word up until it pops.
const inflate = (W) => onWord(W, { label: (w) => `> inflate("${w.text}")`, nibble: 0.6 }, (word) => {
  const f = liftWhole(W, word);
  if (!f) return;
  chain(W, f, [{ to: { x: f.x, y: f.y }, scale: 1.8, dur: 1.1, jiggle: 0 }], (g) => {
    for (let i = 0; i < 14; i++) W.spawnSpark(g.x + rand(-g.w / 2, g.w / 2), g.y);
    g.scale = 1;
    W.fling(g, rand(-80, 80), -rand(250, 380), rand(-10, 10), 1.6);
  });
});

// Tip a word over so it slides off the line.
const slide = (W) => onWord(W, { label: (w) => `> slide("${w.text}")` }, (word) => {
  const f = liftWhole(W, word);
  if (!f) return;
  chain(W, f, [{ to: { x: f.x + 4, y: f.y + 2 }, angle: 0.35, dur: 0.5 }], (g) => W.fling(g, 240, 30, 0.8, 2));
});

// Fade a word to a ghost of itself.
const ghost = (W) => onWord(W, { label: (w) => `> ghost("${w.text}")` }, (word) => {
  const f = liftWhole(W, word);
  if (!f) return;
  W.seek(f, { x: f.x, y: f.y }, { dur: 0.8, alpha: 0.12, rest: W.time + rand(2.5, 3.5) });
});

// Letters droop and sag like they're melting.
const melt = (W) => onWord(W, { label: (w) => `> melt("${w.text}")`, minLen: 4 }, (word) => {
  const ls = letters(word);
  if (!ls) return;
  const until = W.time + rand(2.5, 3.5);
  ls.forEach(({ range, slot }, i) => {
    const f = W.lift(range, word.el);
    if (f) W.seek(f, { x: slot.x, y: slot.y + rand(8, 22) }, { dur: 0.9, delay: i * 0.08, angle: rand(-0.3, 0.3), rest: until });
  });
});

// Letters shoot up like a fountain and rain back down.
const fountain = (W) => onWord(W, { label: (w) => `> fountain("${w.text}")` }, (word) => {
  const ls = letters(word);
  if (!ls) return;
  ls.forEach(({ range }) => {
    const f = W.lift(range, word.el);
    if (f) W.fling(f, rand(-120, 120), -rand(380, 560), rand(-12, 12), rand(2.2, 3));
  });
});

// Letters burst outward and hang there for a moment.
const scatter = (W) => onWord(W, { label: (w) => `> scatter("${w.text}")` }, (word) => {
  const ls = letters(word);
  if (!ls) return;
  const until = W.time + rand(2, 3);
  ls.forEach(({ range, slot }) => {
    const f = W.lift(range, word.el);
    if (f) W.seek(f, { x: slot.x + rand(-90, 90), y: slot.y + rand(-60, 60) }, { dur: 0.5, arc: 20, angle: rand(-1, 1), rest: until });
  });
});

// Stack a word's letters into a column.
const vertical = (W) => onWord(W, { label: (w) => `> vertical("${w.text}")`, minLen: 4 }, (word) => {
  const ls = letters(word);
  if (!ls) return;
  const until = W.time + rand(2.5, 3.5);
  const top = ls[0].slot;
  ls.forEach(({ range }, i) => {
    const f = W.lift(range, word.el);
    if (f) W.seek(f, { x: top.x, y: top.y + i * f.h * 0.85 }, { dur: 0.45, delay: i * 0.05, arc: 10, rest: until });
  });
});

// Sort a word's letters alphabetically.
const sort = (W) => onWord(W, { label: (w) => `> sort("${w.text}")`, minLen: 4 }, (word) => {
  const ls = letters(word);
  if (!ls) return;
  const until = W.time + rand(2.5, 3.5);
  const order = ls.map((l, i) => i).sort((x, y) => ls[x].range.toString().toLowerCase().localeCompare(ls[y].range.toString().toLowerCase()));
  order.forEach((from, to) => {
    const f = W.lift(ls[from].range, word.el);
    if (f) W.seek(f, ls[to].slot, { dur: 0.5, delay: to * 0.04, arc: 14, rest: until });
  });
});

// Pull a word's letters into a ring around itself.
const ring = (W) => onWord(W, { label: (w) => `> ring("${w.text}")` }, (word) => {
  const ls = letters(word);
  if (!ls) return;
  const sp = W.spider;
  const until = W.time + rand(2, 3);
  const r = 46 * sp.scale;
  ls.forEach(({ range }, i) => {
    const f = W.lift(range, word.el);
    const a = (i / ls.length) * TAU;
    if (f) W.seek(f, { x: sp.x + Math.cos(a) * r, y: sp.y + Math.sin(a) * r }, { dur: 0.5, delay: i * 0.05, arc: 16, angle: a + Math.PI / 2, rest: until });
  });
});

// Drag nearby words in close around itself, like a magnet.
function magnet(W) {
  const sp = W.spider;
  const words = [];
  for (let i = 0; i < 6 && words.length < 4; i++) {
    const w = W.pickWord({ minLen: 3, maxLen: 8, maxDist: 320 });
    if (w && !words.some((x) => x.node === w.node && x.start === w.start)) words.push(w);
  }
  if (words.length < 2) return null;
  let t = 0;
  W.say('> magnet()');
  return {
    update(dt) {
      t += dt;
      sp.speed = 0;
      sp.chomp = Math.abs(Math.sin(t * 12));
      if (t < 0.5) return false;
      const until = W.time + rand(2.5, 3.5);
      words.forEach((w, i) => {
        const f = liftWhole(W, w);
        const a = (i / words.length) * TAU + rand(-0.2, 0.2);
        const r = (55 + rand(0, 15)) * sp.scale;
        if (f) W.seek(f, { x: sp.x + Math.cos(a) * r, y: sp.y + Math.sin(a) * r }, { dur: 0.7, delay: i * 0.1, arc: 12, angle: rand(-0.2, 0.2), rest: until });
      });
      return true;
    },
  };
}

// ---------------------------------------------------------------- more moves

// Slide backwards along the text.
function moonwalk(W) {
  const sp = W.spider;
  let t = 0;
  W.say('> moonwalk()');
  return {
    update(dt) {
      t += dt;
      sp.speed = -40 * sp.scale;
      sp.chomp = Math.abs(Math.sin(t * 6));
      return t > 2.2;
    },
  };
}

// Dart about in sharp zigzags.
function zigzag(W) {
  const sp = W.spider;
  let legs = 0;
  let t = 0;
  let target = null;
  W.say('> zigzag()');
  return {
    update(dt) {
      t += dt;
      if (!target) {
        const a = sp.angle + (legs % 2 ? 1 : -1) * 1.1;
        target = W.nearestOnText({ x: sp.x + Math.cos(a) * 60 * sp.scale, y: sp.y + Math.sin(a) * 60 * sp.scale });
        if (!target) return true;
      }
      if (W.travel(target.x, target.y, 110 * sp.scale, dt, 8)) {
        target = null;
        legs += 1;
      }
      return legs >= 5 || t > 5;
    },
  };
}

// Splay all eight legs out wide, hold, relax.
function stretch(W) {
  const sp = W.spider;
  let t = 0;
  W.say('> stretch()');
  return {
    update(dt) {
      t += dt;
      sp.speed = 0;
      sp.spread = t < 1.4 ? approach(sp.spread, 1.3, dt * 0.8) : approach(sp.spread, 1, dt * 1.2);
      sp.eyes = t < 1.4 ? 0.5 : 1;
      if (t < 2) return false;
      sp.spread = 1;
      sp.eyes = 1;
      return true;
    },
    abort() {
      sp.spread = 1;
      sp.eyes = 1;
    },
  };
}

// Creep up low and slow, eyes dimmed — towards the cursor if it's about.
function sneak(W) {
  const sp = W.spider;
  const p = W.pointer;
  const goal = W.time - p.lastMove < 3 ? W.nearestOnText(p) : W.pickWanderTarget();
  if (!goal) return null;
  let t = 0;
  const reset = () => {
    sp.spread = 1;
    sp.eyes = 1;
  };
  W.say('> sneak()');
  return {
    update(dt) {
      t += dt;
      sp.spread = approach(sp.spread, 0.8, dt);
      sp.eyes = 0.35;
      if (W.travel(goal.x, goal.y, 14 * sp.scale, dt, 10) || t > 4) {
        reset();
        return true;
      }
      return false;
    },
    abort: reset,
  };
}

// Sprint flat out to the farthest bit of text it can see.
function sprint(W) {
  const sp = W.spider;
  let goal = null;
  for (let i = 0; i < 6; i++) {
    const p = W.pickWanderTarget();
    if (p && (!goal || dist(p, sp) > dist(goal, sp))) goal = p;
  }
  if (!goal || dist(goal, sp) < 120) return null;
  let t = 0;
  W.say('> sprint()');
  return {
    update(dt) {
      t += dt;
      return W.travel(goal.x, goal.y, 230 * sp.scale, dt, 10) || t > 4;
    },
  };
}

// Leap up and do a full flip.
function backflip(W) {
  const sp = W.spider;
  const base = { x: sp.x, y: sp.y };
  const a0 = sp.angle;
  let t = 0;
  W.say('> backflip()');
  return {
    update(dt) {
      t += dt;
      sp.speed = 0;
      sp.free = true;
      if (t < 0.3) {
        sp.spread = approach(sp.spread, 0.75, dt * 2);
        return false;
      }
      const u = Math.min(1, (t - 0.3) / 0.55);
      sp.tuck = u < 1;
      sp.spread = 1;
      sp.angle = a0 - TAU * easeInOut(u);
      sp.x = base.x;
      sp.y = base.y - Math.sin(Math.PI * u) * 45 * sp.scale;
      return u >= 1;
    },
    shift(dx, dy) {
      base.x += dx;
      base.y += dy;
    },
    abort() {
      sp.tuck = false;
      sp.spread = 1;
    },
  };
}

// A quick set of push-ups.
function pushups(W) {
  const sp = W.spider;
  let t = 0;
  W.say('> pushups()');
  return {
    update(dt) {
      t += dt;
      sp.speed = 0;
      sp.spread = 1 + 0.22 * Math.sin(t * 9);
      if (t < 2.4) return false;
      sp.spread = 1;
      return true;
    },
    abort() {
      sp.spread = 1;
    },
  };
}

// ---------------------------------------------------------------- more duo acts

// Race the other spider to some far-off text.
function race(W) {
  const a = W.spider;
  const b = W.other(a);
  if (busy(b)) return null;
  let goal = null;
  for (let i = 0; i < 8; i++) {
    const p = W.pickWanderTarget();
    if (p && (!goal || dist(p, a) + dist(p, b) > dist(goal, a) + dist(goal, b))) goal = p;
  }
  if (!goal) return null;
  W.takeOver(b, '> ready');
  W.say('> race()');
  let t = 0;
  return {
    duo: true,
    maxTime: 15,
    update(dt) {
      t += dt;
      if (t < 0.8) return false; // on your marks
      let winner = null;
      [a, b].forEach((s) => W.as(s, () => {
        if (W.travel(goal.x, goal.y, rand(120, 160) * s.scale, dt, 14) && !winner) winner = s;
      }));
      if (!winner && t < 10) return false;
      if (winner) {
        W.say('> first!', winner);
        W.say('> rigged', W.other(winner));
      }
      W.release(b);
      return true;
    },
    shift(dx, dy) {
      goal.x += dx;
      goal.y += dy;
    },
    abort() {
      W.release(b);
    },
  };
}

// Both spin in perfect sync, then reverse together.
function mirror(W) {
  const a = W.spider;
  const b = W.other(a);
  if (busy(b)) return null;
  W.takeOver(b, '> sync()');
  W.say('> mirror()');
  let t = 0;
  return {
    duo: true,
    maxTime: 8,
    update(dt) {
      t += dt;
      const dir = t < 1.2 ? 1 : -1;
      [a, b].forEach((s) => {
        s.speed = 0;
        s.angle += dir * 7 * dt;
        s.chomp = Math.abs(Math.sin(t * 10));
      });
      if (t < 2.4) return false;
      W.release(b);
      return true;
    },
    abort() {
      W.release(b);
    },
  };
}

const ACTS = [
  { name: 'eat', make: eat, weight: 3, text: true },
  { name: 'throw', make: throwWord, weight: 3, text: true },
  { name: 'web', make: spinWeb, weight: 2, text: true },
  { name: 'tow', make: tow, weight: 2, text: true },
  { name: 'scramble', make: scramble, weight: 2, text: true },
  { name: 'rappel', make: rappel, weight: 2 },
  { name: 'lunge', make: lunge, weight: 2 },
  { name: 'lurk', make: lurk, weight: 1 },
  { name: 'flip', make: flip, weight: 2, text: true },
  { name: 'shake', make: shake, weight: 2, text: true },
  { name: 'kick', make: kick, weight: 2, text: true },
  { name: 'reverse', make: reverse, weight: 2, text: true },
  { name: 'wave', make: wave, weight: 2, text: true },
  { name: 'crumble', make: crumble, weight: 2, text: true },
  { name: 'cocoon', make: cocoon, weight: 2, text: true },
  { name: 'dangle', make: dangle, weight: 2, text: true },
  { name: 'swap', make: swap, weight: 2, text: true },
  { name: 'spit', make: spit, weight: 2, text: true },
  { name: 'stack', make: stack, weight: 1, text: true },
  { name: 'juggle', make: juggle, weight: 2, text: true },
  { name: 'scan', make: scan, weight: 1, text: true },
  { name: 'zip', make: zip, weight: 1 },
  { name: 'hop', make: hop, weight: 2 },
  { name: 'patrol', make: patrol, weight: 1 },
  { name: 'chase', make: chase, weight: 1 },
  { name: 'fight', make: fight, weight: 3 },
  { name: 'tag', make: tag, weight: 2 },
  { name: 'meet', make: meet, weight: 2 },
  { name: 'follow', make: follow, weight: 1 },
  { name: 'bounce', make: bounce, weight: 2, text: true },
  { name: 'spin', make: spin, weight: 2, text: true },
  { name: 'shrink', make: shrink, weight: 1, text: true },
  { name: 'inflate', make: inflate, weight: 2, text: true },
  { name: 'slide', make: slide, weight: 1, text: true },
  { name: 'ghost', make: ghost, weight: 1, text: true },
  { name: 'melt', make: melt, weight: 2, text: true },
  { name: 'fountain', make: fountain, weight: 2, text: true },
  { name: 'scatter', make: scatter, weight: 2, text: true },
  { name: 'vertical', make: vertical, weight: 1, text: true },
  { name: 'sort', make: sort, weight: 1, text: true },
  { name: 'ring', make: ring, weight: 1, text: true },
  { name: 'magnet', make: magnet, weight: 1, text: true },
  { name: 'moonwalk', make: moonwalk, weight: 1 },
  { name: 'zigzag', make: zigzag, weight: 1 },
  { name: 'stretch', make: stretch, weight: 1 },
  { name: 'sneak', make: sneak, weight: 1 },
  { name: 'sprint', make: sprint, weight: 1 },
  { name: 'backflip', make: backflip, weight: 1 },
  { name: 'pushups', make: pushups, weight: 1 },
  { name: 'race', make: race, weight: 2 },
  { name: 'mirror', make: mirror, weight: 1 },
];

export const ACT_NAMES = ACTS.map((a) => a.name);

export function startNamedAct(W, name) {
  const a = ACTS.find((x) => x.name === name);
  if (!a || (a.text && !W.canTouchText())) return null;
  const act = a.make(W);
  if (act) W.lastAct = a.name;
  return act;
}

// Weighted pick, less likely to repeat whatever it did last.
export function startRandomAct(W) {
  const pool = ACTS.filter((a) => !a.text || W.canTouchText());
  const weight = (a) => (a.name === W.lastAct ? a.weight / 3 : a.weight);
  const total = pool.reduce((s, a) => s + weight(a), 0);
  for (let tries = 0; tries < 4 && pool.length; tries++) {
    let r = Math.random() * total;
    let choice = pool[pool.length - 1];
    for (const a of pool) {
      r -= weight(a);
      if (r < 0) {
        choice = a;
        break;
      }
    }
    const act = choice.make(W);
    if (act) {
      W.lastAct = choice.name;
      return act;
    }
  }
  return null;
}
