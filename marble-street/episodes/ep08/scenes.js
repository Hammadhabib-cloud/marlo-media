import * as THREE from 'three';
import { recap } from './recap.js';
import { C, M, W, H, world, box, cyl, sph, mesh, place, prog, eio, eo, back, lerp, clamp, camTo, label, setI, doneI, rand, belt } from './world.js';
import { marlo, person } from './marlo.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { jar, marble, street, tickGutter, townsperson, PAT } from './sets.js';

const popIn = (o, t, a, s = 1, dur = .35) => { const p = prog(t, a, a + dur); o.visible = p > 0; o.scale.setScalar(Math.max(.0001, back(p) * s)); };
const stampIn = (o, t, a, s = 1) => { const p = prog(t, a, a + .24); o.visible = p > 0; o.scale.setScalar(p <= 0 ? .0001 : lerp(2.3, 1, eo(p)) * s); };
const blinkAt = t => (Math.sin(t * 3.1) > .985 ? .1 : 1);
const MS = () => marlo({ sockL: PAT.stripe(), sockR: PAT.dots() });
const GOLD = '#f5b700', RED = '#e4572e', CREAM = '#fbf7ee', INK = '#14213d', PINK = '#f2a9a0', GREEN = '#3fae5a', NOTE = '#fff07a';
export const F = {};

// ---------- cast
const BOSS = { top: 0x3a3a48, pant: 0x23232b, skin: 0xf0c49c, hair: 0xe4572e, style: 'cap', shoe: 0x14213d, sockL: 0xe4572e, sockR: 0xe4572e };
const hold = (p, o, y = 1.3, z = 1.0) => { place(o, 0, y, z, p); return o; };
const HX = i => (i - 3) * 6.55; // 3 = Marlo's house
const lift = (w, y = 4.8) => w.houses.forEach(h => { if (h.userData.sign) h.userData.sign.position.y = y; });
const SHOP = ['', '', '', 'KEY KEEPER', '', '', ''];
const ALL = ['ODD PAIRS', 'STANDING ROOM', 'PLANT HOTEL', 'KEY KEEPER', 'SORRY CAKE', 'PEDAL POWER', 'PORCH 7'];
const crossed = { armL: [1.25, -.32], armR: [1.25, -.32] };
const carry = { armL: [1.35, .12], armR: [1.35, .12] };
const DOORZ = -3.93;
const NIGHT = { bg: 0x1d2b4f, sun: .6, env: .32 };
const doorLight = (w, x = 0) => { const l = new THREE.PointLight(0xffc47a, 22, 14); place(l, x + 1.2, 4.6, -1.2, w.scene); return l; };

// ---------- props
const CARD = 0xc8945a, SILVER = 0xc9ced8, WOOD = 0xb98250;
const TAGS = [0xe4572e, 0x2e86ff, 0x2fa36b, 0x7b5fc7, 0xf2a9a0, 0x1f6f78, 0xf5b700];
export const KEYG = mergeGeometries([
  new THREE.TorusGeometry(.2, .07, 10, 26).translate(-.42, 0, 0),
  new THREE.BoxGeometry(.7, .1, .06).translate(.13, 0, 0),
  new THREE.BoxGeometry(.07, .16, .06).translate(.3, -.1, 0),
  new THREE.BoxGeometry(.07, .11, .06).translate(.42, -.08, 0),
]);
// a key along +x, ring at -x; optional coloured marble tag
export function key(s = 1, col = C.gold, tag = null) {
  const g = new THREE.Group(); g.add(mesh(KEYG, M(col, .25, .7)));
  if (tag !== null) { place(sph(.15, tag, .15, .2), -.74, 0, 0, g); }
  g.scale.setScalar(s); return g;
}
function keyCloud(n, tags = false) {
  const m = new THREE.InstancedMesh(KEYG, M(0xffffff, .25, .7), n); m.castShadow = true; m.frustumCulled = false;
  const col = new THREE.Color(); for (let i = 0; i < n; i++) m.setColorAt(i, col.set(i % 3 ? C.gold : SILVER)); m.instanceColor.needsUpdate = true; return m;
}
export function parcel(s = 1, c = CARD) { const g = new THREE.Group(); place(box(1, .8, .8, c, .04, .8), 0, .4, 0, g); g.scale.setScalar(s); return g; }
export const note = (txt = 'LOCKED\nOUT', w = .9) => { const l = label(txt, w, w, { bg: NOTE, fg: INK, rad: 8 }); l.rotation.z = .07; return l; };
function board(cols = 16, rows = 25, filled = 400) {
  const g = new THREE.Group(); place(box(5.6, 7.2, .25, WOOD, .08, .7), 0, 3.6, 0, g);
  place(box(5.9, .3, .4, C.ink, .05), 0, 7.3, 0, g);
  const km = keyCloud(cols * rows); g.add(km); const pos = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) pos.push([-2.4 + c * .32, 6.75 - r * .265, .2]);
  g.userData = { km, pos, n: cols * rows }; return g;
}
const robotParts = () => {
  const g = new THREE.Group(); place(cyl(.6, .6, .5, 0x5b6a82, 22), 0, .3, 0, g); const bd = new THREE.Group(); g.add(bd); place(box(1.3, 1.5, 1, 0xc9ced8, .22, .35), 0, 1.35, 0, bd); const hd = new THREE.Group(); place(hd, 0, 2.55, 0, bd); place(box(1.1, .8, .9, 0xdfe3ea, .22, .3), 0, 0, 0, hd);
  const em = new THREE.MeshStandardMaterial({ color: 0x37c6ff, roughness: .2, emissive: 0x37c6ff, emissiveIntensity: 1.6 }); [-.25, .25].forEach(x => place(sph(.12, em), x, .05, .46, hd)); place(cyl(.03, .03, .5, C.ink, 8), 0, .6, 0, hd); place(sph(.1, 0xe4572e), 0, .87, 0, hd);
  const lg = label('MEGA', 1, .38, { bg: RED, fg: '#fff', rad: 20 }); place(lg, 0, 1.6, .52, bd);
  const arm = new THREE.Group(); place(arm, .78, 1.85, 0, bd); place(box(.22, .9, .22, 0x9aa2b2, .08), 0, -.4, 0, arm); place(cyl(.05, .05, .6, C.ink, 8), .05, -.95, .1, arm); g.userData = { arm, em, hd, bd }; return g;
};
// smart lock on a door: dark panel with a status light
function smartLock() {
  const g = new THREE.Group(); place(box(.42, .8, .14, 0x23232b, .05, .3), 0, 0, 0, g);
  const em = new THREE.MeshStandardMaterial({ color: 0x3fd67a, emissive: 0x3fd67a, emissiveIntensity: 1.6, roughness: .3 }); place(sph(.08, em), 0, .22, .08, g);
  const lg = label('MEGA', .36, .14, { bg: RED, fg: '#fff', rad: 10 }); place(lg, 0, -.18, .08, g); g.userData.em = em; return g;
}

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

