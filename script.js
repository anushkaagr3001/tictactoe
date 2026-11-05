(() => {
'use strict';

// ---------- Config & storage ----------
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const KEY = 'ttt-advanced-v2';
const DEF = { mode: 'ai', size: 3, diff: 'medium', me: 'X' };
const WINLEN = { 3: 3, 4: 4, 5: 4 };   // symbols in a row needed to win
const DEPTH = { 3: 9, 4: 5, 5: 3 };    // search depth (3x3 = perfect play)
const cfg = { ...DEF };
let store = { scores: {}, mute: false };
try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d && typeof d === 'object') { store = { scores: {}, mute: false, ...d }; Object.assign(cfg, d.cfg); }
} catch (e) { /* storage unavailable: run without saving */ }
const save = () => { store.cfg = cfg; try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} };

// ---------- State ----------
let S, lines, order, cells = [], timer = null, token = 0, ac = null;
const other = p => (p === 'X' ? 'O' : 'X');
const pl = j => (j % 2 ? 'O' : 'X');                       // X always moves first
const isAI = p => cfg.mode === 'ai' && p !== cfg.me;
const key = () => (cfg.mode === 'ai' ? `ai-${cfg.size}-${cfg.diff}` : `pvp-${cfg.size}`);
const sc = () => store.scores[key()] || (store.scores[key()] = { a: 0, b: 0, d: 0, st: 0, bs: 0 });

// ---------- Board geometry ----------
function build() {
    const n = cfg.size, k = WINLEN[n], m = (n - 1) / 2;
    lines = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++)
        for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
            const er = r + dr * (k - 1), ec = c + dc * (k - 1);
            if (er >= n || ec < 0 || ec >= n) continue;
            lines.push(Array.from({ length: k }, (_, i) => (r + dr * i) * n + c + dc * i));
        }
    const dist = i => Math.hypot(Math.floor(i / n) - m, (i % n) - m);
    order = [...Array(n * n).keys()].sort((a, b) => dist(a) - dist(b)); // centre first = better pruning
    const bd = $('#board');
    bd.style.setProperty('--n', n);
    bd.innerHTML = '';
    cells = Array.from({ length: n * n }, (_, i) => {
        const b = document.createElement('button');
        b.className = 'cell'; b.dataset.i = i; bd.appendChild(b); return b;
    });
    $('#rule').textContent = `${k} IN A ROW TO WIN`;
}

// ---------- AI ----------
const winnerOf = b => {
    for (const l of lines) { const v = b[l[0]]; if (v && l.every(i => b[i] === v)) return { p: v, line: l }; }
    return null;
};
function evaluate(b, me) {
    let s = 0;
    for (const l of lines) {
        let a = 0, h = 0;
        for (const i of l) { if (b[i] === me) a++; else if (b[i]) h++; }
        if (a && h) continue;
        if (a) s += 10 ** a; else if (h) s -= 10 ** h;
    }
    return s;
}
function search(b, d, alpha, beta, turn, me, maxD) {
    const w = winnerOf(b);
    if (w) return w.p === me ? 100000 - d : d - 100000;   // faster wins / slower losses preferred
    if (b.every(Boolean)) return 0;
    if (d >= maxD) return evaluate(b, me);
    const max = turn === me;
    let best = max ? -Infinity : Infinity;
    for (const i of order) {
        if (b[i]) continue;
        b[i] = turn;
        const v = search(b, d + 1, alpha, beta, other(turn), me, maxD);
        b[i] = '';
        if (max) { if (v > best) best = v; if (v > alpha) alpha = v; }
        else { if (v < best) best = v; if (v < beta) beta = v; }
        if (beta <= alpha) break;
    }
    return best;
}
function best(b, who, maxD) {            // random choice among equally-best moves
    let top = -Infinity, pool = [];
    for (const i of order) {
        if (b[i]) continue;
        b[i] = who;
        const v = search(b, 1, -Infinity, Infinity, other(who), who, maxD);
        b[i] = '';
        if (v > top) { top = v; pool = [i]; } else if (v === top) pool.push(i);
    }
    return pool[Math.floor(Math.random() * pool.length)];
}
function pick() {
    const b = S.b.slice(), free = order.filter(i => !b[i]);
    const rnd = () => free[Math.floor(Math.random() * free.length)];
    if (cfg.diff === 'easy') return rnd();
    if (cfg.diff === 'medium') return Math.random() < 0.7 ? best(b, S.turn, 2) : rnd();
    return best(b, S.turn, DEPTH[cfg.size]);
}

// ---------- Game flow ----------
function newRound() {
    clearTimeout(timer); token++;        // cancels any pending AI move (fixes stale-timeout bug)
    S = { b: Array(cfg.size ** 2).fill(''), turn: 'X', over: false, busy: false, hist: [], line: null, hint: -1 };
    render(); maybeAI();
}
function play(i) {
    if (!S || S.over || S.busy || S.b[i] || isAI(S.turn)) return;
    place(i);
}
function place(i) {
    S.b[i] = S.turn; S.hist.push(i); S.hint = -1;
    sfx(S.turn === 'X' ? 520 : 390);
    const w = winnerOf(S.b);
    if (w) finish(w);
    else if (S.b.every(Boolean)) finish(null);
    else S.turn = other(S.turn);
    render(); maybeAI();
}
function maybeAI() {
    if (S.over || !isAI(S.turn)) return;
    S.busy = true; render();
    const t = token;
    timer = setTimeout(() => {
        if (t !== token || S.over) return;
        const m = pick(); S.busy = false; place(m);
    }, 450);
}
function finish(w) {
    S.over = true; S.line = w ? w.line : null;
    const s = sc(), ai = cfg.mode === 'ai';
    if (!w) { s.d++; sfx(200, .3); }
    else {
        const a = ai ? w.p === cfg.me : w.p === 'X';
        if (a) { s.a++; s.st++; s.bs = Math.max(s.bs, s.st); } else { s.b++; s.st = 0; }
        [0, 1, 2].forEach(i => setTimeout(() => sfx(a || !ai ? [523, 659, 784][i] : 400 - i * 70, .15), i * 120));
    }
    save();
}
function undo() {
    if (S.over || S.busy || !S.hist.length) return;
    if (cfg.mode === 'pvp') S.b[S.hist.pop()] = '';
    else {
        if (!S.hist.some((_, j) => pl(j) === cfg.me)) return;
        let last;
        do { last = S.hist.length - 1; S.b[S.hist.pop()] = ''; } while (pl(last) !== cfg.me);
    }
    S.turn = S.hist.length % 2 ? 'O' : 'X'; S.hint = -1; S.line = null;
    render();
}
function hint() {
    if (S.over || S.busy || isAI(S.turn)) return;
    S.hint = best(S.b.slice(), S.turn, DEPTH[cfg.size]);
    render();
}

