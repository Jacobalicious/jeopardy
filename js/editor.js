// The question editor: browse every question, tick the ones for the board,
// edit, add, reorder. Everything saves to this browser automatically.

let lib = loadLibrary();
let page = { type: "board" }; // board | cat | final | search
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
  saveLibrary(lib);
  const el = $("saved");
  el.classList.add("show");
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => el.classList.remove("show"), 1200);
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
  const final = lib.finals.find((f) => f.id === lib.finalId);
  let html = `
    <button class="nav ${page.type === "board" ? "active" : ""}" data-go="board">
      <span class="ico">🎯</span><span class="nm">The Board</span><span class="ct">${onCount} on</span>
    </button>
    <button class="nav ${page.type === "final" ? "active" : ""}" data-go="final">
      <span class="ico">🏁</span><span class="nm">Final Jeopardy</span><span class="ct">${final ? esc(final.category) : "none"}</span>
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
  const views = { board: boardPage, cat: catPage, final: finalPage, search: searchPage };
  $("main").innerHTML = (views[page.type] || boardPage)();
  const f = document.querySelector(".qcard.editing textarea");
  if (f && document.activeElement === document.body) f.focus();
}

function boardPage() {
  const board = buildBoard(lib);
  const cats = board.categories;
  const total = cats.reduce((n, c) => n + c.clues.length, 0);
  const final = board.final;
  const rows = rowsOf(lib);
  const short = cats.filter((c) => c.clues.length < rows);
  let html = `
    <div class="page-head"><h1>The Board</h1></div>
    <p class="sub">Switch categories on in the list on the left. In each one, the first ${rows} ticked questions go on the
      board, worth 100 to ${rows * 100} in order. Click anything below to edit it.</p>
    <div class="row" style="margin-bottom:18px">
      <span class="hmeta">Questions per category:</span>
      <button class="btn small ${rows === 5 ? "primary" : ""}" data-rows="5">5</button>
      <button class="btn small ${rows === 6 ? "primary" : ""}" data-rows="6">6</button>
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
  html += `<div class="divider">Final Jeopardy</div>`;
  html += final
    ? `<div class="qcard" data-go-final="1"><div class="pick"><span class="pill">FINAL</span></div><div class="qbody">
        <div class="tags" style="margin:0 0 6px"><span class="tag-chip cat">${esc(final.category)}</span></div>
        <div class="qt">${esc(final.q)}</div><div class="at">${esc(final.a)}</div></div><div></div></div>`
    : `<div class="warnbox">No Final Jeopardy picked.</div>`;
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
  const catChip = opts.showCat ? `<span class="tag-chip cat">${esc(c.name)}</span>` : "";
  return `<div class="qcard ${q.use ? "" : "off"}" data-cat="${c.id}" data-q="${q.id}">
    <div class="pick">
      <button class="check ${q.use ? "on" : ""}" data-act="use" title="${q.use ? "Ticked" : "Not ticked"}">${q.use ? "✓" : ""}</button>
      ${v ? `<span class="pill">${v}</span>` : q.use ? `<span class="pill extra">spare</span>` : ""}
    </div>
    <div class="qbody" data-act="edit">
      <div class="qt">${esc(q.q) || "<i>(empty question)</i>"}</div>
      <div class="at">${esc(q.a)}</div>
      <div class="tags">${catChip}${kind}${twist}${note}${src}</div>
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

function finalPage() {
  let html = `
    <div class="page-head"><h1>Final Jeopardy</h1></div>
    <p class="sub">Pick the one you'll play. Teams bet first, then you reveal the question.</p>`;
  lib.finals.forEach((f) => {
    const on = f.id === lib.finalId;
    if (editing === f.id) {
      const kindOpts = KINDS.map(([k, l]) => `<option value="${k}" ${(f.kind || "q") === k ? "selected" : ""}>${l}</option>`).join("");
      html += `<div class="qcard editing" data-final="${f.id}"><div class="form">
        <label>Category <small>(shown while they bet)</small><input type="text" data-f="category" value="${esc(f.category)}" /></label>
        <label>Question<textarea data-f="q" rows="2">${esc(f.q)}</textarea></label>
        <label class="ans">Answer<textarea data-f="a" rows="1">${esc(f.a)}</textarea></label>
        <label>Host note<textarea data-f="note" rows="2">${esc(f.note)}</textarea></label>
        <label>Type<select data-f="kind">${kindOpts}</select></label>
        <div class="form-actions">
          <button class="btn primary" data-act="done">Done</button>
          <span class="spacer"></span>
          <button class="btn bad" data-act="delete">Delete</button>
        </div>
      </div></div>`;
      return;
    }
    html += `<div class="qcard ${on ? "" : "off"}" data-final="${f.id}">
      <div class="pick"><button class="radio ${on ? "on" : ""}" data-act="pick" title="Use this one"></button></div>
      <div class="qbody" data-act="edit">
        <div class="tags" style="margin:0 0 6px"><span class="tag-chip cat">${esc(f.category)}</span>${
      f.kind && f.kind !== "q" ? `<span class="tag-chip kind">${KIND_LABEL[f.kind]}</span>` : ""
    }</div>
        <div class="qt">${esc(f.q)}</div>
        <div class="at">${esc(f.a)}</div>
      </div>
      <div class="qacts"><button data-act="edit" title="Edit">✎</button></div>
    </div>`;
  });
  html += `<button class="add-q" id="addFinal">+ Add a Final Jeopardy</button>`;
  return html;
}

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
  if (t.closest("[data-go-final]")) return go({ type: "final" });
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
  if (t.id === "addFinal") {
    const f = { id: newId("final"), category: "New Category", q: "", a: "" };
    lib.finals.push(f);
    editing = f.id;
    save();
    return render();
  }

  const actEl = t.closest("[data-act]");
  if (!actEl) return;
  const act = actEl.dataset.act;

  // Final Jeopardy cards
  const fcard = t.closest("[data-final]");
  if (fcard) {
    const f = lib.finals.find((x) => x.id === fcard.dataset.final);
    if (act === "pick") lib.finalId = f.id;
    if (act === "edit") editing = f.id;
    if (act === "done") editing = null;
    if (act === "delete") {
      if (!confirm("Delete this Final Jeopardy?")) return;
      lib.finals = lib.finals.filter((x) => x !== f);
      if (lib.finalId === f.id) lib.finalId = lib.finals[0] ? lib.finals[0].id : null;
      editing = null;
    }
    save();
    return render();
  }

  // Question cards
  const qcard = t.closest("[data-q]");
  if (!qcard) return;
  const c = catById(qcard.dataset.cat);
  const i = c.questions.findIndex((x) => x.id === qcard.dataset.q);
  const q = c.questions[i];

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
  const fcard = t.closest("[data-final]");
  if (fcard) {
    const f = lib.finals.find((x) => x.id === fcard.dataset.final);
    f[field] = t.value;
    if (field === "kind" && t.value === "q") delete f.kind;
    save();
    renderSide();
    return;
  }
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
  if (field === "kind") {
    if (t.value === "q") delete q.kind;
    else q.kind = t.value;
    save();
    return render();
  }
  q[field] = t.value;
  save();
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
    if (!data.categories || !data.finals) throw new Error("bad");
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
  const link = base + "index.html#lib=" + (await packLibrary(lib));
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
