import * as THREE from 'three';
import { recap } from './recap.js';
import { C, M, renderer, world, box, cyl, sph, mesh, place, prog, eio, eo, back, lerp, clamp, camTo, label, tokens, setI, doneI, rand } from './world.js';
import { marlo, person } from './marlo.js';
import { sock, sockCloud, setS, washer, marble, jar, street, tickGutter, townsperson, PATS, PAT } from './sets.js';

const popIn = (o, t, a, s = 1, dur = .35) => { const p = prog(t, a, a + dur); o.visible = p > 0; o.scale.setScalar(Math.max(.0001, back(p) * s)); };
const stampIn = (o, t, a, s = 1) => { const p = prog(t, a, a + .24); o.visible = p > 0; o.scale.setScalar(p <= 0 ? .0001 : lerp(2.3, 1, eo(p)) * s); };
const bill = (o, c) => { o.rotation.set(0, Math.atan2(c.position.x - o.position.x, c.position.z - o.position.z), 0); };
const blinkAt = t => (Math.sin(t * 3.1) > .985 ? .1 : 1);
export const F = {};

function room(c = 0xbfe2d4) {
  const w = world(c, { floor: 0xe9dcc0, env: .85, sun: 2.3 });
  place(box(30, 16, .4, c, .02, .9), 0, 8, -3.2, w.scene);
  place(box(30, .1, 12, 0xe9dcc0, .02, .85), 0, .05, 3, w.scene);
  const shelf = box(4, .16, .8, 0x8a5a35, .03); place(shelf, -4.2, 5.2, -2.7, w.scene);
  return w;
}

F.A = () => {
  const w = room(); const wa = washer(); place(wa, 1.3, 0, -1, w.scene);
  const m = marlo({ sockL: PAT.dots(), sockR: PAT.dots() }); place(m, -1.7, 0, .5, w.scene); m.rotation.y = .5;
  const s1 = sock('stripe', .55); w.scene.add(s1);
  return { w, update(t, d) {
    wa.userData.drum.rotation.z = -t * 5;
    const eat = d * .36, q = eio(prog(t, eat, eat + .4));
    s1.position.set(lerp(-.75, 1.3, q), lerp(2.2, 1.9, q), lerp(1.2, 1.9, q)); s1.rotation.z = q * 9; s1.scale.setScalar(lerp(.55, .08, q * q)); s1.visible = q < 1;
    const k = t > eat + .4 ? Math.max(0, Math.sin((t - eat - .4) * 22)) * Math.exp(-(t - eat - .4) * 4) : 0;
    wa.scale.set(1 + k * .06, 1 - k * .05, 1 + k * .06);
    const after = t > eat + .25;
    m.pose({ mood: after ? 'shock' : 'neutral', armR: after ? [.5, .55] : [1.15, .2], armL: after ? [.5, .55] : [0, .15], head: [.45, 0, 0], lift: after ? Math.exp(-(t - eat - .25) * 5) * .25 : 0, look: [.7, 0], blink: blinkAt(t) });
    camTo(w, [-.3, 3, 17], [-.3, 2.9, 16], [-.3, 3.2, 0], [-.3, 3.1, 0], eio(t / d));
  } };
};

F.A2 = () => {
  const w = world(0x1f6f78, { floor: 0x2b858f, env: .7, sun: 2.5, sh: 16 });
  const n = 330, sc = sockCloud(n); w.scene.add(sc); const r = rand(5);
  for (let i = 0; i < n; i++) { const a = r() * 6.28, q = Math.sqrt(r()), ra = q * 8, h = (1 - q) * 5.2 + r() * .4; setS(sc, i, Math.cos(a) * ra, h, Math.sin(a) * ra, 1.1 + r() * .5, r() * 6, r() * 6, r() * 6); } sc.instanceMatrix.needsUpdate = true;
  const m = marlo({ sockL: PAT.stripe(), sockR: PAT.dots() }); place(m, 0, 5.1, 0, w.scene);
  const mb = tokens(1, .01); const N = 46, ms = new THREE.InstancedMesh(new THREE.SphereGeometry(.28, 18, 12), M(C.gold, .14, .55), N); ms.castShadow = true; ms.frustumCulled = false; w.scene.add(ms);
  const D = []; for (let i = 0; i < N; i++) D.push({ x: (r() - .5) * 7, z: (r() - .5) * 3 - 1.5, o: r() * 1.5, sp: 6 + r() * 4 });
  const sign = label('$1,000,000', 4.6, 1.15, { bg: '#f5b700' }); place(sign, 0, 10.9, 1.5, w.scene);
  return { w, update(t, d) {
    D.forEach((p, i) => { const y = 16 - ((t + p.o) % 2.2) * p.sp; setI(ms, i, p.x, y < .3 ? -9 : y, p.z); }); doneI(ms);
    popIn(sign, t, .08, 1);
    m.pose({ mood: 'happy', armL: [2.4, .55 + Math.sin(t * 9) * .12], armR: [2.4, .55 - Math.sin(t * 9) * .12], lift: Math.abs(Math.sin(t * 7)) * .22, head: [0, -.08, 0] });
    camTo(w, [0, 6.4, 21], [0, 7.2, 16.5], [0, 7, 0], [0, 7.9, 0], eo(t / d));
  } };
};

