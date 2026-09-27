// The question editor: browse every question, tick the ones for the board,
// edit, add, reorder. Everything saves to this browser automatically.

let lib = loadLibrary();
let page = { type: "board" }; // board | cat | search
let editing = null; // id of the question being edited
let query = "";
let lastDeleted = null;

const $ = (id) => document.getElementById(id);

const KINDS = [
  ["q", "Question", "A normal question with an answer."],
  ["chaos", "Chaos", "No question. It just happens (\"Automatic loss\"). Shown huge on the TV."],
  ["minigame", "Minigame", "Something they have to do, like rock paper scissors."],
  ["coin", "Coin flip", "Gives you a button to flip the coin on the TV."],
  ["callback", "Memory test", "The answer is automatically the first answer of the night."],
];
const KIND_LABEL = Object.fromEntries(KINDS.map(([k, l]) => [k, l]));

// ---------- Saving ----------

let saveTimer = null;
function save() {
  const ok = saveLibrary(lib);
  const el = $("saved");
  el.classList.add("show");
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => el.classList.remove("show"), 1200);
  if (!ok) toast("Couldn't save: this device is out of space. Remove some uploaded pictures.");
  return ok;
}

function toast(msg, action) {
  const t = $("toast");
  t.innerHTML = `<span>${esc(msg)}</span>${action ? `<button class="btn small" id="toastAct">${esc(action.label)}</button>` : ""}`;
  t.hidden = false;
  if (action) $("toastAct").onclick = () => {
    action.run();
    t.hidden = true;
  };
  clearTimeout(t._timer);
  t._timer = setTimeout(() => (t.hidden = true), 6000);
}

// ---------- Helpers ----------

const catById = (id) => lib.categories.find((c) => c.id === id);

function usedCount(c) {
  return c.questions.filter((q) => q.use).length;
}

// Value a question will have on the board, or null if it's not in the first five ticked.
function valueOf(c, q) {
  if (!q.use) return null;
  const i = c.questions.filter((x) => x.use).indexOf(q);
  return i < rowsOf(lib) ? (i + 1) * 100 : null;
}

function newId(prefix) {
  return prefix + "-" + uid();
}