// ================= SCENES
// Marlo pulls his own door at night: locked
function lockedOut(again) {
  return () => {
    const w = street({ ...NIGHT, signs: again ? SHOP : [] }); if (again) lift(w); doorLight(w);
    const m = MS(); place(m, -1.15, 0, -2.0, w.scene); m.rotation.y = .3;
    const lk = label('LOCKED', 1.3, .45, { bg: RED, fg: '#fff' }); place(lk, .2, 1.75, -3.84, w.scene);
    const ck = label('12:00 AM', 2.0, .65, { bg: CREAM }); place(ck, .5, 5.5, -2.9, w.scene);
    return { w, update(t, d) { tickGutter(w, t * .3); const b = d * .38, on = t > b; popIn(ck, t, .02); stampIn(lk, t, b);
      m.rotation.y = on ? lerp(-.5, .35, eio(prog(t, b, b + .35))) : -.5;
      m.pose({ mood: on ? 'shock' : 'neutral', armR: on ? [.3, .2] : [1.4 + Math.sin(t * 22) * .12, .05], armL: on ? [2.3, .3] : [.3, .2], head: [0, .05, 0], lift: on ? Math.exp(-(t - b) * 6) * .2 : 0, lean: on ? 0 : .08, blink: blinkAt(t) });
      camTo(w, [-.2, 3.4, 10.8], [-.3, 3.3, 9.6], [-.45, 2.9, -2.6], [-.45, 2.8, -2.6], eio(t / d), on && t < b + .25 ? .03 : 0, t); },
      overlay(g, t, d) { if (again) stamp2d(g, t, d * .55, 'AGAIN', 1500, RED, 120); } };
  };
}
F.A = lockedOut(false); F.R = lockedOut(true);

F.A2 = () => {
  const w = world(0x27406e, { floor: 0x33548a, env: .7, sun: 2.5, sh: 16 }); const n = 160, r = rand(6);
  const km = keyCloud(n); w.scene.add(km);
  for (let i = 0; i < n; i++) { const a = r() * 6.28, q = Math.sqrt(r()), ra = q * 8, y = (1 - q) * 3.6 + r() * .3, x = Math.cos(a) * ra, z = Math.sin(a) * ra - 1; setI(km, i, x, y + .1, z, 1.5, -1.57 + (r() - .5) * .5, r() * 6.28); }
  km.instanceMatrix.needsUpdate = true;
  const m = MS(); place(m, 0, 3.9, 0, w.scene);
  const N = 46, ms = new THREE.InstancedMesh(new THREE.SphereGeometry(.28, 18, 12), M(C.gold, .14, .55), N); ms.castShadow = true; ms.frustumCulled = false; w.scene.add(ms);
  const Dd = []; for (let i = 0; i < N; i++) Dd.push({ x: (r() - .5) * 7, z: (r() - .5) * 3 - 1.5, o: r() * 1.5, sp: 6 + r() * 4 });
  return { w, update(t, d) {
    Dd.forEach((p, i) => { const y = 16 - ((t + p.o) % 2.2) * p.sp; setI(ms, i, p.x, y < .3 ? -9 : y, p.z); }); doneI(ms);
    m.pose({ mood: 'happy', armL: [2.4, .55 + Math.sin(t * 9) * .12], armR: [2.4, .55 - Math.sin(t * 9) * .12], lift: Math.abs(Math.sin(t * 7)) * .22, head: [0, -.08, 0] });
    camTo(w, [0, 6, 21], [0, 6.8, 16.5], [0, 6.2, 0], [0, 7.1, 0], eo(t / d));
  } };
};

