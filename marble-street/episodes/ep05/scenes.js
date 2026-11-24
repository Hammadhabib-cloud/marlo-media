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
const THEO = { top: 0x2fa4a8, pant: 0x3c4560, skin: 0xf3d2b3, hair: 0xc0562a, style: 'short', shoe: 0x14213d, sockL: 0xfbf7ee, sockR: 0xfbf7ee };
const theo = () => person(THEO);
const BOSS = { top: 0x3a3a48, pant: 0x23232b, skin: 0xf0c49c, hair: 0xe4572e, style: 'cap', shoe: 0x14213d, sockL: 0xe4572e, sockR: 0xe4572e };
const hold = (p, o, y = 1.3, z = 1.0) => { place(o, 0, y, z, p); return o; };
const HX = i => (i - 3) * 6.55; // 3 = Marlo, 5 = Theo
const lift = (w, y = 4.8) => w.houses.forEach(h => { if (h.userData.sign) h.userData.sign.position.y = y; });
const SHOP = ['', '', '', 'SORRY CAKE', '', '', ''];
const crossed = { armL: [1.25, -.32], armR: [1.25, -.32] };

// ---------- props
const CAKEC = [[0xf2a9a0, 0xfbf7ee], [0x7b4a2e, 0xf2a9a0], [0xf7e2a0, 0x7fd6b5], [0xfbf7ee, 0xe4572e], [0x7fd6b5, 0xfbf7ee]];
export function cake(word = 'SORRY', s = 1, ci = 0) {
  const g = new THREE.Group(); const [a, b] = CAKEC[ci % CAKEC.length];
  place(cyl(1.25, 1.25, .08, 0xe9eef5, 40, .3), 0, .04, 0, g);
  place(cyl(1, 1, .62, a, 40, .7), 0, .39, 0, g); place(cyl(1.03, 1.03, .1, b, 40, .5), 0, .72, 0, g);
  place(cyl(.78, .78, .5, a, 40, .7), 0, .99, 0, g); place(cyl(.81, .81, .1, b, 40, .5), 0, 1.25, 0, g);
  for (let i = 0; i < 10; i++) { const q = i / 10 * 6.283; place(sph(.09, b, .5), Math.cos(q) * .95, .66, Math.sin(q) * .95, g); }
  place(sph(.12, 0xe4572e, .3), 0, 1.42, -.45, g);
  if (word) { const l = label(word, 1.6, .62, { bg: CREAM, fg: RED, border: RED, rad: 20 }); l.rotation.x = -.35; place(l, 0, 1.75, .25, g); [-.55, .55].forEach(x => place(cyl(.03, .03, .55, 0xe6dbc1, 6), x, 1.45, .2, g)); g.userData.word = l; }
  g.scale.setScalar(s); return g;
}
function robot() {
  const g = new THREE.Group(); place(cyl(.6, .6, .5, 0x5b6a82, 22), 0, .3, 0, g); place(box(1.3, 1.5, 1, 0xc9ced8, .22, .35), 0, 1.35, 0, g); place(box(1.1, .8, .9, 0xdfe3ea, .22, .3), 0, 2.55, 0, g);
  [-.25, .25].forEach(x => place(sph(.12, M(0x37c6ff, .2, 0, { emissive: 0x37c6ff, emissiveIntensity: 1.6 })), x, 2.6, .46, g)); place(cyl(.03, .03, .5, C.ink, 8), 0, 3.15, 0, g); place(sph(.1, 0xe4572e), 0, 3.42, 0, g);
  const lg = label('MEGA', 1, .38, { bg: RED, fg: '#fff', rad: 20 }); place(lg, 0, 1.6, .52, g);
  const arm = new THREE.Group(); place(arm, .78, 1.85, 0, g); place(box(.22, .9, .22, 0x9aa2b2, .08), 0, -.4, 0, arm); place(box(.5, .8, .08, C.ink, .05), .1, -.95, .25, arm); g.userData.arm = arm; return g;
}
function smoke(w, n = 26) { const m = new THREE.InstancedMesh(new THREE.SphereGeometry(.5, 14, 10), M(0x6b7280, .9), n); m.frustumCulled = false; w.scene.add(m); return m; }

