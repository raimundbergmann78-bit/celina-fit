/* Celina Fit – Oberflaeche, Speicher auf dem Handy und Sicherung nach GitHub */
'use strict';
const { DEVICES, WORKOUTS, SPECIAL, PLAN_A, PLAN_B, DAYS, DEFAULT, iso, addDays, wdIdx, mondayOf, fmt, infoOf, imgOf } = CF;
const { L, LR } = SPRACHE;
const fmtLong = s => L(CF.DAYS_LONG[wdIdx(s)]) + ', ' + fmt(s) + CF.fromIso(s).getFullYear();
const dez = n => SPRACHE.getLang() === 'en' ? String(n) : String(n).replace('.', ',');
const KEY = 'celinafit.v1', SYNC_KEY = 'celinafit.sync', SYNC_FILE = 'celina-daten.json';

// ---------- Speicher (liegt im Browser-Speicher des Handys, automatisch) ----------
let S = load(), SYNC = loadSync();
function load() {
  try { const j = JSON.parse(localStorage.getItem(KEY)); if (j) return Object.assign({}, DEFAULT, j); } catch (e) { }
  return JSON.parse(JSON.stringify(DEFAULT));
}
function loadSync() { try { return JSON.parse(localStorage.getItem(SYNC_KEY)) || {}; } catch (e) { return {}; } }
function saveSync() { localStorage.setItem(SYNC_KEY, JSON.stringify(SYNC)); }
function save(push = true) { S.updatedAt = Date.now(); localStorage.setItem(KEY, JSON.stringify(S)); if (push) schedulePush(); }
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { }

function today() { return iso(new Date()); }
const weekNo = s => CF.weekNo(S.startDate, s), planLetter = s => CF.planLetter(S.startDate, s), planKey = s => CF.planKey(S, s);
const gearOf = s => CF.gearOf(S, s), stepMinutes = w => CF.stepMinutes(S, w), devOf = s => CF.devOf(S, s), sessionOf = s => CF.sessionOf(S, s);
const lastWeight = () => CF.lastWeight(S), weightThisWeek = () => CF.weightThisWeek(S, today());
const kcalEst = (type, min, dev) => CF.kcalEst(lastWeight(), type, min, dev);
if (!S.startDate) { S.startDate = mondayOf(today()); save(false); }
SPRACHE.setLang(S.lang || 'de');

// ---------- Hilfen ----------
const $ = sel => document.querySelector(sel);
function h(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function num(v) { const n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? 0 : n; }
let audio;
function beep(n = 2) {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < n; i++) {
      const o = audio.createOscillator(), g = audio.createGain();
      o.connect(g); g.connect(audio.destination); o.frequency.value = 880;
      const t = audio.currentTime + i * 0.25; g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.start(t); o.stop(t + 0.2);
    }
  } catch (e) { }
  try { if (navigator.vibrate) navigator.vibrate([150, 80, 150]); } catch (e) { }
}
let timers = [], lastTap = 0;
function clearTimers() { timers.forEach(clearInterval); timers = []; }

const ICONS = {
  swim: `<svg viewBox="0 0 120 90" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="80" cy="28" r="8" stroke="#7ad7ff"/><path d="M28 50c10-14 22-18 34-13l12 9M50 44l-8 12" stroke="#7ad7ff"/><path d="M6 64c8-8 16-8 24 0s16 8 24 0 16-8 24 0 16 8 24 0" stroke="#ff8c1a"/><path d="M6 78c8-8 16-8 24 0s16 8 24 0 16-8 24 0 16 8 24 0" stroke="#ff8c1a" opacity=".55"/></svg>`,
  step: `<svg viewBox="0 0 120 90" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M8 80h24V60h24V40h24V20h26" stroke="#ff8c1a"/><circle cx="64" cy="20" r="7" stroke="#7ad7ff"/><path d="M64 27v20l-11 15M64 47l10 11M64 33l13 4M64 33l-13 8" stroke="#7ad7ff"/></svg>`,
  lauf: `<svg viewBox="0 0 120 90" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 72h80M18 72l-7 10h90l-7-10M90 72V26h12" stroke="#ff8c1a"/><circle cx="50" cy="24" r="7" stroke="#7ad7ff"/><path d="M50 31v18l-10 17M50 49l11 15M50 37l13-4M50 37l-13 9" stroke="#7ad7ff"/></svg>`,
  rad: `<svg viewBox="0 0 120 90" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="26" cy="66" r="16" stroke="#ff8c1a"/><circle cx="94" cy="66" r="16" stroke="#ff8c1a"/><path d="M26 66l20-30h24l24 30M46 36h-12M70 36l-6-14h10M60 66l-14-30M60 66h-16" stroke="#ff8c1a"/><circle cx="60" cy="66" r="4" stroke="#7ad7ff"/><circle cx="66" cy="14" r="5" stroke="#7ad7ff"/></svg>`,
  rest: `<svg viewBox="0 0 120 90" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M72 12a30 30 0 1 0 30 38A24 24 0 0 1 72 12z" stroke="#7ad7ff"/><path d="M24 18l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM32 58l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" stroke="#ff8c1a"/></svg>`
};

// ---------- Pause ----------
let restIv = null;
function startRest(sec) {
  stopRest();
  const bar = $('#restbar'), t = $('#restTime');
  let left = sec; t.textContent = left; bar.hidden = false;
  restIv = setInterval(() => { left--; t.textContent = left; if (left <= 0) { stopRest(); beep(2); } }, 1000);
}
function stopRest() { clearInterval(restIv); restIv = null; $('#restbar').hidden = true; }
$('#restSkip').onclick = stopRest;

// ---------- Modal ----------
function openModal(html, { closable = true, full = false } = {}) {
  const m = $('#modal'), box = $('#modalBox'); box.className = 'modal-box' + (full ? ' full' : ''); box.innerHTML = html; m.hidden = false;
  m.onclick = e => { if ((e.target === m || full) && closable) closeModal(); };
}
function closeModal() { $('#modal').hidden = true; }
function lightbox(src, name, reps, how, pos) {
  const bilder = pos && pos.length > 1
    ? `<div class="pos-reihe">${pos.map((p, i) => `<figure><img src="${p}" alt=""><figcaption>Position ${i + 1}</figcaption></figure>`).join('')}</div>`
    : `<img src="${src}" alt="">`;
  openModal(`${bilder}<div class="ex-name">${esc(name)}</div><div class="ex-sub">${esc(reps)}</div>${how ? `<div class="ex-how">${esc(how)}</div>` : ''}<div class="hint center" style="margin-top:12px">${L('Tippen zum Schließen')}</div>`, { full: true });
}
// Positionen 1-2-3 wechseln automatisch wie eine kleine Animation
function posWechsel(imgEl, dotsEl, pos) {
  let i = 0;
  const iv = setInterval(() => {
    if (!document.body.contains(imgEl)) { clearInterval(iv); return; }
    i = (i + 1) % pos.length; imgEl.src = pos[i];
    dotsEl.querySelectorAll('span').forEach((d, k) => d.classList.toggle('on', k === i));
  }, 1400);
  timers.push(iv);
}

// ---------- Ansichten ----------
let view = 'heute', selDate = today(), weekCursor = today();
function setTop(t, s) { $('#topTitle').textContent = t; $('#topSub').textContent = s || ''; }
function render() {
  clearTimers();
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  document.querySelectorAll('#nav button').forEach(b => { const tn = [...b.childNodes].reverse().find(n => n.nodeType === 3); if (tn) { b.dataset.de = b.dataset.de || tn.textContent.trim(); tn.textContent = L(b.dataset.de); } });
  const sp = document.querySelector('#splash p'); if (sp) sp.textContent = L('Tippen zum Starten');
  $('.rest-label').textContent = L('Pause'); $('#restSkip').textContent = L('Weiter');
  document.documentElement.lang = SPRACHE.getLang();
  const v = $('#view'); v.innerHTML = '';
  ({ heute: renderHeute, woche: renderWoche, essen: renderEssen, supps: renderSupps, gewicht: renderGewicht, verlauf: renderVerlauf, einstellungen: renderEinst })[view](v);
  updateSyncBadge();
  window.scrollTo(0, 0);
}
document.querySelectorAll('#nav button').forEach(b => b.onclick = () => { view = b.dataset.view; if (view === 'heute') selDate = today(); if (view === 'essen') { essenDate = today(); essenOpen = {}; } if (view === 'supps') { suppDate = today(); suppOpen = {}; suppEdit = false; } render(); });

