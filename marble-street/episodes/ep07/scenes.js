import * as THREE from 'three';
import { recap } from './recap.js';
import { C, M, W, H, world, box, cyl, sph, mesh, place, prog, eio, eo, back, lerp, clamp, camTo, label, setI, doneI, rand, belt } from './world.js';
import { marlo, person } from './marlo.js';
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
const SHOP = ['', '', '', 'PORCH 7', '', '', ''];
const ALL = ['ODD PAIRS', 'STANDING ROOM', 'PLANT HOTEL', 'PORCH 7', 'SORRY CAKE', 'PEDAL POWER', 'PLANT HOTEL'];
const crossed = { armL: [1.25, -.32], armR: [1.25, -.32] };
const carry = { armL: [1.35, .12], armR: [1.35, .12] };
const DOORZ = -3.93;

// ---------- props
const CARD = 0xc8945a;
export function parcel(s = 1, c = CARD, ribbon = null) {
  const g = new THREE.Group(); const b = box(1, .8, .8, c, .04, .8); place(b, 0, .4, 0, g);
  if (ribbon) { place(box(.2, .82, .82, ribbon, .02, .4), 0, .4, 0, g); place(box(1.02, .82, .2, ribbon, .02, .4), 0, .4, 0, g); const bw = sph(.16, ribbon, .4); bw.scale.set(1.6, .8, 1); place(bw, 0, .86, 0, g); }
  else { place(box(.22, .02, .82, 0xe7d3a8, .005, .6), 0, .805, 0, g); const lb = box(.36, .24, .02, CREAM, .01, .6); place(lb, .22, .5, .41, g); }
  g.scale.setScalar(s); return g;
}
export const note = (txt = 'SORRY WE\nMISSED YOU', w = .9) => { const l = label(txt, w, w, { bg: NOTE, fg: INK, rad: 8 }); l.rotation.z = .07; return l; };
const rod = (a, b, r, c) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b); const l = A.distanceTo(B); const o = cyl(r, r, l, c, 12, .35); o.position.copy(A).add(B).multiplyScalar(.5); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); return o; };
// red wagon along x, handle towards +x
function wagon(n = 4) {
  const g = new THREE.Group(); place(box(2.4, .5, 1.3, C.red, .08, .45), 0, .75, 0, g);
  const wh = [[-.8, .65], [.8, .65], [-.8, -.65], [.8, -.65]].map(([x, z]) => { const w = cyl(.3, .3, .14, 0x1b1b22, 20, .7); w.rotation.x = Math.PI / 2; place(w, x, .32, z, g); return w; });
  g.add(rod([1.2, .7, 0], [2.4, 1.6, 0], .05, C.ink)); place(box(.1, .1, .6, C.ink, .03), 2.4, 1.6, 0, g);
  for (let i = 0; i < n; i++) { const p = parcel(.62); place(p, -.6 + (i % 2) * 1.1, 1.0 + Math.floor(i / 2) * .5, (i % 3 - 1) * .1, g); p.rotation.y = (i % 2 ? .2 : -.15); }
  g.userData.roll = a => wh.forEach(w => w.rotation.y = a); return g;
}
function lockers() {
  const g = new THREE.Group(); place(box(5.2, 4.4, 1.3, 0x8d99ae, .15, .35), 0, 2.2, 0, g); place(box(5.5, .5, 1.5, C.red, .12), 0, 4.6, 0, g);
  const lg = label('MEGA LOCKERS', 4.6, .5, { bg: RED, fg: '#fff', rad: 16 }); place(lg, 0, 4.6, .76, g);
  const lights = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    place(box(1.05, 1.1, .08, 0xc9ced8, .05, .3), -1.68 + c * 1.12, .75 + r * 1.2, .67, g);
    const em = new THREE.MeshStandardMaterial({ color: 0x3fd67a, emissive: 0x3fd67a, emissiveIntensity: 1.4, roughness: .3 }); place(sph(.08, em), -1.68 + c * 1.12 + .35, 1.1 + r * 1.2, .73, g); lights.push(em);
    place(box(.08, .3, .06, C.ink, .02), -1.68 + c * 1.12 - .38, .75 + r * 1.2, .73, g);
  }
  g.userData = { lights }; return g;
}
function robot() {
  const g = new THREE.Group(); place(cyl(.6, .6, .5, 0x5b6a82, 22), 0, .3, 0, g); const bd = new THREE.Group(); g.add(bd); place(box(1.3, 1.5, 1, 0xc9ced8, .22, .35), 0, 1.35, 0, bd); const hd = new THREE.Group(); place(hd, 0, 2.55, 0, bd); place(box(1.1, .8, .9, 0xdfe3ea, .22, .3), 0, 0, 0, hd);
  const em = new THREE.MeshStandardMaterial({ color: 0x37c6ff, roughness: .2, emissive: 0x37c6ff, emissiveIntensity: 1.6 }); [-.25, .25].forEach(x => place(sph(.12, em), x, .05, .46, hd)); place(cyl(.03, .03, .5, C.ink, 8), 0, .6, 0, hd); place(sph(.1, 0xe4572e), 0, .87, 0, hd);
  const lg = label('MEGA', 1, .38, { bg: RED, fg: '#fff', rad: 20 }); place(lg, 0, 1.6, .52, bd);
  const arm = new THREE.Group(); place(arm, .78, 1.85, 0, bd); place(box(.22, .9, .22, 0x9aa2b2, .08), 0, -.4, 0, arm); place(cyl(.05, .05, .6, C.ink, 8), .05, -.95, .1, arm); g.userData = { arm, em, hd, bd }; return g;
}
function office() {
  const g = new THREE.Group(); place(box(2.6, 5.6, 2, 0x5b6a82, .1, .5), 0, 2.8, 0, g);
  const win = new THREE.InstancedMesh(new THREE.BoxGeometry(.42, .5, .05), M(0xbfe3ff, .25), 24); let k = 0; for (let r = 0; r < 8; r++) for (let c = 0; c < 3; c++) setI(win, k++, -.75 + c * .75, .9 + r * .6, 1.01); doneI(win); g.add(win);
  return g;
}
function mini(c = 0xf4c7a1) { const g = new THREE.Group(); place(box(2.6, 2.4, 2, c, .08, .7), 0, 1.2, 0, g); const t = new THREE.Shape(); t.moveTo(-1.5, 0); t.lineTo(1.5, 0); t.lineTo(0, 1.1); t.closePath(); place(mesh(new THREE.ExtrudeGeometry(t, { depth: 2.1, bevelEnabled: false }), M(0x34476b, .7)), 0, 2.4, -1.05, g); place(box(.7, 1.3, .08, C.red, .04), 0, .65, 1.01, g); return g; }
function snow(w, n = 90) { const m = new THREE.InstancedMesh(new THREE.SphereGeometry(.09, 8, 6), M(0xffffff, .6), n); m.frustumCulled = false; w.scene.add(m); const r = rand(4), D = []; for (let i = 0; i < n; i++) D.push([(r() - .5) * 26, r() * 14, (r() - .5) * 10 + 2, .6 + r() * .8]); return t => { D.forEach((p, i) => setI(m, i, p[0] + Math.sin(t * 1.3 + i) * .3, 14 - ((p[1] + t * p[3] * 2) % 14), p[2])); doneI(m); }; }

