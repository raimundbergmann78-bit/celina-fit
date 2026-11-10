/* Celina Fit – Oberflaeche, Speicher auf dem Handy und Sicherung nach GitHub */
'use strict';
const { DEVICES, WORKOUTS, SPECIAL, PLAN_A, PLAN_B, DAYS, DEFAULT, iso, addDays, wdIdx, mondayOf, fmt, fmtLong, infoOf, imgOf } = CF;
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
  swim: `<svg viewBox="0 0 120 90" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="80" cy="28" r="8" stroke="#39ff14"/><path d="M28 50c10-14 22-18 34-13l12 9M50 44l-8 12" stroke="#39ff14"/><path d="M6 64c8-8 16-8 24 0s16 8 24 0 16-8 24 0 16 8 24 0" stroke="#00e5ff"/><path d="M6 78c8-8 16-8 24 0s16 8 24 0 16-8 24 0 16 8 24 0" stroke="#00e5ff" opacity=".55"/></svg>`,
  step: `<svg viewBox="0 0 120 90" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M8 80h24V60h24V40h24V20h26" stroke="#00e5ff"/><circle cx="64" cy="20" r="7" stroke="#39ff14"/><path d="M64 27v20l-11 15M64 47l10 11M64 33l13 4M64 33l-13 8" stroke="#39ff14"/></svg>`,
  lauf: `<svg viewBox="0 0 120 90" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 72h80M18 72l-7 10h90l-7-10M90 72V26h12" stroke="#00e5ff"/><circle cx="50" cy="24" r="7" stroke="#39ff14"/><path d="M50 31v18l-10 17M50 49l11 15M50 37l13-4M50 37l-13 9" stroke="#39ff14"/></svg>`,
  rad: `<svg viewBox="0 0 120 90" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="26" cy="66" r="16" stroke="#00e5ff"/><circle cx="94" cy="66" r="16" stroke="#00e5ff"/><path d="M26 66l20-30h24l24 30M46 36h-12M70 36l-6-14h10M60 66l-14-30M60 66h-16" stroke="#00e5ff"/><circle cx="60" cy="66" r="4" stroke="#39ff14"/><circle cx="66" cy="14" r="5" stroke="#39ff14"/></svg>`,
  rest: `<svg viewBox="0 0 120 90" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M72 12a30 30 0 1 0 30 38A24 24 0 0 1 72 12z" stroke="#39ff14"/><path d="M24 18l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM32 58l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" stroke="#00e5ff"/></svg>`
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
function lightbox(src, name, reps, how) {
  openModal(`<img src="${src}" alt=""><div class="ex-name">${esc(name)}</div><div class="ex-sub">${esc(reps)}</div>${how ? `<div class="ex-how">${esc(how)}</div>` : ''}<div class="hint center" style="margin-top:12px">Tippen zum Schließen</div>`, { full: true });
}

// ---------- Ansichten ----------
let view = 'heute', selDate = today(), weekCursor = today();
function setTop(t, s) { $('#topTitle').textContent = t; $('#topSub').textContent = s || ''; }
function render() {
  clearTimers();
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  const v = $('#view'); v.innerHTML = '';
  ({ heute: renderHeute, woche: renderWoche, gewicht: renderGewicht, verlauf: renderVerlauf, einstellungen: renderEinst })[view](v);
  updateSyncBadge();
  window.scrollTo(0, 0);
}
document.querySelectorAll('#nav button').forEach(b => b.onclick = () => { view = b.dataset.view; if (view === 'heute') selDate = today(); render(); });

