import * as THREE from 'three';
import { recap } from './recap.js';
import { C, M, W, H, world, box, cyl, sph, mesh, place, prog, eio, eo, back, lerp, clamp, camTo, label, setI, doneI, rand } from './world.js';
import { marlo, person } from './marlo.js';
import { jar, marble, street, tickGutter, townsperson, PAT } from './sets.js';

const popIn = (o, t, a, s = 1, dur = .35) => { const p = prog(t, a, a + dur); o.visible = p > 0; o.scale.setScalar(Math.max(.0001, back(p) * s)); };
const stampIn = (o, t, a, s = 1) => { const p = prog(t, a, a + .24); o.visible = p > 0; o.scale.setScalar(p <= 0 ? .0001 : lerp(2.3, 1, eo(p)) * s); };
const blinkAt = t => (Math.sin(t * 3.1) > .985 ? .1 : 1);
const MS = () => marlo({ sockL: PAT.stripe(), sockR: PAT.dots() });
const GOLD = '#f5b700', RED = '#e4572e', CREAM = '#fbf7ee', INK = '#14213d', PINK = '#f2a9a0', GREEN = '#3fae5a', NOTE = '#fff07a', ICE = '#bfe3ff';
export const F = {};

// ---------- cast / layout
const BOSS = { top: 0x3a3a48, pant: 0x23232b, skin: 0xf0c49c, hair: 0xe4572e, style: 'cap', shoe: 0x14213d, sockL: 0xe4572e, sockR: 0xe4572e };
const hold = (p, o, y = 1.3, z = 1.0) => { place(o, 0, y, z, p); return o; };
const HX = i => (i - 3) * 6.55; // 3 = Marlo's house
const lift = (w, y = 4.8) => w.houses.forEach(h => { if (h.userData.sign) h.userData.sign.position.y = y; });
const SHOP = ['', '', '', 'NO SCRAPE', '', '', ''];
const ALL = ['ODD PAIRS', 'STANDING ROOM', 'PLANT HOTEL', 'NO SCRAPE', 'SORRY CAKE', 'PEDAL POWER', 'KEY KEEPER'];
const crossed = { armL: [1.25, -.32], armR: [1.25, -.32] };
const WIN = { bg: 0xd3e4ef, env: .85, sun: 2.3 };
const NIGHT = { bg: 0x1d2b4f, sun: .6, env: .32 };
const DAWN = { bg: 0xf9c98a, sun: 2.0, env: .8 };
const SNOW = 0xf4f8fb, CARZ = 2.75;
const CARC = [0xe4572e, 0x2e86ff, 0x2fa36b, 0x7b5fc7, 0xf5b700, 0x1f6f78, 0xf2a9a0];
const BLK = [0xe4572e, 0x7b5fc7, 0x2fa36b, 0xf5b700, 0x2e86ff, 0xf2a9a0];
const doorLight = (w, x = 0) => { const l = new THREE.PointLight(0xffc47a, 22, 14); place(l, x + 1.2, 4.6, -1.2, w.scene); return l; };
// a thin layer of snow on the sidewalk (the gutter marbles stay visible)
const winterize = w => { place(box(70, .03, 4.6, SNOW, .01, .9), 0, .115, -1.7, w.scene); return w; };
const wstreet = (o = {}) => winterize(street({ ...WIN, ...o }));