// ---------- 2D overlays
function stamp2d(g, t, a, txt, y = 760, col = RED, fs = 130) {
  const p = prog(t, a, a + .22); if (p <= 0) return; const s = lerp(2.2, 1, eo(p)); g.save(); g.translate(540, y); g.rotate(-.12); g.scale(s, s); g.globalAlpha = Math.min(1, p * 2);
  g.font = `${fs}px "Archivo Black"`; g.textAlign = 'center'; g.textBaseline = 'middle'; const w = g.measureText(txt).width + 80;
  g.fillStyle = 'rgba(251,247,238,.92)'; g.beginPath(); g.roundRect(-w / 2, -fs * .73, w, fs * 1.46, 26); g.fill(); g.lineWidth = 14; g.strokeStyle = col; g.stroke(); g.fillStyle = col; g.fillText(txt, 0, 8); g.restore();
}
// big yellow sticky note slapped onto the screen
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

// ---------- neighbours holding notes or parcels
function crowd(w, n, z = -1.6, what = 'note') {
  const out = []; for (let i = 0; i < n; i++) { const p = townsperson(i + 1); const x = -14 + i * (28 / (n - 1)) + (i % 2 ? .4 : -.4); place(p, x, 0, z + (i % 3) * .7, w.scene); p.rotation.y = (i % 2 ? -.35 : .35);
    if (what === 'note') { hold(p, note('SORRY', .7), 2.25, .85); p.pose({ mood: i % 3 ? 'sad' : 'stare', armL: [1.7, .15], armR: [1.7, .15], head: [0, .25, 0], look: [0, -.7] }); }
    else { hold(p, parcel(.55), 1.6, .75); p.pose({ mood: 'happy', ...carry }); }
    out.push(p); }
  return out;
}

// ================= SCENES
F.A = () => {
  const w = street({ signs: [] }); const m = MS(); place(m, 0, 0, -1.6, w.scene);
  const ck = label('9:00 AM', 2.6, .8, { bg: CREAM }); place(ck, 0, 5.25, -1.6, w.scene);
  return { w, update(t, d) { tickGutter(w, t * .3); const h = Math.floor(lerp(9, 17.99, eio(prog(t, .1, d * .9)))); ck.userData.set((h > 12 ? h - 12 : h) + ':00 ' + (h >= 12 ? 'PM' : 'AM')); popIn(ck, t, .02);
    m.pose({ mood: t > d * .6 ? 'sad' : 'stare', head: [Math.sin(t * 2.2) * .55, -.05, 0], look: [Math.sin(t * 2.2), 0], armL: [.2, .2], armR: [.2, .2], lift: Math.abs(Math.sin(t * 9)) * .03, blink: blinkAt(t) });
    camTo(w, [0, 3.8, 11], [0, 3.6, 9.2], [0, 3.3, -1.6], [0, 3.2, -1.6], t / d); } };
};