// ----- Heute -----
function renderHeute(v) {
  const s = selDate, key = planKey(s), info = infoOf(key), w = weekNo(s), isToday = s === today();
  setTop(isToday ? L('Heute') : fmtLong(s), (isToday ? fmtLong(s) + ' · ' : '') + L('Woche {0} · Plan {1}', w, planLetter(s)));
  if (isToday && !weightThisWeek()) setTimeout(weightModal, 300);
  const done = sessionOf(s);
  const card = h(`<div class="card"><h2>${esc(L(info.name))}</h2><div class="sub">${esc(L(info.sub))}</div></div>`);
  v.appendChild(card);
  if (done) {
    const extra = (done.dev ? ' · ' + L(DEVICES[done.dev].n) : '') + (done.km ? ' · ' + dez(done.km) + ' km' : '');
    card.appendChild(h(`<div class="done-banner" style="margin-top:12px">${L('✅ Erledigt: {0} min · {1} kcal', done.min, done.kcal)}${esc(extra)}</div>`));
    card.appendChild(h(`<button class="btn light">${L('Rückgängig')}</button>`)).onclick = () => {
      if (confirm(L('Eintrag löschen?'))) { S.sessions = S.sessions.filter(x => x !== done); if (S.log) delete S.log[s]; save(); render(); }
    };
    return;
  }
  if (WORKOUTS[key]) renderWorkout(v, card, s, key, info);
  else if (key === 'swim') renderSwim(v, card, s);
  else if (key === 'step') renderStep(v, card, s, w);
  else renderRest(v, card);
  const other = h(`<button class="btn light">${L('Anderes Workout für diesen Tag')}</button>`);
  v.appendChild(other); other.onclick = () => chooseWorkout(s);
}

// ----- Workout: gefuehrter Ablauf (eine Uebung nach der anderen) -----
// Gespeichert in S.log[s] = { start, sets: { ei: [Wdh oder Sekunden, ...] }, skip: { ei: true }, ende }
let wkPause = null; // { s, left, total, iv } laeuft nur im Speicher
function wkLog(s) { S.log = S.log || {}; return S.log[s]; }
function wkStopPause() { if (wkPause) { clearInterval(wkPause.iv); wkPause = null; } }
function exName(e, gear) { return L(gear === 'band' && e.band ? e.band.n : e.n); }

function renderWorkout(v, card, s, key, info) {
  const gear = gearOf(s), hasBand = info.ex.some(e => e.band), log = wkLog(s);
  const dauer = CF.DAUER_STUFEN.includes(S.dauer) ? S.dauer : 30;
  const exList = CF.exercisesFor(info, log && log.dauer ? log.dauer : dauer);
  if (!log) card.appendChild(h(`<div class="tips">${info.tips.map(t => `<span>${esc(L(t))}</span>`).join('')}</div>`));
  if (!log) return renderWorkoutStart(v, card, s, key, info, gear, hasBand, dauer, exList);
  const next = CF.naechsterSatz(exList, log);
  if (wkPause && wkPause.s === s) return renderWorkoutPause(v, s, key, info, gear, exList, next);
  if (!next) return renderWorkoutFertig(v, s, key, info, gear, exList, log);
  renderWorkoutSatz(v, s, key, info, gear, exList, log, next);
}

function renderWorkoutStart(v, card, s, key, info, gear, hasBand, dauer, exList) {
  if (hasBand) {
    const g = h(`<div class="gear"><button data-g="hantel">${L('🏋️ Hanteln')}</button><button data-g="band">${L('🟣 Gummiband')}</button></div>`);
    g.querySelectorAll('button').forEach(b => { b.classList.toggle('on', b.dataset.g === gear); b.onclick = () => { S.gear[s] = b.dataset.g; save(); render(); }; });
    card.appendChild(g);
    card.appendChild(h(`<div class="hint">${L('Diese Woche laut Plan: {0} (wechselt alle 2 Wochen)', L(gear === 'band' ? 'Gummiband' : 'Hanteln'))}</div>`));
  }
  const dg = h(`<div class="gear">${CF.DAUER_STUFEN.map(d => `<button data-d="${d}">${d} min</button>`).join('')}</div>`);
  dg.querySelectorAll('button').forEach(b => { b.classList.toggle('on', Number(b.dataset.d) === dauer); b.onclick = () => { S.dauer = Number(b.dataset.d); save(); render(); }; });
  card.appendChild(dg);
  const saetze = exList.reduce((a, e) => a + e.s, 0);
  card.appendChild(h(`<div class="big" style="font-size:30px">${L('{0} Übungen · {1} Sätze', exList.length, saetze)}</div>`));
  card.appendChild(h(`<div class="hint center">${L('Mit 30 min anfangen, später in 10-Minuten-Stufen steigern.')}</div>`));
  const go = h(`<button class="btn" style="margin-top:14px;font-size:20px;padding:18px">${L('▶ Training starten')}</button>`);
  go.disabled = s > today();
  go.onclick = () => { S.log = S.log || {}; S.log[s] = { start: Date.now(), dauer, sets: {}, skip: {} }; save(); render(); window.scrollTo(0, 0); };
  card.appendChild(go);
  if (s > today()) card.appendChild(h(`<div class="hint center">${L('Starten geht erst am Trainingstag.')}</div>`));
  const tog = h(`<button class="btn light small" style="margin-top:12px">${L('Übungen ansehen')}</button>`); card.appendChild(tog);
  tog.onclick = () => {
    const n = tog.nextSibling;
    if (n && n.classList && n.classList.contains('wk-liste')) { n.remove(); tog.textContent = L('Übungen ansehen'); return; }
    tog.after(h(`<div class="wk-liste">${exList.map((e, i) => `<div class="list-item"><span>${i + 1}. ${esc(exName(e, gear))}</span><span>${e.s} × ${esc(LR(e.r))}</span></div>`).join('')}</div>`));
    tog.textContent = L('Liste ausblenden');
  };
}

function wkBild(e, key, ei, gear) {
  const img = e.img || imgOf(key, ei), pos = e.pos && e.pos.length > 1 ? e.pos : null, useBand = gear === 'band' && e.band;
  const wrap = h(`<div class="exwrap"><img class="eximg" src="${img}" alt="${esc(e.n)}">${useBand ? '<span class="badge">' + L('🟣 mit Gummiband') + '</span>' : ''}${pos ? `<div class="pos-dots">${pos.map((_, k) => `<span class="${k === 0 ? 'on' : ''}">${k + 1}</span>`).join('')}</div>` : ''}<span class="zoom">${L('⤢ größer')}</span></div>`);
  if (pos) { pos.slice(1).forEach(p => { const pre = new Image(); pre.src = p; }); posWechsel(wrap.querySelector('.eximg'), wrap.querySelector('.pos-dots'), pos); }
  wrap.onclick = () => lightbox(img, exName(e, gear), `${e.s} × ${LR(e.r)}`, useBand ? L(e.band.how) : '', pos);
  return wrap;
}
function wkKopf(exList, log, ei, satz) {
  const done = CF.saetzeErledigt(exList, log), total = exList.reduce((a, e) => a + e.s, 0);
  return h(`<div class="wk-kopf"><div class="wk-schritt">${L('Übung {0} von {1} · Satz {2} von {3}', ei + 1, exList.length, satz + 1, exList[ei].s)}</div><div class="wk-bar"><div style="width:${Math.round(done / total * 100)}%"></div></div></div>`);
}