// ---------- props
const GLASS = new THREE.Color(0x22324f), FROST = new THREE.Color(0xe6f3ff);
// a small cartoon car along +x (front at +x). userData: setFrost(k), cap (snow), bl (blanket)
export function car(col = C.red, s = 1.3, o = {}) {
  const g = new THREE.Group();
  const gm = new THREE.MeshStandardMaterial({ color: 0xe6f3ff, roughness: .35, emissive: 0x9fc9ee, emissiveIntensity: .25 });
  place(box(3.8, .85, 1.9, col, .3, .4), 0, .78, 0, g);
  place(box(2.0, .75, 1.7, col, .25, .4), -.45, 1.58, 0, g);
  const ws = mesh(new THREE.BoxGeometry(.08, .85, 1.56), gm); ws.rotation.z = -.75; place(ws, .76, 1.53, 0, g);
  const rw = mesh(new THREE.BoxGeometry(.08, .8, 1.5), gm); rw.rotation.z = .75; place(rw, -1.66, 1.53, 0, g);
  [-1, 1].forEach(z => place(mesh(new THREE.BoxGeometry(1.5, .48, .04), gm), -.45, 1.6, z * .86, g));
  [[1.25, .9], [1.25, -.9], [-1.25, .9], [-1.25, -.9]].forEach(([x, z]) => { const wh = cyl(.42, .42, .3, C.ink, 24, .7); wh.rotation.x = Math.PI / 2; place(wh, x, .42, z, g); const hb = cyl(.18, .18, .32, 0xc9ced8, 16, .3); hb.rotation.x = Math.PI / 2; place(hb, x, .42, z, g); });
  [-.6, .6].forEach(z => place(sph(.13, 0xfff4c9, .2), 1.9, .9, z, g));
  const patch = mesh(new THREE.BoxGeometry(.03, .5, .7), M(0x22324f, .1)); place(patch, .05, 0, .3, ws); patch.visible = false;
  const cap = new THREE.Group(); place(box(2.1, .3, 1.8, SNOW, .14, .9), -.45, 2.05, 0, cap); place(box(1.1, .2, 1.85, SNOW, .09, .9), 1.35, 1.3, 0, cap); place(box(.9, .2, 1.85, SNOW, .09, .9), -1.6, 1.3, 0, cap); g.add(cap); cap.visible = !!o.cap;
  const bl = new THREE.Group(); const bm = M(o.blanket ?? BLK[0], .9);
  place(box(2.2, .07, 1.95, bm, .03), -.45, 2.0, 0, bl); const fd = box(.07, .95, 1.95, bm, .03); fd.rotation.z = -.75; place(fd, .84, 1.6, 0, bl);
  [-1, 1].forEach(z => place(box(1.9, .55, .06, bm, .02), -.45, 1.65, z * .97, bl));
  [-.6, 0, .6].forEach(z => place(box(2.22, .075, .14, C.cream, .02), -.45, 2.0, z, bl));
  g.add(bl); bl.visible = !!o.blanketOn;
  g.userData = { gm, ws, patch, cap, bl, setFrost: k => { gm.color.copy(GLASS).lerp(FROST, k); gm.emissiveIntensity = .25 * k; gm.roughness = lerp(.1, .35, k); } };
  g.userData.setFrost(o.frost ?? 1); g.scale.setScalar(s); return g;
}
export function scraper(s = 1, broken = false) {
  const g = new THREE.Group(); const a = new THREE.Group(), b = new THREE.Group(); g.add(a); g.add(b);
  place(cyl(.07, .07, .9, C.blue, 12, .4), 0, -.45, 0, a); place(box(.55, .14, .08, C.gold, .03), 0, .45, 0, b); place(cyl(.06, .06, .4, C.blue, 12, .4), 0, .2, 0, b);
  if (broken) { a.position.set(-.18, -.15, 0); a.rotation.z = .5; b.position.set(.25, .2, 0); b.rotation.z = -.6; }
  g.userData = { a, b }; g.scale.setScalar(s); return g;
}
export function mug(s = 1, col = C.red) {
  const g = new THREE.Group(); place(cyl(.24, .21, .44, col, 20, .4), 0, .22, 0, g); place(cyl(.2, .2, .02, 0x6b3a1e, 16, .6), 0, .43, 0, g);
  const h = mesh(new THREE.TorusGeometry(.12, .035, 8, 16), M(col, .4)); place(h, .27, .23, 0, g);
  const st = [0, 1, 2].map(() => { const p = sph(.07, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .9, transparent: true, opacity: .55, depthWrite: false })); p.castShadow = false; place(p, 0, .6, 0, g); return p; });
  g.userData.steam = t => st.forEach((p, i) => { const q = ((t * .8 + i / 3) % 1); p.position.set(Math.sin(q * 6 + i) * .08, .5 + q * .7, 0); p.scale.setScalar(.6 + q * 1.4); p.material.opacity = .55 * (1 - q); });
  g.scale.setScalar(s); return g;
}
function snowfall(w, n = 260, o = {}) {
  const m = new THREE.InstancedMesh(new THREE.SphereGeometry(.06, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: .35, roughness: .8 }), n); m.castShadow = false; m.frustumCulled = false; w.scene.add(m);
  const r = rand(o.seed || 5), D = []; for (let i = 0; i < n; i++) D.push([(r() - .5) * (o.wx || 34) + (o.cx || 0), r() * 13, (r() - .5) * (o.wz || 12) + (o.cz || 3), .6 + r() * .8, r() * 6]);
  return t => { D.forEach((p, i) => { const y = (((p[1] - t * p[3] * (o.sp || 1.4)) % 13) + 13) % 13; setI(m, i, p[0] + Math.sin(t * 1.3 + p[4]) * .3 + (o.wind || 0) * (13 - y), y, p[2], o.s || 1); }); doneI(m); };
}
function drone() {
  const g = new THREE.Group(); const bm = new THREE.MeshStandardMaterial({ color: 0xc9ced8, roughness: .35 });
  place(box(1.6, .55, 1.2, bm, .2), 0, 0, 0, g); const em = new THREE.MeshStandardMaterial({ color: 0x37c6ff, roughness: .2, emissive: 0x37c6ff, emissiveIntensity: 1.6 });
  [-.45, .45].forEach(x => place(sph(.1, em), x, .08, .6, g)); const lg = label('MEGA', .8, .28, { bg: RED, fg: '#fff', rad: 14 }); place(lg, 0, -.1, .62, g);
  const props = [[-.95, -.7], [.95, -.7], [-.95, .7], [.95, .7]].map(([x, z]) => { const arm = box(.75, .08, .1, C.grey, .03); arm.rotation.y = -Math.atan2(z, x); place(arm, x * .55, .3, z * .55, g); const p = new THREE.Group(); place(p, x, .42, z, g); place(box(.9, .03, .12, C.ink, .01), 0, 0, 0, p); place(cyl(.06, .06, .14, C.ink, 8), 0, -.06, 0, p); return p; });
  const air = mesh(new THREE.ConeGeometry(.9, 2.2, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0xff9a3c, emissive: 0xff7a1c, emissiveIntensity: .8, transparent: true, opacity: .28, side: THREE.DoubleSide, depthWrite: false })); air.castShadow = false; place(air, 0, -1.4, 0, g);
  const ic = new THREE.Group(); [-.6, -.2, .2, .6].forEach((x, i) => { const c = mesh(new THREE.ConeGeometry(.08, .35 + (i % 2) * .2, 8), M(0xdff2ff, .2)); c.rotation.x = Math.PI; place(c, x, -.45, (i % 2 ? .3 : -.3), ic); }); place(box(1.7, .12, 1.3, M(0xdff2ff, .25, 0, { transparent: true, opacity: .8 }), .06), 0, .3, 0, ic); g.add(ic); ic.visible = false;
  g.userData = { bm, em, props, air, ic, spin: t => props.forEach((p, i) => p.rotation.y = t * 40 + i), freeze: k => { bm.color.set(k ? 0xbfe3ff : 0xc9ced8); em.color.set(k ? 0x8fb8d8 : 0x37c6ff); em.emissive.set(k ? 0x1b3550 : 0x37c6ff); air.visible = !k; ic.visible = !!k; } };
  return g;
}
function iceCloud(n) { const m = new THREE.InstancedMesh(new THREE.BoxGeometry(.5, .5, .5), M(0xcfeaff, .15, 0, { transparent: true, opacity: .85 }), n); m.castShadow = true; m.frustumCulled = false; return m; }

// ---------- 2D overlays
function stamp2d(g, t, a, txt, y = 760, col = RED, fs = 130) {
  const p = prog(t, a, a + .22); if (p <= 0) return; const s = lerp(2.2, 1, eo(p)); g.save(); g.translate(540, y); g.rotate(-.12); g.scale(s, s); g.globalAlpha = Math.min(1, p * 2);
  g.font = `${fs}px "Archivo Black"`; g.textAlign = 'center'; g.textBaseline = 'middle'; const w = g.measureText(txt).width + 80;
  g.fillStyle = 'rgba(251,247,238,.92)'; g.beginPath(); g.roundRect(-w / 2, -fs * .73, w, fs * 1.46, 26); g.fill(); g.lineWidth = 14; g.strokeStyle = col; g.stroke(); g.fillStyle = col; g.fillText(txt, 0, 8); g.restore();
}
function sticky(g, t, a, lines, y = 700, small = null) {
  const p = prog(t, a, a + .2); if (p <= 0) return; const s = lerp(1.9, 1, eo(p)); const S = 600;
  g.save(); g.translate(540, y); g.rotate(.05); g.scale(s, s); g.globalAlpha = Math.min(1, p * 2.5);
  g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 36; g.shadowOffsetY = 16; g.fillStyle = NOTE; g.fillRect(-S / 2, -S / 2, S, S); g.shadowColor = 'transparent';
  g.fillStyle = 'rgba(0,0,0,.06)'; g.fillRect(-S / 2, S / 2 - 60, S, 60);
  g.save(); g.rotate(-.06); g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(-120, -S / 2 - 28, 240, 62); g.restore();
  g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle';
  let fs = 92; g.font = `${fs}px "Archivo Black"`; while (Math.max(...lines.map(l => g.measureText(l).width)) > S - 90) { fs *= .95; g.font = `${fs}px "Archivo Black"`; }
  lines.forEach((l, i) => g.fillText(l, 0, (i - (lines.length - 1) / 2) * fs * 1.15 - (small ? 40 : 0)));
  if (small) { g.font = '40px "Archivo Black"'; g.fillStyle = '#c7512b'; g.fillText(small, 0, S / 2 - 100); }
  g.restore();
}
function frostEdge(g, k) { if (k <= 0) return; const gr = g.createRadialGradient(W / 2, H * .45, H * .28, W / 2, H * .5, H * .7); gr.addColorStop(0, 'rgba(220,240,255,0)'); gr.addColorStop(1, `rgba(220,240,255,${.45 * k})`); g.fillStyle = gr; g.fillRect(0, 0, W, H); }