F.A2 = () => {
  const w = world(0x27406e, { floor: 0x33548a, env: .7, sun: 2.5, sh: 16 }); const n = 110, r = rand(6);
  const bx = new THREE.InstancedMesh(new THREE.BoxGeometry(1, .8, .8), M(CARD, .8), n), tp = new THREE.InstancedMesh(new THREE.BoxGeometry(.22, .82, .82), M(0xe7d3a8, .6), n);
  [bx, tp].forEach(x => { x.castShadow = true; x.frustumCulled = false; w.scene.add(x); });
  for (let i = 0; i < n; i++) { const a = r() * 6.28, q = Math.sqrt(r()), ra = q * 8, y = (1 - q) * 4 + r() * .3, x = Math.cos(a) * ra, z = Math.sin(a) * ra - 1, rx = (r() - .5) * .4, rz = (r() - .5) * .4; setI(bx, i, x, y + .4, z, 1, rx, rz); setI(tp, i, x, y + .41, z, 1, rx, rz); }
  [bx, tp].forEach(x => { x.instanceMatrix.needsUpdate = true; });
  const m = MS(); place(m, 0, 4.4, 0, w.scene);
  const N = 46, ms = new THREE.InstancedMesh(new THREE.SphereGeometry(.28, 18, 12), M(C.gold, .14, .55), N); ms.castShadow = true; ms.frustumCulled = false; w.scene.add(ms);
  const Dd = []; for (let i = 0; i < N; i++) Dd.push({ x: (r() - .5) * 7, z: (r() - .5) * 3 - 1.5, o: r() * 1.5, sp: 6 + r() * 4 });
  return { w, update(t, d) {
    Dd.forEach((p, i) => { const y = 16 - ((t + p.o) % 2.2) * p.sp; setI(ms, i, p.x, y < .3 ? -9 : y, p.z); }); doneI(ms);
    m.pose({ mood: 'happy', armL: [2.4, .55 + Math.sin(t * 9) * .12], armR: [2.4, .55 - Math.sin(t * 9) * .12], lift: Math.abs(Math.sin(t * 7)) * .22, head: [0, -.08, 0] });
    camTo(w, [0, 6, 21], [0, 6.8, 16.5], [0, 6.6, 0], [0, 7.5, 0], eo(t / d));
  } };
};

F.B = () => {
  const w = street({ signs: [] }); const m = MS(); w.scene.add(m);
  const tm = label('2 MIN', 2.4, .85, { bg: GOLD }); w.scene.add(tm);
  return { w, update(t, d) {
    tickGutter(w, t * .5); const x = lerp(-.5, 6.5, t / d); m.position.set(x, 0, -1.4); m.rotation.y = 1.3;
    m.pose({ walk: t * 9, mood: 'happy', head: [-.35, 0, 0], blink: blinkAt(t) });
    tm.position.set(x, 4.7, -1.4); popIn(tm, t, .1); tm.userData.set(t > d * .55 ? 'JUST 2' : '2 MIN');
    camTo(w, [x - 1.5, 4.2, 13], [x - 1, 4.1, 12], [x - .6, 3.4, -1.6], [x - .4, 3.4, -1.6], t / d);
  } };
};

F.C = () => {
  const w = street({ signs: [] }); const m = MS(); place(m, -1.25, 0, -2.2, w.scene); m.rotation.y = .3;
  const nt = note(); place(nt, -.05, 1.8, DOORZ, w.scene);
  return { w, update(t, d) { tickGutter(w, t * .3); stampIn(nt, t, .05, 1); const k = eio(prog(t, 0, d * .35)); m.rotation.y = lerp(-.4, .35, k);
    m.pose({ mood: t > d * .3 ? 'shock' : 'neutral', armL: [.3, .2], armR: t > d * .3 ? [2.3, .3] : [.3, .2], head: [0, .1, 0], lift: t > d * .3 ? Math.exp(-(t - d * .3) * 6) * .2 : 0 });
    camTo(w, [-.3, 3.2, 7.6], [-.4, 3, 6.6], [-.6, 2.6, DOORZ], [-.6, 2.5, DOORZ], eio(t / d)); },
    overlay(g, t, d) { sticky(g, t, d * .45, ['SORRY', 'WE MISSED', 'YOU'], 640); } };
};

F.D = () => {
  const w = world(0x9aa6b8, { floor: 0x7f8aa0, env: .7, sun: 2.1, sh: 18, far: 80 });
  const wh = new THREE.Group(); place(wh, 0, 0, -6, w.scene); place(box(14, 6.5, 6, 0xb7c0cf, .1, .6), 0, 3.25, 0, wh); place(box(14.4, .5, 6.4, 0x5b6a82, .05), 0, 6.6, 0, wh);
  place(box(4, 3.6, .1, 0x3c4560, .05), 1.8, 1.8, 3.02, wh); const sg = label('WAREHOUSE', 4.6, .9, { bg: INK, fg: '#fff' }); place(sg, 0, 5.2, 3.06, wh);
  const bl = belt(10, 1.4); place(bl, -1, 0, -1.8, w.scene); const ps = []; for (let i = 0; i < 6; i++) { const p = parcel(.7); w.scene.add(p); ps.push(p); }
  const m = MS(); place(m, -1.8, 0, 1.4, w.scene); m.rotation.y = .5; const hr = label('1 HOUR AWAY', 3.2, .8, { bg: RED, fg: '#fff' }); place(hr, -1.2, 4.6, 1.4, w.scene);
  return { w, update(t, d) { ps.forEach((p, i) => { const x = ((t * 1.6 + i * 1.7) % 10) - 6; p.position.set(x, 1.02, -1.8); p.visible = x < 2.6; });
    stampIn(hr, t, d * .5); m.pose({ mood: 'sad', armL: [.1, .1], armR: [.1, .1], head: [.4, .05, 0], look: [.7, .2], blink: blinkAt(t) });
    camTo(w, [-.6, 4.4, 17.5], [-.4, 4.2, 16], [-.6, 3.4, -1.5], [-.4, 3.4, -1.5], t / d); } };
};

