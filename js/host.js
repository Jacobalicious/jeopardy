// The host screen (phone or laptop). This owns the game: every button changes
// the state, saves it, and sends a finished picture to the TV.

let lib = loadLibrary();
let board = buildBoard(lib);
let game = loadGame();
let tvWin = null;
let theme = applyTheme(savedTheme());
const undoStack = [];

const $ = (id) => document.getElementById(id);

function freshGame(teamCount = 3, oldTeams = []) {
  const teams = [];
  for (let i = 0; i < teamCount; i++) {
    teams.push({ id: uid(), name: (oldTeams[i] && oldTeams[i].name) || "Team " + (i + 1), score: 0 });
  }
  const g = { teams, used: {}, first: null, doubleCount: 2, doubles: [], screen: { type: "splash" } };
  return g;
}

// ---------- Double points ----------
// A few squares are secretly worth double. Only the host board shows which.

function isDouble(qid) {
  return (game.doubles || []).includes(qid);
}

// Keeps the right number of double squares on the current board, re-rolling
// any that were removed. Squares already played keep their status.
function rollDoubles() {
  if (game.doubleCount == null) game.doubleCount = 2;
  const ids = board.categories.flatMap((c) => c.clues.map((q) => q.id));
  game.doubles = (game.doubles || []).filter((id) => ids.includes(id));
  const open = ids.filter((id) => !game.doubles.includes(id) && !game.used[id]);
  while (game.doubles.length > game.doubleCount) game.doubles.pop();
  while (game.doubles.length < game.doubleCount && open.length) {
    game.doubles.push(open.splice(Math.floor(Math.random() * open.length), 1)[0]);
  }
}

function clueWorth(qid, value) {
  return isDouble(qid) ? value * 2 : value;
}

function loadGame() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return freshGame();
}

// ---------- Sending to the TV ----------

// Uses Google's basic Cast API (chrome.cast), which works in Chrome on both
// computers and Android. The fancier "Cast framework" doesn't load on Android.
const Cast = {
  s: null, // the current session
  status: "Looking for Chromecast support...",
  available: false,
  session() {
    return this.s;
  },
  send(msg) {
    if (this.s) this.s.sendMessage(window.CAST_NS, msg, () => {}, () => {});
  },
};

function castStatus(text) {
  Cast.status = text;
  renderStatus();
}

function castStarted(session) {
  Cast.s = session;
  castImgs.clear();
  session.addUpdateListener((alive) => {
    if (!alive) {
      Cast.s = null;
      castStatus("Stopped casting.");
    }
  });
  castStatus("Casting to " + ((session.receiver && session.receiver.friendlyName) || "the TV") + ".");
  setTimeout(sendView, 300);
}

function castClick() {
  if (!window.chrome || !chrome.cast || !chrome.cast.requestSession) {
    return castStatus(Cast.status);
  }
  if (Cast.s) {
    if (confirm("Stop casting to the TV?")) {
      Cast.s.stop(
        () => {},
        () => {}
      );
      Cast.s = null;
      castStatus("Stopped casting.");
    }
    return;
  }
  castStatus("Pick your TV...");
  chrome.cast.requestSession(castStarted, (err) => {
    const why = {
      cancel: "Cancelled.",
      timeout: "The TV didn't answer in time. Try again.",
      receiver_unavailable: "No Chromecast found. Is your phone on the same Wi-Fi as the TV?",
      session_error: "The Chromecast couldn't open the game. Try again in a minute.",
      extension_missing: "This browser can't cast. Use Chrome.",
    };
    castStatus(why[err && err.code] || "Couldn't connect (" + ((err && err.code) || "unknown") + ").");
  });
}

// If the Cast library never shows up, say so instead of leaving a dead button.
setTimeout(() => {
  if (!window.chrome || !chrome.cast || !chrome.cast.isAvailable) {
    if (Cast.status.startsWith("Looking")) castStatus("This browser doesn't support casting. Use Chrome.");
  }
}, 8000);

