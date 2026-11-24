import * as THREE from 'three';
import { recap } from './recap.js';
import { C, M, W, H, world, box, cyl, sph, mesh, place, prog, eio, eo, back, lerp, clamp, camTo, label, setI, doneI, rand } from './world.js';
import { marlo, person } from './marlo.js';
import { jar, marble, street, tickGutter, townsperson, PAT } from './sets.js';

const popIn = (o, t, a, s = 1, dur = .35) => { const p = prog(t, a, a + dur); o.visible = p > 0; o.scale.setScalar(Math.max(.0001, back(p) * s)); };
const stampIn = (o, t, a, s = 1) => { const p = prog(t, a, a + .24); o.visible = p > 0; o.scale.setScalar(p <= 0 ? .0001 : lerp(2.3, 1, eo(p)) * s); };
const blinkAt = t => (Math.sin(t * 3.1) > .985 ? .1 : 1);
const MS = () => marlo({ sockL: PAT.stripe(), sockR: PAT.dots() });
const GOLD = '#f5b700', RED = '#e4572e', CREAM = '#fbf7ee', INK = '#14213d', PINK = '#f2a9a0', GREEN = '#3fae5a';
export const F = {};

// ---------- cast
const BOSS = { top: 0x3a3a48, pant: 0x23232b, skin: 0xf0c49c, hair: 0xe4572e, style: 'cap', shoe: 0x14213d, sockL: 0xe4572e, sockR: 0xe4572e };
const hold = (p, o, y = 1.3, z = 1.0) => { place(o, 0, y, z, p); return o; };
const HX = i => (i - 3) * 6.55; // 3 = Marlo's house
const lift = (w, y = 4.8) => w.houses.forEach(h => { if (h.userData.sign) h.userData.sign.position.y = y; });
const SHOP = ['', '', '', 'PEDAL POWER', '', '', ''];
const crossed = { armL: [1.25, -.32], armR: [1.25, -.32] };
const phonePose = { armL: [1.7, .15], armR: [1.7, .15], head: [0, .3, 0], look: [0, -.8] };

