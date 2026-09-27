// The TV screen. It never decides anything and never has the answers until the
// host reveals them: the host sends a finished "view" and this just draws it.
//
// Two ways to get here:
//   tv.html          a window on the same device as the host (laptop + HDMI)
//   tv.html?cast=1   running on a Chromecast, controlled from a phone

const params = new URLSearchParams(location.search);
const CAST_MODE = params.has("cast");
const DEMO = params.get("demo"); // tv.html?demo=board&theme=neon shows a made-up game (for themes.html)

let view = null;
let roomCode = "";
let roomUp = false;
let lastMainKey = "";
let lastScores = {};
let coinStarts = {}; // coin id -> when this screen first saw it
const imgParts = {}; // pictures arriving over Chromecast in pieces
const imgs = {};
let anim = null;
let introTimers = []; // pending falling letters / sounds on the about-me slides

const main = document.getElementById("main");
const scoresEl = document.getElementById("scores");
const startEl = document.getElementById("start");

function handle(msg) {
  if (msg.t === "view") {
    view = msg.view;
    if (view.theme) saveTheme(applyTheme(view.theme));
    render();
  } else if (msg.t === "sfx") {
    Sfx.play(msg.name);
  } else if (msg.t === "img") {
    const p = (imgParts[msg.id] = imgParts[msg.id] || []);
    p[msg.i] = msg.data;
    if (p.filter((x) => x != null).length === msg.total) {
      imgs[msg.id] = p.join("");
      delete imgParts[msg.id];
      lastMainKey = "";
      render();
    }
  }
}

applyTheme(DEMO ? params.get("theme") : savedTheme());

if (DEMO) {
  startEl.remove();
  document.body.classList.add("cast");
  view = demoView(DEMO);
  render();
} else if (CAST_MODE) {
  startEl.remove();
  document.body.classList.add("cast");
  const s = document.createElement("script");
  s.src = "https://www.gstatic.com/cast/sdk/libs/caf_receiver/v3/cast_receiver_framework.js";
  s.onload = () => {
    const context = cast.framework.CastReceiverContext.getInstance();
    context.addCustomMessageListener(window.CAST_NS, (e) => {
      const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      handle(data);
    });
    const opts = new cast.framework.CastReceiverOptions();
    opts.disableIdleTimeout = true; // there's no video, so don't shut down after 5 minutes
    opts.customNamespaces = { [window.CAST_NS]: cast.framework.system.MessageType.JSON };
    context.start(opts);
  };
  document.head.appendChild(s);
  render();
} else {
  startRoom();
  startEl.addEventListener("click", () => {
    Sfx.unlock();
    goFullscreen();
    startEl.remove();
  });
  document.addEventListener("dblclick", () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else goFullscreen();
  });
  Local.listen(handle);
  // A presentation clicker types into whichever window has focus, which is
  // often this one. Pass slide keys back to the host window.
  document.addEventListener("keydown", (e) => {
    if (!view || view.screen.type !== "intro") return;
    if (!["ArrowRight", "ArrowLeft", "PageDown", "PageUp", " ", "Enter"].includes(e.key)) return;
    e.preventDefault();
    Local.send({ t: "key", key: e.key });
  });
  render();
}

// ---------- Room code (any TV with a browser) ----------

function startRoom() {
  try {
    roomCode = cleanRoomCode(localStorage.getItem("jeopardy-tv-room"));
  } catch (e) {}
  if (roomCode.length !== 4) roomCode = newRoomCode();
  try {
    localStorage.setItem("jeopardy-tv-room", roomCode);
  } catch (e) {}
  const relay = Relay(roomCode, {
    subscribe: ["view", "event"],
    onMessage: (suffix, data) => {
      if (data.t === "ping") relay.send("hello", { t: "hello" });
      else handle(data);
    },
    onStatus: (up) => {
      roomUp = up;
      if (up) relay.send("hello", { t: "hello" });
      showRoomCode();
    },
  });
  showRoomCode();
}