F.B = () => {
  const w = room(0xf7e2a0); const wa = washer(); place(wa, 1.2, 0, -1, w.scene);
  const m = marlo({ sockL: PAT.dots(), sockR: PAT.dots() }); place(m, -2.7, 0, .4, w.scene); m.rotation.y = .4;
  const a = sock('dots', .75), b = sock('mint', .75), c = sock('dots', .75); w.scene.add(a, b, c);
  const l1 = label('2 IN', 2.2, .9, { bg: '#2e86ff', fg: '#fff' }), l2 = label('1 OUT', 2.2, .9, { bg: '#e4572e', fg: '#fff' }); place(l1, -1.5, 6.5, 0, w.scene); place(l2, 1.5, 6.5, 0, w.scene);
  return { w, update(t, d) {
    wa.userData.drum.rotation.z = -t * 7;
    const per = d / 2, ph = (t % per) / per, n = Math.floor(t / per);
    const fin = o => { const q = eio(prog(ph, o, o + .22)); return q; };
    const q1 = fin(0), q2 = fin(.16), q3 = eio(prog(ph, .55, .78));
    a.position.set(lerp(-6, 1.2, q1), lerp(5, 1.9, q1), 2); a.scale.setScalar(lerp(.75, .1, q1 * q1)); a.rotation.z = q1 * 6; a.visible = q1 < 1;
    b.position.set(lerp(-6, 1.2, q2), lerp(5.5, 1.9, q2), 2); b.scale.setScalar(lerp(.75, .1, q2 * q2)); b.rotation.z = q2 * 6; b.visible = q2 < 1;
    c.position.set(lerp(1.2, -1.1, q3), lerp(1.9, 2.1, q3) - q3 * q3 * .1, 2.1); c.scale.setScalar(lerp(.1, .78, q3)); c.rotation.z = q3 * 9; c.visible = q3 > 0;
    popIn(l1, t, .02); popIn(l2, t, per * .55);
    m.pose({ mood: 'sad', armR: [.95, .15], armL: [0, .12], head: [.42, 0, .05], look: [.7, 0], blink: blinkAt(t + 1) });
    camTo(w, [-.45, 3.2, 21], [-.45, 3.3, 20], [-.45, 3.7, 0], [-.45, 3.7, 0], t / d);
  } };
};

F.C = () => {
  const w = room(0xc9c4ee);
  place(box(7.2, 3.2, 3, 0x8a5a35, .1, .55), 0, 1.6, -1.6, w.scene);
  const dr = new THREE.Group(); w.scene.add(dr);
  place(box(6.6, .8, 3.4, 0xa77447, .06, .55), 0, 2.2, 0, dr); place(box(6.2, .1, 3, C.cream, .02, .9), 0, 2.62, 0, dr);
  const r = rand(8); const s = []; for (let i = 0; i < 12; i++) { const so = sock(PATS[i % 5], .62); const c = i % 4, ro = Math.floor(i / 4); so.rotation.set(-Math.PI / 2, 0, r() * .9 - .45); place(so, -2.25 + c * 1.5, 2.78, -.95 + ro * 1.0, dr); s.push(so); }
  const m = marlo(); place(m, 0, 1.1, -3.0, w.scene);
  const a = label('12 SOCKS', 3.7, .95, { bg: '#fbf7ee' }), b = label('0 PAIRS', 3.7, 1.05, { bg: '#e4572e', fg: '#fff' }); place(a, 0, 7.9, -2, w.scene); place(b, 0, 6.7, -2, w.scene); [a, b].forEach(o => { o.rotation.x = 0; });
  return { w, update(t, d, P) {
    const o = eio(prog(t, 0, .6)); dr.position.z = lerp(-1.6, 1.0, o);
    const a1 = P('C', 0) + d * .42, a2 = P('C', 0) + d * .7;
    popIn(a, t, a1); popIn(b, t, a2);
    m.pose({ mood: t > a2 ? 'sad' : 'neutral', head: [0, .08, 0], armL: [0, .12], armR: [0, .12], look: [0, -.8], blink: blinkAt(t) });
    camTo(w, [0, 10.2, 13.5], [0, 11, 14.2], [0, 4.4, -1], [0, 4.6, -1], eio(t / d));
  } };
};

F.D = () => {
  const w = street({ sh: 26 }); const m = marlo(); place(m, 0, 0, -1, w.scene);
  const lines = [], r = rand(21);
  [[-1.4, 8.8], [-.2, 10.1]].forEach(([z, y], k) => {
    const l = cyl(.03, .03, 26, C.ink, 8); l.rotation.z = Math.PI / 2; place(l, 0, y, z, w.scene);
    for (let i = 0; i < 18; i++) { const s = sock(PATS[(i + k) % 5], .68); const x = -12 + i * 1.42 + (k * .7); place(s, x, y - .72, z, w.scene); lines.push({ s, x, ph: r() * 6 }); }
  });
  return { w, update(t, d) {
    tickGutter(w, t); lines.forEach(l => { l.s.rotation.z = Math.sin(t * 2 + l.ph) * .12; });
    m.pose({ mood: 'shock', head: [0, -.5, 0], armL: [.2, .25], armR: [.2, .25], look: [0, 1] });
    const p = eio(t / d);
    camTo(w, [0, 1.9, 9.5], [0, 7.4, 22], [0, 2.8, -1], [0, 8.2, -1], p);
  } };
};