F.E = () => {
  const w = street({ signs: [], sh: 34, far: 150 }); const ns = w.houses.map((h, i) => { const n = note('SORRY', 1); place(n, HX(i) - .05, 1.8, DOORZ, w.scene); return n; });
  const m = MS(); place(m, 0, 0, 1.8, w.scene);
  return { w, update(t, d) { tickGutter(w, t); ns.forEach((n, i) => popIn(n, t, .1 + Math.abs(i - 3) * d * .12, 1.6)); m.rotation.y = lerp(0, 3.14, eio(prog(t, 0, .5))); m.pose({ mood: 'shock', head: [Math.sin(t * 2.4) * .45, -.1, 0], armL: [.2, .25], armR: [.2, .25] });
    camTo(w, [0, 3.6, 12], [0, 6, 25], [0, 3.2, 0], [0, 3.4, -2], eio(t / d)); } };
};

F.E2 = () => {
  const w = street({ signs: [] }); crowd(w, 12, -1.3, 'note');
  const sm = label('SAME NOTE', 3.4, .85, { bg: RED, fg: '#fff' }); place(sm, 0, 5.6, -1, w.scene);
  return { w, update(t, d) { tickGutter(w, t * .5); stampIn(sm, t, d * .45); sm.position.x = lerp(-3, 3, eio(t / d)); camTo(w, [-3, 4, 13], [3, 4, 12.6], [-3, 3.2, -1], [3, 3.2, -1], eio(t / d)); } };
};

function marbleScene(second, hitF = .44) {
  return () => {
    const w = street({ bg: second ? 0xf9d7a0 : 0xbfe6ea, signs: second ? SHOP : [] }); lift(w); const m = MS(); place(m, 0, 0, -1, w.scene);
    const mb = marble(.4); w.scene.add(mb); const j = jar(40); place(j, 2.3, 0, -.6, w.scene); j.scale.setScalar(.95); const glow = new THREE.PointLight(C.gold, 0, 16); place(glow, 0, 5, 1, w.scene);
    return { w, update(t, d) {
      tickGutter(w, t); const hit = Math.min(d - .9, d * hitF), jarT = hit + .6;
      let x = 0, y, z = -.8; if (t < hit) { y = lerp(15, 4.2, (t / hit) ** 2); } else { const T = t - hit, f = clamp(T / .6); x = lerp(0, 2.3, f); y = lerp(4.2, 1.8, f * f) + Math.sin(f * Math.PI) * 2.1; z = lerp(-.8, -.6, f); }
      mb.visible = t < jarT + .02; mb.position.set(x, y, z); j.userData.setN((second ? 34 : 24) + (t > jarT ? 1 : 0));
      const after = t > hit; glow.intensity = after ? 120 * Math.exp(-(t - hit) * 2.2) : 0;
      const sq = after ? 1 + Math.sin(clamp((t - hit) / .22) * Math.PI) * -.09 : 1; m.children[0].scale.set(1 / sq, sq, 1 / sq);
      m.pose({ mood: after ? (second ? 'happy' : 'idea') : (second ? 'smug' : 'stare'), head: after ? [0, -.1, 0] : [0, .02, 0], armL: after ? [2.2, .35] : [0, .12], armR: after ? [.5, .9] : [0, .12], lift: after ? Math.exp(-(t - hit) * 3.5) * .3 : 0, look: after ? [0, 0] : [0, 1] });
      camTo(w, [1, 3.4, 14.2], [1, 3.6, 12.6], [1, 3.2, -1], [1, 3.3, -1], eio(t / d), (after && t < hit + .24) ? .035 : 0, t);
    }, overlay(g, t, d) { const hit = Math.min(d - .9, d * hitF); const f = 1 - prog(t, hit, hit + .18); if (t > hit && f > 0) { g.fillStyle = `rgba(255,236,170,${f * .55})`; g.fillRect(0, 0, W, H); } } };
  };
}
F.F = marbleScene(false, .5); F.L = marbleScene(true, .64);

F.G = () => {
  const w = world(0xf7e2a0, { floor: 0xf2d98c, env: .85, sun: 2.3 }); const m = MS(); w.scene.add(m);
  const of = office(); place(of, -2.8, 0, -1.2, w.scene); const hs = mini(); place(hs, 2.8, 0, -1.2, w.scene);
  const la = label('AT WORK', 2.4, .75, { bg: RED, fg: '#fff' }), lb = label('HOME', 2, .75, { bg: GREEN, fg: '#fff' }); place(la, -2.8, 6.6, -.2, w.scene); place(lb, 2.8, 4.7, -.2, w.scene);
  return { w, update(t, d) {
    const h2 = d * .48; popIn(of, t, .02, .9); popIn(la, t, .25); popIn(hs, t, h2 - .05, 1); popIn(lb, t, h2 + .12);
    const r = t > h2; m.pose({ mood: r ? 'happy' : 'sad', armL: r ? [.4, .3] : [1.3, .7], armR: r ? [2.4, .5] : [.4, .3], head: [(r ? 1 : -1) * .3, -.05, 0], look: [(r ? 1 : -1) * .8, .3], blink: blinkAt(t) });
    camTo(w, [0, 4, 25], [0, 4, 23.5], [0, 3.6, 0], [0, 3.6, 0], t / d);
  } };
};

