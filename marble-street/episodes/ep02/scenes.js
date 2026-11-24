import * as THREE from 'three';
import { recap } from './recap.js';
import { C, M, world, box, cyl, sph, mesh, place, prog, eio, eo, back, lerp, clamp, camTo, label, setI, doneI, rand } from './world.js';
import { marlo, person } from './marlo.js';
import { marble, jar, street, tickGutter, townsperson, PAT } from './sets.js';

const popIn = (o, t, a, s = 1, dur = .35) => { const p = prog(t, a, a + dur); o.visible = p > 0; o.scale.setScalar(Math.max(.0001, back(p) * s)); };
const stampIn = (o, t, a, s = 1) => { const p = prog(t, a, a + .24); o.visible = p > 0; o.scale.setScalar(p <= 0 ? .0001 : lerp(2.3, 1, eo(p)) * s); };
const blinkAt = t => (Math.sin(t * 3.1) > .985 ? .1 : 1);
const MS = () => marlo({ sockL: PAT.stripe(), sockR: PAT.dots() });
const GOLD = '#f5b700', RED = '#e4572e', CREAM = '#fbf7ee', GREEN = '#8fdcae';
export const F = {};

// ---- props
const vG = new THREE.CapsuleGeometry(.56, .34, 6, 18), vS = new THREE.CylinderGeometry(.585, .585, .11, 22);
function vest(p, on = true) { const b = p.children[0]; const v = new THREE.Mesh(vG, M(C.gold, .5)); v.castShadow = true; place(v, 0, 1.62, 0, b); const s = new THREE.Mesh(vS, M(C.cream, .4)); place(s, 0, 1.52, 0, b); p.userData.v = [v, s]; vestOn(p, on); return p; }
const vestOn = (p, on) => p.userData.v.forEach(x => { x.visible = on; });
const money = (txt = '$20', w = 1.5) => label(txt, w, w / 2, { bg: GREEN, fg: '#14513a', rad: 18, border: '#3f9a6c' });
function clockP(r = 1) {
  const g = new THREE.Group(); const f = cyl(r, r, .16, C.white, 40); f.rotation.x = Math.PI / 2; g.add(f);
  const rim = mesh(new THREE.TorusGeometry(r, r * .09, 10, 44), M(C.ink, .4)); g.add(rim);
  const mk = (l, wd) => { const H = new THREE.Group(); place(box(wd, l, .06, C.ink, .015), 0, l / 2, .12, H); g.add(H); return H; };
  const a = mk(r * .8, r * .09), b = mk(r * .52, r * .13); g.userData.set = x => { a.rotation.z = -x; b.rotation.z = -x / 12; }; return g;
}
function kid() { return person({ top: 0x7fd6b5, pant: 0xf4c7a1, skin: 0xd8a077, hair: 0x2b2b3a, style: 'cap', sockL: PAT.stripe(), sockR: PAT.dots(), shoe: 0x14213d }); }
function phone() { const g = new THREE.Group(); place(box(3.2, 6, .4, C.ink, .3, .3), 0, 3, 0, g); const s = label('MEGASKIP\nSKIP LINE\n$1', 2.8, 5.3, { bg: '#2e86ff', fg: '#fff', rad: 30 }); place(s, 0, 3, .22, g); g.userData.s = s; return g; }

// ---- the office: same room opens and closes the episode
const spot = i => { const r = Math.floor(i / 6), c = i % 6; return { x: r % 2 ? 3.75 - c * 1.5 : -3.75 + c * 1.5, z: 1 + r * 2.1, fy: r % 2 ? 1.57 : -1.57 }; };
function hall(o = {}) {
  const w = world(0xcfe0d0, { floor: 0xe9e2cf, env: .85, sun: 2.3, sh: 26, far: 120 }); const sc = w.scene;
  place(box(40, 22, .4, 0xcfe0d0, .02, .9), 0, 11, -3.4, sc);
  const hd = label('PERMIT OFFICE', 8.4, 1.3, { bg: '#1f6f78', fg: '#fff' }); place(hd, 0, 8.3, -3.15, sc);
  place(box(11, 2.1, 1, 0xb79a55, .06, .6), 0, 1.05, -2.5, sc);
  const clerk = townsperson(4); place(clerk, -3.75, 0, -3, sc); clerk.pose({ mood: 'stare', head: [0, 0, 0] });
  const shut = [];
  [-3.75, -1.25, 1.25, 3.75].forEach((x, i) => {
    place(box(2.2, 3.1, .12, C.cream, .05, .7), x, 3.85, -3.14, sc);
    if (i === 0) { const l = label('OPEN', 1.5, .5, { bg: '#2fa36b', fg: '#fff', rad: 14 }); place(l, x, 5.85, -3.1, sc); return; }
    const g = new THREE.Group(); place(g, x, 3.85, -2.98, sc); place(box(2.2, 3.1, .1, 0x8d99ae, .05, .6), 0, 0, 0, g); const l = label('CLOSED', 1.8, .6, { bg: RED, fg: '#fff', rad: 14 }); place(l, 0, 0, .08, g); shut.push(g);
  });
  const ck = clockP(1); place(ck, 6, 7.7, -3.1, sc);
  for (let r = 0; r < 6; r++) { const z = 2.05 + r * 2.1; const rp = cyl(.05, .05, 8.2, C.gold, 8, .3); rp.rotation.z = Math.PI / 2; const gap = r % 2 ? -1 : 1; place(rp, gap * -.6, 1.75, z, sc); [gap * -4.7, gap * 3.5].forEach(x => { place(cyl(.08, .08, 1.75, C.ink, 10), x, .88, z, sc); place(sph(.13, C.gold, .25), x, 1.8, z, sc); }); }
  const n = o.n ?? 40, ps = [];
  for (let i = 0; i < n; i++) { if (o.marlo !== false && i === 39) continue; const s = spot(i); const p = townsperson(i); place(p, s.x, 0, s.z, sc); p.rotation.y = s.fy + (i % 3 - 1) * .18; p.pose({ mood: i % 4 === 0 ? 'sad' : 'stare', head: [(i % 3 - 1) * .4, i % 5 === 0 ? .25 : 0, 0], armL: [0, .1], armR: [0, .1] }); ps.push(p); }
  let m = null; if (o.marlo !== false) { const s = spot(39); m = MS(); place(m, s.x, 0, s.z, sc); m.rotation.y = -.7; }
  return { w, ps, m, ck, shut, tick(t) { ck.userData.set(t * .12); ps.forEach((p, i) => { p.scale.y = 1 + Math.sin(t * 1.7 + i) * .012; }); } };
}
const faceCam = (o, w) => o.lookAt(w.cam.position);
const WIDE = [[0, 21, 37], [0, 1, 4.5]];