function castAppId() {
  try {
    return localStorage.getItem("jeopardy-cast-id") || window.CAST_APP_ID;
  } catch (e) {
    return window.CAST_APP_ID;
  }
}

window.__onGCastApiAvailable = (ok, err) => {
  const id = castAppId();
  if (!ok) return castStatus("Casting isn't available in this browser" + (err ? " (" + err + ")" : "") + ".");
  if (!id) return castStatus("Chromecast isn't set up yet.");
  const request = new chrome.cast.SessionRequest(id);
  const config = new chrome.cast.ApiConfig(
    request,
    castStarted, // rejoins a game that's already on the TV
    (availability) => {
      Cast.available = availability === chrome.cast.ReceiverAvailability.AVAILABLE;
      if (!Cast.s) castStatus(Cast.available ? "Chromecast found. Tap Cast." : "No Chromecast found yet. Same Wi-Fi as the TV?");
    },
    chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
  );
  chrome.cast.initialize(
    config,
    () => castStatus("Ready. Tap Cast to pick your TV."),
    (e) => castStatus("Casting failed to start (" + ((e && e.code) || "unknown") + ").")
  );
};

function sendView() {
  const view = buildView();
  view.theme = theme;
  Local.send({ t: "view", view });
  if (Cast.session()) Cast.send({ t: "view", view: chunked(view, (m) => Cast.send(m), castImgs) });
  if (room && room.isConnected()) {
    room.send("view", { t: "view", view: chunked(view, (m) => room.send("event", m), roomImgs) }, true);
  }
}

// ---------- Any TV, via room code ----------

let room = null;
const roomImgs = new Set();
let roomTvSeen = false;

function roomConnect(code) {
  code = cleanRoomCode(code);
  if (room) room.close();
  room = null;
  roomTvSeen = false;
  if (code.length !== 4) return renderRoom();
  try {
    localStorage.setItem("jeopardy-room", code);
  } catch (e) {}
  room = Relay(code, {
    subscribe: ["hello"],
    onMessage: () => {
      // The TV just opened or reconnected: send it everything again.
      roomTvSeen = true;
      roomImgs.clear();
      sendView();
      renderRoom();
    },
    onStatus: (up) => {
      if (up) {
        roomImgs.clear();
        sendView();
        room.send("event", { t: "ping" }); // ask the TV to say hello
      }
      renderRoom();
    },
  });
  renderRoom();
}

function roomDisconnect() {
  if (room) room.close();
  room = null;
  try {
    localStorage.removeItem("jeopardy-room");
  } catch (e) {}
  renderRoom();
}

function renderRoom() {
  const on = !!room;
  $("roomForm").hidden = on;
  $("roomOn").hidden = !on;
  if (!on) return;
  $("roomCodeShown").textContent = room.code;
  $("roomState").textContent = !room.isConnected()
    ? "Connecting..."
    : roomTvSeen
    ? "TV connected."
    : "Connected. If the TV isn't showing the game yet, check the code matches.";
}

// Cast and relay messages are small, so uploaded pictures go over in pieces
// first, and the view just refers to them by id.
const castImgs = new Set();
function hashStr(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i += 7) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36) + s.length.toString(36);
}
function chunked(view, send, sent) {
  const img = view.screen.img;
  if (!img || !img.startsWith("data:")) return view;
  const id = hashStr(img);
  if (!sent.has(id)) {
    const size = 48000;
    const total = Math.ceil(img.length / size);
    for (let i = 0; i < total; i++) send({ t: "img", id, i, total, data: img.slice(i * size, (i + 1) * size) });
    sent.add(id);
  }
  return { ...view, screen: { ...view.screen, img: "cast:" + id } };
}