F.H = () => {
  const w = street({ signs: SHOP }); lift(w); const sg = w.houses[3].userData.sign; const m = MS(); place(m, -1.6, 0, -1.6, w.scene); m.rotation.y = .4;
  const pile = [0, 1, 2, 3, 4].map(i => { const p = parcel(.7); place(p, 1 + (i % 3) * .75, Math.floor(i / 3) * .56 + .3, -3.2, w.scene); p.rotation.y = (i % 2 ? .15 : -.1); return p; });
  const pr = label('$1 / BOX', 2.4, .8, { bg: GOLD }); place(pr, 1.6, 2.7, -2.6, w.scene); pr.rotation.z = -.06;
  const tag = label('SEND IT TO #7', 3.8, .85, { bg: PINK }); place(tag, 0, 8.6, -1.8, w.scene);
  const ps = [0, 1].map(i => { const p = townsperson(i + 7); place(p, 6 + i * 2, 0, -.8, w.scene); p.rotation.y = -1.57; hold(p, parcel(.55), 1.6, .75); return p; });
  return { w, update(t, d) {
    tickGutter(w, t); stampIn(sg, t, d * .08); popIn(tag, t, d * .4); pile.forEach((p, i) => popIn(p, t, d * .3 + i * .1)); stampIn(pr, t, d * .76);
    ps.forEach((p, i) => { const q = eio(prog(t, d * .25, d * .95)); p.position.x = lerp(7.5 + i * 2.1, 3.6 + i * 2.1, q); p.pose({ walk: q < .98 ? t * 9 : undefined, mood: 'happy', ...carry }); });
    m.pose({ mood: 'happy', armR: t < d * .1 ? [2.2, .2] : [1.1, .5], armL: [.4, .35], head: t < d * .1 ? [0, -.28, 0] : [.25, 0, 0], look: t < d * .1 ? [0, 1] : [.5, 0], blink: blinkAt(t) });
    camTo(w, [.5, 4.2, 17], [.5, 4.6, 18.5], [.5, 4.3, -1], [.5, 4.6, -1], eio(t / d));
  } };
};

F.I = () => {
  const w = street({ signs: SHOP, sh: 26 }); lift(w); const cnt = label('0 BOXES', 4.4, 1.1, { bg: CREAM }); place(cnt, 0, 10.4, 0, w.scene);
  const n = 60, bx = new THREE.InstancedMesh(new THREE.BoxGeometry(.9, .7, .7), M(CARD, .8), n); bx.castShadow = true; bx.frustumCulled = false; w.scene.add(bx);
  const pos = []; for (let i = 0; i < n; i++) { const l = Math.floor(i / 15), c = i % 15; pos.push([-6.3 + c * .9 + (l % 2) * .4, .36 + l * .72, -2.6 + (c % 2) * .3]); }
  const m = MS(); place(m, 0, 0, .3, w.scene);
  return { w, update(t, d) { tickGutter(w, t); let k = 0; pos.forEach((p, i) => { const a = .05 + i * (d * .75 / n); const pp = prog(t, a, a + .2); if (t > a) k++; setI(bx, i, p[0], p[1] + (1 - pp) * 2, p[2], Math.max(.001, back(pp)), 0, (i % 3 - 1) * .05); }); doneI(bx);
    cnt.userData.set(Math.round(k / n * 300) + ' BOXES'); m.pose({ mood: 'happy', armL: [2.3, .5], armR: [2.3, .5], lift: Math.abs(Math.sin(t * 6)) * .1 });
    camTo(w, [0, 8, 20], [0, 8.6, 18], [0, 3, -1], [0, 2.8, -1], t / d); } };
};

F.J = () => {
  const w = street({ signs: SHOP, bg: 0xd6e6f2, sun: 2.0 }); lift(w); const sn = snow(w);
  const m = MS(); place(m, 0, 0, -.6, w.scene); const cal = label('DECEMBER', 3.6, 1.1, { bg: RED, fg: '#fff' }); cal.rotation.z = .06; place(cal, .6, 6.1, -.6, w.scene);
  return { w, update(t, d) { tickGutter(w, t * .2); sn(t); const b = d * .3, on = t > b; stampIn(cal, t, b);
    m.pose({ mood: on ? 'shock' : 'neutral', armL: on ? [2.6, .4] : [.3, .2], armR: [.3, .2], head: [.3, .35, 0], look: [.5, 1], lift: on ? Math.exp(-(t - b) * 6) * .25 : 0 });
    camTo(w, [0, 3, 14], [0, 2.8, 12.5], [.4, 4.3, -2], [.5, 4.6, -2], t / d, on && t < b + .3 ? .04 : 0, t); } };
};

