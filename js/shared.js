// Shared by the host, the TV and the editor:
// the question library, game state, window-to-window syncing, and sounds.

const LIB_KEY = "jeopardy-library-v4";
const STATE_KEY = "jeopardy-game-v2";
const VIEW_KEY = "jeopardy-view-v2";
const MSG_KEY = "jeopardy-msg-v2";
const CHANNEL = "jeopardy-sync-v2";
const COIN_MS = 3200;

function uid() {
  return Math.random().toString(36).slice(2, 9);
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

// ---------- Library (all the questions) ----------

function loadLibrary() {
  try {
    const raw = localStorage.getItem(LIB_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return JSON.parse(JSON.stringify(window.DEFAULT_LIBRARY));
}

// Returns false if the browser refused (usually: too many pictures).
function saveLibrary(lib) {
  try {
    localStorage.setItem(LIB_KEY, JSON.stringify(lib));
    return true;
  } catch (e) {
    return false;
  }
}

// How many questions per category go on the board.
const MIN_ROWS = 3;
const MAX_ROWS = 10;
function rowsOf(lib) {
  const n = Number(lib.rows) || 6;
  return Math.min(MAX_ROWS, Math.max(MIN_ROWS, n));
}

// What's actually on the board: the categories switched on, and the first
// few ticked questions in each, worth 100, 200, 300...
function buildBoard(lib) {
  const categories = lib.categories
    .filter((c) => c.onBoard)
    .map((c) => ({
      id: c.id,
      name: c.name,
      clues: c.questions
        .filter((q) => q.use)
        .slice(0, rowsOf(lib))
        .map((q, i) => ({ ...q, value: (i + 1) * 100 })),
    }));
  const final = lib.finals.find((f) => f.id === lib.finalId) || lib.finals[0] || null;
  return { title: lib.title, rows: rowsOf(lib), categories, final };
}

function answerFor(game, clue) {
  if (clue.kind === "callback") {
    return game.firstAnswer || "(Nothing answered yet tonight, so... whatever you want.)";
  }
  return clue.a || "";
}

// ---------- Share links (library squeezed into a URL) ----------

// Uploaded pictures are far too big for a link, so they're left out of it.
function withoutUploads(lib) {
  let dropped = 0;
  const copy = JSON.parse(JSON.stringify(lib));
  copy.categories.forEach((c) =>
    c.questions.forEach((q) => {
      if (q.img && q.img.startsWith("data:")) {
        delete q.img;
        dropped++;
      }
    })
  );
  return { lib: copy, dropped };
}

async function packLibrary(lib) {
  const stream = new Blob([JSON.stringify(lib)]).stream().pipeThrough(new CompressionStream("deflate-raw"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function unpackLibrary(str) {
  const bin = atob(str.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return JSON.parse(await new Response(stream).text());
}

// If the page was opened from a share link, offer to load it.
async function importFromHash() {
  const m = location.hash.match(/lib=([A-Za-z0-9_-]+)/);
  if (!m) return false;
  history.replaceState(null, "", location.pathname + location.search);
  try {
    const lib = await unpackLibrary(m[1]);
    const n = lib.categories.reduce((t, c) => t + c.questions.length, 0);
    if (!confirm(`Load the questions from this link? (${lib.categories.length} categories, ${n} questions)\n\nThis replaces the questions saved on this device.`)) return false;
    saveLibrary(lib);
    return true;
  } catch (e) {
    alert("That link didn't work. It may have been cut off when it was copied.");
    return false;
  }
}

// ---------- Talking to a TV window on the same device ----------
// (Chromecast has its own path, in host.js and tv.js.)

const Local = (() => {
  let bc = null;
  try {
    bc = new BroadcastChannel(CHANNEL);
  } catch (e) {}
  const seen = new Set();

  function send(msg) {
    msg.id = uid();
    try {
      if (msg.t === "view") localStorage.setItem(VIEW_KEY, JSON.stringify(msg));
      else localStorage.setItem(MSG_KEY, JSON.stringify(msg));
    } catch (e) {}
    if (bc) bc.postMessage(msg);
  }

  function listen(fn) {
    const handle = (msg) => {
      if (!msg || seen.has(msg.id)) return;
      seen.add(msg.id);
      fn(msg);
    };
    if (bc) bc.onmessage = (m) => handle(m.data);
    window.addEventListener("storage", (e) => {
      if ((e.key === VIEW_KEY || e.key === MSG_KEY) && e.newValue) {
        try {
          handle(JSON.parse(e.newValue));
        } catch (err) {}
      }
    });
    try {
      const last = localStorage.getItem(VIEW_KEY);
      if (last) handle(JSON.parse(last));
    } catch (e) {}
  }

  return { send, listen };
})();

// ---------- Sounds ----------
// Everything is synthesized, so there are no audio files to license.
// Any sound can be swapped for a real file via SOUND_FILES in config.js.

const Sfx = (() => {
  let ctx = null;
  let master = null;
  let noiseBuf = null;
  let music = null;

  function ac() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createDynamicsCompressor();
      master.threshold.value = -14;
      master.ratio.value = 4;
      const out = ctx.createGain();
      out.gain.value = 0.9;
      master.connect(out).connect(ctx.destination);
      const len = ctx.sampleRate * 2;
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function env(g, t, vol, attack, dur) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }

  // One oscillator voice. o = { type, vol, attack, slideTo, vibrato, filter, dest }
  function voice(freq, start, dur, o = {}) {
    const a = ac();
    const t = a.currentTime + start;
    const osc = a.createOscillator();
    osc.type = o.type || "sine";
    osc.frequency.setValueAtTime(freq, t);
    if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(o.slideTo, t + dur);
    if (o.detune) osc.detune.value = o.detune;
    if (o.vibrato) {
      const lfo = a.createOscillator();
      const lg = a.createGain();
      lfo.frequency.value = o.vibrato[0];
      lg.gain.setValueAtTime(0, t);
      lg.gain.linearRampToValueAtTime(o.vibrato[1], t + dur * 0.6);
      lfo.connect(lg).connect(osc.frequency);
      lfo.start(t);
      lfo.stop(t + dur + 0.1);
    }
    const g = a.createGain();
    env(g, t, o.vol || 0.2, o.attack || 0.005, dur);
    let node = osc.connect(g);
    if (o.filter) {
      const f = a.createBiquadFilter();
      f.type = o.filter.type || "lowpass";
      f.frequency.setValueAtTime(o.filter.from || o.filter.freq, t);
      if (o.filter.to) f.frequency.exponentialRampToValueAtTime(o.filter.to, t + dur * (o.filter.at || 1));
      if (o.filter.q) f.Q.value = o.filter.q;
      node = node.connect(f);
    }
    node.connect(o.dest || master);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  function noise(start, dur, o = {}) {
    const a = ac();
    const t = a.currentTime + start;
    const src = a.createBufferSource();
    src.buffer = noiseBuf;
    const f = a.createBiquadFilter();
    f.type = o.type || "bandpass";
    f.frequency.setValueAtTime(o.from || o.freq || 1000, t);
    if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    f.Q.value = o.q || 1;
    const g = a.createGain();
    env(g, t, o.vol || 0.2, o.attack || 0.002, dur);
    src.connect(f).connect(g).connect(o.dest || master);
    src.start(t, Math.random());
    src.stop(t + dur + 0.05);
  }

  function bell(freq, start, vol = 0.25, dur = 1.6) {
    [
      [1, 1],
      [2.0, 0.45],
      [2.76, 0.3],
      [5.4, 0.12],
      [8.93, 0.05],
    ].forEach(([r, v], i) => voice(freq * r, start, dur / (1 + i * 0.5), { vol: vol * v, attack: 0.002 }));
  }

  const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

  const sounds = {
    ding() {
      bell(1318.5, 0, 0.35, 1.8);
    },
    correct() {
      [72, 76, 79, 84].forEach((n, i) => bell(midi(n), i * 0.08, 0.2, 1.2));
      [0, 0.05, 0.1, 0.15, 0.2].forEach((d) => voice(midi(96 + Math.floor(Math.random() * 5)), 0.35 + d, 0.2, { vol: 0.04 }));
    },
    buzzer() {
      const opts = { vol: 0.16, attack: 0.01, filter: { freq: 1600 } };
      voice(150, 0, 0.9, { ...opts, type: "square" });
      voice(155, 0, 0.9, { ...opts, type: "square" });
      voice(75, 0, 0.9, { ...opts, type: "sawtooth", vol: 0.2 });
    },
    sad() {
      const notes = [
        [62, 0, 0.5],
        [61, 0.55, 0.5],
        [60, 1.1, 0.5],
        [59, 1.65, 1.6],
      ];
      notes.forEach(([n, s, d], i) =>
        voice(midi(n), s, d, {
          type: "sawtooth",
          vol: 0.22,
          attack: 0.04,
          vibrato: i === 3 ? [5.5, 7] : null,
          filter: { from: 350, to: 1600, at: 0.35, q: 4 },
        })
      );
    },
    airhorn() {
      [
        [0, 0.16],
        [0.22, 0.16],
        [0.44, 0.75],
      ].forEach(([s, d]) => {
        [415, 419, 622, 830].forEach((f, i) =>
          voice(f, s, d, { type: "sawtooth", vol: i < 2 ? 0.13 : 0.06, attack: 0.01, filter: { type: "highshelf", freq: 1500 } })
        );
      });
    },
    drumroll() {
      for (let i = 0; i < 44; i++) {
        const s = i * 0.065;
        noise(s, 0.06, { freq: 2200, q: 0.8, vol: 0.05 + (i / 44) * 0.2 });
        voice(190, s, 0.04, { type: "triangle", vol: 0.04 + (i / 44) * 0.06 });
      }
      noise(2.95, 2.2, { type: "highpass", freq: 5000, vol: 0.35 });
      voice(60, 2.95, 0.5, { vol: 0.5, slideTo: 40 });
    },
    boom() {
      voice(110, 0, 1.1, { vol: 0.7, slideTo: 38, attack: 0.003 });
      voice(55, 0, 1.2, { type: "triangle", vol: 0.4, slideTo: 30 });
      noise(0, 0.12, { type: "lowpass", freq: 400, vol: 0.5 });
    },
    applause() {
      for (let i = 0; i < 380; i++) {
        const s = Math.random() * 3.2;
        const swell = s < 0.4 ? s / 0.4 : s > 2.4 ? Math.max(0, (3.2 - s) / 0.8) : 1;
        noise(s, 0.025, { freq: 900 + Math.random() * 1800, q: 1.4, vol: 0.02 + swell * 0.07 });
      }
    },
    reveal() {
      noise(0, 0.35, { from: 300, to: 4000, q: 2, vol: 0.12, attack: 0.1 });
      bell(midi(79), 0.25, 0.12, 0.9);
      bell(midi(86), 0.33, 0.1, 0.9);
    },
    whoosh() {
      noise(0, 0.45, { from: 400, to: 2800, q: 1.5, vol: 0.15, attack: 0.15 });
    },
    think() {
      startMusic();
    },
    stopmusic() {
      stopMusic();
    },
  };

  // An original 30-second "thinking" tune. (Not the real Jeopardy theme,
  // which is copyrighted.)
  function startMusic() {
    stopMusic();
    const a = ac();
    const bus = a.createGain();
    bus.gain.value = 0.8;
    bus.connect(master);
    music = bus;
    const beat = 60 / 132;
    // [midi note or null, beats]
    const melody = [
      [76, 1], [79, 1], [84, 1], [79, 1],
      [81, 1], [79, 1], [76, 1], [74, 1],
      [72, 1], [74, 1], [76, 1], [79, 1],
      [81, 2], [79, 2],
      [76, 1], [79, 1], [84, 1], [79, 1],
      [81, 1], [79, 1], [76, 1], [72, 1],
      [74, 1], [76, 1], [74, 1], [71, 1],
      [72, 3], [null, 1],
    ];
    const bass = [48, 43, 45, 40, 41, 36, 43, 48];
    for (let loop = 0; loop < 2; loop++) {
      const off = loop * 32 * beat;
      let t = 0;
      melody.forEach(([n, len]) => {
        if (n) voice(midi(n), off + t * beat, len * beat * 0.92, { type: "triangle", vol: 0.12, dest: bus });
        t += len;
      });
      bass.forEach((n, bar) => {
        for (let b = 0; b < 4; b++) {
          voice(midi(n + (b % 2 ? 12 : 0)), off + (bar * 4 + b) * beat, beat * 0.8, { vol: 0.14, dest: bus });
          noise(off + (bar * 4 + b + 0.5) * beat, 0.05, { type: "highpass", freq: 7000, vol: 0.05, dest: bus });
        }
      });
    }
    // Final "time's up" hit.
    const end = 64 * beat;
    [60, 64, 67, 72].forEach((n) => voice(midi(n), end, 1.4, { type: "sawtooth", vol: 0.07, dest: bus, filter: { freq: 2500 } }));
    bell(midi(84), end, 0.2, 1.5);
  }

  function stopMusic() {
    if (!music) return;
    const g = music;
    music = null;
    try {
      g.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
      setTimeout(() => g.disconnect(), 600);
    } catch (e) {}
  }

  const fileCache = {};
  function play(name) {
    try {
      const file = (window.SOUND_FILES || {})[name];
      if (file) {
        const el = fileCache[name] || (fileCache[name] = new Audio(file));
        el.currentTime = 0;
        el.play();
        return;
      }
      if (sounds[name]) sounds[name]();
    } catch (e) {}
  }

  return { play, unlock: ac };
})();

const SOUND_BUTTONS = [
  ["ding", "Ding"],
  ["correct", "Correct"],
  ["buzzer", "Wrong"],
  ["sad", "Sad trombone"],
  ["airhorn", "Airhorn"],
  ["boom", "Boom"],
  ["applause", "Applause"],
  ["drumroll", "Drumroll"],
  ["think", "Think music"],
  ["stopmusic", "Stop music"],
];
