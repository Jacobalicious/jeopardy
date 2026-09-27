// Shared between the host screen and the TV screen:
// game state, syncing between the two windows, sounds, the wheel and the coin.

const STATE_KEY = "jeopardy-state-v1";
const EVENT_KEY = "jeopardy-event-v1";
const CHANNEL = "jeopardy-sync-v1";

const SPIN_MS = 6000;
const COIN_MS = 3200;

function freshState() {
  return {
    gameId: window.GAMES[0].id,
    players: [
      { id: uid(), name: "Player 1", score: 0 },
      { id: uid(), name: "Player 2", score: 0 },
      { id: uid(), name: "Player 3", score: 0 },
    ],
    used: {},
    firstAnswer: null,
    firstQuestion: null,
    screen: { type: "splash" },
  };
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return freshState();
}

function findGame(id) {
  return window.GAMES.find((g) => g.id === id) || window.GAMES[0];
}

function clueKey(gameId, c, r) {
  return gameId + ":" + c + ":" + r;
}

function clueValue(r) {
  return (r + 1) * 100;
}

// ---------- Sync ----------
// The host window is the boss. It saves state to localStorage and shouts it on a
// BroadcastChannel. The TV window just listens and redraws. Both paths are used
// because some browsers are picky about one or the other when opened as a file.

const Sync = (() => {
  let bc = null;
  try {
    bc = new BroadcastChannel(CHANNEL);
  } catch (e) {}
  const seen = new Set();

  function publish(state) {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (e) {}
    if (bc) bc.postMessage({ type: "state", state });
  }

  function event(ev) {
    ev.id = uid();
    try {
      localStorage.setItem(EVENT_KEY, JSON.stringify(ev));
    } catch (e) {}
    if (bc) bc.postMessage({ type: "event", ev });
  }

  function listen(onState, onEvent) {
    const handleEvent = (ev) => {
      if (!ev || seen.has(ev.id)) return;
      seen.add(ev.id);
      onEvent(ev);
    };
    if (bc) {
      bc.onmessage = (m) => {
        if (m.data.type === "state") onState(m.data.state);
        if (m.data.type === "event") handleEvent(m.data.ev);
      };
    }
    window.addEventListener("storage", (e) => {
      try {
        if (e.key === STATE_KEY && e.newValue) onState(JSON.parse(e.newValue));
        if (e.key === EVENT_KEY && e.newValue) handleEvent(JSON.parse(e.newValue));
      } catch (err) {}
    });
  }

  return { publish, event, listen };
})();

// ---------- Sounds (all made from scratch, no audio files) ----------

const Sfx = (() => {
  let ctx = null;
  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, start, dur, type = "sine", vol = 0.3, slideTo = null) {
    const a = ac();
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, a.currentTime + start);
    if (slideTo) o.frequency.linearRampToValueAtTime(slideTo, a.currentTime + start + dur);
    g.gain.setValueAtTime(0.0001, a.currentTime + start);
    g.gain.exponentialRampToValueAtTime(vol, a.currentTime + start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + start + dur);
    o.connect(g).connect(a.destination);
    o.start(a.currentTime + start);
    o.stop(a.currentTime + start + dur + 0.05);
  }

  function noise(start, dur, vol = 0.3, lowpass = 2000) {
    const a = ac();
    const len = Math.floor(a.sampleRate * dur);
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = a.createBufferSource();
    src.buffer = buf;
    const f = a.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = lowpass;
    const g = a.createGain();
    g.gain.value = vol;
    src.connect(f).connect(g).connect(a.destination);
    src.start(a.currentTime + start);
  }

  const sounds = {
    ding() {
      tone(1568, 0, 1.2, "sine", 0.35);
      tone(3136, 0, 0.6, "sine", 0.1);
    },
    buzzer() {
      tone(110, 0, 0.7, "sawtooth", 0.25);
      tone(116, 0, 0.7, "square", 0.12);
    },
    correct() {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.35, "triangle", 0.25));
    },
    sad() {
      tone(392, 0, 0.45, "sawtooth", 0.15, 370);
      tone(370, 0.45, 0.45, "sawtooth", 0.15, 349);
      tone(349, 0.9, 0.45, "sawtooth", 0.15, 330);
      tone(330, 1.35, 1.1, "sawtooth", 0.15, 290);
    },
    airhorn() {
      for (let i = 0; i < 3; i++) {
        tone(466, i * 0.3, 0.25, "sawtooth", 0.2);
        tone(470, i * 0.3, 0.25, "square", 0.1);
      }
    },
    tick() {
      tone(2200, 0, 0.03, "square", 0.08);
    },
    whoosh() {
      noise(0, 0.5, 0.25, 1200);
    },
    roar() {
      noise(0, 1.6, 0.5, 500);
      tone(80, 0, 1.6, "sawtooth", 0.25, 45);
    },
    drumroll() {
      for (let i = 0; i < 26; i++) noise(i * 0.1, 0.08, 0.15 + i * 0.01, 800);
    },
    reveal() {
      tone(784, 0, 0.2, "triangle", 0.2);
      tone(1175, 0.12, 0.5, "triangle", 0.2);
    },
  };

  function play(name) {
    try {
      if (sounds[name]) sounds[name]();
    } catch (e) {}
  }

  return { play, unlock: ac };
})();

