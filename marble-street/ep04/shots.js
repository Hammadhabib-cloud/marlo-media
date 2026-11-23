// MARBLE STREET Ep04: HE TURNED RAIN INTO MONEY (Tall Tale 3D). Original fictional story.
// A shot: { id, at, note, draw(lt, d, t, blit) }. cut(i) = just before line i, Wd('word', i) = when that word is said.
import * as THREE from 'three';
import { ctx, clamp, lerp, seg, eo, eio, eob, rnd } from './core/lib.js';
import { L, Wd, T } from './core/timing.js';
import { camera } from './core/engine.js';
import * as WD from './core/world.js';
import * as PR from './core/props.js';
import { Toon, PROPS, INK } from './core/toon.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const mix = (a, b, k) => a.clone().lerp(b, k);
const talk = (t, on = 1) => (on ? 0.25 + 0.75 * Math.abs(Math.sin(t * 13)) * (0.6 + 0.4 * Math.sin(t * 5.3)) : 0);
const blink = (t, off = 0) => (((t + off) % 3.3) < 0.12 ? 1 : 0);

PROPS.cookie = (g, x, y) => { g.fillStyle = '#D9A05B'; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.arc(x, y - 40, 44, 0, 7); g.fill(); g.stroke();
  g.fillStyle = '#5A3420'; [[-16, -54], [12, -60], [18, -30], [-10, -24], [0, -42]].forEach(([dx, dy]) => { g.beginPath(); g.arc(x + dx, y + dy, 6, 0, 7); g.fill(); }); };
PROPS.brush = (g, x, y) => { g.strokeStyle = INK; g.lineWidth = 5; g.fillStyle = '#9A6A43'; g.beginPath(); g.roundRect(x - 7, y - 90, 14, 80, 4); g.fill(); g.stroke(); g.fillStyle = '#D8343F'; g.beginPath(); g.roundRect(x - 14, y - 125, 28, 38, 6); g.fill(); g.stroke(); };

const LOOK = {
  marlo: { body: '#F28C38', hat: 'beanie', hatCol: '#2E7D6B', neck: 'scarf', neckCol: '#F2C230', extra: ['freckles'] },
  baker: { body: '#F4EFE4', pattern: 'apron', patCol: '#E58A6A', hat: 'none', extra: ['mustache', 'blush'] },
  boss: { body: '#4A4560', hat: 'tophat', hatCol: '#2A2638', neck: 'bowtie', neckCol: '#D8343F', dots: 1, pattern: 'vest', patCol: '#2A2638', extra: ['monocle', 'mustache'] },
  c0: { body: '#7FC8E8', hat: 'cap', hatCol: '#3C6FB6' }, c1: { body: '#B98ACF', hat: 'bun', hatCol: '#7A4A2E', pattern: 'apron' },
  c2: { body: '#6FA35A', pattern: 'overalls', patCol: '#3E5FA8', hat: 'boater', hatCol: '#E8C77A' }, c3: { body: '#E58A6A', hat: 'bow', hatCol: '#3C6FB6', extra: ['glasses'] },
  c4: { body: '#F2C230', hat: 'visor', hatCol: '#2F8F5B', neck: 'tie', neckCol: '#D8343F' }, c5: { body: '#4FB3A9', hat: 'flower', hatCol: '#D8343F', pattern: 'stripes', patCol: '#2B5E73' },
  c6: { body: '#C9603F', hat: 'bowler', hatCol: '#2A2638', extra: ['mustache'] }, c7: { body: '#9ED39A', hat: 'beanie', hatCol: '#B5372E', pattern: 'check', patCol: '#4F8F55' },
};
const person = (k, opts) => new Toon({ ...LOOK[k], extra: [...(LOOK[k].extra || [])] }, opts);
const UMB = ['#D8343F', '#3C6FB6', '#F2C230', '#2F8F5B', '#B98ACF', '#E58A6A', '#4FB3A9', '#F28C38'];

// a 3D umbrella: origin = the handle. .flip(k) turns it inside out, .bend(a) tilts the canopy
function umbrella(col) {
  const g = new THREE.Group(), can = new THREE.Group();
  const m = WD.mat({ color: col, side: THREE.DoubleSide, roughness: 0.6 });
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.78, 0.36, 8, 1, true), m); cone.castShadow = true; can.add(cone);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), WD.mat({ color: '#2A2638' })); tip.position.y = 0.2; can.add(tip);
  can.position.y = 1.0; g.add(can);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.05, 6), WD.mat({ color: '#2A2638', metalness: 0.3 })); shaft.position.y = 0.52; g.add(shaft);
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.016, 6, 12, Math.PI), WD.mat({ color: '#7A4A2E' })); hook.rotation.z = Math.PI; g.add(hook);
  g.flip = (k) => { can.scale.y = lerp(1, -1.3, k); can.scale.x = can.scale.z = lerp(1, 0.8, k); };
  g.bend = (a) => { can.rotation.z = a; };
  return g;
}
function closedUmbrella(col) {
  const g = new THREE.Group();
  const c = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.75, 8), WD.mat({ color: col })); c.position.y = 0.55; c.castShadow = true; g.add(c);
  const s = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 6), WD.mat({ color: '#2A2638' })); s.position.y = 0.15; g.add(s);
  return g;
}
// world position of a cut-out's hand (uses the last drawn state)
function handWorld(p, side = 'R') {
  const h = p.hands && p.hands[side]; if (!h) return p.group.position.clone().add(V3(0, 1.2, 0));
  let [hx, hy] = h; if (p.st && p.st.flip) hx = 512 - hx;
  const Wd2 = p.H / 2, ry = p.pivot.rotation.y + p.group.rotation.y;
  const right = V3(Math.cos(ry), 0, -Math.sin(ry));
  return p.group.position.clone().add(right.multiplyScalar((hx - 256) / 512 * Wd2)).add(V3(0, p.H * (1 - (24 + hy) / 1024), 0));
}