// ----- Heute -----
function renderHeute(v) {
  const s = selDate, key = planKey(s), info = infoOf(key), w = weekNo(s), isToday = s === today();
  setTop(isToday ? 'Heute' : fmtLong(s), (isToday ? fmtLong(s) + ' · ' : '') + 'Woche ' + w + ' · Plan ' + planLetter(s));
  if (isToday && !weightThisWeek()) setTimeout(weightModal, 300);
  const done = sessionOf(s);
  const card = h(`<div class="card"><h2>${esc(info.name)}</h2><div class="sub">${esc(info.sub)}</div></div>`);
  v.appendChild(card);
  if (done) {
    const extra = (done.dev ? ' · ' + DEVICES[done.dev].n : '') + (done.km ? ' · ' + String(done.km).replace('.', ',') + ' km' : '');
    card.appendChild(h(`<div class="done-banner" style="margin-top:12px">✅ Erledigt: ${done.min} min · ${done.kcal} kcal${esc(extra)}</div>`));
    card.appendChild(h(`<button class="btn light">Rückgängig</button>`)).onclick = () => {
      if (confirm('Eintrag löschen?')) { S.sessions = S.sessions.filter(x => x !== done); save(); render(); }
    };
    return;
  }
  if (WORKOUTS[key]) renderWorkout(v, card, s, key, info);
  else if (key === 'swim') renderSwim(v, card, s);
  else if (key === 'step') renderStep(v, card, s, w);
  else renderRest(v, card);
  const other = h(`<button class="btn light">Anderes Workout für diesen Tag</button>`);
  v.appendChild(other); other.onclick = () => chooseWorkout(s);
}

function renderWorkout(v, card, s, key, info) {
  const gear = gearOf(s), hasBand = info.ex.some(e => e.band);
  card.appendChild(h(`<div class="tips">${info.tips.map(t => `<span>${esc(t)}</span>`).join('')}</div>`));
  if (hasBand) {
    const g = h(`<div class="gear"><button data-g="hantel">🏋️ Hanteln</button><button data-g="band">🟣 Gummiband</button></div>`);
    g.querySelectorAll('button').forEach(b => { b.classList.toggle('on', b.dataset.g === gear); b.onclick = () => { S.gear[s] = b.dataset.g; save(); render(); }; });
    card.appendChild(g);
    card.appendChild(h(`<div class="hint">Diese Woche laut Plan: ${gear === 'band' ? 'Gummiband' : 'Hanteln'} (wechselt alle 2 Wochen)</div>`));
  }
  const exCard = h(`<div class="card"></div>`); v.appendChild(exCard);
  const checks = S.checks[s] || (S.checks[s] = {});
  let total = 0, doneSets = 0;
  info.ex.forEach((e, ei) => {
    const useBand = gear === 'band' && e.band, name = useBand ? e.band.n : e.n, reps = `${e.s} × ${e.r}${key === 'cardio' ? ' (je Runde)' : ''}`;
    const el = h(`<div class="ex"></div>`);
    const wrap = h(`<div class="exwrap"><img class="eximg" src="${imgOf(key, ei)}" alt="${esc(e.n)}" loading="lazy">${useBand ? '<span class="badge">🟣 mit Gummiband</span>' : ''}<span class="zoom">⤢ größer</span></div>`);
    wrap.onclick = () => lightbox(imgOf(key, ei), name, reps, useBand ? e.band.how : '');
    el.appendChild(wrap);
    el.appendChild(h(`<div class="ex-name">${esc(name)}</div>`));
    el.appendChild(h(`<div class="ex-sub">${esc(reps)}</div>`));
    if (useBand) el.appendChild(h(`<div class="ex-how">${esc(e.band.how)}</div>`));
    const sets = h(`<div class="sets"></div>`);
    const arr = checks[ei] || (checks[ei] = Array(e.s).fill(false));
    for (let i = 0; i < e.s; i++) {
      total++; if (arr[i]) doneSets++;
      const b = h(`<button class="set ${arr[i] ? 'on' : ''} ${e.sec ? 'timer' : ''}">${arr[i] ? '✓' : (e.sec ? '▶ ' + e.sec + 's' : 'Satz ' + (i + 1))}</button>`);
      b.onclick = () => {
        const now = Date.now(); if (now - lastTap < 600) return; lastTap = now;
        if (arr[i]) { arr[i] = false; save(); render(); return; }
        if (e.sec && !b.classList.contains('running')) {
          b.classList.add('running'); let left = e.sec; b.textContent = left + 's';
          const iv = setInterval(() => { left--; b.textContent = left + 's'; if (left <= 0) { clearInterval(iv); beep(3); arr[i] = true; save(); startRest(info.rest); render(); } }, 1000);
          timers.push(iv); return;
        }
        arr[i] = true; save(); startRest(info.rest); render();
      };
      sets.appendChild(b);
    }
    el.appendChild(sets); exCard.appendChild(el);
  });
  const fin = h(`<button class="btn">Workout abschließen (${doneSets}/${total} Sätze)</button>`);
  fin.disabled = doneSets === 0 || s > today();
  fin.onclick = () => finishModal({ s, key, name: info.name, min: 35, type: info.type });
  v.appendChild(fin);
  const img = h(`<button class="btn light">Ganzes Poster anzeigen</button>`);
  v.appendChild(img);
  img.onclick = () => { const n = img.nextSibling; if (n && n.tagName === 'IMG') { n.remove(); img.textContent = 'Ganzes Poster anzeigen'; } else { img.after(h(`<img class="poster" src="${info.poster}" alt="">`)); img.textContent = 'Poster ausblenden'; } };
}

