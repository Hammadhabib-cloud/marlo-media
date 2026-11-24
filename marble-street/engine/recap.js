// Series ending: a recap card that says what the business was, then a follow prompt.
import { prog, eo, back, lerp, camTo } from './world.js';
import { marlo } from './marlo.js';
import { street, tickGutter, PAT } from './sets.js';
const W = 1080;
function fit(g, t, maxw, fs) { g.font = `${fs}px "Archivo Black"`; while (g.measureText(t).width > maxw) { fs *= .96; g.font = `${fs}px "Archivo Black"`; } return fs; }
export function recap(rows, signs = []) {
  return () => {
    const w = street({ signs }); w.houses.forEach(h => { if (h.userData.sign) h.userData.sign.position.y = 4.8; });
    const m = marlo({ sockL: PAT.stripe(), sockR: PAT.dots() }); m.position.set(0, 0, .2); w.scene.add(m);
    return { w, update(t, d) {
      tickGutter(w, t * 2); m.pose({ mood: 'happy', armL: [2.3, .55], armR: [2.3, .55], head: [0, -.05, 0], lift: Math.abs(Math.sin(t * 5)) * .12 });
      camTo(w, [0, 3.4, 15], [0, 3.6, 17.5], [0, 3.6, -1], [0, 3.8, -1], t / d);
    }, overlay(g, t, d) {
      const f = eo(prog(t, 0, .25)); g.fillStyle = `rgba(8,12,28,${.5 * f})`; g.fillRect(0, 0, W, 1920);
      const top = 300, bot = 1060, x0 = 80, x1 = 1000, s = lerp(.9, 1, back(prog(t, 0, .3)));
      g.save(); g.translate(540, (top + bot) / 2); g.scale(s, s); g.translate(-540, -(top + bot) / 2); g.globalAlpha = f;
      g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 40; g.shadowOffsetY = 14; g.fillStyle = 'rgba(11,18,36,.94)'; g.beginPath(); g.roundRect(x0, top, x1 - x0, bot - top, 54); g.fill(); g.shadowColor = 'transparent';
      g.lineWidth = 7; g.strokeStyle = '#f5b700'; g.stroke();
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#9fb3c8'; g.font = '36px "Archivo Black"'; g.fillText('THE BUSINESS', 540, top + 62);
      const cols = ['#e4572e', '#2e86ff', '#f5b700'], names = ['PROBLEM', 'IDEA', 'RESULT'];
      rows.forEach((r, i) => {
        const a = d * (.04 + i * .2), p = prog(t, a, a + .3); if (p <= 0) return; const y = top + 165 + i * 215, k = back(p);
        g.save(); g.globalAlpha = Math.min(1, p * 2); g.translate(540, y); g.scale(k, k);
        g.font = '30px "Archivo Black"'; const lw = g.measureText(names[i]).width + 50; g.fillStyle = cols[i]; g.beginPath(); g.roundRect(-lw / 2, -30, lw, 60, 30); g.fill();
        g.fillStyle = i === 2 ? '#14213d' : '#ffffff'; g.fillText(names[i], 0, 3);
        const fs = fit(g, r, 820, i === 2 ? 96 : 64);
        if (i === 2) { const gr = g.createLinearGradient(0, 40, 0, 40 + fs); gr.addColorStop(0, '#fff07a'); gr.addColorStop(.5, '#ffc400'); gr.addColorStop(1, '#f08a00'); g.fillStyle = gr; } else g.fillStyle = '#ffffff';
        g.fillText(r, 0, 38 + fs * .55); g.restore();
      });
      g.restore();
      const b = prog(t, d * .72, d * .72 + .3); if (b > 0) { const k = back(b); g.save(); g.translate(540, 1500); g.scale(k, k); g.rotate(-.02); const tx = "FOLLOW FOR TOMORROW'S BUSINESS"; fit(g, tx, 860, 46); const tw = g.measureText(tx).width + 70;
        g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 20; g.fillStyle = '#fbf7ee'; g.beginPath(); g.roundRect(-tw / 2, -48, tw, 96, 48); g.fill(); g.shadowColor = 'transparent'; g.lineWidth = 6; g.strokeStyle = '#e4572e'; g.stroke(); g.fillStyle = '#14213d'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(tx, 0, 4); g.restore(); }
    } };
  };
}
