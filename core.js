// Shared engine for both Agent Inbox prototypes: state, actions, live feed, detail drawer, log.
(function () {
  const D = window.DATA;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const P = {
    check: '<path d="M20 6 9 17l-5-5"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>',
    reply: '<path d="m9 17-5-5 5-5"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    eyeoff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><path d="m2 2 20 20"/>',
    alert: '<path d="M12 9v4M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/>',
    spark: '<path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2Z"/>',
    bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    up: '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
    down: '<path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    broom: '<path d="m13 11 9-9"/><path d="M14.6 12.6c.8.8.9 2.1.2 3L10 22l-8-8 6.4-4.8c.9-.7 2.2-.6 3 .2Z"/><path d="m6.8 10.4 6.8 6.8"/>',
    back: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15Z"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    archive: '<rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M10 12h4"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>'
  };
  const ic = (n, cls = "") => `<svg class="i ${cls}" viewBox="0 0 24 24">${P[n] || ""}</svg>`;

  const now = Date.now();
  const S = {
    items: D.ITEMS.map((x) => ({ ...x, status: "pending", at: now - x.ago * 60000 })),
    log: [], auto: { like: false, hide: false, reply: false },
    approved: { like: 0, hide: 0, reply: 0, delete: 0 }, rejected: { like: 0, hide: 0, reply: 0, delete: 0 },
    nudge: null, nudged: {}, learned: Object.fromEntries(D.AGENTS.map((a) => [a.id, []])),
    guides: Object.fromEntries(D.AGENTS.map((a) => [a.id, a.guide])),
    sel: new Set(), edits: {}, scanned: D.SCANNED_BEFORE, lastCheck: now, drawerId: null, drawerAgent: null
  };
  let LID = 0;
  // A bit of history so the log is not empty on first load.
  const lastVisit = now - D.LAST_VISIT_MIN * 60000;
  S.lastVisit = lastVisit;
  [["general", "hid 41 spam comments", null, 0.2], ["general", "liked 63 comments", null, 0.4], ["lead", "replied to Clara M. and sent a DM", "do you have gift wrapping?", 0.6], ["general", "replied to Joe P.", "when is the restock?", 0.8]]
    .forEach(([agent, text, q, h]) => S.log.push({ lid: ++LID, ids: [], agent, text, q, by: "you", t: lastVisit - h * 3600000 }));

  const agent = (id) => D.AGENTS.find((a) => a.id === id);
  const byId = (id) => S.items.find((x) => x.id === id);
  const pending = (fn = () => true) => S.items.filter((x) => x.status === "pending" && fn(x));
  const isHuman = (x) => x.type === "escalation" || x.type === "gap";
  const rel = (t) => { const m = Math.round((Date.now() - t) / 60000); return m < 1 ? "just now" : m < 60 ? m + " min" : m < 1440 ? Math.round(m / 60) + " h" : Math.round(m / 1440) + " d"; };
  const kfmt = (n) => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(".0", "") + "K" : String(n));
  const actWord = { reply: "Send", like: "Like", hide: "Hide", delete: "Delete" };
  const actIcon = { reply: "send", like: "heart", hide: "eyeoff", delete: "trash" };
  const past = { reply: "replied to", like: "liked", hide: "hid", delete: "deleted" };
  const SAVE = { reply: 2, like: 0.2, hide: 0.3, delete: 0.3 };

  // ---------- events
  const subs = [];
  let dirty = false;
  function emit() {
    const a = document.activeElement;
    if (a && a.matches && a.matches("textarea, input") && !a.closest(".drawer")) { dirty = true; return; }
    dirty = false; subs.forEach((f) => f());
    if (S.drawerId) refreshDrawerState();
  }
  document.addEventListener("focusout", () => { if (dirty) setTimeout(() => { if (dirty) emit(); }, 180); });

  // ---------- actions
  function draftOf(x) { return S.edits[x.id] ?? x.draft ?? ""; }
  function approve(ids, by = "you", how) {
    const done = ids.map(byId).filter((x) => x && x.status === "pending");
    if (!done.length) return [];
    const groups = {};
    done.forEach((x) => { x.status = "done"; S.sel.delete(x.id); const k = x.agent + "|" + (isHuman(x) ? x.type : x.act); (groups[k] = groups[k] || []).push(x); if (by === "you" && x.act && !isHuman(x)) S.approved[x.act]++; });
    const lids = [];
    Object.values(groups).forEach((g) => {
      const x = g[0]; let text;
      if (x.type === "gap") text = "answered " + x.author + " and saved it to knowledge";
      else if (x.type === "escalation") text = (how === "reply" ? "replied to " : "handled ") + x.author;
      else if (g.length > 1) text = past[x.act] + " " + g.length + " comments";
      else text = past[x.act] + " " + x.author + (x.dm ? " and sent a DM" : "");
      const edited = g.some((y) => S.edits[y.id] != null && S.edits[y.id] !== y.draft);
      const e = { lid: ++LID, ids: g.map((y) => y.id), agent: x.agent, text, q: g.length > 1 ? g.slice(0, 3).map((y) => y.text).join(" · ") : x.text, by, t: Date.now(), edited, act: x.act };
      S.log.unshift(e); lids.push(e.lid);
    });
    checkNudge();
    if (by === "you") {
      const el = Math.round((Date.now() - M.t0) / 1000);
      if (!M.firstLead && done.some((x) => x.type === "lead")) { M.firstLead = el; M.firstLeadClicks = M.clicks; }
      if (!M.spamClear && !pending((x) => SPAM.includes(x.type)).length) { M.spamClear = el; M.spamClicks = M.clicks; }
    }
    return lids;
  }
  // Test metrics for the choice criteria (time to first lead, gestures to clear the spam).
  const SPAM = ["spam", "scam", "insult"];
  const M = { t0: Date.now(), clicks: 0, firstLead: null, firstLeadClicks: null, spamClear: null, spamClicks: null };
  document.addEventListener("click", (e) => { if (e.target.closest("button, a, [data-go], [data-open], [data-sel], [data-view], [data-tab], select") && !e.target.closest(".protobar")) M.clicks++; }, true);
  const mmss = (s) => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  function metricsHTML() {
    return `<span class="hide-m">First lead handled: <b>${M.firstLead != null ? mmss(M.firstLead) + " · " + M.firstLeadClicks + (M.firstLeadClicks === 1 ? " click" : " clicks") : "not yet"}</b></span><span class="hide-m">Spam cleared: <b>${M.spamClear != null ? M.spamClicks + (M.spamClicks === 1 ? " click · " : " clicks · ") + mmss(M.spamClear) : "not yet"}</b></span>`;
  }
  function checkNudge() {
    return; // V1 January: no automation, so no "turn on auto" nudge.
    if (S.nudge) return;
    for (const a of ["like", "hide"]) {
      if (!S.auto[a] && !S.nudged[a] && S.approved[a] >= 8 && S.rejected[a] === 0) { S.nudge = a; return; }
    }
  }
  function undo(lids) {
    lids.forEach((lid) => { const e = S.log.find((l) => l.lid === lid); if (!e || e.undone) return; e.undone = true; e.ids.forEach((id) => { const x = byId(id); if (x) { x.status = "pending"; if (e.by === "you" && x.act && S.approved[x.act]) S.approved[x.act]--; } }); });
    emit(); toast("Put back in the inbox");
  }
  const REASONS = { tone: "Wrong tone", info: "Wrong information", noact: "Should not act on this" };
  function reject(id, reason) {
    const x = byId(id); if (!x || x.status !== "pending") return;
    x.status = "rejected"; S.sel.delete(id); if (x.act) S.rejected[x.act]++;
    S.learned[x.agent].unshift({ r: REASONS[reason] || "Not right", q: x.text });
    const e = { lid: ++LID, ids: [id], agent: x.agent, text: "dismissed the suggestion for " + x.author, q: REASONS[reason] || "", by: "you", t: Date.now() };
    S.log.unshift(e);
    emit(); toast(`Noted. The ${agent(x.agent).short} agent will learn from this.`, () => undo([e.lid]));
  }
  function move(id, to) {
    const x = byId(id); if (!x) return; const from = x.agent; x.agent = to;
    S.learned[from].unshift({ r: "Sent to " + agent(to).short, q: x.text });
    if (to === "lead") { x.act = "reply"; x.type = "lead"; x.draft = x.draft || "Thanks! I sent you the link in DM."; x.why = "Moved here by you."; }
    else { x.act = "reply"; x.type = "question"; x.draft = x.draft || "Thanks for your message! Sending you a DM."; x.dm = null; x.product = null; x.why = "Moved here by you."; }
    emit(); toast(`Moved to the ${agent(to).short} agent`);
  }
  function setAuto(act, on) {
    S.auto[act] = on; S.nudged[act] = true; if (S.nudge === act) S.nudge = null;
    let n = 0;
    if (on) { const ids = pending((x) => x.act === act && !isHuman(x)).map((x) => x.id); n = ids.length; approve(ids, "agent"); }
    emit();
    const ag = D.AGENTS.find((a) => a.acts.includes(act));
    toast(on ? `${ag.short} agent is on auto for ${act === "like" ? "likes" : act === "hide" ? "hiding" : "replies"}${n ? `. It just handled ${n}.` : "."}` : "Back to suggestions. You approve each action.");
  }
  function bulk(ids, labelAct) {
    const lids = approve(ids);
    emit();
    if (lids.length) toast(`${ids.length} ${labelAct ? past[labelAct].replace(" to", "") : "done"}`.replace("replied", "replies sent"), () => undo(lids));
  }

  // ---------- live feed
  let liveIdx = 0;
  function tick() {
    S.scanned += 2 + Math.floor(Math.random() * 4); S.lastCheck = Date.now();
    if (liveIdx < D.LIVE.length) {
      const x = { ...D.LIVE[liveIdx++], id: "L" + liveIdx, status: "pending", at: Date.now(), fresh: true };
      S.items.push(x);
      if (x.act && !isHuman(x) && S.auto[x.act]) { approve([x.id], "agent"); }
      setTimeout(() => { x.fresh = false; }, 6000);
    }
    emit();
  }
  setInterval(tick, 11000);

  // ---------- small renderers
  const dot = (id) => `<span class="chip"><span class="d" style="background:${agent(id).dot}"></span>${esc(agent(id).short)}</span>`;
  function rowHTML(x, o = {}) {
    const on = S.sel.has(x.id);
    const human = isHuman(x);
    let sugg = "";
    if (!human && x.act === "reply") {
      sugg = `<div class="sugg"><span class="tag">${ic("reply")}Reply</span><textarea class="draft" rows="1" data-draft="${x.id}">${esc(draftOf(x))}</textarea></div>`;
      if (x.dm) sugg += `<div class="sugg"><span class="tag">${ic("send")}DM</span><span class="muted" style="padding-top:2px">${esc(x.dm)}</span></div>`;
    }
    const acts = human
      ? `<button class="btn sm" data-open="${x.id}">Open</button>`
      : `<button class="btn sm" data-approve="${x.id}">${ic(actIcon[x.act])}${actWord[x.act]}</button><button class="btn sm icon ghost" data-reject="${x.id}" title="Not right">${ic("x")}</button>`;
    return `<div class="it ${o.card ? "card-v" : ""} ${x.fresh ? "fresh" : ""}" data-row="${x.id}">
      ${o.select && !human ? `<div class="sel" data-sel="${x.id}"><span class="check ${on ? "on" : ""}">${on ? ic("check") : ""}</span></div>` : "<div></div>"}
      <div style="min-width:0">
        <div class="who"><span class="net">${x.net}</span><b>${esc(x.author)}</b>${x.followers >= 10000 ? `<span class="chip dark">${kfmt(x.followers)} followers</span>` : `<span>${kfmt(x.followers)} followers</span>`}<span>· ${rel(x.at)}</span>${o.showAgent ? dot(x.agent) : ""}${x.flag ? `<span class="chip ${x.type === "gap" ? "warn" : "red"}">${esc(x.flag)}</span>` : ""}${x.fresh ? '<span class="chip ok">New</span>' : ""}</div>
        <div class="txt" data-open="${x.id}">${esc(x.text)}</div>
        ${o.why || human ? `<div class="muted" style="font-size:12.5px;margin-top:4px">${esc(x.why)}</div>` : ""}
        ${sugg}
      </div>
      <div class="acts">${acts}</div>
    </div>`;
  }
  function selectAllHTML(ids) {
    const all = ids.length && ids.every((id) => S.sel.has(id));
    return `<button class="row" data-selall="${ids.join(",")}" style="font-size:13px;color:var(--muted)"><span class="check ${all ? "on" : ""}">${all ? ic("check") : ""}</span>${all ? "Unselect all" : "Select all " + ids.length}</button>`;
  }
  function bulkbarHTML() {
    if (!S.sel.size) return "";
    const xs = [...S.sel].map(byId).filter(Boolean);
    const acts = [...new Set(xs.map((x) => x.act))];
    const label = acts.length === 1 ? actWord[acts[0]] : "Approve";
    return `<div class="bulkbar"><span>${S.sel.size} selected</span><button class="btn sm light" data-bulk="sel">${acts.length === 1 ? ic(actIcon[acts[0]]) : ic("check")}${label} ${S.sel.size}</button><button class="btn sm dim" data-bulkno>Dismiss</button><button class="btn sm dim" data-selclear>Clear</button></div>`;
  }
  function logHTML(filter = () => true, o = {}) {
    const L = S.log.filter(filter).slice(0, o.limit || 60);
    if (!L.length) return `<div class="empty">Nothing yet. Approved and automatic actions show up here.</div>`;
    return `<div class="log">${L.map((e) => {
      const a = agent(e.agent);
      const who = e.by === "agent" ? `<b>${esc(a.short)} agent</b> <span class="chip dark" style="height:18px;font-size:11px">${ic("bolt")}auto</span>` : `<b>You</b> ${o.showAgent === false ? "" : `<span class="faint">via ${esc(a.short)}</span>`}`;
      return `<div class="lg ${e.undone ? "undone" : ""}">
        <span class="av" style="${e.by === "agent" ? `background:${a.dot};color:#fff` : ""}">${ic(e.by === "agent" ? "bolt" : "check")}</span>
        <div class="b"><div>${who} ${esc(e.text)}${e.edited ? ' <span class="faint">(edited)</span>' : ""}</div>${e.q ? `<div class="q">“${esc(e.q)}”</div>` : ""}</div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px"><span class="t">${rel(e.t)}</span>
        <div class="row" style="gap:2px">${o.fb ? `<span class="fb"><button class="${e.fb === "up" ? "on" : ""}" data-fb="${e.lid}:up" title="Good call">${ic("up")}</button><button class="${e.fb === "down" ? "on" : ""}" data-fb="${e.lid}:down" title="Bad call">${ic("down")}</button></span>` : ""}${e.ids.length && !e.undone ? `<button class="btn sm ghost" style="height:24px;padding:0 6px" data-undo="${e.lid}" title="Undo">${ic("undo")}</button>` : ""}</div></div>
      </div>`;
    }).join("")}</div>`;
  }
  function nudgeHTML(onlyActs) {
    const a = S.nudge; if (!a || (onlyActs && !onlyActs.includes(a))) return "";
    const ag = D.AGENTS.find((x) => x.acts.includes(a));
    const n = S.approved[a];
    return `<div class="nudge">${ic("bolt")}<p>You approved <b>${n} of ${n}</b> ${a === "like" ? "likes" : "hides"} without changes. Let the ${esc(ag.short)} agent ${a === "like" ? "like" : "hide"} on its own? You can undo anything in the log.</p><button class="btn sm pri" data-nudge="yes">Turn on auto</button><button class="btn sm ghost" data-nudge="no">Not now</button></div>`;
  }
  function liveHTML() { return `<span class="live"><span class="pulse"></span>Agents are on · ${S.scanned} messages read · last check ${rel(S.lastCheck)}</span>`; }
  function modeText(a) { const on = a.acts.filter((x) => S.auto[x]); return on.length ? "Auto" : "Suggests"; }
  function agentPanelHTML(id) {
    const a = agent(id);
    const L = S.learned[id];
    return `<div style="display:flex;flex-direction:column;gap:18px">
      <div><div class="lbl">How it works</div><textarea class="field" style="min-height:110px" data-guide="${id}">${esc(S.guides[id])}</textarea><div class="faint" style="font-size:12px;margin-top:6px">Plain words. The agent reads this before every suggestion.</div></div>
      <div><div class="lbl">Knows from</div><div class="row">${ic("book")}<span>${esc(a.source)}</span></div></div>
      <div><div class="lbl">What it can do</div><div class="row" style="flex-wrap:wrap;gap:6px">${a.acts.map((act) => `<span class="chip">${ic(actIcon[act])}${actWord[act] === "Send" ? "Reply" : actWord[act]}</span>`).join("")}</div><div class="faint" style="font-size:12px;margin-top:8px">Suggestions only for now. You approve every action.</div></div>
      <div><div class="lbl">Learned from your feedback</div>${L.length ? L.slice(0, 6).map((l) => `<div class="row" style="align-items:flex-start;padding:6px 0;border-top:1px solid var(--line);font-size:13px"><span class="chip">${esc(l.r)}</span><span class="muted">“${esc(l.q)}”</span></div>`).join("") : `<div class="muted" style="font-size:13px">Nothing yet. Each time you dismiss or edit a suggestion, it shows up here.</div>`}</div>
    </div>`;
  }
  function appnavHTML(label = "Agent Inbox") {
    const n = pending().length;
    return `<div class="brand"><i>a</i>archie</div>
      <a href="#">${ic("cal")}Publishing</a><a href="#">${ic("archive")}Archive</a>
      <a href="#" class="on">${ic("inbox")}${label}<span class="cnt">${n}</span></a>
      <div class="foot">${esc(D.BRAND.name)}<br>Instagram · Facebook · TikTok</div>`;
  }
  function protobarHTML(active) {
    return `<b>Agent Inbox</b><span class="hide-m faint">prototype</span>
      <div class="seg"><a href="a.html" class="${active === "a" ? "on" : ""}">A · Light hub</a><a href="b.html" class="${active === "b" ? "on" : ""}">B · Tab per agent</a></div>
      <span class="sp"></span><span class="hide-m faint">Back after 3 days · fake data</span><span id="metrics" class="row" style="gap:14px">${metricsHTML()}</span><button onclick="location.reload()">Reset</button>`;
  }
  subsPush(() => { const m = document.getElementById("metrics"); if (m) m.innerHTML = metricsHTML(); });
  function subsPush(f) { subs.push(f); }
  function counts() {
    const done = S.log.filter((e) => !e.undone && e.t > now - 3600000 * 12);
    const saved = done.reduce((s, e) => s + e.ids.reduce((t, id) => { const x = byId(id); return t + (x && x.act ? SAVE[x.act] : 1); }, 0), 0);
    return {
      pending: pending((x) => !isHuman(x)).length, needs: pending(isHuman).length,
      done: done.reduce((s, e) => s + e.ids.length, 0), auto: done.filter((e) => e.by === "agent").reduce((s, e) => s + e.ids.length, 0),
      leads: S.items.filter((x) => x.type === "lead" && x.status !== "rejected").length, saved: Math.round(saved)
    };
  }

  // ---------- drawer
  document.body.insertAdjacentHTML("beforeend", `<div class="scrim" data-close></div><aside class="drawer" aria-label="Detail"></aside><div class="toast"></div>`);
  const drawer = $(".drawer"), scrim = $(".scrim");
  function openDrawer(html) { drawer.innerHTML = html; drawer.classList.add("on"); scrim.classList.add("on"); }
  function closeDrawer() { drawer.classList.remove("on"); scrim.classList.remove("on"); S.drawerId = null; S.drawerAgent = null; }
  function openDetail(id) {
    const x = byId(id); if (!x) return; S.drawerId = id; S.drawerAgent = null;
    const p = D.POSTS[x.post], a = agent(x.agent);
    let body = `<div><div class="lbl">On this post</div><div class="post"><div class="ph"></div><div><div class="row" style="gap:6px"><span class="net">${p.net}</span><span class="muted" style="font-size:12px">${p.kind} · ${p.ago}</span></div>${esc(p.cap)}</div></div></div>
      <div><div class="lbl">Message</div><div class="msg"><div class="who"><span class="net">${x.net}</span><b>${esc(x.author)}</b><span>${esc(x.handle)}</span><span>· ${kfmt(x.followers)} followers · ${rel(x.at)}</span></div>${esc(x.text)}</div></div>`;
    let foot = "";
    if (x.type === "escalation") {
      body += `<div class="flag">${ic("alert")}<div><b>${esc(x.flag)}.</b> ${esc(x.why)}</div></div>
        <div><div class="lbl">Reply yourself</div><textarea class="field" id="dReply" placeholder="Write a reply, or mark it as handled if you dealt with it elsewhere."></textarea></div>`;
      foot = `<button class="btn pri" data-dact="reply">${ic("send")}Send reply</button><button class="btn" data-dact="handled">Mark as handled</button>`;
    } else if (x.type === "gap") {
      body += `<div class="flag warn">${ic("book")}<div><b>Knowledge gap.</b> ${esc(x.why)}</div></div>
        <div><div class="lbl">Your answer</div><textarea class="field" id="dReply" placeholder="Ex: Yes, it is safe around pets once dry."></textarea><div class="faint" style="font-size:12px;margin-top:6px">We reply with this and the ${esc(a.short)} agent reuses it next time.</div></div>`;
      foot = `<button class="btn pri" data-dact="gap">${ic("send")}Save and reply</button>`;
    } else {
      body += `<div><div class="lbl">${esc(a.name)} suggests</div>`;
      if (x.act === "reply") {
        body += `<textarea class="field" data-draft="${x.id}">${esc(draftOf(x))}</textarea>`;
        if (x.dm) body += `<div class="row" style="margin-top:8px;font-size:13px">${ic("send")}<span>Then a DM with <b>${esc(x.dm.split(" → ")[0])}</b></span></div>`;
        if (x.product) body += `<div class="prod" style="margin-top:8px"><div class="ph"></div><div style="flex:1">${esc(x.product.name)}<div class="muted" style="font-size:12px">${esc(x.product.price)} · in stock</div></div><span class="chip">Matched</span></div>`;
      } else if (x.act === "like") body += `<div class="row">${ic("heart")}Like this comment</div>`;
      else if (x.act === "delete") body += `<div class="row">${ic("trash")}Delete this comment. It disappears for everyone.</div>`;
      else body += `<div class="row">${ic("eyeoff")}Hide this comment. The author and their friends still see it.</div>`;
      body += `</div><div class="why">${ic("spark")}<div style="flex:1">${esc(x.why)}<div class="row" style="margin-top:6px;font-size:12px" ><span class="muted">Confidence</span><span class="conf"><span style="width:${Math.round(x.conf * 100)}%"></span></span><span class="muted">${Math.round(x.conf * 100)}%</span><span class="sp"></span><span class="faint">${esc(x.src || "")}</span></div></div></div>
        <div class="row"><span class="muted" style="font-size:13px">Wrong agent?</span><select class="mv" data-move="${x.id}"><option value="">Send to…</option>${D.AGENTS.filter((g) => g.id !== x.agent).map((g) => `<option value="${g.id}">${esc(g.name)}</option>`).join("")}</select></div>`;
      foot = `<button class="btn pri" data-dact="approve">${ic(actIcon[x.act])}${actWord[x.act]}</button><button class="btn" data-reject="${x.id}">Not right</button>`;
    }
    const nextN = pending((y) => y.type === x.type && y.id !== x.id).length;
    openDrawer(`<div class="dh">${dot(x.agent)}<span class="muted" style="font-size:13px">${{ lead: "Lead", question: "Question", positive: "Positive comment", spam: "Spam", scam: "Scam", insult: "Insult" }[x.type] || ""}</span><span class="sp"></span><button class="btn icon ghost" data-close>${ic("x")}</button></div>
      <div class="db">${body}<div id="dState"></div></div>
      <div class="df">${foot}<span class="sp"></span><span class="faint" style="font-size:12px">${nextN ? nextN + " more like this" : ""}</span></div>`);
    refreshDrawerState();
  }
  function refreshDrawerState() {
    const x = byId(S.drawerId), st = $("#dState"); if (!x || !st) return;
    if (x.status !== "pending") { st.innerHTML = `<div class="chip ok">${ic("check")}Already handled</div>`; drawer.querySelectorAll(".df .btn").forEach((b) => (b.disabled = true)); }
  }
  function nextAfter(x) {
    const nx = pending((y) => y.type === x.type)[0];
    if (nx) openDetail(nx.id); else closeDrawer();
  }
  function openAgent(id) {
    S.drawerAgent = id; S.drawerId = null; const a = agent(id);
    openDrawer(`<div class="dh"><span class="chip"><span class="d" style="background:${a.dot}"></span>${esc(a.name)}</span><span class="sp"></span><button class="btn icon ghost" data-close>${ic("x")}</button></div>
      <div class="db"><p class="muted">${esc(a.role)}</p>${agentPanelHTML(id)}<div><div class="lbl">Recent activity</div>${logHTML((e) => e.agent === id, { fb: true, limit: 8, showAgent: false })}</div></div>`);
  }

  // ---------- toast
  let tt;
  function toast(msg, undoFn) {
    const t = $(".toast"); t.innerHTML = `<span>${esc(msg)}</span>${undoFn ? '<button data-tundo>Undo</button>' : ""}`; t.classList.add("on");
    t._undo = undoFn; clearTimeout(tt); tt = setTimeout(() => t.classList.remove("on"), 4200);
  }

  // ---------- reject menu
  function openMenu(btn, id) {
    closeMenu(); const r = btn.getBoundingClientRect(); const x = byId(id);
    const m = document.createElement("div"); m.className = "menu";
    m.innerHTML = `<p>Why is it not right?</p>${Object.entries(REASONS).map(([k, v]) => `<button data-reason="${id}:${k}">${v}</button>`).join("")}<p>Wrong agent, send to</p>${D.AGENTS.filter((g) => g.id !== x.agent).map((g) => `<button data-moveto="${id}:${g.id}">${esc(g.name)}</button>`).join("")}`;
    document.body.appendChild(m);
    const left = Math.min(r.left, innerWidth - 240), top = r.bottom + 6 + m.offsetHeight > innerHeight ? r.top - m.offsetHeight - 6 : r.bottom + 6;
    m.style.left = left + "px"; m.style.top = top + "px";
  }
  function closeMenu() { document.querySelectorAll(".menu").forEach((m) => m.remove()); }

  // ---------- delegation
  function autosize(root = document) { root.querySelectorAll("textarea.draft").forEach((t) => { t.style.height = "auto"; t.style.height = t.scrollHeight + "px"; }); }
  document.addEventListener("input", (e) => {
    const t = e.target;
    if (t.dataset.draft) { S.edits[t.dataset.draft] = t.value; if (t.classList.contains("draft")) autosize(t.parentElement); document.querySelectorAll(`[data-draft="${t.dataset.draft}"]`).forEach((o) => { if (o !== t) o.value = t.value; }); }
    if (t.dataset.guide) S.guides[t.dataset.guide] = t.value;
  });
  document.addEventListener("change", (e) => { const t = e.target; if (t.dataset.move && t.value) { const id = t.dataset.move; move(id, t.value); openDetail(id); } });
  document.addEventListener("click", (e) => {
    const g = (k) => e.target.closest(`[data-${k}]`);
    let el;
    if (!e.target.closest(".menu") && !g("reject")) closeMenu();
    if ((el = g("tundo"))) { const f = $(".toast")._undo; $(".toast").classList.remove("on"); f && f(); return; }
    if ((el = g("close"))) return closeDrawer();
    if ((el = g("approve"))) { const x = byId(el.dataset.approve); const lids = approve([x.id]); emit(); toast({ reply: "Sent", like: "Liked", hide: "Hidden", delete: "Deleted" }[x.act], () => undo(lids)); return; }
    if ((el = g("reject"))) { openMenu(el, el.dataset.reject); return; }
    if ((el = g("reason"))) { const [id, r] = el.dataset.reason.split(":"); closeMenu(); const x = byId(id); const inDrawer = S.drawerId === id; reject(id, r); if (inDrawer) nextAfter(x); return; }
    if ((el = g("moveto"))) { const [id, to] = el.dataset.moveto.split(":"); closeMenu(); move(id, to); if (S.drawerId === id) openDetail(id); return; }
    if ((el = g("open"))) { openDetail(el.dataset.open); return; }
    if ((el = g("sel"))) { const id = el.dataset.sel; S.sel.has(id) ? S.sel.delete(id) : S.sel.add(id); emit(); return; }
    if ((el = g("selall"))) { const ids = el.dataset.selall.split(",").filter(Boolean); const all = ids.every((id) => S.sel.has(id)); ids.forEach((id) => (all ? S.sel.delete(id) : S.sel.add(id))); emit(); return; }
    if ((el = g("selclear"))) { S.sel.clear(); emit(); return; }
    if ((el = g("bulk"))) { const v = el.dataset.bulk; const ids = v === "sel" ? [...S.sel] : v.split(","); const xs = ids.map(byId).filter(Boolean); const a = [...new Set(xs.map((x) => x.act))]; bulk(ids, a.length === 1 ? a[0] : null); return; }
    if ((el = g("bulkno"))) { [...S.sel].forEach((id) => { const x = byId(id); if (x) { x.status = "rejected"; if (x.act) S.rejected[x.act]++; } }); const n = S.sel.size; S.sel.clear(); emit(); toast(`${n} suggestions dismissed`); return; }
    if ((el = g("undo"))) { undo([+el.dataset.undo]); return; }
    if ((el = g("fb"))) { const [lid, d] = el.dataset.fb.split(":"); const en = S.log.find((l) => l.lid === +lid); if (en) { en.fb = en.fb === d ? null : d; if (en.fb === "down") S.learned[en.agent].unshift({ r: "Bad call", q: en.q || en.text }); } emit(); if (S.drawerAgent) openAgent(S.drawerAgent); toast(d === "up" ? "Thanks. More like this." : "Noted. The agent will adjust."); return; }
    if ((el = g("auto"))) { const a = el.dataset.auto; setAuto(a, !S.auto[a]); if (S.drawerAgent) openAgent(S.drawerAgent); return; }
    if ((el = g("nudge"))) { const a = S.nudge; if (el.dataset.nudge === "yes") setAuto(a, true); else { S.nudged[a] = true; S.nudge = null; emit(); } return; }
    if ((el = g("agentopen"))) { openAgent(el.dataset.agentopen); return; }
    if ((el = g("dact"))) {
      const x = byId(S.drawerId); if (!x) return; const v = el.dataset.dact; const txt = ($("#dReply") || {}).value || "";
      if ((v === "reply" || v === "gap") && !txt.trim()) { toast("Write a reply first"); $("#dReply").focus(); return; }
      if (v === "gap") S.learned[x.agent].unshift({ r: "Added to knowledge", q: txt.trim() });
      const lids = approve([x.id], "you", v === "reply" ? "reply" : undefined); emit();
      toast(v === "gap" ? "Sent and saved. The agent will reuse this answer." : v === "approve" ? "Done" : v === "reply" ? "Reply sent" : "Marked as handled", () => undo(lids));
      nextAfter(x); return;
    }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeMenu(); closeDrawer(); } });

  window.App = { D, S, $, esc, ic, agent, byId, pending, isHuman, rel, kfmt, dot, rowHTML, selectAllHTML, bulkbarHTML, logHTML, nudgeHTML, liveHTML, modeText, agentPanelHTML, appnavHTML, protobarHTML, counts, openDetail, openAgent, autosize, toast, emit, past, actWord, actIcon,
    on: (f) => { subs.push(f); f(); } };
})();