function showRoomCode() {
  const text = roomCode ? `Room code <b>${roomCode}</b>` + (roomUp ? "" : " (connecting...)") : "";
  document.querySelectorAll(".room-slot").forEach((el) => (el.innerHTML = text));
  const corner = document.getElementById("roomCorner");
  if (corner) corner.innerHTML = roomCode ? "Room " + roomCode : "";
}

function goFullscreen() {
  try {
    document.documentElement.requestFullscreen();
  } catch (e) {}
}

function render() {
  if (!view) {
    main.innerHTML = CAST_MODE
      ? `<div class="splash"><h1>Jeopardy</h1><h2>Connected. Waiting for the host...</h2></div>`
      : `<div class="splash"><h1>Jeopardy</h1>
          <div class="room-big room-slot"></div>
          <h2>On the host phone, type this code under "Connect a TV"</h2></div>`;
    showRoomCode();
    return;
  }
  renderScores();
  const s = view.screen;
  const key = JSON.stringify(s);
  if (key === lastMainKey) return;
  lastMainKey = key;
  anim = null;
  introTimers.forEach(clearTimeout);
  introTimers = [];
  document.body.classList.toggle("intro-on", s.type === "intro");
  const views = { splash, board, clue, coin, double, scores: leaderboard, intro };
  main.innerHTML = (views[s.type] || splash)(s);
  if (s.type === "coin") startCoin(s);
  if (s.type === "intro") startIntro(s);
}

// ---------- Views ----------

function splash() {
  return `<div class="splash">
    <h1>Jeopardy</h1>
    <div class="subtitle">but I have brain damage</div>
    <ol>
      <li><b>Say "DING"</b> out loud to answer.</li>
      <li>Only say DING <b>after the host finishes reading the question.</b></li>
      <li>The host is always right. <b>Especially when wrong.</b></li>
      <li>Points are made up and will be taken away.</li>
      <li>There is no rule 5. <b>Minus 100 for reading it.</b></li>
    </ol>
  </div>`;
}

function double(s) {
  return `<div class="double-screen">
    <div class="double-top">${esc(s.cat)} &middot; ${s.value}</div>
    <div class="double-big">DOUBLE<br />POINTS!</div>
    <div class="double-sub">This one is worth <b>${s.value * 2}</b></div>
  </div>`;
}

function board(s) {
  const n = s.cats.length || 1;
  const rows = Math.max(1, ...s.cats.map((c) => c.cells.length));
  const valSize = Math.min(7, 44 / rows).toFixed(2);
  let html = `<div class="board" style="grid-template-columns:repeat(${n},1fr);grid-template-rows:1.1fr repeat(${rows},1fr);--val:${valSize}vh">`;
  s.cats.forEach((c) => (html += `<div class="cell cat">${esc(c.name)}</div>`));
  for (let r = 0; r < rows; r++) {
    s.cats.forEach((c) => {
      const cell = c.cells[r];
      if (!cell) html += `<div class="cell val used"></div>`;
      else html += `<div class="cell val ${cell.used ? "used" : ""}">${cell.used ? "" : cell.value}</div>`;
    });
  }
  return html + `</div>`;
}

function clue(s) {
  const huge = s.badge === "CHAOS" && s.q.length < 22;
  const long = s.q.length > 120;
  let pic = "";
  if (s.img) {
    const src = s.img.startsWith("cast:") ? imgs[s.img.slice(5)] : s.img;
    pic = src ? `<img class="qimg" src="${esc(src)}" alt="" />` : `<div class="img-wait">Loading picture...</div>`;
  }
  let html = `<div class="clue ${s.img || s.board ? "has-img" : ""}">
    <div class="tag">${esc(s.cat)} &middot; <b>${s.doubled ? s.value * 2 + " (DOUBLE POINTS)" : s.value}</b></div>
    ${s.badge ? `<div class="kind-badge">${esc(s.badge)}</div>` : ""}
    ${pic}
    <div class="q ${huge ? "huge" : ""} ${long ? "long" : ""}">${fmt(s.q)}</div>`;
  if (s.board) html += tvBoard(s.board);
  if (s.a != null) html += `<div class="answer">${fmt(s.a)}</div>`;
  if (s.twist) html += `<div class="twist">${fmt(s.twist)}</div>`;
  return html + `</div>`;
}