function sfx(name) {
  Local.send({ t: "sfx", name });
  Cast.send({ t: "sfx", name });
  if (room) room.send("event", { t: "sfx", name });
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
    if (s.stage < 0) return { title: lib.title, teams: game.teams, screen: { type: "double", cat: cat.name, value: clue.value } };
    screen = { type: "clue", cat: cat.name, value: clue.value, badge: BADGES[clue.kind] || "", q: clue.q };
    if (isDouble(s.qid)) screen.doubled = true;
    if (clue.img && (clue.imgAt !== "a" || s.stage >= 1)) screen.img = clue.img;
    if (s.board) screen.board = s.board;
    if (s.stage >= 1 && clue.kind !== "chaos") screen.a = answerFor(game, clue);
    if (s.stage >= 2 && clue.reward) screen.twist = clue.reward;
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
  renderSwap();
  renderDoubles();
  renderCoin();
  renderStatus();
}

function renderStatus() {
  const btn = $("castBtn");
  btn.classList.toggle("on", !!Cast.s);
  btn.textContent = Cast.s ? "📺 Casting" : "📺 Cast";
  $("castStatus").textContent = Cast.status;
  $("tvStatus").textContent = !Cast.s && tvWin && !tvWin.closed ? "TV window open" : "";
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
      const dbl = isDouble(q.id) ? `<span class="x2">2×</span>` : "";
      html += `<button class="hcell ${used ? "used" : ""} ${live ? "live" : ""}" data-q="${q.id}">${q.value}${dbl}<span class="k">${
        icons[q.kind] || ""
      }</span></button>`;
    });
  }
  if (!n) html = `<p class="hint">No categories are switched on. Open <a href="editor.html">Questions</a> to build the board.</p>`;
  $("hboard").style.gridTemplateColumns = `repeat(${Math.max(n, 1)}, minmax(0, 1fr))`;
  $("hboard").innerHTML = html;
}

function scoreButtons(value) {
  return `<div class="quick-scores">
    <div class="sfx-row">
      <button class="btn big-sfx ding" data-sfx-live="ding">🔔 Ding</button>
      <button class="btn big-sfx wrong" data-sfx-live="buzzer">❌ Wrong</button>
    </div>
    ${game.teams
      .map(
        (t) => `<div class="qs big">
        <span class="qs-name">${esc(t.name)}</span>
        <span class="qs-score ${t.score < 0 ? "neg" : ""}">${t.score}</span>
        <button class="btn good pts" data-add="${value}" data-id="${t.id}">+${value}</button>
        <button class="btn bad pts" data-add="${-value}" data-id="${t.id}">−${value}</button>
      </div>`
      )
      .join("")}</div>`;
}

function renderLive() {
  const s = game.screen;
  const el = $("live");
  const active = s.type === "clue";
  el.classList.toggle("active", active);
  $("backdrop").classList.toggle("active", active);
  document.body.classList.toggle("sheet-open", active);

  if (s.type === "clue") {
    const found = findClue(s.qid);
    if (!found) return setScreen({ type: "board" });
    const { cat, clue } = found;
    const kind = clue.kind || "q";
    const isChaos = kind === "chaos";
    const worth = clueWorth(s.qid, clue.value);
    const dbl = isDouble(s.qid);
    el.innerHTML = `
      <h3><span class="onair">ON TV</span><span class="grow">${esc(cat.name)} · ${worth}${dbl ? " (double)" : ""}${
      kind !== "q" ? " · " + kind : ""
    }</span></h3>
      ${
        dbl && s.stage < 0
          ? `<div class="double-banner">🎉 DOUBLE POINTS square! The TV is showing the Double Points screen.
              <button class="btn primary" id="showQ">Show the question</button></div>`
          : ""
      }
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
        ${!isChaos ? `<button class="btn primary" id="revealA" ${s.stage >= 1 || s.stage < 0 ? "disabled" : ""}>Reveal answer</button>` : ""}
        ${clue.reward ? `<button class="btn primary" id="revealT" ${s.stage >= 2 ? "disabled" : ""}>Reveal twist</button>` : ""}
        ${kind === "coin" ? `<button class="btn" id="liveCoin">Flip the coin</button>` : ""}
      </div>
      ${s.board ? boardControls(s.board) : ""}
      ${scoreButtons(worth)}
      <div class="row sheet-actions">
        <button class="btn good big" id="done">Done → board</button>
        <button class="btn ghost" id="cancel">Cancel</button>
      </div>`;
    return;
  }

  el.innerHTML = "";
}