// inside the kitchen: the keys on the table, Marlo outside the window
F.B = () => {
  const w = world(0x1d2b4f, { floor: 0x7a5236, env: .6, sun: 1.3, sh: 12 }); const WALL = 0xf4c7a1, z0 = -3;
  place(box(9, 10, .3, WALL, .02, .9), -5.9, 5, z0, w.scene); place(box(9, 10, .3, WALL, .02, .9), 5.9, 5, z0, w.scene);
  place(box(2.8, 2.4, .3, WALL, .02, .9), 0, 1.2, z0, w.scene); place(box(2.8, 5, .3, WALL, .02, .9), 0, 7.5, z0, w.scene);
  [[0, 2.45, 3.2, .16], [0, 4.95, 3.2, .16]].forEach(([x, y, ww, hh]) => place(box(ww, hh, .4, CREAM, .04), x, y, z0 + .05, w.scene));
  [-1.48, 1.48].forEach(x => place(box(.16, 2.66, .4, CREAM, .04), x, 3.7, z0 + .05, w.scene)); place(box(.08, 2.5, .2, CREAM, .02), 0, 3.7, z0 + .05, w.scene);
  const gl = box(2.8, 2.5, .04, M(0xbfe3ff, .05, 0, { transparent: true, opacity: .16 }), .01); gl.castShadow = false; place(gl, 0, 3.7, z0 + .12, w.scene);
  const m = MS(); place(m, 0, 0, -3.9, w.scene); const ol = new THREE.PointLight(0x9fb8ff, 26, 8); place(ol, 0, 4.8, -2.4, w.scene);
  place(box(3.4, .16, 1.8, WOOD, .04, .6), 0, 1.75, .3, w.scene); [[-1.5, -.6], [1.5, -.6], [-1.5, 1.2], [1.5, 1.2]].forEach(([x, z]) => place(box(.14, 1.7, .14, 0x8a5a35, .03), x, .85, z, w.scene));
  const ky = key(1.1); place(ky, .1, 1.9, .5, w.scene); ky.rotation.set(-1.25, 0, .3); const kl = new THREE.PointLight(0xffd27a, 16, 6); place(kl, .4, 3.4, 1.6, w.scene);
  const tg = label('HIS KEYS', 1.9, .55, { bg: GOLD }); 
  return { w, update(t, d) { ky.rotation.z = .3 + Math.sin(t * 4) * .05;
    m.pose({ mood: t > d * .45 ? 'shock' : 'sad', armL: [2.05, .45], armR: [2.05, .45], head: [0, .25, 0], look: [0, -.8], lean: .1, blink: blinkAt(t) });
    camTo(w, [.2, 3.6, 9.4], [.1, 3.3, 8], [0, 3, -2], [0, 2.9, -2], eio(t / d)); } };
};

F.C = () => {
  const w = street(NIGHT); doorLight(w); const m = MS(); place(m, -.6, 0, -2.4, w.scene);
  const ls = townsperson(6, { top: 0x3d5a80 }); w.scene.add(ls); ls.rotation.y = -1.57; const tb = label('LOCKSMITH', 2.4, .55, { bg: GOLD }); w.scene.add(tb);
  const ck = label('1 AM', 1.8, .7, { bg: CREAM }); place(ck, -.6, 4.9, -2.4, w.scene);
  return { w, update(t, d) { tickGutter(w, t * .3); popIn(ck, t, .02); const hrs = Math.min(3, 1 + Math.floor(t / (d * .28))); ck.userData.set(hrs + ' AM');
    const q = eio(prog(t, d * .35, d * .95)); ls.position.set(lerp(8, 1.6, q), 0, -1.8); tb.position.set(ls.position.x, 4.0, -1.6); popIn(tb, t, d * .4);
    ls.pose({ walk: q < .98 ? t * 9 : undefined, mood: 'neutral', head: [0, .05, 0] });
    m.pose({ mood: t > d * .7 ? 'stare' : 'sad', ...crossed, lift: Math.abs(Math.sin(t * 40)) * .015, head: [.3, .1, 0], look: [.6, .2], blink: blinkAt(t) });
    camTo(w, [1, 3.8, 15], [.9, 3.7, 13.8], [1, 3, -2], [1, 3, -2], t / d); } };
};

F.D = () => {
  const w = street(NIGHT); doorLight(w); const m = MS(); place(m, -.9, 0, -2.2, w.scene); m.rotation.y = .5;
  const ls = townsperson(6, { top: 0x3d5a80 }); place(ls, 1.2, 0, -1.8, w.scene); ls.rotation.y = -.7; const bill = label('BILL\n$200', .9, 1.1, { bg: CREAM, fg: INK, rad: 6 }); hold(ls, bill, 1.75, .95);
  return { w, update(t, d) { tickGutter(w, t * .3); const b = d * .3, on = t > b;
    ls.pose({ mood: 'smug', armL: [1.6, .1], armR: [1.6, .1], head: [-.2, 0, 0] });
    m.pose({ mood: on ? 'shock' : 'neutral', armL: on ? [2.5, .4] : [.3, .2], armR: on ? [2.5, .4] : [.3, .2], lift: on ? Math.exp(-(t - b) * 6) * .25 : 0, head: [.2, .05, 0], look: [.6, 0] });
    camTo(w, [.1, 3.5, 10], [.1, 3.4, 9], [.1, 2.8, -2], [.1, 2.8, -2], t / d, on && t < b + .3 ? .04 : 0, t); },
    overlay(g, t, d) { stamp2d(g, t, d * .32, '$200', 1520, RED, 150); } };
};

F.E = () => {
  const w = street({}); const nb = townsperson(4); place(nb, HX(4) - .2, 0, -2.4, w.scene); nb.rotation.y = 3.0;
  const lk = label('LOCKED OUT', 3, .7, { bg: RED, fg: '#fff' }); place(lk, HX(4), 4.4, -2.4, w.scene);
  const m = MS(); place(m, HX(4) - 3, 0, -1.2, w.scene); m.rotation.y = .7;
  return { w, update(t, d) { tickGutter(w, t * .5); const b = d * .45, on = t > b; stampIn(lk, t, b);
    nb.rotation.y = on ? lerp(3.0, .2, eio(prog(t, b, b + .3))) : 3.0;
    nb.pose({ mood: on ? 'sad' : 'neutral', armR: on ? [2.4, .4] : [1.4 + Math.sin(t * 22) * .15, .05], armL: on ? [2.4, .4] : [.2, .1], head: [0, .1, 0] });
    m.pose({ mood: 'stare', head: [.3, 0, 0], look: [.6, 0], blink: blinkAt(t) });
    camTo(w, [HX(4) - 1.8, 3.8, 13], [HX(4) - 1.5, 3.7, 12], [HX(4) - 1.6, 3, -2], [HX(4) - 1.5, 3, -2], t / d); } };
};