F.A = () => {
  const h = hall(), { w, m } = h; const s = spot(39);
  const lb = label('3 HOURS', 3.2, 1, { bg: CREAM }); place(lb, 0, 12, 9, w.scene);
  return { w, update(t, d) {
    h.tick(t); const p = eio(prog(t, .45, d));
    m.pose({ mood: 'stare', head: [.2, .02, 0], armL: [0, .1], armR: [0, .1], blink: blinkAt(t + 2) });
    camTo(w, [s.x + .4, 3.6, s.z + 10.5], WIDE[0], [s.x, 3.3, s.z], WIDE[1], p);
    popIn(lb, t, d * .62, 1.7); faceCam(lb, w);
  } };
};

F.A2 = () => {
  const w = world(0x1f6f78, { floor: 0x2b858f, env: .7, sun: 2.5, sh: 16 });
  const n = 420, g = new THREE.BoxGeometry(1.5, .08, .8), tk = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ roughness: .7 }), n); tk.castShadow = true; tk.frustumCulled = false; w.scene.add(tk);
  const cs = [C.cream, C.gold, 0xf2a9a0, 0x7fd6b5, 0xb6d9ef], col = new THREE.Color(), r = rand(5), D0 = new THREE.Object3D();
  for (let i = 0; i < n; i++) { const a = r() * 6.28, q = Math.sqrt(r()), ra = q * 8; D0.position.set(Math.cos(a) * ra, (1 - q) * 5 + r() * .3, Math.sin(a) * ra); D0.rotation.set((r() - .5) * .9, r() * 6, (r() - .5) * .9); D0.updateMatrix(); tk.setMatrixAt(i, D0.matrix); tk.setColorAt(i, col.set(cs[i % 5])); } tk.instanceColor.needsUpdate = true;
  const m = MS(); place(m, 0, 5, 0, w.scene);
  const N = 46, ms = new THREE.InstancedMesh(new THREE.SphereGeometry(.28, 18, 12), M(C.gold, .14, .55), N); ms.castShadow = true; ms.frustumCulled = false; w.scene.add(ms);
  const Dd = []; for (let i = 0; i < N; i++) Dd.push({ x: (r() - .5) * 7, z: (r() - .5) * 3 - 1.5, o: r() * 1.5, sp: 6 + r() * 4 });
  const sign = label('$1,000,000', 4.6, 1.15, { bg: GOLD }); place(sign, 0, 10.9, 1.5, w.scene);
  return { w, update(t, d) {
    Dd.forEach((p, i) => { const y = 16 - ((t + p.o) % 2.2) * p.sp; setI(ms, i, p.x, y < .3 ? -9 : y, p.z); }); doneI(ms); popIn(sign, t, .08);
    m.pose({ mood: 'happy', armL: [2.4, .55 + Math.sin(t * 9) * .12], armR: [2.4, .55 - Math.sin(t * 9) * .12], lift: Math.abs(Math.sin(t * 7)) * .22, head: [0, -.08, 0] });
    camTo(w, [0, 6.4, 21], [0, 7.2, 16.5], [0, 7, 0], [0, 7.9, 0], eo(t / d));
  } };
};

function wideOffice(backView) {
  return () => {
    const h = hall(backView ? { marlo: false } : {}), { w, m, shut } = h;
    const a = label('40 PEOPLE', 4.4, 1.2, { bg: CREAM }), b = label('1 WINDOW', 4.2, 1.2, { bg: RED, fg: '#fff' }); place(a, 0, 14.5, 7, w.scene); place(b, 0, 12.6, 7, w.scene);
    let me = null; if (backView) { me = MS(); place(me, .9, 0, 16.2, w.scene); me.rotation.y = Math.PI; }
    return { w, update(t, d) {
      h.tick(t);
      if (m) m.pose({ mood: 'stare', head: [.2, 0, 0], armL: [0, .1], armR: [0, .1] });
      if (me) me.pose({ head: [0, -.05, 0], armL: [0, .1], armR: [0, .1] });
      const sl = eio(prog(t, .1, .35)); if (!backView) shut[0].position.y = lerp(9.5, 3.85, sl * sl);
      if (backView) camTo(w, [.9, 4.4, 26], [.4, 15, 38], [.9, 3.4, 12], [.2, 1.4, 6], eio(t / d)); else camTo(w, WIDE[0], [-.4, 18, 33], WIDE[1], [-.6, 1.6, 3.5], t / d);
      popIn(a, t, .08, 1.15); popIn(b, t, d * .45, 1.15); faceCam(a, w); faceCam(b, w);
    } };
  };
}
F.B = wideOffice(false); F.R2 = wideOffice(true);

