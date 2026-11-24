import * as THREE from 'three';
import { recap } from './recap.js';
import { C, M, W, H, world, box, cyl, sph, mesh, place, prog, eio, eo, back, lerp, clamp, camTo, label, setI, doneI, rand } from './world.js';
import { marlo, person } from './marlo.js';
import { jar, marble, street, tickGutter, townsperson, PAT } from './sets.js';

const popIn = (o, t, a, s = 1, dur = .35) => { const p = prog(t, a, a + dur); o.visible = p > 0; o.scale.setScalar(Math.max(.0001, back(p) * s)); };
const stampIn = (o, t, a, s = 1) => { const p = prog(t, a, a + .24); o.visible = p > 0; o.scale.setScalar(p <= 0 ? .0001 : lerp(2.3, 1, eo(p)) * s); };
const blinkAt = t => (Math.sin(t * 3.1) > .985 ? .1 : 1);
const MS = () => marlo({ sockL: PAT.stripe(), sockR: PAT.dots() });
const GOLD = '#f5b700', RED = '#e4572e', CREAM = '#fbf7ee', INK = '#14213d';
export const F = {};

// ---------- props
const potG = new THREE.CylinderGeometry(.42, .32, .62, 20), rimG = new THREE.CylinderGeometry(.46, .46, .1, 20), soilG = new THREE.CylinderGeometry(.4, .4, .04, 20), leafG = new THREE.SphereGeometry(1, 12, 8);
const GREENC = new THREE.Color(0x3fae5a), BROWN = new THREE.Color(0xa8773f);
const SPEC = { fern: [9, [.15, .85, .06], .5], monstera: [5, [.42, .5, .07], .62], cactus: [1, [.3, .72, .3], 0] };
export function plant(kind = 'fern', s = 1, potC = 0xc8643b) {
  const g = new THREE.Group(); const pm = M(potC, .75);
  const pot = new THREE.Mesh(potG, pm); pot.castShadow = true; place(pot, 0, .31, 0, g);
  place(new THREE.Mesh(rimG, pm), 0, .6, 0, g); place(new THREE.Mesh(soilG, M(0x4a3322, .9)), 0, .64, 0, g);
  const mat = new THREE.MeshStandardMaterial({ color: kind === 'cactus' ? 0x4f9d5a : 0x3fae5a, roughness: .6 }), base = mat.color.clone(); const tilts = []; const sp = SPEC[kind];
  for (let i = 0; i < sp[0]; i++) {
    const pv = new THREE.Group(); pv.rotation.y = i / sp[0] * 6.283 + (i % 2) * .3; place(pv, 0, .64, 0, g);
    const tl = new THREE.Group(); pv.add(tl); const lf = new THREE.Mesh(leafG, mat); lf.castShadow = true;
    const L = sp[1][1] * (i % 2 ? .85 : 1); lf.scale.set(sp[1][0], L, sp[1][2]); place(lf, 0, L, 0, tl); tl.userData.base = sp[2] + (i % 3) * .12; tilts.push(tl);
  }
  g.userData.set = h => { mat.color.copy(BROWN).lerp(base, h); tilts.forEach((t, i) => { t.rotation.x = kind === 'cactus' ? (1 - h) * .8 : lerp(1.6 + (i % 2) * .15, t.userData.base, h); t.scale.setScalar(lerp(.8, 1, h)); }); };
  g.userData.set(1); g.scale.setScalar(s); return g;
}
const KINDS = ['fern', 'monstera', 'cactus'], POTS = [0xc8643b, 0x5aa9e6, 0xf2a9a0, 0xf7e2a0, 0x7b5fc7, 0xfbf7ee];
function suitcase(c = 0x2e86ff, s = 1) { const g = new THREE.Group(); place(box(1.1, 1.4, .5, c, .14, .5), 0, .78, 0, g); place(box(1.12, .14, .52, C.ink, .05), 0, .78, 0, g); const hd = mesh(new THREE.TorusGeometry(.22, .05, 8, 20, Math.PI), M(C.ink, .4)); place(hd, 0, 1.48, 0, g); [-.35, .35].forEach(x => place(sph(.09, C.ink), x, .08, 0, g)); g.scale.setScalar(s); return g; }
function wcan() { const g = new THREE.Group(); const c = 0x7fd6b5; place(cyl(.32, .36, .6, c, 20), 0, .3, 0, g); const sp = cyl(.05, .09, .85, c, 10); sp.rotation.z = -1.0; place(sp, .58, .48, 0, g); const hd = mesh(new THREE.TorusGeometry(.24, .045, 8, 20, Math.PI), M(c, .5)); hd.rotation.z = Math.PI / 2; place(hd, -.34, .34, 0, g); return g; }
function tree(s = 1) { const g = new THREE.Group(); place(cyl(.35, .5, 4, 0x8b5a2b, 14, .8), 0, 2, 0, g); [[0, 5, 0, 2.6], [-1.6, 4.3, .3, 1.9], [1.7, 4.4, -.2, 2], [0, 6.4, -.3, 1.8]].forEach(([x, y, z, r]) => place(sph(r, M(0x5fbf6a, .8)), x, y, z, g)); g.scale.setScalar(s); return g; }
function shades() { const g = new THREE.Group(); [-.17, .17].forEach(x => { const l = cyl(.14, .14, .05, M(0x0b1224, .15, .3), 20); l.rotation.x = Math.PI / 2; place(l, x, 0, 0, g); }); place(box(.24, .04, .04, 0x0b1224, .01), 0, .03, 0, g); return g; }
function chair(c = 0x2e86ff) { const g = new THREE.Group(); const s = box(1.3, .12, 1.1, c, .04); s.rotation.x = -.15; place(s, 0, .55, 0, g); const b = box(1.3, 1.2, .12, c, .04); b.rotation.x = -.35; place(b, 0, 1.05, -.55, g); [[-.55, .5], [.55, .5], [-.55, -.5], [.55, -.5]].forEach(([x, z]) => place(cyl(.04, .04, .6, 0xe6dbc1, 8), x, .28, z, g)); return g; }
function umbrella(a = 0xe4572e, b = 0xfbf7ee) { const g = new THREE.Group(); place(cyl(.05, .05, 3.6, 0xe6dbc1, 8), 0, 1.8, 0, g); for (let i = 0; i < 8; i++) { const c = mesh(new THREE.ConeGeometry(2, .7, 16, 1, true, i / 8 * 6.283, 6.283 / 8), M(i % 2 ? a : b, .6)); c.material.side = THREE.DoubleSide; place(c, 0, 3.75, 0, g); } return g; }
function robot() {
  const g = new THREE.Group(); place(cyl(.6, .6, .5, 0x5b6a82, 22), 0, .3, 0, g); place(box(1.3, 1.5, 1, 0xc9ced8, .22, .35), 0, 1.35, 0, g); place(box(1.1, .8, .9, 0xdfe3ea, .22, .3), 0, 2.55, 0, g);
  [-.25, .25].forEach(x => place(sph(.12, M(0x37c6ff, .2, 0, { emissive: 0x37c6ff, emissiveIntensity: 1.6 })), x, 2.6, .46, g)); place(cyl(.03, .03, .5, C.ink, 8), 0, 3.15, 0, g); place(sph(.1, 0xe4572e), 0, 3.42, 0, g);
  const lg = label('MEGA', 1, .38, { bg: RED, fg: '#fff', rad: 20 }); place(lg, 0, 1.6, .52, g);
  const arm = new THREE.Group(); place(arm, .78, 1.85, 0, g); place(box(.22, .9, .22, 0x9aa2b2, .08), 0, -.4, 0, arm); const cn = wcan(); cn.scale.setScalar(.7); place(cn, .1, -.95, .2, arm); g.userData.arm = arm; return g;
}
const LEE = { top: 0x7b5fc7, pant: 0x3c4560, skin: 0xf0c49c, hair: 0xd9d9e0, style: 'bun', sockL: 0xfbf7ee, sockR: 0xfbf7ee, shoe: 0x7b5fc7 };
const lee = () => person(LEE);
const hold = (p, o, y = 1.3, z = 1.0) => { place(o, 0, y, z, p); return o; };
const HX = i => (i - 3) * 6.55; // house x on Marble Street; 3 = Marlo, 4 = Mrs. Lee
const lift = (w, y = 4.8) => w.houses.forEach(h => { if (h.userData.sign) h.userData.sign.position.y = y; });
const HOTEL = ['', '', '', 'PLANT HOTEL', '', '', ''];
function windowPlants(w, rng = rand(9)) { const out = []; for (let i = 0; i < 7; i++) [-1.95, 1.95].forEach(dx => { const p = plant(KINDS[out.length % 3], .5, POTS[out.length % 6]); place(p, HX(i) + dx, 1.36, -3.72, w.scene); out.push(p); }); return out; }