function renderWorkoutSatz(v, s, key, info, gear, exList, log, next) {
  const e = exList[next.ei], card = h(`<div class="card wk"></div>`); v.appendChild(card);
  card.appendChild(wkKopf(exList, log, next.ei, next.satz));
  card.appendChild(wkBild(e, key, next.ei, gear));
  card.appendChild(h(`<div class="ex-name" style="font-size:22px">${esc(exName(e, gear))}</div>`));
  card.appendChild(h(`<div class="ex-sub">${esc(e.sec ? L('Ziel: {0}', LR(e.r)) : L('Ziel: {0} Wiederholungen', LR(e.r)))}</div>`));
  if (gear === 'band' && e.band) card.appendChild(h(`<div class="ex-how">${esc(L(e.band.how))}</div>`));
  const vorher = ((log.sets || {})[next.ei] || []);
  const vorschlag = vorher.length ? vorher[vorher.length - 1] : (e.sec || CF.zielWdh(e.r));
  const einheit = L(e.sec ? 'Sekunden' : 'Wiederholungen');
  const feld = h(`<div class="wk-eingabe"><button class="wk-pm">−</button><input type="number" inputmode="numeric" min="0" value="${vorschlag}"><button class="wk-pm">+</button></div>`);
  const inp = feld.querySelector('input'), [minus, plus] = feld.querySelectorAll('button');
  minus.onclick = () => { inp.value = Math.max(0, (Number(inp.value) || 0) - 1); };
  plus.onclick = () => { inp.value = (Number(inp.value) || 0) + 1; };
  if (e.sec) {
    const uhr = h(`<div class="big" id="wkUhr">${e.sec}s</div>`), sb = h(`<button class="btn pink">${L('▶ {0} Sekunden starten', e.sec)}</button>`);
    card.appendChild(uhr); card.appendChild(sb);
    let iv = null, gelaufen = 0;
    sb.onclick = () => {
      if (iv) { clearInterval(iv); iv = null; inp.value = gelaufen; sb.textContent = L('▶ Weiter'); return; }
      sb.textContent = L('⏸ Anhalten');
      iv = setInterval(() => { gelaufen++; const left = e.sec - gelaufen; uhr.textContent = (left > 0 ? left : 0) + 's'; inp.value = gelaufen;
        if (left <= 0) { clearInterval(iv); iv = null; beep(3); sb.textContent = L('Geschafft!'); sb.disabled = true; } }, 1000);
      timers.push(iv);
    };
  }
  card.appendChild(h(`<label class="center">${L('Geschafft ({0})', einheit)}</label>`));
  card.appendChild(feld);
  const ok = h(`<button class="btn" style="font-size:20px;padding:16px;margin-top:12px">${L('OK – Satz {0} fertig', next.satz + 1)}</button>`);
  ok.onclick = () => {
    const now = Date.now(); if (now - lastTap < 600) return; lastTap = now;
    const wert = Math.max(0, Math.round(Number(inp.value) || 0));
    log.sets = log.sets || {}; (log.sets[next.ei] = log.sets[next.ei] || []).push(wert);
    const c = S.checks[s] || (S.checks[s] = {}); (c[next.ei] = c[next.ei] || [])[next.satz] = true;
    save(); beep(1);
    if (CF.naechsterSatz(exList, log)) wkStartPause(s, info.rest); else { wkStopPause(); }
    render(); window.scrollTo(0, 0);
  };
  card.appendChild(ok);
  const row = h(`<div class="btnrow"><button class="btn light small">${L('↶ Letzten Satz zurück')}</button><button class="btn light small">${L('Übung überspringen')}</button></div>`);
  const [zur, skip] = row.querySelectorAll('button');
  zur.disabled = CF.saetzeErledigt(exList, log) === 0;
  zur.onclick = () => { if (CF.letztenSatzZurueck(exList, log)) { save(); render(); } };
  skip.onclick = () => { if (confirm(L('„{0}“ überspringen?', exName(e, gear)))) { log.skip = log.skip || {}; log.skip[next.ei] = true; save(); render(); window.scrollTo(0, 0); } };
  card.appendChild(row);
  wkEndeKnopf(v, s, key, info, exList, log);
}

function wkStartPause(s, sek) {
  wkStopPause();
  wkPause = { s, left: sek, total: sek, iv: null };
  wkPause.iv = setInterval(() => {
    if (!wkPause) return;
    wkPause.left--;
    const t = document.getElementById('wkPauseZeit'), bar = document.getElementById('wkPauseBar');
    if (t) t.textContent = Math.max(0, wkPause.left);
    if (bar) bar.style.width = Math.round((1 - wkPause.left / wkPause.total) * 100) + '%';
    if (wkPause.left <= 0) { wkStopPause(); beep(2); if (view === 'heute') render(); }
  }, 1000);
}

function renderWorkoutPause(v, s, key, info, gear, exList, next) {
  const card = h(`<div class="card wk wk-pause"></div>`); v.appendChild(card);
  card.appendChild(h(`<div class="wk-schritt center">${L('Pause')}</div>`));
  card.appendChild(h(`<div class="big" style="font-size:72px" id="wkPauseZeit">${Math.max(0, wkPause.left)}</div>`));
  card.appendChild(h(`<div class="wk-bar"><div id="wkPauseBar" style="width:${Math.round((1 - wkPause.left / wkPause.total) * 100)}%"></div></div>`));
  if (next) {
    const e = exList[next.ei];
    card.appendChild(h(`<div class="sub center" style="margin-top:14px">${L('Gleich: <b>{0}</b><br>Satz {1} von {2}', esc(exName(e, gear)), next.satz + 1, e.s)}${next.satz === 0 ? L(' · neue Übung') : ''}</div>`));
    if (next.satz === 0) { const b = wkBild(e, key, next.ei, gear); b.classList.add('wk-vorschau'); card.appendChild(b); }
  }
  const row = h(`<div class="btnrow"><button class="btn">${L('Pause beenden ▶')}</button><button class="btn light">+15 s</button></div>`);
  const [weiter, mehr] = row.querySelectorAll('button');
  weiter.onclick = () => { wkStopPause(); render(); window.scrollTo(0, 0); };
  mehr.onclick = () => { if (wkPause) { wkPause.left += 15; wkPause.total += 15; document.getElementById('wkPauseZeit').textContent = wkPause.left; } };
  card.appendChild(row);
}

function renderWorkoutFertig(v, s, key, info, gear, exList, log) {
  const card = h(`<div class="card wk"></div>`); v.appendChild(card);
  card.appendChild(h(`<div class="big" style="font-size:34px">${L('💪 Geschafft!')}</div>`));
  const min = CF.trainingsMinuten(log, Date.now());
  card.appendChild(h(`<div class="sub center">${L('Alle Übungen erledigt')}${min ? L(' · {0} Minuten', min) : ''}</div>`));
  card.appendChild(h(`<h3>${L('Deine Sätze')}</h3>`));
  exList.forEach((e, ei) => {
    const w = (log.sets || {})[ei] || [], sk = (log.skip || {})[ei];
    card.appendChild(h(`<div class="list-item"><span>${esc(exName(e, gear))}</span><span>${sk ? L('übersprungen') : esc(w.join(' · ')) + (e.sec ? ' s' : '')}</span></div>`));
  });
  const fin = h(`<button class="btn" style="margin-top:14px">${L('Workout abschließen')}</button>`);
  fin.onclick = () => finishModal({ s, key, name: info.name, min: min || log.dauer || 30, type: info.type });
  card.appendChild(fin);
}

function wkEndeKnopf(v, s, key, info, exList, log) {
  const b = h(`<button class="btn light" style="margin-top:12px">${L('Training beenden')}</button>`);
  b.onclick = () => {
    if (!confirm(L('Training jetzt beenden? Die geschafften Sätze bleiben gespeichert.'))) return;
    exList.forEach((_, ei) => { const w = (log.sets || {})[ei] || []; if (w.length < exList[ei].s) { log.skip = log.skip || {}; log.skip[ei] = true; } });
    wkStopPause(); save(); render(); window.scrollTo(0, 0);
  };
  v.appendChild(b);
  const neu = h(`<button class="btn light small" style="margin-top:10px;color:#ff4d6d;border-color:#ff4d6d">${L('Training neu starten')}</button>`);
  neu.onclick = () => { if (confirm(L('Alle Sätze von heute löschen und neu starten?'))) { wkStopPause(); delete S.log[s]; delete S.checks[s]; save(); render(); } };
  v.appendChild(neu);
}