function marbleScene(second) {
  return () => {
    const w = street({ bg: second ? 0xf9d7a0 : 0xbfe6ea }); const m = marlo({ sockL: second ? PAT.stripe() : PAT.dots(), sockR: second ? PAT.dots() : PAT.dots() }); place(m, 0, 0, -1, w.scene);
    const mb = marble(.4); w.scene.add(mb);
    const j = jar(40); place(j, 2.3, 0, -.6, w.scene); j.scale.setScalar(.95); const glow = new THREE.PointLight(C.gold, 0, 16); place(glow, 0, 5, 1, w.scene);
    return { w, update(t, d) {
      tickGutter(w, t);
      const hit = Math.min(.9, d * .44), jarT = hit + .6;
      let x = 0, y, z = -.8; if (t < hit) { y = lerp(15, 4.2, (t / hit) ** 2); } else { const T = t - hit, f = clamp(T / .6); x = lerp(0, 2.3, f); y = lerp(4.2, 1.8, f * f) + Math.sin(f * Math.PI) * 2.1; z = lerp(-.8, -.6, f); }
      mb.visible = t < jarT + .02; mb.position.set(x, y, z);
      j.userData.setN((second ? 14 : 1) + (t > jarT ? 1 : 0) - (second ? 0 : 0));
      const after = t > hit;
      glow.intensity = after ? 120 * Math.exp(-(t - hit) * 2.2) : 0;
      const squash = after ? 1 + Math.sin(clamp((t - hit) / .22) * Math.PI) * -.09 : 1;
      m.children[0].scale.set(1 / squash, squash, 1 / squash);
      m.pose({ mood: after ? (second ? 'happy' : 'idea') : (second ? 'smug' : 'stare'), head: after ? [0, -.1, 0] : [0, .02, 0], armL: after ? [2.2, .35] : [0, .12], armR: after ? [.5, .9] : [0, .12], lift: after ? Math.exp(-(t - hit) * 3.5) * .3 : 0, look: after ? [0, 0] : [0, 1] });
      camTo(w, [1, 3.4, 14.2], [1, 3.6, 12.6], [1, 3.2, -1], [1, 3.3, -1], eio(t / d), (after && t < hit + .24) ? .035 : 0, t);
    } };
  };
}
F.E = marbleScene(false); F.K = marbleScene(true);

F.F = () => {
  const w = world(0xf7e2a0, { floor: 0xf2d98c, env: .85, sun: 2.3 });
  const a = sock('stripe', 1), b = sock('stripe', 1); b.rotation.y = Math.PI; place(a, 0, 0, 0, w.scene); place(b, 0, 0, 0, w.scene);
  const m = marlo(); place(m, 0, 0, 0, w.scene);
  const la = label('YOU', 1.7, .62, { bg: '#2e86ff', fg: '#fff' }), lb = label('SOMEBODY', 2.7, .62, { bg: '#e4572e', fg: '#fff' }); place(la, -1.75, 7.6, 0, w.scene); place(lb, 1.75, 7.6, 0, w.scene);
  return { w, update(t, d, P) {
    const q = eio(prog(t, d * .55, d * .92)), sep = lerp(2.15, .85, q);
    a.position.set(-sep, 5.9 + Math.sin(t * 2) * .08, .6); b.position.set(sep, 5.9 + Math.cos(t * 2) * .08, .6);
    popIn(la, t, .15); popIn(lb, t, d * .42);
    m.pose({ mood: 'idea', armL: [1.3, .7], armR: [1.3, .7], head: [Math.sin(t * 3.4) * .22, -.05, 0], look: [Math.sin(t * 3.4) * .8, .5] });
    camTo(w, [0, 3.6, 18.5], [0, 3.6, 18], [0, 3.3, 0], [0, 3.3, 0], t / d);
  } };
};

function doorstep(opts = {}) {
  const w = street(opts);
  const bx = new THREE.Group(); place(bx, 1.5, 0, -1.4, w.scene);
  place(box(2.4, 1.8, 1.8, 0xc99a5d, .08, .75), 0, .9, 0, bx); place(box(1.2, .06, .22, C.ink, .02), 0, 1.82, 0, bx);
  const sg = label('SOCK\nEXCHANGE', 2.2, 1.15, { bg: '#fbf7ee' }); place(sg, 0, 1.05, .92, bx);
  const pr = label('$1', 1.1, .8, { bg: '#f5b700' }); place(pr, 1.5, 2.5, .6, bx); pr.rotation.z = -.14;
  w.bx = bx; w.bxS = sg; return w;
}