// ---------- 2D overlays (polaroid, phone, prompt)
let tmp = null;
function photoCard(g, t, cap, o = {}) {
  if (!tmp) { tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H; } tmp.getContext('2d').drawImage(g.canvas, 0, 0);
  const p = eo(prog(t, o.at ?? 0, (o.at ?? 0) + .35)); if (p <= 0) return;
  g.fillStyle = o.table ?? '#2a2238'; g.globalAlpha = Math.min(1, p * 1.4); g.fillRect(0, 0, W, H); g.globalAlpha = 1;
  const pw = 700, cw = pw + 80, ch = pw + 190, cx = 540, cy = 255 + ch / 2 + (1 - p) * 900;
  g.save(); g.translate(cx, cy); g.rotate((o.rot ?? -.04) * (1 + (1 - p) * 3));
  g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 40; g.shadowOffsetY = 18; g.fillStyle = '#fbf7ee'; g.fillRect(-cw / 2, -ch / 2, cw, ch); g.shadowColor = 'transparent';
  g.drawImage(tmp, (W - 900) / 2, o.sy ?? 420, 900, 900, -pw / 2, -ch / 2 + 40, pw, pw);
  g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle'; let fs = 52; g.font = `${fs}px "Archivo Black"`; while (g.measureText(cap).width > cw - 80) { fs *= .95; g.font = `${fs}px "Archivo Black"`; }
  g.fillText(cap, 0, ch / 2 - 75);
  if (o.stamp) { g.save(); g.translate(cw / 2 - 95, -ch / 2 + 110); g.rotate(.2); g.strokeStyle = o.stampC ?? RED; g.lineWidth = 7; g.beginPath(); g.arc(0, 0, 62, 0, 7); g.stroke(); g.fillStyle = o.stampC ?? RED; g.font = '22px "Archivo Black"'; g.fillText(o.stamp, 0, 2); g.restore(); }
  g.restore();
  const fl = 1 - prog(t, o.at ?? 0, (o.at ?? 0) + .12); if (fl > 0 && o.flash) { g.fillStyle = `rgba(255,255,255,${fl})`; g.fillRect(0, 0, W, H); }
}
function banner(g, t, a, txt, bg = GOLD, fg = INK, y = 560) {
  const p = prog(t, a, a + .3); if (p <= 0) return; const s = back(p); g.save(); g.translate(540, y); g.scale(s, s); g.rotate(-.03);
  g.font = '74px "Archivo Black"'; const w = g.measureText(txt).width + 90; g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 24; g.shadowOffsetY = 10;
  g.fillStyle = bg; g.beginPath(); g.roundRect(-w / 2, -70, w, 140, 40); g.fill(); g.shadowColor = 'transparent'; g.lineWidth = 8; g.strokeStyle = INK; g.stroke();
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 6); g.restore();
}

// ---------- the living room
function room(o = {}) {
  const w = world(o.bg ?? 0xf3d9b1, { floor: 0xc99b6a, env: .9, sun: 2.2, sh: 12, far: 60 }); const sc = w.scene;
  place(box(40, 18, .4, 0xf3d9b1, .02, .9), 0, 9, -4.2, sc); place(box(40, .45, .3, 0xe2c393, .02, .8), 0, .22, -3.9, sc);
  place(box(3.4, 2.8, .14, 0xfbf7ee, .05), -4.6, 5.2, -3.95, sc); place(box(3, 2.4, .1, 0xbfe6ea, .03, .2), -4.6, 5.2, -3.87, sc); place(box(.12, 2.4, .12, 0xfbf7ee, .02), -4.6, 5.2, -3.8, sc);
  place(box(4.4, 1, 1.7, 0x2fa4a8, .2, .8), 2.6, .5, -2.6, sc); place(box(4.4, 1.5, .5, 0x2fa4a8, .2, .8), 2.6, 1.6, -3.35, sc); [.6, 4.6].forEach(x => place(box(.5, 1.5, 1.7, 0x268c90, .2, .8), x, .75, -2.6, sc));
  place(box(2, .14, 1.3, 0xb07a4a, .05, .6), -2.4, 1.6, -2.4, sc); [[-3.2, -1.9], [-1.6, -1.9], [-3.2, -2.9], [-1.6, -2.9]].forEach(([x, z]) => place(cyl(.07, .07, 1.55, 0x8a5a35, 8), x, .78, z, sc));
  const cal = new THREE.Group(); place(cal, -.6, 6.6, -3.95, sc); place(box(2.4, 2.6, .08, 0xfbf7ee, .06), 0, 0, 0, cal); place(box(2.4, .5, .1, 0xe4572e, .06), 0, 1.1, .01, cal);
  const day = label('DAY 1', 2.2, 1.6, { bg: null, fg: INK }); place(day, 0, -.2, .06, cal); cal.userData.day = day;
  const fern = plant('fern', .78); place(fern, -2.4, 1.67, -2.4, sc);
  return { w, cal, fern };
}
const sit = (m, o = {}) => m.pose({ legL: -1.22, legR: -1.22, lift: -.92, armL: o.armL || [.25, .1], armR: o.armR || [.25, .1], mood: o.mood || 'neutral', head: o.head || [0, .1, 0], look: o.look, blink: o.blink });

// ================= SCENES
F.A = () => {
  const { w } = room(); const m = MS(); place(m, 0, 0, 0, w.scene); const f = hold(m, plant('fern', .62), 1.15, 1.05); f.userData.set(.02);
  const rip = new THREE.Group(); place(rip, .1, .62, .1, f); place(box(.05, .7, .05, 0x8a5a35, .01), 0, .35, 0, rip); const rl = label('RIP', .62, .34, { bg: '#e6dbc1', fg: INK, rad: 12 }); place(rl, 0, .72, .04, rip);
  const lf = mesh(leafG, M(0xa8773f, .6)); lf.scale.set(.1, .45, .04); w.scene.add(lf);
  return { w, update(t, d) {
    m.pose({ mood: 'sad', armL: [1.3, .22], armR: [1.3, .22], head: [0, .18, 0], look: [0, -.5], blink: blinkAt(t + 1) });
    const q = prog(t, .25, d); lf.position.set(.35 + Math.sin(t * 5) * .3, lerp(2.4, .1, q), 1.4); lf.rotation.z = t * 3;
    camTo(w, [0, 3.2, 9], [0, 3.1, 7.6], [0, 2.7, 0], [0, 2.75, 0], eo(t / d));
  } };
};

