// The TV screen. It never decides anything; it only draws whatever the host says.
// No answers ever reach this screen until the host reveals them.

let state = loadState();
let lastMainKey = "";
let lastScores = {};
let anim = null; // current wheel / coin animation

const main = document.getElementById("main");
const scoresEl = document.getElementById("scores");

document.getElementById("start").addEventListener("click", (e) => {
  Sfx.unlock();
  goFullscreen();
  e.currentTarget.remove();
});

document.addEventListener("dblclick", () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else goFullscreen();
});

function goFullscreen() {
  try {
    document.documentElement.requestFullscreen();
  } catch (e) {}
}

Sync.listen(
  (s) => {
    state = s;
    render();
  },
  (ev) => {
    if (ev.type === "sfx") Sfx.play(ev.name);
  }
);

function render() {
  renderScores();
  const game = findGame(state.gameId);
  const key = JSON.stringify([state.screen, state.gameId, state.used, state.firstAnswer]);
  if (key === lastMainKey) return;
  lastMainKey = key;
  anim = null;

  const s = state.screen || { type: "splash" };
  const views = { splash, board, clue, final, wheel, coin, dragon, scores: leaderboard };
  main.innerHTML = (views[s.type] || board)(s, game);
  if (s.type === "wheel") startWheel(s);
  if (s.type === "coin" || s.type === "dragon") startCoin(s);
}

// ---------- Views ----------

function splash(s, game) {
  return `<div class="splash">
    <h1>${esc(game.title)}</h1>
    <h2>The trivia game where being smart will not help you</h2>
    <ol>
      <li><b>Say "DING"</b> out loud to answer.</li>
      <li>The host is always right. <b>Especially when wrong.</b></li>
      <li>Points are made up and will be taken away.</li>
      <li>Complaining costs <b>100 points</b>.</li>
      <li>There is a dragon.</li>
    </ol>
  </div>`;
}

function board(s, game) {
  let html = `<div class="board">`;
  game.categories.forEach((c) => (html += `<div class="cell cat">${esc(c.name)}</div>`));
  for (let r = 0; r < 5; r++) {
    game.categories.forEach((c, ci) => {
      const used = state.used[clueKey(game.id, ci, r)];
      html += `<div class="cell val ${used ? "used" : ""}">${used ? "" : clueValue(r)}</div>`;
    });
  }
  return html + `</div>`;
}

function clue(s) {
  const { cat, clue, value } = clueFor(state, s.c, s.r);
  const kind = clue.kind || "q";
  const badge = {
    chaos: "CHAOS",
    minigame: "MINIGAME",
    coin: "HEADS OR TAILS",
    callback: "MEMORY TEST",
  }[kind];
  const huge = kind === "chaos" && clue.q.length < 22;
  const long = clue.q.length > 120;
  let html = `<div class="clue">
    <div class="tag">${esc(cat.name)} &middot; <b>${value}</b></div>
    ${badge ? `<div class="kind-badge">${badge}</div>` : ""}
    <div class="q ${huge ? "huge" : ""} ${long ? "long" : ""}">${fmt(clue.q)}</div>`;
  if (s.stage >= 1 && kind !== "chaos") html += `<div class="answer">${fmt(answerFor(state, clue))}</div>`;
  if (s.stage >= 2 && clue.reward) html += `<div class="twist">${fmt(clue.reward)}</div>`;
  return html + `</div>`;
}

function final(s, game) {
  const f = game.final;
  let html = `<div class="clue">
    <div class="tag"><b>Final Jeopardy</b></div>`;
  if (s.stage === 0) {
    html += `<div class="kind-badge">PLACE YOUR BETS</div>
      <div class="q huge">${esc(f.category)}</div>`;
  } else {
    html += `<div class="tag" style="top:7vh">${esc(f.category)}</div>
      <div class="q ${f.q.length < 22 ? "huge" : ""}">${fmt(f.q)}</div>`;
    if (s.stage >= 2) html += `<div class="answer">${fmt(answerFor(state, f))}</div>`;
  }
  return html + `</div>`;
}