function renderSwim(v, card, s) {
  card.appendChild(h(`<div class="hero">${ICONS.swim}</div>`));
  card.appendChild(h(`<div class="big">${S.swimMin} min</div>`));
  card.appendChild(h(`<div class="center sub">Lockeres Tempo, Pausen sind erlaubt.<br>Danach Kilometer und Kalorien eintragen.</div>`));
  const b = h(`<button class="btn">Schwimmen erledigt</button>`); b.disabled = s > today();
  b.onclick = () => finishModal({ s, key: 'swim', name: 'Schwimmen', min: S.swimMin, type: 'swim', km: true }); v.appendChild(b);
}

function renderStep(v, card, s, w) {
  const target = stepMinutes(w), dev = devOf(s);
  card.appendChild(h(`<div class="hero">${ICONS[dev]}</div>`));
  const g = h(`<div class="gear">${Object.keys(DEVICES).map(k => `<button data-d="${k}">${DEVICES[k].n}</button>`).join('')}</div>`);
  g.querySelectorAll('button').forEach(b => { b.classList.toggle('on', b.dataset.d === dev); b.onclick = () => { S.cardioDev[s] = b.dataset.d; S.lastDev = b.dataset.d; save(); render(); }; });
  card.appendChild(g);
  card.appendChild(h(`<div class="big" id="stepTime">${target}:00</div>`));
  card.appendChild(h(`<div class="center sub">Ziel diese Woche: ${target} Minuten · Woche ${w}</div>`));
  const row = h(`<div class="btnrow"><button class="btn">Start</button><button class="btn light">Zurücksetzen</button></div>`);
  card.appendChild(row);
  let left = target * 60, iv = null; const disp = card.querySelector('#stepTime'), [bStart, bReset] = row.querySelectorAll('button');
  const show = () => disp.textContent = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
  bStart.onclick = () => {
    if (iv) { clearInterval(iv); iv = null; bStart.textContent = 'Weiter'; return; }
    bStart.textContent = 'Pause';
    iv = setInterval(() => { left--; show(); if (left <= 0) { clearInterval(iv); iv = null; beep(4); bStart.textContent = 'Geschafft!'; } }, 1000); timers.push(iv);
  };
  bReset.onclick = () => { clearInterval(iv); iv = null; left = target * 60; show(); bStart.textContent = 'Start'; };
  card.appendChild(h(`<div class="hint" style="margin-top:10px">Nächste Woche: ${stepMinutes(w + 1)} min${S.holdWeeks.includes(w) ? ' (Steigerung ausgesetzt)' : ''}</div>`));
  const b = h(`<button class="btn">${esc(DEVICES[dev].n)} erledigt</button>`); b.disabled = s > today();
  b.onclick = () => finishModal({ s, key: 'step', name: DEVICES[dev].n, min: target, type: 'step', w, km: true, dev }); v.appendChild(b);
}

function renderRest(v, card) {
  card.appendChild(h(`<div class="hero">${ICONS.rest}</div>`));
  card.appendChild(h(`<div class="center sub">Heute ist frei. Spazieren, dehnen, viel trinken, gut schlafen.</div>`));
}