function tvBoard(b) {
  const cell = Math.min(38 / b.rows, 70 / b.cols).toFixed(2) + "vh";
  const names = PIECE_NAMES[b.type];
  let cells = "";
  b.cells.forEach((v) => (cells += `<div class="tv-cell ${v ? "p" + v : ""}">${b.type === "tictactoe" ? v : ""}</div>`));
  const status = b.result
    ? `<div class="board-status done">${b.result === "draw" ? "IT'S A DRAW" : esc(names[b.result]).toUpperCase() + " WINS!"}</div>`
    : `<div class="board-status">${esc(names[b.turn])}'s turn</div>`;
  return `<div class="tv-board ${b.type}" style="--cell:${cell};grid-template-columns:repeat(${b.cols},var(--cell))">${cells}</div>${status}`;
}

function coin(s) {
  return `<div class="coin-stage">
    <div class="coin-label">${fmt(s.label || "Heads or tails?")}</div>
    <div class="coin" id="coin">
      <div class="face heads">H</div>
      <div class="face tails">T</div>
    </div>
    <div class="coin-result" id="coinResult"></div>
  </div>`;
}

function leaderboard() {
  const sorted = [...view.teams].sort((a, b) => b.score - a.score);
  return `<div class="leader">
    <h1>STANDINGS</h1>
    ${sorted
      .map(
        (p, i) => `<div class="row" style="animation-delay:${i * 0.12}s">
          <span>${i === 0 ? "👑 " : ""}${esc(p.name)}</span>
          <span class="pts ${p.score < 0 ? "neg" : ""}">${p.score}</span>
        </div>`
      )
      .join("")}
  </div>`;
}

// ---------- Scores bar ----------

function renderScores() {
  const teams = view.teams || [];
  const ids = teams.map((p) => p.id + p.name).join("|");
  if (scoresEl.dataset.ids !== ids) {
    scoresEl.dataset.ids = ids;
    scoresEl.innerHTML = teams
      .map(
        (p) => `<div class="tv-score" data-id="${p.id}">
        <div class="name">${esc(p.name)}</div>
        <div class="pts">${p.score}</div>
      </div>`
      )
      .join("");
  }
  teams.forEach((p) => {
    const el = scoresEl.querySelector(`[data-id="${p.id}"]`);
    if (!el) return;
    const pts = el.querySelector(".pts");
    pts.textContent = p.score;
    pts.classList.toggle("neg", p.score < 0);
    const before = lastScores[p.id];
    if (before !== undefined && before !== p.score) {
      const d = p.score - before;
      const tag = document.createElement("div");
      tag.className = "delta " + (d > 0 ? "up" : "down");
      tag.textContent = (d > 0 ? "+" : "") + d;
      el.appendChild(tag);
      setTimeout(() => tag.remove(), 1900);
      el.classList.add("bump");
      setTimeout(() => el.classList.remove("bump"), 200);
    }
    lastScores[p.id] = p.score;
  });
  scoresEl.style.display = view.screen.type === "scores" || view.screen.type === "intro" ? "none" : "";
}

// ---------- Coin ----------

function easeOut(t) {
  return 1 - Math.pow(1 - t, 4);
}

function startCoin(s) {
  // The phone's clock and the TV's clock don't agree, so the TV times the flip
  // from when it first heard about it.
  if (!coinStarts[s.id]) coinStarts[s.id] = Date.now();
  const start = coinStarts[s.id];
  const coinEl = document.getElementById("coin");
  const tails = s.result === "tails";
  const finalAngle = 360 * 8 + (tails ? 180 : 0);
  const already = Date.now() - start >= COIN_MS;
  const me = {};
  anim = me;

  function frame() {
    if (anim !== me) return;
    const t = Math.min(1, (Date.now() - start) / COIN_MS);
    const angle = finalAngle * easeOut(t);
    const hop = Math.sin(Math.PI * Math.min(1, t * 1.15)) * 18;
    coinEl.style.transform = `translateY(${-hop}vh) rotateY(${angle}deg)`;
    if (t < 1) return requestAnimationFrame(frame);
    document.getElementById("coinResult").innerHTML = `<div class="result">${tails ? "TAILS" : "HEADS"}</div>`;
  }
  requestAnimationFrame(frame);
}