F.C = () => {
  const h = hall(), { w, m } = h; const s = spot(39);
  const ck = clockP(.62); place(ck, s.x + 1.65, 5.6, s.z - .3, w.scene);
  const a = label('2 HOURS', 2.1, .68, { bg: CREAM }), b = label('4 FEET', 2.1, .68, { bg: GOLD }); place(a, s.x - 1.15, 7.05, s.z, w.scene); place(b, s.x + 1.15, 7.05, s.z, w.scene);
  return { w, update(t, d) {
    h.tick(t); ck.userData.set(t * 9);
    const q = eio(prog(t, d * .58, d * .85)); m.position.x = s.x - q * .32;
    m.pose({ walk: (q > .02 && q < .98) ? t * 14 : undefined, mood: 'sad', head: [.25, 0, 0], look: [.3, -.2], blink: blinkAt(t) });
    popIn(a, t, .1); popIn(b, t, d * .55);
    camTo(w, [s.x, 4, s.z + 13], [s.x, 4.1, s.z + 12.2], [s.x, 4, s.z], [s.x, 4.1, s.z], t / d);
    a.lookAt(w.cam.position); b.lookAt(w.cam.position); ck.lookAt(w.cam.position);
  } };
};

F.D = () => {
  const h = hall(), { w, m } = h; const s = spot(39);
  const wm = person({ top: 0x7b5fc7, pant: 0x3c4560, skin: 0xd8a077, hair: 0x4a3322, style: 'bun', sockL: 0xfbf7ee, sockR: 0xfbf7ee }); place(wm, 9, 0, s.z, w.scene); wm.rotation.y = -1.3;
  const bl = money(); w.scene.add(bl);
  return { w, update(t, d) {
    h.tick(t); const q = eo(prog(t, .1, d * .42)); wm.position.x = lerp(9, s.x + 2.25, q); const stop = q > .96;
    wm.pose({ walk: stop ? undefined : t * 15, mood: 'happy', armR: stop ? [1.45, .05] : undefined, head: [-.2, 0, 0], lean: stop ? 0 : .22 });
    const bq = prog(t, d * .44, d * .55); bl.visible = bq > 0; bl.scale.setScalar(Math.max(.001, back(bq))); bl.position.set(s.x + 1.35, 3.0 + Math.sin(t * 6) * .05, s.z + .85);
    const look = t > d * .3; m.pose({ mood: bq >= 1 ? 'shock' : 'stare', head: look ? [1.25, 0, 0] : [.2, 0, 0], look: look ? [.8, -.2] : [0, 0], armL: [0, .1], armR: [0, .1] }); if (look) m.rotation.y = lerp(-.7, -.25, eio(prog(t, d * .3, d * .5)));
    camTo(w, [s.x + 1, 4, s.z + 13.5], [s.x + 1, 3.9, s.z + 12], [s.x + 1, 3.6, s.z], [s.x + 1, 3.5, s.z], t / d);
  } };
};

F.D2 = () => {
  const w = world(0xf7e2a0, { floor: 0xf2d98c, env: .85, sun: 2.3 }); const m = MS(); w.scene.add(m);
  const bl = money('$20', 3.4); place(bl, 0, 7, 0, w.scene); const la = label('FOR STANDING', 4.4, .95, { bg: RED, fg: '#fff' }); place(la, 0, 5.15, .4, w.scene);
  return { w, update(t, d) {
    popIn(bl, t, .05); bl.rotation.z = Math.sin(t * 7) * .05; stampIn(la, t, d * .42);
    m.pose({ mood: t > d * .42 ? 'idea' : 'shock', head: [0, -.34, 0], look: [0, .9], armL: [.9, .55], armR: [.9, .55], blink: 1 });
    camTo(w, [0, 4.4, 14.5], [0, 4.5, 13.6], [0, 4.4, 0], [0, 4.5, 0], t / d);
  } };
};

F.D3 = () => {
  const w = street({ sh: 34, signs: ['', 'BAKERY', 'BANK', '', 'PHONES', 'TICKETS', ''], far: 140 }); const m = MS(); place(m, 0, 0, 1.6, w.scene); const ps = [];
  [[-6.55, 9], [6.55, 9], [-13.1, 6], [13.1, 6]].forEach(([x, n], k) => { for (let i = 0; i < n; i++) { const p = townsperson(i * 3 + k); place(p, x + (i % 2 ? .25 : -.25), 0, -1.6 + i * 1.75, w.scene); p.rotation.y = 3.14; p.pose({ mood: 'stare', armL: [0, .1], armR: [0, .1] }); ps.push(p); } });
  return { w, update(t, d) {
    tickGutter(w, t); const ry = eio(prog(t, 0, .7)); m.rotation.y = lerp(0, 3.14, ry);
    m.pose({ mood: 'shock', head: [0, -.1, 0], armL: [.2, .25], armR: [.2, .25] });
    camTo(w, [0, 3.2, 12.5], [0, 15, 46], [0, 3.2, 1], [0, 3.8, 1], eio(t / d));
  } };
};