F.E2 = () => {
  const w = street({ sh: 34, far: 150 }); const idx = [1, 2, 4, 5, 6];
  const ps = idx.map((h, i) => { const p = townsperson(i + 2); place(p, HX(h) + .3, 0, -2.3, w.scene); p.rotation.y = .15; const l = label('LOCKED OUT', 3, .7, { bg: RED, fg: '#fff' }); place(l, HX(h) + .3, 4.6, -2.3, w.scene); return [p, l]; });
  const m = MS(); place(m, 0, 0, -1.2, w.scene);
  return { w, update(t, d) { tickGutter(w, t * .5); ps.forEach(([p, l], i) => { const a = .05 + [2, 1, 0, 3, 4][i] * d * .13; stampIn(l, t, a, 1.3); p.pose({ mood: t > a ? 'sad' : 'neutral', armL: t > a ? [2.4, .4] : [.2, .1], armR: t > a ? [2.4, .4] : [.2, .1] }); });
    m.pose({ mood: 'shock', head: [Math.sin(t * 2.4) * .45, -.1, 0], armL: [.2, .25], armR: [.2, .25] });
    camTo(w, [0, 4, 16], [0, 7, 34], [0, 3.4, -1], [0, 4, -2], eio(t / d)); } };
};

function marbleScene(second, hitF = .44) {
  return () => {
    const w = street({ bg: second ? 0xf9d7a0 : 0xbfe6ea, signs: second ? SHOP : [] }); lift(w); const m = MS(); place(m, 0, 0, -1, w.scene);
    const mb = marble(.4); w.scene.add(mb); const j = jar(40); place(j, 2.3, 0, -.6, w.scene); j.scale.setScalar(.95); const glow = new THREE.PointLight(C.gold, 0, 16); place(glow, 0, 5, 1, w.scene);
    return { w, update(t, d) {
      tickGutter(w, t); const hit = Math.min(d - .9, d * hitF), jarT = hit + .6;
      let x = 0, y, z = -.8; if (t < hit) { y = lerp(15, 4.2, (t / hit) ** 2); } else { const T = t - hit, f = clamp(T / .6); x = lerp(0, 2.3, f); y = lerp(4.2, 1.8, f * f) + Math.sin(f * Math.PI) * 2.1; z = lerp(-.8, -.6, f); }
      mb.visible = t < jarT + .02; mb.position.set(x, y, z); j.userData.setN((second ? 36 : 26) + (t > jarT ? 1 : 0));
      const after = t > hit; glow.intensity = after ? 120 * Math.exp(-(t - hit) * 2.2) : 0;
      const sq = after ? 1 + Math.sin(clamp((t - hit) / .22) * Math.PI) * -.09 : 1; m.children[0].scale.set(1 / sq, sq, 1 / sq);
      m.pose({ mood: after ? (second ? 'happy' : 'idea') : (second ? 'smug' : 'stare'), head: after ? [0, -.1, 0] : [0, .02, 0], armL: after ? [2.2, .35] : [0, .12], armR: after ? [.5, .9] : [0, .12], lift: after ? Math.exp(-(t - hit) * 3.5) * .3 : 0, look: after ? [0, 0] : [0, 1] });
      camTo(w, [1, 3.4, 14.2], [1, 3.6, 12.6], [1, 3.2, -1], [1, 3.3, -1], eio(t / d), (after && t < hit + .24) ? .035 : 0, t);
    }, overlay(g, t, d) { const hit = Math.min(d - .9, d * hitF); const f = 1 - prog(t, hit, hit + .18); if (t > hit && f > 0) { g.fillStyle = `rgba(255,236,170,${f * .55})`; g.fillRect(0, 0, W, H); } } };
  };
}
F.F = marbleScene(false, .5); F.L = marbleScene(true, .64);

// the spare key under the doormat
F.G = () => {
  const w = street({}); const m = MS(); place(m, -1.45, 0, -2.3, w.scene); m.rotation.y = .6;
  const pv = new THREE.Group(); place(pv, .2, .12, -3.25, w.scene); place(box(1.7, .07, 1.05, 0x9c6b3e, .03, .95), 0, .035, .52, pv);
  const wl = label('WELCOME', 1.4, .4, { bg: null, fg: '#f4ead5' }); wl.rotation.x = -1.5708; place(wl, 0, .075, .52, pv);
  const ky = key(.75); ky.rotation.x = -1.5708; place(ky, .25, .14, -2.7, w.scene); const kg = new THREE.PointLight(0xffd27a, 0, 4); place(kg, .25, 1, -2.2, w.scene);
  const ns = label('NOT SAFE', 2.2, .65, { bg: RED, fg: '#fff' }); place(ns, .85, 3.3, -2.0, w.scene); ns.scale.setScalar(.85);
  return { w, update(t, d) { tickGutter(w, t * .4); const b = d * .15, on = t > b + .3; pv.rotation.x = -lerp(0, 1.15, eo(prog(t, b, b + .4))); kg.intensity = on ? 8 : 0; stampIn(ns, t, d * .55);
    m.pose({ mood: t > d * .55 ? 'shock' : 'idea', armR: [.6, .1], armL: [.2, .15], head: [-.25, .35, 0], look: [-.3, -1], lean: .12, blink: blinkAt(t) });
    camTo(w, [.2, 4.6, 10], [.1, 4.3, 9], [-.2, 2.0, -2.6], [-.2, 1.9, -2.6], eio(t / d)); } };
};