function chooseWorkout(s) {
  const all = Object.keys(WORKOUTS).map(k => `<option value="${k}">${esc(WORKOUTS[k].name)} – ${esc(WORKOUTS[k].sub)}</option>`).join('') +
    Object.keys(SPECIAL).map(k => `<option value="${k}">${esc(SPECIAL[k].name)}</option>`).join('');
  openModal(`<h2>Workout für ${fmt(s)}</h2><div class="sub">Normal laut Plan: ${esc(infoOf((planLetter(s) === 'A' ? PLAN_A : PLAN_B)[wdIdx(s)]).name)}</div>
    <label>Auswahl</label><select id="wsel">${all}</select>
    <div class="btnrow"><button class="btn" id="wok">Übernehmen</button><button class="btn light" id="wplan">Zurück zum Plan</button></div>`);
  $('#wsel').value = planKey(s);
  $('#wok').onclick = () => { S.overrides[s] = $('#wsel').value; delete S.checks[s]; save(); closeModal(); render(); };
  $('#wplan').onclick = () => { delete S.overrides[s]; delete S.checks[s]; save(); closeModal(); render(); };
}

function finishModal(o) {
  const est = kcalEst(o.type, o.min, o.dev), manual = o.type === 'swim' || o.type === 'step';
  openModal(`<h2>${esc(o.name)} abschließen</h2>
    <label>Dauer (Minuten)</label><input type="number" id="fmin" value="${o.min}" inputmode="numeric">
    ${o.km ? `<label>Kilometer</label><input type="text" id="fkm" inputmode="decimal" placeholder="z. B. 1,2">` : ''}
    <label>Kalorien</label><input type="number" id="fkcal" value="${est}" inputmode="numeric">
    <div class="hint">${manual ? 'Wert vom Gerät oder von der Apple Watch eintragen. Vorausgefüllt ist nur eine Schätzung.' : 'Geschätzt aus Gewicht × Dauer. Wert von der Apple Watch? Einfach überschreiben.'}${lastWeight() ? '' : ' (Gewicht eintragen = genauere Schätzung)'}</div>
    ${o.type === 'step' ? `<div class="check"><input type="checkbox" id="fhold"><span>War zu hart – nächste Woche gleich lassen</span></div>` : ''}
    <div class="btnrow"><button class="btn" id="fok">Speichern</button><button class="btn light" id="fcancel">Abbrechen</button></div>`);
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
  openModal(`<h2>Wochen-Check ⚖️</h2><div class="sub">Neue Woche! Bitte zuerst das Gewicht eintragen.</div>
    <label>Gewicht (kg)</label><input type="text" id="wkg" inputmode="decimal" value="${lastWeight() || ''}" placeholder="z. B. 65,5">
    <button class="btn" id="wok" style="margin-top:14px">Speichern</button>`, { closable: false });
  $('#wok').onclick = () => { const kg = num($('#wkg').value); if (!kg) return; addWeight(kg); closeModal(); render(); };
}
function addWeight(kg) {
  S.weights = S.weights.filter(x => x.date !== today()); S.weights.push({ date: today(), kg: Math.round(kg * 10) / 10 });
  S.weights.sort((a, b) => a.date < b.date ? -1 : 1); save();
}