function move(arr, i, d) {
  const j = i + d;
  if (j < 0 || j >= arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
}

function go(p) {
  page = p;
  editing = null;
  closeSide();
  render();
  window.scrollTo(0, 0);
}

// ---------- Sidebar ----------

function renderSide() {
  const board = buildBoard(lib);
  const onCount = board.categories.length;
  let html = `
    <button class="nav ${page.type === "board" ? "active" : ""}" data-go="board">
      <span class="ico">🎯</span><span class="nm">The Board</span><span class="ct">${onCount} on</span>
    </button>
    <div class="side-label"><span>Categories</span><span>${lib.categories.length}</span></div>`;
  lib.categories.forEach((c, i) => {
    const n = usedCount(c);
    const warn = c.onBoard && n < rowsOf(lib);
    html += `<div class="nav ${page.type === "cat" && page.catId === c.id ? "active" : ""}" data-cat="${c.id}" role="button" tabindex="0">
      <span class="switch ${c.onBoard ? "on" : ""}" data-toggle="${c.id}" title="${c.onBoard ? "On the board" : "Not on the board"}"></span>
      <span class="nm">${esc(c.name)}</span>
      <span class="order"><span data-cup="${i}" title="Move up">▲</span><span data-cdown="${i}" title="Move down">▼</span></span>
      <span class="ct ${warn ? "warn" : ""}" title="ticked / total">${Math.min(n, rowsOf(lib))}/${c.questions.length}</span>
    </div>`;
  });
  html += `<button class="btn add-cat" id="addCat">+ New category</button>`;
  $("side").innerHTML = html;
}

$("side").addEventListener("click", (e) => {
  const t = e.target;
  if (t.dataset.toggle) {
    const c = catById(t.dataset.toggle);
    c.onBoard = !c.onBoard;
    save();
    render();
    return;
  }
  if (t.dataset.cup || t.dataset.cdown) {
    const i = Number(t.dataset.cup || t.dataset.cdown);
    move(lib.categories, i, t.dataset.cup ? -1 : 1);
    save();
    render();
    return;
  }
  if (t.id === "addCat") return addCategory();
  const nav = t.closest("[data-go], [data-cat]");
  if (!nav) return;
  if (nav.dataset.go) go({ type: nav.dataset.go });
  else go({ type: "cat", catId: nav.dataset.cat });
});

function addCategory() {
  const c = { id: newId("cat"), name: "New Category", onBoard: false, questions: [] };
  lib.categories.push(c);
  save();
  go({ type: "cat", catId: c.id });
  setTimeout(() => {
    const t = document.querySelector("input.title");
    if (t) {
      t.focus();
      t.select();
    }
  }, 50);
}

// ---------- Pages ----------

function render() {
  renderSide();
  const views = { board: boardPage, cat: catPage, search: searchPage };
  $("main").innerHTML = (views[page.type] || boardPage)();
  const f = document.querySelector(".qcard.editing textarea");
  if (f && document.activeElement === document.body) f.focus();
}

function boardPage() {
  const board = buildBoard(lib);
  const cats = board.categories;
  const total = cats.reduce((n, c) => n + c.clues.length, 0);
  const rows = rowsOf(lib);
  const short = cats.filter((c) => c.clues.length < rows);
  let html = `
    <div class="page-head"><h1>The Board</h1></div>
    <p class="sub">Switch categories on in the list on the left. In each one, the first ${rows} ticked questions go on the
      board, worth 100 to ${rows * 100} in order. Click anything below to edit it.</p>
    <div class="row" style="margin-bottom:18px">
      <span class="hmeta">Questions per category:</span>
      <span class="stepper">
        <button class="btn small" data-rows="${rows - 1}" ${rows <= MIN_ROWS ? "disabled" : ""} aria-label="Fewer">−</button>
        <b>${rows}</b>
        <button class="btn small" data-rows="${rows + 1}" ${rows >= MAX_ROWS ? "disabled" : ""} aria-label="More">+</button>
      </span>
    </div>
    <div class="stat-row">
      <div class="stat"><b>${cats.length}</b><span>categories on</span></div>
      <div class="stat"><b>${total}</b><span>questions on the board</span></div>
      <div class="stat"><b>${lib.categories.reduce((n, c) => n + c.questions.length, 0)}</b><span>in the bank</span></div>
    </div>`;
  if (!cats.length) html += `<div class="warnbox">No categories are on yet. Flip a switch in the list to add one.</div>`;
  if (cats.length > 6) html += `<div class="warnbox">${cats.length} categories is a lot for a TV. 6 is classic Jeopardy. It'll still work.</div>`;
  short.forEach((c) => (html += `<div class="warnbox"><b>${esc(c.name)}</b> only has ${c.clues.length} ticked question${c.clues.length === 1 ? "" : "s"}. Tick ${rows - c.clues.length} more.</div>`));
  if (cats.length) {
    html += `<div class="mini-board" style="grid-template-columns:repeat(${cats.length}, minmax(110px,1fr))">`;
    cats.forEach((c) => (html += `<div class="mb-cat" data-open-cat="${c.id}">${esc(c.name)}</div>`));
    for (let r = 0; r < rows; r++) {
      cats.forEach((c) => {
        const q = c.clues[r];
        html += q
          ? `<button class="mb-cell" data-open-cat="${c.id}" data-open-q="${q.id}"><b>${q.value}</b><span class="snip">${esc(q.q)}</span></button>`
          : `<div class="mb-cell missing" data-open-cat="${c.id}">empty</div>`;
      });
    }
    html += `</div>`;
  }
  return html;
}

function catPage() {
  const c = catById(page.catId);
  if (!c) return boardPage();
  const n = usedCount(c);
  const rows = rowsOf(lib);
  let html = `
    <div class="page-head">
      <input class="title" id="catName" value="${esc(c.name)}" aria-label="Category name" />
      <span class="onboard-toggle" data-toggle-board="1"><span class="switch ${c.onBoard ? "on" : ""}"></span>${
    c.onBoard ? "On the board" : "Not on the board"
  }</span>
    </div>
    <p class="sub">Tick the questions you want. The first ${rows} ticked become 100, 200, 300 and so on up to ${rows * 100}. Use
      the arrows to change the order. ${n > rows ? `<b>${n} are ticked</b>, so the last ${n - rows} are spares that won't show.` : ""}</p>`;
  if (!c.questions.length) html += `<div class="empty-state">No questions yet.</div>`;
  c.questions.forEach((q, i) => (html += card(c, q, i)));
  html += `<button class="add-q" id="addQ">+ Add a question</button>
    <div class="row" style="margin-top:30px;justify-content:flex-end">
      <button class="btn small ghost" id="delCat">Delete this category</button>
    </div>`;
  return html;
}

function card(c, q, i, opts = {}) {
  if (editing === q.id) return editCard(c, q, opts);
  const v = valueOf(c, q);
  const kind = q.kind && q.kind !== "q" ? `<span class="tag-chip kind">${KIND_LABEL[q.kind] || q.kind}</span>` : "";
  const twist = q.reward ? `<span class="tag-chip twist">has twist</span>` : "";
  const note = q.note ? `<span class="tag-chip">host note</span>` : "";
  const src = q.src ? `<span class="tag-chip">${esc(q.src)}</span>` : "";
  const pic = q.img ? `<span class="tag-chip pic">🖼 picture</span>` : "";
  const gameChip = q.game ? `<span class="tag-chip kind">${q.game.type === "connect4" ? `Connect Four ${newBoard(q.game).cols}×${newBoard(q.game).rows}` : "Tic-tac-toe"} board</span>` : "";
  const catChip = opts.showCat ? `<span class="tag-chip cat">${esc(c.name)}</span>` : "";
  return `<div class="qcard ${q.use ? "" : "off"}" data-cat="${c.id}" data-q="${q.id}">
    <div class="pick">
      <button class="check ${q.use ? "on" : ""}" data-act="use" title="${q.use ? "Ticked" : "Not ticked"}">${q.use ? "✓" : ""}</button>
      ${v ? `<span class="pill">${v}</span>` : q.use ? `<span class="pill extra">spare</span>` : ""}
    </div>
    <div class="qbody" data-act="edit">
      <div class="qt">${esc(q.q) || "<i>(empty question)</i>"}</div>
      <div class="at">${esc(q.a)}</div>
      <div class="tags">${catChip}${pic}${gameChip}${kind}${twist}${note}${src}</div>
    </div>
    <div class="qacts">
      ${opts.showCat ? "" : `<button data-act="up" ${i === 0 ? "disabled" : ""} title="Move up">▲</button>
      <button data-act="down" ${i === c.questions.length - 1 ? "disabled" : ""} title="Move down">▼</button>`}
      <button data-act="edit" title="Edit">✎</button>
    </div>
  </div>`;
}

function editCard(c, q) {
  const kindOpts = KINDS.map(([k, l]) => `<option value="${k}" ${(q.kind || "q") === k ? "selected" : ""}>${l}</option>`).join("");
  const kindHelp = (KINDS.find(([k]) => k === (q.kind || "q")) || KINDS[0])[2];
  const catOpts = lib.categories.map((x) => `<option value="${x.id}" ${x.id === c.id ? "selected" : ""}>${esc(x.name)}</option>`).join("");
  return `<div class="qcard editing" data-cat="${c.id}" data-q="${q.id}">
    <div class="form">
      <label>Question <small>(shown on the TV)</small><textarea data-f="q" rows="2">${esc(q.q)}</textarea></label>
      <label class="ans">Answer <small>(only you see it until you reveal it)</small><textarea data-f="a" rows="1">${esc(q.a)}</textarea></label>
      <label>Host note <small>(never shown on the TV: how to rule, what to say)</small><textarea data-f="note" rows="2">${esc(q.note)}</textarea></label>
      <label>Twist <small>(optional, revealed after the answer, e.g. "Reward: gain -100 points")</small><textarea data-f="reward" rows="1">${esc(q.reward)}</textarea></label>
      ${picField(q)}
      ${gameField(q)}
      <div class="two">
        <label>Type<select data-f="kind">${kindOpts}</select><small style="color:var(--muted)">${esc(kindHelp)}</small></label>
        <label>Category<select data-f="cat">${catOpts}</select></label>
      </div>
      <label>Source <small>(just for you: where it came from)</small><input type="text" data-f="src" value="${esc(q.src)}" /></label>
      <div class="form-actions">
        <button class="btn primary" data-act="done">Done</button>
        <button class="btn" data-act="dup">Duplicate</button>
        <span class="spacer"></span>
        <button class="btn bad" data-act="delete">Delete</button>
      </div>
    </div>
  </div>`;
}

function gameField(q) {
  const g = q.game || {};
  const b = q.game ? newBoard(q.game) : null;
  return `<div class="pic-field">
    <div class="pic-lbl">Game board <small>(optional: you tap moves on your phone, the board shows on the TV)</small></div>
    <select data-f="gameType">
      <option value="" ${!g.type ? "selected" : ""}>None</option>
      <option value="tictactoe" ${g.type === "tictactoe" ? "selected" : ""}>Tic-tac-toe</option>
      <option value="connect4" ${g.type === "connect4" ? "selected" : ""}>Connect Four</option>
    </select>
    ${
      g.type === "connect4"
        ? `<div class="row">
            <label class="inline">Columns <input type="number" min="3" max="10" data-f="gameCols" value="${b.cols}" style="width:70px" /></label>
            <label class="inline">Rows <input type="number" min="3" max="10" data-f="gameRows" value="${b.rows}" style="width:70px" /></label>
          </div>
          <small class="pic-hint">Normal Connect Four is 7 columns, 6 rows. Anything smaller than 4 makes it impossible to win.</small>`
        : ""
    }
  </div>`;
}

function picField(q) {
  const link = q.img && !q.img.startsWith("data:") ? q.img : "";
  return `<div class="pic-field">
    <div class="pic-lbl">Picture <small>(optional, shown on the TV)</small></div>
    ${q.img ? `<img class="pic-preview" src="${esc(q.img)}" alt="" />` : ""}
    <div class="row">
      <button class="btn" data-act="pic-upload">📷 ${q.img ? "Change picture" : "Upload picture"}</button>
      ${q.img ? `<button class="btn bad" data-act="pic-remove">Remove</button>` : ""}
    </div>
    <input type="text" data-f="imgUrl" placeholder="...or paste a link to a picture" value="${esc(link)}" />
    ${
      q.img
        ? `<label class="inline">Show it <select data-f="imgAt">
            <option value="q" ${q.imgAt !== "a" ? "selected" : ""}>with the question</option>
            <option value="a" ${q.imgAt === "a" ? "selected" : ""}>when the answer is revealed</option>
          </select></label>`
        : ""
    }
    <small class="pic-hint">Tip: you can also copy a picture and press Ctrl+V while editing.</small>
  </div>`;
}

// Shrink a picture so lots of them fit in the browser's storage.
async function compressImage(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = url;
    });
    const scale = Math.min(1, 1024 / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    const g = c.getContext("2d");
    g.fillStyle = "#fff";
    g.fillRect(0, 0, c.width, c.height);
    g.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.78);
  } finally {
    URL.revokeObjectURL(url);
  }
}

