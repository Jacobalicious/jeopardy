// The host screen (phone or laptop). This owns the game: every button changes
// the state, saves it, and sends a finished picture to the TV.

let lib = loadLibrary();
let board = buildBoard(lib);
let game = loadGame();
let tvWin = null;
const undoStack = [];

const $ = (id) => document.getElementById(id);

function freshGame(teamCount = 3, oldTeams = []) {
  const teams = [];
  for (let i = 0; i < teamCount; i++) {
    teams.push({ id: uid(), name: (oldTeams[i] && oldTeams[i].name) || "Team " + (i + 1), score: 0 });
  }
  return { teams, used: {}, firstAnswer: null, screen: { type: "splash" } };
}

function loadGame() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return freshGame();
}

// ---------- Sending to the TV ----------

const Cast = {
  ready: false,
  session() {
    try {
      return this.ready ? cast.framework.CastContext.getInstance().getCurrentSession() : null;
    } catch (e) {
      return null;
    }
  },
  send(msg) {
    const s = this.session();
    if (s) s.sendMessage(window.CAST_NS, msg).catch(() => {});
  },
};

function castAppId() {
  try {
    return localStorage.getItem("jeopardy-cast-id") || window.CAST_APP_ID;
  } catch (e) {
    return window.CAST_APP_ID;
  }
}

window.__onGCastApiAvailable = (ok) => {
  const id = castAppId();
  if (!ok || !id) return;
  const ctx = cast.framework.CastContext.getInstance();
  ctx.setOptions({ receiverApplicationId: id, autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED });
  ctx.addEventListener(cast.framework.CastContextEventType.SESSION_STATE_CHANGED, (e) => {
    const S = cast.framework.SessionState;
    if (e.sessionState === S.SESSION_STARTED || e.sessionState === S.SESSION_RESUMED) {
      castImgs.clear();
      setTimeout(sendView, 300);
    }
    renderStatus();
  });
  Cast.ready = true;
  $("castWrap").hidden = false;
  renderStatus();
};

function sendView() {
  const view = buildView();
  Local.send({ t: "view", view });
  if (Cast.session()) Cast.send({ t: "view", view: castSafe(view) });
}

// Cast messages are capped at 64KB, so uploaded pictures go over in pieces
// first, and the view just refers to them by id.
const castImgs = new Set();
function hashStr(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i += 7) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36) + s.length.toString(36);
}
function castSafe(view) {
  const img = view.screen.img;
  if (!img || !img.startsWith("data:")) return view;
  const id = hashStr(img);
  if (!castImgs.has(id)) {
    const size = 48000;
    const total = Math.ceil(img.length / size);
    for (let i = 0; i < total; i++) Cast.send({ t: "img", id, i, total, data: img.slice(i * size, (i + 1) * size) });
    castImgs.add(id);
  }
  return { ...view, screen: { ...view.screen, img: "cast:" + id } };
}

function sfx(name) {
  Local.send({ t: "sfx", name });
  Cast.send({ t: "sfx", name });
  if ($("localSound").checked) Sfx.play(name);
}

function commit() {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(game));
  } catch (e) {}
  sendView();
  render();
}

function setScreen(screen) {
  game.screen = screen;
  commit();
}

// ---------- What the TV is allowed to see ----------

const BADGES = { chaos: "CHAOS", minigame: "MINIGAME", coin: "HEADS OR TAILS", callback: "MEMORY TEST" };

function findClue(qid) {
  for (const c of board.categories) {
    const clue = c.clues.find((q) => q.id === qid);
    if (clue) return { cat: c, clue };
  }
  return null;
}