// ---------- The fake "About Me" slides ----------
// Words are drawn letter by letter so they can tip over and fall off. The
// randomness is seeded by the slide number, so a TV that reconnects draws the
// same mess.


function seeded(n) {
  let x = (n + 1) * 2654435761;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x >>> 0) % 100000) / 100000;
  };
}

function introText(text) {
  return text
    .split(" ")
    .map((w) => `<span class="gs-w">${Array.from(w).map((ch) => `<span class="gs-l">${esc(ch)}</span>`).join("")}</span>`)
    .join(" ");
}

function introSlide(sl) {
  const style = `${sl.bg ? `background:${sl.bg};` : ""}${sl.ink ? `color:${sl.ink};` : ""}`;
  let body = "";
  if (sl.layout === "title") {
    body = `<div class="gs-title">${introText(sl.title)}</div><div class="gs-sub">${introText(sl.lines[0] || "")}</div>`;
  } else if (sl.layout === "bullets") {
    body = `<div class="gs-head">${introText(sl.title)}</div>
      <ul class="gs-bullets">${sl.lines.map((l) => `<li>${introText(l)}</li>`).join("")}</ul>`;
  } else {
    body = `<div class="gs-lines">${sl.lines.map((l) => `<div>${introText(l)}</div>`).join("")}</div>`;
  }
  return `<div class="gs-slide gs-layout-${sl.layout}" id="gsSlide" style="${style}">
    ${body}
    ${sl.counter ? `<div class="gs-count">${esc(sl.counter)}</div>` : ""}
  </div>`;
}

function intro(s) {
  const sl = INTRO_SLIDES[s.i] || INTRO_SLIDES[0];
  if (sl.layout === "crash") return splash() + `<div class="gs-stage gs-crashing">${introSlide(sl)}</div>`;
  return `<div class="gs-stage">${introSlide(sl)}</div>`;
}