// ================= SCENES
// Marlo's frozen car at 7 AM (A), and the same car under a blanket today (R)
function frozenCar(again) {
  return () => {
    const w = wstreet({ signs: again ? SHOP : [], bg: again ? 0xd9ecf6 : 0xc7dbe8 }); if (again) lift(w);
    const c = car(C.red, 1.0, { frost: again ? 0 : 1, cap: !again, blanketOn: again, blanket: BLK[1] }); place(c, 1.0, 0, 2.2, w.scene); c.rotation.y = -.35;
    const m = MS(); place(m, -1.5, 0, 2.6, w.scene); m.rotation.y = .5;
    const ck = label(again ? '-10°' : '7:00 AM', again ? 1.6 : 2.2, .7, { bg: again ? ICE : CREAM }); place(ck, -1.0, 5.9, 1.5, w.scene);
    const fz = label('FROZEN', 2.2, .65, { bg: '#2e86ff', fg: '#fff' }); place(fz, 1.3, 3.0, 3.0, w.scene); fz.scale.setScalar(.85);
    const sn = snowfall(w, 220, { seed: again ? 9 : 3 });
    return { w, update(t, d) { tickGutter(w, t * .3); sn(t); popIn(ck, t, .04); const b = d * .42, on = t > b;
      if (!again) { stampIn(fz, t, b); m.pose({ mood: on ? 'shock' : 'neutral', armL: on ? [2.3, .35] : [.3, .2], armR: on ? [2.3, .35] : [.3, .2], head: [.25, 0, 0], look: [.6, .1], lift: on ? Math.exp(-(t - b) * 6) * .25 : 0, blink: blinkAt(t) }); }
      else { fz.visible = false; m.pose({ mood: 'smug', ...crossed, head: [.3, -.05, 0], look: [.5, 0], blink: blinkAt(t) }); }
      camTo(w, [-.2, 3.7, 18], [-.2, 3.5, 16.6], [-.2, 2.5, 2.5], [-.2, 2.5, 2.5], eio(t / d), (!again && on && t < b + .25) ? .03 : 0, t); },
      overlay(g, t, d) { if (!again) frostEdge(g, .8); } };
  };
}
F.A = frozenCar(false); F.R = frozenCar(true);

F.A2 = () => {
  const w = world(0x27406e, { floor: 0x33548a, env: .7, sun: 2.5, sh: 16 }); const n = 170, r = rand(6);
  const km = iceCloud(n); w.scene.add(km);
  for (let i = 0; i < n; i++) { const a = r() * 6.28, q = Math.sqrt(r()), ra = q * 8, y = (1 - q) * 3.4 + r() * .3, x = Math.cos(a) * ra, z = Math.sin(a) * ra - 1; setI(km, i, x, y + .2, z, 1.2, r() * 6, r() * 6.28); }
  km.instanceMatrix.needsUpdate = true;
  const m = MS(); place(m, 0, 3.7, 0, w.scene);
  const N = 46, ms = new THREE.InstancedMesh(new THREE.SphereGeometry(.28, 18, 12), M(C.gold, .14, .55), N); ms.castShadow = true; ms.frustumCulled = false; w.scene.add(ms);
  const Dd = []; for (let i = 0; i < N; i++) Dd.push({ x: (r() - .5) * 7, z: (r() - .5) * 3 - 1.5, o: r() * 1.5, sp: 6 + r() * 4 });
  return { w, update(t, d) {
    Dd.forEach((p, i) => { const y = 16 - ((t + p.o) % 2.2) * p.sp; setI(ms, i, p.x, y < .3 ? -9 : y, p.z); }); doneI(ms);
    m.pose({ mood: 'happy', armL: [2.4, .55 + Math.sin(t * 9) * .12], armR: [2.4, .55 - Math.sin(t * 9) * .12], lift: Math.abs(Math.sin(t * 7)) * .22, head: [0, -.08, 0] });
    camTo(w, [0, 6, 21], [0, 6.8, 16.5], [0, 6.2, 0], [0, 7.1, 0], eo(t / d));
  } };
};

// close-up: scraping the windshield with a library card (B), still scraping 20 minutes later (C)
function scrapeScene(late) {
  return () => {
    const w = wstreet({ bg: 0xc7dbe8 }); const c = car(C.red, 1.3, { frost: 1, cap: true }); c.rotation.y = -Math.PI / 2; place(c, .4, 0, 1.2, w.scene);
    const { patch } = c.userData; patch.visible = true;
    const m = MS(); place(m, 2.0, 0, 2.1, w.scene); m.rotation.y = -1.15;
    const cd = label('LIBRARY\nCARD', .55, .4, { bg: '#2e86ff', fg: '#fff', rad: 6 }); w.scene.add(cd);
    const tg = label(late ? '7:00 AM' : 'LIBRARY CARD', late ? 2.2 : 2.9, .7, { bg: late ? CREAM : GOLD }); place(tg, 1.0, 4.95, 1.0, w.scene);
    const sn = snowfall(w, 160, { seed: 4, wx: 14, cz: 3 });
    return { w, update(t, d) { sn(t); popIn(tg, t, late ? .03 : d * .45);
      if (late) { const mins = Math.min(20, Math.floor(prog(t, .1, d * .6) * 4) * 5); tg.userData.set('7:' + String(mins).padStart(2, '0') + ' AM'); }
      const k = late ? lerp(.6, 1, prog(t, 0, d * .6)) : lerp(.05, .45, prog(t, 0, d)); patch.scale.set(1, k, k);
      const sw = Math.sin(t * (late ? 9 : 14)); cd.position.set(.4 + sw * .45, 2.05 + Math.cos(t * 7) * .1, 2.55); cd.rotation.set(-.5, 0, .3 + sw * .2);
      m.pose({ mood: late ? (t > d * .6 ? 'stare' : 'sad') : 'neutral', armR: [1.5 + sw * .15, -.25], armL: [.3, .2], head: [.35, .25, 0], look: [.6, -.3], lean: .1, blink: blinkAt(t) });
      camTo(w, [1.15, 3.9, 13.4], [1.15, 3.7, 12.4], [1.05, 2.7, 1.5], [1.05, 2.7, 1.5], eio(t / d)); },
      overlay(g, t, d) { frostEdge(g, late ? .9 : .7); if (late) stamp2d(g, t, d * .62, 'BARELY', 1520, '#2e86ff', 120); } };
  };
}
F.B = scrapeScene(false); F.C = scrapeScene(true);