// ---------- 2D overlays
function banner(g, t, a, txt, bg = GOLD, fg = INK, y = 560) {
  const p = prog(t, a, a + .3); if (p <= 0) return; const s = back(p); g.save(); g.translate(540, y); g.scale(s, s); g.rotate(-.03);
  g.font = '74px "Archivo Black"'; const w = g.measureText(txt).width + 90; g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 24; g.shadowOffsetY = 10;
  g.fillStyle = bg; g.beginPath(); g.roundRect(-w / 2, -70, w, 140, 40); g.fill(); g.shadowColor = 'transparent'; g.lineWidth = 8; g.strokeStyle = INK; g.stroke();
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 0, 6); g.restore();
}
function stamp2d(g, t, a, txt, y = 760, col = RED, fs = 130) {
  const p = prog(t, a, a + .22); if (p <= 0) return; const s = lerp(2.2, 1, eo(p)); g.save(); g.translate(540, y); g.rotate(-.12); g.scale(s, s); g.globalAlpha = Math.min(1, p * 2);
  g.font = `${fs}px "Archivo Black"`; g.textAlign = 'center'; g.textBaseline = 'middle'; const w = g.measureText(txt).width + 80;
  g.fillStyle = 'rgba(251,247,238,.92)'; g.beginPath(); g.roundRect(-w / 2, -fs * .73, w, fs * 1.46, 26); g.fill(); g.lineWidth = 14; g.strokeStyle = col; g.stroke(); g.fillStyle = col; g.fillText(txt, 0, 8); g.restore();
}
function phone(g, t, d, o) {
  const p = eo(prog(t, .02, .32)); if (p <= 0) return; const pw = 700, ph = 980, x0 = 540 - pw / 2, y0 = 250 + (1 - p) * 1200;
  g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 40; g.fillStyle = '#0b1224'; g.beginPath(); g.roundRect(x0, y0, pw, ph, 70); g.fill(); g.shadowColor = 'transparent';
  g.fillStyle = o.bg || '#f4f6fb'; g.beginPath(); g.roundRect(x0 + 22, y0 + 22, pw - 44, ph - 44, 52); g.fill();
  o.draw(g, x0, y0, pw, ph, t, d); g.restore();
}
function bubble(g, x, y, txt, me, fs = 44) { g.font = `${fs}px "Archivo Black"`; const w = g.measureText(txt).width + 60, h = fs + 46; const bx = me ? x - w : x; g.fillStyle = me ? '#2e86ff' : '#e3e7ef'; g.beginPath(); g.roundRect(bx, y, w, h, 30); g.fill(); g.fillStyle = me ? '#fff' : INK; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(txt, bx + 30, y + h / 2 + 2); return h; }
function note(g, t, lines, o = {}) {
  const p = eo(prog(t, o.at ?? 0, (o.at ?? 0) + .35)); if (p <= 0) return; const cw = 820, ch = 120 + lines.length * 96;
  g.save(); g.translate(540, (o.y ?? 640) + (1 - p) * 1100); g.rotate((o.rot ?? -.05) * (1 + (1 - p) * 3));
  g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 40; g.shadowOffsetY = 18; g.fillStyle = '#fbf7ee'; g.fillRect(-cw / 2, -ch / 2, cw, ch); g.shadowColor = 'transparent';
  g.fillStyle = '#f2a9a0'; g.fillRect(-cw / 2, -ch / 2, cw, 26);
  g.textAlign = 'center'; g.textBaseline = 'middle'; lines.forEach((l, i) => { let fs = l[1] || 62; g.font = `${fs}px "Archivo Black"`; while (g.measureText(l[0]).width > cw - 90) { fs *= .95; g.font = `${fs}px "Archivo Black"`; } g.fillStyle = l[2] || INK; g.fillText(l[0], 0, -ch / 2 + 110 + i * 96); });
  g.restore();
}

// ---------- sets
function room() {
  const w = world(0xf3d9b1, { floor: 0xc99b6a, env: .9, sun: 2.2, sh: 12, far: 60 }); const sc = w.scene;
  place(box(40, 18, .4, 0xf3d9b1, .02, .9), 0, 9, -4.2, sc); place(box(40, .45, .3, 0xe2c393, .02, .8), 0, .22, -3.9, sc);
  place(box(3.4, 2.8, .14, 0xfbf7ee, .05), -4.6, 5.2, -3.95, sc); place(box(3, 2.4, .1, 0xbfe6ea, .03, .2), -4.6, 5.2, -3.87, sc);
  place(box(4.4, 1, 1.7, 0x2fa4a8, .2, .8), 3.2, .5, -2.6, sc); place(box(4.4, 1.5, .5, 0x2fa4a8, .2, .8), 3.2, 1.6, -3.35, sc);
  const cal = new THREE.Group(); place(cal, -.6, 5.9, -3.95, sc); place(box(2.8, 3, .08, 0xfbf7ee, .06), 0, 0, 0, cal); place(box(2.8, .55, .1, 0xe4572e, .06), 0, 1.25, .01, cal);
  const txt = label("THEO'S\nBIRTHDAY", 2.5, 1.5, { bg: null, fg: INK }); place(txt, 0, .05, .06, cal);
  const ring = mesh(new THREE.TorusGeometry(1.25, .07, 10, 48), M(0xe4572e, .5)); ring.scale.y = .72; place(ring, 0, .05, .1, cal); cal.userData.ring = ring;
  return { w, cal };
}
function kitchen() {
  const w = world(0xf7e2c4, { floor: 0xd9c3a0, env: .9, sun: 2.2, sh: 12, far: 60 }); const sc = w.scene;
  place(box(40, 18, .4, 0xbfe6ea, .02, .9), 0, 9, -4.2, sc); for (let x = -8; x <= 8; x += 1.1) place(box(1, 1, .06, 0xfbf7ee, .03, .4), x, 3.4, -3.98, sc);
  place(box(7, 1.8, 1.6, 0xfbf7ee, .08, .6), -.6, .9, -.4, sc); place(box(7.2, .16, 1.8, 0xb07a4a, .04, .5), -.6, 1.88, -.4, sc);
  const ov = new THREE.Group(); place(ov, 3.9, 0, -2.7, sc); place(box(2.6, 2.8, 2, 0x8d99ae, .14, .35), 0, 1.4, 0, ov); const glass = box(1.8, 1.1, .08, M(0x20324f, .15), .05); place(glass, 0, 1.25, 1.02, ov);
  const glow = box(1.6, .9, .05, M(0xffa94d, .4, 0, { emissive: 0xff8a2a, emissiveIntensity: .8 }), .04); place(glow, 0, 1.25, .98, ov); [-.6, 0, .6].forEach(x => place(cyl(.13, .13, .08, C.ink, 16).rotateX(Math.PI / 2), x, 2.4, 1.02, ov));
  ov.userData.glow = glow;
  place(box(3, .14, .7, 0xb07a4a, .03), -1.8, 5.6, -3.7, sc); [[-2.8, 0xf2a9a0], [-1.8, 0x7fd6b5], [-.8, 0xf7e2a0]].forEach(([x, c]) => place(cyl(.3, .3, .7, c, 20), x, 6.05, -3.6, sc));
  return { w, ov };
}

