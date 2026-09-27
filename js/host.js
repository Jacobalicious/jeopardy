// The host screen. This window owns the game: every button changes the state,
// saves it, and sends it to the TV window.

let state = loadState();
let tvWin = null;
const undoStack = [];

const $ = (id) => document.getElementById(id);

function commit() {
  Sync.publish(state);
  render();
}

function sfx(name) {
  Sync.event({ type: "sfx", name });
}

function setScreen(screen) {
  state.screen = screen;
  commit();
}

// ---------- Rendering ----------

function render() {
  renderGamePick();
  renderBoard();
  renderLive();
  renderPlayers();
  renderChaos();
  $("tvStatus").textContent = tvWin && !tvWin.closed ? "TV window is open" : "";
}

function renderGamePick() {
  const pick = $("gamePick");
  if (!pick.options.length) {
    window.GAMES.forEach((g) => pick.add(new Option(g.title, g.id)));
  }
  pick.value = state.gameId;
}

function renderBoard() {
  const game = findGame(state.gameId);
  const s = state.screen;
  let html = "";
  game.categories.forEach((c) => (html += `<div class="hcell cat">${esc(c.name)}</div>`));
  const icons = { chaos: "⚡", minigame: "🎮", coin: "🪙", callback: "🧠" };
  for (let r = 0; r < 5; r++) {
    game.categories.forEach((c, ci) => {
      const used = state.used[clueKey(game.id, ci, r)];
      const live = s.type === "clue" && s.c === ci && s.r === r;
      const k = icons[c.clues[r].kind] || "";
      html += `<button class="hcell ${used ? "used" : ""} ${live ? "live" : ""}" data-c="${ci}" data-r="${r}" title="${esc(
        c.clues[r].q
      )}">${clueValue(r)}<span class="k">${k}</span></button>`;
    });
  }
  $("hboard").innerHTML = html;
}

function renderLive() {
  const s = state.screen;
  const el = $("live");
  const game = findGame(state.gameId);

  if (s.type === "clue") {
    const { cat, clue, value } = clueFor(state, s.c, s.r);
    const kind = clue.kind || "q";
    const isChaos = kind === "chaos";
    el.innerHTML = `
      <h3><span class="onair">ON TV</span><span class="grow">${esc(cat.name)} · ${value}${
      kind !== "q" ? " · " + kind : ""
    }</span></h3>
      <div class="hq">${fmt(clue.q)}</div>
      <div class="hanswer secret"><div class="lbl">${isChaos ? "What happens" : "Answer"}${
      s.stage >= 1 ? " (revealed)" : ""
    }</div><div class="txt">${fmt(answerFor(state, clue))}</div></div>
      ${clue.note ? `<div class="hnote secret"><div class="lbl">Host note</div>${fmt(clue.note)}</div>` : ""}
      ${
        clue.reward
          ? `<div class="htwist secret"><div class="lbl">Twist${s.stage >= 2 ? " (revealed)" : ""}</div>${fmt(
              clue.reward
            )}</div>`
          : ""
      }
      <div class="row">
        ${!isChaos ? `<button class="btn primary" id="revealA" ${s.stage >= 1 ? "disabled" : ""}>Reveal answer</button>` : ""}
        ${clue.reward ? `<button class="btn primary" id="revealT" ${s.stage >= 2 ? "disabled" : ""}>Reveal twist</button>` : ""}
        ${kind === "coin" ? `<button class="btn" id="liveCoin">Flip the coin</button>` : ""}
        <button class="btn good" id="done">Done → board</button>
        <button class="btn ghost" id="cancel">Cancel (keep square)</button>
      </div>`;
    return;
  }

  if (s.type === "final") {
    const f = game.final;
    el.innerHTML = `
      <h3><span class="onair">ON TV</span><span class="grow">Final Jeopardy · ${esc(f.category)}</span></h3>
      <div class="hq">${fmt(f.q)}</div>
      <div class="hanswer secret"><div class="lbl">Answer</div><div class="txt">${fmt(answerFor(state, f))}</div></div>
      ${f.note ? `<div class="hnote secret"><div class="lbl">Host note</div>${fmt(f.note)}</div>` : ""}
      <div class="row">
        <button class="btn primary" id="finalNext" ${s.stage >= 2 ? "disabled" : ""}>${
      s.stage === 0 ? "Bets are in → show question" : "Reveal answer"
    }</button>
        ${f.kind === "coin" ? `<button class="btn" id="liveCoin">Flip the coin</button>` : ""}
      </div>
      <p class="hint" style="margin-top:12px">Type everyone's bet, then hit ✓ or ✗ once you've read their answers.</p>
      ${state.players
        .map(
          (p) => `<div class="row" style="margin-top:6px">
          <span style="width:130px;font-weight:700">${esc(p.name)}</span>
          <input type="number" class="wager" data-id="${p.id}" placeholder="bet" style="width:100px" />
          <button class="btn small good" data-wager="1" data-id="${p.id}">✓ +bet</button>
          <button class="btn small bad" data-wager="-1" data-id="${p.id}">✗ −bet</button>
        </div>`
        )
        .join("")}`;
    return;
  }

  const names = { splash: "Title + rules", board: "The board", scores: "Standings", wheel: "A wheel", coin: "The coin", dragon: "The dragon" };
  el.innerHTML = `<h3><span class="onair">ON TV</span><span class="grow">${names[s.type] || s.type}</span></h3>
    <p class="hint">Click a square on the board to put a question up.</p>`;
}