F.H = () => {
  const w = street({ signs: SHOP }); lift(w); const sg = w.houses[3].userData.sign; const m = MS(); place(m, -1.6, 0, -1.6, w.scene); m.rotation.y = .4;
  const bd = new THREE.Group(); place(bd, 1.95, 2.1, -3.82, w.scene); place(box(1.5, 1.4, .1, WOOD, .04, .7), 0, 0, 0, bd);
  const ks = [0, 1, 2, 3, 4, 5].map(i => { const k = key(.42, i % 2 ? SILVER : C.gold, TAGS[i]); k.rotation.z = -1.5708; place(k, -.5 + (i % 3) * .5, .32 - Math.floor(i / 3) * .62, .1, bd); return k; });
  const pr = label('$2 / MONTH', 2.6, .8, { bg: GOLD }); place(pr, 1.8, 3.45, -2.6, w.scene); pr.rotation.z = -.06;
  const tag = label('LEAVE YOUR SPARE', 4.2, .85, { bg: PINK }); place(tag, 0, 8.6, -1.8, w.scene);
  const ps = [0, 1].map(i => { const p = townsperson(i + 7); place(p, 6 + i * 2, 0, -.8, w.scene); p.rotation.y = -1.57; const k = key(.7); k.rotation.z = .4; hold(p, k, 1.75, .9); return p; });
  return { w, update(t, d) {
    tickGutter(w, t); stampIn(sg, t, d * .08); popIn(tag, t, d * .4); ks.forEach((k, i) => popIn(k, t, d * .3 + i * .08, .42)); stampIn(pr, t, d * .76);
    ps.forEach((p, i) => { const q = eio(prog(t, d * .25, d * .95)); p.position.x = lerp(7.5 + i * 2.1, 3.6 + i * 2.1, q); p.pose({ walk: q < .98 ? t * 9 : undefined, mood: 'happy', armL: [1.6, .1], armR: [.2, .1] }); });
    m.pose({ mood: 'happy', armR: t < d * .1 ? [2.2, .2] : [1.1, .5], armL: [.4, .35], head: t < d * .1 ? [0, -.28, 0] : [.25, 0, 0], look: t < d * .1 ? [0, 1] : [.5, 0], blink: blinkAt(t) });
    camTo(w, [.5, 4.2, 17], [.5, 4.6, 18.5], [.5, 4.3, -1], [.5, 4.6, -1], eio(t / d));
  } };
};

function keyRoom(bg = 0xf7e2a0, floor = 0xf2d98c, o = {}) {
  const w = world(bg, { floor, env: o.env ?? .85, sun: o.sun ?? 2.3, sh: 14 }); place(box(40, 16, .3, o.wall ?? 0xf4c7a1, .02, .9), 0, 8, -3.4, w.scene);
  const bd = board(); place(bd, 0, .6, -3.1, w.scene); const tl = label('KEY KEEPER', 4.6, .9, { bg: INK, fg: GOLD }); place(tl, 0, 8.6, -3.0, w.scene);
  return { w, bd, tl };
}
F.I = () => {
  const { w, bd } = keyRoom(); const { km, pos, n } = bd.userData; const cnt = label('0 KEYS', 3.4, 1, { bg: CREAM }); place(cnt, 0, 10.1, -2.6, w.scene);
  const m = MS(); place(m, 0, 0, 1.2, w.scene);
  return { w, update(t, d) { let k = 0; pos.forEach((p, i) => { const a = .05 + i * (d * .78 / n); const pp = prog(t, a, a + .15); if (t > a) k++; setI(km, i, p[0], p[1], p[2], Math.max(.001, back(pp) * .27), 0, -1.5708); }); doneI(km);
    cnt.userData.set(k + ' KEYS'); m.pose({ mood: 'happy', armL: [2.3, .5], armR: [2.3, .5], lift: Math.abs(Math.sin(t * 6)) * .1 });
    camTo(w, [0, 5.4, 19], [0, 5.6, 17.5], [0, 5, -1], [0, 5.1, -1], t / d); } };
};

F.J = () => {
  const { w, bd } = keyRoom(0x2a3550, 0x6b5a7a, { sun: 1.1, env: .5, wall: 0x9a8ab0 }); const { km, pos, n } = bd.userData; const r = rand(12);
  const L = new THREE.PointLight(0xffd27a, 30, 14); place(L, 0, 6, 2, w.scene);
  const fall = pos.map(() => [(r() - .5) * 5, r() * .25, (r() - .5) * 1.5, r() * 6, .7 + r() * .6]);
  const m = MS(); place(m, 2.2, 0, 1.6, w.scene); m.rotation.y = -.4; w.scene.add(km);
  return { w, update(t, d) { const b = d * .3, on = t > b, q = prog(t, b, b + .5);
    bd.rotation.z = on ? lerp(0, -.32, eo(q)) : 0; bd.position.y = .6 - (on ? eo(q) * .8 : 0);
    pos.forEach((p, i) => { const f = fall[i], tt = Math.max(0, t - b - f[1] * .5); const k = clamp(tt * 1.6 * f[4]); const sc = .27;
      if (!on || tt <= 0) setI(km, i, p[0], p[1] + .6, p[2] - 3.1, sc, 0, -1.5708);
      else { const x = lerp(p[0], f[0], k), y = lerp(p[1] + .6, .05, k * k), z = lerp(-3.0, f[2], k); setI(km, i, x, y, z, sc, -1.57 * k, lerp(-1.5708, f[3], k)); } });
    // instanced keys are in board space: move into world space by living on the scene
    doneI(km);
    m.pose({ mood: on ? 'shock' : 'neutral', armL: on ? [2.6, .4] : [.3, .2], armR: on ? [2.6, .4] : [.3, .2], head: [-.3, .1, 0], look: [-.6, .2], lift: on ? Math.exp(-(t - b) * 6) * .3 : 0 });
    camTo(w, [0, 4.6, 17], [0, 4.4, 15.5], [0, 4, -1], [0, 3.9, -1], t / d, on && t < b + .45 ? .05 : 0, t); },
    overlay(g, t, d) { stamp2d(g, t, d * .34, 'CRASH!', 1500, RED, 130); } };
};