let picTarget = null;
async function setPicture(q, file) {
  if (!file || !file.type.startsWith("image/")) return;
  const before = q.img;
  try {
    q.img = await compressImage(file);
  } catch (e) {
    return toast("Couldn't read that picture.");
  }
  if (!save()) {
    if (before) q.img = before;
    else delete q.img;
    save();
    toast("Out of space on this device. Remove some pictures, or use picture links instead.");
  }
  render();
}

function questionById(id) {
  for (const c of lib.categories) {
    const q = c.questions.find((x) => x.id === id);
    if (q) return q;
  }
  return null;
}

$("picFile").onchange = (e) => {
  const q = picTarget && questionById(picTarget);
  if (q) setPicture(q, e.target.files[0]);
  e.target.value = "";
};

document.addEventListener("paste", (e) => {
  const q = editing && questionById(editing);
  if (!q) return;
  const item = [...(e.clipboardData ? e.clipboardData.items : [])].find((i) => i.type.startsWith("image/"));
  if (!item) return;
  e.preventDefault();
  setPicture(q, item.getAsFile());
});

function searchPage() {
  const q = query.toLowerCase();
  const hits = [];
  lib.categories.forEach((c) =>
    c.questions.forEach((x, i) => {
      const hay = [x.q, x.a, x.note, x.reward, c.name].join(" ").toLowerCase();
      if (hay.includes(q)) hits.push([c, x, i]);
    })
  );
  let html = `<div class="page-head"><h1>“${esc(query)}”</h1></div>
    <p class="sub">${hits.length} question${hits.length === 1 ? "" : "s"} found.</p>`;
  if (!hits.length) html += `<div class="empty-state">Nothing matches. Try fewer words.</div>`;
  hits.forEach(([c, x, i]) => (html += card(c, x, i, { showCat: true })));
  return html;
}