function boardControls(b) {
  const names = PIECE_NAMES[b.type];
  const status = b.result
    ? b.result === "draw"
      ? "It's a draw."
      : names[b.result] + " wins!"
    : names[b.turn] + "'s turn. " + (b.type === "connect4" ? "Tap a column to drop a piece." : "Tap a square.");
  let cells = "";
  b.cells.forEach((v, i) => {
    cells += `<button class="gcell ${b.type} ${v ? "p" + v : ""}" data-cell="${i}">${b.type === "tictactoe" ? v : ""}</button>`;
  });
  return `<div class="gctl">
    <div class="hint"><b>${status}</b></div>
    <div class="gboard" style="grid-template-columns:repeat(${b.cols},1fr);max-width:${Math.min(360, b.cols * 60)}px">${cells}</div>
    <div class="row"><button class="btn small" id="boardReset">Reset board</button></div>
  </div>`;
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

function renderSwap() {
  ["swapA", "swapB"].forEach((id, n) => {
    const sel = $(id);
    const prev = sel.value;
    sel.innerHTML = game.teams.map((t) => `<option value="${t.id}">${esc(t.name)}</option>`).join("");
    if (game.teams.some((t) => t.id === prev)) sel.value = prev;
    else if (game.teams[n]) sel.value = game.teams[n].id;
  });
}

function renderDoubles() {
  $("doubleCount").textContent = game.doubleCount;
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
  // Double squares start on the Double Points screen (stage -1).
  game.screen = { type: "clue", qid, stage: isDouble(qid) ? -1 : 0 };
  const found = findClue(qid);
  if (found && found.clue.game) game.screen.board = newBoard(found.clue.game);
  // Remember the first question of the night for the memory-test question.
  if (found && !game.first) {
    const { cat, clue } = found;
    game.first = {
      qid,
      cat: cat.name,
      value: clue.value,
      q: clue.q.replace(/\n/g, " "),
      // Chaos squares have no real answer, so remember what they said instead.
      a: clue.kind === "chaos" ? clue.q.replace(/\n/g, " ") : clue.a,
    };
  }
  commit();
  sfx(isDouble(qid) ? "airhorn" : "whoosh");
}

function advance() {
  const s = game.screen;
  if (s.type === "clue") {
    const found = findClue(s.qid);
    if (!found) return;
    const { clue } = found;
    if (s.stage < 0) s.stage = 0;
    else if (clue.kind === "chaos") {
      if (!clue.reward || s.stage >= 2) return;
      s.stage = 2;
    } else if (s.stage === 0) s.stage = 1;
    else if (s.stage === 1 && clue.reward) s.stage = 2;
    else return;
    commit();
    sfx("reveal");
  }
}

function finishClue() {
  const s = game.screen;
  if (s.type !== "clue") return setScreen({ type: "board" });
  const found = findClue(s.qid);
  game.used[s.qid] = true;
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
  rollDoubles();
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

// ---------- Theme ----------



function renderThemes() {
  $("themes").innerHTML = THEMES.map(
    (t) => `<button class="theme-pick ${t.id === theme ? "on" : ""}" data-theme-id="${t.id}">
      <span class="swatch">${t.colors.map((c) => `<i style="background:${c}"></i>`).join("")}</span>
      <span class="tname" style="font-family:'${t.font}',sans-serif">${esc(t.name)}</span>
    </button>`
  ).join("");
}

function setTheme(id) {
  theme = applyTheme(id);
  saveTheme(theme);
  renderThemes();
  sendView();
}

$("themes").onclick = (e) => {
  const b = e.target.closest("[data-theme-id]");
  if (b) setTheme(b.dataset.themeId);
};

// The comparison page (themes.html) can pick one too.
window.addEventListener("storage", (e) => {
  if (e.key === THEME_KEY && e.newValue && e.newValue !== theme) setTheme(e.newValue);
});
window.addEventListener("focus", () => {
  if (savedTheme() !== theme) setTheme(savedTheme());
});

renderThemes();

$("localSound").onchange = (e) => {
  if (e.target.checked) Sfx.unlock();
  try {
    localStorage.setItem("jeopardy-local-sound", e.target.checked ? "1" : "");
  } catch (err) {}
};

$("reset").onclick = () => {
  if (!confirm("Start a new game? Scores go to 0 and every square comes back. Team names stay.")) return;
  const count = game.doubleCount;
  game = freshGame(game.teams.length, game.teams);
  game.doubleCount = count == null ? 2 : count;
  rollDoubles();
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

$("castBtn").onclick = castClick;

function setDoubleCount(n) {
  game.doubleCount = Math.max(0, Math.min(10, n));
  rollDoubles();
  commit();
}
$("dblMinus").onclick = () => setDoubleCount(game.doubleCount - 1);
$("dblPlus").onclick = () => setDoubleCount(game.doubleCount + 1);
$("dblReroll").onclick = () => {
  game.doubles = (game.doubles || []).filter((id) => game.used[id]);
  rollDoubles();
  commit();
};

$("resetQs").onclick = () => {
  if (!confirm("Put the questions back to the built-in set? Edits made on this device are lost. Scores and teams stay.")) return;
  resetQuestions();
  reloadLibrary();
};

$("factory").onclick = () => {
  if (!confirm("Factory reset? This erases EVERYTHING saved on this device: question edits, uploaded pictures, teams, scores and settings.")) return;
  factoryReset();
  location.replace(location.pathname);
};
$("roomBtn").onclick = () => roomConnect($("roomInput").value);
$("roomInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") roomConnect(e.target.value);
});
$("roomInput").addEventListener("input", (e) => {
  const v = cleanRoomCode(e.target.value);
  if (v !== e.target.value) e.target.value = v;
});
$("roomOff").onclick = roomDisconnect;

// Phones pause pages in the background; catch the TV up when we come back.
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) sendView();
});
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