// ================= SCENES
F.A = () => {
  const { w, cal } = room(); const m = MS(); place(m, .5, 0, -1.6, w.scene); m.rotation.y = -.35;
  const yest = label('YESTERDAY', 3, .8, { bg: RED, fg: '#fff' }); yest.rotation.z = .1; place(yest, -.6, 4.05, -3.6, w.scene);
  return { w, update(t, d) {
    const hit = d * .42; cal.userData.ring.rotation.z = t * .4; stampIn(yest, t, hit);
    m.pose({ mood: t > hit ? 'shock' : 'happy', head: [-.35, -.15, 0], look: [-.6, .6], armL: t > hit ? [2.6, .4] : [.2, .1], armR: t > hit ? [2.6, .4] : [.2, .1], lift: t > hit ? Math.exp(-(t - hit) * 6) * .3 : 0, blink: blinkAt(t) });
    camTo(w, [-.4, 6, 6.5], [.4, 4.2, 12.5], [-.5, 5.6, -3.8], [.3, 3.8, -2], eio(t / d), t > hit && t < hit + .25 ? .03 : 0, t);
  } };
};

F.A2 = () => {
  const w = world(0x7b3f5e, { floor: 0x8e4d6e, env: .7, sun: 2.5, sh: 16 }); const n = 110, r = rand(5);
  const body = new THREE.InstancedMesh(new THREE.CylinderGeometry(.7, .7, .55, 24), M(0xffffff, .7), n), top = new THREE.InstancedMesh(new THREE.CylinderGeometry(.73, .73, .1, 24), M(0xffffff, .5), n);
  [body, top].forEach(x => { x.castShadow = true; x.frustumCulled = false; w.scene.add(x); });
  const col = new THREE.Color(); for (let i = 0; i < n; i++) { const a = r() * 6.28, q = Math.sqrt(r()), ra = q * 8, y = (1 - q) * 4.2 + r() * .25, x = Math.cos(a) * ra, z = Math.sin(a) * ra - 1; const c = CAKEC[i % 5]; setI(body, i, x, y + .3, z, 1, (r() - .5) * .3, (r() - .5) * .3); setI(top, i, x, y + .62, z, 1, (r() - .5) * .3, (r() - .5) * .3); body.setColorAt(i, col.set(c[0])); top.setColorAt(i, col.set(c[1])); }
  [body, top].forEach(x => { x.instanceMatrix.needsUpdate = true; x.instanceColor.needsUpdate = true; });
  const m = MS(); place(m, 0, 4.9, 0, w.scene);
  const N = 46, ms = new THREE.InstancedMesh(new THREE.SphereGeometry(.28, 18, 12), M(C.gold, .14, .55), N); ms.castShadow = true; ms.frustumCulled = false; w.scene.add(ms);
  const Dd = []; for (let i = 0; i < N; i++) Dd.push({ x: (r() - .5) * 7, z: (r() - .5) * 3 - 1.5, o: r() * 1.5, sp: 6 + r() * 4 });
  return { w, update(t, d) {
    Dd.forEach((p, i) => { const y = 16 - ((t + p.o) % 2.2) * p.sp; setI(ms, i, p.x, y < .3 ? -9 : y, p.z); }); doneI(ms);
    m.pose({ mood: 'happy', armL: [2.4, .55 + Math.sin(t * 9) * .12], armR: [2.4, .55 - Math.sin(t * 9) * .12], lift: Math.abs(Math.sin(t * 7)) * .22, head: [0, -.08, 0] });
    camTo(w, [0, 6.4, 21], [0, 7.2, 16.5], [0, 7, 0], [0, 7.9, 0], eo(t / d));
  } };
};

F.B = () => {
  const w = street({ signs: [] }); const x = HX(5); const T = theo(); place(T, x + .9, 0, -2.4, w.scene);
  const m = MS(); place(m, x - 1.4, 0, -2.3, w.scene); m.rotation.y = 1.1;
  const a = label('1 WEEK', 2.4, .8, { bg: CREAM }), b = label('NOT TALKING', 3.4, .8, { bg: RED, fg: '#fff' }); place(a, x - .2, 6.7, -2.4, w.scene); place(b, x - .2, 5.75, -2.4, w.scene);
  return { w, update(t, d) {
    tickGutter(w, t * .5); const turn = eio(prog(t, .1, .55)); T.rotation.y = lerp(-1.2, 2.5, turn);
    T.pose({ mood: 'stare', ...crossed, head: [0, -.12, 0] }); m.pose({ mood: 'sad', armR: [1.6, .3], armL: [.2, .1], head: [-.2, 0, 0], blink: blinkAt(t) });
    popIn(a, t, d * .45); popIn(b, t, d * .62); camTo(w, [x - .2, 4, 12.5], [x - .2, 4.1, 11.3], [x - .2, 3.7, -2.4], [x - .2, 3.8, -2.4], t / d);
  } };
};

