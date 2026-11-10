/* Celina Fit – Daten und reine Logik (laeuft im Browser und in Node fuer Tests) */
(function (root) {
'use strict';

// ---------- Geraete / Kalorien (MET-Werte) ----------
const MET = { kraft: 4.0, swim: 6.0, cardio: 5.0 };
const DEVICES = {
  step: { n: 'Stepper', met: 6.5 },
  lauf: { n: 'Laufband', met: 6.0 },
  rad:  { n: 'Fahrrad',  met: 6.0 }
};

// ---------- Uebungen ----------
// s = Saetze, r = Wiederholungen (Text), sec = Sekunden-Uebung (Timer)
// band = Variante mit Gummiband (Name + kurze Anleitung)
const WORKOUTS = {
  leg: { name: 'Leg Day', sub: 'Ganzer Unterkörper', poster: 'bilder/01_leg_day.jpg', rest: 75, type: 'kraft',
    tips: ['Rücken gerade', 'Knie Richtung Zehen', 'Bauch anspannen'],
    ex: [
      { n: 'Squats', s: 4, r: '8–12', band: { n: 'Band-Squat', how: 'Band unter beide Füße, Enden über die Schultern legen' } },
      { n: 'Lunges', s: 4, r: '10–12 je Bein', band: { n: 'Band-Lunge', how: 'Band unter den vorderen Fuß, Enden an den Schultern halten' } },
      { n: 'Calf Raises', s: 4, r: '15–20', band: { n: 'Calf Raise mit Band', how: 'Band unter die Fußballen, Enden straff in den Händen' } },
      { n: 'Side Leg Raises', s: 4, r: '12–15 je Bein', band: { n: 'Lateral Band Walk', how: 'Miniband über den Knien, 12–15 Schritte zur Seite und zurück' } },
      { n: 'Wall Sit', s: 3, sec: 30, r: '30–60 sek' }
    ] },
  glute: { name: 'Glute Day', sub: 'Po & Hüfte', poster: 'bilder/02_glute_day.jpg', rest: 75, type: 'kraft',
    tips: ['Jede Wiederholung kontrolliert', 'Hüfte gerade halten'],
    ex: [
      { n: 'Glute Bridge', s: 3, r: '12–15', band: { n: 'Glute Bridge mit Miniband', how: 'Miniband über den Knien, Knie beim Hochdrücken nach außen drücken' } },
      { n: 'Reverse Lunge', s: 3, r: '8–10 je Bein', band: { n: 'Reverse Lunge mit Band', how: 'Band unter den vorderen Fuß, Enden an den Schultern' } },
      { n: 'Side-Lying Leg Raise', s: 3, r: '12 je Seite', band: { n: 'Clamshell mit Miniband', how: 'Seitlich liegen, Miniband über den Knien, oberes Knie wie eine Muschel öffnen' } },
      { n: 'Donkey Kick', s: 3, r: '12 je Seite', band: { n: 'Band-Kickback', how: 'Vierfüßler, Band um einen Fuß und unter den Händen, Fuß nach hinten oben drücken' } },
      { n: 'Bodyweight Squat', s: 3, r: '10–12', band: { n: 'Squat mit Miniband', how: 'Miniband über den Knien, Knie nach außen drücken' } }
    ] },
  upper: { name: 'Upper Body', sub: 'Oberkörper', poster: 'bilder/03_upper_body.jpg', rest: 75, type: 'kraft',
    tips: ['Machbares Gewicht', 'Nicht schwingen'],
    ex: [
      { n: 'Floor Press', s: 3, r: '10–12', band: { n: 'Band Chest Press', how: 'Band hinter dem Rücken, Enden nach vorn drücken' } },
      { n: 'Bent-Over Row', s: 3, r: '10–12', band: { n: 'Band-Rudern', how: 'Band unter beide Füße, vorbeugen, Enden zum Bauch ziehen' } },
      { n: 'Shoulder Press', s: 3, r: '8–10', band: { n: 'Band Shoulder Press', how: 'Band unter die Füße, Enden von Schulterhöhe nach oben drücken' } },
      { n: 'Biceps Curl', s: 3, r: '10–12', band: { n: 'Band-Curl', how: 'Band unter die Füße, Enden mit Handflächen nach oben beugen' } },
      { n: 'Triceps Kickback', s: 3, r: '12', band: { n: 'Band Triceps Kickback', how: 'Band unter einen Fuß, vorbeugen, Arm nach hinten strecken' } }
    ] },
  quad: { name: 'Quad Day', sub: 'Oberschenkel', poster: 'bilder/04_quad_day.jpg', rest: 75, type: 'kraft',
    tips: ['Knie folgen den Zehen', 'Fersen unten lassen'],
    ex: [
      { n: 'Goblet Squat', s: 3, r: '8–12', band: { n: 'Band-Squat', how: 'Band unter beide Füße, Enden über die Schultern' } },
      { n: 'Split Squat', s: 3, r: '8 je Bein', band: { n: 'Split Squat mit Band', how: 'Band unter den vorderen Fuß, Enden an den Schultern' } },
      { n: 'Low Step-Up', s: 3, r: '10 je Bein', band: { n: 'Step-Up mit Band', how: 'Band unter den Fuß auf der Stufe, Enden in den Händen' } },
      { n: 'Wall Sit', s: 3, sec: 20, r: '20–40 sek' },
      { n: 'Bodyweight Squat', s: 2, r: '12–15', band: { n: 'Squat mit Miniband', how: 'Miniband über den Knien, Knie nach außen drücken' } }
    ] },
  core: { name: 'Core Day', sub: 'Bauch & Rumpf', poster: 'bilder/05_core_day.jpg', rest: 50, type: 'kraft',
    tips: ['Ruhig atmen', 'Becken stabil halten'],
    ex: [
      { n: 'Dead Bug', s: 3, r: '8 je Seite' },
      { n: 'Forearm Plank', s: 3, sec: 20, r: '20–30 sek' },
      { n: 'Bird Dog', s: 3, r: '8 je Seite' },
      { n: 'Side Plank', s: 2, sec: 15, r: '15–25 sek je Seite' },
      { n: 'Reverse Crunch', s: 3, r: '10–12', band: { n: 'Pallof Press mit Band', how: 'Band seitlich an Türgriff, beide Hände vor der Brust, Arme nach vorn strecken und halten, 10 je Seite' } }
    ] },
  post: { name: 'Posterior Chain', sub: 'Hintere Beine & Po', poster: 'bilder/06_posterior_chain.jpg', rest: 75, type: 'kraft',
    tips: ['Aus der Hüfte beugen', 'Gewicht nah am Körper'],
    ex: [
      { n: 'Dumbbell RDL', s: 3, r: '8–12', band: { n: 'Band-RDL', how: 'Band unter beide Füße, Enden in den Händen, aus der Hüfte beugen' } },
      { n: 'Glute Bridge', s: 3, r: '12–15', band: { n: 'Glute Bridge mit Miniband', how: 'Miniband über den Knien, Knie nach außen drücken' } },
      { n: 'Kickstand RDL', s: 3, r: '8 je Bein', band: { n: 'Kickstand RDL mit Band', how: 'Band unter den vorderen Fuß, Enden in den Händen' } },
      { n: 'Hamstring Walkout', s: 2, r: '6–8' },
      { n: 'Good Morning', s: 2, r: '12', band: { n: 'Good Morning mit Band', how: 'Band unter die Füße und über den Nacken, aus der Hüfte beugen' } }
    ] },
  back: { name: 'Back Day', sub: 'Rücken', poster: 'bilder/07_back_day.jpg', rest: 75, type: 'kraft',
    tips: ['Nacken gerade', 'Mit Kontrolle'],
    ex: [
      { n: 'Supported Row', s: 3, r: '10 je Arm', band: { n: 'Einarmiges Band-Rudern', how: 'Band unter einen Fuß, mit einer Hand zum Bauch ziehen' } },
      { n: 'Bent-Over Row', s: 3, r: '10–12', band: { n: 'Band-Rudern', how: 'Band unter beide Füße, vorbeugen, Enden zum Bauch ziehen' } },
      { n: 'Reverse Fly', s: 3, r: '12', band: { n: 'Band Pull-Apart', how: 'Band mit beiden Händen vor der Brust, auseinanderziehen bis zur Brust' } },
      { n: 'Prone W Raise', s: 2, r: '10' },
      { n: 'Bird Dog', s: 2, r: '8 je Seite' }
    ] },
  arms: { name: 'Arms & Shoulders', sub: 'Arme & Schultern', poster: 'bilder/08_arms_shoulders.jpg', rest: 75, type: 'kraft',
    tips: ['Leicht anfangen', 'Handgelenke gerade'],
    ex: [
      { n: 'Shoulder Press', s: 3, r: '8–10', band: { n: 'Band Shoulder Press', how: 'Band unter die Füße, Enden von Schulterhöhe nach oben drücken' } },
      { n: 'Lateral Raise', s: 3, r: '10–12', band: { n: 'Band Lateral Raise', how: 'Band unter die Füße, Arme seitlich bis Schulterhöhe heben' } },
      { n: 'Hammer Curl', s: 3, r: '10–12', band: { n: 'Band Hammer Curl', how: 'Band unter die Füße, Daumen nach oben, Arme beugen' } },
      { n: 'Biceps Curl', s: 2, r: '10–12', band: { n: 'Band-Curl', how: 'Band unter die Füße, Handflächen nach oben, Arme beugen' } },
      { n: 'Triceps Kickback', s: 3, r: '12', band: { n: 'Band Triceps über Kopf', how: 'Band unter einen Fuß, Enden hinter dem Kopf, Arme nach oben strecken' } }
    ] },
  full: { name: 'Full Body', sub: 'Ganzkörper (Joker, wenig Zeit)', poster: 'bilder/10_full_body.jpg', rest: 75, type: 'kraft',
    tips: ['Erst aufwärmen', 'Kontrollierte Wiederholungen'],
    ex: [
      { n: 'Goblet Squat', s: 3, r: '10', band: { n: 'Band-Squat', how: 'Band unter beide Füße, Enden über die Schultern' } },
      { n: 'Dumbbell RDL', s: 3, r: '10', band: { n: 'Band-RDL', how: 'Band unter beide Füße, Enden in den Händen, aus der Hüfte beugen' } },
      { n: 'Floor Press', s: 3, r: '10', band: { n: 'Band Chest Press', how: 'Band hinter dem Rücken, Enden nach vorn drücken' } },
      { n: 'Bent-Over Row', s: 3, r: '10', band: { n: 'Band-Rudern', how: 'Band unter beide Füße, vorbeugen, Enden zum Bauch ziehen' } },
      { n: 'Forearm Plank', s: 3, sec: 20, r: '20–30 sek' }
    ] },
  cardio: { name: 'Low-Impact Cardio', sub: '3 Runden, kein Springen (Joker)', poster: 'bilder/09_low_impact_cardio.jpg', rest: 20, type: 'cardio',
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
  step: { name: 'Cardio', sub: 'Stepper, Laufband oder Fahrrad', type: 'step' },
  rest: { name: 'Regeneration', sub: 'Freier Tag', type: 'rest' }
};
const PLAN_A = ['leg', 'upper', 'swim', 'glute', 'core', 'step', 'rest'];
const PLAN_B = ['quad', 'back', 'swim', 'post', 'arms', 'step', 'rest'];
const DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const DAYS_LONG = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

const DEFAULT = { name: 'Celina', startDate: null, swimMin: 60, stepStart: 30, stepPlus: 5, stepMax: 60,
  holdWeeks: [], weights: [], sessions: [], checks: {}, overrides: {}, gear: {}, cardioDev: {}, lastDev: 'step', essen: {}, updatedAt: 0 };

// ---------- Datum ----------
function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function fromIso(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function addDays(s, n) { const d = fromIso(s); d.setDate(d.getDate() + n); return iso(d); }
function wdIdx(s) { return (fromIso(s).getDay() + 6) % 7; }
function mondayOf(s) { return addDays(s, -wdIdx(s)); }
function fmt(s) { const d = fromIso(s); return d.getDate() + '.' + (d.getMonth() + 1) + '.'; }
function fmtLong(s) { return DAYS_LONG[wdIdx(s)] + ', ' + fmt(s) + fromIso(s).getFullYear(); }

// ---------- Plan ----------
function weekNo(startDate, s) { return Math.round((fromIso(mondayOf(s)) - fromIso(mondayOf(startDate))) / 864e5 / 7) + 1; }
function planLetter(startDate, s) { return weekNo(startDate, s) % 2 === 1 ? 'A' : 'B'; }
function planKey(S, s) {
  if (S.overrides[s]) return S.overrides[s];
  const w = weekNo(S.startDate, s); if (w < 1) return 'rest';
  return (planLetter(S.startDate, s) === 'A' ? PLAN_A : PLAN_B)[wdIdx(s)];
}
function infoOf(key) { return WORKOUTS[key] || SPECIAL[key]; }
function imgOf(key, i) { return 'uebungen/' + key + '_' + i + '.jpg'; }
// Geraet: Woche 1+2 Hanteln, Woche 3+4 Band, dann wieder Hanteln ...
function gearOf(S, s) { if (S.gear[s]) return S.gear[s]; const w = Math.max(1, weekNo(S.startDate, s)); return ((w - 1) % 4) >= 2 ? 'band' : 'hantel'; }
function stepMinutes(S, w) {
  const holds = S.holdWeeks.filter(h => h < w).length;
  return Math.min(S.stepMax, Math.max(S.stepStart, S.stepStart + S.stepPlus * (w - 1 - holds)));
}
function devOf(S, s) { return S.cardioDev[s] || S.lastDev || 'step'; }
function sessionOf(S, s) { return S.sessions.find(x => x.planDate === s); }
function lastWeight(S) { return S.weights.length ? S.weights[S.weights.length - 1].kg : null; }
function weightThisWeek(S, todayIso) { const w = weekNo(S.startDate, todayIso); return S.weights.some(x => weekNo(S.startDate, x.date) === w); }
function kcalEst(kg, type, min, dev) {
  const met = (type === 'step' && DEVICES[dev]) ? DEVICES[dev].met : (MET[type] || 4.0);
  return Math.round(met * (kg || 70) * min / 60);
}
// Essensplan: Tag 0–13 im 14-Tage-Plan (Woche A = Tag 1–7, Woche B = Tag 8–14)
function essenTag(startDate, s) { const w = weekNo(startDate, s); if (w < 1) return 0; return ((w - 1) * 7 + wdIdx(s)) % 14; }
// Sicherung: neuerer Stand gewinnt
function newerState(a, b) { return ((b && b.updatedAt) || 0) > ((a && a.updatedAt) || 0) ? b : a; }
function sumKm(sessions, type) { return Math.round(sessions.filter(x => x.type === type).reduce((a, x) => a + (x.km || 0), 0) * 10) / 10; }

root.CF = { MET, DEVICES, WORKOUTS, SPECIAL, PLAN_A, PLAN_B, DAYS, DAYS_LONG, DEFAULT,
  iso, fromIso, addDays, wdIdx, mondayOf, fmt, fmtLong, weekNo, planLetter, planKey, infoOf, imgOf, gearOf, stepMinutes, devOf,
  sessionOf, lastWeight, weightThisWeek, kcalEst, newerState, sumKm, essenTag };
})(typeof module !== 'undefined' && module.exports ? module.exports : window);