function renderSwim(v, card, s) {
  card.appendChild(h(`<div class="hero">${ICONS.swim}</div>`));
  card.appendChild(h(`<div class="big">${S.swimMin} min</div>`));
  card.appendChild(h(`<div class="center sub">${L('Lockeres Tempo, Pausen sind erlaubt.<br>Danach Kilometer und Kalorien eintragen.')}</div>`));
  const b = h(`<button class="btn">${L('Schwimmen erledigt')}</button>`); b.disabled = s > today();
  b.onclick = () => finishModal({ s, key: 'swim', name: 'Schwimmen', min: S.swimMin, type: 'swim', km: true }); v.appendChild(b);
}

function renderStep(v, card, s, w) {
  const target = stepMinutes(w), dev = devOf(s);
  card.appendChild(h(`<div class="hero">${ICONS[dev]}</div>`));
  const g = h(`<div class="gear">${Object.keys(DEVICES).map(k => `<button data-d="${k}">${L(DEVICES[k].n)}</button>`).join('')}</div>`);
  g.querySelectorAll('button').forEach(b => { b.classList.toggle('on', b.dataset.d === dev); b.onclick = () => { S.cardioDev[s] = b.dataset.d; S.lastDev = b.dataset.d; save(); render(); }; });
  card.appendChild(g);
  card.appendChild(h(`<div class="big" id="stepTime">${target}:00</div>`));
  card.appendChild(h(`<div class="center sub">${L('Ziel diese Woche: {0} Minuten · Woche {1}', target, w)}</div>`));
  const row = h(`<div class="btnrow"><button class="btn">${L('Start')}</button><button class="btn light">${L('Zurücksetzen')}</button></div>`);
  card.appendChild(row);
  let left = target * 60, iv = null; const disp = card.querySelector('#stepTime'), [bStart, bReset] = row.querySelectorAll('button');
  const show = () => disp.textContent = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
  bStart.onclick = () => {
    if (iv) { clearInterval(iv); iv = null; bStart.textContent = L('Weiter'); return; }
    bStart.textContent = L('Pause');
    iv = setInterval(() => { left--; show(); if (left <= 0) { clearInterval(iv); iv = null; beep(4); bStart.textContent = L('Geschafft!'); } }, 1000); timers.push(iv);
  };
  bReset.onclick = () => { clearInterval(iv); iv = null; left = target * 60; show(); bStart.textContent = L('Start'); };
  card.appendChild(h(`<div class="hint" style="margin-top:10px">${L('Nächste Woche: {0} min', stepMinutes(w + 1))}${S.holdWeeks.includes(w) ? L(' (Steigerung ausgesetzt)') : ''}</div>`));
  const b = h(`<button class="btn">${esc(L('{0} erledigt', L(DEVICES[dev].n)))}</button>`); b.disabled = s > today();
  b.onclick = () => finishModal({ s, key: 'step', name: DEVICES[dev].n, min: target, type: 'step', w, km: true, dev }); v.appendChild(b);
}

function renderRest(v, card) {
  card.appendChild(h(`<div class="hero">${ICONS.rest}</div>`));
  card.appendChild(h(`<div class="center sub">${L('Heute ist frei. Spazieren, dehnen, viel trinken, gut schlafen.')}</div>`));
}

function chooseWorkout(s) {
  const all = Object.keys(WORKOUTS).map(k => `<option value="${k}">${esc(L(WORKOUTS[k].name))} – ${esc(L(WORKOUTS[k].sub))}</option>`).join('') +
    Object.keys(SPECIAL).map(k => `<option value="${k}">${esc(L(SPECIAL[k].name))}</option>`).join('');
  openModal(`<h2>${L('Workout für {0}', fmt(s))}</h2><div class="sub">${L('Normal laut Plan: {0}', esc(L(infoOf((planLetter(s) === 'A' ? PLAN_A : PLAN_B)[wdIdx(s)]).name)))}</div>
    <label>${L('Auswahl')}</label><select id="wsel">${all}</select>
    <div class="btnrow"><button class="btn" id="wok">${L('Übernehmen')}</button><button class="btn light" id="wplan">${L('Zurück zum Plan')}</button></div>`);
  $('#wsel').value = planKey(s);
  $('#wok').onclick = () => { S.overrides[s] = $('#wsel').value; delete S.checks[s]; save(); closeModal(); render(); };
  $('#wplan').onclick = () => { delete S.overrides[s]; delete S.checks[s]; save(); closeModal(); render(); };
}

function finishModal(o) {
  const est = kcalEst(o.type, o.min, o.dev), manual = o.type === 'swim' || o.type === 'step';
  openModal(`<h2>${esc(L('{0} abschließen', L(o.name)))}</h2>
    <label>${L('Dauer (Minuten)')}</label><input type="number" id="fmin" value="${o.min}" inputmode="numeric">
    ${o.km ? `<label>${L('Kilometer')}</label><input type="text" id="fkm" inputmode="decimal" placeholder="${L('z. B. 1,2')}">` : ''}
    <label>${L('Kalorien')}</label><input type="number" id="fkcal" value="${est}" inputmode="numeric">
    <div class="hint">${L(manual ? 'Wert vom Gerät oder von der Apple Watch eintragen. Vorausgefüllt ist nur eine Schätzung.' : 'Geschätzt aus Gewicht × Dauer. Wert von der Apple Watch? Einfach überschreiben.')}${lastWeight() ? '' : L(' (Gewicht eintragen = genauere Schätzung)')}</div>
    ${o.type === 'step' ? `<div class="check"><input type="checkbox" id="fhold"><span>${L('War zu hart – nächste Woche gleich lassen')}</span></div>` : ''}
    <div class="btnrow"><button class="btn" id="fok">${L('Speichern')}</button><button class="btn light" id="fcancel">${L('Abbrechen')}</button></div>`);
  $('#fmin').oninput = () => { $('#fkcal').value = kcalEst(o.type, Number($('#fmin').value) || 0, o.dev); };
  $('#fcancel').onclick = closeModal;
  $('#fok').onclick = () => {
    const min = Number($('#fmin').value) || o.min, kcal = Number($('#fkcal').value) || 0;
    const km = o.km ? Math.round(num($('#fkm').value) * 10) / 10 : undefined;
    S.sessions.push({ date: today(), planDate: o.s, key: o.key, name: o.name, min, kcal, km, type: o.type, gear: WORKOUTS[o.key] ? gearOf(o.s) : undefined, dev: o.dev });
    if (o.type === 'step' && $('#fhold') && $('#fhold').checked && !S.holdWeeks.includes(o.w)) S.holdWeeks.push(o.w);
    save(); stopRest(); closeModal(); beep(2); render();
  };
}

function weightModal() {
  if (!$('#modal').hidden) return;
  openModal(`<h2>${L('Wochen-Check ⚖️')}</h2><div class="sub">${L('Neue Woche! Bitte zuerst das Gewicht eintragen.')}</div>
    <label>${L('Gewicht (kg)')}</label><input type="text" id="wkg" inputmode="decimal" value="${lastWeight() || ''}" placeholder="${L('z. B. 65,5')}">
    <button class="btn" id="wok" style="margin-top:14px">${L('Speichern')}</button>`, { closable: false });
  $('#wok').onclick = () => { const kg = num($('#wkg').value); if (!kg) return; addWeight(kg); closeModal(); render(); };
}
function addWeight(kg) {
  S.weights = S.weights.filter(x => x.date !== today()); S.weights.push({ date: today(), kg: Math.round(kg * 10) / 10 });
  S.weights.sort((a, b) => a.date < b.date ? -1 : 1); save();
}