F.A2 = () => {
  const w = world(0x1f6f78, { floor: 0x2b858f, env: .7, sun: 2.5, sh: 16 }); const n = 170, r = rand(5);
  const pots = new THREE.InstancedMesh(potG, M(0xffffff, .75), n), lv = new THREE.InstancedMesh(new THREE.SphereGeometry(.42, 14, 10), M(0xffffff, .6), n); [pots, lv].forEach(x => { x.castShadow = true; x.frustumCulled = false; w.scene.add(x); });
  const col = new THREE.Color(); for (let i = 0; i < n; i++) { const a = r() * 6.28, q = Math.sqrt(r()), ra = q * 8, y = (1 - q) * 4.4 + r() * .25, x = Math.cos(a) * ra, z = Math.sin(a) * ra - 1; setI(pots, i, x, y + .3, z, 1, (r() - .5) * .4, (r() - .5) * .4); setI(lv, i, x, y + 1.05, z, .9 + r() * .4); pots.setColorAt(i, col.set(POTS[i % 6])); lv.setColorAt(i, col.set([0x3fae5a, 0x5fbf6a, 0x2f8f4a][i % 3])); } [pots, lv].forEach(x => { x.instanceMatrix.needsUpdate = true; x.instanceColor.needsUpdate = true; });
  const m = MS(); place(m, 0, 5, 0, w.scene);
  const N = 46, ms = new THREE.InstancedMesh(new THREE.SphereGeometry(.28, 18, 12), M(C.gold, .14, .55), N); ms.castShadow = true; ms.frustumCulled = false; w.scene.add(ms);
  const Dd = []; for (let i = 0; i < N; i++) Dd.push({ x: (r() - .5) * 7, z: (r() - .5) * 3 - 1.5, o: r() * 1.5, sp: 6 + r() * 4 });
  return { w, update(t, d) {
    Dd.forEach((p, i) => { const y = 16 - ((t + p.o) % 2.2) * p.sp; setI(ms, i, p.x, y < .3 ? -9 : y, p.z); }); doneI(ms);
    m.pose({ mood: 'happy', armL: [2.4, .55 + Math.sin(t * 9) * .12], armR: [2.4, .55 - Math.sin(t * 9) * .12], lift: Math.abs(Math.sin(t * 7)) * .22, head: [0, -.08, 0] });
    camTo(w, [0, 6.4, 21], [0, 7.2, 16.5], [0, 7, 0], [0, 7.9, 0], eo(t / d));
  } };
};

F.B = () => {
  const w = street({ signs: [] }); const x = HX(4); const L = lee(); place(L, x + .9, 0, -2.4, w.scene); L.rotation.y = -1.2;
  const m = MS(); place(m, x - 1.5, 0, -2.4, w.scene); m.rotation.y = 1.2; const sc = suitcase(0x2e86ff); place(sc, x + 2.1, .1, -2.4, w.scene); sc.rotation.y = -.4;
  const f = plant('fern', .62); w.scene.add(f);
  const a = label('2 WEEKS', 3, .9, { bg: CREAM }), b = label('WATER IT', 3, .9, { bg: '#2e86ff', fg: '#fff' }); place(a, x - .3, 6.9, -2.4, w.scene); place(b, x - .3, 5.85, -2.4, w.scene);
  return { w, update(t, d) {
    tickGutter(w, t); const give = eio(prog(t, d * .3, d * .5)), go = prog(t, d * .62, d);
    const lx = lerp(x + .9, x + 9, eio(go)); L.position.x = lx; L.rotation.y = go > 0 ? 1.57 : -1.2; sc.position.x = lx + .95; sc.rotation.y = go > 0 ? 0 : -.4;
    f.position.set(lerp(x + .1, x - .7, give), 1.25 + Math.sin(give * Math.PI) * .25, -2.4 + .7);
    L.pose({ walk: go > 0 ? t * 10 : undefined, mood: 'happy', armL: go > 0 ? [.2, .1] : [lerp(1.3, .2, prog(t, d * .5, d * .6)), .2], armR: go > 0 ? [.3, .35] : [lerp(1.3, .2, prog(t, d * .5, d * .6)), .2], head: [0, 0, 0] });
    m.pose({ mood: give > .9 ? 'smug' : 'neutral', armL: [give > .5 ? 1.25 : .3, .2], armR: [give > .5 ? 1.25 : .3, .2], head: [0, 0, 0], blink: blinkAt(t) });
    popIn(a, t, .15); popIn(b, t, d * .58); camTo(w, [x - .3, 4.2, 13.5], [x - .3, 4.3, 12.5], [x - .3, 3.8, -2.4], [x - .3, 3.9, -2.4], t / d);
  } };
};

function forgetScene(late) {
  return () => {
    const { w, cal, fern } = room(); const m = MS(); place(m, 2.4, 1.0, -2.3, w.scene); const day = cal.userData.day; const mb = marble(.22); w.scene.add(mb);
    const st = [0, 1].map(() => { const l = label('FORGOT', 3, .95, { bg: null, fg: RED, border: RED, rad: 26 }); l.rotation.z = .12; place(l, -2.4, 4.9, -1.7, w.scene); l.visible = false; return l; });
    const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(.09, 10, 8), M(0x5aa9e6, .1), 30); drops.frustumCulled = false; w.scene.add(drops);
    const cn = wcan(); cn.visible = false; w.scene.add(cn);
    return { w, update(t, d) {
      if (!late) {
        const k = t < d * .5 ? 1 : 2; day.userData.set('DAY ' + k); fern.userData.set(lerp(1, .78, t / d));
        stampIn(st[0], t, d * .28); if (t > d * .5) st[0].visible = false; stampIn(st[1], t, d * .78);
        const y = 3.3 + Math.abs(Math.sin(t * 4.4)) * 1.8; mb.position.set(3.2, y, -1.9);
        sit(m, { mood: 'happy', armR: [1.0 + Math.abs(Math.sin(t * 4.4)) * .3, .25], armL: [.25, .1], head: [0, -.2, 0], look: [.3, .8], blink: blinkAt(t) });
        camTo(w, [0, 4.3, 15.5], [0, 4.3, 14.5], [0, 3.6, -2.4], [0, 3.6, -2.4], t / d);
      } else {
        const fl = prog(t, 0, d * .38), k = Math.min(14, 3 + Math.floor(fl * 12)); day.userData.set('DAY ' + k); fern.userData.set(lerp(.6, .03, fl));
        cal.scale.setScalar(k === 14 ? 1 + .25 * Math.max(0, 1 - (t - d * .38) / .3) : 1);
        const up = prog(t, d * .4, d * .55), wk = prog(t, d * .52, d * .78); mb.visible = false;
        m.position.set(lerp(2.4, -.9, eio(wk)), up > 0 ? lerp(1.0, 0, up) : 1.0, lerp(-2.3, -2.0, wk)); m.rotation.y = wk > 0 ? -1.2 : 0;
        if (up <= 0) sit(m, { mood: 'shock', head: [.4, -.25, 0], look: [-.6, .8] }); else m.pose({ walk: wk > 0 && wk < 1 ? t * 12 : undefined, mood: wk >= 1 ? 'idea' : 'shock', armR: wk >= 1 ? [1.6, .1] : undefined, armL: [.3, .2], head: [0, 0, 0] });
        cn.visible = wk > .3; cn.position.set(m.position.x - 1.0 * Math.cos(-1.2) * 0 - .9, 2.75, m.position.z + .55); cn.rotation.set(0, 3.14, wk >= 1 ? -.6 : 0);
        const pour = prog(t, d * .8, d); for (let i = 0; i < 30; i++) { const q = ((i / 30) + t * 1.8) % 1; setI(drops, i, -2.15 + Math.sin(i) * .15, lerp(2.7, 1.8, q), -2.25 + Math.cos(i * 2) * .1, pour > 0 ? 1 : .001); } doneI(drops);
        camTo(w, [-.2, 4.3, 16], [-1.2, 4, 14.5], [-.2, 3.6, -2.4], [-1.2, 3.3, -2.4], eio(t / d));
      }
    } };
  };
}
F.C = forgetScene(false); F.C2 = forgetScene(true);