F.C = () => {
  const w = street({ signs: [] }); const m = MS(); place(m, 0, 0, -1.2, w.scene); const ph = box(.42, .8, .08, C.ink, .06); hold(m, ph, 2.3, .9);
  return { w, update(t, d) { tickGutter(w, t * .3); m.pose({ mood: 'sad', armL: [1.7, .15], armR: [1.7, .15], head: [0, .3, 0], look: [0, -.8], blink: blinkAt(t) }); camTo(w, [0, 3.6, 10], [0, 3.6, 9], [0, 3.2, -1.2], [0, 3.2, -1.2], t / d); },
    overlay(g, t, d) {
      phone(g, t, d, { draw(g, x0, y0, pw, ph, t, d) {
        g.fillStyle = '#e3e7ef'; g.fillRect(x0 + 22, y0 + 60, pw - 44, 110); g.fillStyle = INK; g.font = '46px "Archivo Black"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('THEO', 540, y0 + 115);
        const a1 = d * .12; if (t > a1) { const s = back(prog(t, a1, a1 + .25)); g.save(); g.translate(x0 + pw - 70, y0 + 300); g.scale(s, s); bubble(g, 0, 0, 'sorry...', true, 52); g.restore(); }
        if (t > d * .38) { g.fillStyle = '#7b8496'; g.font = '34px "Archivo Black"'; g.textAlign = 'right'; g.fillText('SEEN', x0 + pw - 75, y0 + 430); }
        const tp = t > d * .5 && t < d * .7; if (tp) { const k = Math.floor(t * 6) % 3; g.fillStyle = '#e3e7ef'; g.beginPath(); g.roundRect(x0 + 70, y0 + 500, 170, 90, 30); g.fill(); for (let i = 0; i < 3; i++) { g.fillStyle = i === k ? INK : '#9aa2b2'; g.beginPath(); g.arc(x0 + 115 + i * 40, y0 + 545, 12, 0, 7); g.fill(); } }
      } });
      stamp2d(g, t, d * .72, 'NO REPLY', 800, RED, 110);
    } };
};

F.D = () => {
  const { w } = kitchen(); const m = MS(); place(m, -2.2, 0, -1.8, w.scene); m.rotation.y = .35; const ck = cake('SORRY', 1, 0); place(ck, .7, 1.96, -.3, w.scene);
  const bag = mesh(new THREE.ConeGeometry(.22, .8, 16), M(0xfbf7ee, .6)); bag.rotation.x = Math.PI; hold(m, bag, 1.5, 1.0);
  return { w, update(t, d) {
    const sp = prog(t, .05, .4); ck.visible = sp > 0; ck.scale.setScalar(Math.max(.0001, back(sp)));
    const wd = ck.userData.word; stampIn(wd, t, d * .45, 1); if (t > d * .7) wd.scale.setScalar(1 + .12 * Math.sin((t - d * .7) * 9) * Math.exp(-(t - d * .7) * 2));
    m.pose({ mood: t > d * .45 ? 'idea' : 'happy', armR: [1.5 + Math.sin(t * 12) * .15, .3], armL: [.6, .3], head: [.3, -.25, 0], look: [.5, -.5], blink: blinkAt(t) });
    camTo(w, [-.6, 4.6, 12.5], [-.5, 4.2, 9.6], [-.6, 2.7, -.8], [-.5, 2.8, -.6], eio(t / d));
  } };
};

F.D2 = () => {
  const w = street({ signs: [] }); const x = HX(5); const T = theo(); place(T, x + .8, 0, -2.6, w.scene); T.rotation.y = -.9;
  const m = MS(); place(m, x - 1.3, 0, -2.3, w.scene); m.rotation.y = 1; const ck = hold(m, cake('SORRY', .6, 0), 1.4, 1.05);
  return { w, update(t, d) {
    tickGutter(w, t * .4); const lau = t > d * .42, k = lau ? Math.abs(Math.sin((t - d * .42) * 10)) : 0;
    T.pose({ mood: lau ? 'happy' : 'stare', ...(lau ? { armL: [2.5, .5], armR: [2.5, .5] } : crossed), lift: k * .18, head: [0, lau ? -.15 : 0, 0] });
    m.pose({ mood: lau ? 'happy' : 'neutral', armL: [1.25, .2], armR: [1.25, .2], head: [-.15, 0, 0], lift: lau ? k * .12 : 0, blink: blinkAt(t) });
    camTo(w, [x - .2, 3.8, 11], [x - .2, 3.8, 9.8], [x - .2, 3.3, -2.5], [x - .2, 3.4, -2.5], t / d);
  } };
};