F.G = () => {
  const w = doorstep(); const m = marlo({ sockL: PAT.dots(), sockR: PAT.dots() }); place(m, -.9, 0, -.9, w.scene); m.rotation.y = .45;
  const ps = [0, 1, 2, 3].map(i => { const p = townsperson(i); place(p, 4.2 + i * 1.8, 0, -.5, w.scene); p.rotation.y = -1.57; return p; });
  const j = jar(40); place(j, -2.8, 0, -.8, w.scene); j.scale.setScalar(.95);
  const s = sock('zig', .55), c = marble(.22); w.scene.add(s, c);
  return { w, update(t, d, P) {
    tickGutter(w, t);
    const qs = ps.map((p, i) => { p.position.x = lerp(4.2 + i * 1.8, 3.6 + i * 1.8, eio(prog(t, d * .6, d * .9))); p.pose({ walk: (t * 8), mood: 'happy', armR: i === 0 ? [1.2, .1] : undefined, head: [0, 0, 0] }); return p; });
    const qd = eio(prog(t % (d / 2.2), .15, .7));
    s.position.set(lerp(3.3, 1.6, qd), lerp(2.5, 1.9, qd) + Math.sin(qd * Math.PI) * .6, -1.4); s.rotation.z = qd * 5; s.scale.setScalar(lerp(.55, .2, qd));
    const cq = eo(prog(t % (d / 2.2), .75, 1.25)); c.position.set(lerp(1.5, -2.8, cq), 2.1 + Math.sin(cq * Math.PI) * 1.2, lerp(-1.4, -.8, cq)); c.visible = cq > 0 && cq < 1;
    j.userData.setN(Math.floor(t / (d / 2.2)) + 2);
    m.pose({ mood: 'happy', armR: [1.1, .5], armL: [.4, .35], head: [.25, 0, 0], look: [.5, 0], blink: blinkAt(t) });
    camTo(w, [.8, 3.1, 15.5], [1, 3.6, 19], [.5, 3.2, -1], [1.2, 3.6, -1], eio(t / d));
  } };
};

F.H = () => {
  const w = doorstep(); const m = marlo({ sockL: PAT.dots(), sockR: PAT.dots() }); place(m, -.6, 0, .2, w.scene);
  const n = 260, sc = sockCloud(n); w.scene.add(sc); const r = rand(6); const D = []; for (let i = 0; i < n; i++) { const a = r() * 6.28, q = Math.sqrt(r()), ra = q * 4.2; D.push({ x: Math.cos(a) * ra + 1.2, z: Math.sin(a) * ra * .3 - 3, h: (1 - q) * 5.2 + r() * .4, s: .7 + r() * .3, a: r() * 6, b: r() * 6, c: r() * 6, o: i / n }); }
  const cnt = label('0 SOCKS', 4.6, 1.1, { bg: '#fbf7ee' }); place(cnt, 0, 9, -1, w.scene);
  const sa = sock('stripe', .6), sb = sock('dots', .6); w.scene.add(sa, sb);
  const st = label('0 MATCHES', 5.2, 1.3, { bg: '#e4572e', fg: '#fff', rad: 28 }); place(st, 0, 7.6, 1, w.scene); st.rotation.z = -.05;
  return { w, update(t, d, P) {
    const h2 = P('H2', 0), f = eio(prog(t, .15, h2 - .15));
    D.forEach((p, i) => { const on = f > p.o; setS(sc, i, p.x, on ? p.h : -9, p.z, p.s, p.a, p.b, p.c); }); sc.instanceMatrix.needsUpdate = true;
    cnt.userData.set(Math.round(400 * f) + ' SOCKS'); popIn(cnt, t, .05); if (t > h2 + .3) cnt.visible = false;
    const holding = t > h2 - .12; sa.visible = sb.visible = holding;
    sa.position.set(-1.6, 3.4, 1.1); sb.position.set(.5, 3.4, 1.1); sa.rotation.z = -.2; sb.rotation.z = .2;
    stampIn(st, t, h2 + .35);
    m.pose({ mood: holding ? 'sad' : 'happy', armL: holding ? [1.9, .35] : [1.0, .55], armR: holding ? [1.9, .35] : [1.0, .55], head: holding ? [0, .08, 0] : [0, -.08, 0], look: holding ? [0, 0] : [0, 0] });
    camTo(w, [0, 4.4, 17.5], [-.3, 4, 15], [.3, 4.3, -1], [-.3, 4.1, 0], eio(t / d));
  } };
};

function mob(w, n = 8) { return Array.from({ length: n }, (_, i) => { const p = townsperson(i); const row = i < 4 ? 0 : 1; place(p, -3.2 + (i % 4) * 2.15 + row * 1.05, 0, 2.3 - row * 1.7, w.scene); p.rotation.y = 3.14; return p; }); }

F.I = () => {
  const w = doorstep({ bg: 0xc7c7d6 }); const m = marlo({ sockL: PAT.dots(), sockR: PAT.dots() }); place(m, 1.5, 1.85, -1.4, w.scene);
  const ps = mob(w); const sg = ['REFUND!', '$1 BACK!'].map((x, i) => { const l = label(x, 2, .72, { bg: '#fbf7ee', border: '#e4572e', fg: '#e4572e' }); place(l, -2.6 + i * 1.5, 6.5 + i * .7, 1.2, w.scene); return l; });
  return { w, update(t, d) {
    tickGutter(w, t);
    ps.forEach((p, i) => p.pose({ mood: 'shock', armL: [2.5 + Math.sin(t * 11 + i) * .25, .3], armR: [2.5 - Math.sin(t * 11 + i) * .25, .3], lift: Math.abs(Math.sin(t * 8 + i * 1.7)) * .14, head: [0, 0, 0] }));
    sg.forEach((s, i) => { popIn(s, t, .05 + i * .1); s.position.y = 6.5 + i * .7 + Math.sin(t * 7 + i) * .1; });
    const q = eo(prog(t, 0, d)); m.position.y = lerp(1.85, 1.5, q);
    m.pose({ mood: 'shock', armL: [1.4, .6], armR: [1.4, .6], head: [-.12, .02, 0] });
    camTo(w, [.6, 5.6, 20], [.6, 5.8, 18.5], [.6, 4.5, -1], [.6, 4.5, -1], t / d);
  } };
};