F.D = () => {
  const w = street({ signs: [] }); const x = HX(4); const L = lee(); place(L, x + .8, 0, -2.6, w.scene); L.rotation.y = -1.0; const sc = suitcase(); place(sc, x + 2, .1, -2.6, w.scene);
  const m = MS(); place(m, x - 1.3, 0, -2.4, w.scene); m.rotation.y = 1.1; const f = hold(m, plant('fern', .62), 1.25, 1.05); f.userData.set(.03);
  const lf = mesh(leafG, M(0xa8773f, .6)); lf.scale.set(.1, .45, .04); w.scene.add(lf);
  return { w, update(t, d) {
    tickGutter(w, t * .4); m.pose({ mood: 'smug', armL: [1.25, .2], armR: [1.25, .2], head: [-.2, 0, 0], look: [-.3, 0], blink: blinkAt(t) });
    const s = t > d * .35; L.pose({ mood: s ? 'shock' : 'happy', armL: s ? [2.4, .5] : [.2, .1], armR: s ? [2.4, .5] : [.3, .3], head: [0, s ? -.1 : 0, 0], lift: s ? Math.exp(-(t - d * .35) * 6) * .25 : 0 });
    const q = prog(t, d * .3, d); lf.position.set(x - .25 + Math.sin(t * 6) * .25, lerp(2.4, .15, q), -1.1); lf.rotation.z = t * 4;
    camTo(w, [x - .2, 3.7, 10.5], [x - .2, 3.7, 9.3], [x - .2, 3.3, -2.5], [x - .2, 3.3, -2.5], t / d);
  } };
};

F.D2 = () => {
  const w = street({ signs: [], sh: 34, far: 150 }); windowPlants(w); const cs = [0x2e86ff, 0xf5b700, 0x7fd6b5, 0x7b5fc7, 0xf2a9a0, 0x2fa4a8, 0x5aa9e6];
  const sv = [0, 1, 2, 4, 5, 6].map(i => { const s = suitcase(cs[i]); place(s, HX(i) + 1.1, .1, -3.0, w.scene); s.rotation.y = -.3; return s; });
  const m = MS(); place(m, 0, 0, 1.4, w.scene); const a = label('SUITCASES', 3.6, .9, { bg: '#2e86ff', fg: '#fff' }), b = label('PLANTS', 3, .9, { bg: '#3fae5a', fg: '#fff' }); place(a, -6.5, 9.4, -2, w.scene); place(b, 6.5, 9.4, -2, w.scene);
  return { w, update(t, d) {
    tickGutter(w, t); sv.forEach((s, i) => popIn(s, t, .1 + i * .12, 1, .3)); popIn(a, t, .2); popIn(b, t, d * .55);
    m.rotation.y = lerp(0, 3.14, eio(prog(t, 0, .6))); m.pose({ mood: 'shock', head: [Math.sin(t * 2) * .4, -.1, 0], armL: [.2, .25], armR: [.2, .25] });
    camTo(w, [0, 3.6, 13], [0, 11, 40], [0, 3.4, -1], [0, 4.6, -2], eio(t / d));
  } };
};

function marbleScene(second, hitF = .44) {
  return () => {
    const w = street({ bg: second ? 0xf9d7a0 : 0xbfe6ea, signs: second ? HOTEL : [] }); lift(w); const m = MS(); place(m, 0, 0, -1, w.scene);
    const mb = marble(.4); w.scene.add(mb); const j = jar(40); place(j, 2.3, 0, -.6, w.scene); j.scale.setScalar(.95); const glow = new THREE.PointLight(C.gold, 0, 16); place(glow, 0, 5, 1, w.scene);
    return { w, update(t, d) {
      tickGutter(w, t); const hit = Math.min(d - .9, d * hitF), jarT = hit + .6;
      let x = 0, y, z = -.8; if (t < hit) { y = lerp(15, 4.2, (t / hit) ** 2); } else { const T = t - hit, f = clamp(T / .6); x = lerp(0, 2.3, f); y = lerp(4.2, 1.8, f * f) + Math.sin(f * Math.PI) * 2.1; z = lerp(-.8, -.6, f); }
      mb.visible = t < jarT + .02; mb.position.set(x, y, z); j.userData.setN((second ? 32 : 20) + (t > jarT ? 1 : 0));
      const after = t > hit; glow.intensity = after ? 120 * Math.exp(-(t - hit) * 2.2) : 0;
      const sq = after ? 1 + Math.sin(clamp((t - hit) / .22) * Math.PI) * -.09 : 1; m.children[0].scale.set(1 / sq, sq, 1 / sq);
      m.pose({ mood: after ? (second ? 'happy' : 'idea') : (second ? 'smug' : 'stare'), head: after ? [0, -.1, 0] : [0, .02, 0], armL: after ? [2.2, .35] : [0, .12], armR: after ? [.5, .9] : [0, .12], lift: after ? Math.exp(-(t - hit) * 3.5) * .3 : 0, look: after ? [0, 0] : [0, 1] });
      camTo(w, [1, 3.4, 14.2], [1, 3.6, 12.6], [1, 3.2, -1], [1, 3.3, -1], eio(t / d), (after && t < hit + .24) ? .035 : 0, t);
    }, overlay(g, t, d) { const hit = Math.min(d - .9, d * hitF); const f = 1 - prog(t, hit, hit + .18); if (t > hit && f > 0) { g.fillStyle = `rgba(255,236,170,${f * .55})`; g.fillRect(0, 0, W, H); } } };
  };
}
F.E = marbleScene(false); F.K = marbleScene(true, .64);

F.F = () => {
  const w = world(0xf7e2a0, { floor: 0xf2d98c, env: .85, sun: 2.3 }); const m = MS(); w.scene.add(m);
  const sc = suitcase(0x2e86ff, 1.15); place(sc, -2.3, 4.7, .4, w.scene); const pl = plant('fern', 1.05); place(pl, 2.3, 4.6, .4, w.scene);
  const la = label('HOLIDAY', 2.6, .66, { bg: '#2e86ff', fg: '#fff' }), lb = label("CAN'T GO", 2.6, .66, { bg: RED, fg: '#fff' }); place(la, -2.3, 7.4, .6, w.scene); place(lb, 2.3, 7.4, .6, w.scene);
  return { w, update(t, d) {
    const h2 = d * .45; popIn(sc, t, .1, 1.15); popIn(la, t, .15); popIn(pl, t, h2 - .05, 1.05); popIn(lb, t, h2); sc.rotation.z = Math.sin(t * 6) * .06; pl.userData.set(t > h2 + .3 ? .55 : 1);
    const lk = t > h2 ? 1 : -1; m.pose({ mood: t > h2 ? 'sad' : 'happy', armL: [1.3, .7], armR: [1.3, .7], head: [lk * .3, -.05, 0], look: [lk * .8, .5] });
    camTo(w, [0, 3.9, 19], [0, 3.9, 18.4], [0, 3.6, 0], [0, 3.6, 0], t / d);
  } };
};

