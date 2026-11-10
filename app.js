/* Celina Fit – Trainings-App (PWA) */
'use strict';

// ---------- Übungen ----------
// s = Sätze, r = Wiederholungen (Text), sec = Sekunden-Übung (Timer)
// band = Variante mit Gummiband (Name + kurze Anleitung)
const MET = { kraft: 4.0, swim: 6.0, step: 6.5, cardio: 5.0 };

const WORKOUTS = {
  leg: { name: 'Leg Day', sub: 'Ganzer Unterkörper', img: 'bilder/01_leg_day.jpg', rest: 75, type: 'kraft',
    tips: ['Rücken gerade', 'Knie Richtung Zehen', 'Bauch anspannen'],
    ex: [
      { n: 'Squats', s: 4, r: '8–12', band: { n: 'Band-Squat', how: 'Band unter beide Füße, Enden über die Schultern legen' } },
      { n: 'Lunges', s: 4, r: '10–12 je Bein', band: { n: 'Band-Lunge', how: 'Band unter den vorderen Fuß, Enden an den Schultern halten' } },
      { n: 'Calf Raises', s: 4, r: '15–20', band: { n: 'Calf Raise mit Band', how: 'Band unter die Fußballen, Enden straff in den Händen' } },
      { n: 'Side Leg Raises', s: 4, r: '12–15 je Bein', band: { n: 'Lateral Band Walk', how: 'Miniband über den Knien, 12–15 Schritte zur Seite und zurück' } },
      { n: 'Wall Sit', s: 3, sec: 30, r: '30–60 sek' }
    ] },
  glute: { name: 'Glute Day', sub: 'Po & Hüfte', img: 'bilder/02_glute_day.jpg', rest: 75, type: 'kraft',
    tips: ['Jede Wiederholung kontrolliert', 'Hüfte gerade halten'],
    ex: [
      { n: 'Glute Bridge', s: 3, r: '12–15', band: { n: 'Glute Bridge mit Miniband', how: 'Miniband über den Knien, Knie beim Hochdrücken nach außen drücken' } },
      { n: 'Reverse Lunge', s: 3, r: '8–10 je Bein', band: { n: 'Reverse Lunge mit Band', how: 'Band unter den vorderen Fuß, Enden an den Schultern' } },
      { n: 'Side-Lying Leg Raise', s: 3, r: '12 je Seite', band: { n: 'Clamshell mit Miniband', how: 'Seitlich liegen, Miniband über den Knien, oberes Knie wie eine Muschel öffnen' } },
      { n: 'Donkey Kick', s: 3, r: '12 je Seite', band: { n: 'Band-Kickback', how: 'Vierfüßler, Band um einen Fuß und unter den Händen, Fuß nach hinten oben drücken' } },
      { n: 'Bodyweight Squat', s: 3, r: '10–12', band: { n: 'Squat mit Miniband', how: 'Miniband über den Knien, Knie nach außen drücken' } }
    ] },
  upper: { name: 'Upper Body', sub: 'Oberkörper', img: 'bilder/03_upper_body.jpg', rest: 75, type: 'kraft',
    tips: ['Machbares Gewicht', 'Nicht schwingen'],
    ex: [
      { n: 'Floor Press', s: 3, r: '10–12', band: { n: 'Band Chest Press', how: 'Band hinter dem Rücken, Enden nach vorn drücken' } },
      { n: 'Bent-Over Row', s: 3, r: '10–12', band: { n: 'Band-Rudern', how: 'Band unter beide Füße, vorbeugen, Enden zum Bauch ziehen' } },
      { n: 'Shoulder Press', s: 3, r: '8–10', band: { n: 'Band Shoulder Press', how: 'Band unter die Füße, Enden von Schulterhöhe nach oben drücken' } },
      { n: 'Biceps Curl', s: 3, r: '10–12', band: { n: 'Band-Curl', how: 'Band unter die Füße, Enden mit Handflächen nach oben beugen' } },
      { n: 'Triceps Kickback', s: 3, r: '12', band: { n: 'Band Triceps Kickback', how: 'Band unter einen Fuß, vorbeugen, Arm nach hinten strecken' } }
    ] },
  quad: { name: 'Quad Day', sub: 'Oberschenkel', img: 'bilder/04_quad_day.jpg', rest: 75, type: 'kraft',
    tips: ['Knie folgen den Zehen', 'Fersen unten lassen'],
    ex: [
      { n: 'Goblet Squat', s: 3, r: '8–12', band: { n: 'Band-Squat', how: 'Band unter beide Füße, Enden über die Schultern' } },
      { n: 'Split Squat', s: 3, r: '8 je Bein', band: { n: 'Split Squat mit Band', how: 'Band unter den vorderen Fuß, Enden an den Schultern' } },
      { n: 'Low Step-Up', s: 3, r: '10 je Bein', band: { n: 'Step-Up mit Band', how: 'Band unter den Fuß auf der Stufe, Enden in den Händen' } },
      { n: 'Wall Sit', s: 3, sec: 20, r: '20–40 sek' },
      { n: 'Bodyweight Squat', s: 2, r: '12–15', band: { n: 'Squat mit Miniband', how: 'Miniband über den Knien, Knie nach außen drücken' } }
    ] },
  core: { name: 'Core Day', sub: 'Bauch & Rumpf', img: 'bilder/05_core_day.jpg', rest: 50, type: 'kraft',
    tips: ['Ruhig atmen', 'Becken stabil halten'],
    ex: [
      { n: 'Dead Bug', s: 3, r: '8 je Seite' },
      { n: 'Forearm Plank', s: 3, sec: 20, r: '20–30 sek' },
      { n: 'Bird Dog', s: 3, r: '8 je Seite' },
      { n: 'Side Plank', s: 2, sec: 15, r: '15–25 sek je Seite' },
      { n: 'Reverse Crunch', s: 3, r: '10–12', band: { n: 'Pallof Press mit Band', how: 'Band seitlich an Türgriff, beide Hände vor der Brust, Arme nach vorn strecken und halten, 10 je Seite' } }
    ] },
  post: { name: 'Posterior Chain', sub: 'Hintere Beine & Po', img: 'bilder/06_posterior_chain.jpg', rest: 75, type: 'kraft',
    tips: ['Aus der Hüfte beugen', 'Gewicht nah am Körper'],
    ex: [
      { n: 'Dumbbell RDL', s: 3, r: '8–12', band: { n: 'Band-RDL', how: 'Band unter beide Füße, Enden in den Händen, aus der Hüfte beugen' } },
      { n: 'Glute Bridge', s: 3, r: '12–15', band: { n: 'Glute Bridge mit Miniband', how: 'Miniband über den Knien, Knie nach außen drücken' } },
      { n: 'Kickstand RDL', s: 3, r: '8 je Bein', band: { n: 'Kickstand RDL mit Band', how: 'Band unter den vorderen Fuß, Enden in den Händen' } },
      { n: 'Hamstring Walkout', s: 2, r: '6–8' },
      { n: 'Good Morning', s: 2, r: '12', band: { n: 'Good Morning mit Band', how: 'Band unter die Füße und über den Nacken, aus der Hüfte beugen' } }
    ] },
  back: { name: 'Back Day', sub: 'Rücken', img: 'bilder/07_back_day.jpg', rest: 75, type: 'kraft',
    tips: ['Nacken gerade', 'Mit Kontrolle'],
    ex: [
      { n: 'Supported Row', s: 3, r: '10 je Arm', band: { n: 'Einarmiges Band-Rudern', how: 'Band unter einen Fuß, mit einer Hand zum Bauch ziehen' } },
      { n: 'Bent-Over Row', s: 3, r: '10–12', band: { n: 'Band-Rudern', how: 'Band unter beide Füße, vorbeugen, Enden zum Bauch ziehen' } },
      { n: 'Reverse Fly', s: 3, r: '12', band: { n: 'Band Pull-Apart', how: 'Band mit beiden Händen vor der Brust, auseinanderziehen bis zur Brust' } },
      { n: 'Prone W Raise', s: 2, r: '10' },
      { n: 'Bird Dog', s: 2, r: '8 je Seite' }
    ] },
  arms: { name: 'Arms & Shoulders', sub: 'Arme & Schultern', img: 'bilder/08_arms_shoulders.jpg', rest: 75, type: 'kraft',
    tips: ['Leicht anfangen', 'Handgelenke gerade'],
    ex: [
      { n: 'Shoulder Press', s: 3, r: '8–10', band: { n: 'Band Shoulder Press', how: 'Band unter die Füße, Enden von Schulterhöhe nach oben drücken' } },
      { n: 'Lateral Raise', s: 3, r: '10–12', band: { n: 'Band Lateral Raise', how: 'Band unter die Füße, Arme seitlich bis Schulterhöhe heben' } },
      { n: 'Hammer Curl', s: 3, r: '10–12', band: { n: 'Band Hammer Curl', how: 'Band unter die Füße, Daumen nach oben, Arme beugen' } },
      { n: 'Biceps Curl', s: 2, r: '10–12', band: { n: 'Band-Curl', how: 'Band unter die Füße, Handflächen nach oben, Arme beugen' } },
      { n: 'Triceps Kickback', s: 3, r: '12', band: { n: 'Band Triceps über Kopf', how: 'Band unter einen Fuß, Enden hinter dem Kopf, Arme nach oben strecken' } }
    ] },
  full: { name: 'Full Body', sub: 'Ganzkörper (Joker, wenig Zeit)', img: 'bilder/10_full_body.jpg', rest: 75, type: 'kraft',
    tips: ['Erst aufwärmen', 'Kontrollierte Wiederholungen'],
    ex: [
      { n: 'Goblet Squat', s: 3, r: '10', band: { n: 'Band-Squat', how: 'Band unter beide Füße, Enden über die Schultern' } },
      { n: 'Dumbbell RDL', s: 3, r: '10', band: { n: 'Band-RDL', how: 'Band unter beide Füße, Enden in den Händen, aus der Hüfte beugen' } },
      { n: 'Floor Press', s: 3, r: '10', band: { n: 'Band Chest Press', how: 'Band hinter dem Rücken, Enden nach vorn drücken' } },
      { n: 'Bent-Over Row', s: 3, r: '10', band: { n: 'Band-Rudern', how: 'Band unter beide Füße, vorbeugen, Enden zum Bauch ziehen' } },
      { n: 'Forearm Plank', s: 3, sec: 20, r: '20–30 sek' }
    ] },
  cardio: { name: 'Low-Impact Cardio', sub: '3 Runden, kein Springen (Joker)', img: 'bilder/09_low_impact_cardio.jpg', rest: 20, type: 'cardio',
    tips: ['Tempo zum Reden', '60 sek Pause zwischen Runden'],
    ex: [
      { n: 'March in Place', s: 3, sec: 40, r: '40 sek' },
      { n: 'Step Jacks', s: 3, sec: 40, r: '40 sek' },
      { n: 'Side Steps', s: 3, sec: 40, r: '40 sek' },
      { n: 'Standing Knee Drives', s: 3, sec: 40, r: '40 sek' },
      { n: 'Shadow Boxing', s: 3, sec: 40, r: '40 sek' }
    ] }
};
const SPECIAL = {
  swim: { name: 'Schwimmen', sub: 'Ausdauer im Wasser', type: 'swim' },
  step: { name: 'Cardio Stepper', sub: 'Ausdauer, langsam steigern', type: 'step' },
  rest: { name: 'Regeneration', sub: 'Freier Tag', type: 'rest' }
};
const PLAN_A = ['leg', 'upper', 'swim', 'glute', 'core', 'step', 'rest'];
const PLAN_B = ['quad', 'back', 'swim', 'post', 'arms', 'step', 'rest'];
const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const DAYS_LONG = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

