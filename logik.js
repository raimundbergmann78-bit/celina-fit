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
// ---------- Extra-Uebungen (kommen bei laengerer Trainingsdauer dazu) ----------
const EXTRA = {
  sumo_squat: { n: 'Sumo Squat', s: 3, r: '12', img: 'uebungen/extra_sumo_squat.jpg', band: { n: 'Sumo Squat mit Miniband', how: 'Miniband über den Knien, weite Fußstellung, Knie nach außen drücken' } },
  lateral_lunge: { n: 'Lateral Lunge', s: 3, r: '8 je Seite', img: 'uebungen/extra_lateral_lunge.jpg' },
  single_leg_bridge: { n: 'Single-Leg Glute Bridge', s: 3, r: '10 je Bein', img: 'uebungen/extra_single_leg_bridge.jpg' },
  bulgarian_split_squat: { n: 'Bulgarian Split Squat', s: 3, r: '8 je Bein', img: 'uebungen/extra_bulgarian_split_squat.jpg' },
  curtsy_lunge: { n: 'Curtsy Lunge', s: 3, r: '8 je Seite', img: 'uebungen/extra_curtsy_lunge.jpg' },
  fire_hydrant: { n: 'Fire Hydrant', s: 3, r: '12 je Seite', img: 'uebungen/extra_fire_hydrant.jpg', band: { n: 'Fire Hydrant mit Miniband', how: 'Miniband über den Knien, Knie seitlich gegen den Widerstand heben' } },
  clamshell: { n: 'Clamshell', s: 3, r: '15 je Seite', img: 'uebungen/extra_clamshell.jpg', band: { n: 'Clamshell mit Miniband', how: 'Miniband über den Knien, oberes Knie gegen den Widerstand öffnen' } },
  hip_thrust: { n: 'Hip Thrust (am Sofa)', s: 3, r: '12', img: 'uebungen/extra_hip_thrust.jpg' },
  knee_pushup: { n: 'Knie-Liegestütze', s: 3, r: '8–10', img: 'uebungen/extra_knee_pushup.jpg' },
  chest_fly: { n: 'Floor Chest Fly', s: 3, r: '12', img: 'uebungen/extra_chest_fly.jpg', band: { n: 'Band Chest Fly', how: 'Band hinter dem Rücken, Arme leicht gebeugt vor der Brust zusammenführen' } },
  front_raise: { n: 'Front Raise', s: 3, r: '10–12', img: 'uebungen/extra_front_raise.jpg', band: { n: 'Band Front Raise', how: 'Band unter die Füße, gestreckte Arme nach vorn bis Schulterhöhe heben' } },
  overhead_triceps: { n: 'Overhead Triceps Extension', s: 3, r: '10–12', img: 'uebungen/extra_overhead_triceps.jpg', band: { n: 'Band Triceps über Kopf', how: 'Band unter einen Fuß, Enden hinter dem Kopf, Arme nach oben strecken' } },
  upright_row: { n: 'Upright Row', s: 3, r: '10–12', img: 'uebungen/extra_upright_row.jpg', band: { n: 'Band Upright Row', how: 'Band unter die Füße, Enden eng am Körper bis zur Brust hochziehen, Ellbogen hoch' } },
  mountain_climbers: { n: 'Mountain Climbers', s: 3, sec: 30, r: '30 sek', img: 'uebungen/extra_mountain_climbers.jpg' },
  russian_twist: { n: 'Russian Twist', s: 3, r: '20 (10 je Seite)', img: 'uebungen/extra_russian_twist.jpg' },
  bicycle_crunch: { n: 'Bicycle Crunch', s: 3, r: '20', img: 'uebungen/extra_bicycle_crunch.jpg' },
  leg_raises: { n: 'Leg Raises', s: 3, r: '10–12', img: 'uebungen/extra_leg_raises.jpg' },
  hollow_hold: { n: 'Hollow Hold', s: 3, sec: 20, r: '20 sek', img: 'uebungen/extra_hollow_hold.jpg' },
  sumo_deadlift: { n: 'Sumo Deadlift (Kurzhantel)', s: 3, r: '10', img: 'uebungen/extra_sumo_deadlift.jpg', band: { n: 'Band Sumo Deadlift', how: 'Band unter beide Füße, weite Fußstellung, Enden in den Händen, aus der Hüfte aufrichten' } },
  superman: { n: 'Superman', s: 3, r: '12', img: 'uebungen/extra_superman.jpg' },
  renegade_row: { n: 'Renegade Row', s: 3, r: '8 je Seite', img: 'uebungen/extra_renegade_row.jpg' },
  pullover: { n: 'Dumbbell Pullover', s: 3, r: '12', img: 'uebungen/extra_pullover.jpg' },
  shrugs: { n: 'Shrugs', s: 3, r: '15', img: 'uebungen/extra_shrugs.jpg', band: { n: 'Band Shrugs', how: 'Band unter die Füße, Schultern gegen den Widerstand zu den Ohren ziehen' } },
  arnold_press: { n: 'Arnold Press', s: 3, r: '10', img: 'uebungen/extra_arnold_press.jpg' },
  concentration_curl: { n: 'Concentration Curl', s: 3, r: '10 je Arm', img: 'uebungen/extra_concentration_curl.jpg', band: { n: 'Band Concentration Curl', how: 'Band unter den Fuß, Ellbogen am Oberschenkel abstützen, Arm beugen' } },
  butt_kicks: { n: 'Butt Kicks', s: 3, sec: 40, r: '40 sek', img: 'uebungen/extra_butt_kicks.jpg' },
  skater_steps: { n: 'Skater Steps', s: 3, sec: 40, r: '40 sek', img: 'uebungen/extra_skater_steps.jpg' },
  squat_punch: { n: 'Squat to Punch', s: 3, sec: 40, r: '40 sek', img: 'uebungen/extra_squat_punch.jpg' },
  inchworm: { n: 'Inchworm', s: 3, r: '6', img: 'uebungen/extra_inchworm.jpg' },
  plank_taps: { n: 'Plank Shoulder Taps', s: 3, r: '20', img: 'uebungen/extra_plank_taps.jpg' },
  reverse_lunge: { n: 'Reverse Lunge', s: 3, r: '8 je Bein', img: 'uebungen/glute_1.jpg' },
  donkey_kick: { n: 'Donkey Kick', s: 3, r: '12 je Seite', img: 'uebungen/glute_3.jpg' },
  // Ball-Uebungen mit Positionen (aus Celinas Fotos, 14.11.2026)
  core_sequence: { n: 'Core-Abfolge mit Ball', s: 3, r: '6 je Seite', pos: posBilder('core_sequence', 4) },
  reverse_crunch_ball: { n: 'Reverse Crunch mit Ball', s: 3, r: '12', pos: posBilder('reverse_crunch_ball', 2) },
  single_leg_raise: { n: 'Single Leg Raise mit Ball', s: 3, r: '10 je Bein', pos: posBilder('single_leg_raise', 2) },
  leg_lowering: { n: 'Beine senken mit Ball', s: 3, r: '10', pos: posBilder('leg_lowering', 2) }
};
function posBilder(name, n) { const a = []; for (let i = 1; i <= n; i++) a.push('uebungen/pos/' + name + '_' + i + '.jpg'); return a; }
Object.values(EXTRA).forEach(e => { if (e.pos && !e.img) e.img = e.pos[0]; });