// ----- Woche -----
function renderWoche(v) {
  const mon = mondayOf(weekCursor), w = weekNo(mon);
  setTop('Wochenplan', 'Woche ' + w + ' · Plan ' + planLetter(mon) + ' · ' + (gearOf(mon) === 'band' ? 'Gummiband' : 'Hanteln'));
  const nav = h(`<div class="weeknav"><button class="btn light small">‹</button><b>${fmt(mon)} – ${fmt(addDays(mon, 6))}</b><button class="btn light small">›</button></div>`);
  const [p, n] = nav.querySelectorAll('button'); p.onclick = () => { weekCursor = addDays(mon, -7); render(); }; n.onclick = () => { weekCursor = addDays(mon, 7); render(); };
  v.appendChild(nav);
  let kcal = 0, mins = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDays(mon, i), key = planKey(d), info = infoOf(key), ses = sessionOf(d);
    if (ses) { kcal += ses.kcal; mins += ses.min; }
    let extra = '';
    if (key === 'step') extra = DEVICES[devOf(d)].n + ' · ' + stepMinutes(w) + ' min'; else if (key === 'swim') extra = S.swimMin + ' min'; else if (WORKOUTS[key]) extra = info.sub;
    const status = ses ? '✅' : (d === today() ? '👉' : (d < today() && key !== 'rest' ? '⬜' : ''));
    const el = h(`<div class="day ${d === today() ? 'today' : ''}"><div class="d"><b>${DAYS[i]}</b><span>${fmt(d)}</span></div><div class="n">${esc(info.name)}<small>${esc(extra)}${S.overrides[d] ? ' · geändert' : ''}</small></div><div class="s">${status}</div></div>`);
    el.onclick = () => { selDate = d; view = 'heute'; render(); };
    v.appendChild(el);
  }
  v.appendChild(h(`<div class="stat" style="margin-top:6px"><div><b>${mins}</b><span>Minuten</span></div><div><b>${kcal}</b><span>kcal</span></div><div><b>${S.sessions.filter(x => weekNo(x.planDate) === w).length}/6</b><span>erledigt</span></div></div>`));
  if (w !== weekNo(today())) { const b = h(`<button class="btn light" style="margin-top:12px">Zu dieser Woche</button>`); b.onclick = () => { weekCursor = today(); render(); }; v.appendChild(b); }
}

// ----- Gewicht -----
function renderGewicht(v) {
  setTop('Gewicht', weightThisWeek() ? 'Diese Woche eingetragen ✅' : 'Diese Woche noch offen');
  const c = h(`<div class="card"><label>Gewicht heute (kg)</label><input type="text" id="gkg" inputmode="decimal" value="${lastWeight() || ''}" placeholder="z. B. 65,5"><button class="btn" id="gok" style="margin-top:12px">Eintragen</button></div>`);
  v.appendChild(c);
  c.querySelector('#gok').onclick = () => { const kg = num(c.querySelector('#gkg').value); if (!kg) return; addWeight(kg); render(); };
  if (S.weights.length) {
    const first = S.weights[0].kg, last = lastWeight(), diff = Math.round((last - first) * 10) / 10;
    v.appendChild(h(`<div class="stat"><div><b>${last}</b><span>aktuell</span></div><div><b>${first}</b><span>Start</span></div><div><b>${diff > 0 ? '+' : ''}${diff}</b><span>Veränderung</span></div></div>`));
    v.appendChild(h(`<div class="card">${chart(S.weights.slice(-16).map(x => x.kg), S.weights.slice(-16).map(x => fmt(x.date)))}</div>`));
    const list = h(`<div class="card"></div>`);
    S.weights.slice().reverse().slice(0, 20).forEach((x, i, arr) => {
      const prev = arr[i + 1]; const d = prev ? Math.round((x.kg - prev.kg) * 10) / 10 : 0;
      const row = h(`<div class="list-item"><span>${fmt(x.date)}<small>Woche ${weekNo(x.date)}</small></span><span><b>${x.kg} kg</b> <span class="muted small-text">${prev ? (d > 0 ? '+' : '') + d : ''}</span></span></div>`);
      row.onclick = () => { if (confirm('Eintrag ' + fmt(x.date) + ' löschen?')) { S.weights = S.weights.filter(y => y !== x); save(); render(); } };
      list.appendChild(row);
    });
    v.appendChild(list);
  } else v.appendChild(h(`<div class="card sub">Noch kein Eintrag. Einmal pro Woche eintragen, am besten morgens.</div>`));
}
function chart(vals, labels) {
  if (vals.length < 2) return '<div class="sub center">Ab 2 Einträgen gibt es eine Kurve.</div>';
  const W = 320, H = 170, pl = 36, pr = 10, pt = 14, pb = 26;
  const min = Math.min(...vals) - 0.5, max = Math.max(...vals) + 0.5;
  const x = i => pl + i * (W - pl - pr) / (vals.length - 1), y = val => pt + (max - val) * (H - pt - pb) / (max - min);
  const pts = vals.map((val, i) => x(i) + ',' + y(val)).join(' ');
  let g = '';
  for (let k = 0; k <= 3; k++) { const val = min + (max - min) * k / 3; g += `<line x1="${pl}" x2="${W - pr}" y1="${y(val)}" y2="${y(val)}" stroke="rgba(0,229,255,.3)"/><text x="${pl - 4}" y="${y(val) + 4}" font-size="10" fill="#00e5ff" text-anchor="end">${val.toFixed(1)}</text>`; }
  const lab = labels.map((l, i) => (i === 0 || i === labels.length - 1 || labels.length <= 6) ? `<text x="${x(i)}" y="${H - 8}" font-size="10" fill="rgba(57,255,20,.8)" text-anchor="middle">${l}</text>` : '').join('');
  const dots = vals.map((val, i) => `<circle cx="${x(i)}" cy="${y(val)}" r="4" fill="#00e5ff" stroke="#000" stroke-width="1.5"/>`).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}"><defs><filter id="gl"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>${g}<polyline points="${pts}" fill="none" stroke="#39ff14" stroke-width="2.5" stroke-linejoin="round" filter="url(#gl)"/>${dots}${lab}</svg>`;
}