function startIntro(s) {
  const sl = INTRO_SLIDES[s.i] || INTRO_SLIDES[0];
  const slide = document.getElementById("gsSlide");
  if (!slide) return;
  const rnd = seeded(s.i);

  if (sl.layout === "crash") {
    // Hangs for a beat, one corner lets go, then the whole slide drops away.
    introTimers.push(setTimeout(() => Sfx.play("boom"), 1500));
    introTimers.push(setTimeout(() => Sfx.play("airhorn"), 1900));
    slide.animate(
      [
        { transform: "none" },
        { transform: "rotate(0deg)", offset: 0.35 },
        { transform: "rotate(14deg)", offset: 0.45, easing: "ease-in" },
        { transform: "rotate(9deg)", offset: 0.52, easing: "ease-in" },
        { transform: "rotate(18deg)", offset: 0.6, easing: "cubic-bezier(.5,0,1,.5)" },
        { transform: "translateY(130vh) rotate(40deg)" },
      ],
      { duration: 2600, fill: "forwards" }
    );
    // The black around the slide goes as soon as it starts to fall.
    slide.parentElement.animate(
      [{ backgroundColor: "#000" }, { backgroundColor: "#000", offset: 0.5 }, { backgroundColor: "rgba(0,0,0,0)", offset: 0.7 }, { backgroundColor: "rgba(0,0,0,0)" }],
      { duration: 2600, fill: "forwards" }
    );
    return;
  }

  // Words tip over slowly while the slide is up, mostly to the right.
  const sag = sl.sag || 0;
  if (sag) {
    slide.querySelectorAll(".gs-w").forEach((w) => {
      const rot = sag * (rnd() * 34 - 8);
      const dy = sag * rnd() * 0.5;
      const end = `translateY(${dy}em) rotate(${rot}deg)`;
      const start = `translateY(${dy * 0.3}em) rotate(${rot * 0.3}deg)`;
      w.animate([{ transform: start }, { transform: end }], {
        duration: 5000 + rnd() * 6000,
        delay: rnd() * 3000,
        easing: "ease-in",
        fill: "both",
      });
      w.querySelectorAll(".gs-l").forEach((l) => {
        if (rnd() < sag * 0.35) l.style.transform = `rotate(${(rnd() - 0.5) * 50 * sag}deg)`;
      });
    });
  }

  // Some letters give up entirely and drop to the bottom of the slide.
  const fall = sl.fall || 0;
  if (!fall) return;
  const over = (sl.fallOver || 10) * 1000;
  let lastClink = 0;
  slide.querySelectorAll(".gs-l").forEach((l) => {
    if (rnd() >= fall) return;
    const delay = 1500 + rnd() * over;
    const spin = (rnd() - 0.5) * 160;
    const drift = (rnd() - 0.5) * 60; // px sideways
    const settle = rnd() * 0.2 - 0.25; // how high off the floor it ends up, in letter heights
    introTimers.push(
      setTimeout(() => {
        const floor = slide.getBoundingClientRect().bottom;
        const r = l.getBoundingClientRect();
        const dy = floor - r.bottom - settle * r.height;
        if (dy <= 0) return;
        // The word it sits in may be tilted, so turn "straight down" into the word's own direction.
        const m = new DOMMatrix(getComputedStyle(l.parentElement).transform);
        const a = Math.atan2(m.b, m.a);
        const local = (x, y) => [Math.cos(a) * x + Math.sin(a) * y, -Math.sin(a) * x + Math.cos(a) * y];
        const at = (x, y, k) => {
          const [lx, ly] = local(x, y);
          return `translate(${lx}px, ${ly}px) rotate(${spin * k}deg)`;
        };
        const t = Math.min(1100, 350 + Math.sqrt(dy) * 28);
        l.animate(
          [
            { transform: l.style.transform || "none", easing: "cubic-bezier(.55,0,1,.45)" },
            { transform: at(drift, dy, 1), offset: 0.8, easing: "ease-out" },
            { transform: at(drift * 1.1, dy - 12, 1.05), offset: 0.9, easing: "ease-in" },
            { transform: at(drift * 1.15, dy, 1.1) },
          ],
          { duration: t, fill: "forwards" }
        );
        if (sl.clink) {
          introTimers.push(
            setTimeout(() => {
              if (Date.now() - lastClink < 250) return;
              lastClink = Date.now();
              Sfx.play("drop");
            }, t * 0.8)
          );
        }
      }, delay)
    );
  });
}

// ---------- Made-up game for previewing themes ----------

function demoView(kind) {
  const teams = [
    { id: "a", name: "The Nerds", score: 1200 },
    { id: "b", name: "Team Chaos", score: 400 },
    { id: "c", name: "Last Place", score: -300 },
  ];
  const names = ["Science", "Movies", "Food", "Geography", "Memes", "Nerd Stuff"];
  const cats = names.map((name, c) => ({
    name,
    cells: [100, 200, 300, 400, 500].map((value, r) => ({ value, used: (c * 5 + r) % 7 === 3 })),
  }));
  const q = "This planet is known as the Red Planet";
  const screens = {
    board: { type: "board", cats },
    clue: { type: "clue", cat: "Science", value: 300, q },
    answer: { type: "clue", cat: "Science", value: 300, q, a: "What is Mars?", twist: "Everyone else loses 100" },
    splash: { type: "splash" },
    scores: { type: "scores" },
    double: { type: "double", cat: "Memes", value: 400 },
  };
  if (/^intro\d+$/.test(kind)) return { teams, screen: { type: "intro", i: Number(kind.slice(5)) } };
  return { teams, screen: screens[kind] || screens.board };
}