// ---------- Rendering ----------
function render() {
    const n = cfg.size, last = S.hist[S.hist.length - 1];
    const humanTurn = !S.over && !S.busy && !isAI(S.turn);
    cells.forEach((c, i) => {
        const v = S.b[i];
        c.className = 'cell' + (v ? ' ' + v.toLowerCase() : '') + (S.line && S.line.includes(i) ? ' win' : '')
            + (i === S.hint ? ' hint' : '') + (i === last && !S.over ? ' last' : '');
        c.textContent = v; c.disabled = !!v || !humanTurn;
        c.setAttribute('aria-label', `Row ${Math.floor(i / n) + 1}, column ${(i % n) + 1}: ${v || 'empty'}`);
    });
    const s = sc(), ai = cfg.mode === 'ai', symA = ai ? cfg.me : 'X', symB = other(symA);
    $('#symA').textContent = symA; $('#symA').className = 'symbol ' + symA.toLowerCase();
    $('#symB').textContent = symB; $('#symB').className = 'symbol ' + symB.toLowerCase();
    $('#lblA').textContent = ai ? 'YOU' : 'P1'; $('#lblB').textContent = ai ? 'AI' : 'P2';
    $('#scoreA').textContent = s.a; $('#scoreB').textContent = s.b; $('#scoreD').textContent = s.d;
    $('#boxA').classList.toggle('on', !S.over && S.turn === symA);
    $('#boxB').classList.toggle('on', !S.over && S.turn === symB);
    let t;
    if (S.over) {
        const w = S.line && S.b[S.line[0]];
        t = !w ? "IT'S A DRAW" : !ai ? `PLAYER ${w === 'X' ? 1 : 2} WINS!` : w === cfg.me ? 'YOU WIN! 🎉' : 'AI WINS';
    } else if (S.busy) t = 'AI IS THINKING…';
    else t = ai ? `YOUR TURN (${cfg.me})` : `PLAYER ${S.turn === 'X' ? 1 : 2} · ${S.turn}`;
    $('#status').textContent = t;
    $('#streak').textContent = ai && s.bs ? `🔥 STREAK ${s.st} · BEST ${s.bs}` : '';
    $('#undoBtn').disabled = S.over || S.busy || !S.hist.some((_, j) => cfg.mode === 'pvp' || pl(j) === cfg.me);
    $('#hintBtn').disabled = !humanTurn;
    $('#nextBtn').classList.toggle('pulse', S.over);
    $('#muteBtn').textContent = store.mute ? '🔇' : '🔊';
}
function sync() {
    $$('.seg').forEach(seg => {
        const k = seg.dataset.key;
        [...seg.children].forEach(b => {
            const on = b.dataset.v === String(cfg[k]);
            b.classList.toggle('active', on); b.setAttribute('aria-pressed', on);
        });
    });
    $('#diffRow').hidden = $('#meRow').hidden = cfg.mode === 'pvp';
}
function sfx(f, d = .09) {
    if (store.mute) return;
    try {
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
        o.frequency.value = f; g.gain.setValueAtTime(.08, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
        o.connect(g); g.connect(ac.destination); o.start(); o.stop(t + d);
    } catch (e) {}
}

// ---------- Events ----------
$('#board').addEventListener('click', e => { const c = e.target.closest('.cell'); if (c) play(+c.dataset.i); });
$$('.seg').forEach(seg => seg.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const k = seg.dataset.key, v = k === 'size' ? +b.dataset.v : b.dataset.v;
    if (cfg[k] === v) return;
    cfg[k] = v; sync(); if (k === 'size') build(); save(); newRound();
}));
$('#undoBtn').addEventListener('click', undo);
$('#hintBtn').addEventListener('click', hint);
$('#nextBtn').addEventListener('click', newRound);
$('#resetBtn').addEventListener('click', () => { store.scores[key()] = { a: 0, b: 0, d: 0, st: 0, bs: 0 }; save(); newRound(); });
$('#muteBtn').addEventListener('click', () => { store.mute = !store.mute; save(); render(); });
document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === 'u') undo(); else if (k === 'h') hint(); else if (k === 'r') newRound();
    else if (cfg.size === 3 && /^[1-9]$/.test(k)) play(+k - 1);
});

// ---------- Init (validates saved settings) ----------
$$('.seg').forEach(seg => {
    const k = seg.dataset.key;
    if (![...seg.children].some(b => b.dataset.v === String(cfg[k]))) cfg[k] = DEF[k];
});
cfg.size = +cfg.size;
sync(); build(); newRound();
})();