// ----- Verlauf -----
function renderVerlauf(v) {
  setTop('Verlauf', 'Seit ' + fmt(S.startDate) + ' · Woche ' + weekNo(today()));
  const w = weekNo(today()), wk = S.sessions.filter(x => weekNo(x.planDate) === w), all = S.sessions;
  const sum = (arr, f) => arr.reduce((a, x) => a + (x[f] || 0), 0), kmf = n => String(n).replace('.', ',');
  v.appendChild(h(`<h3 style="margin:4px 0 8px;color:#00e5ff;font-size:12px;letter-spacing:2px;text-transform:uppercase">Diese Woche</h3>`));
  v.appendChild(h(`<div class="stat"><div><b>${wk.length}</b><span>Einheiten</span></div><div><b>${sum(wk, 'min')}</b><span>Minuten</span></div><div><b>${sum(wk, 'kcal')}</b><span>kcal</span></div></div>`));
  v.appendChild(h(`<div class="stat" style="margin-top:10px"><div><b>${kmf(CF.sumKm(wk, 'swim'))}</b><span>km Schwimmen</span></div><div><b>${kmf(CF.sumKm(wk, 'step'))}</b><span>km Cardio</span></div></div>`));
  v.appendChild(h(`<h3 style="margin:14px 0 8px;color:#00e5ff;font-size:12px;letter-spacing:2px;text-transform:uppercase">Gesamt</h3>`));
  v.appendChild(h(`<div class="stat"><div><b>${all.length}</b><span>Einheiten</span></div><div><b>${Math.round(sum(all, 'min') / 60 * 10) / 10}</b><span>Stunden</span></div><div><b>${sum(all, 'kcal')}</b><span>kcal</span></div></div>`));
  v.appendChild(h(`<div class="stat" style="margin-top:10px"><div><b>${kmf(CF.sumKm(all, 'swim'))}</b><span>km Schwimmen</span></div><div><b>${kmf(CF.sumKm(all, 'step'))}</b><span>km Cardio</span></div></div>`));
  const steps = all.filter(x => x.type === 'step');
  if (steps.length >= 2) v.appendChild(h(`<div class="card" style="margin-top:14px"><h2 style="font-size:16px">Cardio-Steigerung (Minuten)</h2>${chart(steps.slice(-12).map(x => x.min), steps.slice(-12).map(x => 'W' + weekNo(x.planDate)))}</div>`));
  const list = h(`<div class="card" style="margin-top:14px"><h2 style="font-size:16px">Letzte Einheiten</h2></div>`);
  if (!all.length) list.appendChild(h(`<div class="sub">Noch nichts erledigt. Los geht's!</div>`));
  all.slice().reverse().slice(0, 30).forEach(x => {
    const detail = [fmtLong(x.planDate), x.gear ? (x.gear === 'band' ? 'Band' : 'Hanteln') : '', x.km ? kmf(x.km) + ' km' : ''].filter(Boolean).join(' · ');
    list.appendChild(h(`<div class="list-item"><span>${esc(x.name)}<small>${esc(detail)}</small></span><span>${x.min} min<small>${x.kcal} kcal</small></span></div>`));
  });
  v.appendChild(list);
}