function marbleScene(second) {
  return () => {
    const w = street({ bg: second ? 0xf9d7a0 : 0xbfe6ea }); const m = MS(); place(m, 0, 0, -1, w.scene);
    const mb = marble(.4); w.scene.add(mb);
    const j = jar(40); place(j, 2.3, 0, -.6, w.scene); j.scale.setScalar(.95); const glow = new THREE.PointLight(C.gold, 0, 16); place(glow, 0, 5, 1, w.scene);
    return { w, update(t, d) {
      tickGutter(w, t);
      const hit = Math.min(.9, d * .44), jarT = hit + .6;
      let x = 0, y, z = -.8; if (t < hit) { y = lerp(15, 4.2, (t / hit) ** 2); } else { const T = t - hit, f = clamp(T / .6); x = lerp(0, 2.3, f); y = lerp(4.2, 1.8, f * f) + Math.sin(f * Math.PI) * 2.1; z = lerp(-.8, -.6, f); }
      mb.visible = t < jarT + .02; mb.position.set(x, y, z);
      j.userData.setN((second ? 30 : 16) + (t > jarT ? 1 : 0));
      const after = t > hit; glow.intensity = after ? 120 * Math.exp(-(t - hit) * 2.2) : 0;
      const squash = after ? 1 + Math.sin(clamp((t - hit) / .22) * Math.PI) * -.09 : 1; m.children[0].scale.set(1 / squash, squash, 1 / squash);
      m.pose({ mood: after ? (second ? 'happy' : 'idea') : (second ? 'smug' : 'stare'), head: after ? [0, -.1, 0] : [0, .02, 0], armL: after ? [2.2, .35] : [0, .12], armR: after ? [.5, .9] : [0, .12], lift: after ? Math.exp(-(t - hit) * 3.5) * .3 : 0, look: after ? [0, 0] : [0, 1] });
      camTo(w, [1, 3.4, 14.2], [1, 3.6, 12.6], [1, 3.2, -1], [1, 3.3, -1], eio(t / d), (after && t < hit + .24) ? .035 : 0, t);
    } };
  };
}
F.E = marbleScene(false); F.K = marbleScene(true);

F.F = () => {
  const w = world(0xf7e2a0, { floor: 0xf2d98c, env: .85, sun: 2.3 }); const m = MS(); w.scene.add(m);
  const ck = clockP(.95); place(ck, -1.8, 5.9, .6, w.scene); const bl = money('$', 1.9); place(bl, 1.8, 5.9, .6, w.scene);
  const la = label('WAITING', 2.4, .62, { bg: '#2e86ff', fg: '#fff' }), lb = label('GET PAID', 2.4, .62, { bg: RED, fg: '#fff' }); place(la, -1.8, 7.5, .6, w.scene); place(lb, 1.8, 7.5, .6, w.scene);
  return { w, update(t, d) {
    ck.userData.set(t * 3); popIn(la, t, .15); popIn(ck, t, .1); popIn(lb, t, d * .5); popIn(bl, t, d * .46); bl.rotation.z = Math.sin(t * 5) * .08;
    const lk = t > d * .5 ? 1 : -1; m.pose({ mood: t > d * .5 ? 'idea' : 'sad', armL: [1.3, .7], armR: [1.3, .7], head: [lk * .3, -.05, 0], look: [lk * .8, .5] });
    camTo(w, [0, 3.6, 18.5], [0, 3.6, 18], [0, 3.3, 0], [0, 3.3, 0], t / d);
  } };
};

const SIGN3 = ['', '', '', 'STANDING ROOM', '', '', ''];
function lift(w, y = 4.8) { w.houses.forEach(h => { if (h.userData.sign) h.userData.sign.position.y = y; }); }

F.G = () => {
  const w = street({ signs: SIGN3 }); lift(w); const sg = w.houses[3].userData.sign;
  const m = MS(); place(m, -1, 0, -1, w.scene); m.rotation.y = .45; const j = jar(40); place(j, -2.5, 0, -.8, w.scene); j.scale.setScalar(.95);
  const tag = label("WE WAIT,\nYOU DON'T", 4, 1.8, { bg: CREAM }); place(tag, .4, 8.6, -1.6, w.scene); const pr = label('$20 / HOUR', 3, .72, { bg: GOLD }); place(pr, 2.5, 2.9, -.6, w.scene); pr.rotation.z = -.08;
  const ps = [0, 1, 2].map(i => { const p = townsperson(i + 1); place(p, 5 + i * 1.9, 0, -.5, w.scene); p.rotation.y = -1.57; return p; });
  const c = marble(.22); w.scene.add(c);
  return { w, update(t, d) {
    tickGutter(w, t); stampIn(sg, t, d * .28); popIn(tag, t, d * .55, 1); popIn(pr, t, d * .72);
    ps.forEach((p, i) => { p.position.x = lerp(5.4 + i * 1.9, 3.2 + i * 1.9, eio(prog(t, d * .45, d * .9))); p.pose({ walk: t * 8, mood: 'happy', armR: i === 0 ? [1.2, .1] : undefined, head: [0, 0, 0] }); });
    const cq = eo(prog(t % (d / 2.4), .3, .85)); c.position.set(lerp(1.6, -2.5, cq), 2.1 + Math.sin(cq * Math.PI) * 1.2, -.8); c.visible = cq > 0 && cq < 1 && t > d * .4;
    j.userData.setN(Math.floor(t / (d / 2.4)) + 2);
    m.pose({ mood: 'happy', armR: t < d * .28 ? [2.2, .2] : [1.1, .5], armL: [.4, .35], head: t < d * .28 ? [0, -.28, 0] : [.25, 0, 0], look: t < d * .28 ? [0, 1] : [.5, 0], blink: blinkAt(t) });
    camTo(w, [.1, 4.1, 16.5], [.1, 4.6, 19], [.1, 4.3, -1], [.1, 4.6, -1], eio(t / d));
  } };
};