F.J2 = () => {
  const w = world(0x2a3550, { floor: 0x6b5a7a, env: .55, sun: 1.3, sh: 12 }); place(box(40, 16, .3, 0x9a8ab0, .02, .9), 0, 8, -3.4, w.scene);
  const L = new THREE.PointLight(0xffd27a, 30, 14); place(L, 0, 6, 2, w.scene); const bd = new THREE.Group(); place(box(5.6, 7.2, .25, WOOD, .08, .7), 0, 3.6, 0, bd); place(bd, -.3, -.2, -3.1, w.scene); bd.rotation.z = -.32;
  const n = 400, r = rand(13), km = keyCloud(n); w.scene.add(km);
  for (let i = 0; i < n; i++) { const a = r() * 6.28, ra = Math.sqrt(r()) * 4.2; setI(km, i, Math.cos(a) * ra, .05 + r() * .12, Math.sin(a) * ra * .6 - .2, .5, -1.5708, r() * 6.28); } km.instanceMatrix.needsUpdate = true;
  const m = MS(); place(m, 0, 0, .4, w.scene);
  const qs = [[-2.3, 3.9, '?'], [2.3, 4.5, '??']].map(([x, y, s]) => { const l = label(s, .9, .9, { bg: CREAM }); place(l, x, y, .2, w.scene); return l; });
  return { w, update(t, d) { qs.forEach((l, i) => popIn(l, t, .1 + i * .15));
    m.pose({ mood: 'shock', armL: [2.6, .3], armR: [2.6, .3], head: [Math.sin(t * 9) * .25, .15, 0], look: [0, .6], lift: Math.abs(Math.sin(t * 8)) * .06 });
    camTo(w, [0, 6.2, 13], [0, 6.6, 12], [0, 2.4, -.5], [0, 2.4, -.5], t / d); } };
};

F.K = () => {
  const w = street({ ...NIGHT, signs: SHOP }); lift(w); const m = MS(); w.scene.add(m); const kr = key(.8); hold(m, kr, 1.55, .9); kr.rotation.z = 1.2;
  const hs = [1, 2, 3, 4, 5], words = ['NOPE', 'NOPE', 'YES!', 'NOPE', 'YES!'];
  const ls = hs.map((h, i) => { const l = label(words[i], 1.8, .7, { bg: words[i] === 'YES!' ? '#3fae5a' : RED, fg: '#fff' }); place(l, HX(h), 3.3, -3.6, w.scene); return l; });
  const lights = hs.map(h => { const p = new THREE.PointLight(0xffc47a, 10, 10); place(p, HX(h) + 1, 4.4, -1.2, w.scene); return p; });
  const ck = label('3 AM', 1.6, .6, { bg: CREAM }); w.scene.add(ck);
  return { w, update(t, d) { tickGutter(w, t * .4); const x = lerp(HX(1) - 1.2, HX(5) - 1.2, t / d); m.position.set(x, 0, -2.5); m.rotation.y = 1.3;
    ls.forEach((l, i) => popIn(l, t, Math.max(.02, (HX(hs[i]) - 1.2 - (HX(1) - 1.2)) / (HX(5) - HX(1)) * d - .05)));
    m.pose({ walk: t * 10, mood: 'neutral', armR: [1.35, .1], armL: [.3, .1], lean: .05, head: [-.35, 0, 0], blink: blinkAt(t) });
    ck.position.set(x - 1.6, 6.4, -2.4); popIn(ck, t, .05);
    camTo(w, [x - 1, 4, 14.5], [x - .9, 4, 14], [x - .6, 3.2, -2.6], [x - .5, 3.2, -2.6], t / d); } };
};

F.K2 = () => {
  const w = world(0xf3b98a, { floor: 0xe7a070, env: .85, sun: 2.2 }); const m = MS(); place(m, 0, 0, -1.6, w.scene);
  place(box(4.6, .16, 1.8, WOOD, .04, .6), 0, 1.6, .2, w.scene); place(box(4.4, 1.5, 1.6, 0x8a5a35, .05), 0, .78, .2, w.scene);
  const ks = [0, 1, 2, 3, 4, 5].map(i => { const k = key(.75, i % 2 ? SILVER : C.gold, TAGS[i]); k.rotation.set(-1.15, 0, -1.5708 + (i % 2 ? .12 : -.12)); place(k, -1.75 + i * .7, 1.78, .45, w.scene); return k; });
  const tg = label('COLOUR CODED', 3.6, .75, { bg: GOLD }); place(tg, 0, 4.55, -1.6, w.scene);
  return { w, update(t, d) { ks.forEach((k, i) => popIn(k, t, .05 + i * d * .1, .75)); popIn(tg, t, d * .55);
    m.pose({ mood: 'happy', armL: [1.5 + Math.sin(t * 14) * .2, .25], armR: [1.5 - Math.sin(t * 14) * .2, .25], head: [0, .3, 0], look: [0, -.7], blink: blinkAt(t) });
    camTo(w, [0, 4.4, 10], [0, 4.2, 9], [0, 2.4, -.2], [0, 2.4, -.2], t / d); } };
};