F.G = () => {
  const w = street({ signs: HOTEL }); lift(w); const sg = w.houses[3].userData.sign; const m = MS(); place(m, -1, 0, -1, w.scene); m.rotation.y = .45;
  const desk = new THREE.Group(); place(desk, 1.6, 0, -.9, w.scene); place(box(1.8, 1.4, .9, 0xfbf7ee, .08), 0, .7, 0, desk); place(box(1.9, .1, 1, 0xb07a4a, .03), 0, 1.45, 0, desk); place(sph(.18, M(C.gold, .2, .7)), .5, 1.6, 0, desk);
  const pr = label('$5 / NIGHT', 3, .78, { bg: GOLD }); place(pr, 1.8, 3.1, -.3, w.scene); pr.rotation.z = -.08; const tag = label('FOR PLANTS', 3.3, .85, { bg: '#3fae5a', fg: '#fff' }); place(tag, 0, 8.7, -1.6, w.scene);
  const ps = [0, 1, 2].map(i => { const p = townsperson(i + 1); place(p, 6 + i * 2, 0, -.4, w.scene); p.rotation.y = -1.57; hold(p, plant(KINDS[i], .55, POTS[i + 1])); return p; });
  return { w, update(t, d) {
    tickGutter(w, t); stampIn(sg, t, d * .22); popIn(tag, t, d * .45); popIn(pr, t, d * .7);
    ps.forEach((p, i) => { const q = eio(prog(t, d * .35, d * .95)); p.position.x = lerp(6.5 + i * 2.1, 3.4 + i * 2.1, q); p.pose({ walk: q < .98 ? t * 9 : undefined, mood: 'happy', armL: [1.3, .2], armR: [1.3, .2], head: [0, 0, 0] }); });
    m.pose({ mood: 'happy', armR: t < d * .22 ? [2.2, .2] : [1.1, .5], armL: [.4, .35], head: t < d * .22 ? [0, -.28, 0] : [.25, 0, 0], look: t < d * .22 ? [0, 1] : [.5, 0], blink: blinkAt(t) });
    camTo(w, [.5, 4.2, 17], [.5, 4.6, 19], [.5, 4.3, -1], [.5, 4.6, -1], eio(t / d));
  } };
};

F.H = () => {
  const w = street({ signs: HOTEL, sh: 26 }); lift(w); const cnt = label('0 GUESTS', 4.4, 1.1, { bg: CREAM }); place(cnt, 0, 10.6, 0, w.scene);
  const ps = []; for (let i = 0; i < 60; i++) { const r = Math.floor(i / 12), c = i % 12; const p = plant(KINDS[i % 3], .5, POTS[(i * 7) % 6]); place(p, -6.6 + c * 1.2 + (r % 2) * .6, .1, -3.2 + r * 1.05, w.scene); ps.push(p); }
  const m = MS(); place(m, 0, .3, -3.65, w.scene);
  return { w, update(t, d) { tickGutter(w, t); popIn(cnt, t, .03); let k = 0; ps.forEach((p, i) => { const a = .1 + i * (d * .78 / 60); popIn(p, t, a, .5, .18); if (t > a) k++; }); cnt.userData.set(k + ' GUESTS'); m.pose({ mood: 'happy', armL: [2.3, .5], armR: [2.3, .5], head: [0, -.1, 0], lift: Math.abs(Math.sin(t * 6)) * .1 }); camTo(w, [0, 7, 19], [0, 7.6, 17], [0, 3.4, -1.5], [0, 3.2, -1.5], t / d); } };
};

function heat(w, t, k) { w.scene.background.lerpColors(new THREE.Color(0xbfe6ea), new THREE.Color(0xffa25a), k); w.scene.fog.color.copy(w.scene.background); w.sun.color.setRGB(1, lerp(.95, .7, k), lerp(.87, .45, k)); }
function hotRow(w) { const ps = []; for (let i = 0; i < 24; i++) { const r = Math.floor(i / 12), c = i % 12; const p = plant(KINDS[i % 3], .55, POTS[(i * 7) % 6]); place(p, -6.6 + c * 1.2 + (r % 2) * .6, .1, -3.2 + r * 1.1, w.scene); ps.push(p); } return ps; }

F.I = () => {
  const w = street({ signs: HOTEL }); lift(w); hotRow(w); const sun = sph(2.2, M(0xffd23f, .4, 0, { emissive: 0xffb000, emissiveIntensity: 1.2 })); w.scene.add(sun);
  const th = new THREE.Group(); place(th, 2.6, 3.2, 2, w.scene); place(cyl(.32, .32, 4.6, M(0xfbf7ee, .2), 20), 0, 0, 0, th); place(sph(.55, 0xe4572e), 0, -2.4, 0, th); const fill = cyl(.2, .2, 1, 0xe4572e, 16); th.add(fill);
  const hl = label('HOTTEST WEEK', 4.6, 1, { bg: RED, fg: '#fff' }); place(hl, -1, 8.6, 0, w.scene);
  return { w, update(t, d) { tickGutter(w, t); const k = eio(prog(t, 0, d * .8)); heat(w, t, k); sun.position.set(-3, lerp(16, 10.2, k), -2); const fh = lerp(.4, 4.3, k); fill.scale.y = fh; fill.position.y = -2.3 + fh / 2; stampIn(hl, t, d * .45); camTo(w, [0, 5.5, 18], [0, 5.5, 16.5], [0, 5.2, 0], [0, 5.2, 0], t / d, .012 * k, t); } };
};
F.I2 = () => {
  const w = street({ signs: HOTEL }); lift(w); heat(w, 0, 1); const ps = hotRow(w);
  return { w, update(t, d) { ps.forEach((p, i) => p.userData.set(1 - eio(prog(t, .1 + (i % 12) * .06, .7 + (i % 12) * .06)))); camTo(w, [0, 3.2, 9.5], [0, 3, 8.5], [0, 1.2, -2.5], [0, 1.1, -2.5], t / d); } };
};
F.I3 = () => {
  const w = street({ signs: HOTEL }); lift(w); heat(w, 0, .85); const ps = hotRow(w); ps.forEach(p => p.userData.set(.05)); const m = MS(); place(m, 0, 0, -.6, w.scene);
  const c = label('60 OWNERS', 3.6, .9, { bg: CREAM }); place(c, 0, 5.9, -.6, w.scene); const ret = label('COMING HOME', 3.8, .8, { bg: RED, fg: '#fff' }); place(ret, 0, 5.05, -.6, w.scene);
  return { w, update(t, d) { tickGutter(w, t * .3); popIn(c, t, .1); popIn(ret, t, .35); if (t > d * .5) c.visible = ret.visible = false; m.pose({ mood: 'shock', armL: [2.6, .3], armR: [2.6, .3], head: [Math.sin(t * 9) * .25, 0, 0], lift: Math.abs(Math.sin(t * 8)) * .08 }); camTo(w, [0, 3.6, 12], [0, 3.6, 11], [0, 3.6, -.6], [0, 3.6, -.6], t / d); },
    overlay(g, t, d) { banner(g, t, d * .5, 'WHAT WOULD YOU DO?', GOLD, INK, 340); } };
};

function park(o = {}) { const w = world(0xbfe6ea, { floor: 0x9bd08a, env: .85, sun: 2.4, sh: 18, far: 90 }); const tr = tree(1.15); place(tr, 1.2, 0, -3.2, w.scene); place(box(40, .06, 2.2, 0xefe6d2, .02), 0, .03, 4.2, w.scene); return { w, tr }; }