F.D = () => {
  const w = world(0xd9c7a8, { floor: 0x8a6a4c, env: .8, sun: 2.0, sh: 12 }); place(box(40, 16, .3, 0xb6d9ef, .02, .9), 0, 8, -3.4, w.scene);
  const ck = label('9:20', 1.6, .8, { bg: CREAM, border: RED }); place(ck, -1.5, 5.4, -3.2, w.scene);
  place(box(3.8, .16, 1.8, 0x8a5a35, .04, .6), 1.4, 1.75, -1.4, w.scene); place(box(3.6, 1.6, 1.6, 0x6f4326, .05), 1.4, .85, -1.4, w.scene);
  const bs = townsperson(6, { top: 0x3a3a48, style: 'short', hair: 0xb7b7bf }); place(bs, 1.4, 0, -2.6, w.scene);
  const bill = label('LATE\n-$50', 1.1, 1.1, { bg: CREAM, fg: RED, rad: 6 }); hold(bs, bill, 2.6, 1.3);
  const m = MS(); place(m, -1.6, 0, -.4, w.scene); m.rotation.y = .5;
  return { w, update(t, d) { const b = d * .3, on = t > b; popIn(ck, t, .02); popIn(bill, t, d * .2);
    bs.pose({ mood: 'smug', armL: [1.6, .1], armR: [1.6, .1], head: [-.2, 0, 0] });
    m.pose({ mood: on ? 'shock' : 'sad', armL: on ? [2.5, .4] : [.3, .2], armR: on ? [2.5, .4] : [.3, .2], lift: on ? Math.exp(-(t - b) * 6) * .25 : 0, head: [.3, .05, 0], look: [.6, 0] });
    camTo(w, [0, 3.7, 12.8], [0, 3.6, 11.6], [0, 2.9, -1.5], [0, 2.8, -1.5], t / d, on && t < b + .3 ? .04 : 0, t); },
    overlay(g, t, d) { stamp2d(g, t, d * .32, '-$50', 1520, RED, 150); } };
};

// a neighbour scraping their car
const scrapePose = (p, t, ph = 0, mood = 'sad') => p.pose({ mood, armR: [1.5 + Math.sin(t * 13 + ph) * .25, .1], armL: [.3, .15], lean: .12, head: [0, .2, 0] });
F.E = () => {
  const w = wstreet(); const c = car(CARC[1], 1.0, { frost: 1, cap: true }); place(c, HX(4), 0, CARZ, w.scene);
  const nb = townsperson(4); place(nb, HX(4) + .2, 0, CARZ - 2.0, w.scene); const sc = scraper(.8); hold(nb, sc, 1.6, 1.1); sc.rotation.x = 1.2;
  const lk = label('FROZEN', 2.2, .65, { bg: '#2e86ff', fg: '#fff' }); place(lk, HX(4) + .6, 4.2, CARZ, w.scene);
  const m = MS(); place(m, HX(4) - 3.0, 0, 4.2, w.scene); m.rotation.y = .8; const sn = snowfall(w, 200, { cx: HX(4) });
  return { w, update(t, d) { tickGutter(w, t * .5); sn(t); stampIn(lk, t, d * .4); scrapePose(nb, t);
    m.pose({ mood: 'stare', head: [.3, 0, 0], look: [.6, 0], blink: blinkAt(t), ...crossed });
    camTo(w, [HX(4) - 1.0, 3.9, 18], [HX(4) - .9, 3.8, 16.8], [HX(4) - .9, 2.6, 1.5], [HX(4) - .9, 2.6, 1.5], t / d); },
    overlay(g) { frostEdge(g, .5); } };
};

F.E2 = () => {
  const w = wstreet({ sh: 34, far: 150 }); const idx = [1, 2, 4, 5, 6];
  const ps = idx.map((h, i) => { const c = car(CARC[(i + 2) % 7], 1.0, { frost: 1, cap: true }); place(c, HX(h), 0, CARZ, w.scene); const p = townsperson(i + 2); place(p, HX(h) + .2, 0, CARZ - 2, w.scene); const s = scraper(.8); hold(p, s, 1.6, 1.1); s.rotation.x = 1.2; const l = label('FROZEN', 2.4, .7, { bg: '#2e86ff', fg: '#fff' }); place(l, HX(h), 4.6, CARZ, w.scene); return [p, l]; });
  const m = MS(); place(m, 0, 0, -1.2, w.scene); const sn = snowfall(w, 320, { wx: 60 });
  return { w, update(t, d) { tickGutter(w, t * .5); sn(t); ps.forEach(([p, l], i) => { const a = .05 + [2, 1, 0, 3, 4][i] * d * .13; stampIn(l, t, a, 1.3); scrapePose(p, t, i); });
    m.pose({ mood: 'shock', head: [Math.sin(t * 2.4) * .45, -.1, 0], armL: [.2, .25], armR: [.2, .25] });
    camTo(w, [0, 4, 16], [0, 7, 34], [0, 3.4, -1], [0, 4, -2], eio(t / d)); } };
};