F.M = () => {
  const w = street({ ...NIGHT, signs: SHOP }); lift(w); const m = MS(); w.scene.add(m); const bk = key(1.3, C.gold, TAGS[0]); hold(m, bk, 3.2, .5); bk.rotation.z = 1.2;
  const nb = townsperson(4); place(nb, HX(1) - .2, 0, -2.4, w.scene); nb.rotation.y = 1.2; doorLight(w, HX(1));
  const tm = label('MIDNIGHT RESCUE', 3.6, .75, { bg: GOLD }); w.scene.add(tm);
  return { w, update(t, d) { tickGutter(w, t * .6); const x = lerp(-1, HX(1) + 2.2, eio(prog(t, 0, d * .85))); m.position.set(x, 0, -1.6); m.rotation.y = -1.3;
    m.pose({ walk: t * 13, mood: 'happy', armR: [2.6, .2], armL: [.3, .1], lean: .14, head: [.35, 0, 0], blink: blinkAt(t) });
    tm.position.set(x, 6.6, -1.6); popIn(tm, t, .08);
    nb.pose({ mood: t > d * .6 ? 'happy' : 'sad', armL: t > d * .6 ? [2.4, .4] : [.2, .1], armR: t > d * .6 ? [2.4, .4] : [.2, .1], lift: t > d * .6 ? Math.abs(Math.sin(t * 9)) * .1 : 0 });
    camTo(w, [x + 1, 4.2, 14], [x + .8, 4.1, 13], [x + .4, 3.2, -1.8], [x + .3, 3.2, -1.8], t / d); } };
};

F.M2 = () => {
  const w = street({ signs: SHOP, sh: 26 }); lift(w); const m = MS(); place(m, -1.2, 0, -.8, w.scene);
  const a = label('$2', 2.2, 1.1, { bg: CREAM }), b = label('$5', 2.6, 1.3, { bg: GOLD }), fr = label('A MONTH', 3.2, .8, { bg: RED, fg: '#fff' }); place(a, 1.6, 6.2, -.8, w.scene); place(b, 1.6, 6.2, -.7, w.scene); place(fr, 1.6, 5.05, -.7, w.scene);
  [0, 1, 2, 3, 4].forEach(i => { const p = townsperson(i + 3); place(p, 3 + i * 1.8, 0, -.4, w.scene); p.rotation.y = -1.57; const k = key(.6, i % 2 ? SILVER : C.gold); k.rotation.z = .4; hold(p, k, 1.75, .9); p.pose({ mood: 'happy', armL: [1.6, .1], armR: [.2, .1] }); });
  return { w, update(t, d) { tickGutter(w, t); popIn(a, t, .05); const sw = d * .28; a.visible = t < sw; stampIn(b, t, sw); popIn(fr, t, d * .4); m.pose({ mood: t > d * .5 ? 'smug' : 'happy', armL: [.2, .35], armR: [.2, .35], head: [0, -.08, 0], blink: blinkAt(t) }); camTo(w, [1.6, 4.4, 17], [1.6, 4.4, 15.5], [1.6, 3.8, -1], [1.6, 3.8, -1], t / d); },
    overlay(g, t, d) { stamp2d(g, t, d * .5, 'SOLD OUT', 900); } };
};

F.N = () => {
  const w = street({ signs: SHOP }); lift(w); const sl = smartLock(); place(sl, HX(4) + .45, 1.4, -3.85, w.scene); const rb = robotParts(); w.scene.add(rb);
  const m = MS(); place(m, HX(4) - 3.2, 0, -.6, w.scene); m.rotation.y = .9; const pr = label('SMART LOCK', 3, .8, { bg: RED, fg: '#fff' }); place(pr, HX(4), 5.0, -3.2, w.scene);
  const ph = label('OPEN WITH\nMEGA APP', 1.6, 2.6, { bg: INK, fg: '#fff', rad: 30, border: '#e4572e' }); place(ph, HX(4) + 2.6, 4.2, -1.2, w.scene);
  return { w, update(t, d) { tickGutter(w, t); const q = eo(prog(t, .1, d * .45)); stampIn(sl, t, d * .45); rb.position.set(lerp(HX(4) + 6.5, HX(4) + 1.4, q), 0, -1.6); rb.rotation.y = lerp(-1.2, 3.0, q); rb.userData.arm.rotation.x = -1 + Math.sin(t * 5) * .3; stampIn(pr, t, d * .3); popIn(ph, t, d * .62);
    m.pose({ mood: t > d * .45 ? 'stare' : 'neutral', head: [.4, 0, 0], look: [.6, .2], armL: [.2, .2], armR: [.2, .2], blink: blinkAt(t) }); camTo(w, [HX(4) - .3, 4.4, 18], [HX(4) - .3, 4.4, 16.5], [HX(4) - .3, 3.4, -1], [HX(4) - .3, 3.4, -1], t / d); } };
};