// ----- Woche -----
function renderWoche(v) {
  const mon = mondayOf(weekCursor), w = weekNo(mon);
  setTop(L('Wochenplan'), L('Woche {0} · Plan {1} · {2}', w, planLetter(mon), L(gearOf(mon) === 'band' ? 'Gummiband' : 'Hanteln')));
  const nav = h(`<div class="weeknav"><button class="btn light small">‹</button><b>${fmt(mon)} – ${fmt(addDays(mon, 6))}</b><button class="btn light small">›</button></div>`);
  const [p, n] = nav.querySelectorAll('button'); p.onclick = () => { weekCursor = addDays(mon, -7); render(); }; n.onclick = () => { weekCursor = addDays(mon, 7); render(); };
  v.appendChild(nav);
  let kcal = 0, mins = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDays(mon, i), key = planKey(d), info = infoOf(key), ses = sessionOf(d);
    if (ses) { kcal += ses.kcal; mins += ses.min; }
    let extra = '';
    if (key === 'step') extra = L(DEVICES[devOf(d)].n) + ' · ' + stepMinutes(w) + ' min'; else if (key === 'swim') extra = S.swimMin + ' min'; else if (WORKOUTS[key]) extra = L(info.sub);
    const status = ses ? '✅' : (d === today() ? '👉' : (d < today() && key !== 'rest' ? '⬜' : ''));
    const el = h(`<div class="day ${d === today() ? 'today' : ''}"><div class="d"><b>${L(DAYS[i])}</b><span>${fmt(d)}</span></div><div class="n">${esc(L(info.name))}<small>${esc(extra)}${S.overrides[d] ? L(' · geändert') : ''}</small></div><div class="s">${status}</div></div>`);
    el.onclick = () => { selDate = d; view = 'heute'; render(); };
    v.appendChild(el);
  }
  v.appendChild(h(`<div class="stat" style="margin-top:6px"><div><b>${mins}</b><span>${L('Minuten')}</span></div><div><b>${kcal}</b><span>kcal</span></div><div><b>${S.sessions.filter(x => weekNo(x.planDate) === w).length}/6</b><span>${L('erledigt')}</span></div></div>`));
  if (w !== weekNo(today())) { const b = h(`<button class="btn light" style="margin-top:12px">${L('Zu dieser Woche')}</button>`); b.onclick = () => { weekCursor = today(); render(); }; v.appendChild(b); }
}

// ----- Gewicht -----
function renderGewicht(v) {
  setTop(L('Gewicht'), L(weightThisWeek() ? 'Diese Woche eingetragen ✅' : 'Diese Woche noch offen'));
  const c = h(`<div class="card"><label>${L('Gewicht heute (kg)')}</label><input type="text" id="gkg" inputmode="decimal" value="${lastWeight() || ''}" placeholder="${L('z. B. 65,5')}"><button class="btn" id="gok" style="margin-top:12px">${L('Eintragen')}</button></div>`);
  v.appendChild(c);
  c.querySelector('#gok').onclick = () => { const kg = num(c.querySelector('#gkg').value); if (!kg) return; addWeight(kg); render(); };
  if (S.weights.length) {
    const first = S.weights[0].kg, last = lastWeight(), diff = Math.round((last - first) * 10) / 10;
    v.appendChild(h(`<div class="stat"><div><b>${last}</b><span>${L('aktuell')}</span></div><div><b>${first}</b><span>${L('Start')}</span></div><div><b>${diff > 0 ? '+' : ''}${diff}</b><span>${L('Veränderung')}</span></div></div>`));
    v.appendChild(h(`<div class="card">${chart(S.weights.slice(-16).map(x => x.kg), S.weights.slice(-16).map(x => fmt(x.date)))}</div>`));
    const list = h(`<div class="card"></div>`);
    S.weights.slice().reverse().slice(0, 20).forEach((x, i, arr) => {
      const prev = arr[i + 1]; const d = prev ? Math.round((x.kg - prev.kg) * 10) / 10 : 0;
      const row = h(`<div class="list-item"><span>${fmt(x.date)}<small>${L('Woche')} ${weekNo(x.date)}</small></span><span><b>${x.kg} kg</b> <span class="muted small-text">${prev ? (d > 0 ? '+' : '') + d : ''}</span></span></div>`);
      row.onclick = () => { if (confirm(L('Eintrag {0} löschen?', fmt(x.date)))) { S.weights = S.weights.filter(y => y !== x); save(); render(); } };
      list.appendChild(row);
    });
    v.appendChild(list);
  } else v.appendChild(h(`<div class="card sub">${L('Noch kein Eintrag. Einmal pro Woche eintragen, am besten morgens.')}</div>`));
}
function chart(vals, labels) {
  if (vals.length < 2) return '<div class="sub center">' + L('Ab 2 Einträgen gibt es eine Kurve.') + '</div>';
  const W = 320, H = 170, pl = 36, pr = 10, pt = 14, pb = 26;
  const min = Math.min(...vals) - 0.5, max = Math.max(...vals) + 0.5;
  const x = i => pl + i * (W - pl - pr) / (vals.length - 1), y = val => pt + (max - val) * (H - pt - pb) / (max - min);
  const pts = vals.map((val, i) => x(i) + ',' + y(val)).join(' ');
  let g = '';
  for (let k = 0; k <= 3; k++) { const val = min + (max - min) * k / 3; g += `<line x1="${pl}" x2="${W - pr}" y1="${y(val)}" y2="${y(val)}" stroke="rgba(255,140,26,.3)"/><text x="${pl - 4}" y="${y(val) + 4}" font-size="10" fill="#ff8c1a" text-anchor="end">${val.toFixed(1)}</text>`; }
  const lab = labels.map((l, i) => (i === 0 || i === labels.length - 1 || labels.length <= 6) ? `<text x="${x(i)}" y="${H - 8}" font-size="10" fill="rgba(122,215,255,.8)" text-anchor="middle">${l}</text>` : '').join('');
  const dots = vals.map((val, i) => `<circle cx="${x(i)}" cy="${y(val)}" r="4" fill="#ff8c1a" stroke="#000" stroke-width="1.5"/>`).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}"><defs><filter id="gl"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>${g}<polyline points="${pts}" fill="none" stroke="#7ad7ff" stroke-width="2.5" stroke-linejoin="round" filter="url(#gl)"/>${dots}${lab}</svg>`;
}

// ----- Verlauf -----
function renderVerlauf(v) {
  setTop(L('Verlauf'), L('Seit {0} · Woche {1}', fmt(S.startDate), weekNo(today())));
  const w = weekNo(today()), wk = S.sessions.filter(x => weekNo(x.planDate) === w), all = S.sessions;
  const sum = (arr, f) => arr.reduce((a, x) => a + (x[f] || 0), 0), kmf = n => dez(n);
  v.appendChild(h(`<h3 style="margin:4px 0 8px;color:#ff8c1a;font-size:12px;letter-spacing:2px;text-transform:uppercase">${L('Diese Woche')}</h3>`));
  v.appendChild(h(`<div class="stat"><div><b>${wk.length}</b><span>${L('Einheiten')}</span></div><div><b>${sum(wk, 'min')}</b><span>${L('Minuten')}</span></div><div><b>${sum(wk, 'kcal')}</b><span>kcal</span></div></div>`));
  v.appendChild(h(`<div class="stat" style="margin-top:10px"><div><b>${kmf(CF.sumKm(wk, 'swim'))}</b><span>${L('km Schwimmen')}</span></div><div><b>${kmf(CF.sumKm(wk, 'step'))}</b><span>${L('km Cardio')}</span></div></div>`));
  const mon = mondayOf(today()); let essenW = 0; for (let i = 0; i < 7; i++) essenW += gegessenKcal(addDays(mon, i));
  v.appendChild(h(`<div class="stat" style="margin-top:10px"><div><b>${essenW}</b><span>${L('kcal gegessen')}</span></div><div><b>${ESSEN.ziel * 7}</b><span>${L('kcal Ziel Woche')}</span></div></div>`));
  v.appendChild(h(`<h3 style="margin:14px 0 8px;color:#ff8c1a;font-size:12px;letter-spacing:2px;text-transform:uppercase">${L('Gesamt')}</h3>`));
  v.appendChild(h(`<div class="stat"><div><b>${all.length}</b><span>${L('Einheiten')}</span></div><div><b>${Math.round(sum(all, 'min') / 60 * 10) / 10}</b><span>${L('Stunden')}</span></div><div><b>${sum(all, 'kcal')}</b><span>kcal</span></div></div>`));
  v.appendChild(h(`<div class="stat" style="margin-top:10px"><div><b>${kmf(CF.sumKm(all, 'swim'))}</b><span>${L('km Schwimmen')}</span></div><div><b>${kmf(CF.sumKm(all, 'step'))}</b><span>${L('km Cardio')}</span></div></div>`));
  const steps = all.filter(x => x.type === 'step');
  if (steps.length >= 2) v.appendChild(h(`<div class="card" style="margin-top:14px"><h2 style="font-size:16px">${L('Cardio-Steigerung (Minuten)')}</h2>${chart(steps.slice(-12).map(x => x.min), steps.slice(-12).map(x => 'W' + weekNo(x.planDate)))}</div>`));
  const list = h(`<div class="card" style="margin-top:14px"><h2 style="font-size:16px">${L('Letzte Einheiten')}</h2></div>`);
  if (!all.length) list.appendChild(h(`<div class="sub">${L('Noch nichts erledigt. Los geht\'s!')}</div>`));
  all.slice().reverse().slice(0, 30).forEach(x => {
    const detail = [fmtLong(x.planDate), x.gear ? L(x.gear === 'band' ? 'Band' : 'Hanteln') : '', x.km ? kmf(x.km) + ' km' : ''].filter(Boolean).join(' · ');
    list.appendChild(h(`<div class="list-item"><span>${esc(L(x.name))}<small>${esc(detail)}</small></span><span>${x.min} min<small>${x.kcal} kcal</small></span></div>`));
  });
  v.appendChild(list);
}