F.J = () => {
  const { w } = park(); const N = 28; const ps = []; for (let i = 0; i < N; i++) { const r = Math.floor(i / 7), c = i % 7; const p = plant(KINDS[i % 3], .5, POTS[(i * 5) % 6]); place(p, -2.3 + c * .95 + (r % 2) * .45, 0, -3.4 + r * .95, w.scene); ps.push(p); }
  const m = MS(); w.scene.add(m); const stack = new THREE.Group(); m.add(stack); [0, 1, 2].forEach(k => place(plant(KINDS[k], .45, POTS[k]), 0, 1.25 + k * .62, 1.0, stack));
  const cnt = label('TRIP 1', 2.6, .8, { bg: CREAM }); place(cnt, 3, 8.6, -1, w.scene);
  return { w, update(t, d) {
    const trips = 6, per = d / trips, k = Math.floor(t / per), ph = (t % per) / per, go = ph < .5; cnt.userData.set('TRIP ' + Math.min(60, 1 + Math.floor(t / d * 60)));
    const x = go ? lerp(7, 3.8, eio(ph * 2)) : lerp(3.8, 7, eio((ph - .5) * 2)); m.position.set(x, 0, 0); m.rotation.y = go ? -1.57 : 1.57; stack.visible = go;
    m.pose({ walk: t * 13, mood: 'happy', armL: go ? [1.3, .2] : undefined, armR: go ? [1.3, .2] : undefined, head: [0, 0, 0], lean: .1 });
    ps.forEach((p, i) => { const a = i / N * d * .9; p.visible = t > a; p.userData.set(.08 + .92 * eo(prog(t, a + .3, a + 1.6))); });
    camTo(w, [2.6, 4.8, 20], [2.6, 4.8, 19], [2.6, 3.6, -1.5], [2.6, 3.6, -1.5], t / d);
  } };
};
F.J2 = () => {
  const { w } = park(); for (let i = 0; i < 14; i++) { const p = plant(KINDS[i % 3], .5, POTS[i % 6]); place(p, -2.3 + (i % 7) * .95, 0, -3.4 + Math.floor(i / 7) * .95, w.scene); }
  const m = MS(); place(m, 3.4, 0, .6, w.scene); m.rotation.y = -.5; const ph = new THREE.Group(); place(box(.7, 1.2, .1, C.ink, .08), 0, 0, 0, ph); m.add(ph); ph.position.set(0, 3.2, 1.1);
  return { w, update(t, d) { m.pose({ mood: 'happy', armL: [2.0, .05], armR: [2.0, .05], head: [0, .05, 0], look: [-.3, 0], blink: blinkAt(t) }); camTo(w, [5.5, 4.2, 10.5], [5.3, 4.2, 9.8], [2.2, 3, -.5], [2.2, 3, -.5], t / d); },
    overlay(g, t, d) { const n = 4; for (let i = 0; i < n; i++) { const a = d * .35 + i * .14, p = eo(prog(t, a, a + .4)); if (p <= 0) continue; g.save(); g.translate(lerp(540, 220 + i * 210, p), lerp(900, 360 + (i % 2) * 70, p)); g.rotate((i - 1.5) * .14); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 16; g.fillStyle = '#fbf7ee'; g.fillRect(-95, -115, 190, 230); g.shadowColor = 'transparent'; g.fillStyle = ['#9bd08a', '#bfe6ea', '#f7e2a0', '#9bd08a'][i]; g.fillRect(-80, -100, 160, 160); g.fillStyle = '#3fae5a'; g.beginPath(); g.ellipse(0, -10, 34, 44, 0, 0, 7); g.fill(); g.fillStyle = '#c8643b'; g.fillRect(-26, 22, 52, 34); g.restore(); }
      const fl = 1 - prog(t, d * .3, d * .38); if (t > d * .3 && fl > 0) { g.fillStyle = `rgba(255,255,255,${fl * .9})`; g.fillRect(0, 0, W, H); } } };
};
F.J3 = () => {
  const { w } = park(); const ch = chair(0x2e86ff); place(ch, 0, 0, 0, w.scene); const f = plant('fern', 1.0); place(f, 0, .62, -.05, w.scene); f.rotation.x = -.25;
  const sg = shades(); place(sg, 0, 1.35, .75, f); sg.scale.setScalar(1.7); const um = umbrella(0xe4572e, 0xfbf7ee); place(um, -1.6, 0, -1, w.scene); const dr = new THREE.Group(); place(dr, 1.3, 0, .4, w.scene); place(cyl(.22, .18, .55, 0xf5b700, 16), 0, .9, 0, dr); place(cyl(.03, .03, .9, 0xe4572e, 6).rotateZ(.3), .12, 1.4, 0, dr); place(box(.9, .6, .9, 0xfbf7ee, .05), 0, .3, 0, dr);
  return { w, update(t, d) { f.rotation.z = Math.sin(t * 1.6) * .04; camTo(w, [0, 2.9, 10], [0, 2.9, 9.4], [0, 1.6, 0], [0, 1.6, 0], t / d); },
    overlay(g, t, d) { photoCard(g, t, 'YOUR FERN, RELAXING', { sy: 400, rot: -.04 }); } };
};

F.L = () => {
  const w = street({ signs: HOTEL }); lift(w); const cs = [0x2e86ff, 0xf5b700, 0x7fd6b5, 0x7b5fc7, 0xf2a9a0, 0x2fa4a8];
  const row = [0, 1, 2, 3, 4, 5].map(i => { const g = new THREE.Group(); place(g, -4.5 + i * 1.8, .1, -1.2, w.scene); const p = plant(KINDS[i % 3], .6, POTS[i]); g.add(p); const s = suitcase(cs[i], .42); place(s, .55, 0, .1, g); s.rotation.y = -.3; return g; });
  const m = MS(); place(m, 5.8, 0, -.6, w.scene); m.rotation.y = -.5; const hl = label('PLANT HOLIDAYS', 4.6, .95, { bg: '#2e86ff', fg: '#fff' }); place(hl, 0, 7.4, -1.2, w.scene);
  return { w, update(t, d) { tickGutter(w, t); row.forEach((g, i) => { popIn(g, t, .1 + i * .12, 1, .3); g.position.y = .1 + Math.abs(Math.sin(t * 6 + i)) * .12; }); stampIn(hl, t, d * .45); m.pose({ mood: 'happy', armR: [2.6, .3 + Math.sin(t * 10) * .25], armL: [.3, .2], head: [-.3, 0, 0], blink: blinkAt(t) }); camTo(w, [.6, 4.2, 15], [.6, 4.3, 14], [.6, 3.2, -1], [.6, 3.3, -1], t / d); } };
};