function buildView() {
  const s = game.screen;
  let screen = { type: s.type };
  if (s.type === "splash") screen = { type: "splash" };
  if (s.type === "scores") screen = { type: "scores" };
  if (s.type === "board") {
    screen.cats = board.categories.map((c) => ({
      name: c.name,
      cells: c.clues.map((q) => ({ value: q.value, used: !!game.used[q.id] })),
    }));
  }
  if (s.type === "clue") {
    const found = findClue(s.qid);
    if (!found) return buildViewFor({ type: "board" });
    const { cat, clue } = found;
    screen = { type: "clue", cat: cat.name, value: clue.value, badge: BADGES[clue.kind] || "", q: clue.q };
    if (clue.img && (clue.imgAt !== "a" || s.stage >= 1)) screen.img = clue.img;
    if (s.stage >= 1 && clue.kind !== "chaos") screen.a = answerFor(game, clue);
    if (s.stage >= 2 && clue.reward) screen.twist = clue.reward;
  }
  if (s.type === "final") {
    const f = board.final || { category: "?", q: "?" };
    screen = { type: "final", stage: s.stage, category: f.category };
    if (s.stage >= 1) screen.q = f.q;
    if (s.stage >= 2 && f.kind !== "chaos") screen.a = answerFor(game, f);
    if (s.stage >= 2 && f.kind === "chaos") screen.a = f.a;
  }
  if (s.type === "coin") screen = { type: "coin", id: s.id, result: s.result, label: s.label };
  return { title: lib.title, teams: game.teams, screen };
}

function buildViewFor(screen) {
  game.screen = screen;
  return buildView();
}

// ---------- Rendering ----------

function render() {
  renderBoard();
  renderLive();
  renderTeams();
  renderCoin();
  renderStatus();
}

function renderStatus() {
  const s = Cast.session();
  let text = "";
  if (s) text = "📺 " + (s.getCastDevice().friendlyName || "TV");
  else if (tvWin && !tvWin.closed) text = "TV window open";
  $("tvStatus").textContent = text;
  $("castSetup").hidden = !!castAppId();
}

function renderBoard() {
  const s = game.screen;
  const n = board.categories.length;
  const icons = { chaos: "⚡", minigame: "🎮", coin: "🪙", callback: "🧠" };
  let html = "";
  board.categories.forEach((c) => (html += `<div class="hcell cat">${esc(c.name)}</div>`));
  for (let r = 0; r < board.rows; r++) {
    board.categories.forEach((c) => {
      const q = c.clues[r];
      if (!q) return (html += `<div class="hcell empty"></div>`);
      const used = game.used[q.id];
      const live = s.type === "clue" && s.qid === q.id;
      html += `<button class="hcell ${used ? "used" : ""} ${live ? "live" : ""}" data-q="${q.id}">${q.value}<span class="k">${
        icons[q.kind] || ""
      }</span></button>`;
    });
  }
  if (!n) html = `<p class="hint">No categories are switched on. Open <a href="editor.html">Questions</a> to build the board.</p>`;
  $("hboard").style.gridTemplateColumns = `repeat(${Math.max(n, 1)}, minmax(0, 1fr))`;
  $("hboard").innerHTML = html;
}

function scoreButtons(value) {
  return `<div class="quick-scores">${game.teams
    .map(
      (t) => `<div class="qs">
        <span class="qs-name">${esc(t.name)}</span>
        <span class="qs-score ${t.score < 0 ? "neg" : ""}">${t.score}</span>
        <button class="btn small good" data-add="${value}" data-id="${t.id}">+${value}</button>
        <button class="btn small bad" data-add="${-value}" data-id="${t.id}">−${value}</button>
      </div>`
    )
    .join("")}</div>`;
}