F.H = () => {
  const w = street({ signs: SIGN3, sh: 30 }); lift(w); const cnt = label('0 STANDERS', 5.4, 1.2, { bg: CREAM }); place(cnt, 0, 12.2, 0, w.scene);
  const ps = Array.from({ length: 10 }, (_, i) => { const p = vest(townsperson(i)); place(p, -9 + i * 2, 0, .4 + (i % 2) * 1.4, w.scene); p.pose({ mood: 'happy', armL: [0, .1], armR: [0, .1], head: [0, 0, 0] }); return p; });
  return { w, update(t, d) {
    tickGutter(w, t); popIn(cnt, t, .03); let k = 0; ps.forEach((p, i) => { const a = .12 + i * (d * .07); popIn(p, t, a, 1, .22); if (t > a) k++; }); cnt.userData.set(k + ' STANDERS');
    camTo(w, [0, 8, 30], [0, 8, 28], [0, 7, 0], [0, 7, 0], t / d);
  } };
};

function pushers(w) {
  const xm = label('X', 1.3, 1.3, { bg: null, fg: RED }); xm.rotation.x = -Math.PI / 2; place(xm, -8.7, .14, -.6, w.scene);
  const a = vest(townsperson(0)), b = vest(townsperson(3)); place(a, -8, 0, -.6, w.scene); place(b, -13, 0, -.6, w.scene); a.rotation.y = -1.57; b.rotation.y = 1.57; return { a, b, xm };
}
const sidewalkLine = (w, n, from, ex = 2.2) => Array.from({ length: n }, (_, i) => { const hd = new THREE.Group(); place(hd, from + i * ex, 0, -.6, w.scene); const p = townsperson(i + 1); hd.add(p); p.rotation.y = -1.57; p.pose({ mood: 'stare', armL: [0, .1], armR: [0, .1], head: [0, 0, 0] }); return hd; });

F.H2 = () => {
  const w = street({ sh: 22 }); const { a, b } = pushers(w); sidewalkLine(w, 5, -5.6); const sm = label('SAME SPOT', 4, 1, { bg: RED, fg: '#fff' }); place(sm, -9, 7.2, -.6, w.scene);
  return { w, update(t, d) {
    tickGutter(w, t * .4); const q = eo(prog(t, 0, d * .45)); b.position.x = lerp(-14, -10, q); const sh = q > .98 ? Math.abs(Math.sin(t * 9)) : 0;
    b.pose({ walk: q < .98 ? t * 12 : undefined, mood: 'stare', armL: sh ? [1.4, 0] : undefined, armR: sh ? [1.4, 0] : undefined, lean: sh * .12 }); a.rotation.y = lerp(-1.57, -1.57, 0); a.pose({ mood: q > .6 ? 'stare' : 'neutral', armL: q > .98 ? [1.4, 0] : [0, .1], armR: q > .98 ? [1.4, 0] : [0, .1], lean: -sh * .08, head: [0, 0, 0] });
    popIn(sm, t, d * .5); camTo(w, [-9, 3.7, 14], [-9, 3.7, 13], [-9, 3.9, -.6], [-9, 3.9, -.6], t / d);
  } };
};

F.I = () => {
  const w = street({ sh: 26, far: 90 }); const { a, b } = pushers(w); b.position.x = -10; a.position.x = -8;
  const H = new THREE.Group(); place(H, -8, 0, -.6, w.scene); w.scene.remove(a); a.position.set(0, 0, 0); H.add(a);
  const L = sidewalkLine(w, 11, -5.6, 2.3), all = [H, ...L];
  return { w, update(t, d) {
    tickGutter(w, t * .4); const hit = .28; const q = eo(prog(t, 0, hit));
    b.pose({ mood: t > hit ? 'shock' : 'stare', armL: [1.5, 0], armR: [1.5, 0], lean: q * .28 }); b.position.x = lerp(-10.2, -9.4, q); a.pose({ mood: 'shock', armL: [1.4, .2], armR: [1.4, .2] });
    all.forEach((h, i) => { const s = hit + i * ((d - .75) / 12); const f = prog(t, s, s + .3); h.rotation.z = -f * f * 1.42; const bo = f >= 1 ? Math.exp(-(t - s - .3) * 9) * Math.sin((t - s - .3) * 26) * .05 : 0; h.rotation.z += bo; });
    const f = eio(prog(t, hit * .8, d - .3)); const cx = lerp(-8.4, 18, f);
    camTo(w, [cx, 3.2, 15], [cx, 3.2, 15], [cx, 2.8, -.6], [cx, 2.8, -.6], 0);
  } };
};

const sit = (m, o = {}) => m.pose({ legL: -1.22, legR: -1.22, lift: -.92, armL: o.armL || [.25, .1], armR: o.armR || [.25, .1], mood: o.mood || 'sad', head: o.head || [0, .2, 0], look: o.look, blink: o.blink });
function step(o = {}) { const w = street({ signs: SIGN3, ...o }); lift(w); const m = MS(); place(m, 0, .3, -3, w.scene); m.rotation.y = .5; const cl = label('CLOSED', 2.1, .75, { bg: CREAM, fg: RED, border: RED }); place(cl, 1.95, 2.35, -3.9, w.scene); return { w, m, cl }; }