F.L2 = () => {
  const w = world(0xbfe6ea, { floor: 0xf3dfa6, env: .9, sun: 2.5, sh: 12, far: 70 }); const sc = w.scene;
  const beach = new THREE.Group(); sc.add(beach); place(box(60, .2, 30, 0x4aa8d8, .02, .2), 0, .05, -22, beach); const ch = chair(0xe4572e); place(ch, 0, 0, 0, beach); const f1 = plant('fern', .95); place(f1, 0, .62, -.05, beach); const sg = shades(); sg.scale.setScalar(1.5); place(sg, 0, 1.7, .45, f1); place(umbrella(0x2e86ff, 0xfbf7ee), -1.7, 0, -1, beach);
  const mus = new THREE.Group(); sc.add(mus); place(box(30, 14, .3, 0xe9e4f2, .02), 0, 7, -3, mus); place(box(30, .1, 20, 0xc7b79a, .02), 0, .06, 0, mus); [[-2.6, 0xf2a9a0], [2.6, 0x7fd6b5]].forEach(([x, c]) => { place(box(2, 2.4, .12, 0xb79a55, .05), x, 3.6, -2.8, mus); place(box(1.6, 2, .1, c, .03), x, 3.6, -2.72, mus); }); place(box(1.4, 1.4, 1.4, 0xfbf7ee, .05), 0, .7, -1, mus); const f2 = plant('cactus', 1.05); place(f2, 0, 1.4, -1, mus); [-1.6, 1.6].forEach(x => place(cyl(.06, .06, 1.3, C.gold, 10), x, .65, .6, mus)); const rope = cyl(.05, .05, 3.2, 0xb3202b, 10); rope.rotation.z = Math.PI / 2; place(rope, 0, 1.1, .6, mus);
  const mt = new THREE.Group(); sc.add(mt); [[-5, 7, -12, 0x8d99ae], [3, 9, -16, 0x7d8aa0], [9, 6, -11, 0x8d99ae]].forEach(([x, h, z, c]) => { const k = mesh(new THREE.ConeGeometry(h * .7, h, 6), M(c, .9)); place(k, x, h / 2, z, mt); const s = mesh(new THREE.ConeGeometry(h * .7 * .3, h * .3, 6), M(0xfbf7ee, .7)); place(s, x, h * .85 + .02, z, mt); }); place(box(4, .5, 3, 0x9bd08a, .1), 0, .25, 0, mt); const f3 = plant('monstera', 1.0); place(f3, 0, .5, 0, mt); const scarf = mesh(new THREE.TorusGeometry(.42, .1, 8, 20), M(0xe4572e, .7)); scarf.rotation.x = Math.PI / 2; place(scarf, 0, 1.15, 0, mt);
  const cfg = [[beach, 0xbfe6ea, 0xf3dfa6, 'GREETINGS FROM THE BEACH'], [mus, 0xe9e4f2, 0xc7b79a, 'GREETINGS FROM THE MUSEUM'], [mt, 0xcfe6f7, 0xe6eef5, 'GREETINGS FROM THE MOUNTAINS']];
  const cur = t => Math.min(2, Math.floor(t / (w.d3 || 1)));
  return { w, update(t, d) { w.d3 = d / 3; const k = cur(t); cfg.forEach((c, i) => { c[0].visible = i === k; }); w.scene.background.set(cfg[k][1]); w.scene.fog.color.set(cfg[k][1]); w.floor.material.color.set(cfg[k][2]); camTo(w, [0, 2.7, 8], [0, 2.7, 7.6], [0, 1.7, 0], [0, 1.7, 0], (t % (d / 3)) / (d / 3)); },
    overlay(g, t, d) { const k = Math.min(2, Math.floor(t / (d / 3))); photoCard(g, t - k * d / 3, cfg[k][3], { sy: 330, rot: [-.05, .04, -.03][k], stamp: 'PLANT\nHOTEL'.split('\n')[0], table: ['#1f6f78', '#3b2f5a', '#27406e'][k] }); } };
};

F.M = () => {
  const w = street({ signs: HOTEL, sh: 26 }); lift(w); const m = MS(); place(m, -1.2, 0, -.8, w.scene);
  const a = label('$5', 2.2, 1.1, { bg: CREAM }), b = label('$15', 2.6, 1.3, { bg: GOLD }), so = label('SOLD OUT', 5.2, 1.4, { bg: null, fg: RED, border: RED, rad: 30 }); place(a, 1.6, 6.2, -.8, w.scene); place(b, 1.6, 6.2, -.7, w.scene); place(so, 1.2, 2.6, 1.2, w.scene); so.rotation.z = .14;
  const ps = [0, 1, 2, 3, 4].map(i => { const p = townsperson(i + 3); place(p, 3 + i * 1.8, 0, -.4, w.scene); p.rotation.y = -1.57; hold(p, plant(KINDS[i % 3], .5, POTS[i])); p.pose({ mood: 'happy', armL: [1.3, .2], armR: [1.3, .2] }); return p; });
  return { w, update(t, d) { tickGutter(w, t); popIn(a, t, .1); const sw = d * .32; a.visible = t < sw; stampIn(b, t, sw); so.visible = false; m.pose({ mood: t > d * .62 ? 'smug' : 'happy', armL: [.2, .35], armR: [.2, .35], head: [0, -.08, 0], blink: blinkAt(t) }); camTo(w, [1.6, 4.4, 17], [1.6, 4.4, 15.5], [1.6, 3.8, -1], [1.6, 3.8, -1], t / d); },
    overlay(g, t, d) { const p = prog(t, d * .62, d * .62 + .22); if (p <= 0) return; const s = lerp(2.2, 1, eo(p)); g.save(); g.translate(540, 760); g.rotate(-.14); g.scale(s, s); g.globalAlpha = Math.min(1, p * 2); g.font = '130px "Archivo Black"'; g.textAlign = 'center'; g.textBaseline = 'middle'; const w = g.measureText('SOLD OUT').width + 80; g.fillStyle = 'rgba(251,247,238,.9)'; g.beginPath(); g.roundRect(-w / 2, -95, w, 190, 26); g.fill(); g.lineWidth = 14; g.strokeStyle = RED; g.stroke(); g.fillStyle = RED; g.fillText('SOLD OUT', 0, 8); g.restore(); } };
};

F.N = () => {
  const w = street({ signs: ['', '', '', 'PLANT HOTEL', '', 'MEGA PLANT-BOT', ''] }); lift(w); w.houses[5].userData.sign.material.map && 0; const rb = robot(); place(rb, HX(5), 0, -2, w.scene);
  const m = MS(); place(m, HX(4) - 1.2, 0, -.6, w.scene); m.rotation.y = .9; const pr = label('$0.99 / NIGHT', 3.6, .9, { bg: RED, fg: '#fff' }); place(pr, HX(4) + 2.6, 5.6, -.6, w.scene);
  return { w, update(t, d) { tickGutter(w, t); const q = eo(prog(t, .15, d * .5)); rb.position.z = lerp(-3.5, -.6, q); rb.position.x = lerp(HX(5), HX(4) + 2.6, q); rb.rotation.y = -q * .5; rb.userData.arm.rotation.x = -Math.sin(t * 5) * .3; stampIn(pr, t, d * .55);
    m.pose({ mood: t > d * .5 ? 'shock' : 'neutral', head: [.4, 0, 0], look: [.6, .2], armL: [.2, .2], armR: [.2, .2], blink: blinkAt(t) }); camTo(w, [HX(4) + .7, 4.4, 17], [HX(4) + .7, 4.4, 16], [HX(4) + .7, 3.6, -1], [HX(4) + .7, 3.6, -1], t / d); } };
};

F.N2 = () => {
  const w = world(0x9aa6b8, { floor: 0x7f8aa0, env: .7, sun: 1.9, sh: 14, far: 70 }); place(box(40, 14, .3, 0xb7c0cf, .02), 0, 7, -5, w.scene);
  for (let r = 0; r < 2; r++) { place(box(12, .14, 1.2, 0x5b6a82, .03), 0, 1.6 + r * 2.4, -4, w.scene); for (let c = 0; c < 9; c++) { const p = plant(KINDS[(c + r) % 3], .48, 0x8d99ae); place(p, -5.2 + c * 1.3, 1.67 + r * 2.4, -4, w.scene); } }
  const rbs = [-3.6, 0, 3.6].map(x => { const r = robot(); place(r, x, 0, -1.6, w.scene); r.rotation.y = 3.14; return r; });
  const pc = label('POSTCARDS SENT: 0', 6.4, 1.1, { bg: CREAM, fg: RED, border: RED, rad: 26 }); place(pc, 0, 6.5, -1, w.scene); pc.rotation.z = -.05;
  return { w, update(t, d) { rbs.forEach((r, i) => { r.userData.arm.rotation.x = -1.2 + Math.sin(t * 4 + i) * .25; r.position.x = [-3.6, 0, 3.6][i] + Math.sin(t * 1.2 + i) * .3; }); stampIn(pc, t, d * .55); camTo(w, [0, 4.6, 15], [0, 4.6, 14], [0, 3.6, -2], [0, 3.6, -2], t / d); } };
};