// ---------- props
export function phone3(txt = '1%', col = RED, s = 1) {
  const g = new THREE.Group(); place(box(.5, .92, .08, C.ink, .06), 0, 0, 0, g);
  const scr = label(txt, .42, .78, { bg: '#0b1224', fg: col, rad: 18 }); place(scr, 0, 0, .046, g); g.userData.scr = scr; g.scale.setScalar(s); return g;
}
const rod = (a, b, r, c) => { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b); const l = A.distanceTo(B); const o = cyl(r, r, l, c, 12, .35); o.position.copy(A).add(B).multiplyScalar(.5); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize()); return o; };
const BIKEC = [0x2fa4a8, 0xe4572e, 0xf5b700, 0x7b5fc7, 0x5aa9e6, 0x9bc53d];
// stationary bike on a stand, pointing along +z, wired to a charger
export function bike(ci = 0, charger = true) {
  const g = new THREE.Group(), fc = BIKEC[ci % BIKEC.length], R = .62, hy = .7;
  const wheels = [-.9, .9].map(z => { const wg = new THREE.Group(); place(wg, 0, hy, z, g); const tire = mesh(new THREE.TorusGeometry(R, .07, 12, 40), M(0x1b1b22, .7)); tire.rotation.y = Math.PI / 2; wg.add(tire);
    for (let i = 0; i < 4; i++) { const s = cyl(.018, .018, R * 2, 0xc9ced8, 6, .3); s.rotation.x = i / 4 * Math.PI; wg.add(s); } place(cyl(.08, .08, .14, 0x8d99ae, 12).rotateZ(Math.PI / 2), 0, 0, 0, wg); return wg; });
  const RH = [0, hy, -.9], FH = [0, hy, .9], CR = [0, .62, 0], ST = [0, 1.28, -.25], HD = [0, 1.36, .62];
  [[RH, CR], [CR, ST], [ST, RH], [CR, HD], [HD, FH]].forEach(([a, b]) => g.add(rod(a, b, .065, fc)));
  g.add(rod(HD, [0, 1.78, .55], .05, 0x8d99ae)); place(box(1, .09, .09, C.ink, .04), 0, 1.78, .55, g);
  place(box(.32, .12, .52, C.ink, .05), 0, 1.36, -.27, g);
  place(box(.12, .08, 1.1, 0x5b6a82, .03), -.35, .04, -.9, g); place(box(.12, .08, 1.1, 0x5b6a82, .03), .35, .04, -.9, g); g.add(rod([-.33, .06, -.9], [0, hy, -.9], .04, 0x5b6a82)); g.add(rod([.33, .06, -.9], [0, hy, -.9], .04, 0x5b6a82));
  const crank = new THREE.Group(); place(crank, 0, .62, 0, g); place(cyl(.16, .16, .1, 0x8d99ae, 20).rotateZ(Math.PI / 2), 0, 0, 0, crank);
  [-1, 1].forEach(s => { const a = new THREE.Group(); a.rotation.x = s > 0 ? 0 : Math.PI; crank.add(a); place(box(.05, .36, .06, 0x8d99ae, .02), s * .12, -.17, 0, a); place(box(.22, .06, .14, C.ink, .02), s * .22, -.34, 0, a); });
  if (charger) { const cb = box(.34, .26, .2, M(0xf5b700, .35), .05); place(cb, 0, 1.97, .55, g); g.userData.charger = cb; }
  g.userData.spin = a => { wheels.forEach(w => w.rotation.x = a * 1.6); crank.rotation.x = a; };
  return g;
}
// put a person on a bike (same local frame) and pedal
const mount = (b, p) => { place(p, 0, .24, -.12, b); p.rotation.y = 0; return p; };
const ride = (b, p, t, sp = 8, ex = {}) => { const a = t * sp; b.userData.spin(a); p.pose({ legL: -.8 + Math.sin(a) * .42, legR: -.8 - Math.sin(a) * .42, armL: [1.2, .1], armR: [1.2, .1], lean: .18, ...ex }); };
function robot() {
  const g = new THREE.Group(); place(cyl(.6, .6, .5, 0x5b6a82, 22), 0, .3, 0, g); const bd = new THREE.Group(); g.add(bd); place(box(1.3, 1.5, 1, 0xc9ced8, .22, .35), 0, 1.35, 0, bd); const hd = new THREE.Group(); place(hd, 0, 2.55, 0, bd); place(box(1.1, .8, .9, 0xdfe3ea, .22, .3), 0, 0, 0, hd);
  const em = new THREE.MeshStandardMaterial({ color: 0x37c6ff, roughness: .2, emissive: 0x37c6ff, emissiveIntensity: 1.6 }); [-.25, .25].forEach(x => place(sph(.12, em), x, .05, .46, hd)); place(cyl(.03, .03, .5, C.ink, 8), 0, .6, 0, hd); place(sph(.1, 0xe4572e), 0, .87, 0, hd);
  const lg = label('MEGA', 1, .38, { bg: RED, fg: '#fff', rad: 20 }); place(lg, 0, 1.6, .52, bd);
  const arm = new THREE.Group(); place(arm, .78, 1.85, 0, bd); place(box(.22, .9, .22, 0x9aa2b2, .08), 0, -.4, 0, arm); place(cyl(.05, .05, .6, C.ink, 8), .05, -.95, .1, arm); g.userData = { arm, em, hd, bd }; return g;
}
function tower() {
  const g = new THREE.Group(); place(box(2, 5.4, 1.4, 0x8d99ae, .2, .35), 0, 2.7, 0, g); place(box(2.2, .5, 1.6, 0xe4572e, .15), 0, 5.6, 0, g);
  const lg = label('MEGA CHARGE', 1.9, .5, { bg: RED, fg: '#fff', rad: 18 }); place(lg, 0, 5.6, .81, g);
  const scr = label('$0.50', 1.5, .8, { bg: '#0b1224', fg: '#37c6ff', rad: 16 }); place(scr, 0, 3.9, .71, g); g.userData.scr = scr;
  for (let i = 0; i < 6; i++) place(box(.22, .14, .1, C.ink, .03), -.6 + (i % 3) * .6, 2.4 - Math.floor(i / 3) * .5, .72, g);
  return g;
}
function umbrella(c = 0xe4572e) { const g = new THREE.Group(); place(cyl(.05, .05, 4.2, 0xfbf7ee, 8), 0, 2.1, 0, g); const top = mesh(new THREE.ConeGeometry(2.1, .8, 8), M(c, .6)); place(top, 0, 4.3, 0, g); return g; }
function chair(p) { const g = new THREE.Group(); place(box(1, .12, .9, 0xfbf7ee, .04), 0, 1.0, 0, g); place(box(1, 1, .12, 0xfbf7ee, .04), 0, 1.5, -.45, g); [[-.42, -.38], [.42, -.38], [-.42, .38], [.42, .38]].forEach(([x, z]) => place(box(.08, 1, .08, 0x8d99ae, .02), x, .5, z, g)); if (p) { place(p, 0, -.12, .05, g); } return g; }
const sit = (p, ex = {}) => p.pose({ legL: -1.45, legR: -1.45, armL: [.5, .2], armR: [.5, .2], ...ex });
const cup = () => { const g = new THREE.Group(); place(cyl(.16, .12, .4, M(0xfff07a, .2, 0, { transparent: true, opacity: .9 }), 16), 0, .2, 0, g); place(cyl(.02, .02, .5, 0xe4572e, 6), .06, .45, 0, g); return g; };