F.J2 = () => {
  const w = street({ signs: SHOP, bg: 0xd6e6f2, sun: 2.0 }); lift(w); const sn = snow(w, 60);
  const n = 140, r = rand(9), bx = new THREE.InstancedMesh(new THREE.BoxGeometry(1, .8, .8), M(CARD, .8), n); bx.castShadow = true; bx.frustumCulled = false; w.scene.add(bx);
  const pos = []; for (let i = 0; i < n; i++) { const a = (r() - .5) * 3.1, ra = Math.sqrt(r()); const x = Math.sin(a) * ra * 5, z = -2.8 + Math.cos(a) * ra * 1.6, y = (1 - ra) * 5.2 + .4; pos.push([x, y, z, (r() - .5) * .5, (r() - .5) * .5]); }
  const m = MS(); place(m, -.4, 0, 1.4, w.scene); const ps = [0, 1].map(i => { const p = townsperson(i + 3); place(p, i ? 3.4 : -3.8, 0, .9, w.scene); p.rotation.y = i ? -.5 : .5; return p; });
  const q1 = label('MINE?', 1.8, .7, { bg: CREAM }), q2 = label('WHERE?', 2, .7, { bg: CREAM }); place(q1, -3.8, 4.4, .9, w.scene); place(q2, 3.4, 4.4, .9, w.scene);
  return { w, update(t, d) { tickGutter(w, t * .2); sn(t); pos.forEach((p, i) => { const a = i * (d * .4 / n); const q = prog(t, a, a + .25); setI(bx, i, p[0], p[1] + (1 - q) * 6, p[2], q > 0 ? 1 : .001, p[3], p[4]); }); doneI(bx);
    popIn(q1, t, d * .35); popIn(q2, t, d * .45);
    ps.forEach((p, i) => p.pose({ mood: 'sad', armL: [2.4, .4], armR: [2.4, .4], head: [Math.sin(t * 3 + i) * .4, 0, 0] }));
    m.pose({ mood: 'shock', armL: [2.6, .3], armR: [2.6, .3], head: [Math.sin(t * 9) * .25, -.1, 0], lift: Math.abs(Math.sin(t * 8)) * .06 }); camTo(w, [0, 4.4, 15], [0, 4.6, 14], [0, 3.6, -1], [0, 3.6, -1], t / d); } };
};

F.K = () => {
  const w = street({ signs: SHOP, bg: 0xf3b98a, sun: 1.8 }); lift(w); const wg = wagon(6); w.scene.add(wg); const m = MS(); w.scene.add(m); m.rotation.y = 1.57;
  return { w, update(t, d) { tickGutter(w, t * .4); const x = lerp(-9, 3, t / d); wg.position.set(x - 3.2, 0, -.6); wg.userData.roll(t * 5); m.position.set(x, 0, -.6);
    m.pose({ walk: t * 9, mood: 'happy', armR: [.9, -.2], armL: [.3, .1], lean: .12, head: [-.3, 0, 0], blink: blinkAt(t) });
    camTo(w, [x - 1.5, 4.2, 18.5], [x - 1.4, 4, 17.5], [x - 1.5, 2.8, -.6], [x - 1.4, 2.8, -.6], t / d); } };
};

F.K2 = () => {
  const w = street({ signs: [], bg: 0x3d4f7a, sun: 1.1, env: .55 }); const dl = new THREE.PointLight(0xffc47a, 10, 12); place(dl, HX(4) + 1.5, 4.5, -1, w.scene);
  const nb = townsperson(4); place(nb, HX(4), 0, -3.2, w.scene); const m = MS(); place(m, HX(4) - 1.6, 0, -1.6, w.scene); m.rotation.y = .7; const pk = parcel(.6); hold(m, pk, 1.6, .75);
  const cl = label('6 PM', 2, .8, { bg: GOLD }); place(cl, HX(4) - 2.6, 5.4, -2.4, w.scene); const wg = wagon(4); place(wg, HX(4) - 4.6, 0, -.6, w.scene);
  return { w, update(t, d) { tickGutter(w, t * .3); popIn(cl, t, .05); const gv = t > d * .5; m.pose({ mood: 'happy', armL: gv ? [1.7, .1] : [1.35, .12], armR: gv ? [1.7, .1] : [1.35, .12], head: [.2, 0, 0], blink: blinkAt(t) });
    pk.position.z = gv ? lerp(.75, 1.4, eo(prog(t, d * .5, d * .7))) : .75;
    nb.pose({ mood: gv ? 'happy' : 'neutral', armL: gv ? [2.3, .4] : [.2, .1], armR: gv ? [2.3, .4] : [.2, .1], lift: gv ? Math.abs(Math.sin(t * 9)) * .1 : 0 });
    camTo(w, [HX(4) - 1, 3.7, 9], [HX(4) - .8, 3.6, 8], [HX(4) - .6, 2.6, -2.4], [HX(4) - .6, 2.6, -2.4], t / d); } };
};

F.M = () => {
  const w = world(0xf2a9a0, { floor: 0xe89389, env: .85, sun: 2.3 }); const m = MS(); place(m, 0, 0, -1.4, w.scene);
  place(box(4.2, .14, 1.8, 0xfbf7ee, .04), 0, 1.5, .2, w.scene); place(box(4, 1.4, 1.6, 0x7b5fc7, .05), 0, .75, .2, w.scene);
  const a = parcel(.9); place(a, 0, 1.57, .25, w.scene); const b = parcel(.9, C.red, C.gold); place(b, 0, 1.57, .25, w.scene);
  const done = [0, 1].map(i => { const p = parcel(.6, i ? 0x2fa36b : C.blue, C.gold); place(p, i ? 1.5 : -1.5, 1.57, .3, w.scene); return p; });
  const gw = label('GIFT WRAP', 3.2, .8, { bg: GOLD }); place(gw, 0, 4.45, -1.6, w.scene);
  return { w, update(t, d) { const sw = d * .45; a.visible = t < sw; b.visible = t >= sw; b.scale.setScalar(Math.max(.001, .9 * back(prog(t, sw, sw + .3)))); done.forEach((p, i) => popIn(p, t, .05 + i * .1, .6)); popIn(gw, t, d * .5);
    m.pose({ mood: t > sw ? 'happy' : 'neutral', armL: [1.5 + Math.sin(t * 14) * .2, .25], armR: [1.5 - Math.sin(t * 14) * .2, .25], head: [0, .3, 0], look: [0, -.7], blink: blinkAt(t) });
    camTo(w, [0, 4.4, 10], [0, 4.2, 9], [0, 2.4, -.2], [0, 2.4, -.2], t / d); } };
};

