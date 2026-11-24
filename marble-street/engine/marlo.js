// MARLO: the permanent lead. Do not edit per episode: this file IS the character bible.
import * as THREE from 'three';
import { M, place, lerp } from './world.js';

const SPH = new THREE.SphereGeometry(1, 30, 22), SPL = new THREE.SphereGeometry(1, 14, 10);
SPH.dispose = SPL.dispose = () => {}; // shared across scenes: never free between scene switches
const caps = new Map();
const capG = (r, l) => { const k = r + '_' + l; if (!caps.has(k)) caps.set(k, new THREE.CapsuleGeometry(r, l, 6, 16)); return caps.get(k); };
const m = (g, c, ro = .55, shadow = true) => { const o = new THREE.Mesh(g, typeof c === 'number' ? M(c, ro) : c); o.castShadow = shadow; o.receiveShadow = true; return o; };
const ball = (r, c, ro) => { const o = m(SPH, c, ro); o.scale.setScalar(r); return o; };

export const MOODS = {
  neutral: { br: 0, ang: 0, sm: .35, op: 0, eye: 1 },
  happy: { br: .05, ang: -.05, sm: 1, op: .35, eye: 1 },
  sad: { br: .02, ang: .42, sm: -.8, op: 0, eye: .92 },
  shock: { br: .12, ang: -.1, sm: 0, op: 1, eye: 1.2 },
  idea: { br: .13, ang: -.14, sm: 1, op: .85, eye: 1.25 },
  smug: { br: -.03, ang: -.2, sm: .85, op: 0, eye: .78 },
  stare: { br: -.04, ang: .03, sm: 0, op: 0, eye: .72 },
};

export function person(o = {}) {
  const c = { skin: 0xf0c49c, hair: 0x4a3322, top: 0x7b8fb0, pant: 0x3c4560, shoe: 0x3b3f4d, sole: 0xfbf7ee, sockL: 0xfbf7ee, sockR: 0xfbf7ee, style: 'short', hood: false, pendant: false, pencil: false, ...o };
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const R = {};
  const leg = (side, sock) => {
    const L = new THREE.Group(); place(L, .25 * side, 1.15, 0, body);
    place(m(capG(.2, .34), c.pant), 0, -.27, 0, L);
    const ank = m(new THREE.CylinderGeometry(.17, .175, .42, 16), sock, .7); place(ank, 0, -.72, 0, L);
    const sh = m(capG(.2, .34), c.shoe, .4); sh.rotation.x = Math.PI / 2; sh.scale.y = 1; place(sh, 0, -.98, .12, L);
    const so = m(new THREE.CylinderGeometry(.21, .21, .05, 18), c.sole, .4); so.scale.z = 1.8; place(so, 0, -1.12, .12, L);
    L.userData.sock = ank; return L;
  };
  R.legL = leg(-1, c.sockL); R.legR = leg(1, c.sockR);
  place(m(capG(.53, .38), c.top, .62), 0, 1.62, 0, body);
  if (c.hood) {
    const hd = ball(.46, c.top, .62); hd.scale.set(.56, .4, .4); place(hd, 0, 2.2, -.36, body);
    place(m(new THREE.BoxGeometry(.72, .28, .05), 0xc7512b, .65), 0, 1.3, .515, body);
    [-.12, .12].forEach(x => { const s = m(new THREE.CylinderGeometry(.02, .02, .36, 8), 0xfbf7ee); place(s, x, 2.02, .5, body); });
  }
  if (c.pendant) { const cord = m(new THREE.TorusGeometry(.33, .013, 6, 30), 0x2a2030); cord.rotation.x = 1.15; place(cord, 0, 2.06, .2, body); place(ball(.1, M(0xf5b700, .15, .6)), 0, 1.77, .55, body); }
  const arm = (side) => {
    const A = new THREE.Group(); place(A, .62 * side, 2.02, 0, body);
    place(m(capG(.165, .58), c.top, .62), 0, -.4, 0, A);
    place(ball(.2, c.skin, .55), 0, -.9, 0, A);
    const hand = new THREE.Group(); place(hand, 0, -1.03, .05, A); A.userData.hand = hand; return A;
  };
  R.armL = arm(-1); R.armR = arm(1);
  const hd = new THREE.Group(); place(hd, 0, 2.18, 0, body); R.head = hd;
  const skull = ball(.82, c.skin, .58); skull.scale.set(.86, .78, .82); place(skull, 0, .72, 0, hd);
  [-1, 1].forEach(s => { const e = ball(.14, c.skin, .55); e.scale.z = .6 * .14; place(e, .84 * s, .74, 0, hd); e.scale.set(.1, .15, .1); });
  // hair
  const hairM = M(c.hair, .85);
  if (c.style === 'afro') {
    const pts = []; for (let i = 0; i < 70; i++) { const y = 1 - (i + .5) / 70 * 1.55, r = Math.sqrt(Math.max(0, 1 - y * y)), a = i * 2.39996; const x = Math.cos(a) * r, z = Math.sin(a) * r; if (z > .1 && y < .86) continue; pts.push([x * .87, y * .85 + .72, z * .85]); }
    pts.forEach((p, i) => { const b = new THREE.Mesh(SPL, hairM); b.castShadow = true; b.scale.setScalar(.28 + (i * 37 % 11) * .009); place(b, p[0], p[1], p[2], hd); });
  } else if (c.style === 'short') {
    const cap = new THREE.Mesh(SPL, hairM); cap.castShadow = true; cap.scale.set(.9, .62, .86); place(cap, 0, 1.08, -.1, hd);
  } else if (c.style === 'bun') {
    const cap = new THREE.Mesh(SPL, hairM); cap.scale.set(.9, .62, .86); place(cap, 0, 1.08, -.1, hd); const bn = new THREE.Mesh(SPL, hairM); bn.scale.setScalar(.34); bn.castShadow = true; place(bn, 0, 1.68, -.15, hd);
  } else if (c.style === 'cap') {
    const cap = new THREE.Mesh(SPL, M(c.hair, .5)); cap.scale.set(.88, .5, .86); place(cap, 0, 1.15, 0, hd); const br = m(new THREE.BoxGeometry(.8, .06, .55), c.hair, .5); place(br, 0, 1.16, .72, hd);
  }
  if (c.pencil) { const p = m(new THREE.CylinderGeometry(.04, .04, .95, 10), 0xf5b700, .4); p.rotation.set(1.25, 0, .05); place(p, .64, 1.1, .18, hd); const t = m(new THREE.ConeGeometry(.04, .13, 10), 0x2a2030); t.rotation.set(1.25, 0, .05); place(t, .65, 1.25, .66, hd); }
  // face
  const eyes = [-1, 1].map(s => { const G = new THREE.Group(); place(G, .3 * s, .86, .67, hd); const w = ball(1, 0xffffff, .22); w.scale.set(.2, .25, .12); G.add(w); const pu = ball(1, 0x161020, .15); pu.scale.set(.115, .14, .05); place(pu, 0, 0, .1, G); const hl = ball(.04, 0xffffff, .1); place(hl, .045, .06, .155, G); G.userData = { pu, hl }; return G; });
  const brows = [-1, 1].map(s => { const b = m(new THREE.BoxGeometry(.36, .09, .07), c.hair, .7); place(b, .3 * s, 1.18, .66, hd); return b; });
  const nose = ball(.075, c.skin, .55); place(nose, 0, .68, .72, hd); nose.scale.set(.08, .07, .08);
  const mouthArc = m(new THREE.TorusGeometry(.2, .036, 10, 26, Math.PI), 0x1c1420, .5, false); place(mouthArc, 0, .46, .73, hd);
  const mouthOpen = ball(1, 0x3a1626, .6); place(mouthOpen, 0, .42, .68, hd);
  g.userData.R = R; g.userData.sockColors = c;
  g.pose = (p = {}) => {
    const w = p.walk;
    const s = w === undefined ? 0 : Math.sin(w);
    const aL = p.armL || [0, .1], aR = p.armR || [0, .1];
    R.legL.rotation.x = (p.legL ?? 0) + s * .62; R.legR.rotation.x = (p.legR ?? 0) - s * .62;
    R.armL.rotation.set(-aL[0] - s * .4 * (p.armL ? 0 : 1), 0, -aL[1]); R.armR.rotation.set(-aR[0] + s * .4 * (p.armR ? 0 : 1), 0, aR[1]);
    const h = p.head || [0, 0, 0]; hd.rotation.set(h[1], h[0], h[2] || 0);
    body.rotation.x = p.lean || 0; body.position.y = (w === undefined ? 0 : Math.abs(s) * .07) + (p.lift || 0); body.rotation.z = p.tilt || 0;
    const a = MOODS[p.mood || 'neutral'], bm = p.blend && MOODS[p.blend[0]] || a, k = p.blend ? p.blend[1] : 1;
    const f = v => lerp(a[v], bm[v], k);
    const blink = p.blink ?? 1;
    eyes.forEach((e, i) => { e.scale.set(1, f('eye') * blink, 1); e.userData.pu.position.x = (p.look?.[0] || 0) * .07 + (p.look ? 0 : 0); e.userData.pu.position.y = (p.look?.[1] || 0) * .07; e.userData.pu.scale.set(.115 * (a === MOODS.shock ? .72 : 1), .14 * (a === MOODS.shock ? .72 : 1), .05); e.userData.hl.position.x = .045 + (p.look?.[0] || 0) * .07; });
    brows.forEach((b, i) => { const sg = i ? 1 : -1; b.position.y = 1.18 + f('br'); b.rotation.z = -sg * f('ang'); });
    const sm = f('sm'), op = f('op');
    mouthArc.visible = op < .2; mouthArc.rotation.z = sm >= 0 ? Math.PI : 0; const q = Math.max(.08, Math.abs(sm));
    mouthArc.scale.set(.75 + .35 * q, .15 + .95 * q, 1); mouthArc.position.y = sm < 0 ? .3 : .51; mouthArc.position.z = sm < 0 ? .77 : .73;
    mouthOpen.visible = op >= .2; mouthOpen.scale.set(.22 + op * .05, .08 + .16 * op, .08);
  };
  g.pose({});
  return g;
}

// Locked character definition. Same every episode.
export const MARLO = { skin: 0xa86a3f, hair: 0x1f172e, top: 0xf26a3d, pant: 0x24375a, shoe: 0xfbf7ee, sole: 0xf5b700, style: 'afro', hood: true, pendant: true, pencil: true, sockL: 0xfbf7ee, sockR: 0xfbf7ee };
export const marlo = (extra = {}) => person({ ...MARLO, ...extra });
