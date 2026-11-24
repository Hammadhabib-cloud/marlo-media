import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const W = 1080, H = 1920;
export const C = { ink: 0x14213d, cream: 0xf4ead5, gold: 0xf5b700, blue: 0x2e86ff, red: 0xe4572e, teal: 0x1f6f78, white: 0xfbf7ee, grey: 0x8d99ae, dark: 0x0b1224, green: 0x2fa36b };
export const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
const env = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;

const mc = new Map();
export function M(color, rough = .5, metal = 0, extra = {}) {
  const k = [color, rough, metal, JSON.stringify(extra)].join();
  if (!mc.has(k)) mc.set(k, new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra }));
  return mc.get(k);
}
export const mesh = (g, m, s = true) => { const o = new THREE.Mesh(g, m); o.castShadow = s; o.receiveShadow = true; return o; };
export const box = (w, h, d, c, r = .06, ro = .55) => mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2.1, h / 2.1, d / 2.1)), typeof c === 'number' ? M(c, ro) : c);
export const cyl = (rt, rb, h, c, seg = 40, ro = .5) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), typeof c === 'number' ? M(c, ro) : c);
export const sph = (r, c, ro = .35, me = 0) => mesh(new THREE.SphereGeometry(r, 32, 22), typeof c === 'number' ? M(c, ro, me) : c);
export const place = (o, x = 0, y = 0, z = 0, p) => { o.position.set(x, y, z); if (p) p.add(o); return o; };