function renderLive() {
  const s = game.screen;
  const el = $("live");
  const active = s.type === "clue" || s.type === "final";
  el.classList.toggle("active", active);
  $("backdrop").classList.toggle("active", active);
  document.body.classList.toggle("sheet-open", active);

  if (s.type === "clue") {
    const found = findClue(s.qid);
    if (!found) return setScreen({ type: "board" });
    const { cat, clue } = found;
    const kind = clue.kind || "q";
    const isChaos = kind === "chaos";
    el.innerHTML = `
      <h3><span class="onair">ON TV</span><span class="grow">${esc(cat.name)} · ${clue.value}${
      kind !== "q" ? " · " + kind : ""
    }</span></h3>
      <div class="hq">${fmt(clue.q)}</div>
      ${clue.img ? `<img class="hpic" src="${esc(clue.img)}" alt="" />${clue.imgAt === "a" ? `<div class="hint">Picture shows on the TV with the answer.</div>` : ""}` : ""}
      <div class="hanswer secret"><div class="lbl">${isChaos ? "What happens" : "Answer"}${
      s.stage >= 1 && !isChaos ? " · on TV" : ""
    }</div><div class="txt">${fmt(answerFor(game, clue))}</div></div>
      ${clue.note ? `<div class="hnote secret"><div class="lbl">Host note</div>${fmt(clue.note)}</div>` : ""}
      ${
        clue.reward
          ? `<div class="htwist secret"><div class="lbl">Twist${s.stage >= 2 ? " · on TV" : ""}</div>${fmt(clue.reward)}</div>`
          : ""
      }
      <div class="row">
        ${!isChaos ? `<button class="btn primary" id="revealA" ${s.stage >= 1 ? "disabled" : ""}>Reveal answer</button>` : ""}
        ${clue.reward ? `<button class="btn primary" id="revealT" ${s.stage >= 2 ? "disabled" : ""}>Reveal twist</button>` : ""}
        ${kind === "coin" ? `<button class="btn" id="liveCoin">Flip the coin</button>` : ""}
      </div>
      ${scoreButtons(clue.value)}
      <div class="row sheet-actions">
        <button class="btn good big" id="done">Done → board</button>
        <button class="btn ghost" id="cancel">Cancel</button>
      </div>`;
    return;
  }

  if (s.type === "final") {
    const f = board.final;
    if (!f) {
      el.innerHTML = `<p class="hint">No Final Jeopardy picked. Choose one in Questions.</p><button class="btn" id="cancel">Back</button>`;
      return;
    }
    el.innerHTML = `
      <h3><span class="onair">ON TV</span><span class="grow">Final Jeopardy · ${esc(f.category)}</span></h3>
      <div class="hq">${fmt(f.q)}</div>
      <div class="hanswer secret"><div class="lbl">Answer</div><div class="txt">${fmt(answerFor(game, f))}</div></div>
      ${f.note ? `<div class="hnote secret"><div class="lbl">Host note</div>${fmt(f.note)}</div>` : ""}
      <div class="row">
        <button class="btn primary" id="finalNext" ${s.stage >= 2 ? "disabled" : ""}>${
      s.stage === 0 ? "Bets are in → show question" : "Reveal answer"
    }</button>
        ${f.kind === "coin" ? `<button class="btn" id="liveCoin">Flip the coin</button>` : ""}
      </div>
      <p class="hint" style="margin-top:12px">Type each team's bet, then ✓ or ✗ once you've read their answers.</p>
      ${game.teams
        .map(
          (t) => `<div class="qs">
          <span class="qs-name">${esc(t.name)}</span>
          <input type="number" inputmode="numeric" class="wager" data-id="${t.id}" placeholder="bet" />
          <button class="btn small good" data-wager="1" data-id="${t.id}">✓</button>
          <button class="btn small bad" data-wager="-1" data-id="${t.id}">✗</button>
        </div>`
        )
        .join("")}
      <div class="row sheet-actions">
        <button class="btn good big" data-screen-go="scores">Show standings</button>
        <button class="btn ghost" id="cancel">Close</button>
      </div>`;
    return;
  }

  el.innerHTML = "";
}

function renderTeams() {
  $("teamCount").textContent = game.teams.length;
  const el = $("teams");
  // Don't redraw while a name is being typed, or the keyboard jumps.
  if (document.activeElement && document.activeElement.classList.contains("pname") && el.contains(document.activeElement)) {
    game.teams.forEach((t) => {
      const sc = el.querySelector(`.score[data-id="${t.id}"]`);
      if (sc) sc.textContent = t.score;
    });
    return;
  }
  el.innerHTML = game.teams
    .map(
      (t) => `<div class="player">
      <input type="text" class="pname" data-id="${t.id}" value="${esc(t.name)}" />
      <div class="score ${t.score < 0 ? "neg" : ""}" data-id="${t.id}">${t.score}</div>
      <div class="acts">
        <input type="number" inputmode="numeric" class="custom" data-id="${t.id}" placeholder="±" />
        <button class="btn small" data-custom="${t.id}">Add</button>
      </div>
    </div>`
    )
    .join("");
}