F.N2 = () => {
  const w = street({ signs: SHOP, sh: 30 }); lift(w); const sls = [1, 2, 3, 4, 5].map(h => { const s = smartLock(); place(s, HX(h) + .45, 1.4, -3.85, w.scene); return s; });
  const ps = [1, 2, 4, 5].map((h, i) => { const p = townsperson(i + 5); place(p, HX(h) - .2, 0, -2.5, w.scene); p.rotation.y = .3; return p; });
  const rb = robotParts(); place(rb, 2.4, 0, -.6, w.scene); rb.rotation.y = -.3;
  return { w, update(t, d) { tickGutter(w, t); const b = d * .3, off = t > b;
    sls.forEach((s, i) => { const em = s.userData.em; em.color.set(off ? 0xff3b30 : 0x3fd67a); em.emissive.set(off ? 0xff3b30 : 0x3fd67a); em.emissiveIntensity = off ? (Math.sin(t * 18 + i) > 0 ? 2.4 : .4) : 1.6; });
    rb.userData.arm.rotation.x = off ? -1.6 + Math.sin(t * 26) * .35 : -1; rb.position.x = 2.4 + (off ? Math.sin(t * 30) * .05 : 0); rb.userData.em.color.set(off ? 0xff3b30 : 0x37c6ff); rb.userData.em.emissive.set(off ? 0xff3b30 : 0x37c6ff);
    ps.forEach((p, i) => p.pose({ mood: off ? 'shock' : 'neutral', armL: off ? [2.5, .4] : [.2, .1], armR: off ? [2.5, .4] : [1.4, .05], lift: off ? Math.abs(Math.sin(t * 8 + i)) * .08 : 0 }));
    camTo(w, [0, 4.4, 20], [0, 5.5, 26], [0, 3.2, -2], [0, 3.4, -2], t / d, off && t < b + .3 ? .04 : 0, t); },
    overlay(g, t, d) { stamp2d(g, t, d * .38, 'APP CRASHED', 1500, RED, 110); } };
};

F.O = () => {
  const w = street({ ...NIGHT, bg: 0xf3c9a0, sun: 1.8, env: .7, signs: SHOP }); lift(w); const m = MS(); place(m, -1.6, 0, -1.4, w.scene); m.rotation.y = .5;
  const bs = person(BOSS); w.scene.add(bs); const lb = label('MEGASOCK BOSS', 2.8, .6, { bg: RED, fg: '#fff' }); w.scene.add(lb);
  return { w, update(t, d) { tickGutter(w, t); const q = eio(prog(t, 0, d * .6)); bs.position.set(lerp(7, .3, q), 0, -2.6); bs.rotation.y = q < .98 ? -1.57 : lerp(-1.57, 3.14, prog(t, d * .6, d * .7)); lb.position.set(bs.position.x, 3.95, -2.3); popIn(lb, t, .15);
    const knock = t > d * .7; bs.pose({ walk: q < .98 ? t * 9 : undefined, mood: 'sad', armR: knock ? [1.6 + Math.sin(t * 24) * .2, .05] : [.2, .1], armL: [.2, .1], head: [0, .1, 0] });
    m.pose({ mood: 'smug', ...crossed, head: [.4, 0, 0], look: [.6, 0], blink: blinkAt(t) }); camTo(w, [.2, 4.2, 14], [.1, 4, 12.6], [.2, 3.2, -1.8], [.1, 3.2, -1.8], t / d); } };
};

F.Q = () => {
  const w = street({ signs: ALL, bg: 0xbfe6ea, sh: 40, far: 150 }); lift(w);
  const m = MS(); place(m, 0, 0, -2.6, w.scene); const n = 16; for (let i = 0; i < n; i++) { const p = townsperson(i + 2); place(p, 2 + i * 1.55, 0, -.9, w.scene); p.rotation.y = -1.57; const k = key(.55, i % 2 ? SILVER : C.gold, TAGS[i % 7]); k.rotation.z = .4; hold(p, k, 1.75, .9); p.pose({ mood: 'happy', armL: [1.6, .1], armR: [.2, .1], head: [0, 0, 0] }); }
  const wl = label('WAITING LIST', 4.2, .9, { bg: GOLD }); place(wl, 13, 5.6, -.9, w.scene);
  return { w, update(t, d) { tickGutter(w, t * 2); popIn(wl, t, d * .35); m.pose({ mood: 'happy', armL: [2.3, .55], armR: [2.3, .55], head: [0, -.05, 0], lift: Math.abs(Math.sin(t * 5)) * .15 }); camTo(w, [0, 3.6, 13], [6, 10, 38], [0, 3.6, -2], [6, 4.5, -2], eio(t / d)); } };
};

F.S = () => {
  const w = street({ ...NIGHT, signs: SHOP }); lift(w); doorLight(w); const m = MS(); place(m, 0, 0, -1.4, w.scene); const k7 = key(1.1, C.gold, C.gold); w.scene.add(k7); let sw = 1;
  return { w, update(t, d, P) { tickGutter(w, t * .4); sw = P ? P('S2', 0) : d * .33; const up = eo(prog(t, sw, sw + .35));
    k7.position.set(.9, lerp(1.4, 3.6, up), -.6); k7.rotation.set(0, 0, lerp(-1.2, .25, up)); k7.visible = t > sw - .05;
    m.pose({ mood: 'happy', armR: t < sw ? [.3, .2] : [2.5, .3], armL: [.3, .2], head: [0, t < sw ? -.15 : 0, 0], lift: t < sw ? Math.abs(Math.sin(t * 14)) * .12 : 0, lean: t < sw ? -.08 : 0, blink: blinkAt(t) });
    camTo(w, [0, 3.8, 10.5], [0, 3.7, 9], [0, 3.4, -1.2], [0, 3.3, -1.2], eio(t / d)); },
    overlay(g, t, d) { sticky(g, t, sw + .35, ['KEY #7', '30 SECONDS', '$0'], 680, 'NO LOCKSMITH NEEDED'); } };
};

F.Z = recap(['LOCKED OUT AT MIDNIGHT', 'KEEP SPARE KEYS, $2 A MONTH', '$1,000,000'], ALL);