// ----- Einstellungen -----
function renderEinst(v) {
  setTop('Einstellungen', 'Celina Fit');
  const c = h(`<div class="card">
    <label>Name</label><input type="text" id="eName" value="${esc(S.name)}">
    <label>Start von Woche 1 (Montag)</label><input type="date" id="eStart" value="${S.startDate}">
    <div class="hint">Woche 1 = Plan A mit Hanteln. Danach wechselt es automatisch.</div>
    <label>Schwimmen (Minuten)</label><input type="number" id="eSwim" value="${S.swimMin}" inputmode="numeric">
    <div class="row" style="margin-top:4px"><div class="grow"><label>Cardio Start (min)</label><input type="number" id="eS1" value="${S.stepStart}" inputmode="numeric"></div>
    <div class="grow"><label>+ pro Woche</label><input type="number" id="eS2" value="${S.stepPlus}" inputmode="numeric"></div>
    <div class="grow"><label>Maximum</label><input type="number" id="eS3" value="${S.stepMax}" inputmode="numeric"></div></div>
    <button class="btn" id="eSave" style="margin-top:14px">Speichern</button></div>`);
  v.appendChild(c);
  c.querySelector('#eSave').onclick = () => {
    S.name = c.querySelector('#eName').value || 'Celina';
    const sd = c.querySelector('#eStart').value; if (sd) S.startDate = mondayOf(sd);
    S.swimMin = Number(c.querySelector('#eSwim').value) || 60;
    S.stepStart = Number(c.querySelector('#eS1').value) || 30; S.stepPlus = Number(c.querySelector('#eS2').value) || 5; S.stepMax = Number(c.querySelector('#eS3').value) || 60;
    save(); alert('Gespeichert'); render();
  };
  const sy = h(`<div class="card"><h2 style="font-size:16px">Sicherung auf GitHub</h2>
    <div class="sub">Alle Daten liegen auf diesem Handy. Mit Token sichert die App sie nach jeder Änderung automatisch in ein privates GitHub-Repo und holt sie nach einer Neuinstallation zurück.</div>
    <label>Repo (Besitzer/Name)</label><input type="text" id="syRepo" value="${esc(SYNC.repo || 'raimundbergmann78-bit/celina-fit-daten')}" autocapitalize="off" autocorrect="off">
    <label>Token</label><input type="password" id="syTok" value="${esc(SYNC.token || '')}" placeholder="github_pat_…" autocapitalize="off" autocorrect="off">
    <div class="btnrow"><button class="btn" id="syOn">Verbinden &amp; sichern</button><button class="btn light" id="syOff">Trennen</button></div>
    <div class="hint" id="syStat">${esc(syncStatusText())}</div>
    <button class="btn light" id="syPull" style="margin-top:12px">Daten von GitHub holen</button></div>`);
  v.appendChild(sy);
  sy.querySelector('#syOn').onclick = async () => {
    SYNC.repo = sy.querySelector('#syRepo').value.trim(); SYNC.token = sy.querySelector('#syTok').value.trim(); SYNC.sha = null; SYNC.ok = undefined; SYNC.msg = ''; saveSync();
    if (!syncOn()) { setStatus(false, 'Repo und Token eintragen'); return; }
    setStatus(undefined, ''); $('#syStat').textContent = 'Verbinde …';
    const p = await syncPull();
    if (p.ok && !p.loaded) await syncPush();
    if (!p.ok) { /* Status steht schon */ }
  };
  sy.querySelector('#syOff').onclick = () => { if (confirm('Sicherung trennen? Die Daten bleiben auf dem Handy.')) { SYNC = {}; saveSync(); render(); } };
  sy.querySelector('#syPull').onclick = async () => {
    if (!syncOn()) { setStatus(false, 'Erst verbinden'); return; }
    if (!confirm('Die Daten auf dem Handy werden durch die GitHub-Sicherung ersetzt. Weiter?')) return;
    const p = await syncPull({ force: true }); if (p.ok && p.empty) setStatus(false, 'Noch keine Sicherung vorhanden');
  };
  const plan = h(`<div class="card"><h2 style="font-size:16px">So läuft die Woche</h2>
    <div class="list-item"><span>Mo + Di</span><span>Kraft</span></div><div class="list-item"><span>Mi</span><span>Schwimmen</span></div>
    <div class="list-item"><span>Do + Fr</span><span>Kraft</span></div><div class="list-item"><span>Sa</span><span>Cardio (Stepper, Laufband, Fahrrad)</span></div><div class="list-item"><span>So</span><span>Frei</span></div>
    <h3>Plan A (Woche 1, 3, 5 …)</h3><div class="sub">Leg Day · Upper Body · Glute Day · Core Day</div>
    <h3>Plan B (Woche 2, 4, 6 …)</h3><div class="sub">Quad Day · Back Day · Posterior Chain · Arms & Shoulders</div>
    <h3>Gerät</h3><div class="sub">Woche 1–2 Hanteln, Woche 3–4 Gummiband, dann wieder Hanteln. Im Workout jederzeit umschaltbar.</div>
    <h3>Joker</h3><div class="sub">Full Body (wenig Zeit) und Low-Impact Cardio (kein Gerät da) über „Anderes Workout“.</div></div>`);
  v.appendChild(plan);
  const bk = h(`<div class="card"><h2 style="font-size:16px">Sicherung von Hand</h2><div class="sub">Zum Kopieren in Notizen oder zum Einspielen auf ein anderes Handy.</div>
    <textarea id="bkText"></textarea><div class="btnrow"><button class="btn light" id="bkExp">Daten anzeigen</button><button class="btn light" id="bkImp">Einfügen laden</button></div>
    <button class="btn light" id="bkReset" style="margin-top:14px;color:#ff4d6d;border-color:#ff4d6d">Alles zurücksetzen</button></div>`);
  v.appendChild(bk);
  bk.querySelector('#bkExp').onclick = () => { const t = bk.querySelector('#bkText'); t.value = JSON.stringify(S); t.select(); try { document.execCommand('copy'); alert('Kopiert'); } catch (e) { } };
  bk.querySelector('#bkImp').onclick = () => { try { const j = JSON.parse(bk.querySelector('#bkText').value); if (j && j.sessions) { S = Object.assign({}, DEFAULT, j); save(); alert('Geladen'); render(); } } catch (e) { alert('Das sind keine gültigen Daten'); } };
  bk.querySelector('#bkReset').onclick = () => { if (confirm('Wirklich alles löschen?') && confirm('Ganz sicher? Gewicht und Verlauf sind dann weg.')) { localStorage.removeItem(KEY); location.reload(); } };
  v.appendChild(h(`<div class="center sub small-text" style="margin-top:10px">Celina Fit · Version 2.0</div>`));
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
  if (r.status === 401) return 'Token ungültig';
  if (r.status === 404) return 'Repo nicht gefunden oder Token ohne Zugriff';
  return 'Fehler ' + r.status + (r.j && r.j.message ? ': ' + r.j.message : '');
}
function setStatus(ok, msg) { SYNC.ok = ok; SYNC.msg = msg || ''; saveSync(); updateSyncBadge(); const el = $('#syStat'); if (el) el.textContent = syncStatusText(); }
function syncStatusText() {
  if (!syncOn()) return 'Nicht verbunden – Daten nur auf diesem Handy.';
  const t = SYNC.last ? new Date(SYNC.last).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'noch keine';
  return (SYNC.ok === false ? '⚠️ ' + SYNC.msg + ' · ' : '✅ ') + 'Letzte Sicherung: ' + t;
}
function updateSyncBadge() { const b = $('#syncBadge'); if (!b) return; b.hidden = !syncOn(); b.textContent = SYNC.ok === false ? '☁ !' : '☁ ✓'; b.classList.toggle('warn', SYNC.ok === false); }
async function syncPull({ force = false } = {}) {
  if (!syncOn()) return { ok: false, msg: 'Nicht verbunden' };
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
  } catch (e) { setStatus(false, 'Keine Verbindung'); return { ok: false, msg: 'Keine Verbindung' }; }
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
  } catch (e) { setStatus(false, 'Keine Verbindung'); return false; }
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