// ---------- Main area events ----------

$("main").addEventListener("click", (e) => {
  const t = e.target;

  // Board overview shortcuts
  const open = t.closest("[data-open-cat]");
  if (open) {
    page = { type: "cat", catId: open.dataset.openCat };
    editing = open.dataset.openQ || null;
    render();
    const el = editing && document.querySelector(`[data-q="${editing}"]`);
    if (el) el.scrollIntoView({ block: "center" });
    return;
  }
  if (t.dataset.rows) {
    lib.rows = Number(t.dataset.rows);
    save();
    return render();
  }

  if (t.closest("[data-toggle-board]")) {
    const c = catById(page.catId);
    c.onBoard = !c.onBoard;
    save();
    return render();
  }
  if (t.id === "addQ") {
    const c = catById(page.catId);
    const q = { id: newId(c.id), q: "", a: "", use: true };
    c.questions.push(q);
    editing = q.id;
    save();
    render();
    document.querySelector(`[data-q="${q.id}"]`).scrollIntoView({ block: "center" });
    return;
  }
  if (t.id === "delCat") {
    const c = catById(page.catId);
    if (!confirm(`Delete "${c.name}" and all ${c.questions.length} of its questions?`)) return;
    const idx = lib.categories.indexOf(c);
    lib.categories.splice(idx, 1);
    save();
    toast(`Deleted "${c.name}"`, {
      label: "Undo",
      run: () => {
        lib.categories.splice(idx, 0, c);
        save();
        go({ type: "cat", catId: c.id });
      },
    });
    return go({ type: "board" });
  }
  const actEl = t.closest("[data-act]");
  if (!actEl) return;
  const act = actEl.dataset.act;

  // Question cards
  const qcard = t.closest("[data-q]");
  if (!qcard) return;
  const c = catById(qcard.dataset.cat);
  const i = c.questions.findIndex((x) => x.id === qcard.dataset.q);
  const q = c.questions[i];

  if (act === "pic-upload") {
    picTarget = q.id;
    $("picFile").click();
    return;
  }
  if (act === "pic-remove") {
    delete q.img;
    delete q.imgAt;
  }
  if (act === "use") q.use = !q.use;
  if (act === "up") move(c.questions, i, -1);
  if (act === "down") move(c.questions, i, 1);
  if (act === "edit") editing = q.id;
  if (act === "done") editing = null;
  if (act === "dup") {
    const copy = { ...q, id: newId(c.id), use: false };
    c.questions.splice(i + 1, 0, copy);
    editing = copy.id;
  }
  if (act === "delete") {
    c.questions.splice(i, 1);
    editing = null;
    lastDeleted = { c, q, i };
    toast("Question deleted", {
      label: "Undo",
      run: () => {
        lastDeleted.c.questions.splice(lastDeleted.i, 0, lastDeleted.q);
        save();
        render();
      },
    });
  }
  save();
  render();
});