// ---------- 2D overlays
function stamp2d(g, t, a, txt, y = 760, col = RED, fs = 130) {
  const p = prog(t, a, a + .22); if (p <= 0) return; const s = lerp(2.2, 1, eo(p)); g.save(); g.translate(540, y); g.rotate(-.12); g.scale(s, s); g.globalAlpha = Math.min(1, p * 2);
  g.font = `${fs}px "Archivo Black"`; g.textAlign = 'center'; g.textBaseline = 'middle'; const w = g.measureText(txt).width + 80;
  g.fillStyle = 'rgba(251,247,238,.92)'; g.beginPath(); g.roundRect(-w / 2, -fs * .73, w, fs * 1.46, 26); g.fill(); g.lineWidth = 14; g.strokeStyle = col; g.stroke(); g.fillStyle = col; g.fillText(txt, 0, 8); g.restore();
}
function phone(g, t, d, o) {
  const p = eo(prog(t, .02, .32)); if (p <= 0) return; const pw = 640, ph = 900, x0 = 540 - pw / 2, y0 = 300 + (1 - p) * 1200;
  g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 40; g.fillStyle = '#0b1224'; g.beginPath(); g.roundRect(x0, y0, pw, ph, 70); g.fill(); g.shadowColor = 'transparent';
  g.fillStyle = o.bg || '#f4f6fb'; g.beginPath(); g.roundRect(x0 + 22, y0 + 22, pw - 44, ph - 44, 52); g.fill();
  o.draw(g, x0, y0, pw, ph, t, d); g.restore();
}
function battery(g, cx, cy, pct, col, a = 1) {
  const bw = 340, bh = 170; g.save(); g.globalAlpha = a; g.lineWidth = 16; g.strokeStyle = col; g.beginPath(); g.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 26); g.stroke();
  g.fillStyle = col; g.beginPath(); g.roundRect(cx + bw / 2 + 6, cy - 34, 26, 68, 8); g.fill();
  const fw = Math.max(10, (bw - 44) * pct / 100); g.beginPath(); g.roundRect(cx - bw / 2 + 22, cy - bh / 2 + 22, fw, bh - 44, 12); g.fill(); g.restore();
}
function deadPhone(death, sub) {
  return (g, t, d) => phone(g, t, d, { bg: '#16203a', draw(g, x0, y0, pw, ph, t, d) {
    const dt = d * death, dead = t > dt; const cx = 540, cy = y0 + ph * .45;
    if (!dead) { const on = Math.sin(t * 16) > -.3; battery(g, cx, cy, 1, '#ff3b30', on ? 1 : .35); g.fillStyle = '#ff3b30'; g.font = '120px "Archivo Black"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('1%', cx, cy + 210); }
    else { g.fillStyle = '#000'; g.beginPath(); g.roundRect(x0 + 22, y0 + 22, pw - 44, ph - 44, 52); g.fill(); const f = Math.max(0, 1 - (t - dt) / .25); if (f > 0) { g.fillStyle = `rgba(255,255,255,${f})`; g.fillRect(x0 + 40, cy - 6 * f, pw - 80, 12 * f); } }
    if (sub) sub(g, t, d, dead);
  } });
}

// ---------- crowd with phones
function crowd(w, n, z = -1.6, labels = false) {
  const out = []; for (let i = 0; i < n; i++) { const p = townsperson(i + 1); const x = -14 + i * (28 / (n - 1)) + (i % 2 ? .4 : -.4); place(p, x, 0, z + (i % 3) * .7, w.scene); p.rotation.y = (i % 2 ? -.35 : .35); hold(p, phone3('1%', RED, .8), 2.25, .85);
    p.pose({ mood: i % 3 ? 'sad' : 'stare', ...phonePose }); out.push(p);
    if (labels) { const l = label('1%', 1.2, .6, { bg: RED, fg: '#fff', rad: 24 }); place(l, x, 4.4, z + (i % 3) * .7, w.scene); l.visible = false; p.userData.lb = l; } }
  return out;
}

// ================= SCENES
F.A = () => {
  const w = street({ signs: [] }); const m = MS(); place(m, 0, 0, -1.2, w.scene); hold(m, phone3('1%', RED), 2.3, .9);
  const draw = deadPhone(.55, (g, t, d, dead) => { if (dead) stamp2d(g, t, d * .6, 'DEAD', 760, RED, 150); });
  return { w, update(t, d) { tickGutter(w, t * .3); const dead = t > d * .55; m.pose({ mood: dead ? 'shock' : 'neutral', ...phonePose, lift: dead ? Math.exp(-(t - d * .55) * 6) * .25 : 0, blink: blinkAt(t) });
    camTo(w, [0, 3.6, 10], [0, 3.5, 8.6], [0, 3.2, -1.2], [0, 3.1, -1.2], t / d, dead && t < d * .55 + .25 ? .03 : 0, t); }, overlay: draw };
};

F.A2 = () => {
  const w = world(0x27406e, { floor: 0x33548a, env: .7, sun: 2.5, sh: 16 }); const n = 120, r = rand(6);
  const body = new THREE.InstancedMesh(new THREE.BoxGeometry(.95, .14, 1.7), M(0x0b1224, .4), n), scr = new THREE.InstancedMesh(new THREE.BoxGeometry(.8, .02, 1.5), M(0xffffff, .3), n);
  [body, scr].forEach(x => { x.castShadow = true; x.frustumCulled = false; w.scene.add(x); });
  const col = new THREE.Color(), SC = [0xff3b30, 0x2e86ff, 0x7fd6b5, 0xf5b700, 0xf2a9a0];
  for (let i = 0; i < n; i++) { const a = r() * 6.28, q = Math.sqrt(r()), ra = q * 8, y = (1 - q) * 4.2 + r() * .25, x = Math.cos(a) * ra, z = Math.sin(a) * ra - 1, rx = (r() - .5) * .5, rz = (r() - .5) * .5; setI(body, i, x, y + .1, z, 1, rx, rz); setI(scr, i, x, y + .18, z, 1, rx, rz); scr.setColorAt(i, col.set(SC[i % 5])); }
  [body, scr].forEach(x => { x.instanceMatrix.needsUpdate = true; }); scr.instanceColor.needsUpdate = true;
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
  const w = street({ signs: [] }); const m = MS(); w.scene.add(m); hold(m, phone3('', RED), 1.5, .5);
  const ls = ['NO CALLS', 'NO MAP', 'NO MUSIC'].map(s => { const l = label(s, 2.8, .75, { bg: CREAM, fg: INK }); w.scene.add(l); return l; });
  const hrs = label('6 HOURS', 3, .95, { bg: RED, fg: '#fff' }); w.scene.add(hrs);
  return { w, update(t, d) {
    tickGutter(w, t * .5); const x = lerp(-4, 4, t / d); m.position.set(x, 0, -1.6); m.rotation.y = 1.2;
    m.pose({ walk: t * 8, mood: 'sad', armR: [.9, .2], armL: [.1, .1], head: [-.5, .15, 0], blink: blinkAt(t) });
    ls.forEach((l, i) => { l.position.set(x + .3, 7.2 - i * .95, -1.6); popIn(l, t, .08 + i * d * .17); }); hrs.position.set(x + .3, 4.25, -1.4); stampIn(hrs, t, d * .68);
    camTo(w, [x + .3, 4.7, 14], [x + .3, 4.7, 13], [x + .3, 4.6, -1.6], [x + .3, 4.6, -1.6], t / d);
  } };
};

F.C = () => {
  const w = street({ signAll: 'NO CHARGING', sh: 30 }); lift(w); const m = MS(); place(m, 0, 0, 0, w.scene); hold(m, phone3('', RED), 2.3, .9);
  return { w, update(t, d) { tickGutter(w, t * .5); const s = Math.sin(t * 3.2); m.pose({ mood: t > d * .6 ? 'sad' : 'shock', armL: [1.7, .15], armR: [1.7, .15], head: [s * .5, -.25, 0], look: [s, .6] });
    camTo(w, [-9, 5.5, 20], [6, 5.2, 17], [-4, 4.6, -2], [3, 4.4, -2], eio(t / d)); }, overlay(g, t, d) { stamp2d(g, t, d * .68, 'NO CHARGING', 1500, RED, 96); } };
};

F.D = () => {
  const w = street({ signs: [] }); const b = bike(0); w.scene.add(b); const m = MS(); w.scene.add(m);
  const ch = label('CHARGER', 2.2, .6, { bg: GOLD }); w.scene.add(ch);
  return { w, update(t, d) {
    tickGutter(w, t * .4); const q = eio(prog(t, 0, d * .55)); const bx = lerp(-6, .8, q); b.position.set(bx, 0, -1); b.rotation.y = 1.57; b.userData.spin(bx * 1.3);
    m.position.set(bx - 1.9, 0, -1.4); m.rotation.y = q < .99 ? 1.4 : lerp(1.4, .5, prog(t, d * .55, d * .7));
    const plug = t > d * .62; stampIn(b.userData.charger, t, d * .62, 1); ch.position.set(bx + .6, 3.1, -1); popIn(ch, t, d * .68);
    m.pose({ walk: q < .99 ? t * 10 : undefined, mood: plug ? 'idea' : 'neutral', armR: [1.3, .25], armL: q < .99 ? [1.3, .25] : [2.3, .4], head: [0, -.05, 0], lean: q < .99 ? .15 : 0, blink: blinkAt(t) });
    camTo(w, [bx - .4, 3.6, 12.5], [bx - .4, 3.5, 11], [bx - .4, 2.4, -1.1], [bx - .4, 2.4, -1.1], 0);
  } };
};

F.D2 = () => {
  const w = street({ signs: [] }); const b = bike(0); place(b, 0, 0, -1, w.scene); b.rotation.y = 1.05; const m = mount(b, MS());
  const pc = label('1%', 2, .9, { bg: RED, fg: '#fff' }); place(pc, .2, 4.85, -1, w.scene); const mn = label('10 MIN', 2, .7, { bg: CREAM }); place(mn, .2, 5.85, -1, w.scene);
  return { w, update(t, d) { tickGutter(w, t * .5); ride(b, m, t, 11, { mood: 'happy', blink: blinkAt(t), head: [-.6, 0, 0] }); const v = Math.round(lerp(1, 50, eo(prog(t, .15, d * .85)))); pc.userData.set(v + '%'); popIn(pc, t, .05); popIn(mn, t, .2);
    pc.material.color.set(v < 20 ? 0xffb0a0 : v < 40 ? 0xffe3a0 : 0xb8f0c4);
    camTo(w, [1.2, 3.6, 13], [1, 3.5, 11.8], [.2, 3, -1], [.2, 3, -1], t / d); } };
};

F.E = () => {
  const w = street({ signs: [], sh: 34, far: 150 }); crowd(w, 12); const m = MS(); place(m, 0, 0, 2.6, w.scene);
  return { w, update(t, d) { tickGutter(w, t); m.rotation.y = lerp(0, 3.14, eio(prog(t, 0, .6))); m.pose({ mood: 'shock', head: [Math.sin(t * 2.4) * .45, -.1, 0], armL: [.2, .25], armR: [.2, .25] }); camTo(w, [0, 3.6, 12], [0, 10, 36], [0, 3.4, 1], [0, 4.4, -1], eio(t / d)); } };
};
F.E2 = () => {
  const w = street({ signs: [] }); const ps = crowd(w, 12, -1.4, true);
  return { w, update(t, d) { tickGutter(w, t * .5); const near = ps.filter(p => Math.abs(p.position.x) < 6); near.forEach((p, i) => { popIn(p.userData.lb, t, .05 + i * d * .14, 1); p.userData.lb.position.y = 4.4 + Math.sin(t * 5 + i) * .06; });
    camTo(w, [0, 4.2, 14], [0, 4.1, 12.8], [0, 3.4, -1], [0, 3.4, -1], t / d); } };
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
  const bt = new THREE.Group(); place(bt, -2.3, 4.6, .4, w.scene); place(box(2, 1, .4, 0x14213d, .15), 0, 0, 0, bt); place(box(.2, .4, .3, 0x14213d, .05), 1.1, 0, 0, bt); const fill = box(.25, .66, .42, M(0xff3b30, .4), .05); place(fill, -.75, 0, .02, bt); bt.rotation.z = .1;
  const b = bike(2, false); place(b, 2.4, 3.4, .4, w.scene); b.rotation.y = -1.57;
  const la = label('DIE', 1.9, .7, { bg: RED, fg: '#fff' }), lb = label("DON'T", 2.2, .7, { bg: GREEN, fg: '#fff' }); place(la, -2.3, 6.6, .6, w.scene); place(lb, 2.4, 6.6, .6, w.scene);
  return { w, update(t, d) {
    const h2 = d * .5; popIn(bt, t, .05); popIn(la, t, .3); popIn(b, t, h2 - .05, .75); popIn(lb, t, h2 + .15); fill.visible = Math.sin(t * 16) > -.2; b.userData.spin(t * 9);
    const r = t > h2; m.pose({ mood: r ? 'happy' : 'sad', armL: [1.3, .7], armR: [1.3, .7], head: [(r ? 1 : -1) * .3, -.05, 0], look: [(r ? 1 : -1) * .8, .5] });
    camTo(w, [0, 4.2, 22], [0, 4.2, 21], [0, 4.2, 0], [0, 4.2, 0], t / d);
  } };
};

F.H = () => {
  const w = street({ signs: SHOP }); lift(w); const sg = w.houses[3].userData.sign; const m = MS(); place(m, -2.4, 0, -.8, w.scene); m.rotation.y = .45;
  const bs = [0, 1, 2].map(i => { const b = bike(i); place(b, .4 + i * 1.6, 0, -1.4, w.scene); b.rotation.y = .25; return b; });
  const rd = mount(bs[0], townsperson(5));
  const pr = label('$2', 1.8, .9, { bg: GOLD }); place(pr, 2.8, 4.1, -1, w.scene); pr.rotation.z = -.08; const tag = label('10 MIN = FULL', 3.6, .85, { bg: PINK }); place(tag, 0, 8.6, -1.6, w.scene);
  const ps = [0, 1].map(i => { const p = townsperson(i + 7); place(p, 6 + i * 2, 0, -.2, w.scene); p.rotation.y = -1.57; return p; });
  return { w, update(t, d) {
    tickGutter(w, t); stampIn(sg, t, d * .1); popIn(tag, t, d * .42); stampIn(pr, t, d * .74); ride(bs[0], rd, t, 9, { mood: 'happy' }); bs.slice(1).forEach(b => b.userData.spin(0));
    ps.forEach((p, i) => { const q = eio(prog(t, d * .3, d * .95)); p.position.x = lerp(7 + i * 2.1, 5 + i * 2.1, q); p.pose({ walk: q < .98 ? t * 9 : undefined, mood: 'happy', ...phonePose, head: [0, 0, 0] }); });
    m.pose({ mood: 'happy', armR: t < d * .1 ? [2.2, .2] : [1.1, .5], armL: [.4, .35], head: t < d * .1 ? [0, -.28, 0] : [.25, 0, 0], look: t < d * .1 ? [0, 1] : [.5, 0], blink: blinkAt(t) });
    camTo(w, [.5, 4.2, 17], [.5, 4.6, 18.5], [.5, 4.3, -1], [.5, 4.6, -1], eio(t / d));
  } };
};

F.I = () => {
  const w = street({ signs: SHOP, sh: 26 }); lift(w); const cnt = label('0 BIKES', 4, 1.1, { bg: CREAM }); place(cnt, 0, 10.4, 0, w.scene);
  const bs = [], rs = []; for (let i = 0; i < 12; i++) { const r = Math.floor(i / 6), c = i % 6; const b = bike(i); place(b, -6.2 + c * 2.5 + r * 1.2, 0, -2.4 + r * 2.2, w.scene); b.rotation.y = .5; bs.push(b); rs.push(i % 2 === 0 ? mount(b, townsperson(i + 2)) : null); }
  return { w, update(t, d) { tickGutter(w, t); let k = 0; bs.forEach((b, i) => { const a = .05 + i * (d * .7 / 12); popIn(b, t, a, 1, .2); if (t > a) k++; if (rs[i]) ride(b, rs[i], t + i, 9, { mood: 'happy' }); else b.userData.spin(0); }); cnt.userData.set(k + ' BIKES');
    camTo(w, [0, 8, 20], [0, 8.6, 18], [0, 3, -1], [0, 2.8, -1], t / d); } };
};

F.J = () => {
  const w = street({ signs: SHOP, bg: 0xf9b27a, sun: 3.2 }); lift(w); const sun = sph(3, M(0xffd23f, .5, 0, { emissive: 0xffb300, emissiveIntensity: 1.2 })); place(sun, 7, 16, -14, w.scene);
  const m = MS(); place(m, 0, 0, -.6, w.scene); const th = label('104°F', 2.6, 1, { bg: RED, fg: '#fff' }); th.rotation.z = .08; place(th, 1, 6.2, -.6, w.scene);
  const sw = new THREE.InstancedMesh(new THREE.SphereGeometry(.09, 10, 8), M(0x8fd3ff, .1), 8); sw.frustumCulled = false; w.scene.add(sw);
  return { w, update(t, d) { tickGutter(w, t * .2); const b = d * .45, on = t > b; stampIn(th, t, b); sun.scale.setScalar(1 + Math.sin(t * 6) * .04 + (on ? .2 : 0));
    for (let i = 0; i < 8; i++) { const q = ((t * 1.6 + i / 8) % 1); setI(sw, i, Math.cos(i * 2.4) * (.6 + q * 1.4), 3.6 + Math.sin(q * 3.1) * .7, -.3, on ? 1 : .001); } doneI(sw);
    m.pose({ mood: on ? 'shock' : 'sad', armL: on ? [2.6, .4] : [.3, .2], armR: [.3, .2], head: [.3, .35, 0], look: [.5, 1], lift: on ? Math.exp(-(t - b) * 6) * .25 : 0 });
    camTo(w, [0, 2.4, 13], [0, 2.2, 11.5], [1, 5, -2], [1.4, 5.6, -2], t / d, on && t < b + .3 ? .04 : 0, t); } };
};

F.J2 = () => {
  const w = street({ signs: SHOP, bg: 0xf9c79a }); lift(w); const bs = [0, 1, 2, 3, 4].map(i => { const b = bike(i); place(b, -5 + i * 2.5, 0, -1.6, w.scene); b.rotation.y = .5; return b; });
  const m = MS(); place(m, 0, 0, .6, w.scene); const z = label('0 RIDERS', 3.6, 1, { bg: RED, fg: '#fff' }); place(z, 0, 4.95, -.2, w.scene);
  return { w, update(t, d) { tickGutter(w, t * .2); bs.forEach(b => b.userData.spin(0)); stampIn(z, t, d * .25); m.pose({ mood: 'shock', armL: [2.6, .3], armR: [2.6, .3], head: [Math.sin(t * 9) * .25, 0, 0], lift: Math.abs(Math.sin(t * 8)) * .06 }); camTo(w, [0, 4, 14], [0, 4, 13], [0, 3.4, -.6], [0, 3.4, -.6], t / d); } };
};

F.K = () => {
  const w = street({ signs: SHOP, bg: 0xf9c79a }); lift(w); const b = bike(0); place(b, -1.5, 0, -1.2, w.scene); b.rotation.y = .9; const m = mount(b, MS());
  const um = umbrella(); place(um, 2.8, 0, -1.6, w.scene); const ps = [0, 1].map(i => { const p = townsperson(i + 3); const ch = chair(p); place(ch, 2 + i * 1.6, 0, -1.5, w.scene); ch.rotation.y = -.3; hold(p, phone3('99%', GREEN, .7), 1.9, .7); return p; });
  const sw = new THREE.InstancedMesh(new THREE.SphereGeometry(.09, 10, 8), M(0x8fd3ff, .1), 10); sw.frustumCulled = false; w.scene.add(sw);
  return { w, update(t, d) { tickGutter(w, t * .3); ride(b, m, t, 18, { mood: 'happy', head: [-.4, -.1, 0], blink: blinkAt(t), lean: .3 });
    for (let i = 0; i < 10; i++) { const q = ((t * 1.8 + i / 10) % 1); setI(sw, i, -1.7 + Math.cos(i * 2.4) * (.5 + q * 1.3), 3.7 + Math.sin(q * 3.1) * .8, -1 + Math.sin(i) * .4); } doneI(sw);
    ps.forEach(p => sit(p, { mood: 'happy', armL: [1.5, .15], armR: [1.5, .15], head: [0, .25, 0], look: [0, -.7] }));
    camTo(w, [.2, 4.2, 17], [.4, 4, 15.8], [.3, 3, -1.4], [.4, 3, -1.4], t / d); } };
};

F.K2 = () => {
  const w = street({ signs: [], bg: 0xf9c79a }); const m = MS(); place(m, -1.2, 0, -1.2, w.scene); m.rotation.y = .9; hold(m, cup(), 1.9, 1.0);
  const p = townsperson(4); place(p, 1, 0, -1.3, w.scene); p.rotation.y = -.9; const cs = [0, 1, 2, 3, 4].map(i => { const k = cup(); place(k, -2.6 + i * .5, 1.58, .2, w.scene); return k; });
  const tb = new THREE.Group(); place(tb, -1.6, 0, .2, w.scene); place(box(3.2, .12, 1, 0xfbf7ee, .04), 0, 1.5, 0, tb); place(box(3, 1.4, .8, 0xf2a9a0, .05), 0, .75, 0, tb);
  const fr = label('FREE LEMONADE', 3.8, .8, { bg: GREEN, fg: '#fff' }); place(fr, -.2, 5.4, -1, w.scene);
  return { w, update(t, d) { tickGutter(w, t * .3); cs.forEach((k, i) => popIn(k, t, .05 + i * .08)); popIn(fr, t, d * .35);
    m.pose({ mood: 'happy', armR: [1.3, .2], armL: [1.3, .2], head: [-.2, 0, 0], blink: blinkAt(t) }); p.pose({ mood: t > d * .5 ? 'happy' : 'neutral', armL: [.2, .1], armR: t > d * .5 ? [2.3, .4] : [.2, .1], lift: t > d * .5 ? Math.abs(Math.sin(t * 9)) * .1 : 0, head: [0, 0, 0] });
    camTo(w, [-.1, 3.8, 11], [-.1, 3.7, 9.8], [-.1, 3.1, -1], [-.1, 3.1, -1], t / d); } };
};

F.M = () => {
  const w = street({ signs: SHOP, sh: 26 }); lift(w); const b1 = bike(1), b2 = bike(4); place(b1, -2.4, 0, -1.4, w.scene); place(b2, 2.4, 0, -1.4, w.scene); b1.rotation.y = .35; b2.rotation.y = -.35;
  const r1 = mount(b1, townsperson(2)), r2 = mount(b2, townsperson(5)); const m = MS(); place(m, 0, 0, .2, w.scene); const fl = new THREE.Group(); place(cyl(.04, .04, 1.4, C.ink, 8), 0, .7, 0, fl); place(box(.8, .5, .03, 0xfbf7ee, .02), .4, 1.15, 0, fl); hold(m, fl, 2.6, .3);
  const s1 = label('0%', 1.6, .7, { bg: CREAM }), s2 = label('0%', 1.6, .7, { bg: CREAM }); place(s1, -2.2, 5.4, -1.2, w.scene); place(s2, 2.2, 5.4, -1.2, w.scene);
  const rc = label('RACE!', 2.6, .9, { bg: GOLD }); place(rc, 0, 7, -1, w.scene);
  return { w, update(t, d) { tickGutter(w, t); ride(b1, r1, t, 16, { mood: 'happy', lean: .3 }); ride(b2, r2, t + .4, 15, { mood: 'shock', lean: .3 }); stampIn(rc, t, .05);
    s1.userData.set(Math.round(lerp(10, 92, eo(prog(t, 0, d)))) + '%'); s2.userData.set(Math.round(lerp(10, 88, eo(prog(t, 0, d)))) + '%');
    m.pose({ mood: 'happy', armR: [2.6 + Math.sin(t * 12) * .25, .3], armL: [.3, .2], head: [Math.sin(t * 4) * .3, 0, 0], lift: Math.abs(Math.sin(t * 8)) * .08 });
    camTo(w, [0, 4.6, 19.5], [0, 4.4, 18], [0, 3.8, -1], [0, 3.8, -1], t / d); } };
};

F.M2 = () => {
  const w = street({ signs: SHOP, sh: 26 }); lift(w); const m = MS(); place(m, -1.2, 0, -.8, w.scene);
  const a = label('$2', 2.2, 1.1, { bg: CREAM }), b = label('$5', 2.6, 1.3, { bg: GOLD }), fr = label('EVERY FRIDAY', 3.6, .8, { bg: RED, fg: '#fff' }); place(a, 1.6, 6.2, -.8, w.scene); place(b, 1.6, 6.2, -.7, w.scene); place(fr, 1.6, 5.05, -.7, w.scene);
  const ps = [0, 1, 2, 3, 4].map(i => { const p = townsperson(i + 3); place(p, 3 + i * 1.8, 0, -.4, w.scene); p.rotation.y = -1.57; p.pose({ mood: 'happy', armL: [.2, .1], armR: [.2, .1] }); return p; });
  return { w, update(t, d) { tickGutter(w, t); popIn(a, t, .05); const sw = d * .28; a.visible = t < sw; stampIn(b, t, sw); popIn(fr, t, d * .55); m.pose({ mood: t > d * .5 ? 'smug' : 'happy', armL: [.2, .35], armR: [.2, .35], head: [0, -.08, 0], blink: blinkAt(t) }); camTo(w, [1.6, 4.4, 17], [1.6, 4.4, 15.5], [1.6, 3.8, -1], [1.6, 3.8, -1], t / d); },
    overlay(g, t, d) { stamp2d(g, t, d * .5, 'SOLD OUT', 900); } };
};

F.N = () => {
  const w = street({ signs: SHOP }); lift(w); const tw = tower(); place(tw, HX(4) + 1.5, 0, -2.2, w.scene); const rb = robot(); w.scene.add(rb);
  const m = MS(); place(m, HX(4) - 2.3, 0, -.6, w.scene); m.rotation.y = .9; const pr = label('$0.50 / CHARGE', 3.2, .75, { bg: RED, fg: '#fff' }); place(pr, HX(4) - .2, 7.4, -1, w.scene);
  return { w, update(t, d) { tickGutter(w, t); const q = eo(prog(t, .1, d * .45)); stampIn(tw, t, .05); rb.position.set(lerp(HX(4) + 6, HX(4) - .1, q), 0, -.4); rb.rotation.y = -q * .5; rb.userData.arm.rotation.x = -1 + Math.sin(t * 5) * .3; stampIn(pr, t, d * .62);
    m.pose({ mood: t > d * .45 ? 'shock' : 'neutral', head: [.4, 0, 0], look: [.6, .2], armL: [.2, .2], armR: [.2, .2], blink: blinkAt(t) }); camTo(w, [HX(4), 4.8, 21.5], [HX(4), 4.8, 20.5], [HX(4), 4.1, -1], [HX(4), 4.1, -1], t / d); } };
};

F.N2 = () => {
  const w = world(0x9aa6b8, { floor: 0x7f8aa0, env: .7, sun: 1.9, sh: 14, far: 70 }); place(box(40, 14, .3, 0xb7c0cf, .02), 0, 7, -5, w.scene);
  const tw = tower(); place(tw, 2.4, 0, -2.6, w.scene); const rb = robot(); place(rb, -1.2, 0, -1, w.scene); rb.rotation.y = .3;
  const lb = label('LOW BATTERY', 3.2, .75, { bg: RED, fg: '#fff' }); place(lb, -.2, 5.2, -.6, w.scene);
  return { w, update(t, d) { const b = d * .5, off = t > b; const k = off ? prog(t, b, b + .5) : 0;
    rb.userData.em.emissiveIntensity = off ? lerp(1.6, 0, k) : (Math.sin(t * 20) > 0 ? 1.6 : .4); rb.userData.em.color.set(off ? 0x334455 : 0x37c6ff);
    rb.userData.bd.rotation.x = eo(k) * .45; rb.userData.hd.rotation.x = eo(k) * .4; rb.userData.arm.rotation.x = off ? lerp(-1, 0, k) : -1 + Math.sin(t * 7) * .2;
    tw.userData.scr.userData.set(off ? 'OFF' : '$0.50'); stampIn(lb, t, d * .12); camTo(w, [0, 4, 15], [0, 3.8, 13.4], [.4, 3, -1.5], [.2, 2.8, -1.5], t / d); },
    overlay(g, t, d) { stamp2d(g, t, d * .6, 'DEAD', 1480, RED, 130); } };
};

F.O = () => {
  const w = street({ signs: SHOP }); lift(w); const m = MS(); place(m, -2.6, 0, -1.8, w.scene); m.rotation.y = .6;
  const b = bike(3); place(b, 1.4, 0, -1.2, w.scene); b.rotation.y = -.7; const bs = mount(b, person(BOSS)); const lb = label('MEGASOCK BOSS', 3.3, .7, { bg: RED, fg: '#fff' }); place(lb, .9, 5.9, -1.2, w.scene);
  return { w, update(t, d) { tickGutter(w, t); ride(b, bs, t, 12, { mood: 'shock', lean: .28, head: [.2, 0, 0] }); popIn(lb, t, .15);
    m.pose({ mood: 'smug', ...crossed, head: [.4, 0, 0], look: [.6, 0], blink: blinkAt(t) }); camTo(w, [-.4, 4.2, 17], [-.4, 4, 15.6], [-.4, 3.4, -1.5], [-.4, 3.4, -1.5], t / d); } };
};

F.Q = () => {
  const w = street({ signs: ['ODD PAIRS', 'STANDING ROOM', 'PLANT HOTEL', 'PEDAL POWER', 'SORRY CAKE', 'PLANT HOTEL', 'ODD PAIRS'], bg: 0xbfe6ea, sh: 40, far: 150 }); lift(w);
  const m = MS(); place(m, 0, 0, -2.6, w.scene); const n = 16; for (let i = 0; i < n; i++) { const p = townsperson(i + 2); place(p, 2 + i * 1.55, 0, -.9, w.scene); p.rotation.y = -1.57; p.pose({ mood: 'happy', armL: [.2, .1], armR: [.2, .1], head: [0, 0, 0] }); }
  [0, 1, 2].forEach(i => { const b = bike(i); place(b, -2.4 - i * 2.2, 0, -1.6, w.scene); b.rotation.y = .4; });
  const wl = label('LINE STARTS HERE', 4.6, .9, { bg: GOLD }); place(wl, 13, 5.6, -.9, w.scene);
  return { w, update(t, d) { tickGutter(w, t * 2); popIn(wl, t, d * .35); m.pose({ mood: 'happy', armL: [2.3, .55], armR: [2.3, .55], head: [0, -.05, 0], lift: Math.abs(Math.sin(t * 5)) * .15 }); camTo(w, [0, 3.6, 13], [6, 10, 38], [0, 3.6, -2], [6, 4.5, -2], eio(t / d)); } };
};

F.R = () => {
  const w = street({ signs: SHOP }); lift(w); const m = MS(); place(m, 0, 0, -1.2, w.scene); hold(m, phone3('1%', RED), 2.3, .9);
  const draw = deadPhone(.6, (g, t, d, dead) => { if (dead) stamp2d(g, t, d * .65, 'AGAIN', 760, RED, 140); });
  return { w, update(t, d) { tickGutter(w, t * .3); m.pose({ mood: 'neutral', ...phonePose, blink: blinkAt(t) }); camTo(w, [0, 3.6, 10], [0, 3.5, 8.8], [0, 3.2, -1.2], [0, 3.1, -1.2], t / d); }, overlay: draw };
};

F.S = () => {
  const w = street({ signs: SHOP }); lift(w); const b = bike(0); place(b, .8, 0, -1.2, w.scene); b.rotation.y = .8; const m = MS(); b.add(m);
  return { w, update(t, d, P) {
    tickGutter(w, t * .4); const sw = P ? P('S2', 0) : d * .5; const h = eio(prog(t, sw + .05, sw + .4));
    m.position.set(lerp(-1.6, 0, h), lerp(0, .24, h) + Math.sin(h * Math.PI) * .9, lerp(.3, -.12, h)); m.rotation.y = lerp(-.6, 0, h);
    if (h >= 1) ride(b, m, t - sw, 10, { mood: 'happy', blink: blinkAt(t), head: [-.5, 0, 0] }); else { b.userData.spin(0); m.pose({ mood: 'happy', armR: [.4, .2], armL: [.2, .1], head: [0, -.1, 0], legL: -h * .8, legR: -h * .8, blink: blinkAt(t) }); }
    camTo(w, [.4, 3.8, 13], [.6, 3.7, 11.8], [.4, 3, -1.2], [.6, 2.9, -1.2], eio(t / d));
  } };
};

F.Z = recap(['PHONES DIE AT 1%', 'PEDAL TO CHARGE, $2', '$1,000,000'], ['ODD PAIRS', 'STANDING ROOM', 'PLANT HOTEL', 'PEDAL POWER', 'SORRY CAKE', 'PLANT HOTEL', 'ODD PAIRS']);