// ----- Essen (14-Tage-Plan, ca. 2000 kcal) -----
let essenDate = today(), essenOpen = {};
const essenTag = s => CF.essenTag(S.startDate, s);
function rezeptKcal(id) { return (ESSEN.rezepte[id] || { kcal: 0 }).kcal; }
function gegessenKcal(s) { const ids = ESSEN.plan[essenTag(s)], e = S.essen[s] || {}; return ids.reduce((a, id, i) => a + (e[i] ? rezeptKcal(id) : 0), 0); }
function menge(m, e) { const t = dez(Math.round(m * 10) / 10); return (m === 0.5 ? '½' : t) + ' ' + L(e); }
function renderEssen(v) {
  const s = essenDate, tag = essenTag(s), ids = ESSEN.plan[tag], eaten = S.essen[s] || {};
  const total = ids.reduce((a, id) => a + rezeptKcal(id), 0), got = gegessenKcal(s);
  setTop(L('Essen'), L('Tag {0} von 14 · Ziel ca. {1} kcal', tag + 1, ESSEN.ziel));
  const nav = h(`<div class="weeknav"><button class="btn light small">‹</button><b>${fmtLong(s)}</b><button class="btn light small">›</button></div>`);
  const [p, n] = nav.querySelectorAll('button');
  p.onclick = () => { essenDate = addDays(s, -1); essenOpen = {}; render(); }; n.onclick = () => { essenDate = addDays(s, 1); essenOpen = {}; render(); };
  v.appendChild(nav);
  v.appendChild(h(`<div class="stat"><div><b>${total}</b><span>${L('kcal geplant')}</span></div><div><b>${got}</b><span>${L('kcal gegessen')}</span></div><div><b>${Math.max(0, ESSEN.ziel - got)}</b><span>${L('noch frei')}</span></div></div>`));
  ids.forEach((id, i) => {
    const r = ESSEN.rezepte[id], open = !!essenOpen[i], done = !!eaten[i];
    const card = h(`<div class="card meal ${done ? 'done' : ''}"><div class="meal-head"><div><div class="meal-label">${esc(L(ESSEN.labels[i]))}</div><div class="meal-name">${esc(L(r.name))}</div><div class="sub">${r.kcal} kcal · ${r.zeit} min</div></div><button class="set meal-check ${done ? 'on' : ''}">${L(done ? '✓ Gegessen' : 'Gegessen?')}</button></div></div>`);
    card.querySelector('.meal-check').onclick = () => { const e = S.essen[s] || (S.essen[s] = {}); e[i] = !e[i]; save(); render(); };
    const btn = h(`<button class="btn light small" style="margin-top:10px">${L(open ? 'Rezept schließen' : 'Rezept anzeigen')}</button>`);
    btn.onclick = () => { essenOpen[i] = !open; render(); };
    card.appendChild(btn);
    if (open) {
      card.appendChild(h(`<h3>${L('Zutaten')}</h3>`));
      const ul = h(`<div></div>`);
      r.zutaten.forEach(z => ul.appendChild(h(`<div class="list-item"><span>${esc(L(z[0]))}</span><span>${menge(z[1], z[2])}</span></div>`)));
      card.appendChild(ul);
      card.appendChild(h(`<h3>${L('Zubereitung')}</h3>`));
      const ol = h(`<ol class="schritte"></ol>`); r.schritte.forEach(t => ol.appendChild(h(`<li>${esc(L(t))}</li>`))); card.appendChild(ol);
      if (r.tipp) card.appendChild(h(`<div class="hint">💡 ${esc(L(r.tipp))}</div>`));
    }
    v.appendChild(card);
  });
  const shop = h(`<button class="btn light">${L('Einkaufsliste für diese Woche')}</button>`); shop.onclick = () => einkaufsliste(s); v.appendChild(shop);
  if (s !== today()) { const b = h(`<button class="btn light" style="margin-top:10px">${L('Zu heute')}</button>`); b.onclick = () => { essenDate = today(); essenOpen = {}; render(); }; v.appendChild(b); }
}
function einkaufsliste(s) {
  const mon = mondayOf(s), sum = {};
  for (let i = 0; i < 7; i++) {
    ESSEN.plan[essenTag(addDays(mon, i))].forEach(id => ESSEN.rezepte[id].zutaten.forEach(z => { if (z[2] === 'Prise') return; const k = z[0] + '|' + z[2]; sum[k] = (sum[k] || 0) + z[1]; }));
  }
  const rows = Object.keys(sum).sort((a, b) => L(a.split('|')[0]).localeCompare(L(b.split('|')[0]), SPRACHE.getLang())).map(k => { const [n, e] = k.split('|'); return `<div class="list-item"><span>${esc(L(n))}</span><span>${menge(sum[k], e)}</span></div>`; }).join('');
  openModal(`<h2>${L('Einkaufsliste')}</h2><div class="sub">${L('{0} – {1} · alle Mahlzeiten der Woche, 1 Person', fmt(mon), fmt(addDays(mon, 6)))}</div><div style="margin-top:10px;max-height:60vh;overflow:auto">${rows}</div><button class="btn light" id="elClose" style="margin-top:14px">${L('Schließen')}</button>`);
  $('#elClose').onclick = closeModal;
}