function marbleScene(second, hitF = .44) {
  return () => {
    const w = wstreet({ bg: second ? 0xf9d7a0 : 0xc7dbe8, signs: second ? SHOP : [] }); lift(w); const m = MS(); place(m, 0, 0, -1, w.scene);
    const mb = marble(.4); w.scene.add(mb); const j = jar(40); place(j, 2.3, 0, -.6, w.scene); j.scale.setScalar(.95); const glow = new THREE.PointLight(C.gold, 0, 16); place(glow, 0, 5, 1, w.scene);
    return { w, update(t, d) {
      tickGutter(w, t); const hit = Math.min(d - .9, d * hitF), jarT = hit + .6;
      let x = 0, y, z = -.8; if (t < hit) { y = lerp(15, 4.2, (t / hit) ** 2); } else { const T = t - hit, f = clamp(T / .6); x = lerp(0, 2.3, f); y = lerp(4.2, 1.8, f * f) + Math.sin(f * Math.PI) * 2.1; z = lerp(-.8, -.6, f); }
      mb.visible = t < jarT + .02; mb.position.set(x, y, z); j.userData.setN((second ? 38 : 28) + (t > jarT ? 1 : 0));
      const after = t > hit; glow.intensity = after ? 120 * Math.exp(-(t - hit) * 2.2) : 0;
      const sq = after ? 1 + Math.sin(clamp((t - hit) / .22) * Math.PI) * -.09 : 1; m.children[0].scale.set(1 / sq, sq, 1 / sq);
      m.pose({ mood: after ? (second ? 'happy' : 'idea') : (second ? 'smug' : 'stare'), head: after ? [0, -.1, 0] : [0, .02, 0], armL: after ? [2.2, .35] : [0, .12], armR: after ? [.5, .9] : [0, .12], lift: after ? Math.exp(-(t - hit) * 3.5) * .3 : 0, look: after ? [0, 0] : [0, 1] });
      camTo(w, [1, 3.4, 14.2], [1, 3.6, 12.6], [1, 3.2, -1], [1, 3.3, -1], eio(t / d), (after && t < hit + .24) ? .035 : 0, t);
    }, overlay(g, t, d) { const hit = Math.min(d - .9, d * hitF); const f = 1 - prog(t, hit, hit + .18); if (t > hit && f > 0) { g.fillStyle = `rgba(255,236,170,${f * .55})`; g.fillRect(0, 0, W, H); } } };
  };
}
F.F = marbleScene(false, .5); F.L = marbleScene(true, .64);

// nobody wants to, everyone has to
F.G = () => {
  const w = wstreet(); const c = car(CARC[3], 1.0, { frost: 1, cap: true }); place(c, 1.3, 0, CARZ, w.scene);
  const p = townsperson(5, { top: 0x9bc53d }); place(p, 1.5, 0, CARZ - 1.9, w.scene); const s = scraper(.8); hold(p, s, 1.6, 1.1); s.rotation.x = 1.2;
  const m = MS(); place(m, -1.6, 0, 4.0, w.scene); m.rotation.y = .6;
  const a = label('NOBODY WANTS TO', 3.6, .7, { bg: RED, fg: '#fff' }), b = label('EVERYONE HAS TO', 3.6, .7, { bg: GOLD }); place(a, 0, 6.6, 1, w.scene); place(b, 0, 5.75, 1.1, w.scene);
  const ck = label('7 AM', 1.6, .65, { bg: CREAM }); place(ck, 1.5, 4.25, CARZ - 1.9, w.scene); const sn = snowfall(w, 200);
  return { w, update(t, d) { tickGutter(w, t * .4); sn(t); popIn(ck, t, .03); stampIn(a, t, d * .08); stampIn(b, t, d * .6); scrapePose(p, t, 0, t > d * .6 ? 'sad' : 'stare');
    m.pose({ mood: t > d * .6 ? 'idea' : 'stare', armR: t > d * .6 ? [2.6, .1] : [.3, .2], armL: [.3, .2], head: [.3, -.1, 0], look: [.6, .2], blink: blinkAt(t) });
    camTo(w, [0, 4.4, 19], [0, 4.4, 17.8], [0, 3.6, 1.5], [0, 3.7, 1.5], eio(t / d)); } };
};

F.H = () => {
  const w = wstreet({ signs: SHOP }); lift(w); const sg = w.houses[3].userData.sign; const m = MS(); place(m, -1.8, 0, -1.2, w.scene); m.rotation.y = .4;
  const sc = scraper(1); hold(m, sc, 2.9, .6); sc.rotation.z = -.3;
  const cs = [0, 1, 2].map(i => { const c = car(CARC[i + 1], .9, { frost: 1, cap: true }); place(c, 1.5 + i * 4.2, 0, CARZ + .3, w.scene); return c; });
  const pr = label('$3 / CAR', 2.6, .8, { bg: GOLD }); place(pr, 2.0, 4.0, -1.6, w.scene); pr.rotation.z = -.06;
  const tag = label('BEFORE YOU WAKE UP', 4.8, .9, { bg: PINK }); place(tag, .4, 7.5, -1.6, w.scene); const sn = snowfall(w, 160);
  return { w, update(t, d) {
    tickGutter(w, t); sn(t); stampIn(sg, t, d * .06); popIn(tag, t, d * .38); stampIn(pr, t, d * .78);
    cs.forEach((c, i) => { const k = 1 - prog(t, d * (.35 + i * .12), d * (.45 + i * .12)); c.userData.setFrost(k); c.userData.cap.visible = k > .5; });
    m.pose({ mood: 'happy', armR: t < d * .1 ? [2.6, .2] : [2.0, .4], armL: [.4, .35], head: t < d * .1 ? [0, -.28, 0] : [.25, 0, 0], look: t < d * .1 ? [0, 1] : [.5, 0], blink: blinkAt(t) });
    camTo(w, [.4, 4.3, 18], [.4, 4.6, 19], [.4, 4.3, -.5], [.4, 4.5, -.5], eio(t / d));
  } };
};

// a lot of 200 cars clearing one by one
function lot() {
  const w = world(0xd3e4ef, { floor: 0xeef4f8, env: .85, sun: 2.4, sh: 30, far: 140 }); const cols = 20, rows = 10, n = cols * rows;
  const body = new THREE.InstancedMesh(new THREE.BoxGeometry(1.6, .6, 1.1), M(0xffffff, .4), n), top = new THREE.InstancedMesh(new THREE.BoxGeometry(.95, .45, 1.0), M(0xffffff, .25), n);
  [body, top].forEach(x => { x.castShadow = true; x.frustumCulled = false; w.scene.add(x); }); const col = new THREE.Color(); const pos = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const x = -19 + c * 2, z = -16 + r * 1.75; pos.push([x, z]); const i = pos.length - 1; setI(body, i, x, .4, z, 1, 0, 0); body.setColorAt(i, col.set(CARC[(i * 3) % 7])); setI(top, i, x - .1, .92, z, 1, 0, 0); top.setColorAt(i, col.set(0xe6f3ff)); }
  body.instanceColor.needsUpdate = top.instanceColor.needsUpdate = true; doneI(body); doneI(top);
  return { w, top, pos, n, col };
}
F.I = () => {
  const { w, top, pos, n, col } = lot(); const cnt = label('0 CARS', 3.4, 1, { bg: CREAM }); place(cnt, 0, 7.4, -2, w.scene);
  const m = MS(); place(m, 0, 0, 3.0, w.scene); const ord = pos.map((p, i) => i).sort((a, b) => (pos[b][1] - pos[a][1]) || (Math.abs(pos[a][0]) - Math.abs(pos[b][0])));
  return { w, update(t, d) { let k = 0; ord.forEach((i, j) => { const a = .05 + j * (d * .8 / n); const on = t > a; if (on) k++; top.setColorAt(i, col.set(on ? 0x22324f : 0xe6f3ff)); }); top.instanceColor.needsUpdate = true;
    cnt.userData.set(k + ' CARS'); m.pose({ mood: 'happy', armL: [2.3, .5], armR: [2.3, .5], lift: Math.abs(Math.sin(t * 6)) * .1 });
    camTo(w, [0, 9.5, 17], [0, 10.5, 16], [0, 2.5, -4], [0, 2.5, -5], t / d); } };
};