// ---------- Speicher ----------
const KEY = 'celinafit.v1';
const DEFAULT = { name: 'Celina', startDate: null, swimMin: 60, stepStart: 30, stepPlus: 5, stepMax: 60,
  holdWeeks: [], weights: [], sessions: [], checks: {}, overrides: {}, gear: {} };
let S = load();
function load() {
  try { const j = JSON.parse(localStorage.getItem(KEY)); if (j) return Object.assign({}, DEFAULT, j); } catch (e) { }
  return JSON.parse(JSON.stringify(DEFAULT));
}
function save() { localStorage.setItem(KEY, JSON.stringify(S)); }

// ---------- Datum ----------
function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function fromIso(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function today() { return iso(new Date()); }
function addDays(s, n) { const d = fromIso(s); d.setDate(d.getDate() + n); return iso(d); }
function wdIdx(s) { return (fromIso(s).getDay() + 6) % 7; }
function mondayOf(s) { return addDays(s, -wdIdx(s)); }
function fmt(s) { const d = fromIso(s); return d.getDate() + '.' + (d.getMonth() + 1) + '.'; }
function fmtLong(s) { return DAYS_LONG[wdIdx(s)] + ', ' + fmt(s) + fromIso(s).getFullYear(); }
if (!S.startDate) { S.startDate = mondayOf(today()); save(); }
function weekNo(s) { return Math.round((fromIso(mondayOf(s)) - fromIso(mondayOf(S.startDate))) / 864e5 / 7) + 1; }
function planLetter(s) { return weekNo(s) % 2 === 1 ? 'A' : 'B'; }
function planKey(s) {
  if (S.overrides[s]) return S.overrides[s];
  const w = weekNo(s); if (w < 1) return 'rest';
  return (planLetter(s) === 'A' ? PLAN_A : PLAN_B)[wdIdx(s)];
}
function infoOf(key) { return WORKOUTS[key] || SPECIAL[key]; }
// Gerät: Woche 1+2 Hanteln, Woche 3+4 Band, dann wieder Hanteln ...
function gearOf(s) { if (S.gear[s]) return S.gear[s]; const w = Math.max(1, weekNo(s)); return ((w - 1) % 4) >= 2 ? 'band' : 'hantel'; }
function stepMinutes(w) {
  const holds = S.holdWeeks.filter(h => h < w).length;
  return Math.min(S.stepMax, Math.max(S.stepStart, S.stepStart + S.stepPlus * (w - 1 - holds)));
}
function sessionOf(s) { return S.sessions.find(x => x.planDate === s); }
function lastWeight() { return S.weights.length ? S.weights[S.weights.length - 1].kg : null; }
function weightThisWeek() { const w = weekNo(today()); return S.weights.some(x => weekNo(x.date) === w); }
function kcalEst(type, min) { const kg = lastWeight() || 70; return Math.round(MET[type] * kg * min / 60); }

// ---------- Hilfen ----------
const $ = sel => document.querySelector(sel);
function h(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
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
  if (navigator.vibrate) navigator.vibrate([150, 80, 150]);
}
let timers = [], lastTap = 0;
function clearTimers() { timers.forEach(clearInterval); timers = []; }

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
function openModal(html, { closable = true } = {}) {
  const m = $('#modal'); $('#modalBox').innerHTML = html; m.hidden = false;
  m.onclick = e => { if (e.target === m && closable) closeModal(); };
}
function closeModal() { $('#modal').hidden = true; }

// ---------- Ansichten ----------
let view = 'heute', selDate = today(), weekCursor = today();
function setTop(t, s) { $('#topTitle').textContent = t; $('#topSub').textContent = s || ''; }
function render() {
  clearTimers();
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  const v = $('#view'); v.innerHTML = '';
  ({ heute: renderHeute, woche: renderWoche, gewicht: renderGewicht, verlauf: renderVerlauf, einstellungen: renderEinst })[view](v);
  window.scrollTo(0, 0);
}
document.querySelectorAll('#nav button').forEach(b => b.onclick = () => { view = b.dataset.view; if (view === 'heute') selDate = today(); render(); });

// ----- Heute -----
function renderHeute(v) {
  const s = selDate, key = planKey(s), info = infoOf(key), w = weekNo(s);
  const isToday = s === today();
  setTop(isToday ? 'Heute' : fmtLong(s), (isToday ? fmtLong(s) + ' · ' : '') + 'Woche ' + w + ' · Plan ' + planLetter(s));
  if (weightThisWeek() === false && isToday) { setTimeout(weightModal, 300); }
  const done = sessionOf(s);
  const card = h(`<div class="card"><h2>${esc(info.name)}</h2><div class="sub">${esc(info.sub)}</div></div>`);
  v.appendChild(card);
  if (done) {
    card.appendChild(h(`<div class="done-banner" style="margin-top:12px">✅ Erledigt: ${done.min} min · ca. ${done.kcal} kcal</div>`));
    card.appendChild(h(`<button class="btn light">Rückgängig</button>`)).onclick = () => {
      if (confirm('Eintrag löschen?')) { S.sessions = S.sessions.filter(x => x !== done); save(); render(); }
    };
    return;
  }
  if (WORKOUTS[key]) renderWorkout(v, card, s, key, info);
  else if (key === 'swim') renderSwim(v, card, s);
  else if (key === 'step') renderStep(v, card, s, w);
  else renderRest(v, card, s);
  // Anderes Workout
  const other = h(`<button class="btn light">Anderes Workout für diesen Tag</button>`);
  v.appendChild(other);
  other.onclick = () => chooseWorkout(s);
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
  const exCard = h(`<div class="card"></div>`);
  v.appendChild(exCard);
  const checks = S.checks[s] || (S.checks[s] = {});
  let total = 0, doneSets = 0;
  info.ex.forEach((e, ei) => {
    const useBand = gear === 'band' && e.band;
    const name = useBand ? e.band.n : e.n;
    const el = h(`<div class="ex"><div class="ex-name">${esc(name)}</div><div class="ex-sub">${e.s} × ${esc(e.r)}${key === 'cardio' ? ' (je Runde)' : ''}</div></div>`);
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
  const fin = h(`<button class="btn gold">Workout abschließen (${doneSets}/${total} Sätze)</button>`);
  fin.disabled = doneSets === 0 || s > today();
  fin.onclick = () => finishModal(s, key, info.name, 35, info.type);
  v.appendChild(fin);
  const img = h(`<button class="btn light">Übungsbild anzeigen</button>`);
  v.appendChild(img);
  img.onclick = () => { if (img.nextSibling && img.nextSibling.tagName === 'IMG') { img.nextSibling.remove(); img.textContent = 'Übungsbild anzeigen'; } else { img.after(h(`<img class="poster" src="${info.img}" alt="">`)); img.textContent = 'Bild ausblenden'; } };
}

function renderSwim(v, card, s) {
  card.appendChild(h(`<div class="big">${S.swimMin} min</div><div class="center sub">Lockeres Tempo, Pausen sind erlaubt</div>`));
  const b = h(`<button class="btn gold">Schwimmen erledigt</button>`); b.disabled = s > today();
  b.onclick = () => finishModal(s, 'swim', 'Schwimmen', S.swimMin, 'swim'); v.appendChild(b);
}

function renderStep(v, card, s, w) {
  const target = stepMinutes(w);
  card.appendChild(h(`<div class="big" id="stepTime">${target}:00</div><div class="center sub">Ziel diese Woche: ${target} Minuten · Woche ${w}</div>`));
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
  const next = stepMinutes(w + 1);
  card.appendChild(h(`<div class="hint" style="margin-top:10px">Nächste Woche: ${next} min${S.holdWeeks.includes(w) ? ' (Steigerung ausgesetzt)' : ''}</div>`));
  const b = h(`<button class="btn gold">Stepper erledigt</button>`); b.disabled = s > today();
  b.onclick = () => finishModal(s, 'step', 'Cardio Stepper', target, 'step', w); v.appendChild(b);
}

function renderRest(v, card) {
  card.appendChild(h(`<div class="big">😌</div><div class="center sub">Heute ist frei. Spazieren, dehnen, viel trinken, gut schlafen.</div>`));
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

function finishModal(s, key, name, defMin, type, w) {
  const kcal = kcalEst(type, defMin);
  openModal(`<h2>${esc(name)} abschließen</h2>
    <label>Dauer (Minuten)</label><input type="number" id="fmin" value="${defMin}" inputmode="numeric">
    <label>Kalorien</label><input type="number" id="fkcal" value="${kcal}" inputmode="numeric">
    <div class="hint">Geschätzt aus Gewicht × Dauer. Wert von der Apple Watch? Einfach überschreiben.${lastWeight() ? '' : ' (Gewicht eintragen = genauere Schätzung)'}</div>
    ${type === 'step' ? `<div class="check"><input type="checkbox" id="fhold"><span>War zu hart – nächste Woche gleich lassen</span></div>` : ''}
    <div class="btnrow"><button class="btn gold" id="fok">Speichern</button><button class="btn light" id="fcancel">Abbrechen</button></div>`);
  $('#fmin').oninput = () => { $('#fkcal').value = kcalEst(type, Number($('#fmin').value) || 0); };
  $('#fcancel').onclick = closeModal;
  $('#fok').onclick = () => {
    const min = Number($('#fmin').value) || defMin, k = Number($('#fkcal').value) || 0;
    S.sessions.push({ date: today(), planDate: s, key, name, min, kcal: k, type, gear: WORKOUTS[key] ? gearOf(s) : undefined });
    if (type === 'step' && $('#fhold') && $('#fhold').checked && !S.holdWeeks.includes(w)) S.holdWeeks.push(w);
    save(); stopRest(); closeModal(); beep(2); render();
  };
}

function weightModal() {
  if (!$('#modal').hidden) return;
  openModal(`<h2>Wochen-Check ⚖️</h2><div class="sub">Neue Woche! Bitte zuerst das Gewicht eintragen.</div>
    <label>Gewicht (kg)</label><input type="number" id="wkg" step="0.1" inputmode="decimal" value="${lastWeight() || ''}" placeholder="z. B. 65,5">
    <button class="btn gold" id="wok" style="margin-top:14px">Speichern</button>`, { closable: false });
  $('#wok').onclick = () => { const kg = parseFloat(String($('#wkg').value).replace(',', '.')); if (!kg) return; addWeight(kg); closeModal(); render(); };
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
    if (key === 'step') extra = stepMinutes(w) + ' min'; else if (key === 'swim') extra = S.swimMin + ' min'; else if (WORKOUTS[key]) extra = info.sub;
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
  const c = h(`<div class="card"><label>Gewicht heute (kg)</label><input type="number" id="gkg" step="0.1" inputmode="decimal" value="${lastWeight() || ''}"><button class="btn gold" id="gok" style="margin-top:12px">Eintragen</button></div>`);
  v.appendChild(c);
  c.querySelector('#gok').onclick = () => { const kg = parseFloat(String(c.querySelector('#gkg').value).replace(',', '.')); if (!kg) return; addWeight(kg); render(); };
  if (S.weights.length) {
    const first = S.weights[0].kg, last = lastWeight(), diff = Math.round((last - first) * 10) / 10;
    v.appendChild(h(`<div class="stat"><div><b>${last}</b><span>aktuell</span></div><div><b>${first}</b><span>Start</span></div><div><b class="${diff <= 0 ? 'ok' : ''}">${diff > 0 ? '+' : ''}${diff}</b><span>Veränderung</span></div></div>`));
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
  const W = 320, H = 170, pl = 34, pr = 10, pt = 14, pb = 26;
  const min = Math.min(...vals) - 0.5, max = Math.max(...vals) + 0.5;
  const x = i => pl + i * (W - pl - pr) / (vals.length - 1), y = val => pt + (max - val) * (H - pt - pb) / (max - min);
  const pts = vals.map((val, i) => x(i) + ',' + y(val)).join(' ');
  let g = '';
  for (let k = 0; k <= 3; k++) { const val = min + (max - min) * k / 3; g += `<line x1="${pl}" x2="${W - pr}" y1="${y(val)}" y2="${y(val)}" stroke="#e4e6ee"/><text x="${pl - 4}" y="${y(val) + 4}" font-size="10" fill="#6b7280" text-anchor="end">${val.toFixed(1)}</text>`; }
  const lab = labels.map((l, i) => (i === 0 || i === labels.length - 1 || labels.length <= 6) ? `<text x="${x(i)}" y="${H - 8}" font-size="10" fill="#6b7280" text-anchor="middle">${l}</text>` : '').join('');
  const dots = vals.map((val, i) => `<circle cx="${x(i)}" cy="${y(val)}" r="4" fill="#d4a84b" stroke="#fff" stroke-width="1.5"/>`).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">${g}<polyline points="${pts}" fill="none" stroke="#1f2a44" stroke-width="2.5" stroke-linejoin="round"/>${dots}${lab}</svg>`;
}

// ----- Verlauf -----
function renderVerlauf(v) {
  setTop('Verlauf', 'Seit ' + fmt(S.startDate) + ' · Woche ' + weekNo(today()));
  const w = weekNo(today()), wk = S.sessions.filter(x => weekNo(x.planDate) === w);
  const kcalW = wk.reduce((a, x) => a + x.kcal, 0), minW = wk.reduce((a, x) => a + x.min, 0);
  v.appendChild(h(`<h3 style="margin:4px 0 8px;color:#6b7280;font-size:13px;text-transform:uppercase">Diese Woche</h3>`));
  v.appendChild(h(`<div class="stat"><div><b>${wk.length}</b><span>Einheiten</span></div><div><b>${minW}</b><span>Minuten</span></div><div><b>${kcalW}</b><span>kcal</span></div></div>`));
  const all = S.sessions, kcalAll = all.reduce((a, x) => a + x.kcal, 0);
  v.appendChild(h(`<h3 style="margin:14px 0 8px;color:#6b7280;font-size:13px;text-transform:uppercase">Gesamt</h3>`));
  v.appendChild(h(`<div class="stat"><div><b>${all.length}</b><span>Einheiten</span></div><div><b>${Math.round(all.reduce((a, x) => a + x.min, 0) / 60 * 10) / 10}</b><span>Stunden</span></div><div><b>${kcalAll}</b><span>kcal</span></div></div>`));
  const steps = all.filter(x => x.type === 'step');
  if (steps.length) {
    v.appendChild(h(`<div class="card" style="margin-top:14px"><h2 style="font-size:16px">Stepper-Steigerung</h2>${chart(steps.slice(-12).map(x => x.min), steps.slice(-12).map(x => 'W' + weekNo(x.planDate)))}</div>`));
  }
  const list = h(`<div class="card"><h2 style="font-size:16px">Letzte Einheiten</h2></div>`);
  if (!all.length) list.appendChild(h(`<div class="sub">Noch nichts erledigt. Los geht's!</div>`));
  all.slice().reverse().slice(0, 30).forEach(x => list.appendChild(h(`<div class="list-item"><span>${esc(x.name)}<small>${fmtLong(x.planDate)}${x.gear ? ' · ' + (x.gear === 'band' ? 'Band' : 'Hanteln') : ''}</small></span><span>${x.min} min<small>${x.kcal} kcal</small></span></div>`)));
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
    <div class="row" style="margin-top:4px"><div class="grow"><label>Stepper Start (min)</label><input type="number" id="eS1" value="${S.stepStart}" inputmode="numeric"></div>
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
  const plan = h(`<div class="card"><h2 style="font-size:16px">So läuft die Woche</h2>
    <div class="list-item"><span>Mo + Di</span><span>Kraft</span></div><div class="list-item"><span>Mi</span><span>Schwimmen</span></div>
    <div class="list-item"><span>Do + Fr</span><span>Kraft</span></div><div class="list-item"><span>Sa</span><span>Stepper</span></div><div class="list-item"><span>So</span><span>Frei</span></div>
    <h3>Plan A (Woche 1, 3, 5 …)</h3><div class="sub">Leg Day · Upper Body · Glute Day · Core Day</div>
    <h3>Plan B (Woche 2, 4, 6 …)</h3><div class="sub">Quad Day · Back Day · Posterior Chain · Arms & Shoulders</div>
    <h3>Gerät</h3><div class="sub">Woche 1–2 Hanteln, Woche 3–4 Gummiband, dann wieder Hanteln. Im Workout jederzeit umschaltbar.</div>
    <h3>Joker</h3><div class="sub">Full Body (wenig Zeit) und Low-Impact Cardio (kein Stepper) über „Anderes Workout“.</div></div>`);
  v.appendChild(plan);
  const bk = h(`<div class="card"><h2 style="font-size:16px">Sicherung</h2><div class="sub">Alle Daten liegen nur auf diesem Handy. Zum Sichern Text kopieren und z. B. in Notizen speichern.</div>
    <textarea id="bkText"></textarea><div class="btnrow"><button class="btn light" id="bkExp">Daten anzeigen</button><button class="btn light" id="bkImp">Einfügen laden</button></div>
    <button class="btn light" id="bkReset" style="margin-top:14px;color:#b00020">Alles zurücksetzen</button></div>`);
  v.appendChild(bk);
  bk.querySelector('#bkExp').onclick = () => { const t = bk.querySelector('#bkText'); t.value = JSON.stringify(S); t.select(); try { document.execCommand('copy'); alert('Kopiert'); } catch (e) { } };
  bk.querySelector('#bkImp').onclick = () => { try { const j = JSON.parse(bk.querySelector('#bkText').value); if (j && j.sessions) { S = Object.assign({}, DEFAULT, j); save(); alert('Geladen'); render(); } } catch (e) { alert('Das sind keine gültigen Daten'); } };
  bk.querySelector('#bkReset').onclick = () => { if (confirm('Wirklich alles löschen?') && confirm('Ganz sicher? Gewicht und Verlauf sind dann weg.')) { localStorage.removeItem(KEY); location.reload(); } };
  v.appendChild(h(`<div class="center sub small-text" style="margin-top:10px">Celina Fit · Version 1.0</div>`));
}

// ---------- Start ----------
const splash = $('#splash');
function hideSplash() { splash.classList.add('hide'); setTimeout(() => splash.remove(), 600); }
splash.onclick = hideSplash; setTimeout(hideSplash, 2200);
render();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { });
