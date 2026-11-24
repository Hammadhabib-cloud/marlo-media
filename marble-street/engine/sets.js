import * as THREE from 'three';
import { C, M, W, world, box, cyl, sph, mesh, place, label, setI, doneI, rand } from './world.js';
import { person } from './marlo.js';

// ---- Socks
const shp = () => { const s = new THREE.Shape(); s.moveTo(-.46, 1.05); s.lineTo(.3, 1.05); s.lineTo(.3, .1); s.quadraticCurveTo(.62, .02, .94, -.06); s.quadraticCurveTo(1.3, -.2, 1.25, -.62); s.quadraticCurveTo(1.15, -.95, .7, -.95); s.lineTo(-.15, -.95); s.quadraticCurveTo(-.46, -.95, -.46, -.55); s.closePath(); return s; };
const sockG = new THREE.ExtrudeGeometry(shp(), { depth: .16, bevelEnabled: true, bevelSize: .06, bevelThickness: .06, bevelSegments: 2, curveSegments: 10 }); sockG.translate(-.3, 0, -.08);
const tex = (draw) => { const c = document.createElement('canvas'); c.width = c.height = 256; draw(c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1.3, 1.3); t.anisotropy = 8; return new THREE.MeshStandardMaterial({ map: t, roughness: .85 }); };
const STR = {};
export const PAT = {
  stripe: () => STR.stripe ??= tex(g => { g.fillStyle = '#14213d'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#f5b700'; for (let y = 0; y < 256; y += 64) g.fillRect(0, y, 256, 32); }),
  dots: () => STR.dots ??= tex(g => { g.fillStyle = '#2e86ff'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#fbf7ee'; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { g.beginPath(); g.arc(64 + i * 128, 64 + j * 128, 30, 0, 7); g.fill(); } }),
  zig: () => STR.zig ??= tex(g => { g.fillStyle = '#e4572e'; g.fillRect(0, 0, 256, 256); g.strokeStyle = '#fbf7ee'; g.lineWidth = 22; for (let y = 32; y < 256; y += 96) { g.beginPath(); for (let x = -32; x <= 288; x += 64) g.lineTo(x, y + (((x + 32) / 64) % 2 ? 26 : -26)); g.stroke(); } }),
  mint: () => STR.mint ??= tex(g => { g.fillStyle = '#7fd6b5'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#14213d'; for (let x = 0; x < 256; x += 64) g.fillRect(x, 0, 26, 256); }),
  plum: () => STR.plum ??= tex(g => { g.fillStyle = '#7b5fc7'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#f5b700'; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) g.fillRect(16 + i * 86, 16 + j * 86, 40, 40); }),
};
export const PATS = ['stripe', 'dots', 'zig', 'mint', 'plum'];
export const sock = (p = 'stripe', s = 1) => { const o = new THREE.Mesh(sockG, PAT[p]()); o.castShadow = true; o.scale.setScalar(s); return o; };
export function sockCloud(n) { const m = new THREE.InstancedMesh(sockG, new THREE.MeshStandardMaterial({ roughness: .85, color: 0xffffff }), n); m.castShadow = true; m.frustumCulled = false; const cs = [C.gold, C.blue, C.red, 0x7fd6b5, 0x7b5fc7, C.cream, 0xf2a9a0, C.ink]; const col = new THREE.Color(); for (let i = 0; i < n; i++) m.setColorAt(i, col.set(cs[i % 8])); m.instanceColor.needsUpdate = true; return m; }
const d = new THREE.Object3D();
export function setS(m, i, x, y, z, s, rx, ry, rz) { d.position.set(x, y, z); d.scale.setScalar(s); d.rotation.set(rx, ry, rz); d.updateMatrix(); m.setMatrixAt(i, d.matrix); }

// ---- Washer
export function washer() {
  const g = new THREE.Group(); place(box(3.2, 3.8, 2.9, C.white, .2, .38), 0, 2.05, 0, g);
  [-1.2, 1.2].forEach(x => place(box(.34, .24, 2.2, 0x9aa2b2, .05), x, .12, 0, g));
  place(box(3, .55, .05, 0xd8dce5, .05, .4), 0, 3.5, 1.46, g);
  place(cyl(.2, .2, .1, C.ink, 24).rotateX(Math.PI / 2), 1.05, 3.5, 1.5, g);
  place(box(.7, .22, .05, 0x7ee8a2, .03, .3), -.2, 3.5, 1.5, g);
  const ring = mesh(new THREE.TorusGeometry(1.08, .16, 14, 56), M(0xbfc6d4, .25, .65)); place(ring, 0, 1.85, 1.48, g);
  const glass = cyl(1.04, 1.04, .1, M(0x20324f, .12, 0, { transparent: true, opacity: .65 }), 48); glass.rotation.x = Math.PI / 2; glass.castShadow = false; place(glass, 0, 1.85, 1.47, g);
  const drum = new THREE.Group(); place(drum, 0, 1.85, 1.4, g);
  [0, 2.1, 4.2].forEach((a, i) => { const s = sock(['stripe', 'dots', 'mint'][i], .34); place(s, Math.cos(a) * .55, Math.sin(a) * .55, 0, drum); });
  g.userData.drum = drum; return g;
}
export function marble(r = .4) { return sph(r, M(C.gold, .14, .55)); }
export function jar(n = 40) {
  const g = new THREE.Group();
  const gl = cyl(.92, .92, 2.3, M(0xbfe3ff, .05, 0, { transparent: true, opacity: .34 }), 40); gl.castShadow = false; place(gl, 0, 1.15, 0, g);
  const rim = mesh(new THREE.TorusGeometry(.92, .07, 12, 44), M(C.gold, .2, .4)); rim.rotation.x = Math.PI / 2; place(rim, 0, 2.3, 0, g); const base = cyl(.98, .98, .12, C.gold, 40, .25); place(base, 0, .06, 0, g);
  const mb = new THREE.InstancedMesh(new THREE.SphereGeometry(.24, 18, 12), M(C.gold, .14, .55), n); mb.castShadow = true; mb.frustumCulled = false; g.add(mb); g.userData.mb = mb;
  const r = rand(3), pts = []; for (let i = 0; i < n; i++) { const l = Math.floor(i / 8), a = (i % 8) / 8 * 6.283 + l * .6, ra = .62 + (r() - .5) * .1; pts.push([Math.cos(a) * ra * (l % 2 ? .65 : 1), .26 + l * .34, Math.sin(a) * ra * (l % 2 ? .65 : 1)]); }
  g.userData.setN = k => { for (let i = 0; i < n; i++) { const p = pts[i]; if (i < k) setI(mb, i, p[0], p[1], p[2], 1); else setI(mb, i, 0, -5, 0, .001); } doneI(mb); };
  g.userData.setN(0); return g;
}

// ---- Marble Street: same set every episode
const HS = [0xf4c7a1, 0xa7d8c9, 0xf7e2a0, 0xc9c4ee, 0xf2a9a0, 0xb6d9ef, 0xf4c7a1];
export function house(c, h = 6.2, door = C.ink, sign) {
  const g = new THREE.Group(); place(box(5.9, h, 3.6, c, .1, .75), 0, h / 2, -1.8, g);
  const t = new THREE.Shape(); t.moveTo(-3.25, 0); t.lineTo(3.25, 0); t.lineTo(0, 1.5); t.closePath();
  const r = mesh(new THREE.ExtrudeGeometry(t, { depth: 4.1, bevelEnabled: false }), M(0x34476b, .7)); place(r, 0, h, -3.85, g);
  place(box(1.26, 2.5, .12, door, .05, .45), 0, 1.3, .03, g);
  place(sph(.08, C.gold, .25), .4, 1.3, .15, g);
  [-1.95, 1.95].forEach(x => { place(box(1.25, 1.35, .1, 0xfff4c9, .05, .3), x, 2, .02, g); place(box(1.45, .12, .22, C.white, .03), x, 1.28, .1, g); });
  [-1.95, 0, 1.95].forEach(x => place(box(1.1, 1.05, .1, 0xfff4c9, .05, .3), x, h - 1.4, .02, g));
  if (sign) { const l = label(sign, 5.2, 1.2, { bg: '#14213d', fg: '#f5b700' }); place(l, 0, 3.55, .1, g); g.userData.sign = l; }
  return g;
}
export function street(o = {}) {
  const w = world(o.bg ?? 0xbfe6ea, { floor: 0xd8cfb9, env: o.env ?? .78, sun: o.sun ?? 2.4, far: o.far ?? 110, sh: o.sh ?? 20, fov: o.fov });
  const sc = w.scene;
  place(box(70, .1, 5.2, 0xefe6d2, .02, .9), 0, .05, -1.4, sc); // sidewalk
  place(box(70, .12, 16, 0x5b6a82, .02, .9), 0, .02, 9, sc); // road
  for (let x = -32; x < 34; x += 4.5) place(box(2.2, .03, .24, C.cream, .01), x, .1, 8, sc);
  const gut = box(70, .08, .36, 0xb79a55, .02, .4); place(gut, 0, .09, 1.05, sc); // marble gutter (signature)
  const mb = new THREE.InstancedMesh(new THREE.SphereGeometry(.17, 14, 10), M(C.gold, .16, .55), 14); mb.frustumCulled = false; mb.castShadow = true; sc.add(mb); w.gutter = mb;
  const sg = o.signs || [];
  const hs = [-3, -2, -1, 0, 1, 2, 3].map((k, i) => { const h = house(HS[i], [6.4, 7.6, 6, 6.6, 7.8, 6.2, 7][i], k === 0 ? C.red : C.ink, sg[i] || (o.signAll ? o.signAll : null)); place(h, k * 6.55, 0, -4.05, sc); return h; });
  w.houses = hs;
  place(box(1.4, .3, .9, 0xe6dbc1, .05), 0, .15, -3.55, sc); // doorstep
  const num = label('7', .55, .55, { bg: '#fbf7ee' }); place(num, 0, 2.15, -3.96, sc);
  place(cyl(.05, .05, 4.1, C.ink, 10), -2.9, 2.1, -.2, sc);
  const nameplate = label('MARBLE ST', 2, .5, { bg: '#1f6f78', fg: '#fff' }); place(nameplate, -2.9, 4.0, -.15, sc);
  return w;
}
export const tickGutter = (w, t) => { for (let i = 0; i < 14; i++) { const x = ((t * 3 + i * 4.3) % 60) - 30; setI(w.gutter, i, x, .32, 1.05, 1, 0, x * 3); } doneI(w.gutter); };

const TOPS = [0x5aa9e6, 0x7fd6b5, 0x2fa4a8, 0x7b5fc7, 0xf5b700, 0xf2a9a0, 0x3d5a80, 0x9bc53d];
const SK = [0xf0c49c, 0x8a5a35, 0xd8a077, 0xf3d2b3, 0x6f4326, 0xc98f62];
const HR = [0x4a3322, 0x1b1b1f, 0x8b5a2b, 0xb7b7bf, 0xc0562a, 0x2b2b3a];
const ST = ['short', 'bun', 'cap', 'short', 'bun', 'cap'];
export function townsperson(i, ex = {}) { return person({ top: TOPS[i % 8], skin: SK[i % 6], hair: HR[(i * 5 + 1) % 6], style: ST[i % 6], pant: [0x3c4560, 0x5a4a3a, 0x2f5a57][i % 3], sockL: 0xfbf7ee, sockR: 0xfbf7ee, ...ex }); }