// ---------- Wheel ----------

const WHEEL_COLORS = {
  good: ["#1bb35b", "#0f7a3d", "#27d06e", "#0c5f30"],
  bad: ["#d7263d", "#8e1224", "#f24b5e", "#5e0b18"],
};

// Deterministic "random" number from a seed, so both screens agree on the wobble.
function seeded(n) {
  const x = Math.sin(n) * 10000;
  return x - Math.floor(x);
}

// Total rotation (degrees) the wheel ends at so segment `idx` sits under the pointer.
function wheelFinalAngle(count, idx, seed) {
  const seg = 360 / count;
  const wobble = (seeded(seed) - 0.5) * seg * 0.7;
  return 360 * 7 - idx * seg + wobble;
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 4);
}

function wheelSVG(kind) {
  const segs = window.WHEELS[kind].segments;
  const n = segs.length;
  const seg = 360 / n;
  const colors = WHEEL_COLORS[kind];
  const r = 100;
  let out = "";
  segs.forEach((s, i) => {
    // Segment i is centred on angle i*seg, measured clockwise from the top.
    const a0 = ((i * seg - seg / 2 - 90) * Math.PI) / 180;
    const a1 = ((i * seg + seg / 2 - 90) * Math.PI) / 180;
    const x0 = r * Math.cos(a0), y0 = r * Math.sin(a0);
    const x1 = r * Math.cos(a1), y1 = r * Math.sin(a1);
    out += `<path d="M0 0 L${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z" fill="${colors[i % colors.length]}" stroke="#111" stroke-width="0.6"/>`;
    const words = s.label.replace("*", "").split(" ");
    const lines = [];
    words.forEach((w) => {
      const last = lines[lines.length - 1];
      if (last && (last + " " + w).length <= 11) lines[lines.length - 1] = last + " " + w;
      else lines.push(w);
    });
    const fs = n > 8 ? 6 : 7;
    const text = lines
      .map((l, li) => `<tspan x="0" dy="${li === 0 ? -((lines.length - 1) * fs * 0.55) : fs * 1.1}">${esc(l)}</tspan>`)
      .join("");
    // Text sits upright when its segment is under the pointer at the top.
    out += `<g transform="rotate(${i * seg})"><text y="-64" text-anchor="middle" dominant-baseline="middle" font-size="${fs}" fill="#fff" font-family="Oswald, Impact, sans-serif" font-weight="700">${text}</text></g>`;
  });
  out += `<circle r="12" fill="#111" stroke="#ffcc00" stroke-width="2"/>`;
  return `<svg viewBox="-104 -104 208 208" class="wheel-svg">${out}</svg>`;
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Turns "\n" into line breaks for display.
function fmt(s) {
  return esc(s).replace(/\n/g, "<br>");
}

function clueFor(state, c, r) {
  const game = findGame(state.gameId);
  const cat = game.categories[c];
  return { game, cat, clue: cat.clues[r], value: clueValue(r) };
}

function answerFor(state, clue) {
  if (clue.kind === "callback") {
    return state.firstAnswer
      ? state.firstAnswer
      : "(No questions answered yet tonight, so... whatever you want.)";
  }
  return clue.a;
}