F.M2 = () => {
  const w = street({ signs: SHOP, sh: 26, bg: 0xd6e6f2 }); lift(w); const sn = snow(w, 50); const m = MS(); place(m, -1.2, 0, -.8, w.scene);
  const a = label('$1', 2.2, 1.1, { bg: CREAM }), b = label('$3', 2.6, 1.3, { bg: GOLD }), fr = label('EVERY DECEMBER', 4, .8, { bg: RED, fg: '#fff' }); place(a, 1.6, 6.2, -.8, w.scene); place(b, 1.6, 6.2, -.7, w.scene); place(fr, 1.6, 5.05, -.7, w.scene);
  for (let i = 0; i < 8; i++) { const p = parcel(.62, [C.red, 0x2fa36b, C.blue, 0x7b5fc7][i % 4], C.gold); place(p, -4.6 + (i % 4) * .8, Math.floor(i / 4) * .58, -2.8, w.scene); }
  [0, 1, 2, 3, 4].forEach(i => { const p = townsperson(i + 3); place(p, 3 + i * 1.8, 0, -.4, w.scene); p.rotation.y = -1.57; p.pose({ mood: 'happy', armL: [.2, .1], armR: [.2, .1] }); });
  return { w, update(t, d) { tickGutter(w, t); sn(t); popIn(a, t, .05); const sw = d * .28; a.visible = t < sw; stampIn(b, t, sw); popIn(fr, t, d * .55); m.pose({ mood: t > d * .5 ? 'smug' : 'happy', armL: [.2, .35], armR: [.2, .35], head: [0, -.08, 0], blink: blinkAt(t) }); camTo(w, [1.6, 4.4, 17], [1.6, 4.4, 15.5], [1.6, 3.8, -1], [1.6, 3.8, -1], t / d); },
    overlay(g, t, d) { stamp2d(g, t, d * .5, 'SOLD OUT', 900); } };
};

F.N = () => {
  const w = street({ signs: SHOP }); lift(w); const lk = lockers(); place(lk, HX(4) + 1.2, 0, -2.3, w.scene); const rb = robot(); w.scene.add(rb);
  const m = MS(); place(m, HX(4) - 2.4, 0, -.6, w.scene); m.rotation.y = .9; const pr = label('FREE', 2.4, .9, { bg: RED, fg: '#fff' }); place(pr, HX(4) + 1.2, 6.2, -1.4, w.scene);
  return { w, update(t, d) { tickGutter(w, t); const q = eo(prog(t, .1, d * .45)); stampIn(lk, t, .05); rb.position.set(lerp(HX(4) + 6.5, HX(4) - .9, q), 0, -.2); rb.rotation.y = -q * .5; rb.userData.arm.rotation.x = -1 + Math.sin(t * 5) * .3; stampIn(pr, t, d * .7);
    m.pose({ mood: t > d * .45 ? 'shock' : 'neutral', head: [.4, 0, 0], look: [.6, .2], armL: [.2, .2], armR: [.2, .2], blink: blinkAt(t) }); camTo(w, [HX(4) + .5, 4.8, 24], [HX(4) + .5, 4.8, 22.5], [HX(4) + .5, 3.8, -1], [HX(4) + .5, 3.8, -1], t / d); } };
};

F.N2 = () => {
  const w = world(0x9aa6b8, { floor: 0x7f8aa0, env: .7, sun: 1.9, sh: 14, far: 70 }); place(box(40, 14, .3, 0xb7c0cf, .02), 0, 7, -5, w.scene);
  const lk = lockers(); place(lk, 1.2, 0, -2.6, w.scene); const rb = robot(); place(rb, -2.2, 0, -.6, w.scene); rb.rotation.y = .6;
  const ps = [0, 1].map(i => { const p = townsperson(i + 5); place(p, i ? 4.4 : -4.4, 0, .4, w.scene); p.rotation.y = i ? -.6 : .6; return p; });
  return { w, update(t, d) { const b = d * .3, off = t > b;
    lk.userData.lights.forEach((em, i) => { em.color.set(off ? 0xff3b30 : 0x3fd67a); em.emissive.set(off ? 0xff3b30 : 0x3fd67a); em.emissiveIntensity = off ? (Math.sin(t * 18 + i) > 0 ? 2 : .4) : 1.4; });
    rb.userData.arm.rotation.x = off ? -1.6 + Math.sin(t * 26) * .35 : -1; rb.position.x = -2.2 + (off ? Math.sin(t * 30) * .05 : 0); rb.userData.em.color.set(off ? 0xff3b30 : 0x37c6ff); rb.userData.em.emissive.set(off ? 0xff3b30 : 0x37c6ff);
    ps.forEach((p, i) => p.pose({ mood: off ? 'shock' : 'neutral', armL: off ? [2.5, .4] : [.2, .1], armR: off ? [2.5, .4] : [.2, .1], lift: off ? Math.abs(Math.sin(t * 8 + i)) * .08 : 0 }));
    camTo(w, [.4, 4.2, 19], [.4, 4, 17.5], [.4, 3, -1.5], [.4, 2.9, -1.5], t / d, off && t < b + .3 ? .04 : 0, t); },
    overlay(g, t, d) { stamp2d(g, t, d * .38, 'JAMMED', 1500, RED, 130); } };
};