function pairs(w, n, z = -1.6) {
  const out = []; for (let i = 0; i < n; i++) { const x = -15 + i * 6; [-1, 1].forEach((s, j) => { const p = townsperson(i * 2 + j + 1); place(p, x + s * .55, 0, z + (i % 2) * .6, w.scene); p.rotation.y = s * 1.57; p.pose({ mood: j ? 'stare' : 'sad', ...crossed, head: [0, -.1, 0] }); out.push(p); }); }
  return out;
}
F.E = () => {
  const w = street({ signs: [], sh: 34, far: 150 }); pairs(w, 6); const m = MS(); place(m, 0, 0, 2.6, w.scene);
  return { w, update(t, d) { tickGutter(w, t); m.rotation.y = lerp(0, 3.14, eio(prog(t, 0, .6))); m.pose({ mood: 'shock', head: [Math.sin(t * 2.4) * .45, -.1, 0], armL: [.2, .25], armR: [.2, .25] }); camTo(w, [0, 3.6, 12], [0, 10, 36], [0, 3.4, 1], [0, 4.4, -1], eio(t / d)); } };
};
F.E2 = () => {
  const w = street({ signs: [] }); pairs(w, 6, -3); const pr = [-1, 1].map((sd, j) => { const p = townsperson(j + 7); place(p, sd * .6, 0, -.4, w.scene); p.rotation.y = sd * 1.57; return p; });
  const cl = new THREE.Group(); [[0, 0, .75], [.75, .1, .6], [-.75, .1, .6], [0, .45, .55]].forEach(([a, b, r]) => place(sph(r, 0x6b7280, .9), a, b, 0, cl)); place(cl, 0, 5.4, -.4, w.scene);
  const lb = label('NOT TALKING', 3.4, .8, { bg: RED, fg: '#fff' }); place(lb, 0, 6.9, -.4, w.scene);
  return { w, update(t, d) { tickGutter(w, t * .5); pr.forEach((p, j) => p.pose({ mood: j ? 'stare' : 'sad', ...crossed, head: [0, -.1, 0], lift: Math.abs(Math.sin(t * 6 + j)) * .04 })); cl.position.y = 5.4 + Math.sin(t * 4) * .1; cl.rotation.z = Math.sin(t * 3) * .05; popIn(lb, t, .2); camTo(w, [0, 4.4, 14.5], [0, 4.3, 13.5], [0, 3.9, -.4], [0, 3.9, -.4], t / d); } };
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
  const sb = label('SORRY', 2.4, 1.1, { bg: '#fff', fg: INK, border: INK, rad: 50 }); place(sb, -2.2, 5.2, .4, w.scene); const ck = cake('', .95, 3); place(ck, 2.3, 4.1, .4, w.scene); ck.rotation.x = .35;
  const la = label('HARD', 2.2, .7, { bg: RED, fg: '#fff' }), lb = label('EASY', 2.2, .7, { bg: GREEN, fg: '#fff' }); place(la, -2.2, 7.1, .6, w.scene); place(lb, 2.3, 7.1, .6, w.scene);
  return { w, update(t, d) {
    const h2 = d * .5; popIn(sb, t, .05); popIn(la, t, .3); popIn(ck, t, h2 - .05, .95); popIn(lb, t, h2 + .15); sb.rotation.z = Math.sin(t * 20) * .03 * (t < h2 ? 1 : 0);
    const r = t > h2; m.pose({ mood: r ? 'happy' : 'shock', armL: [1.3, .7], armR: [1.3, .7], head: [(r ? 1 : -1) * .3, -.05, 0], look: [(r ? 1 : -1) * .8, .5], lean: r ? 0 : .08 });
    camTo(w, [0, 3.9, 19], [0, 3.9, 18.2], [0, 3.6, 0], [0, 3.6, 0], t / d);
  } };
};

F.H = () => {
  const w = street({ signs: SHOP }); lift(w); const sg = w.houses[3].userData.sign; const m = MS(); place(m, -1.1, 0, -1, w.scene); m.rotation.y = .45;
  const desk = new THREE.Group(); place(desk, 1.6, 0, -.9, w.scene); place(box(2, 1.4, .9, 0xfbf7ee, .08), 0, .7, 0, desk); place(box(2.1, .1, 1, 0xb07a4a, .03), 0, 1.45, 0, desk); const c1 = cake('SORRY', .45, 0); place(c1, -.4, 1.5, 0, desk); const c2 = cake('MY BAD', .45, 2); place(c2, .5, 1.5, .05, desk);
  const pr = label('$10', 2, .9, { bg: GOLD }); place(pr, 1.8, 3.3, -.3, w.scene); pr.rotation.z = -.08; const tag = label('ANY APOLOGY', 3.6, .85, { bg: PINK }); place(tag, 0, 8.6, -1.6, w.scene);
  const ps = [0, 1, 2].map(i => { const p = townsperson(i + 4); place(p, 6 + i * 2, 0, -.4, w.scene); p.rotation.y = -1.57; return p; });
  return { w, update(t, d) {
    tickGutter(w, t); stampIn(sg, t, d * .12); popIn(tag, t, d * .4); stampIn(pr, t, d * .72);
    ps.forEach((p, i) => { const q = eio(prog(t, d * .3, d * .95)); p.position.x = lerp(6.5 + i * 2.1, 3.6 + i * 2.1, q); p.pose({ walk: q < .98 ? t * 9 : undefined, mood: 'sad', head: [0, 0, 0] }); });
    m.pose({ mood: 'happy', armR: t < d * .12 ? [2.2, .2] : [1.1, .5], armL: [.4, .35], head: t < d * .12 ? [0, -.28, 0] : [.25, 0, 0], look: t < d * .12 ? [0, 1] : [.5, 0], blink: blinkAt(t) });
    camTo(w, [.5, 4.2, 17], [.5, 4.6, 18.5], [.5, 4.3, -1], [.5, 4.6, -1], eio(t / d));
  } };
};

F.I = () => {
  const w = street({ signs: SHOP, sh: 26 }); lift(w); const cnt = label('0 SORRIES', 4.4, 1.1, { bg: CREAM }); place(cnt, 0, 10.4, 0, w.scene);
  const WORDS = ['SORRY', 'MY BAD', 'OOPS', 'FORGIVE ME', 'SORRY!'];
  const cs = []; for (let i = 0; i < 40; i++) { const r = Math.floor(i / 10), c = i % 10; const k = cake(i % 3 === 0 ? WORDS[i % 5] : '', .5, i % 5); place(k, -6.3 + c * 1.4 + (r % 2) * .7, .1, -3.2 + r * 1.25, w.scene); cs.push(k); }
  const m = MS(); place(m, 0, .3, -3.8, w.scene);
  return { w, update(t, d) { tickGutter(w, t); let k = 0; cs.forEach((p, i) => { const a = .05 + i * (d * .8 / 40); popIn(p, t, a, .5, .16); if (t > a) k++; }); cnt.userData.set(k + ' SORRIES'); m.pose({ mood: 'happy', armL: [2.3, .5], armR: [2.3, .5], head: [0, -.1, 0], lift: Math.abs(Math.sin(t * 6)) * .1 }); camTo(w, [0, 7, 19], [0, 7.6, 17], [0, 3.4, -1.5], [0, 3.2, -1.5], t / d); } };
};

