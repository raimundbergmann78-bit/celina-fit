/* Service Worker: macht die App offline nutzbar.
   Mit Internet: immer die neueste Datei laden (Updates kommen automatisch).
   Ohne Internet: aus dem Zwischenspeicher. */
const CACHE = 'celinafit-v12';
const FILES = [
  './', './index.html', './style.css', './sprache.js', './logik.js', './essen.js', './app.js', './manifest.webmanifest',
  './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png', './icons/splash.jpg',
  './bilder/01_leg_day.jpg', './bilder/02_glute_day.jpg', './bilder/03_upper_body.jpg', './bilder/04_quad_day.jpg',
  './bilder/05_core_day.jpg', './bilder/06_posterior_chain.jpg', './bilder/07_back_day.jpg', './bilder/08_arms_shoulders.jpg',
  './bilder/09_low_impact_cardio.jpg', './bilder/10_full_body.jpg'
];
for (const k of ['leg', 'glute', 'upper', 'quad', 'core', 'post', 'back', 'arms', 'cardio', 'full']) {
  for (let i = 0; i < 5; i++) FILES.push('./uebungen/' + k + '_' + i + '.jpg');
}
for (const n of ['sumo_squat', 'lateral_lunge', 'single_leg_bridge', 'bulgarian_split_squat', 'curtsy_lunge', 'fire_hydrant', 'clamshell', 'hip_thrust',
  'knee_pushup', 'chest_fly', 'front_raise', 'overhead_triceps', 'upright_row', 'mountain_climbers', 'russian_twist', 'bicycle_crunch', 'leg_raises',
  'hollow_hold', 'sumo_deadlift', 'superman', 'renegade_row', 'pullover', 'shrugs', 'arnold_press', 'concentration_curl', 'butt_kicks', 'skater_steps',
  'squat_punch', 'inchworm', 'plank_taps']) FILES.push('./uebungen/extra_' + n + '.jpg');
const POS = { leg_drop_crunch: 2, alt_leg_extension: 3, block_pass: 2, block_reverse_crunch: 2, scissors: 2, core_sequence: 4, reverse_crunch_ball: 2,
  single_leg_raise: 2, leg_lowering: 2, band_kickback: 2, band_deep_squat: 2, band_split_squat: 2, quad_kickback: 2, band_squat_pulse: 2 };
for (const [n, k] of Object.entries(POS)) for (let i = 1; i <= k; i++) FILES.push('./uebungen/pos/' + n + '_' + i + '.jpg');
FILES.push('./uebungen/pos/poster_ball.jpg', './uebungen/pos/poster_band.jpg');
const PP = ["p_arnold_press", "p_bent_over_row", "p_biceps_curl", "p_bicycle_crunch", "p_bird_dog", "p_bulgarian", "p_calf_raise", "p_chest_fly", "p_clamshell", "p_concentration_curl", "p_curtsy_lunge", "p_dead_bug", "p_donkey_kick", "p_fire_hydrant", "p_floor_press", "p_forearm_plank", "p_front_raise", "p_glute_bridge", "p_goblet_squat", "p_good_morning", "p_hammer_curl", "p_hamstring_walkout", "p_hip_thrust", "p_hollow_hold", "p_kickstand_rdl", "p_knee_drives", "p_knee_pushup", "p_lateral_lunge", "p_lateral_raise", "p_leg_raises", "p_lunge", "p_march", "p_mountain_climbers", "p_overhead_triceps", "p_prone_w_raise", "p_pullover", "p_rdl", "p_renegade_row", "p_reverse_crunch", "p_reverse_fly", "p_reverse_lunge", "p_russian_twist", "p_shadow_boxing", "p_shoulder_press", "p_shrugs", "p_side_leg_raise", "p_side_lying_leg_raise", "p_side_plank", "p_side_steps", "p_single_leg_bridge", "p_split_squat", "p_squat", "p_step_jacks", "p_step_up", "p_sumo_deadlift", "p_sumo_squat", "p_superman", "p_supported_row", "p_triceps_kickback", "p_upright_row", "p_wall_sit"];
for (const n of PP) FILES.push('./uebungen/pos/' + n + '_1.jpg', './uebungen/pos/' + n + '_2.jpg');
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  // Immer beim Server nachfragen, ob es eine neuere Datei gibt (sonst haelt der Browser-Cache alte Dateien fest)
  const anfrage = e.request.mode === 'navigate' ? fetch(e.request) : fetch(e.request, { cache: 'no-cache' });
  e.respondWith(
    anfrage.then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html')))
  );
});