F.O = () => {
  const w = street({ signs: HOTEL }); lift(w); const m = MS(); place(m, -1.4, 0, -2.6, w.scene); m.rotation.y = .6;
  const st = [0, 1, 2, 3].map(i => { const p = townsperson(i, { style: 'cap', hair: 0xb3202b, top: 0x8d99ae }); place(p, 4 + i * 1.8, 0, -2.4, w.scene); p.rotation.y = -1.57; hold(p, plant(KINDS[i % 3], .5, 0x8d99ae)); return p; });
  const lb = label("MEGASOCK STAFF", 4.4, .9, { bg: RED, fg: '#fff' }); place(lb, 4.6, 6.8, -2.4, w.scene);
  return { w, update(t, d) { tickGutter(w, t); popIn(lb, t, .2); st.forEach((p, i) => { const q = prog(t, 0, d); p.position.x = lerp(5 + i * 1.8, 1.2 + i * 1.8, eio(q)); p.pose({ walk: t * 7, mood: 'stare', armL: [1.3, .2], armR: [1.3, .2], head: [Math.sin(t * 3 + i) * .7, 0, 0], lean: .25 }); }); m.pose({ mood: 'smug', armL: [.2, .3], armR: [.2, .3], head: [.3, 0, 0], look: [.6, 0], blink: blinkAt(t) }); camTo(w, [1.8, 4, 15], [1.8, 4, 14], [1.8, 3.2, -2.4], [1.8, 3.2, -2.4], t / d); } };
};

F.Q = () => {
  const w = street({ signs: ['ODD PAIRS', 'ODD PAIRS', 'STANDING ROOM', 'PLANT HOTEL', '', 'STANDING ROOM', 'ODD PAIRS'], bg: 0xbfe6ea, sh: 40, far: 150 }); lift(w);
  const m = MS(); place(m, 0, 0, -2.6, w.scene); const n = 14; for (let i = 0; i < n; i++) { const p = townsperson(i + 2); place(p, 2 + i * 1.6, 0, -.9, w.scene); p.rotation.y = -1.57; hold(p, plant('cactus', .5, POTS[i % 6])); p.pose({ mood: 'happy', armL: [1.3, .2], armR: [1.3, .2], head: [0, 0, 0] }); }
  const wl = label('WAITING LIST', 4.4, 1, { bg: GOLD }); place(wl, 8, 6.6, -.9, w.scene);
  return { w, update(t, d) { tickGutter(w, t * 2); popIn(wl, t, d * .35); m.pose({ mood: 'happy', armL: [2.3, .55], armR: [2.3, .55], head: [0, -.05, 0], lift: Math.abs(Math.sin(t * 5)) * .15 }); camTo(w, [0, 3.6, 13], [6, 10, 38], [0, 3.6, -2], [6, 4.5, -2], eio(t / d)); } };
};

function leeDoor(o = {}) { const w = street({ signs: HOTEL }); lift(w); const x = HX(4); const L = lee(); place(L, x + .5, 0, -2.6, w.scene); L.rotation.y = -.9; const sc = suitcase(0xf5b700); place(sc, x + 1.7, .1, -2.6, w.scene); const m = MS(); place(m, x - 1.6, 0, -2.4, w.scene); m.rotation.y = 1.0; return { w, x, L, m, sc }; }
F.R = () => { const { w, x, L, m } = leeDoor(); const f = hold(L, plant('fern', .62)); return { w, update(t, d) { tickGutter(w, t); L.pose({ mood: 'happy', armL: [1.3, .2], armR: [1.3, .2], head: [0, 0, 0], blink: blinkAt(t + 1) }); m.pose({ mood: 'neutral', head: [-.2, 0, 0], armL: [.1, .1], armR: [.1, .1] }); m.position.x = lerp(x - 4, x - 1.6, eo(prog(t, 0, d * .6))); m.pose({ walk: t < d * .6 ? t * 10 : undefined, mood: 'neutral', head: [0, 0, 0] }); camTo(w, [x - .5, 3.8, 12], [x - .5, 3.8, 11], [x - .5, 3.3, -2.5], [x - .5, 3.3, -2.5], t / d); } }; };
F.S = () => { const { w, x, L, m } = leeDoor(); const f = plant('fern', .62); w.scene.add(f); return { w, update(t, d) { tickGutter(w, t * .3); const q = eio(prog(t, d * .25, d * .55)); f.position.set(lerp(x + .5, x - .7, q), 1.25 + Math.sin(q * Math.PI) * .2, -2.6 + .95); L.pose({ mood: 'happy', armL: [lerp(1.3, .3, q), .2], armR: [lerp(1.3, .3, q), .2], head: [0, 0, 0] }); m.pose({ mood: 'stare', armL: [q > .5 ? 1.25 : .2, .2], armR: [q > .5 ? 1.25 : .2, .2], head: [0, .05, 0], look: [0, -.3], blink: blinkAt(t) }); camTo(w, [x - .5, 3.6, 9.5], [x - .5, 3.6, 8.8], [x - .5, 3.1, -2.5], [x - .5, 3.1, -2.5], t / d); } }; };
F.S2 = () => {
  const { w, x, m } = leeDoor(); const f = hold(m, plant('fern', .62), 1.25, 1.05);
  return { w, update(t, d) { m.pose({ mood: 'stare', armL: [1.25, .2], armR: [1.25, .2], head: [0, .02, 0], blink: (t > d * .8 && t < d * .85) ? .1 : 1 }); camTo(w, [x - 1.6, 3.4, 7.5], [x - 1.6, 3.4, 7.2], [x - 1.6, 3, -2.4], [x - 1.6, 3, -2.4], t / d); },
    overlay(g, t, d) {
      const p = eo(prog(t, .05, .4)); if (p <= 0) return; const pw = 760, ph = 1000, x0 = 540 - pw / 2, y0 = 250 + (1 - p) * 1200;
      g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 40; g.fillStyle = '#0b1224'; g.beginPath(); g.roundRect(x0, y0, pw, ph, 70); g.fill(); g.shadowColor = 'transparent';
      g.fillStyle = '#f4f6fb'; g.beginPath(); g.roundRect(x0 + 22, y0 + 22, pw - 44, ph - 44, 52); g.fill();
      g.fillStyle = INK; g.textAlign = 'left'; g.textBaseline = 'middle'; g.font = '46px "Archivo Black"'; g.fillText('ALARMS', x0 + 60, y0 + 90);
      const n = Math.min(14, Math.floor(prog(t, .45, d * .78) * 14 + (t > .45 ? 1 : 0))); g.font = '36px "Archivo Black"';
      for (let i = 0; i < n; i++) { const y = y0 + 160 + i * 56; g.fillStyle = INK; g.fillText(`7:${String(i).padStart(2, '0')} AM`, x0 + 60, y); g.fillStyle = '#7b8496'; g.font = '28px "Archivo Black"'; g.fillText('WATER FERN', x0 + 300, y); g.font = '36px "Archivo Black"';
        g.fillStyle = '#4ade80'; g.beginPath(); g.roundRect(x0 + pw - 140, y - 18, 72, 36, 18); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x0 + pw - 86, y, 14, 0, 7); g.fill(); }
      g.restore();
    } };
};

F.Z = recap(["PLANTS DIE ON HOLIDAY", "A HOTEL FOR PLANTS", "$1,000,000"], ['ODD PAIRS', 'ODD PAIRS', 'STANDING ROOM', 'PLANT HOTEL', '', 'STANDING ROOM', 'ODD PAIRS']);