function wheel(s) {
  const w = window.WHEELS[s.wheel];
  return `<div class="wheel-stage">
    <div class="wheel-wrap">
      <div class="pointer"></div>
      <div class="wheel-rot" id="wheelRot">${wheelSVG(s.wheel)}</div>
    </div>
    <div class="wheel-side">
      <div class="who">${s.player ? esc(s.player) + " spins" : "Spinning"}</div>
      <div class="title ${s.wheel}">${esc(w.name)}</div>
      <div id="wheelResult"></div>
    </div>
  </div>`;
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

function dragon(s) {
  return `<div class="coin-stage">
    <div class="coin-label">The dragon stirs... heads, it attacks the leader.</div>
    <div class="coin" id="coin">
      <div class="face heads">H</div>
      <div class="face tails">T</div>
    </div>
    <div class="coin-result" id="coinResult"></div>
  </div>`;
}

function leaderboard() {
  const sorted = [...state.players].sort((a, b) => b.score - a.score);
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
  const ids = state.players.map((p) => p.id + p.name).join("|");
  if (scoresEl.dataset.ids !== ids) {
    scoresEl.dataset.ids = ids;
    scoresEl.innerHTML = state.players
      .map(
        (p) => `<div class="tv-score" data-id="${p.id}">
        <div class="name">${esc(p.name)}</div>
        <div class="pts">${p.score}</div>
      </div>`
      )
      .join("");
  }
  state.players.forEach((p) => {
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
  scoresEl.style.display = state.screen && state.screen.type === "scores" ? "none" : "";
}

// ---------- Animations ----------

function startWheel(s) {
  const w = window.WHEELS[s.wheel];
  const n = w.segments.length;
  const finalAngle = wheelFinalAngle(n, s.idx, s.start);
  const seg = 360 / n;
  const rot = document.getElementById("wheelRot");
  const already = Date.now() - s.start >= SPIN_MS;
  let lastSeg = null;
  const me = {};
  anim = me;

  function frame() {
    if (anim !== me) return;
    const t = Math.min(1, (Date.now() - s.start) / SPIN_MS);
    const angle = finalAngle * easeOut(t);
    rot.style.transform = `rotate(${angle}deg)`;
    const current = Math.floor((angle + seg / 2) / seg);
    if (lastSeg !== null && current !== lastSeg && !already) Sfx.play("tick");
    lastSeg = current;
    if (t < 1) return requestAnimationFrame(frame);
    const landed = w.segments[s.idx];
    document.getElementById("wheelResult").innerHTML =
      `<div class="result">${esc(landed.label)}</div>` +
      (landed.reveal ? `<div class="result-small">${esc(landed.reveal)}</div>` : "");
    if (!already) Sfx.play(s.wheel === "good" ? "correct" : "sad");
  }
  requestAnimationFrame(frame);
}

function startCoin(s) {
  const coinEl = document.getElementById("coin");
  const tails = s.result === "tails";
  const finalAngle = 360 * 8 + (tails ? 180 : 0);
  const already = Date.now() - s.start >= COIN_MS;
  const me = {};
  anim = me;
  if (!already) Sfx.play("drumroll");

  function frame() {
    if (anim !== me) return;
    const t = Math.min(1, (Date.now() - s.start) / COIN_MS);
    const angle = finalAngle * easeOut(t);
    const hop = Math.sin(Math.PI * Math.min(1, t * 1.15)) * 18;
    coinEl.style.transform = `translateY(${-hop}vh) rotateY(${angle}deg)`;
    if (t < 1) return requestAnimationFrame(frame);
    const out = document.getElementById("coinResult");
    if (s.type === "dragon") {
      if (tails) {
        out.innerHTML = `<div class="dragon-emoji sleep">🐉</div><div class="result">THE DRAGON SLEEPS</div>`;
        if (!already) Sfx.play("whoosh");
      } else {
        out.innerHTML = `<div class="dragon-emoji">🐉</div><div class="result">THE DRAGON ATTACKS ${esc(
          (s.target || "the leader").toUpperCase()
        )}!</div><div class="result-small">Spin the Bad Wheel.</div>`;
        if (!already) Sfx.play("roar");
      }
      coinEl.style.display = "none";
      document.querySelector(".coin-label").style.display = "none";
    } else {
      out.innerHTML = `<div class="result">${tails ? "TAILS" : "HEADS"}</div>`;
      if (!already) Sfx.play("reveal");
    }
  }
  requestAnimationFrame(frame);
}

render();