F.I3 = () => {
  const { w, m, cl } = step({ bg: 0x8f9ab3, sun: 1.2, env: .55 });
  return { w, update(t, d) { tickGutter(w, t * .25); stampIn(cl, t, .25); const down = eio(prog(t, d * .45, d * .75)); m.position.y = .3; const lf = lerp(0, -1, down); m.pose({ legL: lerp(0, -1.22, down), legR: lerp(0, -1.22, down), lift: lf * .92, armL: [.25, .1], armR: [.25, .1], mood: 'sad', head: [0, .2, 0] }); camTo(w, [0, 3.2, 11.5], [0, 3, 10], [0, 3, -3], [0, 2.7, -3], eio(t / d)); } };
};

const linePos = (i) => 1.7 + i * 1.65;
function lineup(w, n) { return Array.from({ length: n }, (_, i) => { const p = vest(townsperson(i), false); place(p, 40, 0, -.6, w.scene); p.rotation.y = -1.57; return p; }); }

F.J = () => {
  const { w, m, cl } = step({ bg: 0xb3c3cf, sun: 1.8, env: .68 }); cl.scale.setScalar(1); const ps = lineup(w, 9);
  return { w, update(t, d) { tickGutter(w, t * .4); ps.forEach((p, i) => { const q = eo(prog(t, .05 + i * .08, .95 + i * .08)); p.position.x = lerp(linePos(i) + 18, linePos(i), q); p.pose({ walk: q < .98 ? t * 10 : undefined, mood: 'neutral', head: [0, 0, 0], armL: q < .98 ? undefined : [0, .1], armR: q < .98 ? undefined : [0, .1] }); }); const u = t > d * .3; sit(m, { mood: u ? 'shock' : 'sad', head: u ? [.55, -.1, 0] : [0, .2, 0], look: u ? [.8, .1] : [0, -.4] }); camTo(w, [1.4, 3.2, 10.5], [2.2, 3.4, 14.5], [1.2, 2.8, -2.5], [2.2, 3, -2], eio(t / d)); } };
};
F.J2 = () => {
  const { w, m } = step({ bg: 0xbfe6ea, sh: 60, far: 160 }); const ps = lineup(w, 20); ps.forEach((p, i) => { p.position.x = linePos(i); p.pose({ mood: 'happy', head: [0, 0, 0], armL: [0, .1], armR: [0, .1] }); });
  return { w, update(t, d) { tickGutter(w, t); sit(m, { mood: 'shock', head: [.55, -.1, 0], look: [.8, .1] }); camTo(w, [3, 4, 18], [11, 12, 62], [3, 3, -2], [11, 6.5, -2], eio(t / d)); } };
};

F.L = () => {
  const w = street({ signs: SIGN3, sh: 24 }); lift(w); const ps = lineup(w, 12); ps.forEach((p, i) => { p.position.x = linePos(i); p.rotation.y = -.75; p.pose({ mood: 'shock', head: [0, 0, 0], armL: [0, .1], armR: [0, .1] }); }); const m = MS(); place(m, 0, 0, 1.6, w.scene); m.rotation.y = 1.15; const ev = ps.map(() => -1);
  return { w, update(t, d) { tickGutter(w, t); const q = prog(t, .12, d - .1), x = lerp(-.8, linePos(11) + .6, q); m.position.x = x; m.pose({ walk: t * 12, mood: 'happy', armL: [.5, .25], head: [-.4, 0, 0], look: [-.4, 0] }); ps.forEach((p, i) => { const on = x > linePos(i) - .25; vestOn(p, on); if (on && ev[i] < 0) ev[i] = t; if (t < (ev[i] < 0 ? 1e9 : ev[i])) ev[i] = -1; p.pose({ mood: on ? 'happy' : 'shock', head: [0, 0, 0], armL: on ? [2.3, .35] : [0, .1], armR: on ? [2.3, .35] : [0, .1], lift: on && ev[i] >= 0 ? Math.max(0, Math.sin(clamp((t - ev[i]) / .35) * Math.PI)) * .5 : 0 }); }); camTo(w, [x + 1.2, 4, 15.5], [x + 1.2, 4, 15.5], [x + 1.2, 3.5, -.6], [x + 1.2, 3.5, -.6], 0); } };
};

F.M = () => {
  const w = street({ signs: SIGN3 , sh: 24 }); lift(w); const ps = Array.from({ length: 10 }, (_, i) => { const row = i < 5 ? 0 : 1, c = i % 5; const p = vest(townsperson(i)); place(p, -4.4 + c * 2.2 + row * 1.1, 0, -.8 + row * 2.2 - 1.2, w.scene); p.pose({ mood: 'happy', head: [0, 0, 0], armL: [0, .1], armR: [0, .1] }); return p; });
  const m = MS(); place(m, 0, 0, 2.7, w.scene); const a = label('$20', 2.6, 1.3, { bg: CREAM }), b = label('$40', 3.2, 1.6, { bg: GOLD }); place(a, 0, 8, 2, w.scene); place(b, 0, 8, 2.1, w.scene);
  return { w, update(t, d) { tickGutter(w, t); popIn(a, t, .1); const sw = d * .6; if (t > sw) a.visible = false; stampIn(b, t, sw); m.pose({ mood: t > sw ? 'smug' : 'happy', armL: [0, .35], armR: [0, .35], head: [0, -.08, 0], look: [0, .1], blink: blinkAt(t) }); camTo(w, [0, 4.8, 22], [0, 4.8, 20], [0, 4.4, 0], [0, 4.5, 0], t / d); } };
};