// 2D weather
function rain(t, k = 1, n = 150) {
  if (k <= 0) return;
  ctx.save(); ctx.fillStyle = `rgba(38,52,92,${0.3 * k})`; ctx.fillRect(0, 0, 1080, 1920);
  ctx.strokeStyle = `rgba(215,230,255,${0.55 * k})`; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const sp = 2600 + rnd(i * 3) * 1400, x0 = rnd(i) * 1240 - 80, y = ((rnd(i * 7) * 2100 + t * sp) % 2100) - 120, len = 50 + rnd(i * 11) * 50;
    const x = x0 - (y / 1920) * 120; ctx.moveTo(x, y); ctx.lineTo(x - len * 0.18, y + len);
  }
  ctx.stroke(); ctx.restore();
}
function wind(t, k = 1) {
  if (k <= 0) return;
  ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${0.7 * k})`; ctx.lineWidth = 7; ctx.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    const y = 250 + rnd(i * 5) * 1100, len = 260 + rnd(i) * 220, x = ((rnd(i * 9) * 1500 + t * 1900) % 1700) - 400;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x + len * 0.4, y - 40, x + len * 0.7, y + 40, x + len, y); ctx.stroke();
  }
  ctx.restore();
}
function card(lines, k, { y = 560, rot = -0.05, bg = '#F4EBD6', fg = '#1F1C33', accent = '#D8343F', w = 820, h = 520 } = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(540, y); ctx.rotate(lerp(-0.35, rot, eo(k))); const sc = lerp(1.7, 1, eob(k)); ctx.scale(sc, sc); ctx.globalAlpha = Math.min(1, k * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(-w / 2 + 16, -h / 2 + 18, w, h);
  ctx.fillStyle = bg; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.strokeStyle = fg; ctx.lineWidth = 10; ctx.strokeRect(-w / 2 + 18, -h / 2 + 18, w - 36, h - 36);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let yy = -h / 2 + 95; lines.forEach(([txt, size, col]) => { ctx.font = `900 ${size}px Inter`; ctx.fillStyle = col === 'a' ? accent : fg; ctx.fillText(txt, 0, yy + size * 0.1); yy += size * 1.25; });
  ctx.restore();
}

export function buildShots(E) {
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.06);
  const cam = camera(36);
  const LK = { street: { bloom: 0.15, aperture: 0.0012, maxblur: 0.008 } };
  const shoot = (scene, people, from, to, at, at2, k, look, pre) => {
    if (cam.fov !== (look.fov || 36)) { cam.fov = look.fov || 36; cam.updateProjectionMatrix(); }
    cam.position.copy(mix(from, to, k)); const tgt = at2 ? mix(at, at2, k) : at; cam.lookAt(tgt);
    people.forEach((p) => p.face(cam)); if (pre) pre();
    E.render(scene, cam, { ...look, focus: cam.position.distanceTo(tgt) });
  };

  // ── the street ─────────────────────────────────────────────────────
  const SHOPS = [['CAFE', '#E58A6A', 'wood', '#2E4E3F'], ['GENERAL STORE', '#6FA3B8', 'wood', null], ['BARBER', '#E3C16F', 'wood', '#3C6FB6'], ['GRAND HOTEL', '#9E4A3A', 'brick', null],
    ['TAILOR', '#B98ACF', 'wood', '#2E4E3F'], ['BAKERY', '#C9603F', 'brick', '#D8343F'], ['HARDWARE', '#B5553C', 'brick', '#F2C230'], ['BOOKS', '#7FA36A', 'wood', '#2E4E8A'],
    ['BANK', '#C7B79A', 'brick', null], ['PHARMACY', '#5FA39A', 'wood', '#D8343F'], ['SHOES', '#D9A34A', 'wood', null], ['THEATER', '#A3485A', 'brick', '#F2C230']];
  const ST = WD.mainStreet(E, { shops: SHOPS, cars: true });
  const BK = ST.buildings.find((b) => b.name === 'BAKERY' && b.side < 0) || ST.buildings.find((b) => b.name === 'BAKERY');
  const bz = BK.z;
  ST.sun.key.target.position.set(-4, 0, bz - 2); ST.sun.key.position.set(6, 13, bz + 6);
  const KEY = ST.sun.key.intensity;
  const weather = (wet) => { ST.sun.key.intensity = KEY * lerp(1, 0.45, wet); };
  ST.people.forEach((p) => (p.group.visible = false));               // our own crowd instead

  const marlo = person('marlo'), baker = person('baker'), boss = person('boss');
  const crowd = ['c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c0', 'c3'].map((k, i) => person(k, { res: 0.7, height: 1.6 + rnd(i) * 0.25 }));
  [marlo, baker, boss, ...crowd].forEach((p) => ST.scene.add(p.group));
  const all = () => [marlo, baker, boss, ...crowd];
  const hideAll = () => all().forEach((p) => (p.group.visible = false));
  const show = (...ps) => ps.forEach((p) => (p.group.visible = true));

  // umbrellas: one per crowd member + Marlo's
  const umbs = crowd.map((_, i) => { const u = umbrella(UMB[i % UMB.length]); u.visible = false; ST.scene.add(u); return u; });
  const mU = umbrella('#2E7D6B'); mU.visible = false; ST.scene.add(mU);
  const hideUmbs = () => [...umbs, mU].forEach((u) => { u.visible = false; u.rotation.set(0, 0, 0); });
  const holdU = (p, u, k = 0, bend = 0) => { u.visible = true; u.position.copy(handWorld(p, 'R')).add(V3(0, -0.05, 0)); u.flip(k); u.bend(bend); };

  // the barrel + bus stop + Marlo's sign, on the right boardwalk opposite the bakery
  const BX = 4.7, BZ = bz - 1.0;
  const brl = WD.barrel(); brl.position.set(BX, 0.18, BZ); ST.scene.add(brl);
  const inBarrel = UMB.map((c, i) => { const u = closedUmbrella(c); const a = i * 0.8; u.position.set(BX + Math.cos(a) * 0.16, 0.5, BZ + Math.sin(a) * 0.16); u.rotation.set(Math.sin(a) * 0.18, 0, Math.cos(a) * 0.18); ST.scene.add(u); return u; });
  const barrelFill = (n) => inBarrel.forEach((u, i) => (u.visible = i < n));
  const bus = new THREE.Group(); { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 8), WD.mat({ color: '#5A5A66', metalness: 0.4 })); p.position.y = 1.3; bus.add(p);
    const sb = WD.signBoard('BUS STOP', { w: 0.9, h: 0.5, bg: '#3C6FB6', fg: '#FFFFFF' }); sb.position.y = 2.45; bus.add(sb); }
  bus.position.set(BX + 0.2, 0.18, BZ + 1.3); bus.rotation.y = -Math.PI / 2; ST.scene.add(bus);
  const sign = new THREE.Group(); { const pst = PR.poster(['UMBRELLAS', '!BORROW: $1', 'RETURN AT', 'ANY SHOP'], { w: 1.0, h: 1.15 }); pst.position.y = 1.25; sign.add(pst);
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.8, 0.06), WD.mat({ color: '#7A4A2E' })); leg.position.y = 0.4; sign.add(leg); }
  sign.position.set(BX - 0.1, 0.18, BZ - 1.2); sign.rotation.y = -Math.PI / 2; ST.scene.add(sign);

  // MegaSock's machine (rolls up the road)
  const mach = new THREE.Group(); {
    const b = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.0, 1.3), WD.mat({ color: '#C8283A', roughness: 0.4, metalness: 0.2 })); b.position.y = 1.75; b.castShadow = true; mach.add(b);
    const top = WD.signBoard('MEGASOCK', { w: 1.9, h: 0.45, bg: '#1F1C33', fg: '#F2C230', font: 'Inter' }); top.position.set(0, 3.45, 0.66); mach.add(top);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.4), WD.mat({ color: '#BFE6F5', emissive: '#4A90B8', emissiveIntensity: 0.3, roughness: 0.1, transparent: true, opacity: 0.3 })); glass.position.set(0, 2.1, 0.66); mach.add(glass);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const u = closedUmbrella('#2A2638'); u.scale.setScalar(0.45); u.position.set(-0.55 + c * 0.37, 1.45 + r * 0.42, 0.5); mach.add(u); }
    const price = WD.signBoard('$12 EACH', { w: 1.3, h: 0.42, bg: '#F2C230', fg: '#1F1C33', font: 'Inter' }); price.position.set(0, 1.0, 0.66); mach.add(price);
    [[-0.8, 0.5], [0.8, 0.5], [-0.8, -0.5], [0.8, -0.5]].forEach(([x, z]) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 14), WD.mat({ color: '#2A2638' })); w.rotation.z = Math.PI / 2; w.position.set(x * 1.1, 0.22, z); mach.add(w); });
  }
  mach.visible = false; ST.scene.add(mach);
  const cU = closedUmbrella('#3C6FB6'); cU.scale.setScalar(1.3); cU.visible = false; ST.scene.add(cU);

  // crowd spots under the bakery awning (x -5.0..-5.7)
  const huddle = (i) => [-5.0 - (i % 3) * 0.33, 0.18, bz + 2.3 - i * 0.5];

  const reset = () => { hideAll(); hideUmbs(); cU.visible = false; mach.visible = false; barrelFill(UMB.length); brl.visible = sign.visible = true; };

  // ── S00 "Every time it rained on Marble Street," crane down the wet street ──
  { const st = cut(0);
    add({ id: 'S00', at: st, note: 'crane down the rainy street; people run under umbrellas', draw(lt, d, t, blit) {
      reset(); weather(1); sign.visible = false; brl.visible = false; barrelFill(0); const k = eio(clamp(lt / d));
      show(...crowd.slice(0, 4)); crowd.slice(0, 4).forEach((p, i) => { p.at(i % 2 ? 2.2 : -2.0, 0, bz + 6 - i * 3 + (i % 2 ? -1 : 1) * t * 1.6); p.set({ legs: 'run', phase: t * 11 + i, mood: 'worried', armR: [105, -40], blink: blink(t, i) }); });
      shoot(ST.scene, all(), V3(0.5, 7.5, bz + 20), V3(0.3, 2.4, bz + 11), V3(0, 3.5, bz), V3(-1, 1.6, bz + 2), k, { ...LK.street, fov: 44 },
        () => crowd.slice(0, 4).forEach((p, i) => holdU(p, umbs[i])));
      blit(); rain(t);
    } });
    cue(st + 0.05, 'whoosh', { gain: 0.5 }); cue(0.1, 'sizzle', { dur: 12.4, gain: 0.55 }); }

  // ── S01 "Marlo got completely soaked," ──
  { const st = cut(1), w = Wd('soaked', 1);
    add({ id: 'S01', at: st, note: 'Marlo trudges in the rain, soaked and sad', draw(lt, d, t, blit) {
      reset(); weather(1); sign.visible = false; brl.visible = false; const k = eo(clamp(lt / d));
      show(marlo); marlo.at(-1.2, 0, bz + 4 - lt * 0.8);
      marlo.set({ legs: 'walk', phase: t * 6, mood: t > w - 0.1 ? 'sad' : 'worried', tears: t > w ? 1 : 0, sweat: 1, armL: [10, 6], armR: [10, 6], bob: Math.sin(t * 12) * 6, blink: blink(t) });
      shoot(ST.scene, all(), V3(1.4, 1.5, bz + 8.2), V3(0.6, 1.4, bz + 6.6), V3(-1.2, 1.3, bz + 4), V3(-1.2, 1.3, bz + 3.3), k, LK.street);
      blit(); rain(t, 1, 190);
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(w, 'plop'); cue(w + 0.15, 'plop'); }

  // ── S02 "because he never remembered his umbrella." pats pockets; umbrella thought bubble crossed out ──
  { const st = cut(2), w = Wd('umbrella', 2);
    add({ id: 'S02', at: st, note: 'Marlo pats his pockets, thought bubble: umbrella with a red X', draw(lt, d, t, blit) {
      reset(); weather(1); sign.visible = false; brl.visible = false; const k = eo(clamp(lt / d));
      show(marlo); marlo.at(-1.2, 0, bz + 3.2);
      const pat = Math.sin(t * 14) > 0;
      marlo.set({ mood: 'worried', sweat: 1, look: [0.3, -0.2], armL: pat ? [25, 60] : [15, 40], armR: pat ? [15, 40] : [25, 60], blink: blink(t) });
      shoot(ST.scene, all(), V3(-0.4, 1.7, bz + 6.2), V3(-0.7, 1.65, bz + 5.3), V3(-1.2, 1.4, bz + 3.2), null, k, LK.street);
      blit(); rain(t, 1, 190);
      const b = eob(seg(t, w - 0.35, w + 0.05));
      if (b > 0) { ctx.save(); ctx.translate(700, 520); ctx.scale(b, b);
        ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(0, 0, 210, 160, 0, 0, 7); ctx.fill(); ctx.stroke();
        [[-150, 190, 26], [-200, 250, 16]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke(); });
        ctx.fillStyle = '#2E7D6B'; ctx.beginPath(); ctx.moveTo(-120, 10); ctx.quadraticCurveTo(0, -130, 120, 10); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(0, 90); ctx.arc(-18, 90, 18, 0, Math.PI); ctx.stroke();
        const x = seg(t, w + 0.1, w + 0.35); if (x > 0) { ctx.strokeStyle = '#D8343F'; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-120, -100); ctx.lineTo(-120 + 240 * x, -100 + 200 * x); ctx.moveTo(120, -100); ctx.lineTo(120 - 240 * x, -100 + 200 * x); ctx.stroke(); }
        ctx.restore(); }
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(w - 0.3, 'pop'); cue(w + 0.15, 'boing', { gain: 0.5 }); }

  // ── S03 "Then one stormy morning, he saw twenty people" wide on the bakery, crowd under the awning ──
  const crowdUnder = (t, moodFn) => crowd.forEach((p, i) => { show(p); p.at(...huddle(i)); p.set({ mood: moodFn ? moodFn(i) : (i % 3 ? 'worried' : 'sad'), sweat: i % 2, look: [0.2, 0.3], armL: [20 + (i % 2) * 30, 50], armR: [15, 30], bob: Math.sin(t * 9 + i) * 3, blink: blink(t, i * 0.7) }); });
  { const st = cut(3), w = Wd('twenty', 3);
    add({ id: 'S03', at: st, note: 'Marlo spots twenty people stuck under the bakery awning', draw(lt, d, t, blit) {
      reset(); weather(1); sign.visible = false; brl.visible = false; const k = eio(clamp(lt / d));
      crowdUnder(t); show(marlo); marlo.at(-1.6, 0, bz + 5.2); marlo.set({ mood: t > w ? 'shock' : 'worried', look: [-0.6, 0], sweat: 1, armR: t > w ? [80, -20] : [10, 6], blink: blink(t) });
      shoot(ST.scene, all(), V3(2.6, 3.0, bz + 9.5), V3(1.6, 2.2, bz + 7.4), V3(-4.5, 1.8, bz + 1), V3(-4.2, 1.5, bz + 1.2), k, { ...LK.street, fov: 42 });
      blit(); rain(t);
      const c = eob(seg(t, w - 0.05, w + 0.3)); if (c > 0) { ctx.save(); ctx.translate(250, 420); ctx.rotate(-0.12); ctx.scale(c, c); ctx.fillStyle = '#F2C230'; ctx.strokeStyle = INK; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = INK; ctx.font = '900 110px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('20', 0, 8); ctx.restore(); }
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(Wd('stormy', 3), 'thud', { gain: 0.5 }); cue(w, 'pop', { gain: 0.8 }); }

  // ── S04 "stuck under the bakery roof, just like him." push in on the huddle, Marlo squeezes in ──
  { const st = cut(4), w = Wd('like', 4);
    add({ id: 'S04', at: st, note: 'push in on the soggy huddle; Marlo squeezes in at the end', draw(lt, d, t, blit) {
      reset(); weather(1); sign.visible = false; brl.visible = false; const k = eo(clamp(lt / d));
      crowdUnder(t); show(marlo); const m = eo(seg(t, w - 0.6, w)); marlo.at(lerp(-3.6, -4.7, m), 0.18 * m, bz + 3.0);
      marlo.set({ mood: t > w ? 'tired' : 'worried', legs: t < w ? 'walk' : 'stand', phase: t * 9, sweat: 1, tears: 1, blink: blink(t) });
      shoot(ST.scene, all(), V3(-0.8, 1.9, bz + 5.4), V3(-1.8, 1.8, bz + 4.2), V3(-5.0, 1.5, bz + 1.2), V3(-4.8, 1.45, bz + 1.8), k, LK.street);
      blit(); rain(t, 1, 120);
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(w, 'plop'); }

  // ── S05 "So Marlo bought a barrel of cheap umbrellas," ──
  { const st = cut(5), w = Wd('umbrellas', 5);
    add({ id: 'S05', at: st, note: 'Marlo, smug, beside a barrel filling up with umbrellas', draw(lt, d, t, blit) {
      reset(); weather(1); sign.visible = false; const k = eo(clamp(lt / d)); barrelFill(Math.min(UMB.length, Math.floor(seg(t, st + 0.3, w + 0.2) * UMB.length) + 1));
      show(marlo); marlo.at(BX - 0.9, 0.18, BZ + 0.2); marlo.set({ mood: 'smug', armR: [70, 40], armL: [10, 6], look: [0.4, 0.2], blink: blink(t) });
      shoot(ST.scene, all(), V3(1.6, 1.4, BZ + 3.4), V3(2.3, 1.5, BZ + 2.6), V3(BX - 0.4, 1.0, BZ), null, k, LK.street);
      blit(); rain(t, 0.8, 110);
    } });
    cue(st, 'whoosh', { gain: 0.5 }); [0.4, 0.7, 1.0, 1.3, 1.6].forEach((o) => cue(st + o, 'pop', { gain: 0.6 })); }

  // ── S06 "put it by the bus stop," ──
  { const st = cut(6);
    add({ id: 'S06', at: st, note: 'the barrel by the bus stop sign; camera cranes up', draw(lt, d, t, blit) {
      reset(); weather(1); sign.visible = false; const k = eio(clamp(lt / d));
      show(marlo); marlo.at(BX - 1.0, 0.18, BZ - 0.4); marlo.set({ mood: 'proud', armL: [130, 20], blink: blink(t) });
      shoot(ST.scene, all(), V3(0.2, 1.2, BZ + 4.2), V3(0.0, 2.4, BZ + 5.6), V3(BX, 1.0, BZ + 0.4), V3(BX, 1.5, BZ + 0.4), k, LK.street);
      blit(); rain(t, 0.8, 110);
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + 0.3, 'thud', { gain: 0.6 }); }

  // ── S07 "and painted a sign:" ──
  { const st = cut(7), w = Wd('sign', 7);
    add({ id: 'S07', at: st, note: 'Marlo paints the sign next to the barrel', draw(lt, d, t, blit) {
      reset(); weather(1); sign.visible = t > w - 0.2; const k = eo(clamp(lt / d));
      show(marlo); marlo.at(BX - 0.8, 0.18, BZ - 1.9); marlo.set({ mood: 'happy', holdR: PROPS.brush, v: 'brush', armR: [90 + Math.sin(t * 16) * 25, -30], look: [0.5, 0], blink: blink(t) });
      shoot(ST.scene, all(), V3(0.6, 1.6, BZ + 1.6), V3(1.0, 1.5, BZ + 0.9), V3(BX - 0.5, 1.2, BZ - 1.6), null, k, LK.street);
      blit(); rain(t, 0.7, 90);
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + 0.2, 'zip', { gain: 0.5 }); cue(w, 'ding', { gain: 0.6 }); }

  // ── S08 "borrow one for a dollar, return it at any shop." the sign card ──
  { const st = cut(8), wd = Wd('dollar', 8), ws = Wd('shop', 8);
    add({ id: 'S08', at: st, note: 'the sign card: BORROW $1 / RETURN AT ANY SHOP', draw(lt, d, t, blit) {
      reset(); weather(1); sign.visible = true; const k = eo(clamp(lt / d));
      show(marlo); marlo.at(BX - 0.8, 0.18, BZ - 1.9); marlo.set({ mood: 'smug', armR: [60, -40], blink: blink(t) });
      shoot(ST.scene, all(), V3(0.4, 1.3, BZ + 1.2), V3(0.8, 1.3, BZ + 0.6), V3(BX - 0.4, 1.0, BZ - 1.5), null, k, LK.street);
      blit(); rain(t, 0.6, 80);
      const a = seg(lt, 0, 0.3), b = seg(t, Wd('return', 8) - 0.1, Wd('return', 8) + 0.2);
      card([['UMBRELLAS', 96, 'f'], [t > wd - 0.15 ? 'BORROW: $1' : 'BORROW', 118, 'a'], ['', 20, 'f'], ...(b > 0 ? [['RETURN AT', 70, 'f'], ['ANY SHOP', 92, 'f']] : [])], a, { y: 560, h: 620 });
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(wd, 'stamp', { gain: 0.7 }); cue(Wd('return', 8), 'pop', { gain: 0.7 }); }

  // ── S09 "By lunch, the barrel was empty." ──
  { const st = cut(9), w = Wd('empty', 9);
    add({ id: 'S09', at: st, note: 'street full of colourful umbrellas; barrel empty; Marlo laughs, cash in hand', draw(lt, d, t, blit) {
      reset(); weather(1); barrelFill(0); const k = eio(clamp(lt / d));
      crowd.forEach((p, i) => { show(p); const side = i % 2 ? 1 : -1; p.at(side * (1.0 + (i % 3) * 0.7), 0, bz + 1.5 - i * 1.4 + side * lt * 1.0); p.set({ legs: 'walk', phase: t * 7 + i, mood: 'happy', armR: [105, -40], blink: blink(t, i) }); });
      show(marlo); marlo.at(BX - 0.9, 0.18, BZ + 0.2); marlo.set({ mood: t > w ? 'laugh' : 'happy', holdL: PROPS.cash(3), armL: [80, -20], armR: [40, 20], v: 'cash', blink: blink(t) });
      shoot(ST.scene, all(), V3(-2.5, 4.5, bz + 10), V3(-1.6, 3.2, bz + 6.5), V3(1.5, 1.2, bz), V3(BX - 0.6, 1.1, BZ), k, { ...LK.street, fov: 42 },
        () => crowd.forEach((p, i) => holdU(p, umbs[i])));
      blit(); rain(t, 0.7, 100);
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(Wd('lunch', 9), 'ding', { gain: 0.5 }); cue(w, 'sparkle', { gain: 0.5 }); }

  // ── S10 "But then the wind came," ──
  const windCrowd = (t, flipK) => crowd.forEach((p, i) => { show(p); const side = i % 2 ? 1 : -1; p.at(side * (0.9 + (i % 3) * 0.8), 0, bz + 4 - i * 1.3);
    p.set({ legs: 'stand', mood: flipK > 0.3 ? 'shock' : 'worried', lean: -8 + Math.sin(t * 6 + i) * 3, sweat: 1, armR: [120, -30], blink: blink(t, i) }); });
  { const st = cut(10), w = Wd('wind', 10);
    add({ id: 'S10', at: st, note: 'the wind arrives: everyone leans, umbrellas strain', draw(lt, d, t, blit) {
      reset(); weather(1); barrelFill(0); const k = eo(clamp(lt / d));
      windCrowd(t, 0);
      shoot(ST.scene, all(), V3(3.2, 2.0, bz + 9.5), V3(2.8, 1.9, bz + 8.2), V3(-0.5, 1.8, bz + 1), null, k, { ...LK.street, fov: 40 },
        () => crowd.forEach((p, i) => holdU(p, umbs[i], 0, -0.25 - 0.15 * Math.sin(t * 9 + i))));
      blit(); rain(t, 0.8); wind(t, seg(t, w - 0.2, w + 0.2));
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(w, 'whoosh', { gain: 1, dur: 0.9 }); cue(w + 0.3, 'slide', { dur: 1.2, gain: 0.5 }); }

  // ── S11 "and every umbrella flipped inside out." ──
  { const st = cut(11), w = Wd('flipped', 11);
    add({ id: 'S11', at: st, note: 'every umbrella flips inside out; faces drop', draw(lt, d, t, blit) {
      reset(); weather(1); barrelFill(0); const k = eo(clamp(lt / d));
      const f = (i) => eob(seg(t, w - 0.15 + i * 0.05, w + 0.15 + i * 0.05));
      windCrowd(t, f(0));
      shoot(ST.scene, all(), V3(1.8, 2.3, bz + 7.0), V3(1.2, 2.6, bz + 5.8), V3(-0.4, 2.0, bz + 0.5), null, k, { ...LK.street, fov: 40 },
        () => crowd.forEach((p, i) => holdU(p, umbs[i], clamp(f(i), 0, 1.1), -0.2)));
      blit(); rain(t, 0.8); wind(t, 1);
    } });
    cue(st, 'whoosh', { gain: 0.5 }); for (let i = 0; i < 6; i++) cue(w - 0.1 + i * 0.08, 'pop', { gain: 0.7 }); cue(Wd('inside', 11), 'boing', { gain: 0.6 }); }

  // ── S12 "So he switched to tough ones that bend but never break." ──
  { const st = cut(12), wb = Wd('bend', 12), wn = Wd('never', 12);
    add({ id: 'S12', at: st, note: "Marlo's tough umbrella bends in the wind and springs back", draw(lt, d, t, blit) {
      reset(); weather(1); const k = eo(clamp(lt / d));
      show(marlo); marlo.at(-0.6, 0, bz + 3.2); marlo.set({ mood: t > wn ? 'proud' : 'smug', armR: [115, -35], lean: -4, blink: blink(t) });
      const bend = t < wb ? -0.1 : t < wn ? -0.55 * eo(seg(t, wb, wb + 0.3)) : -0.55 * (1 - eob(seg(t, wn, wn + 0.4)));
      shoot(ST.scene, all(), V3(1.4, 1.6, bz + 7.0), V3(0.9, 1.75, bz + 6.0), V3(-0.6, 1.8, bz + 3.2), null, k, LK.street,
        () => holdU(marlo, mU, 0, bend));
      blit(); rain(t, 0.7); wind(t, 0.8);
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(Wd('tough', 12), 'thud', { gain: 0.6 }); cue(wn + 0.05, 'boing', { gain: 0.8 }); }

  // ── S13 "Then MegaSock rolled in a giant umbrella machine," ──
  { const st = cut(13), w = Wd('machine', 13);
    add({ id: 'S13', at: st, note: "MegaSock's giant umbrella machine rolls up the street, the boss smug beside it", draw(lt, d, t, blit) {
      reset(); weather(0.6); const k = eo(clamp(lt / d)); mach.visible = true;
      const mz = lerp(bz - 14, bz - 2.5, eo(seg(t, st, w + 0.2))); mach.position.set(-1.2, 0, mz);
      show(boss); boss.at(0.4, 0, mz + 1.1); boss.set({ legs: t < w + 0.2 ? 'walk' : 'stand', phase: t * 6, mood: 'smug', armR: [60, 60], blink: blink(t) });
      show(marlo); marlo.at(BX - 0.9, 0.18, BZ + 0.6); marlo.set({ mood: t > w ? 'shock' : 'neutral', look: [-0.5, 0], blink: blink(t) });
      shoot(ST.scene, all(), V3(2.8, 1.7, bz + 7.5), V3(2.4, 2.1, bz + 6.0), V3(-0.8, 2.0, bz - 3), null, k, { ...LK.street, fov: 40 });
      blit(); rain(t, 0.4, 70);
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(st + 0.1, 'chug', { dur: w - st + 0.3, gain: 0.6 }); cue(w + 0.2, 'slam', { gain: 0.5 }); }

  // ── S14 "charging twelve dollars each." ──
  { const st = cut(14), w = Wd('twelve', 14);
    add({ id: 'S14', at: st, note: 'punch in on the $12 price; the boss smug, the crowd shocked', draw(lt, d, t, blit) {
      reset(); weather(0.6); mach.visible = true; mach.position.set(-1.2, 0, bz - 2.5); const k = eo(clamp(lt / d));
      show(boss); boss.at(0.4, 0, bz - 1.4); boss.set({ mood: 'smug', armR: [100, 40], armL: [20, 10], blink: blink(t) });
      show(crowd[0], crowd[3]); crowd[0].at(1.6, 0, bz - 0.6); crowd[3].at(0.9, 0, bz - 0.2);
      [crowd[0], crowd[3]].forEach((p, i) => p.set({ mood: t > w ? 'shock' : 'neutral', sweat: t > w ? 1 : 0, look: [-0.4, 0.1], blink: blink(t, i) }));
      shoot(ST.scene, all(), V3(0.6, 1.6, bz + 4.2), V3(-0.6, 1.3, bz + 1.8), V3(-0.6, 1.5, bz - 1.8), V3(-1.2, 1.05, bz - 1.85), k, LK.street);
      blit(); rain(t, 0.4, 70);
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(w, 'ding', { gain: 0.5 }); cue(Wd('dollars', 14), 'tock'); cue(Wd('each', 14), 'boing', { gain: 0.5 }); }

  // ── S15 "But every time you return one of Marlo's," ──
  { const st = cut(15), w = Wd('return', 15);
    add({ id: 'S15', at: st, note: 'a customer returns an umbrella at the bakery door; the baker beams', draw(lt, d, t, blit) {
      reset(); weather(0.3); const k = eo(clamp(lt / d));
      show(baker, crowd[1]); baker.at(-5.6, 0.18, bz - 0.2); crowd[1].at(-4.5, 0.18, bz + 1.1);
      const give = seg(t, w - 0.2, w + 0.3);
      crowd[1].set({ mood: 'happy', armR: [lerp(40, 85, give), -10], blink: blink(t) });
      baker.set({ mood: 'happy', armL: [lerp(20, 70, give), -10], talk: talk(t), blink: blink(t, 1) });
      shoot(ST.scene, all(), V3(-1.0, 1.6, bz + 3.4), V3(-1.6, 1.6, bz + 2.8), V3(-5.1, 1.3, bz + 0.45), null, k, LK.street,
        () => { cU.visible = true; cU.position.copy(handWorld(crowd[1], 'R')).add(V3(0.15, -0.6, 0.1)); cU.scale.setScalar(1.0); cU.rotation.set(0, 0, 0.25); });
      blit(); rain(t, 0.25, 40);
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(w, 'plop'); }

  // ── S16 "the bakery gives you a free cookie." ──
  { const st = cut(16), w = Wd('cookie', 16);
    add({ id: 'S16', at: st, note: 'the baker hands over a cookie; giant cookie pops on screen', draw(lt, d, t, blit) {
      reset(); weather(0); const k = eo(clamp(lt / d));
      show(baker, crowd[1]); baker.at(-5.6, 0.18, bz - 0.2); crowd[1].at(-4.5, 0.18, bz + 1.1);
      const got = t > w - 0.1;
      baker.set({ mood: 'laugh', armL: got ? [20, 10] : [75, -10], holdL: got ? null : PROPS.cookie, v: got ? 'a' : 'b', blink: blink(t, 1) });
      crowd[1].set({ mood: got ? 'laugh' : 'happy', armR: got ? [85, -10] : [30, 10], holdR: got ? PROPS.cookie : null, v: got ? 'c' : 'd', blink: blink(t) });
      shoot(ST.scene, all(), V3(-1.4, 1.5, bz + 3.0), V3(-1.9, 1.5, bz + 2.5), V3(-5.1, 1.3, bz + 0.45), null, k, LK.street);
      blit();
      const c = eob(seg(t, w - 0.1, w + 0.25)); if (c > 0) { ctx.save(); ctx.translate(540, 520); ctx.rotate(t * 0.6); ctx.scale(c * 2.6, c * 2.6); PROPS.cookie(ctx, 0, 40); ctx.restore();
        ctx.save(); ctx.globalAlpha = clamp(c); ctx.font = '900 96px Inter'; ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.lineWidth = 16; ctx.strokeStyle = INK; ctx.strokeText('FREE!', 540, 860); ctx.fillStyle = '#F2C230'; ctx.fillText('FREE!', 540, 860); ctx.restore(); }
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(w, 'ding'); cue(w + 0.2, 'sparkle', { gain: 0.6 }); }

  // ── S17 "So now, Marble Street actually hopes it rains." ──
  { const st = cut(17), w = Wd('rains', 17);
    add({ id: 'S17', at: st, note: 'the whole street looks up hopefully; the first drops fall; Marlo laughs', draw(lt, d, t, blit) {
      reset(); weather(t > w ? 1 : 0); const k = eio(clamp(lt / d));
      crowd.slice(0, 7).forEach((p, i) => { show(p); p.at(-2.4 + i * 0.75, 0, bz + 1.6 + (i % 2) * 0.6); p.set({ mood: t > w ? 'laugh' : 'happy', look: [0, -0.8], armL: i % 2 ? [150, 0] : [8, 6], armR: i % 3 === 0 ? [150, 0] : [8, 6], legs: t > w && i % 2 ? 'jump' : 'stand', blink: blink(t, i) }); });
      show(marlo); marlo.at(0.2, 0, bz + 3.0); marlo.set({ mood: t > w ? 'laugh' : 'smug', look: [0, -0.7], armL: [150, 0], armR: [150, 0], legs: t > w ? 'jump' : 'stand', blink: blink(t) });
      shoot(ST.scene, all(), V3(0.2, 1.0, bz + 9.0), V3(0.2, 1.6, bz + 7.2), V3(0, 2.4, bz + 1), V3(0, 2.2, bz + 2), k, { ...LK.street, fov: 44 });
      blit(); rain(t, seg(t, w - 0.1, w + 0.4));
    } });
    cue(st, 'whoosh', { gain: 0.5 }); cue(Wd('hopes', 17), 'chirp', { dur: 1.0, gain: 0.5 }); cue(w, 'sizzle', { dur: 2.0, gain: 0.5 }); cue(w + 0.1, 'boing', { gain: 0.6 }); }

  return { shots: S, cues: CUES };
}
