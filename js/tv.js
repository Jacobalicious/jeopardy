// The TV screen. It never decides anything and never has the answers until the
// host reveals them: the host sends a finished "view" and this just draws it.
//
// Two ways to get here:
//   tv.html          a window on the same device as the host (laptop + HDMI)
//   tv.html?cast=1   running on a Chromecast, controlled from a phone

const CAST_MODE = new URLSearchParams(location.search).has("cast");

let view = null;
let lastMainKey = "";
let lastScores = {};
let coinStarts = {}; // coin id -> when this screen first saw it
const imgParts = {}; // pictures arriving over Chromecast in pieces
const imgs = {};
let anim = null;

const main = document.getElementById("main");
const scoresEl = document.getElementById("scores");
const startEl = document.getElementById("start");

function handle(msg) {
  if (msg.t === "view") {
    view = msg.view;
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

if (CAST_MODE) {
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
  render();
}

function goFullscreen() {
  try {
    document.documentElement.requestFullscreen();
  } catch (e) {}
}

function render() {
  if (!view) {
    main.innerHTML = `<div class="splash"><h1>Brain Damage Jeopardy</h1><h2>${
      CAST_MODE ? "Connected. Waiting for the host..." : "Waiting for the host screen..."
    }</h2></div>`;
    return;
  }
  renderScores();
  const s = view.screen;
  const key = JSON.stringify(s);
  if (key === lastMainKey) return;
  lastMainKey = key;
  anim = null;
  const views = { splash, board, clue, coin, scores: leaderboard };
  main.innerHTML = (views[s.type] || splash)(s);
  if (s.type === "coin") startCoin(s);
}

// ---------- Views ----------

function splash() {
  return `<div class="splash">
    <h1>${esc(view.title || "Brain Damage Jeopardy")}</h1>
    <h2>The trivia game where being smart will not help you</h2>
    <ol>
      <li><b>Say "DING"</b> out loud to answer.</li>
      <li>The host is always right. <b>Especially when wrong.</b></li>
      <li>Points are made up and will be taken away.</li>
      <li>Complaining costs <b>100 points</b>.</li>
      <li>There is no rule 5. <b>Minus 100 for reading it.</b></li>
    </ol>
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
  let html = `<div class="clue ${s.img ? "has-img" : ""}">
    <div class="tag">${esc(s.cat)} &middot; <b>${s.value}</b></div>
    ${s.badge ? `<div class="kind-badge">${esc(s.badge)}</div>` : ""}
    ${pic}
    <div class="q ${huge ? "huge" : ""} ${long ? "long" : ""}">${fmt(s.q)}</div>`;
  if (s.a != null) html += `<div class="answer">${fmt(s.a)}</div>`;
  if (s.twist) html += `<div class="twist">${fmt(s.twist)}</div>`;
  return html + `</div>`;
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
  scoresEl.style.display = view.screen.type === "scores" ? "none" : "";
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