F.J = () => {
  const w = winterize(street({ ...NIGHT, signs: SHOP })); lift(w); doorLight(w);
  const cs = [-1, 1].map(i => { const c = car(CARC[i + 2], 1.0, { frost: 1, cap: true }); place(c, i * 3.4, 0, CARZ, w.scene); return c; });
  const th = label('-30°', 1.8, .8, { bg: ICE }); place(th, -1.6, 6.2, -1, w.scene); const m = MS(); place(m, 0, 0, 1.0, w.scene);
  const sn = snowfall(w, 520, { sp: 3.2, wind: .35, cx: -3, s: 1.4 });
  return { w, update(t, d) { tickGutter(w, t * .2); sn(t); const b = d * .3, on = t > b; stampIn(th, t, b);
    cs.forEach(c => { c.userData.cap.scale.y = 1 + prog(t, 0, d) * 2.5; });
    m.pose({ mood: on ? 'shock' : 'stare', armL: on ? [2.6, .4] : [.3, .2], armR: on ? [2.6, .4] : [.3, .2], head: [0, -.1, 0], lift: on ? Math.exp(-(t - b) * 6) * .3 : 0 });
    camTo(w, [0, 4.4, 19], [0, 4.2, 17.6], [0, 3.1, -.5], [0, 3.0, -.5], t / d, on ? .03 : 0, t); },
    overlay(g, t, d) { frostEdge(g, .9); stamp2d(g, t, d * .45, 'BIG FREEZE', 1500, '#2e86ff', 120); } };
};

F.J2 = () => {
  const w = winterize(street({ ...NIGHT, signs: SHOP })); lift(w); doorLight(w);
  [-2, -1, 1, 2].forEach(i => { const c = car(CARC[(i + 5) % 7], 1.0, { frost: 1, cap: true }); c.userData.cap.scale.y = 3.2; place(c, i * 4.0, 0, CARZ - 1.6, w.scene); });
  const m = MS(); place(m, 0, 0, 1.4, w.scene); const s1 = scraper(1.1), s2 = scraper(1.1, true); hold(m, s1, 2.4, .9); hold(m, s2, 2.4, .9);
  const qs = [[-2.3, 4.4, '?'], [2.3, 5.0, '??']].map(([x, y, s]) => { const l = label(s, .9, .9, { bg: CREAM }); place(l, x, y, 1.6, w.scene); return l; });
  const sn = snowfall(w, 300, { sp: 2.2, wind: .2 });
  return { w, update(t, d) { sn(t); const b = d * .25, on = t > b; s1.visible = !on; s2.visible = on; qs.forEach((l, i) => popIn(l, t, b + .2 + i * .15));
    m.pose({ mood: on ? 'shock' : 'neutral', armL: on ? [1.3, .3] : [.3, .2], armR: on ? [1.3, .3] : [1.0, .1], head: [Math.sin(t * 9) * (on ? .2 : 0), .15, 0], look: [0, .6], lift: on ? Math.abs(Math.sin(t * 8)) * .05 : 0 });
    camTo(w, [0, 5.4, 12.5], [0, 5.6, 11.5], [0, 2.8, .5], [0, 2.8, .5], t / d, on && t < b + .3 ? .05 : 0, t); },
    overlay(g, t, d) { frostEdge(g, .9); stamp2d(g, t, d * .25, 'SNAP!', 1500, RED, 140); } };
};

// all night: a blanket over every windshield
F.K = () => {
  const w = winterize(street({ ...NIGHT, signs: SHOP })); lift(w); const m = MS(); w.scene.add(m); const xs = [-6, -1, 4, 9, 14];
  const cs = xs.map((x, i) => { const c = car(CARC[(i + 1) % 7], 1.0, { frost: 1, cap: false, blanket: BLK[i % 6] }); place(c, x, 0, CARZ, w.scene); return c; });
  [-1, 4, 9].forEach(x => { const p = new THREE.PointLight(0xffc47a, 10, 10); place(p, x, 4.4, 1, w.scene); });
  const ck = label('3 AM', 1.6, .6, { bg: CREAM }); w.scene.add(ck); const sn = snowfall(w, 200, { cx: 4, wx: 40 });
  const x0 = -8.5, x1 = 12;
  return { w, update(t, d) { sn(t); tickGutter(w, t * .4); const x = lerp(x0, x1, t / d); m.position.set(x, 0, CARZ + 2.1); m.rotation.y = 1.3;
    cs.forEach((c, i) => { const a = (xs[i] + .5 - x0) / (x1 - x0) * d; const bl = c.userData.bl; const p = prog(t, a, a + .25); bl.visible = p > 0; bl.position.y = lerp(1.2, 0, eo(p)); });
    m.pose({ walk: t * 10, mood: 'happy', armR: [1.35, .1], armL: [1.35, .1], lean: .05, head: [-.35, 0, 0], blink: blinkAt(t) });
    ck.position.set(x - 1.6, 6.4, CARZ); popIn(ck, t, .05);
    camTo(w, [x - 1, 4.4, 19.5], [x - .9, 4.4, 19], [x - .5, 2.9, CARZ], [x - .4, 2.9, CARZ], t / d); } };
};