F.N = () => {
  const w = street({ signs: SIGN3, sh: 24 }); lift(w); const ph = phone(); place(ph, 1.8, 0, .3, w.scene); ph.scale.setScalar(1.15); const m = MS(); place(m, -1.8, 0, .6, w.scene); m.rotation.y = .55;
  const ps = [0, 1, 2, 3, 4, 5].map(i => { const p = townsperson(i + 2); place(p, -7 - i * 1.7, 0, -1.2, w.scene); p.rotation.y = 1.57; return p; }); const bn = label('MEGASOCK IS BACK', 5.2, .95, { bg: RED, fg: '#fff' }); place(bn, 0, 10.5, 0, w.scene);
  return { w, update(t, d) { tickGutter(w, t); const q = eo(prog(t, .15, d * .4)); ph.position.y = lerp(-8, 1.6, q) + Math.sin(t * 2.4) * .08; popIn(bn, t, .2, 1); ps.forEach((p, i) => { p.position.x = -7 - i * 1.7 + prog(t, d * .45, d) * 18; p.pose({ walk: t * 9, mood: 'happy', head: [.5, 0, 0], armR: [1.2, .2] }); }); m.pose({ mood: t > d * .5 ? 'sad' : 'shock', head: [.5, -.1, 0], look: [.7, .3], armL: [.2, .2], armR: [.2, .2], blink: blinkAt(t) }); camTo(w, [.1, 5.2, 21], [.1, 5.4, 20], [.1, 5.2, 0], [.1, 5.3, 0], t / d); } };
};

F.O = () => {
  const w = street({ signs: SIGN3, bg: 0xbfe6ea }); lift(w, 3.6); const m = MS(); place(m, 0, .3, -3, w.scene); m.rotation.y = .5;
  return { w, update(t, d) { tickGutter(w, t * .4); sit(m, { mood: 'stare', head: [-.45, .02, 0], armL: [.45, .1], armR: [.45, .1], look: [0, 0] }); camTo(w, [0, 3.2, 11], [0, 3.1, 9], [0, 2.7, -3], [0, 2.7, -3], t / d); } };
};
F.O2 = () => {
  const w = street({ signs: SIGN3, bg: 0xbfe6ea }); lift(w, 3.6); const m = MS(); place(m, 0, .3, -3, w.scene); m.rotation.y = .5;
  return { w, update(t, d) { sit(m, { mood: 'stare', head: [-.45, .02, 0], armL: [.45, .1], armR: [.45, .1], look: [0, 0], blink: (t > d * .56 && t < d * .63) ? .1 : 1 }); camTo(w, [0, 3.1, 7.2], [0, 3.1, 7.2], [0, 2.7, -3], [0, 2.7, -3], 0); } };
};

F.O3 = () => {
  const w = world(0x202a4a, { floor: 0x2a3560, env: .5, sun: 1.6 }); const ph = phone(); place(ph, 0, 1.2, 0, w.scene); ph.scale.setScalar(1.4); const s = ph.userData.s; const r = rand(4);
  const n = 40, px = new THREE.InstancedMesh(new THREE.BoxGeometry(.3, .3, .3), new THREE.MeshStandardMaterial({ color: 0xe4572e, roughness: .4 }), n); px.frustumCulled = false; w.scene.add(px); const D = Array.from({ length: n }, () => [(r() - .5) * 2, (r() - .2) * 2, r() * 3, r() * .3]);
  return { w, update(t, d) { const on = t > d * .34; s.userData.set(on ? 'ERROR\n404\nSORRY' : 'MEGASKIP\nSKIP LINE\n$1'); ph.position.x = on ? Math.sin(t * 90) * .1 : 0; ph.rotation.z = on ? Math.sin(t * 13) * .07 : 0; w.scene.background.set(on && Math.floor(t * 8) % 2 ? 0x5a2230 : 0x202a4a); D.forEach((p, i) => { const T = Math.max(0, t - d * .34 - p[3]); setI(px, i, p[0] + p[0] * T * 3.4, 5 + p[1] * T * 4 - 4 * T * T, 1 + p[2] * T * 2, on ? 1 : .001, T * 7, T * 5); }); doneI(px); camTo(w, [0, 5.4, 18], [0, 5.4, 16.8], [0, 5.3, 0], [0, 5.3, 0], t / d); } };
};