F.J = () => {
  const { w, ov } = kitchen(); const m = MS(); place(m, .8, 0, -1.7, w.scene); m.rotation.y = .6; const sm = smoke(w); const brk = label('BROKEN', 3, .9, { bg: null, fg: RED, border: RED, rad: 26 }); brk.rotation.z = .12; place(brk, 2.4, 5.2, -.8, w.scene);
  return { w, update(t, d) {
    const b = d * .3, on = t > b; ov.position.x = 3.9 + (on ? Math.sin(t * 60) * .05 * Math.exp(-(t - b) * 2) : 0); ov.userData.glow.material.emissiveIntensity = on ? .1 : .8;
    for (let i = 0; i < 26; i++) { const q = ((i / 26) + t * .7) % 1; setI(sm, i, 3.9 + Math.sin(i * 1.7) * .6 + q * .8, 2.8 + q * 4.5, -2 + Math.cos(i) * .4, on ? (.3 + q * 1.1) * Math.min(1, (t - b) * 3) : .001); } doneI(sm);
    stampIn(brk, t, b + .1); m.pose({ mood: on ? 'shock' : 'happy', armL: on ? [2.6, .4] : [.3, .2], armR: on ? [2.6, .4] : [.3, .2], head: [.45, -.1, 0], look: [.7, .3], lift: on ? Math.exp(-(t - b) * 6) * .3 : 0 });
    camTo(w, [2, 4.3, 13], [2.2, 4.4, 11.8], [2, 3.2, -2], [2.2, 3.4, -2], t / d, on && t < b + .3 ? .04 : 0, t);
  } };
};

F.J2 = () => {
  const w = street({ signs: SHOP }); lift(w); const m = MS(); place(m, 0, 0, -.6, w.scene);
  const a = label('50 ORDERS', 3.8, .95, { bg: CREAM }), b = label('0 CAKES', 3.4, .95, { bg: RED, fg: '#fff' }); place(a, 0, 6.3, -.6, w.scene); place(b, 0, 5.2, -.6, w.scene);
  return { w, update(t, d) { tickGutter(w, t * .3); popIn(a, t, .05); stampIn(b, t, d * .3); if (t > d * .45) a.visible = b.visible = false; m.pose({ mood: 'shock', armL: [2.6, .3], armR: [2.6, .3], head: [Math.sin(t * 9) * .25, 0, 0], lift: Math.abs(Math.sin(t * 8)) * .08 }); camTo(w, [0, 3.6, 12], [0, 3.6, 11], [0, 3.6, -.6], [0, 3.6, -.6], t / d); } };
};

F.K = () => {
  const w = street({ signs: SHOP, sh: 30, far: 140 }); lift(w); const m = MS(); w.scene.add(m); const cnt = label('DOOR 1', 2.8, .85, { bg: CREAM }); w.scene.add(cnt);
  const ppl = [0, 1, 2, 3, 4, 5, 6].map(i => { const p = townsperson(i + 2); place(p, HX(i) + .9, 0, -3.1, w.scene); p.visible = false; return p; });
  return { w, update(t, d) {
    tickGutter(w, t); const n = 4, per = d / n, k = Math.min(n - 1, Math.floor(t / per)), ph = (t % per) / per, hi = [1, 2, 4, 5][k];
    const x0 = k ? HX([1, 2, 4, 5][k - 1]) - 1.3 : HX(0) - 1.3, x1 = HX(hi) - 1.3, walk = ph < .5; const x = walk ? lerp(x0, x1, eio(ph * 2)) : x1;
    m.position.set(x, 0, -2.2); m.rotation.y = walk ? 1.57 : .2;
    const knock = !walk && ph < .75; m.pose({ walk: walk ? t * 13 : undefined, mood: walk ? 'neutral' : 'happy', armR: knock ? [2.0 + Math.abs(Math.sin(t * 22)) * .3, .2] : [.3, .2], armL: [.2, .1], head: [0, 0, 0] });
    ppl.forEach((p, i) => { p.visible = i === hi && ph > .62; p.rotation.y = -.6; p.pose({ mood: 'happy', armL: [.2, .1], armR: [.2, .1], head: [0, 0, 0] }); });
    cnt.userData.set('DOOR ' + Math.min(50, 1 + Math.floor(t / d * 50))); cnt.position.set(x + .6, 6.4, -1.6);
    camTo(w, [x + .6, 4, 13], [x + .6, 4, 13], [x + .6, 3.4, -2.2], [x + .6, 3.4, -2.2], 0);
  } };
};

F.K2 = () => {
  const w = street({ signs: [] }); const x = HX(1); const p = townsperson(4); place(p, x + .8, 0, -2.6, w.scene); p.rotation.y = -.9; const m = MS(); place(m, x - 1.3, 0, -2.3, w.scene); m.rotation.y = 1;
  return { w, update(t, d) { tickGutter(w, t * .4); p.pose({ mood: 'happy', armL: [1.3, .2], armR: [1.3, .2], head: [0, .1, 0], look: [0, -.4] }); m.pose({ mood: 'smug', armL: [.2, .1], armR: [.2, .1], head: [-.2, 0, 0], blink: blinkAt(t) }); camTo(w, [x - .2, 3.8, 11], [x - .2, 3.8, 10], [x - .2, 3.3, -2.5], [x - .2, 3.3, -2.5], t / d); },
    overlay(g, t, d) { note(g, t, [['SORRY YOUR', 68], ['SORRY IS LATE.', 68, RED], ['- MARLO', 44, '#7b8496']], { at: .12, y: 640, rot: -.05 }); } };
};