function renderCoin() {
  const s = game.screen;
  const landed = $("landed");
  landed.hidden = s.type !== "coin";
  if (s.type === "coin") landed.innerHTML = `Coin: <b>${s.result.toUpperCase()}</b>`;
  $("backBtn").hidden = !(s.type === "coin" && s.back);
}

// ---------- Actions ----------

function openClue(qid) {
  game.screen = { type: "clue", qid, stage: 0 };
  commit();
  sfx("whoosh");
}

function advance() {
  const s = game.screen;
  if (s.type === "clue") {
    const found = findClue(s.qid);
    if (!found) return;
    const { clue } = found;
    if (clue.kind === "chaos") {
      if (!clue.reward || s.stage >= 2) return;
      s.stage = 2;
    } else if (s.stage === 0) s.stage = 1;
    else if (s.stage === 1 && clue.reward) s.stage = 2;
    else return;
    commit();
    sfx("reveal");
  } else if (s.type === "final" && s.stage < 2) {
    s.stage++;
    commit();
    sfx("reveal");
  }
}

function finishClue() {
  const s = game.screen;
  if (s.type !== "clue") return setScreen({ type: "board" });
  const found = findClue(s.qid);
  game.used[s.qid] = true;
  if (found && !game.firstAnswer && !found.clue.kind) game.firstAnswer = found.clue.a;
  setScreen({ type: "board" });
}

function addScore(id, amount) {
  const t = game.teams.find((x) => x.id === id);
  if (!t || !amount) return;
  t.score += amount;
  undoStack.push({ id, amount });
  commit();
}

function flipCoin(label) {
  const rig = $("rigCoin").value;
  const result = rig || (Math.random() < 0.5 ? "heads" : "tails");
  const cur = game.screen;
  const back = cur.type === "coin" ? cur.back : cur;
  game.screen = { type: "coin", id: uid(), result, label: label || "Heads or tails?", back };
  commit();
  sfx("drumroll");
}

function reloadLibrary() {
  lib = loadLibrary();
  board = buildBoard(lib);
  commit();
}

// ---------- Wiring ----------

$("openTv").onclick = () => {
  tvWin = window.open("tv.html", "jeopardy-tv", "popup=yes,width=1280,height=760");
  setTimeout(() => {
    sendView();
    renderStatus();
  }, 800);
};

$("blur").onchange = (e) => {
  document.body.classList.toggle("blur", e.target.checked);
  try {
    localStorage.setItem("jeopardy-blur", e.target.checked ? "1" : "");
  } catch (err) {}
};

$("localSound").onchange = (e) => {
  if (e.target.checked) Sfx.unlock();
  try {
    localStorage.setItem("jeopardy-local-sound", e.target.checked ? "1" : "");
  } catch (err) {}
};

$("reset").onclick = () => {
  if (!confirm("Start a new game? Scores go to 0 and every square comes back. Team names stay.")) return;
  game = freshGame(game.teams.length, game.teams);
  undoStack.length = 0;
  commit();
};

$("teamPlus").onclick = () => {
  if (game.teams.length >= 12) return;
  game.teams.push({ id: uid(), name: "Team " + (game.teams.length + 1), score: 0 });
  commit();
};

$("teamMinus").onclick = () => {
  if (game.teams.length <= 1) return;
  const last = game.teams[game.teams.length - 1];
  if (last.score !== 0 && !confirm(`Remove ${last.name}? They have ${last.score} points.`)) return;
  game.teams.pop();
  commit();
};