// Typing in the edit form updates the question live, without redrawing.
$("main").addEventListener("input", (e) => {
  const t = e.target;
  if (t.id === "catName") {
    catById(page.catId).name = t.value;
    save();
    renderSide();
    return;
  }
  const field = t.dataset.f;
  if (!field) return;
  const qcard = t.closest("[data-q]");
  const c = catById(qcard.dataset.cat);
  const q = c.questions.find((x) => x.id === qcard.dataset.q);
  if (field === "cat") {
    // Move to another category
    c.questions = c.questions.filter((x) => x !== q);
    const dest = catById(t.value);
    dest.questions.push(q);
    save();
    toast(`Moved to ${dest.name}`);
    editing = null;
    return render();
  }
  if (field === "gameType") {
    if (t.value) q.game = t.value === "connect4" ? { type: "connect4", cols: 7, rows: 6 } : { type: "tictactoe" };
    else delete q.game;
    save();
    return render();
  }
  if (field === "gameCols" || field === "gameRows") {
    q.game[field === "gameCols" ? "cols" : "rows"] = Math.min(10, Math.max(3, Number(t.value) || 3));
    save();
    return;
  }
  if (field === "imgUrl") {
    const v = t.value.trim();
    if (v) q.img = v;
    else if (q.img && !q.img.startsWith("data:")) delete q.img;
    save();
    return;
  }
  if (field === "imgAt") {
    if (t.value === "a") q.imgAt = "a";
    else delete q.imgAt;
    save();
    return;
  }
  if (field === "kind") {
    if (t.value === "q") delete q.kind;
    else q.kind = t.value;
    save();
    return render();
  }
  q[field] = t.value;
  save();
});