F.M = () => {
  const w = street({ signs: [] }); const x = HX(2); const p = townsperson(6); place(p, x + .8, 0, -2.6, w.scene); p.rotation.y = -.9; const m = MS(); place(m, x - 1.3, 0, -2.3, w.scene); m.rotation.y = 1;
  const ck = cake('SORRY', .55, 1); hold(m, ck, 1.35, 1.0); const tg = label('DELIVERED', 3, .8, { bg: GREEN, fg: '#fff' }); place(tg, x + .2, 6.0, -2.4, w.scene);
  return { w, update(t, d) {
    tickGutter(w, t * .4); const rd = t > d * .3, lau = t > d * .6; popIn(tg, t, .1);
    m.pose({ mood: rd ? (Math.sin(t * 14) > 0 ? 'idea' : 'happy') : 'happy', armL: [1.25, .2], armR: rd ? [2.4, .3] : [1.25, .2], head: [-.15, -.1, 0], blink: blinkAt(t) });
    p.pose({ mood: lau ? 'happy' : 'shock', armL: lau ? [2.3, .5] : [.3, .2], armR: lau ? [2.3, .5] : [.3, .2], lift: lau ? Math.abs(Math.sin(t * 10)) * .15 : 0, head: [0, 0, 0] });
    camTo(w, [x - .2, 3.9, 11.5], [x - .2, 3.9, 10.2], [x - .2, 3.3, -2.5], [x - .2, 3.4, -2.5], t / d);
  } };
};

F.M2 = () => {
  const w = street({ signs: SHOP, sh: 26 }); lift(w); const m = MS(); place(m, -1.2, 0, -.8, w.scene);
  const a = label('$10', 2.2, 1.1, { bg: CREAM }), b = label('$30', 2.6, 1.3, { bg: GOLD }), fr = label('EVERY FRIDAY', 3.6, .8, { bg: RED, fg: '#fff' }); place(a, 1.6, 6.2, -.8, w.scene); place(b, 1.6, 6.2, -.7, w.scene); place(fr, 1.6, 5.05, -.7, w.scene);
  const ps = [0, 1, 2, 3, 4].map(i => { const p = townsperson(i + 3); place(p, 3 + i * 1.8, 0, -.4, w.scene); p.rotation.y = -1.57; p.pose({ mood: 'happy', armL: [.2, .1], armR: [.2, .1] }); return p; });
  return { w, update(t, d) { tickGutter(w, t); popIn(a, t, .05); const sw = d * .28; a.visible = t < sw; stampIn(b, t, sw); popIn(fr, t, d * .55); m.pose({ mood: t > d * .5 ? 'smug' : 'happy', armL: [.2, .35], armR: [.2, .35], head: [0, -.08, 0], blink: blinkAt(t) }); camTo(w, [1.6, 4.4, 17], [1.6, 4.4, 15.5], [1.6, 3.8, -1], [1.6, 3.8, -1], t / d); },
    overlay(g, t, d) { stamp2d(g, t, d * .5, 'SOLD OUT', 900); } };
};

F.N = () => {
  const w = street({ signs: ['', '', '', 'SORRY CAKE', '', 'MEGA SORRY APP', ''] }); lift(w); const rb = robot(); place(rb, HX(5), 0, -2, w.scene);
  const m = MS(); place(m, HX(4) - 1.2, 0, -.6, w.scene); m.rotation.y = .9; const pr = label('$0.99 / SORRY', 2.7, .7, { bg: RED, fg: '#fff' }); place(pr, HX(4) + .8, 6.6, -.6, w.scene);
  return { w, update(t, d) { tickGutter(w, t); const q = eo(prog(t, .1, d * .45)); rb.position.z = lerp(-3.5, -.6, q); rb.position.x = lerp(HX(5), HX(4) + 2.6, q); rb.rotation.y = -q * .5; rb.userData.arm.rotation.x = -1 + Math.sin(t * 5) * .3; stampIn(pr, t, d * .6);
    m.pose({ mood: t > d * .45 ? 'shock' : 'neutral', head: [.4, 0, 0], look: [.6, .2], armL: [.2, .2], armR: [.2, .2], blink: blinkAt(t) }); camTo(w, [HX(4) + .7, 4.4, 17], [HX(4) + .7, 4.4, 16], [HX(4) + .7, 3.6, -1], [HX(4) + .7, 3.6, -1], t / d); } };
};

F.N2 = () => {
  const w = world(0x9aa6b8, { floor: 0x7f8aa0, env: .7, sun: 1.9, sh: 14, far: 70 }); place(box(40, 14, .3, 0xb7c0cf, .02), 0, 7, -5, w.scene);
  const rbs = [-3.6, 0, 3.6].map(x => { const r = robot(); place(r, x, 0, -1.6, w.scene); return r; });
  const sent = label('SENT: 0', 4.2, .85, { bg: CREAM }); place(sent, 0, 6.9, -1, w.scene); const fg = label('FORGIVEN: 0', 4.4, .9, { bg: CREAM, fg: RED, border: RED, rad: 26 }); fg.rotation.z = -.05; place(fg, 0, 5.75, -.8, w.scene);
  return { w, update(t, d) { rbs.forEach((r, i) => { r.userData.arm.rotation.x = -1.3 + Math.abs(Math.sin(t * 9 + i)) * .35; }); popIn(sent, t, .05); sent.userData.set('SENT: ' + Math.round(10000 * eo(prog(t, .1, d * .45))).toLocaleString('en-US')); stampIn(fg, t, d * .58); camTo(w, [0, 4.4, 19], [0, 4.4, 18], [0, 4, -2], [0, 4, -2], t / d); } };
};