// ----- Supplemente -----
let suppDate = today(), suppOpen = {}, suppEdit = false;
function suppGenommen(s) { const g = S.supps[s] || {}, liste = CF.suppsFor(S, s); return { n: liste.filter(x => g[x.id]).length, von: liste.length }; }
function renderSupps(v) {
  const s = suppDate, liste = CF.suppsFor(S, s), g = S.supps[s] || {}, tr = CF.istTrainingstag(S, s), st = suppGenommen(s);
  setTop(L('Supps'), L('{0} · {1} von {2} genommen', L(tr ? 'Trainingstag' : 'Ruhetag'), st.n, st.von));
  const nav = h(`<div class="weeknav"><button class="btn light small">‹</button><b>${fmtLong(s)}</b><button class="btn light small">›</button></div>`);
  const [p, n] = nav.querySelectorAll('button');
  p.onclick = () => { suppDate = addDays(s, -1); render(); }; n.onclick = () => { suppDate = addDays(s, 1); render(); };
  v.appendChild(nav);
  const mon = mondayOf(s); let voll = 0;
  for (let i = 0; i < 7; i++) { const d = addDays(mon, i), x = suppGenommen(d); if (x.von && x.n === x.von) voll++; }
  v.appendChild(h(`<div class="stat"><div><b>${st.n}/${st.von}</b><span>${L('heute')}</span></div><div><b>${voll}/7</b><span>${L('Tage komplett')}</span></div></div>`));
  CF.SUPP_ZEITEN.forEach(([zeit, titel]) => {
    const teil = liste.filter(x => x.zeit === zeit); if (!teil.length) return;
    const card = h(`<div class="card"><h3 style="margin-top:0">${esc(L(titel))}</h3></div>`);
    teil.forEach(x => {
      const done = !!g[x.id], open = !!suppOpen[x.id];
      const row = h(`<div class="supp-row"><div class="grow"><div class="supp-name">${esc(L(x.n))}</div><div class="sub">${esc(L(CF.suppMenge(S, x)))} · <button class="linkbtn">${L(open ? 'weniger' : 'Info')}</button></div></div><button class="set meal-check ${done ? 'on' : ''}">${L(done ? '✓ Genommen' : 'Genommen?')}</button></div>`);
      row.querySelector('.meal-check').onclick = () => { const e = S.supps[s] || (S.supps[s] = {}); e[x.id] = !e[x.id]; save(); render(); };
      row.querySelector('.linkbtn').onclick = () => { suppOpen[x.id] = !open; render(); };
      card.appendChild(row);
      if (open) card.appendChild(h(`<div class="ex-how">${esc(L(x.info))}${x.hinweis ? '<br>⚠️ ' + esc(L(x.hinweis)) : ''}</div>`));
    });
    v.appendChild(card);
  });
  if (!tr) v.appendChild(h(`<div class="hint" style="margin-bottom:12px">${L('Ruhetag: Die Sachen vor und nach dem Training fallen heute weg.')}</div>`));
  v.appendChild(h(`<div class="card"><h3 style="margin-top:0">${L('Wichtig')}</h3><div class="sub">${L('• Eisen nicht auf Verdacht nehmen. <b>Ferritin (Eisen) und Vitamin D beim Arzt prüfen lassen.</b><br>• Eisen später nie zusammen mit Calcium, Magnesium, Kaffee oder Tee.<br>• Arginin und Citrullin wirken ähnlich, eins davon reicht.<br>• Allgemeine Richtwerte, keine ärztliche Beratung. Bei Medikamenten oder Schwangerschaft vorher Arzt oder Apotheke fragen.')}</div></div>`));
  const eb = h(`<button class="btn light">${L(suppEdit ? 'Fertig' : 'Meine Supplemente bearbeiten')}</button>`); eb.onclick = () => { suppEdit = !suppEdit; render(); }; v.appendChild(eb);
  if (suppEdit) {
    const card = h(`<div class="card" style="margin-top:12px"><h3 style="margin-top:0">${L('An/aus und eigene Menge')}</h3></div>`);
    CF.SUPPS.forEach(x => {
      const an = !(S.suppAus || {})[x.id];
      const row = h(`<div class="supp-edit"><label class="check" style="margin:0"><input type="checkbox" ${an ? 'checked' : ''}><span>${esc(L(x.n))}</span></label><input type="text" value="${esc(CF.suppMenge(S, x))}" placeholder="${esc(x.m)}"></div>`);
      row.querySelector('input[type=checkbox]').onchange = e => { S.suppAus = S.suppAus || {}; if (e.target.checked) delete S.suppAus[x.id]; else S.suppAus[x.id] = true; save(); };
      row.querySelector('input[type=text]').onchange = e => { S.suppMenge = S.suppMenge || {}; const val = e.target.value.trim(); if (val && val !== x.m) S.suppMenge[x.id] = val; else delete S.suppMenge[x.id]; save(); };
      card.appendChild(row);
    });
    card.appendChild(h(`<div class="hint">${L('Menge leer lassen = Richtwert. Änderungen werden sofort gespeichert.')}</div>`));
    v.appendChild(card);
  }
  if (s !== today()) { const b = h(`<button class="btn light" style="margin-top:10px">${L('Zu heute')}</button>`); b.onclick = () => { suppDate = today(); render(); }; v.appendChild(b); }
}

// ----- Einstellungen -----
function renderEinst(v) {
  setTop(L('Einstellungen'), 'Celina Fit');
  const lg = h(`<div class="card"><h2 style="font-size:16px">${L('Sprache')} / Language</h2><div class="gear"><button data-l="de">🇩🇪 Deutsch</button><button data-l="en">🇬🇧 English</button></div></div>`);
  lg.querySelectorAll('button').forEach(b => { b.classList.toggle('on', b.dataset.l === SPRACHE.getLang()); b.onclick = () => { S.lang = b.dataset.l; SPRACHE.setLang(S.lang); save(); render(); }; });
  v.appendChild(lg);
  const c = h(`<div class="card">
    <label>${L('Name')}</label><input type="text" id="eName" value="${esc(S.name)}">
    <label>${L('Start von Woche 1 (Montag)')}</label><input type="date" id="eStart" value="${S.startDate}">
    <div class="hint">${L('Woche 1 = Plan A mit Hanteln. Danach wechselt es automatisch.')}</div>
    <label>${L('Schwimmen (Minuten)')}</label><input type="number" id="eSwim" value="${S.swimMin}" inputmode="numeric">
    <div class="row" style="margin-top:4px"><div class="grow"><label>${L('Cardio Start (min)')}</label><input type="number" id="eS1" value="${S.stepStart}" inputmode="numeric"></div>
    <div class="grow"><label>${L('+ pro Woche')}</label><input type="number" id="eS2" value="${S.stepPlus}" inputmode="numeric"></div>
    <div class="grow"><label>${L('Maximum')}</label><input type="number" id="eS3" value="${S.stepMax}" inputmode="numeric"></div></div>
    <button class="btn" id="eSave" style="margin-top:14px">${L('Speichern')}</button></div>`);
  v.appendChild(c);
  c.querySelector('#eSave').onclick = () => {
    S.name = c.querySelector('#eName').value || 'Celina';
    const sd = c.querySelector('#eStart').value; if (sd) S.startDate = mondayOf(sd);
    S.swimMin = Number(c.querySelector('#eSwim').value) || 60;
    S.stepStart = Number(c.querySelector('#eS1').value) || 30; S.stepPlus = Number(c.querySelector('#eS2').value) || 5; S.stepMax = Number(c.querySelector('#eS3').value) || 60;
    save(); alert(L('Gespeichert')); render();
  };
  const sy = h(`<div class="card"><h2 style="font-size:16px">${L('Sicherung auf GitHub')}</h2>
    <div class="sub">${L('Alle Daten liegen auf diesem Handy. Mit Token sichert die App sie nach jeder Änderung automatisch in ein privates GitHub-Repo und holt sie nach einer Neuinstallation zurück.')}</div>
    <label>${L('Repo (Besitzer/Name)')}</label><input type="text" id="syRepo" value="${esc(SYNC.repo || 'raimundbergmann78-bit/celina-fit-daten')}" autocapitalize="off" autocorrect="off">
    <label>Token</label><input type="password" id="syTok" value="${esc(SYNC.token || '')}" placeholder="github_pat_…" autocapitalize="off" autocorrect="off">
    <div class="btnrow"><button class="btn" id="syOn">${L('Verbinden &amp; sichern')}</button><button class="btn light" id="syOff">${L('Trennen')}</button></div>
    <div class="hint" id="syStat">${esc(syncStatusText())}</div>
    <button class="btn light" id="syPull" style="margin-top:12px">${L('Daten von GitHub holen')}</button></div>`);
  v.appendChild(sy);
  sy.querySelector('#syOn').onclick = async () => {
    SYNC.repo = sy.querySelector('#syRepo').value.trim(); SYNC.token = sy.querySelector('#syTok').value.trim(); SYNC.sha = null; SYNC.ok = undefined; SYNC.msg = ''; saveSync();
    if (!syncOn()) { setStatus(false, L('Repo und Token eintragen')); return; }
    setStatus(undefined, ''); $('#syStat').textContent = L('Verbinde …');
    const p = await syncPull();
    if (p.ok && !p.loaded) await syncPush();
    if (!p.ok) { /* Status steht schon */ }
  };
  sy.querySelector('#syOff').onclick = () => { if (confirm(L('Sicherung trennen? Die Daten bleiben auf dem Handy.'))) { SYNC = {}; saveSync(); render(); } };
  sy.querySelector('#syPull').onclick = async () => {
    if (!syncOn()) { setStatus(false, L('Erst verbinden')); return; }
    if (!confirm(L('Die Daten auf dem Handy werden durch die GitHub-Sicherung ersetzt. Weiter?'))) return;
    const p = await syncPull({ force: true }); if (p.ok && p.empty) setStatus(false, L('Noch keine Sicherung vorhanden'));
  };
  const plan = h(`<div class="card"><h2 style="font-size:16px">${L('So läuft die Woche')}</h2>
    <div class="list-item"><span>${L('Mo + Di')}</span><span>${L('Kraft')}</span></div><div class="list-item"><span>${L('Mi')}</span><span>${L('Schwimmen')}</span></div>
    <div class="list-item"><span>${L('Do + Fr')}</span><span>${L('Kraft')}</span></div><div class="list-item"><span>${L('Sa')}</span><span>${L('Cardio (Stepper, Laufband, Fahrrad)')}</span></div><div class="list-item"><span>${L('So')}</span><span>${L('Frei')}</span></div>
    <h3>${L('Plan A (Woche 1, 3, 5 …)')}</h3><div class="sub">Leg Day · Upper Body · Glute Day · Core Day</div>
    <h3>${L('Plan B (Woche 2, 4, 6 …)')}</h3><div class="sub">Quad Day · Back Day · Posterior Chain · Arms & Shoulders</div>
    <h3>${L('Gerät')}</h3><div class="sub">${L('Woche 1–2 Hanteln, Woche 3–4 Gummiband, dann wieder Hanteln. Im Workout jederzeit umschaltbar.')}</div>
    <h3>${L('Joker')}</h3><div class="sub">${L('Full Body (wenig Zeit) und Low-Impact Cardio (kein Gerät da) über „Anderes Workout“.')}</div></div>`);
  v.appendChild(plan);
  const bk = h(`<div class="card"><h2 style="font-size:16px">${L('Sicherung von Hand')}</h2><div class="sub">${L('Zum Kopieren in Notizen oder zum Einspielen auf ein anderes Handy.')}</div>
    <textarea id="bkText"></textarea><div class="btnrow"><button class="btn light" id="bkExp">${L('Daten anzeigen')}</button><button class="btn light" id="bkImp">${L('Einfügen laden')}</button></div>
    <button class="btn light" id="bkReset" style="margin-top:14px;color:#ff4d6d;border-color:#ff4d6d">${L('Alles zurücksetzen')}</button></div>`);
  v.appendChild(bk);
  bk.querySelector('#bkExp').onclick = () => { const t = bk.querySelector('#bkText'); t.value = JSON.stringify(S); t.select(); try { document.execCommand('copy'); alert(L('Kopiert')); } catch (e) { } };
  bk.querySelector('#bkImp').onclick = () => { try { const j = JSON.parse(bk.querySelector('#bkText').value); if (j && j.sessions) { S = Object.assign({}, DEFAULT, j); save(); alert(L('Geladen')); render(); } } catch (e) { alert(L('Das sind keine gültigen Daten')); } };
  bk.querySelector('#bkReset').onclick = () => { if (confirm(L('Wirklich alles löschen?')) && confirm(L('Ganz sicher? Gewicht und Verlauf sind dann weg.'))) { localStorage.removeItem(KEY); location.reload(); } };
  v.appendChild(h(`<div class="center sub small-text" style="margin-top:10px">${L('Celina Fit · Version 2.0')}</div>`));
}