F.K2 = () => {
  const w = wstreet({ ...DAWN, signs: SHOP }); lift(w); const xs = [-2.6, 2.6, 7.8];
  const cs = xs.map((x, i) => { const c = car(CARC[(i + 1) % 7], 1.0, { frost: 0, blanketOn: true, blanket: BLK[i] }); place(c, x, 0, CARZ, w.scene); return c; });
  const m = MS(); place(m, 0, 0, .2, w.scene); const ok = label('NO ICE', 2.2, .7, { bg: GREEN, fg: '#fff' }); place(ok, 1.5, 4.3, CARZ + .3, w.scene);
  return { w, update(t, d) { tickGutter(w, t); cs.forEach((c, i) => { const a = .1 + i * d * .15, p = prog(t, a, a + .5); const bl = c.userData.bl; bl.position.set(lerp(0, -1, p), eo(p) * 4, 0); bl.rotation.z = p * .6; bl.visible = p < .98; }); stampIn(ok, t, d * .6);
    m.pose({ mood: t > d * .6 ? 'happy' : 'smug', armL: t > d * .6 ? [2.4, .5] : [.3, .2], armR: t > d * .6 ? [2.4, .5] : [.3, .2], head: [0, -.05, 0], lift: t > d * .6 ? Math.abs(Math.sin(t * 7)) * .12 : 0, blink: blinkAt(t) });
    camTo(w, [0, 4.6, 19], [0, 4.4, 17.6], [0, 3.0, .5], [0, 3.0, .5], t / d); } };
};

F.M = () => {
  const w = wstreet({ ...DAWN, signs: SHOP }); lift(w); const c = car(CARC[2], 1.0, { frost: 0, blanketOn: true, blanket: BLK[1] }); place(c, HX(2), 0, CARZ, w.scene);
  const cup = mug(1.1); place(cup, HX(2) + 1.3, 1.67, CARZ, w.scene);
  const nb = townsperson(4); place(nb, HX(2) - 1, 0, -2.4, w.scene); nb.rotation.y = .6; const nm = mug(.8, C.blue); hold(nb, nm, 1.75, .9);
  const m = MS(); w.scene.add(m); const tray = new THREE.Group(); place(box(1.4, .08, .8, 0xc9ced8, .03, .3), 0, 0, 0, tray); const tm = [-.4, 0, .4].map((x, i) => { const g = mug(.6, [C.red, C.gold, C.green][i]); place(g, x, .04, 0, tray); return g; }); hold(m, tray, 2.1, 1.0);
  const tl = label('WARM START', 3.4, .8, { bg: GOLD }); w.scene.add(tl);
  return { w, update(t, d) { tickGutter(w, t * .6); cup.userData.steam(t); nm.userData.steam(t + .3); tm.forEach((g, i) => g.userData.steam(t + i * .2));
    const x = lerp(2.5, HX(2) + 3.2, eio(prog(t, 0, d * .8))); m.position.set(x, 0, -1.0); m.rotation.y = -1.3;
    m.pose({ walk: t * 12, mood: 'happy', armR: [1.35, .1], armL: [1.35, .1], lean: .08, head: [.35, 0, 0], blink: blinkAt(t) });
    tl.position.set(HX(2) + 1.4, 6.6, -1); stampIn(tl, t, .1); nb.pose({ mood: 'happy', armL: [1.6, .1], armR: [.2, .1], head: [0, -.1, 0] });
    camTo(w, [HX(2) + 1.6, 4.3, 17.5], [HX(2) + 1.5, 4.2, 16.3], [HX(2) + 1.4, 3.1, 0], [HX(2) + 1.3, 3.1, 0], t / d); } };
};

F.M2 = () => {
  const w = wstreet({ signs: SHOP, sh: 26 }); lift(w); const m = MS(); place(m, -1.2, 0, -.8, w.scene);
  const a = label('$3', 2.2, 1.1, { bg: CREAM }), b = label('$5', 2.6, 1.3, { bg: GOLD }), fr = label('A WEEK', 3.2, .8, { bg: RED, fg: '#fff' }); place(a, 1.6, 6.2, -.8, w.scene); place(b, 1.6, 6.2, -.7, w.scene); place(fr, 1.6, 5.05, -.7, w.scene);
  const ms = [0, 1, 2, 3, 4].map(i => { const p = townsperson(i + 3); place(p, 3 + i * 1.8, 0, -.4, w.scene); p.rotation.y = -1.57; const k = mug(.7, [C.red, C.blue, C.gold, C.green, C.red][i]); hold(p, k, 1.75, .9); p.pose({ mood: 'happy', armL: [1.6, .1], armR: [.2, .1] }); return k; });
  return { w, update(t, d) { tickGutter(w, t); ms.forEach((k, i) => k.userData.steam(t + i * .3)); popIn(a, t, .05); const sw = d * .28; a.visible = t < sw; stampIn(b, t, sw); popIn(fr, t, d * .4); m.pose({ mood: t > d * .5 ? 'smug' : 'happy', armL: [.2, .35], armR: [.2, .35], head: [0, -.08, 0], blink: blinkAt(t) }); camTo(w, [1.6, 4.4, 17], [1.6, 4.4, 15.5], [1.6, 3.8, -1], [1.6, 3.8, -1], t / d); },
    overlay(g, t, d) { stamp2d(g, t, d * .5, 'SOLD OUT', 900); } };
};

F.N = () => {
  const w = wstreet({ signs: SHOP }); lift(w); const c = car(CARC[4], 1.0, { frost: 1, cap: true }); place(c, HX(4), 0, CARZ, w.scene); const dr = drone(); w.scene.add(dr);
  const m = MS(); place(m, HX(4) - 2.9, 0, .6, w.scene); m.rotation.y = .9; const pr = label('DEFROST DRONE', 3.0, .7, { bg: RED, fg: '#fff' }); place(pr, HX(4) - .9, 7.4, CARZ - 1, w.scene);
  const ph = label('HOT AIR\nFROM THE SKY', 2.4, 1.1, { bg: INK, fg: '#fff', rad: 30, border: '#e4572e' }); place(ph, HX(4) - 2.6, 4.6, 1.2, w.scene);
  return { w, update(t, d) { tickGutter(w, t); dr.userData.spin(t); const q = eo(prog(t, .05, d * .45)); dr.position.set(lerp(HX(4) + 8, HX(4) + .3, q), lerp(8, 4.6, q) + Math.sin(t * 4) * .12, CARZ); dr.rotation.z = (1 - q) * .25;
    const melt = prog(t, d * .5, d); c.userData.setFrost(1 - melt * .6); c.userData.cap.scale.y = 1 - melt * .6; stampIn(pr, t, d * .25); popIn(ph, t, d * .6);
    m.pose({ mood: t > d * .45 ? 'stare' : 'neutral', head: [.4, -.2, 0], look: [.6, .5], armL: [.2, .2], armR: [.2, .2], blink: blinkAt(t) }); camTo(w, [HX(4) - 1.0, 4.6, 20], [HX(4) - 1.0, 4.6, 18.8], [HX(4) - 1.0, 3.9, 0], [HX(4) - 1.0, 3.9, 0], t / d); } };
};