F.I2 = () => {
  const w = doorstep({ bg: 0x8f9ab3, sun: 1.2, env: .55 }); w.bxS.material.color.set(0xbcbcbc);
  const m = marlo({ sockL: PAT.dots(), sockR: PAT.dots() }); place(m, -1, 0, -.4, w.scene); m.rotation.y = .6;
  const sg = label('CLOSED', 2.5, 1, { bg: '#fbf7ee', fg: '#e4572e', border: '#e4572e' }); w.scene.add(sg);
  return { w, update(t, d) {
    tickGutter(w, t * .25);
    const q = eio(prog(t, .1, d * .9)); m.position.x = lerp(-3.2, .1, q);
    sg.position.set(m.position.x + .75, 2.2, m.position.z + 1.25); sg.rotation.z = Math.sin(t * 5) * .04;
    m.pose({ walk: t * 4.5, mood: 'sad', armR: [1.1, .25], armL: [1.1, .1], head: [.05, .25, 0], look: [0, -.7] });
    camTo(w, [-1, 3, 14], [0, 2.8, 12], [-.8, 3, -1], [.2, 2.9, -1], t / d);
  } };
};

F.J = () => {
  const w = street(); const k = person({ top: 0x7fd6b5, pant: 0xf4c7a1, skin: 0xd8a077, hair: 0x2b2b3a, style: 'cap', sockL: PAT.stripe(), sockR: PAT.dots(), shoe: 0x14213d }); k.scale.setScalar(.75); place(k, -4, 0, .5, w.scene);
  k.rotation.y = 1.57;
  return { w, update(t, d) {
    tickGutter(w, t * .5);
    k.position.x = lerp(-3.4, 2.2, t / d); k.pose({ walk: t * 3.2, mood: 'smug', head: [-.8, -.05, 0], look: [.5, 0] });
    const cx = k.position.x + .1;
    camTo(w, [cx - .3, .75, 7.4], [cx + .2, 1.25, 8.6], [cx, 1.05, .5], [cx, 1.35, .5], eo(t / d));
  } };
};

F.J2 = () => {
  const w = doorstep(); const ps = mob(w);
  return { w, update(t, d) {
    ps.forEach((p, i) => { const q = eo(prog(t, .05 + i * .05, .4 + i * .05)); p.rotation.y = lerp(3.14, 0.7, q); p.pose({ mood: 'shock', armL: [.15, .15], armR: [.15, .15], head: [0, 0, 0], look: [.9, -.5] }); });
    camTo(w, [-.4, 3.1, 14.6], [-.4, 3, 12.6], [-.4, 3.2, 0], [-.4, 3.3, 0], t / d);
  } };
};

F.J3 = () => {
  const w = street({ bg: 0xf9d7a0 });
  const kids = Array.from({ length: 12 }, (_, i) => { const p = person({ top: [0x5aa9e6, 0x2fa4a8, 0x7fd6b5, 0xf5b700, 0x7b5fc7][i % 5], pant: 0x3c4560, skin: [0xd8a077, 0x8a5a35, 0xf0c49c][i % 3], hair: [0x2b2b3a, 0x4a3322, 0xc0562a][i % 3], style: ['cap', 'bun', 'short'][i % 3], sockL: PAT[PATS[i % 5]](), sockR: PAT[PATS[(i + 2) % 5]]() }); p.scale.setScalar(.75); place(p, -11 + i * 2.4, 0, .4 + (i % 2) * .9, w.scene); p.rotation.y = 1.57; return p; });
  return { w, update(t, d) {
    tickGutter(w, t);
    kids.forEach((p, i) => { p.position.x = -11 + i * 2.4 + t * 1.6; p.pose({ walk: t * 8 + i, mood: 'happy', head: [-.5, 0, 0] }); });
    camTo(w, [0, 1.7, 12], [0, 2.5, 13.5], [0, 2.1, 0], [0, 2.4, 0], t / d);
  } };
};