// ---------- Sicherung nach GitHub (Token bleibt auf dem Handy, geht nur an api.github.com) ----------
let pushTimer = null;
function syncOn() { return !!(SYNC.token && SYNC.repo); }
function schedulePush() { if (!syncOn()) return; clearTimeout(pushTimer); pushTimer = setTimeout(() => { pushTimer = null; syncPush(); }, 2500); }
function syncPath() { return '/repos/' + SYNC.repo + '/contents/' + SYNC_FILE; }
function b64enc(str) { return btoa(unescape(encodeURIComponent(str))); }
function b64dec(b64) { return decodeURIComponent(escape(atob(String(b64).replace(/\s/g, '')))); }
async function gh(method, path, body) {
  const opt = { method, headers: { 'Authorization': 'Bearer ' + SYNC.token, 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json' } };
  if (body) { opt.body = JSON.stringify(body); if (opt.body.length < 60000) opt.keepalive = true; }
  const r = await fetch('https://api.github.com' + path, opt);
  let j = null; try { j = await r.json(); } catch (e) { }
  return { status: r.status, ok: r.ok, j };
}
function fehlerText(r) {
  if (r.status === 401) return L('Token ungültig');
  if (r.status === 404) return L('Repo nicht gefunden oder Token ohne Zugriff');
  return L('Fehler {0}', r.status) + (r.j && r.j.message ? ': ' + r.j.message : '');
}
function setStatus(ok, msg) { SYNC.ok = ok; SYNC.msg = msg || ''; saveSync(); updateSyncBadge(); const el = $('#syStat'); if (el) el.textContent = syncStatusText(); }
function syncStatusText() {
  if (!syncOn()) return L('Nicht verbunden – Daten nur auf diesem Handy.');
  const t = SYNC.last ? new Date(SYNC.last).toLocaleString(SPRACHE.getLang() === 'en' ? 'en-GB' : 'de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : L('noch keine');
  return (SYNC.ok === false ? '⚠️ ' + SYNC.msg + ' · ' : '✅ ') + L('Letzte Sicherung: {0}', t);
}
function updateSyncBadge() { const b = $('#syncBadge'); if (!b) return; b.hidden = !syncOn(); b.textContent = SYNC.ok === false ? '☁ !' : '☁ ✓'; b.classList.toggle('warn', SYNC.ok === false); }
async function syncPull({ force = false } = {}) {
  if (!syncOn()) return { ok: false, msg: L('Nicht verbunden') };
  try {
    const r = await gh('GET', syncPath());
    if (r.status === 404) { SYNC.sha = null; saveSync(); setStatus(true, ''); return { ok: true, empty: true }; }
    if (!r.ok) { setStatus(false, fehlerText(r)); return { ok: false, msg: fehlerText(r) }; }
    SYNC.sha = r.j.sha; saveSync();
    const remote = JSON.parse(b64dec(r.j.content));
    if (force || (remote.updatedAt || 0) > (S.updatedAt || 0)) {
      S = Object.assign({}, DEFAULT, remote); localStorage.setItem(KEY, JSON.stringify(S));
      SYNC.last = Date.now(); setStatus(true, ''); render(); return { ok: true, loaded: true };
    }
    setStatus(true, ''); return { ok: true };
  } catch (e) { setStatus(false, L('Keine Verbindung')); return { ok: false, msg: L('Keine Verbindung') }; }
}
async function syncPush(retry = true) {
  if (!syncOn()) return false;
  try {
    const body = { message: 'Celina Fit Sicherung ' + new Date().toLocaleString('de-DE'), content: b64enc(JSON.stringify(S)) };
    if (SYNC.sha) body.sha = SYNC.sha;
    const r = await gh('PUT', syncPath(), body);
    if (r.ok) { SYNC.sha = r.j.content.sha; SYNC.last = Date.now(); saveSync(); setStatus(true, ''); return true; }
    if ((r.status === 409 || r.status === 422) && retry) {
      const g = await gh('GET', syncPath()); SYNC.sha = g.ok ? g.j.sha : null; saveSync(); return syncPush(false);
    }
    setStatus(false, fehlerText(r)); return false;
  } catch (e) { setStatus(false, L('Keine Verbindung')); return false; }
}
window.addEventListener('online', () => { if (syncOn()) syncPull().then(p => { if (p.ok && !p.loaded) syncPush(); }); });
document.addEventListener('visibilitychange', () => { if (document.hidden && pushTimer) { clearTimeout(pushTimer); pushTimer = null; syncPush(); } });

// ---------- Start ----------
const splash = $('#splash');
function hideSplash() { if (!splash) return; splash.classList.add('hide'); setTimeout(() => splash.remove(), 700); }
splash.onclick = hideSplash; setTimeout(hideSplash, 2200);
render();
if (syncOn()) syncPull().then(p => { if (p.ok && !p.loaded && !SYNC.last) syncPush(); });
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { });
window.CFApp = { get S() { return S; }, set S(v) { S = v; }, get SYNC() { return SYNC; }, set SYNC(v) { SYNC = v; }, save, saveSync, render, syncPull, syncPush, finishModal, weightModal, KEY, SYNC_KEY };