$("swapBtn").onclick = () => {
  const a = game.teams.find((t) => t.id === $("swapA").value);
  const b = game.teams.find((t) => t.id === $("swapB").value);
  if (!a || !b || a === b) return;
  const diff = b.score - a.score;
  a.score += diff;
  b.score -= diff;
  undoStack.push({ id: a.id, amount: diff }, { id: b.id, amount: -diff });
  commit();
  sfx("whoosh");
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
  if (t.id === "revealA") advance();
  if (t.dataset.sfxLive) sfx(t.dataset.sfxLive);
  if (t.id === "showQ") advance();
  if (t.id === "revealT") {
    game.screen.stage = 2;
    commit();
    sfx("reveal");
  }
  if (t.dataset.cell && game.screen.board) {
    const next = boardMove(game.screen.board, Number(t.dataset.cell));
    if (next) {
      game.screen.board = next;
      commit();
      sfx(next.result ? (next.result === "draw" ? "sad" : "correct") : "drop");
    }
  }
  if (t.id === "boardReset") {
    const { clue } = findClue(game.screen.qid);
    game.screen.board = newBoard(clue.game);
    commit();
  }
  if (t.id === "done") finishClue();
  if (t.id === "cancel") {
    // A question opened by mistake doesn't count as the first of the night.
    if (game.first && game.first.qid === game.screen.qid && !game.used[game.screen.qid]) game.first = null;
    setScreen({ type: "board" });
  }
  if (t.dataset.screenGo) setScreen({ type: t.dataset.screenGo });
  if (t.id === "liveCoin") {
    const s = game.screen;
    const label = findClue(s.qid).clue.q;
    flipCoin(label);
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

try {
  const savedRoom = localStorage.getItem("jeopardy-room");
  if (savedRoom) roomConnect(savedRoom);
} catch (e) {}
renderRoom();

rollDoubles();

importFromHash().then((loaded) => {
  if (loaded) reloadLibrary();
});
commit();