// Show the preview once a picture link has been pasted or typed.
$("main").addEventListener("change", (e) => {
  if (e.target.dataset.f === "imgUrl") render();
});

// Grow textareas to fit.
$("main").addEventListener("input", (e) => {
  if (e.target.tagName === "TEXTAREA") autoGrow(e.target);
});
function autoGrow(el) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + 2 + "px";
}
new MutationObserver(() => document.querySelectorAll(".form textarea").forEach(autoGrow)).observe($("main"), { childList: true });

// ---------- Search ----------

$("search").addEventListener("input", (e) => {
  query = e.target.value.trim();
  editing = null;
  if (query) page = { type: "search" };
  else if (page.type === "search") page = { type: "board" };
  render();
});

// ---------- Menu, backup, reset ----------

$("moreBtn").onclick = (e) => {
  e.stopPropagation();
  $("moreMenu").hidden = !$("moreMenu").hidden;
};
document.addEventListener("click", () => ($("moreMenu").hidden = true));

$("exportBtn").onclick = () => {
  const blob = new Blob([JSON.stringify(lib, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "jeopardy-questions.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

$("importBtn").onclick = () => $("importFile").click();
$("importFile").onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!data.categories) throw new Error("bad");
    if (!confirm("Replace all the questions on this device with the ones in this file?")) return;
    lib = data;
    save();
    go({ type: "board" });
    toast("Loaded");
  } catch (err) {
    alert("That file isn't a questions backup.");
  }
  e.target.value = "";
};

$("resetBtn").onclick = () => {
  if (!confirm("Throw away all your edits and go back to the built-in questions?")) return;
  lib = JSON.parse(JSON.stringify(window.DEFAULT_LIBRARY));
  save();
  go({ type: "board" });
};

// ---------- Send to phone ----------

$("shareBtn").onclick = async () => {
  const base = location.href.replace(/editor\.html.*$/, "").replace(/#.*$/, "");
  const { lib: light, dropped } = withoutUploads(lib);
  const link = base + "index.html#lib=" + (await packLibrary(light));
  $("shareNote").textContent = dropped
    ? `${dropped} uploaded picture${dropped === 1 ? " isn't" : "s aren't"} in the link (too big). Pictures added as links are included. To move uploads, use Download backup file.`
    : "";
  $("shareLink").value = link;
  $("qr").innerHTML = "";
  try {
    // QR codes top out around 2,900 characters.
    if (link.length < 2800 && window.QRCode) {
      new QRCode($("qr"), { text: link, width: 240, height: 240, correctLevel: QRCode.CorrectLevel.L });
    } else {
      $("qr").innerHTML = `<p class="hint">Your question bank is too big for a QR code, so copy the link instead.</p>`;
    }
  } catch (err) {
    $("qr").innerHTML = `<p class="hint">Couldn't make a QR code, so copy the link instead.</p>`;
  }
  $("nativeShare").hidden = !navigator.share;
  $("shareModal").hidden = false;
};
$("copyLink").onclick = async () => {
  try {
    await navigator.clipboard.writeText($("shareLink").value);
  } catch (e) {
    $("shareLink").select();
    document.execCommand("copy");
  }
  $("copyLink").textContent = "Copied!";
  setTimeout(() => ($("copyLink").textContent = "Copy"), 1500);
};
$("nativeShare").onclick = () => navigator.share({ title: "Jeopardy questions", url: $("shareLink").value }).catch(() => {});
$("closeShare").onclick = () => ($("shareModal").hidden = true);
$("shareModal").onclick = (e) => {
  if (e.target === $("shareModal")) $("shareModal").hidden = true;
};

// ---------- Phone sidebar ----------

$("menuBtn").onclick = () => {
  $("side").classList.add("open");
  $("sideBackdrop").classList.add("open");
};
function closeSide() {
  $("side").classList.remove("open");
  $("sideBackdrop").classList.remove("open");
}
$("sideBackdrop").onclick = closeSide;

// Another tab (or the host screen importing a link) changed the questions.
window.addEventListener("storage", (e) => {
  if (e.key === LIB_KEY && !editing) {
    lib = loadLibrary();
    render();
  }
});

importFromHash().then((loaded) => {
  if (loaded) {
    lib = loadLibrary();
    render();
  }
});
render();