F.L = () => {
  const w = doorstep(); w.bxS.visible = true;
  const banner = label('ODD PAIRS', 5.4, 1.5, { bg: '#f5b700' }); place(banner, 0, 5.1, -3.85, w.scene);
  const m = marlo({ sockL: PAT.stripe(), sockR: PAT.dots() }); place(m, -.1, 0, -.4, w.scene);
  const a = sock('stripe', .62), b = sock('dots', .62); w.scene.add(a, b);
  const st = label('ON PURPOSE', 6, 1.4, { bg: null, fg: '#e4572e', border: '#e4572e', rad: 26 }); place(st, 0, 7.8, 1.2, w.scene); st.rotation.z = .08;
  return { w, update(t, d, P) {
    tickGutter(w, t);
    const u = eo(prog(t, d * .22, d * .62)); banner.scale.y = Math.max(.001, u); banner.position.y = 5.75 - .75 * u; w.bx.position.y = lerp(0, -3, eio(prog(t, 0, d * .28)));
    const hold = t > d * .4; a.visible = b.visible = hold; a.position.set(-1.35, 3.4, .5); b.position.set(1.15, 3.4, .5); a.rotation.z = .1; b.rotation.z = -.1;
    stampIn(st, t, d * .82);
    m.pose({ mood: hold ? 'smug' : 'neutral', armL: hold ? [1.7, .5] : [.5, .3], armR: hold ? [1.7, .5] : [.5, .3], head: [0, 0, 0], blink: blinkAt(t) });
    camTo(w, [0, 3.8, 16], [0, 4.4, 14], [0, 4.1, -2], [0, 4.5, -2], eio(t / d));
  } };
};

F.M = () => {
  const w = street(); const sign = label('ODD PAIRS', 5.4, 1.5, { bg: '#f5b700' }); place(sign, 0, 5, -3.85, w.scene);
  const m = marlo({ sockL: PAT.stripe(), sockR: PAT.dots() }); place(m, -1.8, 0, -1.2, w.scene); m.rotation.y = .55;
  const tag = new THREE.Group(); place(tag, 0, 7.8, .8, w.scene); const pr = label('$1', 3, 1.8, { bg: '#fbf7ee', border: '#14213d' }); tag.add(pr);
  const ps = Array.from({ length: 14 }, (_, i) => { const p = townsperson(i, { sockL: PAT[PATS[i % 5]](), sockR: PAT[PATS[(i + 2) % 5]]() }); place(p, 1 + i * 1.5, 0, -.7, w.scene); p.rotation.y = -1.57; return p; });
  const j = jar(40); place(j, -3.6, 0, -.9, w.scene); j.scale.setScalar(.95);
  return { w, update(t, d) {
    tickGutter(w, t);
    const fl = prog(t, d * .42, d * .62); tag.rotation.y = fl * Math.PI * 2; pr.userData.set(fl > .25 ? '$12' : '$1'); tag.scale.setScalar(1 + Math.sin(fl * Math.PI) * .18);
    ps.forEach((p, i) => { p.position.x = lerp(1 + i * 1.5 + 3, 1 + i * 1.5, eo(prog(t, 0, .9))); p.pose({ walk: t * 8, mood: 'happy', head: [0, 0, 0] }); });
    j.userData.setN(Math.floor(lerp(15, 40, t / d)));
    m.pose({ mood: 'happy', armL: [.6, .4], armR: [1.2, .9], head: [.2, -.04, 0], blink: blinkAt(t) });
    camTo(w, [-.4, 3.8, 15.5], [1.5, 5, 22], [-.4, 4.3, -1], [1.5, 4.6, -1], eio(t / d));
  } };
};

F.N = () => {
  const w = street({ bg: 0xc7c7d6, sh: 26 }); const sign = label('ODD PAIRS', 5.4, 1.5, { bg: '#f5b700' }); place(sign, 0, 5, -3.85, w.scene);
  const m = marlo({ sockL: PAT.stripe(), sockR: PAT.dots() }); place(m, -1.6, 0, -1.2, w.scene);
  const bb = new THREE.Group(); place(bb, 1, 0, 2, w.scene);
  place(box(.4, 13, .4, C.grey, .05), -3, 6.5, 0, bb); place(box(.4, 13, .4, C.grey, .05), 3, 6.5, 0, bb);
  const face = label('MEGASOCK\n$2 A PAIR', 8, 4, { bg: '#e4572e', fg: '#fff', rad: 18 }); place(face, 0, 11, .25, bb);
  const ps = Array.from({ length: 10 }, (_, i) => { const p = townsperson(i); place(p, 1 + i * 1.5, 0, -.7, w.scene); p.rotation.y = 1.57; return p; });
  return { w, update(t, d) {
    tickGutter(w, t * .3);
    bb.position.y = lerp(-15, 0, eo(prog(t, .05, .75)));
    ps.forEach((p, i) => { p.position.x = 1 + i * 1.5 + eio(prog(t, 1, d)) * 16; p.pose({ walk: t * 8 + i, mood: 'neutral', head: [0, 0, 0] }); });
    m.pose({ mood: t > 1.1 ? 'sad' : 'shock', armL: [.1, .2], armR: [.1, .2], head: [.25, -.3, 0], look: [.2, 1] });
    camTo(w, [.5, 3.5, 21], [.5, 5.2, 25], [.5, 4.8, 0], [.5, 6.8, 0], eio(t / d), (t > .7 && t < 1) ? .05 : 0, t);
  } };
};