F.N2 = () => {
  const w = wstreet({ signs: SHOP, sh: 30 }); lift(w); const xs = [-8.1, -2.7, 2.7, 8.1];
  const cs = xs.map((x, i) => { const c = car(CARC[(i + 3) % 7], 1.0, { frost: 1, cap: true }); place(c, x, 0, CARZ, w.scene); return c; });
  const ds = xs.map(x => { const d = drone(); place(d, x, 5.4, CARZ, w.scene); return d; });
  const ps = [0, 1].map(i => { const p = townsperson(i + 5); place(p, [-5.4, 5.4][i], 0, -.6, w.scene); return p; });
  const fallT = Math.sqrt((5.4 - 2.6) / 9.8);
  return { w, update(t, d) { tickGutter(w, t); const b = d * .3, off = t > b;
    ds.forEach((dr, i) => { dr.userData.freeze(off); if (!off) dr.userData.spin(t); const fT = t - b - .25 - i * .08; const y = fT > 0 ? Math.max(2.6, 5.4 - 9.8 * fT * fT) : 5.4 + Math.sin(t * 4 + i) * .1; dr.position.y = y; dr.rotation.z = off ? (y <= 2.61 ? .18 * (i % 2 ? 1 : -1) : Math.sin(t * 30) * .05) : 0; });
    cs.forEach((c, i) => { const hitT = b + .25 + i * .08 + fallT; const k = t > hitT ? Math.exp(-(t - hitT) * 10) : 0; c.position.y = -k * .15; });
    ps.forEach((p, i) => p.pose({ mood: off ? 'shock' : 'neutral', armL: off ? [2.5, .4] : [.2, .1], armR: off ? [2.5, .4] : [1.4, .05], lift: off ? Math.abs(Math.sin(t * 8 + i)) * .08 : 0 }));
    camTo(w, [0, 4.6, 20], [0, 5.6, 25], [0, 3.2, 0], [0, 3.4, 0], t / d, off && t > b + .5 && t < b + .9 ? .05 : 0, t); },
    overlay(g, t, d) { stamp2d(g, t, d * .42, 'FROZEN SOLID', 1500, '#2e86ff', 110); } };
};

F.O = () => {
  const w = wstreet({ ...DAWN, signs: SHOP }); lift(w); const m = MS(); place(m, -.9, 0, -2.6, w.scene); m.rotation.y = .6;
  const ws = [0, 1, 2, 3, 4, 5].map(i => { const p = i === 0 ? person(BOSS) : townsperson(i + 1, { top: 0x3a3a48 }); w.scene.add(p); const lg = label('MEGA', .8, .3, { bg: RED, fg: '#fff', rad: 14 }); place(lg, 0, 1.75, .56, p); return p; });
  const lb = label('MEGASOCK STAFF', 3.2, .7, { bg: RED, fg: '#fff' }); w.scene.add(lb);
  return { w, update(t, d) { tickGutter(w, t); const q = eio(prog(t, 0, d * .65));
    ws.forEach((p, i) => { p.position.set(lerp(9 + i * 1.6, .9 + i * 1.45, q), 0, -2.2); p.rotation.y = -1.57; p.pose({ walk: q < .98 ? t * 9 + i : undefined, mood: 'sad', armL: [.2, .1], armR: [.2, .1], head: [0, .1, 0] }); });
    lb.position.set(ws[1].position.x, 4.3, -2.0); popIn(lb, t, .15);
    m.pose({ mood: 'smug', ...crossed, head: [.4, 0, 0], look: [.6, 0], blink: blinkAt(t) }); camTo(w, [1.4, 4.2, 16.5], [1.3, 4, 15.2], [1.4, 3.0, -1.8], [1.3, 3.0, -1.8], t / d); } };
};

F.Q = () => {
  const w = wstreet({ signs: ALL, sh: 40, far: 150 }); lift(w);
  const m = MS(); place(m, 0, 0, -2.6, w.scene); const n = 16, ms = []; for (let i = 0; i < n; i++) { const p = townsperson(i + 2); place(p, 2 + i * 1.55, 0, -.9, w.scene); p.rotation.y = -1.57; const k = mug(.65, CARC[i % 7]); hold(p, k, 1.75, .9); ms.push(k); p.pose({ mood: 'happy', armL: [1.6, .1], armR: [.2, .1], head: [0, 0, 0] }); }
  const wl = label('WAITING LIST', 4.2, .9, { bg: GOLD }); place(wl, 13, 5.6, -.9, w.scene); const sn = snowfall(w, 300, { wx: 70, cx: 10 });
  return { w, update(t, d) { tickGutter(w, t * 2); sn(t); ms.forEach((k, i) => k.userData.steam(t + i * .2)); popIn(wl, t, d * .35); m.pose({ mood: 'happy', armL: [2.3, .55], armR: [2.3, .55], head: [0, -.05, 0], lift: Math.abs(Math.sin(t * 5)) * .15 }); camTo(w, [0, 3.6, 13], [6, 10, 38], [0, 3.6, -2], [6, 4.5, -2], eio(t / d)); } };
};

// one blanket off: a clear windshield, zero minutes late
F.S = () => {
  const w = wstreet({ bg: 0xd9ecf6, signs: SHOP }); lift(w); const c = car(C.red, 1.0, { frost: 0, blanketOn: true, blanket: BLK[1] }); place(c, 1.0, 0, 2.2, w.scene); c.rotation.y = -.35;
  const m = MS(); place(m, -1.5, 0, 2.6, w.scene); m.rotation.y = .5; let sw = 1; const sn = snowfall(w, 160, { seed: 9 });
  return { w, update(t, d, P) { tickGutter(w, t * .4); sn(t); sw = P ? P('S2', 0) : d * .33; const p = prog(t, sw, sw + .5); const bl = c.userData.bl;
    bl.position.set(lerp(0, -1.5, p), eo(p) * 4.5, 0); bl.rotation.z = p * .9; bl.visible = p < .98;
    m.pose({ mood: 'happy', armR: t < sw ? [.3, .2] : [2.5, .3], armL: [.3, .2], head: [.25, t < sw ? -.1 : -.05, 0], look: [.5, 0], lift: t < sw ? Math.abs(Math.sin(t * 14)) * .08 : 0, blink: blinkAt(t) });
    camTo(w, [.1, 3.8, 17.5], [.1, 3.7, 16.2], [.1, 2.6, 2.5], [.1, 2.6, 2.5], eio(t / d)); },
    overlay(g, t, d) { sticky(g, t, sw + .5, ['1 BLANKET', '0 SCRAPING', '0 MIN LATE'], 680, 'NO SCRAPER NEEDED'); } };
};

F.Z = recap(['FROZEN CAR AT 7 AM', 'CLEAR CARS BEFORE DAWN, $3', '$1,000,000'], ALL);
