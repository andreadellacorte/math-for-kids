'use strict';
(() => {
  function R(f, l, r = 365) {
    let i = new Date();
    (i.setTime(i.getTime() + r * 24 * 60 * 60 * 1e3),
      (document.cookie = `${f}=${l};expires=${i.toUTCString()};path=/`));
  }
  function H(f) {
    let l = f + '=',
      r = document.cookie.split(';');
    for (let i of r)
      if (((i = i.trim()), i.indexOf(l) === 0)) return i.substring(l.length);
    return null;
  }
  var B = document.getElementById('grid'),
    O = { checked: false }, // Fake checkbox object - always hide answers
    A = document.getElementById('eqSlider'),
    Z = document.getElementById('eqOut'),
    j = document.getElementById('difficultySelect'),
    F = document.getElementById('rangePreset'),
    W = document.getElementById('opAdd'),
    V = document.getElementById('opSub'),
    _ = document.getElementById('opMul'),
    D = document.getElementById('opDiv'),
    E = document.getElementById('stat'),
    G = (f, l) => Math.floor(Math.random() * (l - f + 1)) + f;
  var ne = (f, l, r) => Math.max(l, Math.min(r, f));
  var generationId = 0;

  // Technique-based difficulty scoring system
  const Technique = {
    T1_SINGLE: 'T1_SINGLE',           // Cell becomes single-candidate due to crosses
    T2_ARITH: 'T2_ARITH',             // Standalone equation solved directly (2 knowns → 1 unknown)
    T3_SUBST: 'T3_SUBST',             // Variable eliminated by substitution across two equations
    T4_ELIM_2X2: 'T4_ELIM_2X2',       // Solved 2x2 or 3x3 linear system via elimination
    T5_CHAIN_3PLUS: 'T5_CHAIN_3PLUS', // Back-substitution across chains of length ≥3
    T6_GUESS_DEPTH1: 'T6_GUESS_DEPTH1' // Single shallow guess made and resolved
  };

  const TechniqueWeights = {
    [Technique.T1_SINGLE]: 1,
    [Technique.T2_ARITH]: 2,
    [Technique.T3_SUBST]: 4,
    [Technique.T4_ELIM_2X2]: 7,
    [Technique.T5_CHAIN_3PLUS]: 10,
    [Technique.T6_GUESS_DEPTH1]: 12
  };

  function createSolveTrace() {
    return {
      techniques: [],
      counts: {
        [Technique.T1_SINGLE]: 0,
        [Technique.T2_ARITH]: 0,
        [Technique.T3_SUBST]: 0,
        [Technique.T4_ELIM_2X2]: 0,
        [Technique.T5_CHAIN_3PLUS]: 0,
        [Technique.T6_GUESS_DEPTH1]: 0
      },
      maxChainLen: 0,
      guesses: 0
    };
  }

  function recordTechnique(trace, technique, chainLen = 0) {
    trace.techniques.push(technique);
    trace.counts[technique]++;
    if (technique === Technique.T5_CHAIN_3PLUS && chainLen > trace.maxChainLen) {
      trace.maxChainLen = chainLen;
    }
    if (technique === Technique.T6_GUESS_DEPTH1) {
      trace.guesses++;
    }
  }

  function scoreDifficulty(trace) {
    let raw = 0;
    for (let tech in trace.counts) {
      raw += trace.counts[tech] * TechniqueWeights[tech];
    }
    raw += 3 * trace.maxChainLen;
    raw += 5 * Math.min(trace.guesses, 1);

    let band;

    // EASY: Only T1–T2, zero guesses
    if (trace.guesses === 0 &&
        trace.counts[Technique.T3_SUBST] === 0 &&
        trace.counts[Technique.T4_ELIM_2X2] === 0 &&
        trace.counts[Technique.T5_CHAIN_3PLUS] === 0 &&
        trace.counts[Technique.T6_GUESS_DEPTH1] === 0) {
      band = 'easy';
    }
    // MEDIUM: Some T3, zero guesses, no T4/T5
    else if (trace.guesses === 0 &&
             trace.counts[Technique.T3_SUBST] > 0 &&
             trace.counts[Technique.T4_ELIM_2X2] === 0 &&
             trace.counts[Technique.T5_CHAIN_3PLUS] === 0 &&
             trace.counts[Technique.T6_GUESS_DEPTH1] === 0 &&
             trace.maxChainLen < 3) {  // Short chains OK for medium
      band = 'medium';
    }
    // HARD: T3 + longer chains (≥3) OR T4 present, zero guesses, no T5
    else if (trace.guesses === 0 &&
             trace.counts[Technique.T3_SUBST] > 0 &&
             trace.counts[Technique.T5_CHAIN_3PLUS] === 0 &&
             trace.counts[Technique.T6_GUESS_DEPTH1] === 0 &&
             (trace.counts[Technique.T4_ELIM_2X2] > 0 || trace.maxChainLen >= 3)) {
      band = 'hard';
    }
    // EXPERT: T5 required OR T4 with long chains, ≤1 guess
    else if (trace.guesses <= 1 &&
             (trace.counts[Technique.T5_CHAIN_3PLUS] > 0 ||
              (trace.counts[Technique.T4_ELIM_2X2] > 0 && trace.maxChainLen >= 3))) {
      band = 'expert';
    }
    // FALLBACK: If nothing matches but has techniques, classify by complexity
    else if (trace.counts[Technique.T3_SUBST] > 0) {
      // Has T3 but doesn't fit other criteria → medium
      band = 'medium';
    } else {
      // Only T1/T2 → easy
      band = 'easy';
    }

    // NIGHTMARE: Harder than expert (only upgrade from expert)
    // Nightmare must already be expert-level plus additional complexity
    if (band === 'expert') {
      const totalTechniques = trace.counts[Technique.T1_SINGLE] +
                             trace.counts[Technique.T2_ARITH] +
                             trace.counts[Technique.T3_SUBST] +
                             trace.counts[Technique.T4_ELIM_2X2] +
                             trace.counts[Technique.T5_CHAIN_3PLUS] +
                             trace.counts[Technique.T6_GUESS_DEPTH1];

      if (trace.guesses > 1 ||  // Multiple guesses
          (trace.counts[Technique.T5_CHAIN_3PLUS] > 0 && trace.counts[Technique.T4_ELIM_2X2] > 0) ||  // Both T4 and T5
          trace.counts[Technique.T5_CHAIN_3PLUS] > 2 ||  // Extensive chains (>2)
          trace.maxChainLen >= 5 ||  // Very long chains (≥5)
          totalTechniques > 30) {  // Excessive techniques (>30)
        band = 'nightmare';
      }
    }

    return { raw, band, details: trace };
  }

  function solveWithTrace(grid, equations, givens) {
    const trace = createSolveTrace();
    const unsolvable = he(grid, equations, givens, trace);
    const score = scoreDifficulty(trace);
    return { solvable: !unsolvable, trace, score };
  }

  function oe() {
    let f = H('mx_eq'),
      l = H('mx_diff'),
      r = H('mx_range'),
      i = H('mx_ops');
    ((A.value = ne(parseInt(f || '30'), 3, 50).toString()),
      (j.value = l || 'medium'),
      r ? (F.value = r) : (F.value = '0-20'),
      (Z.textContent = A.value));
    let h = i ? JSON.parse(i) : { add: !0, sub: !0, mul: !0, div: !0 };
    ((W.checked = h.add !== !1),
      (V.checked = h.sub !== !1),
      (_.checked = h.mul !== !1),
      (D.checked = h.div !== !1));
  }
  function se(f, l, r, i) {
    let h = +f,
      o = +r,
      t = +i;
    return l === '+'
      ? h + o === t
      : l === '-'
        ? h - o === t
        : l === '\xD7'
          ? h * o === t
          : l === '\xF7'
            ? o !== 0 && h / o === t
            : !1;
  }
  function U(f, l) {
    let r = document.createElementNS('http://www.w3.org/2000/svg', f);
    for (let i in l) r.setAttribute(i, l[i]);
    return r;
  }
  function Q() {
    let f = [];
    return (
      W.checked && f.push('+'),
      V.checked && f.push('-'),
      _.checked && f.push('\xD7'),
      D.checked && f.push('\xF7'),
      f.length > 0 ? f : ['+']
    );
  }
  function J() {
    let f = 0,
      l = 20,
      r = F.value;
    if (/^(\d+)-(\d+)$/.test(r)) {
      let i = r.match(/^(\d+)-(\d+)$/);
      ((f = parseInt(i[1])), (l = parseInt(i[2])));
    }
    return { min: f, max: l };
  }
  function q(f, l, r, i, h = null) {
    ((f = parseInt(f)), (l = parseInt(l)), (r = parseInt(r)));
    let o = h || J();
    if (
      f < o.min ||
      f > o.max ||
      l < o.min ||
      l > o.max ||
      r < o.min ||
      r > o.max ||
      !Number.isInteger(f) ||
      !Number.isInteger(l) ||
      !Number.isInteger(r) ||
      f <= 0 ||
      l <= 0 ||
      r <= 0
    )
      return !1;
    switch (i) {
      case '+':
        return f + l === r;
      case '-':
        return f - l === r && r > 0;
      case '\xD7':
        return f * l === r;
      case '\xF7':
        return l !== 0 && f / l === r && f % l === 0;
      default:
        return !1;
    }
  }
  function L() {
    let f = Q(),
      l = J(),
      r = 'auto';
    for (let h = 0; h < 300; h++) {
      let o = f[Math.floor(Math.random() * f.length)],
        t,
        n,
        e;
      switch (o) {
        case '+': {
          ((t = G(l.min, l.max)), (n = G(l.min, l.max)), (e = t + n));
          break;
        }
        case '-': {
          ((t = G(Math.max(l.min, 1), l.max)),
            (n = G(l.min, l.max)),
            n > t && ([t, n] = [n, t]),
            (e = t - n));
          break;
        }
        case '\xD7': {
          let b = Math.min(Math.floor(Math.sqrt(l.max)), 20);
          if (
            ((t = G(2, Math.max(2, b))),
            (n = G(2, Math.max(2, b))),
            (e = t * n),
            e < l.min || e > l.max)
          )
            continue;
          break;
        }
        case '\xF7': {
          if (
            ((n = G(Math.max(l.min, 2), Math.max(l.min, l.max))),
            (e = G(Math.max(l.min, 1), Math.max(l.min, l.max))),
            (t = n * e),
            t < 1)
          )
            continue;
          break;
        }
      }
      if (q(t, n, e, o, l)) return { A: t, B: n, C: e, op: o };
    }
    return {
      ...(l.max <= 20 ? { A: 8, B: 4, C: 2 } : { A: 12, B: 4, C: 3 }),
      op: '\xF7',
    };
  }
  function K(f) {
    let l = ['+', '-', '\xD7', '\xF7'];
    for (let r = 0; r < 1e3; r++) {
      let i = L(),
        h = [i.A, i.B, i.C],
        o = !0;
      for (let [t, n] of Object.entries(f))
        if (h[parseInt(t) / 2] !== n) {
          o = !1;
          break;
        }
      if (o && q(i.A, i.B, i.C, i.op)) return i;
    }
    if (Object.keys(f).length === 1) {
      let [r, i] = Object.entries(f)[0],
        h = parseInt(r) / 2;
      for (let o of l) {
        let t, n, e;
        if (h === 0) {
          t = i;
          for (let b = 0; b < 50; b++)
            if (o === '+') {
              if (
                ((n = Math.floor(Math.random() * 40) + 10),
                (e = t + n),
                q(t, n, e, o))
              )
                return { A: t, B: n, C: e, op: o };
            } else if (o === '-') {
              if (
                ((n = Math.floor(Math.random() * Math.min(t - 1, 40)) + 1),
                (e = t - n),
                q(t, n, e, o))
              )
                return { A: t, B: n, C: e, op: o };
            } else if (o === '\xD7') {
              if (
                ((n =
                  Math.floor(Math.random() * Math.min(9, Math.floor(99 / t))) +
                  2),
                (e = t * n),
                q(t, n, e, o))
              )
                return { A: t, B: n, C: e, op: o };
            } else if (o === '\xF7') {
              let k = [];
              for (let a = 2; a <= Math.min(9, t); a++)
                t % a === 0 && k.push(a);
              if (
                k.length > 0 &&
                ((n = k[Math.floor(Math.random() * k.length)]),
                (e = t / n),
                q(t, n, e, o))
              )
                return { A: t, B: n, C: e, op: o };
            }
        } else if (h === 1) {
          n = i;
          for (let b = 0; b < 50; b++)
            if (o === '+') {
              if (
                ((t = Math.floor(Math.random() * (99 - n)) + 10),
                (e = t + n),
                q(t, n, e, o))
              )
                return { A: t, B: n, C: e, op: o };
            } else if (o === '-') {
              if (
                ((t = Math.floor(Math.random() * 40) + n + 10),
                (e = t - n),
                q(t, n, e, o))
              )
                return { A: t, B: n, C: e, op: o };
            } else if (o === '\xD7') {
              if (
                ((t =
                  Math.floor(Math.random() * Math.min(9, Math.floor(99 / n))) +
                  2),
                (e = t * n),
                q(t, n, e, o))
              )
                return { A: t, B: n, C: e, op: o };
            } else if (
              o === '\xF7' &&
              ((e = Math.floor(Math.random() * 10) + 2),
              (t = n * e),
              q(t, n, e, o))
            )
              return { A: t, B: n, C: e, op: o };
        } else if (h === 2) {
          e = i;
          for (let b = 0; b < 50; b++)
            if (o === '+') {
              if (
                ((t = Math.floor(Math.random() * Math.min(e - 10, 50)) + 10),
                (n = e - t),
                n >= 10 && n <= 50)
              )
                return { A: t, B: n, C: e, op: o };
            } else if (o === '-') {
              if (
                ((n = Math.floor(Math.random() * Math.min(30, e - 1)) + 10),
                (t = e + n),
                q(t, n, e, o))
              )
                return { A: t, B: n, C: e, op: o };
            } else if (o === '\xD7') {
              let k = [];
              for (let a = 2; a <= Math.min(9, e); a++)
                e % a === 0 && e / a >= 2 && e / a <= 9 && k.push([a, e / a]);
              if (k.length > 0) {
                let [a, d] = k[Math.floor(Math.random() * k.length)];
                if (q(a, d, e, o)) return { A: a, B: d, C: e, op: o };
              }
            } else if (
              o === '\xF7' &&
              ((n = Math.floor(Math.random() * 8) + 2),
              (t = e * n),
              q(t, n, e, o))
            )
              return { A: t, B: n, C: e, op: o };
        }
      }
    }
    return L();
  }
  function re(f, l) {
    let r = fe(f, l);
    return r ? ie(r, l) : null;
  }
  function ie(f, l) {
    // Technique-based optimization: Remove numbers while maintaining target difficulty
    let { grid: r, equations: i } = f,
      h = [];
    for (let a = 0; a < 24; a++)
      for (let d = 0; d < 24; d++)
        r[a] && r[a][d] && r[a][d].k === 'num' && h.push(`${a},${d}`);
    let o = new Set(h),
      n = 0,
      e = l === 'expert' || l === 'nightmare' ? 1e3 : 500;

    // Remove numbers iteratively while keeping puzzle at target difficulty
    let consecutiveFails = 0;
    const maxConsecutiveFails = 20;  // Stop if we fail to remove 20 numbers in a row

    for (; n < e && consecutiveFails < maxConsecutiveFails; ) {
      n++;
      let a = le(r, i, o, l);
      if (!a) break;  // No more candidates to remove

      if (n % 10 === 0) {
        let d = Math.round((o.size / h.length) * 100);
        typeof window < 'u' &&
          window.stat &&
          (window.stat.textContent = `\u{1F504} Optimizing ${l} difficulty... ${d}% given (attempt ${n})`);
      }

      // Try removing this number
      o.delete(a);

      // Check if still solvable and within difficulty bounds
      let techResult = solveWithTrace(r, i, o);
      let stillValid = techResult.solvable;

      // For easy/medium/hard, reject if puzzle becomes too hard
      if (stillValid) {
        const band = techResult.score.band;
        if (l === 'easy' && band !== 'easy') {
          stillValid = false;
        } else if (l === 'medium' && (band !== 'easy' && band !== 'medium')) {
          stillValid = false;
        } else if (l === 'hard' && (band !== 'easy' && band !== 'medium' && band !== 'hard')) {
          stillValid = false;
        }
        // expert and nightmare can use any techniques
      }

      if (!stillValid) {
        o.add(a);  // Put it back
        consecutiveFails++;  // Increment fail counter
      } else {
        consecutiveFails = 0;  // Reset fail counter on success
      }
    }

    let b = o.size;
    return ((o = ae(r, i, o)), o.size > b, { ...f, optimizedGivens: o });
  }
  function le(f, l, r, i = 'expert') {
    let h = [];
    for (let o of r) {
      let [t, n] = o.split(',').map(Number),
        e = ce(f, l, r, t, n, i);
      e > 0 && h.push({ pos: o, score: e, r: t, c: n });
    }
    return h.length === 0
      ? null
      : (h.sort((o, t) => t.score - o.score), h.length > 0, h[0].pos);
  }
  function ce(f, l, r, i, h, o = 'expert') {
    let t = 0,
      n = [];
    for (let e of l)
      for (let b = 0; b < 5; b += 2) {
        let k = e.across ? e.row : e.row + b,
          a = e.across ? e.col + b : e.col;
        if (k === i && a === h) {
          n.push({ eq: e, position: b });
          break;
        }
      }
    for (let { eq: e, position: b } of n) {
      let k = [];
      for (let u = 0; u < 5; u += 2) {
        let s = e.across ? e.row : e.row + u,
          m = e.across ? e.col + u : e.col;
        s < 24 && m < 24 && k.push(`${s},${m}`);
      }
      let a = k.filter((u) => r.has(u)).length;
      if (o === 'expert') {
        if (a === 1) {
          if (Y(f, l, r, i, h) < 2) return 0;
          t += 30;
        }
      } else if (a <= 1) return 0;
      if (a >= 3) t += 20;
      else if (a === 2) {
        let u = Y(f, l, r, i, h);
        u >= 2 ? (t += 15) : u >= 1 ? (t += 10) : (t += 5);
      }
      (b === 4 && (t += 2), parseInt(f[i][h].ch) > 20 && (t += 1));
    }
    return t;
  }
  function Y(f, l, r, i, h) {
    let o = 0;
    for (let t of l)
      for (let n = 0; n < 5; n += 2) {
        let e = t.across ? t.row : t.row + n,
          b = t.across ? t.col + n : t.col;
        if (e === i && b === h) {
          let k = [];
          for (let d = 0; d < 5; d += 2) {
            let u = t.across ? t.row : t.row + d,
              s = t.across ? t.col + d : t.col;
            u < 24 && s < 24 && k.push(`${u},${s}`);
          }
          k.filter((d) => r.has(d)).length >= 2 && o++;
          break;
        }
      }
    return o;
  }
  function ae(f, l, r) {
    let i = new Set([...r]),
      h = 0;
    for (let o of l) {
      let t = [];
      for (let e = 0; e < 5; e += 2) {
        let b = o.across ? o.row : o.row + e,
          k = o.across ? o.col + e : o.col;
        b < 24 && k < 24 && t.push(`${b},${k}`);
      }
      let n = t.filter((e) => i.has(e)).length;
      if (n === 0) (i.add(t[0]), h++);
      else if (n === 1 && t.length >= 3) {
        let e = 0;
        for (let b of t)
          if (!i.has(b)) {
            let [k, a] = b.split(',').map(Number),
              d = !1;
            for (let u of l)
              if (u !== o) {
                for (let s = 0; s < 5; s += 2) {
                  let m = u.across ? u.row : u.row + s,
                    g = u.across ? u.col + s : u.col;
                  if (m === k && g === a) {
                    d = !0;
                    break;
                  }
                }
                if (d) break;
              }
            d || e++;
          }
        if (e === t.length - n) {
          let b = t.filter((k) => !i.has(k));
          b.length > 0 && (i.add(b[0]), h++);
        }
      }
    }
    return i;
  }
  function fe(f, l = 'expert') {
    let r = Array.from({ length: 24 }, () => Array(24).fill(null)),
      i = [],
      h = 100,
      o = Math.floor(Math.random() * 8) + 8,
      t = Math.floor(Math.random() * 8) + 8,
      n = Math.random() < 0.5,
      e = L(),
      b = [
        { k: 'num', ch: String(e.A) },
        { k: 'op', ch: e.op },
        { k: 'num', ch: String(e.B) },
        { k: 'eq', ch: '=' },
        { k: 'num', ch: String(e.C) },
      ];
    for (let a = 0; a < 5; a++) {
      let d = n ? o : o + a,
        u = n ? t + a : t;
      r[d][u] = { ...b[a], id: 1 };
    }
    i.push({ across: n, row: o, col: t, eq: e });
    for (let a = 2; a <= f; a++) {
      let d = !1;
      for (let u = 0; u < h && !d; u++) {
        let s = [];
        for (let m = 1; m < 23; m++)
          for (let g = 1; g < 23; g++)
            if (r[m][g] && r[m][g].k === 'num')
              for (let x of [!0, !1])
                for (let c = 0; c < 5; c += 2) {
                  let p = x ? m : m - c,
                    y = x ? g - c : g;
                  if (p >= 0 && p < 24 && y >= 0 && y < 24) {
                    let v = !0,
                      w = {},
                      C = 0;
                    for (let M = 0; M < 5; M++) {
                      let z = x ? p : p + M,
                        P = x ? y + M : y;
                      if (z >= 24 || P >= 24) {
                        v = !1;
                        break;
                      }
                      let $ = r[z][P];
                      if ($)
                        if ($.k === 'num') ((w[M] = parseInt($.ch)), C++);
                        else if ($.k === 'op' && M === 1)
                          if (
                            Q()
                              .map((T) => T.symbol)
                              .includes($.ch)
                          )
                            ((w[M] = $.ch), C++);
                          else {
                            v = !1;
                            break;
                          }
                        else if ($.k === 'eq' && M === 3) ((w[M] = $.ch), C++);
                        else if (a <= 5) {
                          v = !1;
                          break;
                        } else {
                          v = !1;
                          break;
                        }
                    }
                    let S;
                    switch (l) {
                      case 'expert':
                        S = (a <= 3, 1);
                        break;
                      case 'hard':
                        S = 1;
                        break;
                      case 'medium':
                      case 'easy':
                        S = (a <= 5, 1);
                        break;
                      default:
                        S = 1;
                    }
                    v &&
                      C >= S &&
                      s.push({
                        row: p,
                        col: y,
                        across: x,
                        constraints: w,
                        intersectionCount: C,
                      });
                  }
                }
        if (s.length > 0) {
          s.sort((w, C) => C.intersectionCount - w.intersectionCount);
          let m;
          switch (l) {
            case 'expert':
              m = 0.4;
              break;
            case 'hard':
              m = 0.6;
              break;
            case 'medium':
              m = 0.8;
              break;
            case 'easy':
              m = 1;
              break;
            default:
              m = 0.5;
          }
          let g = s.slice(0, Math.max(1, Math.ceil(s.length * m))),
            x = g[Math.floor(Math.random() * g.length)],
            c = null,
            p = 0;
          for (; !c && p < 10; ) ((c = K(x.constraints)), p++);
          if (!c && s.length > 1) {
            if (l === 'expert') {
              let w = s.filter((C) => C.intersectionCount > 1);
              if (w.length > 0) {
                let C = w[Math.floor(Math.random() * w.length)];
                c = K(C.constraints);
              }
            }
            if (!c) {
              let w = s.filter((C) => C.intersectionCount === 1);
              if (w.length > 0) {
                let C = w[Math.floor(Math.random() * w.length)];
                c = K(C.constraints);
              }
            }
          }
          c || (c = L());
          let y = [
              { k: 'num', ch: String(c.A) },
              { k: 'op', ch: c.op },
              { k: 'num', ch: String(c.B) },
              { k: 'eq', ch: '=' },
              { k: 'num', ch: String(c.C) },
            ],
            v = !0;
          for (let w = 0; w < 5; w++) {
            let C = x.across ? x.row : x.row + w,
              S = x.across ? x.col + w : x.col;
            if (r[C][S] && r[C][S].k === 'num' && r[C][S].ch !== y[w].ch) {
              v = !1;
              break;
            }
          }
          if (v)
            for (let w = 0; w < 5; w++) {
              let C = x.across ? x.row : x.row + w,
                S = x.across ? x.col + w : x.col;
              r[C][S] || (r[C][S] = { ...y[w], id: a });
            }
          else continue;
          (i.push({ across: x.across, row: x.row, col: x.col, eq: c }),
            (d = !0));
        }
      }
      if (!d) {
        for (let u = 0; u < h && !d; u++) {
          let s = Math.floor(Math.random() * 16) + 4,
            m = Math.floor(Math.random() * 16) + 4,
            g = Math.random() < 0.5,
            x = !0;
          for (let c = 0; c < 5; c++) {
            let p = g ? s : s + c,
              y = g ? m + c : m;
            if (p >= 24 || y >= 24 || r[p][y]) {
              x = !1;
              break;
            }
          }
          if (x) {
            let c = L(),
              p = [
                { k: 'num', ch: String(c.A) },
                { k: 'op', ch: c.op },
                { k: 'num', ch: String(c.B) },
                { k: 'eq', ch: '=' },
                { k: 'num', ch: String(c.C) },
              ];
            for (let y = 0; y < 5; y++) {
              let v = g ? s : s + y,
                w = g ? m + y : m;
              r[v][w] = { ...p[y], id: a };
            }
            (i.push({ across: g, row: s, col: m, eq: c }), (d = !0));
          }
        }
        if (!d)
          for (let u = 0; u < 50 && !d; u++) {
            let s = Math.floor(Math.random() * 20) + 2,
              m = Math.floor(Math.random() * 20) + 2,
              g = Math.random() < 0.5,
              x = !0;
            for (let c = 0; c < 5; c++) {
              let p = g ? s : s + c,
                y = g ? m + c : m;
              if (p >= 24 || y >= 24 || r[p][y]) {
                x = !1;
                break;
              }
            }
            if (x) {
              let c = L(),
                p = [
                  { k: 'num', ch: String(c.A) },
                  { k: 'op', ch: c.op },
                  { k: 'num', ch: String(c.B) },
                  { k: 'eq', ch: '=' },
                  { k: 'num', ch: String(c.C) },
                ];
              for (let y = 0; y < 5; y++) {
                let v = g ? s : s + y,
                  w = g ? m + y : m;
                r[v][w] = { ...p[y], id: a };
              }
              (i.push({ across: g, row: s, col: m, eq: c }), (d = !0));
            }
          }
      }
    }
    let k = 0;
    for (let a of i) {
      let d = [];
      for (let u = 0; u < 5; u += 2) {
        let s = a.across ? a.row : a.row + u,
          m = a.across ? a.col + u : a.col;
        s < 24 && m < 24 && r[s][m] ? d.push(parseInt(r[s][m].ch)) : k++;
      }
      if (d.length === 3) {
        let [u, s, m] = d,
          g = a.across ? r[a.row][a.col + 1].ch : r[a.row + 1][a.col].ch,
          x = !1;
        switch (g) {
          case '+':
            x = u + s === m;
            break;
          case '-':
            x = u - s === m;
            break;
          case '\xD7':
            x = u * s === m;
            break;
          case '\xF7':
            x = s !== 0 && u / s === m;
            break;
        }
        x || k++;
      }
    }
    return (k > 0, { grid: r, equations: i });
  }
  function de(f, l, r) {
    let i = Array.from({ length: 24 }, () => Array(24).fill(null));
    for (let n = 0; n < 24; n++)
      for (let e = 0; e < 24; e++)
        f[n][e] && r.has(`${n},${e}`)
          ? (i[n][e] = f[n][e])
          : f[n][e] &&
            (i[n][e] = {
              k: f[n][e].k,
              ch: f[n][e].k === 'num' ? null : f[n][e].ch,
              id: f[n][e].id,
            });
    let h = !0,
      o = 0,
      t = 10;
    for (; h && o < t; ) {
      ((h = !1), o++);
      let n = !0,
        e = 0,
        b = 20;
      for (; n && e < b; ) {
        ((n = !1), e++);
        for (let k of l) {
          let a = [];
          for (let d = 0; d < 5; d++) {
            let u = k.across ? k.row : k.row + d,
              s = k.across ? k.col + d : k.col;
            u < 24 &&
              s < 24 &&
              i[u][s] &&
              a.push({ r: u, c: s, cell: i[u][s], pos: d });
          }
          if (a.length === 5) {
            let d = a.filter((s) => s.cell.k === 'num'),
              u = a.find((s) => s.cell.k === 'op');
            if (u && d.length >= 2) {
              let s = {},
                m = [];
              for (let g of d)
                g.cell.ch !== null
                  ? (s[g.pos] = parseInt(g.cell.ch))
                  : m.push(g.pos);
              if (Object.keys(s).length === 2 && m.length === 1) {
                let g = u.cell.ch,
                  x = m[0],
                  c = null;
                if (x === 0) {
                  let p = s[2],
                    y = s[4];
                  g === '+'
                    ? (c = y - p)
                    : g === '-'
                      ? (c = y + p)
                      : g === '\xD7'
                        ? (c = p !== 0 ? y / p : null)
                        : g === '\xF7' && (c = y * p);
                } else if (x === 2) {
                  let p = s[0],
                    y = s[4];
                  g === '+'
                    ? (c = y - p)
                    : g === '-'
                      ? (c = p - y)
                      : g === '\xD7'
                        ? (c = p !== 0 ? y / p : null)
                        : g === '\xF7' && (c = p !== 0 ? p / y : null);
                } else if (x === 4) {
                  let p = s[0],
                    y = s[2];
                  g === '+'
                    ? (c = p + y)
                    : g === '-'
                      ? (c = p - y)
                      : g === '\xD7'
                        ? (c = p * y)
                        : g === '\xF7' && (c = y !== 0 ? p / y : null);
                }
                if (c !== null && c > 0 && c <= 99 && Number.isInteger(c)) {
                  let p = a.find((y) => y.pos === x);
                  p &&
                    p.cell.ch === null &&
                    ((p.cell.ch = String(c)), (n = !0), (h = !0));
                }
              }
            }
          }
        }
      }
      for (let k of l) {
        let a = [];
        for (let d = 0; d < 5; d++) {
          let u = k.across ? k.row : k.row + d,
            s = k.across ? k.col + d : k.col;
          u < 24 &&
            s < 24 &&
            i[u][s] &&
            a.push({ r: u, c: s, cell: i[u][s], pos: d });
        }
        if (a.length === 5) {
          let d = a.filter((s) => s.cell.k === 'num');
          if (a.find((s) => s.cell.k === 'op') && d.length >= 1) {
            let s = {},
              m = [];
            for (let g of d)
              g.cell.ch !== null
                ? (s[g.pos] = parseInt(g.cell.ch))
                : m.push(g.pos);
            if (Object.keys(s).length === 1 && m.length === 2)
              for (let g of m) {
                let x = a.find((p) => p.pos === g),
                  c = me(i, l, x.r, x.c);
                if (c && c.length === 1) {
                  ((x.cell.ch = String(c[0])), (h = !0));
                  break;
                }
              }
          }
        }
      }
    }
    for (let n = 0; n < 24; n++)
      for (let e = 0; e < 24; e++)
        if (f[n][e] && f[n][e].k === 'num' && (!i[n][e] || i[n][e].ch === null))
          return !1;
    return !0;
  }
  function me(f, l, r, i) {
    let h = [],
      o = J();
    for (let t = o.min; t <= o.max; t++) {
      let n = !0;
      for (let e of l) {
        let b = !1,
          k = -1;
        for (let a = 0; a < 5; a += 2) {
          let d = e.across ? e.row : e.row + a,
            u = e.across ? e.col + a : e.col;
          if (d === r && u === i) {
            ((b = !0), (k = a));
            break;
          }
        }
        if (b) {
          let a = [];
          for (let d = 0; d < 5; d++) {
            let u = e.across ? e.row : e.row + d,
              s = e.across ? e.col + d : e.col;
            u < 24 &&
              s < 24 &&
              f[u][s] &&
              a.push({ r: u, c: s, cell: f[u][s], pos: d });
          }
          if (a.length === 5) {
            let d = a.filter((s) => s.cell.k === 'num'),
              u = a.find((s) => s.cell.k === 'op');
            if (u && d.length === 3) {
              let s = {},
                m = !1;
              for (let g of d)
                g.r === r && g.c === i
                  ? (s[g.pos] = t)
                  : g.cell.ch !== null
                    ? (s[g.pos] = parseInt(g.cell.ch))
                    : (m = !0);
              if (Object.keys(s).length >= 2 && !m) {
                let g = s[0],
                  x = s[2],
                  c = s[4],
                  p = u.cell.ch;
                if (
                  g !== void 0 &&
                  x !== void 0 &&
                  c !== void 0 &&
                  !se(g, p, x, c)
                ) {
                  n = !1;
                  break;
                }
              }
            }
          }
        }
      }
      n && h.push(t);
    }
    return h;
  }
  function he(f, l, r, trace = null) {
    // Advanced solvability check using constraint-based solving
    // Returns true if unsolvable, false if solvable
    // If trace provided, records techniques used

    // Create working grid with only givens
    let i = Array.from({ length: 24 }, () => Array(24).fill(null));
    for (let n = 0; n < 24; n++)
      for (let e = 0; e < 24; e++)
        f[n][e] && r.has(`${n},${e}`)
          ? (i[n][e] = f[n][e])
          : f[n][e] &&
            (i[n][e] = {
              k: f[n][e].k,
              ch: f[n][e].k === 'num' ? null : f[n][e].ch,
              id: f[n][e].id,
            });

    // Iteratively solve using advanced techniques
    let progress = true, iterations = 0;
    const maxIterations = 50;
    let solveChain = []; // Track chain of deductions for T5_CHAIN_3PLUS

    while (progress && iterations < maxIterations) {
      progress = false;
      iterations++;
      let iterationSolves = 0;

      // Technique 1: Direct solving (2 knowns → solve for 3rd)
      for (let eq of l) {
        let cells = [];
        for (let d = 0; d < 5; d++) {
          let u = eq.across ? eq.row : eq.row + d,
            s = eq.across ? eq.col + d : eq.col;
          u < 24 && s < 24 && i[u][s] && cells.push({ r: u, c: s, cell: i[u][s], pos: d });
        }

        if (cells.length === 5) {
          let nums = cells.filter((c) => c.cell.k === 'num'),
            op = cells.find((c) => c.cell.k === 'op');

          if (op && nums.length >= 2) {
            let knowns = {}, unknowns = [];
            for (let num of nums)
              num.cell.ch !== null ? (knowns[num.pos] = parseInt(num.cell.ch)) : unknowns.push(num.pos);

            if (Object.keys(knowns).length === 2 && unknowns.length === 1) {
              let opCh = op.cell.ch, unknownPos = unknowns[0], value = null;

              if (unknownPos === 0) {
                let mid = knowns[2], res = knowns[4];
                if (opCh === '+') value = res - mid;
                else if (opCh === '-') value = res + mid;
                else if (opCh === '×') value = mid !== 0 ? res / mid : null;
                else if (opCh === '÷') value = res * mid;
              } else if (unknownPos === 2) {
                let left = knowns[0], res = knowns[4];
                if (opCh === '+') value = res - left;
                else if (opCh === '-') value = left - res;
                else if (opCh === '×') value = left !== 0 ? res / left : null;
                else if (opCh === '÷') value = left !== 0 ? left / res : null;
              } else if (unknownPos === 4) {
                let left = knowns[0], mid = knowns[2];
                if (opCh === '+') value = left + mid;
                else if (opCh === '-') value = left - mid;
                else if (opCh === '×') value = left * mid;
                else if (opCh === '÷') value = mid !== 0 ? left / mid : null;
              }

              if (value !== null && value > 0 && value <= 99 && Number.isInteger(value)) {
                let cell = cells.find((c) => c.pos === unknownPos);
                if (cell && cell.cell.ch === null) {
                  cell.cell.ch = String(value);
                  progress = true;
                  iterationSolves++;
                  solveChain.push({ r: cell.r, c: cell.c, tech: 'T2' });
                  if (trace) recordTechnique(trace, Technique.T2_ARITH);
                }
              }
            }
          }
        }
      }

      // Technique 2: Constraint propagation (only 1 valid value)
      for (let eq of l) {
        let cells = [];
        for (let d = 0; d < 5; d++) {
          let u = eq.across ? eq.row : eq.row + d,
            s = eq.across ? eq.col + d : eq.col;
          u < 24 && s < 24 && i[u][s] && cells.push({ r: u, c: s, cell: i[u][s], pos: d });
        }

        if (cells.length === 5) {
          let nums = cells.filter((c) => c.cell.k === 'num');
          if (cells.find((c) => c.cell.k === 'op') && nums.length >= 1) {
            let knowns = {}, unknowns = [];
            for (let num of nums)
              num.cell.ch !== null ? (knowns[num.pos] = parseInt(num.cell.ch)) : unknowns.push(num.pos);

            if (Object.keys(knowns).length === 1 && unknowns.length === 2) {
              for (let unknownPos of unknowns) {
                let cell = cells.find((c) => c.pos === unknownPos);
                let possibleVals = me(i, l, cell.r, cell.c);

                if (possibleVals && possibleVals.length === 1) {
                  cell.cell.ch = String(possibleVals[0]);
                  progress = true;
                  iterationSolves++;

                  // Check if this required cross-equation analysis (T3_SUBST)
                  // by seeing if the cell crosses multiple equations
                  let crossCount = 0;
                  for (let checkEq of l) {
                    for (let d = 0; d < 5; d += 2) {
                      let cr = checkEq.across ? checkEq.row : checkEq.row + d,
                          cc = checkEq.across ? checkEq.col + d : checkEq.col;
                      if (cr === cell.r && cc === cell.c) crossCount++;
                    }
                  }

                  solveChain.push({ r: cell.r, c: cell.c, tech: crossCount > 1 ? 'T3' : 'T1' });
                  if (trace) {
                    if (crossCount > 1) {
                      recordTechnique(trace, Technique.T3_SUBST);
                    } else {
                      recordTechnique(trace, Technique.T1_SINGLE);
                    }
                  }
                  break;
                }
              }
            }
          }
        }
      }

      // After each iteration, check for long dependency chains (T5_CHAIN_3PLUS)
      if (trace && iterationSolves >= 3) {
        // If we solved 3+ cells in one iteration, likely a chain
        // Check if any form a dependency chain
        let chainLen = iterationSolves;
        if (chainLen >= 3) {
          recordTechnique(trace, Technique.T5_CHAIN_3PLUS, chainLen);
        }
      }
    }

    // Check if all numbers are solved
    for (let n = 0; n < 24; n++)
      for (let e = 0; e < 24; e++)
        if (f[n][e] && f[n][e].k === 'num' && (!i[n][e] || i[n][e].ch === null))
          return true; // Unsolvable

    return false; // Solvable
  }
  function ge(f, l) {
    let { grid: r, equations: i, optimizedGivens: h } = f,
      o = h || new Set(),
      t = [];
    for (let c = 0; c < 24; c++)
      for (let p = 0; p < 24; p++) r[c][p] && t.push({ r: c, c: p });
    let n = Math.min(...t.map((c) => c.r)),
      e = Math.max(...t.map((c) => c.r)),
      b = Math.min(...t.map((c) => c.c)),
      k = Math.max(...t.map((c) => c.c)),
      a = e - n + 1,
      d = k - b + 1,
      u = Math.min(32, Math.floor(320 / Math.max(a, d))),
      s = d * u,
      m = a * u;
    (B.setAttribute('viewBox', `0 0 ${s} ${m}`),
      B.setAttribute('width', s),
      B.setAttribute('height', m),
      (B.innerHTML = ''));
    for (let c = n; c <= e; c++)
      for (let p = b; p <= k; p++) {
        let y = (p - b) * u,
          v = (c - n) * u,
          w = r[c][p];
        if (w) {
          B.appendChild(
            U('rect', {
              x: y,
              y: v,
              width: u,
              height: u,
              fill: '#fff',
              stroke: '#000',
              'stroke-width': 2,
            }),
          );
          let C = w.ch;
          w.k === 'num' && !O.checked && (C = o.has(`${c},${p}`) ? w.ch : '');
          let S = Math.max(12, C.length >= 2 ? u * 0.5 : u * 0.7),
            M = U('text', {
              x: y + u / 2,
              y: v + u / 2 + S / 4,
              'text-anchor': 'middle',
              'dominant-baseline': 'middle',
              'font-size': S,
              'font-family': 'Arial, sans-serif',
              'font-weight': 'bold',
            });
          ((M.textContent = C), B.appendChild(M));
        }
      }
    (B.appendChild(
      U('rect', {
        x: 0,
        y: 0,
        width: s,
        height: m,
        fill: 'none',
        stroke: '#000',
        'stroke-width': 3,
      }),
    ),
      (document.getElementById('grid').style.display = 'none'),
      be(r, o, n, e, b, k),
      xe(r, o, n, e, b, k));
    let g = [];
    for (let c = 0; c < 24; c++)
      for (let p = 0; p < 24; p++)
        r[c][p] && r[c][p].k === 'num' && g.push({ r: c, c: p });
    return { numTotal: g.length, actualGivens: o.size };
  }
  function be(f, l, r, i, h, o) {
    let t = document.getElementById('screenGrid'),
      n = document.createElement('div');
    n.className = 'print-grid';
    let e = 24,
      b = (o - h + 1) * e,
      k = (i - r + 1) * e;
    ((n.style.width = b + 'px'), (n.style.height = k + 'px'));
    let a = 0;
    for (let d = r; d <= i; d++)
      for (let u = h; u <= o; u++) {
        let s = f[d][u];
        if (s) {
          let m = document.createElement('div');
          m.className = 'print-cell screen-view';
          let g = (u - h) * e,
            x = (d - r) * e;
          ((m.style.left = g + 'px'),
            (m.style.top = x + 'px'),
            (m.style.width = e + 'px'),
            (m.style.height = e + 'px'),
            (m.style.fontSize = Math.floor(e * 0.6) + 'px'),
            (f[d] && f[d][u + 1]) || m.classList.add('border-right'),
            (f[d + 1] && f[d + 1][u]) || m.classList.add('border-bottom'));
          let y = s.ch,
            v = !1;
          if (
            (s.k === 'num' &&
              !O.checked &&
              ((v = l.has(`${d},${u}`)), (y = v ? s.ch : '')),
            (m.textContent = y),
            s.k === 'op')
          )
            switch (s.ch) {
              case '+':
                m.classList.add('op-add');
                break;
              case '-':
                m.classList.add('op-sub');
                break;
              case '\xD7':
                m.classList.add('op-mul');
                break;
              case '\xF7':
                m.classList.add('op-div');
                break;
            }
          else
            s.k === 'eq'
              ? m.classList.add('op-eq')
              : s.k === 'num' &&
                (v && !O.checked
                  ? m.classList.add('given')
                  : m.classList.add(a % 2 === 0 ? 'num-even' : 'num-odd'),
                a++);
          n.appendChild(m);
        }
      }
    ((t.innerHTML = ''), t.appendChild(n));
  }
  function xe(f, l, r, i, h, o) {
    let t = document.getElementById('printGrid'),
      n = document.createElement('div');
    n.className = 'print-grid';
    let e = i - r + 1,
      b = o - h + 1,
      k = 175,
      a = 250,
      d = 225,
      u = 175,
      s = 3.78,
      m = Math.floor((k * s) / b),
      g = Math.floor((a * s) / e),
      x = Math.min(m, g),
      c = Math.floor((d * s) / b),
      p = Math.floor((u * s) / e),
      y = Math.min(c, p),
      v = Math.max(Math.floor(x * 0.9), Math.floor(y * 0.9), 23),
      w = x >= y;
    ((window.printOrientation = w ? 'portrait' : 'landscape'),
      (window.printCellSize = v));
    let C = (o - h + 1) * v,
      S = (i - r + 1) * v;
    ((n.style.width = C + 'px'), (n.style.height = S + 'px'));
    for (let M = r; M <= i; M++)
      for (let z = h; z <= o; z++) {
        let P = f[M][z];
        if (P) {
          let $ = document.createElement('div');
          $.className = 'print-cell';
          let T = window.printCellSize || cellSize,
            ee = (z - h) * T,
            te = (M - r) * T;
          (($.style.left = ee + 'px'),
            ($.style.top = te + 'px'),
            ($.style.width = T + 'px'),
            ($.style.height = T + 'px'),
            ($.style.fontSize = Math.max(12, Math.floor(T * 0.4)) + 'px'),
            (f[M] && f[M][z + 1]) || $.classList.add('border-right'),
            (f[M + 1] && f[M + 1][z]) || $.classList.add('border-bottom'));
          let X = P.ch;
          (P.k === 'num' && !O.checked && (X = l.has(`${M},${z}`) ? P.ch : ''),
            ($.textContent = X),
            n.appendChild($));
        }
      }
    ((t.innerHTML = ''), t.appendChild(n));
  }
  function N() {
    (R('mx_eq', A.value),
      R('mx_diff', j.value),
      R('mx_range', F.value),
      R(
        'mx_ops',
        JSON.stringify({
          add: W.checked,
          sub: V.checked,
          mul: _.checked,
          div: D.checked,
        }),
      ));
  }
  var genBtn = document.getElementById('gen');
  function I(f = !1) {
    generationId++;
    const currentGenerationId = generationId;
    let l = j.value || 'medium';
    ((E.textContent = `\u{1F504} Generating ${l} puzzle... (this may take longer for precise difficulty targeting)`),
      (E.style.background = '#fff3cd'),
      (E.style.color = '#856404'),
      (E.style.border = '2px solid #ffeeba'),
      setTimeout(async () => {
        let r = parseInt(A.value) || 30,
          i = j.value || 'medium';
        if (Q().length === 0) {
          ((E.textContent =
            '\u26A0\uFE0F Please select at least one operation!'),
            (E.style.background = '#f8d7da'),
            (E.style.color = '#721c24'),
            (E.style.border = '2px solid #f5c6cb'));
          return;
        }
        N();
        let o = {
            nightmare: { min: 1, max: 30 },
            expert: { min: 5, max: 35 },
            hard: { min: 35, max: 50 },
            medium: { min: 55, max: 65 },
            easy: { min: 65, max: 75 },
          },
          t = o[i] || o.medium,
          n = 0,
          e = null,
          b = null,
          k = 0,
          foundValid = false,
          a = () => {
            if (!document.getElementById('spinnerStyles')) {
              let v = document.createElement('style');
              ((v.id = 'spinnerStyles'),
                (v.textContent = `
          .puzzle-spinner-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            background: rgba(248, 249, 250, 0.8);
            border-radius: 12px;
            border: 2px dashed #dee2e6;
          }
          .puzzle-spinner {
            width: 60px;
            height: 60px;
            border: 6px solid #f3f3f3;
            border-top: 6px solid #007bff;
            border-radius: 50%;
            animation: spin 1.2s linear infinite;
            margin-bottom: 20px;
          }
          .spinner-text {
            font-size: 16px;
            color: #6c757d;
            font-weight: 500;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `),
                document.head.appendChild(v));
            }
            let x = document.createElement('div');
            ((x.className = 'puzzle-spinner-container'),
              (x.id = 'puzzleSpinnerContainer'));
            let c = document.createElement('div');
            c.className = 'puzzle-spinner';
            let p = document.createElement('div');
            ((p.className = 'spinner-text'),
              (p.id = 'spinnerText'),
              (p.textContent = 'Generating puzzle...'),
              x.appendChild(c),
              x.appendChild(p));
            let y = document.getElementById('screenGrid');
            y && y.parentNode && y.parentNode.insertBefore(x, y);
          },
          d = () => {
            let x = document.getElementById('puzzleSpinnerContainer');
            x && x.remove();
          },
          u = document.getElementById('grid'),
          s = document.getElementById('screenGrid'),
          m = document.getElementById('printGrid'),
          g = document.getElementById('ans');
        for (
          u && (u.style.display = 'none'),
            s && (s.style.display = 'none'),
            m && (m.style.display = 'none'),
            g && (g.style.display = 'none'),
            a();
          n < 500;

        ) {
          n++;
          let x = document.getElementById('spinnerText');
          (x &&
            (x.textContent = `Generating ${i} puzzle... (attempt ${n}/500)`),
            (E.textContent = `\u{1F504} Targeting ${t.min}-${t.max}% difficulty (attempt ${n}/500)`),
            await new Promise((c) => setTimeout(c, 10)));
          if (currentGenerationId !== generationId) {
            d();
            return;
          }
          try {
            let c = re(r, i);
            if (!c) continue;
            let p = ge(c, i),
              y = Math.round((p.actualGivens / p.numTotal) * 100);

            // NEW: Technique-based difficulty scoring
            const techResult = solveWithTrace(c.grid, c.equations, c.optimizedGivens || new Set());
            const techScore = techResult.score;

            // Debug logging
            if (typeof window !== 'undefined' && window.console && n % 10 === 0) {
              const ts = techScore.details;
              console.log(`Attempt ${n}: %=${y}, band=${techScore.band}, raw=${techScore.raw}, T1=${ts.counts.T1_SINGLE}, T2=${ts.counts.T2_ARITH}, T3=${ts.counts.T3_SUBST}, T4=${ts.counts.T4_ELIM_2X2}, T5=${ts.counts.T5_CHAIN_3PLUS}, chain=${ts.maxChainLen}, total=${ts.counts.T1_SINGLE + ts.counts.T2_ARITH + ts.counts.T3_SUBST + ts.counts.T4_ELIM_2X2 + ts.counts.T5_CHAIN_3PLUS}`);
            }

            // Accept if technique band matches (technique-only scoring)
            const techniqueMatch = techScore.band === i;

            if (techniqueMatch) {
              ((e = c), (b = p), (k = y), (foundValid = true));
              // Store technique score for display
              b.techniqueScore = techScore;
              break;
            } else
              (!e ||
                Math.abs(y - (t.min + t.max) / 2) <
                  Math.abs(k - (t.min + t.max) / 2)) &&
                ((e = c), (b = p), (k = y));
          } catch (err) {
            if (typeof window !== 'undefined' && window.console) {
              console.error('Generation error:', err);
            }
            continue;
          }
        }
        if (
          (d(),
          foundValid &&
            e &&
            b &&
            (s && (s.style.display = ''),
            g && (g.style.display = ''),
            m && (m.style.display = 'none')),
          foundValid && e && b)
        ) {
          let x = J();
          let techInfo = '';
          if (b.techniqueScore) {
            const ts = b.techniqueScore;
            techInfo = ` | Tech: ${ts.band}(raw=${ts.raw}, T1=${ts.details.counts.T1_SINGLE}, T2=${ts.details.counts.T2_ARITH}, T3=${ts.details.counts.T3_SUBST})`;
          }
          ((E.style.background = '#d4edda'),
            (E.style.color = '#155724'),
            (E.style.border = '2px solid #c3e6cb'),
            (E.textContent = `\u2705 Generated ${i.charAt(0).toUpperCase() + i.slice(1)} puzzle (${x.min}-${x.max}) with ${e.equations.length} equations, showing ${b.actualGivens}/${b.numTotal} numbers (${k}%)${techInfo} [attempt ${n}]`),
            f && setTimeout(() => window.print(), 100));
        } else {
          ((E.textContent =
            '\u26A0\uFE0F Could not generate puzzle at target difficulty after 500 attempts. Try different settings.'),
            (E.style.background = '#f8d7da'),
            (E.style.color = '#721c24'),
            (E.style.border = '2px solid #f5c6cb'));
          return;
        }
      }, 10));
  }
  function ye() {
    let f = window.open('', '_blank', 'width=800,height=600'),
      l = i(),
      r = window.printOrientation || 'portrait';
    function i() {
      let h = document.getElementById('printGrid');
      if (!h || !h.firstChild) return '<div>No puzzle generated</div>';
      let o = h.firstChild.cloneNode(!0),
        t = o.querySelectorAll('.print-cell'),
        n = 0;
      return (
        t.forEach((e) => {
          let b = e.textContent.trim();
          if (['+', '-', '\xD7', '\xF7'].includes(b))
            switch (b) {
              case '+':
                e.classList.add('op-add');
                break;
              case '-':
                e.classList.add('op-sub');
                break;
              case '\xD7':
                e.classList.add('op-mul');
                break;
              case '\xF7':
                e.classList.add('op-div');
                break;
            }
          else
            b === '='
              ? e.classList.add('op-eq')
              : b &&
                !isNaN(b) &&
                (e.style.fontSize && parseInt(e.style.fontSize) > 15
                  ? e.classList.add('given')
                  : e.classList.add(n % 2 === 0 ? 'num-even' : 'num-odd'),
                n++);
        }),
        o.outerHTML
      );
    }
    (f.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Math Crossword - Color Print</title>
      <style>
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        body {
          margin: 20px;
          font-family: Arial, sans-serif;
          background: white;
        }

        .print-grid {
          position: relative;
          margin: 0 auto;
          font-family: Arial, sans-serif;
        }

        .print-cell {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          box-sizing: border-box;
          border-top: 1px solid #666;
          border-left: 1px solid #666;
        }

        .print-cell.border-right {
          border-right: 1px solid #666;
        }

        .print-cell.border-bottom {
          border-bottom: 1px solid #666;
        }

        .print-cell.op-add {
          background: #e8f5e8 !important;
          color: #4a7c59 !important;
        }
        .print-cell.op-sub {
          background: #fff3e0 !important;
          color: #8d4004 !important;
        }
        .print-cell.op-mul {
          background: #f3e5f5 !important;
          color: #6a1b9a !important;
        }
        .print-cell.op-div {
          background: #e3f2fd !important;
          color: #1565c0 !important;
        }
        .print-cell.op-eq {
          background: #fce4ec !important;
          color: #ad1457 !important;
        }
        .print-cell.num-even {
          background: #f8f9fa !important;
          color: #495057 !important;
        }
        .print-cell.num-odd {
          background: #f1f8e9 !important;
          color: #2e7d32 !important;
        }
        .print-cell.given {
          background: #fff8e1 !important;
          color: #f57c00 !important;
          font-weight: 900 !important;
        }

        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          @page {
            size: A4 ${r};
            margin: 10mm 10mm 13.5mm 10mm; /* top right bottom left */
          }
        }
      </style>
    </head>
    <body>
      <h2 style="text-align: center; margin-bottom: 20px;">Math Crossword Puzzle</h2>
      ${l}
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 100);
        };
      <\/script>
    </body>
    </html>
  `),
      f.document.close());
  }
  document.getElementById('gen').addEventListener('click', () => I(!1));
  document.getElementById('printColor').addEventListener('click', () => ye());
  A.addEventListener('input', () => {
    ((Z.textContent = A.value), N());
  });
  j.addEventListener('change', () => {
    N();
  });
  F.addEventListener('change', () => {
    N();
  });
  W.addEventListener('change', () => {
    N();
  });
  V.addEventListener('change', () => {
    N();
  });
  _.addEventListener('change', () => {
    N();
  });
  D.addEventListener('change', () => {
    N();
  });
  oe();
  I(!1);
})();