F.O = () => {
  const w = street({ signs: SHOP }); lift(w); const m = MS(); place(m, -1.4, 0, -2.2, w.scene); m.rotation.y = .5;
  const bs = person(BOSS); w.scene.add(bs); bs.rotation.y = -1.57; hold(bs, parcel(.55), 1.6, .75); const lb = label('MEGASOCK BOSS', 2.8, .6, { bg: RED, fg: '#fff' }); w.scene.add(lb);
  return { w, update(t, d) { tickGutter(w, t); const q = eio(prog(t, 0, d * .7)); bs.position.set(lerp(7, 1.4, q), 0, -1.6); lb.position.set(bs.position.x, 3.95, -1.4); popIn(lb, t, .15);
    bs.pose({ walk: q < .98 ? t * 9 : undefined, mood: q < .98 ? 'sad' : 'shock', ...carry, head: [0, .1, 0] });
    m.pose({ mood: 'smug', ...crossed, head: [.4, 0, 0], look: [.6, 0], blink: blinkAt(t) }); camTo(w, [.6, 4.2, 16], [.4, 4, 14.6], [.6, 3.2, -1.6], [.4, 3.2, -1.6], t / d); } };
};

F.Q = () => {
  const w = street({ signs: ALL, bg: 0xbfe6ea, sh: 40, far: 150 }); lift(w);
  const m = MS(); place(m, 0, 0, -2.6, w.scene); const n = 16; for (let i = 0; i < n; i++) { const p = townsperson(i + 2); place(p, 2 + i * 1.55, 0, -.9, w.scene); p.rotation.y = -1.57; hold(p, parcel(.5), 1.6, .75); p.pose({ mood: 'happy', ...carry, head: [0, 0, 0] }); }
  [0, 1, 2, 3].forEach(i => { const p = parcel(.7, i % 2 ? CARD : C.red, i % 2 ? null : C.gold); place(p, -1.8 - i * .8, 0, -2.9, w.scene); });
  const wl = label('WAITING LIST', 4.2, .9, { bg: GOLD }); place(wl, 13, 5.6, -.9, w.scene);
  return { w, update(t, d) { tickGutter(w, t * 2); popIn(wl, t, d * .35); m.pose({ mood: 'happy', armL: [2.3, .55], armR: [2.3, .55], head: [0, -.05, 0], lift: Math.abs(Math.sin(t * 5)) * .15 }); camTo(w, [0, 3.6, 13], [6, 10, 38], [0, 3.6, -2], [6, 4.5, -2], eio(t / d)); } };
};

F.R = () => {
  const w = street({ signs: SHOP }); lift(w); const m = MS(); place(m, -1.25, 0, -2.2, w.scene); m.rotation.y = .3; const nt = note(); place(nt, -.05, 1.8, DOORZ, w.scene);
  return { w, update(t, d) { tickGutter(w, t * .3); stampIn(nt, t, .05); m.pose({ mood: 'stare', armL: [.2, .2], armR: [.2, .2], head: [0, .1, 0], blink: blinkAt(t) });
    camTo(w, [-.3, 3.2, 7.6], [-.4, 3, 6.6], [-.6, 2.6, DOORZ], [-.6, 2.5, DOORZ], eio(t / d)); },
    overlay(g, t, d) { sticky(g, t, d * .35, ['SORRY', 'WE MISSED', 'YOU'], 640); stamp2d(g, t, d * .7, 'AGAIN', 1060, RED, 120); } };
};

F.S = () => {
  const w = street({ signs: SHOP }); lift(w); const m = MS(); place(m, 0, 0, -1.2, w.scene); hold(m, note(), 1.75, .9); let sw = 1;
  return { w, update(t, d, P) { tickGutter(w, t * .4); sw = P ? P('S2', 0) : d * .33;
    m.pose({ mood: 'happy', armL: [1.7, .15], armR: [1.7, .15], head: [0, t < sw ? -.15 : .25, 0], look: t < sw ? [0, 0] : [0, -.7], lift: t < sw ? Math.abs(Math.sin(t * 14)) * .12 : 0, lean: t < sw ? -.08 : 0, blink: blinkAt(t) });
    camTo(w, [0, 3.6, 10], [0, 3.5, 8.6], [0, 3.2, -1.2], [0, 3.1, -1.2], eio(t / d)); },
    overlay(g, t, d) { sticky(g, t, sw + .1, ['YOUR PARCEL', 'IS AT', 'HOUSE 7'], 680, 'SIGNED: PORCH 7'); } };
};

F.Z = recap(['MISSED DELIVERIES', 'HOLD PARCELS, $1 A BOX', '$1,000,000'], ALL);