const hp = i => { const a = 18, b = 6; if (i < a) return { x: -12 + i * 1.5, z: .2, y: 1.57 }; if (i < a + b) return { x: 14.5, z: .2 + (i - a + 1) * 1.9, y: 0 }; return { x: 14.5 - (i - a - b + 1) * 1.5, z: 11.6, y: -1.57 }; };
function helpLine(w, v, n = 40) { return Array.from({ length: n }, (_, i) => { const h = hp(i), p = vest(townsperson(i), v); place(p, h.x, 0, h.z, w.scene); p.rotation.y = h.y; p.pose({ mood: i % 3 ? 'stare' : 'sad', head: [0, 0, 0], armL: [0, .1], armR: [0, .1] }); return p; }); }
const HS = ['', 'MEGASKIP HELP DESK', '', '', '', '', ''];
F.P = () => {
  const w = street({ signs: HS, sh: 52, far: 170, bg: 0xbfe6ea }); lift(w, 3.6); helpLine(w, false, 36);
  return { w, update(t, d) { tickGutter(w, t); camTo(w, [-12.5, 5, 17], [1.5, 28, 56], [-12, 3.5, 0], [1.5, 1.4, 5.5], eio(t / d)); } };
};
F.P2 = () => {
  const w = street({ signs: HS, sh: 30, far: 120, bg: 0xbfe6ea }); lift(w, 3.6); const ps = helpLine(w, false, 18);
  const m = MS(); place(m, -1.5, 0, 3, w.scene); m.rotation.y = .4; const j = jar(40); place(j, .9, 0, 3, w.scene); j.scale.setScalar(1.25);
  return { w, update(t, d) { tickGutter(w, t); ps.forEach((p, i) => { const on = t > .1 + (i % 18) * (d * .03); vestOn(p, on); }); j.userData.setN(Math.floor(lerp(8, 40, eio(t / d)))); m.pose({ mood: 'smug', armL: [.2, .2], armR: [.2, .2], head: [.3, 0, 0], blink: blinkAt(t) }); camTo(w, [-.3, 4.2, 18.5], [-.3, 4.4, 17], [-.3, 3.7, 0], [-.3, 3.9, 0], t / d); } };
};

F.Q = () => {
  const O = 'ODD PAIRS', Sg = 'STANDING ROOM'; const w = street({ signs: [O, O, O, O, Sg, Sg, Sg], bg: 0xbfe6ea, sh: 34 }); lift(w); const m = MS(); place(m, 0, 0, .1, w.scene);
  return { w, update(t, d) { tickGutter(w, t * 2); m.pose({ mood: 'happy', armL: [2.3, .55], armR: [2.3, .55], head: [0, -.05, 0], lift: Math.abs(Math.sin(t * 5)) * .15 }); camTo(w, [0, 3.4, 13], [3, 9, 36], [0, 3.7, -1], [3, 5, -3], eio(t / d)); } };
};

F.R = () => {
  const h = hall({ marlo: false }), { w } = h; const m = MS(); place(m, .9, 0, 20, w.scene); m.rotation.y = Math.PI;
  return { w, update(t, d) { h.tick(t); const q = eio(prog(t, 0, d * .85)); m.position.z = lerp(20.5, 16.2, q); m.pose({ walk: q < .98 ? t * 9 : undefined, head: [0, -.05, 0] }); camTo(w, [.9, 4.4, 33], [.9, 4.4, 30.5], [.9, 3.4, 12], [.9, 3.4, 12], t / d); } };
};

F.S = () => {
  const w = world(0x161b2e, { floor: 0x1f2740, env: .4, sun: .4, far: 40 });
  const sp = new THREE.SpotLight(0xfff2d6, 330, 22, .45, .7, 1.6); sp.position.set(0, 8, 8); sp.target.position.set(0, 2.9, 0); w.scene.add(sp, sp.target);
  const m = MS(); w.scene.add(m);
  return { w, update(t, d) { const bl = (t > d * .55 && t < d * .62) ? .1 : 1, l = Math.sin(t * .7) * .5; m.pose({ mood: 'stare', head: [l * .1, .08, 0], look: [l, .1], blink: bl, armL: [0, .1], armR: [0, .1] }); camTo(w, [0, 3.4, 9], [0, 3.3, 7.1], [0, 2.1, 0], [0, 2.25, 0], t / d); } };
};

F.S2 = () => {
  const h = hall({ marlo: false }), { w } = h; const m = MS(); place(m, 1, 0, 16.2, w.scene); const k = kid(); k.scale.setScalar(.75); place(k, 7, 0, 16.2, w.scene); k.rotation.y = -1.57; const bl = money('$20', 1.2); w.scene.add(bl);
  return { w, update(t, d) { h.tick(t); const q = eo(prog(t, 0, d * .36)); k.position.x = lerp(7, 3, q); const stop = q > .97; const give = prog(t, d * .36, d * .5);
    k.pose({ walk: stop ? undefined : t * 12, mood: 'smug', head: [.4, 0, 0], armR: stop ? [1.2, .1] : undefined });
    const gone = prog(t, d * .56, d * .96); m.position.x = lerp(1, -7, eio(gone)); m.rotation.y = gone > 0 ? -1.57 : 1.15;
    m.pose({ walk: gone > 0 ? t * 9 : undefined, mood: gone > 0 ? 'happy' : 'smug', armR: gone > 0 ? undefined : [1.3, .1], head: [0, 0, 0] });
    const stk = eio(prog(t, d * .56, d * .9)); k.position.x = lerp(stop ? 3 : k.position.x, .9, stk);
    bl.position.set(give < 1 ? lerp(1.95, 2.5, give) : k.position.x - .5, 2.45, 16.9); bl.visible = t > d * .1;
    camTo(w, [1.6, 3.4, 29], [1, 3.4, 27], [1.6, 3.2, 16], [1, 3.2, 16], t / d); } };
};

F.Z = recap(["NOBODY LIKES WAITING", "GET PAID TO WAIT", "$1,000,000"], ['ODD PAIRS', 'ODD PAIRS', 'ODD PAIRS', 'ODD PAIRS', 'STANDING ROOM', 'STANDING ROOM', 'STANDING ROOM']);