F.O = () => {
  const w = street({ signs: SHOP }); lift(w); const m = MS(); place(m, -1.2, 0, -2.5, w.scene); m.rotation.y = .6;
  const bs = person(BOSS); place(bs, 3, 0, -1.4, w.scene); const ck = hold(bs, cake('SORRY MOM', .5, 4), 1.35, 1.0); const lb = label('MEGASOCK BOSS', 3.3, .7, { bg: RED, fg: '#fff' }); w.scene.add(lb);
  const dk = sph(.5, M(0x0b1224, .2)); dk.scale.set(.75, .28, .3);
  return { w, update(t, d) { tickGutter(w, t); const q = eio(prog(t, 0, d)); bs.position.x = lerp(.6, 3.4, q); bs.rotation.y = 1.57; bs.pose({ walk: t * 9, mood: 'smug', armL: [1.3, .2], armR: [1.3, .2], head: [-.6, 0, 0], lean: .22 });
    lb.position.set(bs.position.x, 5.9, -1.4); popIn(lb, t, .15); m.pose({ mood: 'smug', armL: [.2, .3], armR: [.2, .3], head: [.4, 0, 0], look: [.6, 0], blink: blinkAt(t) }); const cx = lerp(.6, 2.2, q); camTo(w, [cx, 4.2, 19], [cx, 4.2, 18], [cx, 3.2, -2], [cx, 3.2, -2], t / d); } };
};

F.Q = () => {
  const w = street({ signs: ['ODD PAIRS', 'STANDING ROOM', 'PLANT HOTEL', 'SORRY CAKE', '', 'PLANT HOTEL', 'ODD PAIRS'], bg: 0xbfe6ea, sh: 40, far: 150 }); lift(w);
  const m = MS(); place(m, 0, 0, -2.6, w.scene); const n = 16; for (let i = 0; i < n; i++) { const p = townsperson(i + 2); place(p, 2 + i * 1.55, 0, -.9, w.scene); p.rotation.y = -1.57; p.pose({ mood: 'happy', armL: [.2, .1], armR: [.2, .1], head: [0, 0, 0] }); }
  const wl = label('LINE STARTS HERE', 4.6, .9, { bg: GOLD }); place(wl, 13, 5.6, -.9, w.scene);
  return { w, update(t, d) { tickGutter(w, t * 2); popIn(wl, t, d * .35); m.pose({ mood: 'happy', armL: [2.3, .55], armR: [2.3, .55], head: [0, -.05, 0], lift: Math.abs(Math.sin(t * 5)) * .15 }); camTo(w, [0, 3.6, 13], [6, 10, 38], [0, 3.6, -2], [6, 4.5, -2], eio(t / d)); } };
};

F.R = () => {
  const { w, cal } = room(); const m = MS(); place(m, .5, 0, -1.6, w.scene); m.rotation.y = -.35; const ok = label('REMEMBERED', 3.6, .8, { bg: GREEN, fg: '#fff' }); ok.rotation.z = -.06; place(ok, -.6, 4.05, -3.6, w.scene);
  return { w, update(t, d) { cal.userData.ring.rotation.z = t * .4; stampIn(ok, t, d * .55); m.pose({ mood: 'smug', head: [-.35, -.15, 0], look: [-.6, .6], armR: [2.1, .35], armL: [.2, .1], blink: blinkAt(t) }); camTo(w, [-.2, 5.2, 9], [.3, 4.4, 12], [-.4, 5, -3.6], [.2, 3.9, -2], eio(t / d)); } };
};

F.S = () => {
  const w = street({ signs: [] }); const x = HX(5); const T = theo(); place(T, x + .8, 0, -2.6, w.scene); T.rotation.y = -.9;
  const m = MS(); place(m, x - 1.3, 0, -2.3, w.scene); m.rotation.y = 1; const ck = hold(m, cake('', .6, 3), 1.4, 1.05); const tp = label('SORRY', 1.6, .62, { bg: CREAM, fg: RED, border: RED, rad: 20 }); w.scene.add(tp);
  return { w, update(t, d, P) {
    tickGutter(w, t * .4); const sw = P ? P('S2', 0) : d * .4, lau = t > sw + .5, k = lau ? Math.abs(Math.sin(t * 10)) : 0;
    T.pose({ mood: t > sw ? 'happy' : 'shock', armR: t > sw && t < sw + .5 ? [2.0, .2] : (lau ? [2.5, .5] : [.3, .2]), armL: lau ? [2.5, .5] : [.3, .2], lift: k * .16, head: [0, 0, 0] });
    m.pose({ mood: t > sw ? 'happy' : 'smug', armL: [1.25, .2], armR: [1.25, .2], head: [-.15, 0, 0], lift: k * .1, blink: blinkAt(t) });
    tp.position.set(x - .25, 4.1, -.6); stampIn(tp, t, sw + .15, 1);
    const z = prog(t, sw, d); camTo(w, [x - .2, 3.8, 11], [x - .3, 3.7, 7.4], [x - .2, 3.3, -2.5], [x - .3, 3.4, -1.5], eio(z * .9 + (t / d) * .1));
  } };
};

F.Z = recap(['SORRY IS HARD TO SAY', 'SAY IT WITH CAKE', '$1,000,000'], ['ODD PAIRS', 'STANDING ROOM', 'PLANT HOTEL', 'SORRY CAKE', '', 'PLANT HOTEL', 'ODD PAIRS']);