// ---------- Neue Workouts aus Celinas Fotos (Joker, ueber „Anderes Workout“) ----------
WORKOUTS.ball = { name: 'Core mit Ball', sub: 'Bauch, kleiner Ball unter dem Becken', poster: 'uebungen/pos/poster_ball.jpg', rest: 45, type: 'kraft',
  tips: ['Ball unter dem Kreuzbein', 'Unterer Rücken bleibt am Ball', 'Langsam absenken'],
  ex: [
    { n: 'Leg Drop Crunch', s: 3, r: '10', pos: posBilder('leg_drop_crunch', 2) },
    { n: 'Beinstrecken im Wechsel', s: 3, r: '10 je Seite', pos: posBilder('alt_leg_extension', 3) },
    { n: 'Block-Übergabe', s: 3, r: '10', pos: posBilder('block_pass', 2) },
    { n: 'Reverse Crunch mit Block', s: 3, r: '12', pos: posBilder('block_reverse_crunch', 2) },
    { n: 'Beinschere', s: 3, r: '20 (10 je Seite)', pos: posBilder('scissors', 2) }
  ] };
WORKOUTS.band = { name: 'Band Po-Workout', sub: 'Po & Beine mit Miniband', poster: 'uebungen/pos/poster_band.jpg', rest: 60, type: 'kraft',
  tips: ['Band immer gespannt halten', 'Knie nach außen drücken'],
  ex: [
    { n: 'Standing Band Kickback', s: 3, r: '15 je Bein', pos: posBilder('band_kickback', 2) },
    { n: 'Tiefe Kniebeuge mit Band', s: 3, r: '12', pos: posBilder('band_deep_squat', 2) },
    { n: 'Split Squat mit Band', s: 3, r: '10 je Bein', pos: posBilder('band_split_squat', 2) },
    { n: 'Vierfüßler-Kickback mit Band', s: 3, r: '12 je Bein', pos: posBilder('quad_kickback', 2) },
    { n: 'Squat Pulse mit Band', s: 3, r: '15', pos: posBilder('band_squat_pulse', 2) }
  ] };