F.O = () => {
  const w = room(0xf7e2a0); place(box(6.2, 1.5, 2.4, 0x8a5a35, .1, .55), 0, .75, .3, w.scene);
  const m = marlo({ sockL: PAT.stripe(), sockR: PAT.dots() }); place(m, 0, 0, -1.4, w.scene);
  const mb = marble(.28); w.scene.add(mb);
  return { w, update(t, d) {
    const toss = Math.abs(Math.sin(t * 2.6)); mb.position.set(1.05, 3.6 + toss * 1.7, .1);
    m.pose({ mood: 'smug', armL: [.4, .2], armR: [1.65, .3], head: [.15, -.05, 0], look: [.6, 1] });
    camTo(w, [0, 4.3, 12.5], [0, 4.5, 10.4], [0, 4.2, 0], [0, 4.5, 0], t / d);
  } };
};

F.O2 = () => {
  const w = street(); const m = marlo({ sockL: PAT.stripe(), sockR: PAT.dots() }); place(m, -2.1, 0, -1, w.scene); m.rotation.y = .6;
  const mx = new THREE.Group(); place(mx, 1.8, 0, -.4, w.scene); place(cyl(.12, .12, 2.4, C.ink, 12), 0, 1.2, 0, mx); place(box(1.8, 1.25, 1.2, C.blue, .35, .4), 0, 2.85, 0, mx); const flag = box(.12, .7, .4, C.red, .03); place(flag, 1, 3.2, 0, mx);
  const pk = new THREE.Group(); w.scene.add(pk); place(box(1.5, 1, .12, 0xc99a5d, .06, .75), 0, 0, 0, pk); const sx = sock('stripe', .32); place(sx, 0, .03, .12, pk);
  const n = label('1 SOCK', 3.1, .9, { bg: '#f5b700' }), n2 = label('A MONTH', 3.1, .9, { bg: '#fbf7ee' }); place(n, 0, 7.8, -.5, w.scene); place(n2, 0, 6.8, -.5, w.scene);
  return { w, update(t, d) {
    tickGutter(w, t);
    const q = eio(prog(t, .2, 1.1)); pk.position.set(lerp(-1.1, 1.8, q), 2.9 + Math.sin(q * Math.PI) * 2.3, lerp(-.5, -.4, q)); pk.visible = q < 1; pk.rotation.z = q * 6;
    flag.rotation.z = t > 1.1 ? -.9 : 0;
    popIn(n, t, .1); popIn(n2, t, .35);
    m.pose({ mood: 'happy', armR: [1.25 - q * .7, .4], armL: [.3, .2], head: [.3, 0, 0], look: [.5, 0] });
    camTo(w, [.1, 3.7, 16.5], [.1, 4.1, 15.5], [.1, 4.2, -1], [.1, 4.3, -1], t / d);
  } };
};

F.O3 = () => {
  const w = world(0xb6d9ef, { floor: 0xa7cde6, env: .85 });
  const c = person({ top: 0x7b5fc7, pant: 0x3c4560, style: 'bun', hair: 0x8b5a2b, sockL: 0xa86a3f, sockR: PAT.stripe() }); place(c, -1.3, 0, 0, w.scene);
  const cal = new THREE.Group(); place(cal, 1.45, 5, -.2, w.scene); place(box(2.9, 3.4, .14, C.white, .05, .8), 0, 0, 0, cal); place(box(2.9, .75, .16, C.red, .05, .5), 0, 1.3, .02, cal); const mon = label('MAY', 2.1, .5, { bg: null, fg: '#fff' }); place(mon, 0, 1.3, .13, cal);
  const big = label('1', 2, 1.8, { bg: null, fg: '#14213d', size: 600 }); place(big, 0, -.45, .1, cal);
  const left = label('SOCK 2 ARRIVES NEXT MONTH', 4.9, .6, { bg: '#fbf7ee' }); place(left, 0, 8.2, 0, w.scene);
  return { w, update(t, d) {
    const fl = prog(t, d * .5, d * .68); cal.rotation.x = Math.sin(fl * Math.PI) * 1.1; mon.userData.set(fl > .5 ? 'JUNE' : 'MAY');
    c.position.y = Math.abs(Math.sin(t * 7)) * .55;
    c.pose({ mood: 'shock', legL: -1.1, armL: [1, .85], armR: [1, .85], head: [.5, -.08, 0], look: [.7, .5] });
    popIn(left, t, .15);
    camTo(w, [0, 4.2, 17.8], [0, 4.2, 17], [0, 4, 0], [0, 4, 0], t / d);
  } };
};

F.P = () => {
  const w = street({ bg: 0xf9d7a0, sh: 24 }); const sign = label('ODD PAIRS', 5.4, 1.5, { bg: '#f5b700' }); place(sign, 0, 5, -3.85, w.scene);
  const j = jar(40); place(j, -1.4, 0, -.8, w.scene); j.scale.setScalar(1.25); j.userData.setN(40);
  const m = marlo({ sockL: PAT.stripe(), sockR: PAT.dots() }); place(m, -3.5, 0, -1, w.scene); m.rotation.y = .4;
  const ps = Array.from({ length: 14 }, (_, i) => { const p = townsperson(i, { sockL: i % 2 ? PAT.dots() : 0xf0c49c, sockR: i % 2 ? 0xf0c49c : PAT.dots() }); place(p, 1 + i * 1.5, 0, -.6, w.scene); p.rotation.y = -1.57; return p; });
  return { w, update(t, d) {
    tickGutter(w, t);
    ps.forEach((p, i) => { p.position.y = Math.abs(Math.sin(t * 6.5 + i * .9)) * .5; p.pose({ legL: -.7 * (i % 2), legR: -.7 * ((i + 1) % 2), mood: 'happy', head: [0, 0, 0], armL: [.8, .45], armR: [.8, .45] }); });
    m.pose({ mood: 'smug', armL: [.2, .2], armR: [.2, .2], head: [.25, 0, 0], blink: blinkAt(t) });
    camTo(w, [-1.5, 3.4, 15.5], [3.5, 4.4, 22], [-1, 3.9, -1], [3.2, 4.3, -1], eio(t / d));
  } };
};