function renderPlayers() {
  const v = currentValue();
  const el = $("players");
  // Don't redraw while someone is typing a name, or the cursor jumps.
  if (el.contains(document.activeElement) && document.activeElement.classList.contains("pname")) {
    state.players.forEach((p) => {
      const sc = el.querySelector(`.score[data-id="${p.id}"]`);
      if (sc) sc.textContent = p.score;
    });
    return;
  }
  el.innerHTML = state.players
    .map(
      (p) => `<div class="player">
      <input type="text" class="pname" data-id="${p.id}" value="${esc(p.name)}" />
      <div class="score ${p.score < 0 ? "neg" : ""}" data-id="${p.id}">${p.score}</div>
      <div class="acts">
        <button class="btn small good" data-add="${v}" data-id="${p.id}">+${v}</button>
        <button class="btn small bad" data-add="${-v}" data-id="${p.id}">−${v}</button>
        <input type="number" class="custom" data-id="${p.id}" placeholder="±" />
        <button class="btn small" data-custom="${p.id}">Add</button>
        <button class="btn small ghost" data-remove="${p.id}" title="Remove player">✕</button>
      </div>
    </div>`
    )
    .join("");
}

function renderChaos() {
  const who = $("who");
  const prev = who.value;
  who.innerHTML = `<option value="">Who's spinning? (optional)</option>` + state.players.map((p) => `<option>${esc(p.name)}</option>`).join("");
  who.value = state.players.some((p) => p.name === prev) ? prev : "";

  ["good", "bad"].forEach((k) => {
    const sel = $(k === "good" ? "rigGood" : "rigBad");
    if (!sel.options.length) {
      sel.add(new Option("Random", ""));
      window.WHEELS[k].segments.forEach((sg, i) => sel.add(new Option("Rigged: " + sg.label, i)));
    }
  });

  const s = state.screen;
  const landed = $("landed");
  if (s.type === "wheel") {
    const sg = window.WHEELS[s.wheel].segments[s.idx];
    landed.hidden = false;
    landed.innerHTML = `Landing on: <b>${esc(sg.label)}</b>${sg.reveal ? " — " + esc(sg.reveal) : ""}`;
  } else if (s.type === "coin") {
    landed.hidden = false;
    landed.innerHTML = `Coin: <b>${s.result.toUpperCase()}</b>`;
  } else if (s.type === "dragon") {
    landed.hidden = false;
    landed.innerHTML =
      s.result === "heads"
        ? `Heads: <b>the dragon attacks ${esc(s.target)}</b>. Spin the Bad Wheel for them.`
        : `Tails: <b>the dragon sleeps.</b>`;
  } else {
    landed.hidden = true;
  }
  $("backBtn").hidden = !s.back;
}