[WORKOUTS.ball, WORKOUTS.band].forEach(w => w.ex.forEach(e => { e.img = e.pos[0]; }));
const EXTRAS_BY_WORKOUT = {
  leg: ['sumo_squat', 'lateral_lunge', 'single_leg_bridge', 'bulgarian_split_squat', 'curtsy_lunge'],
  glute: ['fire_hydrant', 'clamshell', 'hip_thrust', 'single_leg_bridge', 'sumo_squat'],
  upper: ['knee_pushup', 'chest_fly', 'front_raise', 'overhead_triceps', 'upright_row'],
  quad: ['bulgarian_split_squat', 'lateral_lunge', 'sumo_squat', 'curtsy_lunge', 'reverse_lunge'],
  core: ['mountain_climbers', 'russian_twist', 'bicycle_crunch', 'leg_raises', 'hollow_hold'],
  post: ['single_leg_bridge', 'sumo_deadlift', 'superman', 'hip_thrust', 'donkey_kick'],
  back: ['superman', 'renegade_row', 'pullover', 'upright_row', 'shrugs'],
  arms: ['front_raise', 'arnold_press', 'overhead_triceps', 'concentration_curl', 'upright_row'],
  cardio: ['butt_kicks', 'skater_steps', 'squat_punch', 'inchworm', 'plank_taps'],
  full: ['knee_pushup', 'sumo_squat', 'renegade_row', 'mountain_climbers', 'russian_twist'],
  ball: ['core_sequence', 'reverse_crunch_ball', 'single_leg_raise', 'leg_lowering', 'hollow_hold'],
  band: ['fire_hydrant', 'clamshell', 'hip_thrust', 'single_leg_bridge', 'lateral_lunge']
};
Object.keys(EXTRAS_BY_WORKOUT).forEach(k => { WORKOUTS[k].extra = EXTRAS_BY_WORKOUT[k]; });
// Trainingsdauer: 30 min = 5 Uebungen, 40 = 7, 50 = 8, 60 = 10
const DAUER_STUFEN = [30, 40, 50, 60];
function extraCount(dauer) { return ({ 30: 0, 40: 2, 50: 3, 60: 5 })[dauer] || 0; }
function exercisesFor(info, dauer) {
  if (!info || !info.ex) return [];
  return info.ex.concat((info.extra || []).slice(0, extraCount(dauer)).map(id => EXTRA[id]).filter(Boolean));
}

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
  holdWeeks: [], weights: [], sessions: [], checks: {}, overrides: {}, gear: {}, cardioDev: {}, lastDev: 'step', essen: {}, dauer: 30, supps: {}, suppAus: { zink: true }, suppMenge: {}, updatedAt: 0 };

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