export function world(bg = C.teal, opt = {}) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(bg); scene.environment = env;
  scene.environmentIntensity = opt.env ?? .55;
  const f = opt.far ?? 70; scene.fog = new THREE.Fog(bg, f * .45, f);
  const floor = mesh(new THREE.CircleGeometry(120, 64), M(opt.floor ?? bg, .9), false);
  floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const sun = new THREE.DirectionalLight(0xfff1dd, opt.sun ?? 2.4);
  sun.position.set(-7, 15, 10); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  const s = opt.sh ?? 14; Object.assign(sun.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 1, far: 50 }); sun.shadow.bias = -.0006; sun.shadow.radius = 5;
  scene.add(sun); scene.add(sun.target);
  const cam = new THREE.PerspectiveCamera(opt.fov ?? 36, W / H, .1, 300);
  return { scene, cam, sun, floor };
}
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const prog = (t, a, b) => clamp((t - a) / (b - a));
export const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
export const eo = x => 1 - Math.pow(1 - x, 3);
export const back = x => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
export const lerp = (a, b, x) => a + (b - a) * x;
const v0 = new THREE.Vector3();
export function camTo(w, a, b, la, lb, p, shake = 0, t = 0) {
  w.cam.position.set(lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p));
  v0.set(lerp(la[0], lb[0], p), lerp(la[1], lb[1], p), lerp(la[2], lb[2], p));
  if (shake) { w.cam.position.x += Math.sin(t * 71) * shake; w.cam.position.y += Math.cos(t * 83) * shake; }
  w.cam.lookAt(v0);
}
export function rand(seed) { let s = seed * 1000 + 7; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

export function drawLabel(cv, text, o = {}) {
  const g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height);
  if (o.bg !== null) { g.fillStyle = o.bg ?? '#fbf7ee'; const r = o.rad ?? 34; g.beginPath(); g.roundRect(0, 0, cv.width, cv.height, r); g.fill(); }
  if (o.border) { g.strokeStyle = o.border; g.lineWidth = 16; g.beginPath(); g.roundRect(8, 8, cv.width - 16, cv.height - 16, (o.rad ?? 34) - 6); g.stroke(); }
  g.fillStyle = o.fg ?? '#14213d'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const lines = String(text).split('\n'); let fs = o.size ?? cv.height * .72 / lines.length;
  const maxw = cv.width * .88;
  const fit = () => { g.font = `${fs}px "Archivo Black"`; return Math.max(...lines.map(l => g.measureText(l).width)); };
  while (fit() > maxw) fs *= .95;
  lines.forEach((l, i) => g.fillText(l, cv.width / 2, cv.height / 2 + (i - (lines.length - 1) / 2) * fs * 1.14 + fs * .04));
}
export function label(text, w, h, o = {}) {
  const cv = document.createElement('canvas'); cv.width = Math.round(1024 * Math.min(1, w / h)); cv.height = Math.round(1024 * Math.min(1, h / w));
  if (cv.width < 256) cv.width = 256; if (cv.height < 256) cv.height = 256;
  drawLabel(cv, text, o);
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
  const m = new THREE.MeshStandardMaterial({ map: tx, transparent: true, roughness: .6, emissive: o.glow ? 0xffffff : 0, emissiveMap: o.glow ? tx : null, emissiveIntensity: o.glow ?? 0 });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.castShadow = false;
  p.userData.set = (t) => { if (p.userData.t === t) return; p.userData.t = t; drawLabel(cv, t, o); tx.needsUpdate = true; };
  return p;
}
export function token(r = .5) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 512; const g = cv.getContext('2d');
  g.fillStyle = '#2e86ff'; g.fillRect(0, 0, 512, 512); g.strokeStyle = '#d5e8ff'; g.lineWidth = 22; g.beginPath(); g.arc(256, 256, 214, 0, 7); g.stroke();
  g.fillStyle = '#fff'; g.font = '290px "Archivo Black"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('M', 256, 270);
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.center.set(.5,.5); tx.rotation = Math.PI/2;
  const face = new THREE.MeshStandardMaterial({ map: tx, roughness: .28, emissive: 0x114488, emissiveIntensity: .35 });
  const side = M(0x1a62c7, .3, .1);
  const m = mesh(new THREE.CylinderGeometry(r, r, r * .26, 56), [side, face, face]);
  m.rotation.x = Math.PI / 2; const gp = new THREE.Group(); gp.add(m); gp.userData.body = m; return gp;
}
export function tokens(n, r = .3) {
  const m = new THREE.InstancedMesh(new THREE.CylinderGeometry(r, r, r * .28, 28), M(C.blue, .3, .05, { emissive: 0x0f3f88, emissiveIntensity: .5 }), n);
  m.castShadow = true; m.frustumCulled = false; return m;
}
export function marbles(n, r = .22, color = C.gold) {
  const m = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 26, 18), M(color, .16, .55), n);
  m.castShadow = true; m.frustumCulled = false; return m;
}
const d = new THREE.Object3D();
export function setI(m, i, x, y, z, s = 1, rx = 0, rz = 0) { d.position.set(x, y, z); d.scale.setScalar(s); d.rotation.set(rx, 0, rz); d.updateMatrix(); m.setMatrixAt(i, d.matrix); }
export const doneI = m => { m.instanceMatrix.needsUpdate = true; };