function currentValue() {
  const s = state.screen;
  if (s.type === "clue") return clueValue(s.r);
  if (s.back && s.back.type === "clue") return clueValue(s.back.r);
  return 100;
}

// ---------- Actions ----------

function openClue(c, r) {
  state.screen = { type: "clue", c, r, stage: 0 };
  commit();
  sfx("whoosh");
}

function advance() {
  const s = state.screen;
  if (s.type === "clue") {
    const { clue } = clueFor(state, s.c, s.r);
    const max = clue.reward ? 2 : clue.kind === "chaos" ? 0 : 1;
    if (clue.kind === "chaos" && clue.reward && s.stage === 0) s.stage = 2;
    else if (s.stage < max) s.stage++;
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
  const s = state.screen;
  if (s.type !== "clue") return setScreen({ type: "board" });
  const { clue } = clueFor(state, s.c, s.r);
  state.used[clueKey(state.gameId, s.c, s.r)] = true;
  if (!state.firstAnswer && (!clue.kind || clue.kind === "q")) {
    state.firstAnswer = clue.a;
    state.firstQuestion = clue.q;
  }
  setScreen({ type: "board" });
}

function addScore(id, amount) {
  const p = state.players.find((x) => x.id === id);
  if (!p || !amount) return;
  p.score += amount;
  undoStack.push({ id, amount });
  commit();
}

function leaderName() {
  if (!state.players.length) return "the leader";
  return [...state.players].sort((a, b) => b.score - a.score)[0].name;
}

// Wheels, coin and dragon remember what was on screen so you can go back to it.
function backTarget() {
  const s = state.screen;
  if (s.type === "wheel" || s.type === "coin" || s.type === "dragon") return s.back || null;
  return s.type === "splash" ? null : s;
}

function spin(kind) {
  const segs = window.WHEELS[kind].segments;
  const rig = $(kind === "good" ? "rigGood" : "rigBad").value;
  const idx = rig === "" ? Math.floor(Math.random() * segs.length) : Number(rig);
  state.screen = { type: "wheel", wheel: kind, idx, start: Date.now(), player: $("who").value, back: backTarget() };
  commit();
}

function flipCoin(type, label) {
  const rig = $("rigCoin").value;
  const result = rig || (Math.random() < 0.5 ? "heads" : "tails");
  state.screen = { type, result, start: Date.now(), label: label || "Heads or tails?", target: leaderName(), back: backTarget() };
  commit();
}

// ---------- Wiring ----------

$("gamePick").onchange = (e) => {
  state.gameId = e.target.value;
  setScreen({ type: "splash" });
};

$("openTv").onclick = () => {
  tvWin = window.open("tv.html", "jeopardy-tv", "popup=yes,width=1280,height=760");
  setTimeout(() => {
    Sync.publish(state);
    render();
  }, 800);
};

$("blur").onchange = (e) => {
  document.body.classList.toggle("blur", e.target.checked);
  try {
    localStorage.setItem("jeopardy-blur", e.target.checked ? "1" : "");
  } catch (err) {}
};

$("reset").onclick = () => {
  if (!confirm("Start a new game night? Scores go to 0 and every square comes back. Player names stay.")) return;
  const names = state.players.map((p) => ({ ...p, score: 0 }));
  state = freshState();
  state.players = names;
  undoStack.length = 0;
  commit();
};

document.querySelectorAll("[data-screen]").forEach((b) => (b.onclick = () => setScreen({ type: b.dataset.screen })));
document.querySelectorAll("[data-sfx]").forEach((b) => (b.onclick = () => sfx(b.dataset.sfx)));

$("finalBtn").onclick = () => setScreen({ type: "final", stage: 0 });
$("spinGood").onclick = () => spin("good");
$("spinBad").onclick = () => spin("bad");
$("coinBtn").onclick = () => flipCoin("coin");
$("dragonBtn").onclick = () => flipCoin("dragon");
$("backBtn").onclick = () => setScreen(state.screen.back || { type: "board" });

$("addPlayer").onclick = () => {
  state.players.push({ id: uid(), name: "Player " + (state.players.length + 1), score: 0 });
  commit();
};

$("undo").onclick = () => {
  const last = undoStack.pop();
  if (!last) return;
  const p = state.players.find((x) => x.id === last.id);
  if (p) p.score -= last.amount;
  commit();
};

$("hboard").onclick = (e) => {
  const b = e.target.closest("button[data-c]");
  if (b) openClue(Number(b.dataset.c), Number(b.dataset.r));
};

$("live").onclick = (e) => {
  const t = e.target;
  if (t.id === "revealA" || t.id === "finalNext") advance();
  if (t.id === "revealT") {
    state.screen.stage = 2;
    commit();
    sfx("reveal");
  }
  if (t.id === "done") finishClue();
  if (t.id === "cancel") setScreen({ type: "board" });
  if (t.id === "liveCoin") {
    const s = state.screen;
    const label = s.type === "final" ? findGame(state.gameId).final.q : clueFor(state, s.c, s.r).clue.q;
    flipCoin("coin", label);
  }
  if (t.dataset.wager) {
    const input = document.querySelector(`.wager[data-id="${t.dataset.id}"]`);
    const bet = Math.abs(Number(input.value) || 0);
    addScore(t.dataset.id, bet * Number(t.dataset.wager));
    sfx(t.dataset.wager === "1" ? "correct" : "buzzer");
  }
};

$("players").onclick = (e) => {
  const t = e.target;
  if (t.dataset.add) addScore(t.dataset.id, Number(t.dataset.add));
  if (t.dataset.custom) {
    const input = document.querySelector(`.custom[data-id="${t.dataset.custom}"]`);
    addScore(t.dataset.custom, Number(input.value) || 0);
    input.value = "";
  }
  if (t.dataset.remove) {
    const p = state.players.find((x) => x.id === t.dataset.remove);
    if (p && confirm(`Remove ${p.name}?`)) {
      state.players = state.players.filter((x) => x.id !== p.id);
      commit();
    }
  }
};

$("players").addEventListener("input", (e) => {
  if (!e.target.classList.contains("pname")) return;
  const p = state.players.find((x) => x.id === e.target.dataset.id);
  if (p) {
    p.name = e.target.value;
    Sync.publish(state);
    renderChaos();
  }
});

$("players").addEventListener("keydown", (e) => {
  if (e.target.classList.contains("custom") && e.key === "Enter") {
    document.querySelector(`[data-custom="${e.target.dataset.id}"]`).click();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.target.matches("input, select, textarea")) return;
  const k = e.key.toLowerCase();
  if (k === " ") {
    e.preventDefault();
    advance();
  } else if (k === "escape") finishClue();
  else if (k === "d") sfx("ding");
  else if (k === "c") sfx("correct");
  else if (k === "x") sfx("buzzer");
  else if (k === "s") sfx("sad");
  else if (k === "a") sfx("airhorn");
});

// If the TV window gets refreshed it reads the saved state itself, but
// re-sending on focus keeps things tidy if the two ever drift.
window.addEventListener("focus", () => Sync.publish(state));

try {
  if (localStorage.getItem("jeopardy-blur")) {
    $("blur").checked = true;
    document.body.classList.add("blur");
  }
} catch (e) {}

Sync.publish(state);
render();