// ---------- Supplemente (besprochen am 14.11.2026) ----------
// zeit: morgens | mittags | vor (vor dem Training) | nach (nach dem Training) | abends
const SUPP_ZEITEN = [['morgens', 'Morgens zum Frühstück'], ['mittags', 'Mittags'], ['vor', '30–60 min vor dem Training'], ['nach', 'Nach dem Training'], ['abends', 'Abends']];
const SUPPS = [
  { id: 'kreatin', n: 'Kreatin (Monohydrat)', m: '5 g', zeit: 'morgens', info: 'Mehr Kraft und Leistung, jeden Tag nehmen, auch an Ruhetagen.', hinweis: 'Bindet 1–2 kg Wasser in den Muskeln. Das ist kein Fett, beim Gewichts-Check daran denken.' },
  { id: 'vitd', n: 'Vitamin D3 + K2', m: '1000–2000 IE', zeit: 'morgens', info: 'Knochen, Muskeln, Immunsystem. Von Oktober bis März besonders wichtig.', hinweis: 'Zum Essen nehmen, Vitamin D braucht etwas Fett.' },
  { id: 'omega3', n: 'Omega-3 (EPA/DHA)', m: '1–2 g', zeit: 'morgens', info: 'Regeneration, Herz, weniger Entzündungen.', hinweis: 'An Tagen mit fettem Fisch (z. B. Lachs) nicht nötig.' },
  { id: 'calcium', n: 'Calcium', m: '500 mg', zeit: 'mittags', info: 'Knochen. Bedarf ca. 1000 mg am Tag, am besten übers Essen.', hinweis: 'Nur nötig, wenn wenig Milchprodukte gegessen werden. Max. 500 mg auf einmal.' },
  { id: 'citrullin', n: 'L-Citrullin', m: '6 g (Malat: 8 g)', zeit: 'vor', training: true, info: 'Bessere Durchblutung, weniger Ermüdung im Training.' },
  { id: 'arginin', n: 'L-Arginin', m: '3 g', zeit: 'vor', training: true, info: 'Ähnlich wie Citrullin, wirkt aber schwächer.', hinweis: 'Bei Blutdruck-Medikamenten vorher Arzt fragen.' },
  { id: 'koffein', n: 'Koffein (Teein)', m: '100–200 mg', zeit: 'vor', training: true, info: 'Wacher, mehr Leistung im Training.', hinweis: 'Nicht nach 15 Uhr, sonst leidet der Schlaf. Kaffee zählt mit.' },
  { id: 'theanin', n: 'L-Theanin', m: '100–200 mg', zeit: 'vor', training: true, info: 'Aus grünem Tee. Beruhigt und macht konzentriert, zusammen mit Koffein weniger nervös.' },
  { id: 'carnitin', n: 'L-Carnitin', m: '1–2 g', zeit: 'vor', training: true, info: 'Wird für Fettabbau und Regeneration genommen.', hinweis: 'Die Wirkung ist nur schwach belegt.' },
  { id: 'eiweiss', n: 'Eiweißshake', m: '30 g', zeit: 'nach', training: true, info: 'Ziel ca. 1,6 g Eiweiß pro kg Körpergewicht am Tag.', hinweis: 'Ist der Shake im Essensplan schon dran, zählt er hier mit.' },
  { id: 'magnesium', n: 'Magnesium (Citrat/Glycinat)', m: '300 mg', zeit: 'abends', info: 'Muskeln, gegen Krämpfe, besserer Schlaf.', hinweis: 'Mehr als 300 mg extra kann Durchfall machen.' },
  { id: 'zink', n: 'Zink', m: '10 mg', zeit: 'abends', info: 'Immunsystem und Regeneration.', hinweis: 'Wer Fleisch isst, braucht es meist nicht. Darum standardmäßig aus.' }
];
// Trainingstag = alles ausser Regeneration (Kraft, Schwimmen, Cardio)
function istTrainingstag(S, s) { return planKey(S, s) !== 'rest'; }
function suppsFor(S, s) {
  const tr = istTrainingstag(S, s);
  return SUPPS.filter(x => !(S.suppAus || {})[x.id] && (!x.training || tr));
}
function suppMenge(S, x) { return (S.suppMenge || {})[x.id] || x.m; }
// Sicherung: neuerer Stand gewinnt
function newerState(a, b) { return ((b && b.updatedAt) || 0) > ((a && a.updatedAt) || 0) ? b : a; }
function sumKm(sessions, type) { return Math.round(sessions.filter(x => x.type === type).reduce((a, x) => a + (x.km || 0), 0) * 10) / 10; }

root.CF = { MET, DEVICES, WORKOUTS, EXTRA, DAUER_STUFEN, extraCount, exercisesFor, SPECIAL, PLAN_A, PLAN_B, DAYS, DAYS_LONG, DEFAULT,
  iso, fromIso, addDays, wdIdx, mondayOf, fmt, fmtLong, weekNo, planLetter, planKey, infoOf, imgOf, gearOf, stepMinutes, devOf,
  sessionOf, lastWeight, weightThisWeek, kcalEst, newerState, sumKm, essenTag, SUPPS, SUPP_ZEITEN, suppsFor, suppMenge, istTrainingstag };
})(typeof module !== 'undefined' && module.exports ? module.exports : window);