F.Q = () => {
  const w = street({ signAll: 'ODD PAIRS', bg: 0xbfe6ea, sh: 32 }); w.houses.forEach(h => { h.userData.sign.position.y = 4.8; });
  const m = marlo({ sockL: PAT.stripe(), sockR: PAT.dots() }); place(m, 0, 0, .1, w.scene);
  return { w, update(t, d) {
    tickGutter(w, t * 2);
    m.pose({ mood: 'happy', armL: [2.3, .55], armR: [2.3, .55], head: [0, -.05, 0], lift: Math.abs(Math.sin(t * 5)) * .15 });
    camTo(w, [0, 3.4, 13], [0, 6.5, 27], [0, 3.7, -1], [0, 4.9, -3], eio(t / d));
  } };
};

function laundry2(push) {
  return () => {
    const w = room(0xbfe2d4); const wa = washer(); place(wa, 1.1, 0, -1.3, w.scene); w.scene.children; const m = marlo({ sockL: PAT.stripe(), sockR: PAT.dots() }); place(m, -2.2, 0, -.4, w.scene); m.rotation.y = 1.5;
    const s = sock('stripe', .55); s.rotation.set(-1.25, 0, .4); place(s, -.5, .2, -1.6, w.scene); s.visible = false;
    return { w, update(t, d) {
      const q = push ? 1 - eio(prog(t, .25, d * .75)) : eio(prog(t, d * .2, d * .85));
      wa.position.x = lerp(1.1, 3.1, q); m.position.x = lerp(-.8, 1.25, q) ; s.visible = q > .4;
      m.pose({ walk: (q > .02 && q < .98) ? t * 6 : undefined, mood: push ? 'stare' : 'neutral', armL: [1.5, .05], armR: [1.5, .05], lean: .16, head: [0, 0, 0] });
      camTo(w, [1.2, 3.3, 18], [1.4, 3.1, 17], [1.2, 3.4, -1], [1.4, 3.3, -1], t / d);
    } };
  };
}
F.R = laundry2(false); F.S2 = laundry2(true);

F.R2 = () => {
  const w = world(0x161b2e, { floor: 0x1f2740, env: .15, sun: 0, far: 40 });
  const sp = new THREE.SpotLight(0xfff2d6, 500, 30, .32, .6, 1.6); sp.position.set(0, 12, 3); sp.target.position.set(0, 0, 0); sp.castShadow = true; sp.shadow.mapSize.set(2048, 2048); w.scene.add(sp, sp.target);
  const s = sock('stripe', 1.05); s.rotation.set(-1.4, 0, .35); place(s, 0, .22, 0, w.scene);
  const dust = new THREE.InstancedMesh(new THREE.SphereGeometry(.028, 8, 6), new THREE.MeshBasicMaterial({ color: 0xd8d2c0 }), 30); dust.frustumCulled = false; w.scene.add(dust); const r = rand(12); const D = Array.from({ length: 30 }, () => [(r() - .5) * 5, r() * 4 + .3, (r() - .5) * 3, r() * 6]);
  return { w, update(t, d) {
    D.forEach((p, i) => setI(dust, i, p[0] + Math.sin(t * .5 + p[3]) * .3, p[1] + Math.sin(t * .4 + p[3]) * .2, p[2], 1)); doneI(dust);
    camTo(w, [0, 3.8, 12.5], [0, 3.2, 8.8], [0, 1, 0], [0, .85, 0], eio(t / d));
  } };
};

F.S = () => {
  const w = world(0x161b2e, { floor: 0x1f2740, env: .4, sun: .4, far: 40 });
  const sp = new THREE.SpotLight(0xfff2d6, 330, 22, .45, .7, 1.6); sp.position.set(0, 8, 8); sp.target.position.set(0, 2.9, 0); w.scene.add(sp, sp.target);
  const m = marlo({ sockL: PAT.stripe(), sockR: PAT.dots() }); w.scene.add(m);
  return { w, update(t, d) {
    const bl = (t > d * .55 && t < d * .62) ? .1 : 1, l = Math.sin(t * .7) * .5;
    m.pose({ mood: 'stare', head: [l * .1, .14, 0], look: [l, -1], blink: bl, armL: [0, .1], armR: [0, .1] });
    camTo(w, [0, 3.4, 9], [0, 3.3, 7.1], [0, 2.1, 0], [0, 2.25, 0], t / d);
  } };
};

F.Z = recap(["SOCKS GET LOST", "SELL SOCKS THAT DON'T MATCH", "$1,000,000"], ['ODD PAIRS', 'ODD PAIRS', 'ODD PAIRS', 'ODD PAIRS', '', '', '']);