export function plane(body = C.white, tail = C.blue, wing = 0xd8d4c8) {
  const g = new THREE.Group();
  const f = mesh(new THREE.CapsuleGeometry(.62, 5.0, 12, 32), M(body, .32)); f.rotation.z = Math.PI / 2; place(f, 0, 1.3, 0, g);
  const nose = mesh(new THREE.SphereGeometry(.3, 20, 14), M(C.ink, .3)); nose.scale.set(1.2, .7, 1.5); place(nose, 2.95, 1.5, 0, g);
  const stripe = mesh(new THREE.CylinderGeometry(.635, .635, .34, 32), M(tail, .35)); stripe.rotation.z = Math.PI / 2; place(stripe, -1.5, 1.3, 0, g);
  const wg = box(1.25, .12, 7.2, wing, .05); wg.rotation.y = .12; place(wg, -.1, 1.05, 0, g);
  [-1.5, 1.5].forEach(z => { const e = cyl(.26, .26, .85, C.grey, 24); e.rotation.z = Math.PI / 2; place(e, .25, .82, z, g); });
  const fin = box(1.15, 1.45, .12, tail, .05); fin.rotation.z = .35; place(fin, -2.8, 2.35, 0, g);
  const st = box(.72, .1, 2.5, wing, .04); place(st, -2.95, 1.75, 0, g);
  const win = new THREE.InstancedMesh(new THREE.SphereGeometry(.075, 12, 10), M(C.ink, .25), 26);
  for (let i = 0; i < 13; i++) { const x = -1.9 + i * .32; setI(win, i * 2, x, 1.5, .6); setI(win, i * 2 + 1, x, 1.5, -.6); } doneI(win); g.add(win);
  [[1.9, 0], [-.3, .9], [-.3, -.9]].forEach(([x, z]) => { const w = cyl(.2, .2, .15, C.ink, 20); w.rotation.x = Math.PI / 2; place(w, x, .2, z, g); place(cyl(.05, .05, .6, C.grey, 8), x, .5, z, g); });
  return g;
}
export function bank(sign = 'BANK', bodyc = C.cream) {
  const g = new THREE.Group();
  place(box(7.4, .4, 4.6, 0xe6dbc1, .08), 0, .2, 0, g);
  place(box(6.8, 3.2, 3.8, bodyc, .08), 0, 2, -.2, g);
  for (let i = 0; i < 4; i++) place(cyl(.26, .3, 3.2, C.white, 24, .4), -2.55 + i * 1.7, 2, 1.9, g);
  place(box(7.2, .32, 4.3, C.white, .05), 0, 3.75, 0, g);
  const tri = new THREE.Shape(); tri.moveTo(-3.7, 0); tri.lineTo(3.7, 0); tri.lineTo(0, 1.35); tri.closePath();
  const pd = mesh(new THREE.ExtrudeGeometry(tri, { depth: 4.1, bevelEnabled: false }), M(C.white, .5)); place(pd, 0, 3.9, -2.05, g);
  const lb = label(sign, 2.9, .68, { bg: C.ink && '#14213d', fg: '#f5b700' }); place(lb, 0, 4.42, 2.09, g);
  const door = box(1.3, 2.4, .1, C.ink, .05); place(door, 0, 1.6, 1.72, g); g.userData.door = door;
  return g;
}
export function pawn(c = C.red, scale = 1) {
  const g = new THREE.Group();
  place(cyl(.2, .34, .78, M(c, .45), 28), 0, .39, 0, g);
  place(sph(.27, 0xf1c9a5, .5), 0, 1.03, 0, g);
  [-.1, .1].forEach(x => place(sph(.038, C.ink, .3), x, 1.07, .24, g));
  g.scale.setScalar(scale); return g;
}
export function printer() {
  const g = new THREE.Group();
  place(box(3.6, 2.5, 2.8, C.ink, .22, .4), 0, 1.35, 0, g);
  place(box(3.8, .3, 3, C.teal, .1), 0, .15, 0, g);
  const hop = cyl(1, .55, 1, M(C.white, .35, 0, { transparent: true, opacity: .32 }), 32); place(hop, 0, 3.05, 0, g);
  place(box(2.4, .1, .04, 0x000000, .01), 0, .95, 1.42, g);
  const sg = label('MILE PRINTER', 2.9, .62, { bg: '#f5b700' }); place(sg, 0, 2.0, 1.42, g);
  const p = cyl(.2, .2, 1, C.gold, 20, .25); place(p, -1.2, 3.1, 0, g); g.userData.piston = p;
  const p2 = cyl(.2, .2, 1, C.gold, 20, .25); place(p2, 1.2, 3.1, 0, g); g.userData.piston2 = p2;
  return g;
}
export function belt(len, w = 1.5, color = 0x28324d) {
  const g = new THREE.Group();
  place(box(len, .22, w, color, .1, .75), 0, .9, 0, g);
  for (let x = -len / 2 + .8; x < len / 2; x += 1.8) { [-w / 2 + .1, w / 2 - .1].forEach(z => place(box(.14, .9, .14, C.grey, .03), x, .45, z, g)); }
  return g;
}