$("sounds").innerHTML = SOUND_BUTTONS.map(([k, label]) => `<button class="btn small" data-sfx="${k}">${label}</button>`).join("");
$("sounds").onclick = (e) => {
  const b = e.target.closest("[data-sfx]");
  if (b) sfx(b.dataset.sfx);
};

document.querySelectorAll("[data-screen]").forEach((b) => (b.onclick = () => setScreen({ type: b.dataset.screen })));

$("finalBtn").onclick = () => setScreen({ type: "final", stage: 0 });
$("coinBtn").onclick = () => flipCoin();
$("backBtn").onclick = () => setScreen(game.screen.back || { type: "board" });
$("backdrop").onclick = () => {};

$("castSave").onclick = () => {
  const id = $("castId").value.trim();
  if (!id) return;
  try {
    localStorage.setItem("jeopardy-cast-id", id);
  } catch (e) {}
  location.reload();
};

$("undo").onclick = () => {
  const last = undoStack.pop();
  if (!last) return;
  const t = game.teams.find((x) => x.id === last.id);
  if (t) t.score -= last.amount;
  commit();
};

$("hboard").onclick = (e) => {
  const b = e.target.closest("button[data-q]");
  if (b) openClue(b.dataset.q);
};

function scoreClick(e) {
  const t = e.target;
  if (t.dataset.add) {
    addScore(t.dataset.id, Number(t.dataset.add));
    sfx(Number(t.dataset.add) > 0 ? "correct" : "buzzer");
  }
}

$("live").onclick = (e) => {
  const t = e.target;
  scoreClick(e);
  if (t.id === "revealA" || t.id === "finalNext") advance();
  if (t.id === "revealT") {
    game.screen.stage = 2;
    commit();
    sfx("reveal");
  }
  if (t.id === "done") finishClue();
  if (t.id === "cancel") setScreen({ type: "board" });
  if (t.dataset.screenGo) setScreen({ type: t.dataset.screenGo });
  if (t.id === "liveCoin") {
    const s = game.screen;
    const label = s.type === "final" ? board.final.q : findClue(s.qid).clue.q;
    flipCoin(label);
  }
  if (t.dataset.wager) {
    const input = document.querySelector(`.wager[data-id="${t.dataset.id}"]`);
    const bet = Math.abs(Number(input.value) || 0);
    addScore(t.dataset.id, bet * Number(t.dataset.wager));
    sfx(t.dataset.wager === "1" ? "correct" : "buzzer");
  }
};

$("teams").onclick = (e) => {
  const t = e.target;
  if (t.dataset.custom) {
    const input = document.querySelector(`.custom[data-id="${t.dataset.custom}"]`);
    addScore(t.dataset.custom, Number(input.value) || 0);
    input.value = "";
  }
};

$("teams").addEventListener("input", (e) => {
  if (!e.target.classList.contains("pname")) return;
  const t = game.teams.find((x) => x.id === e.target.dataset.id);
  if (t) {
    t.name = e.target.value;
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(game));
    } catch (err) {}
    sendView();
  }
});

$("teams").addEventListener("keydown", (e) => {
  if (e.target.classList.contains("custom") && e.key === "Enter") {
    document.querySelector(`[data-custom="${e.target.dataset.id}"]`).click();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.target.matches("input, select, textarea")) return;
  const k = e.key.toLowerCase();
  const keys = { d: "ding", c: "correct", x: "buzzer", s: "sad", a: "airhorn", b: "boom" };
  if (k === " ") {
    e.preventDefault();
    advance();
  } else if (k === "escape") finishClue();
  else if (keys[k]) sfx(keys[k]);
});

// Questions may have been edited in another tab.
window.addEventListener("focus", reloadLibrary);
window.addEventListener("storage", (e) => {
  if (e.key === LIB_KEY) reloadLibrary();
});

try {
  if (localStorage.getItem("jeopardy-blur")) {
    $("blur").checked = true;
    document.body.classList.add("blur");
  }
  if (localStorage.getItem("jeopardy-local-sound")) $("localSound").checked = true;
} catch (e) {}

importFromHash().then((loaded) => {
  if (loaded) reloadLibrary();
});
commit();
