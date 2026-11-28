import json, os, re, sys
import numpy as np, sherpa_onnx, soundfile as sf

ROOT = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(ROOT, 'voice/kokoro-en-v0_19')
# scene id, spoken text, caption text ("token|weight" overrides timing weight; *token = yellow)
P = [
 ('A','Marlo\'s car was frozen solid. At seven AM.','Marlo\'s car was *frozen *solid. At *7|6 *AM.'),
 ('A2','That frozen car made him a millionaire.','That *frozen *car made him a *millionaire.'),
 ('B','No scraper. So he used his library card.','No *scraper. So he used his *library *card.'),
 ('C','Twenty minutes later, he could see. Barely.','*20|8 minutes later, he could *see. *Barely.'),
 ('D','His boss took fifty dollars off his pay.','His *boss took *$50|10 off his *pay.'),
 ('E','The next morning, his neighbour was scraping too.','The next morning, his *neighbour was *scraping too.'),
 ('E2','Then the whole street. Every single car.','Then the *whole *street. *Every single *car.'),
 ('F',"And that's when the marble dropped.","And that's when the *marble *dropped."),
 ('G','Nobody wants to scrape ice at seven AM. But everyone has to.','*Nobody wants to scrape ice at *7|6 *AM. But *everyone *has to.'),
 ('H','So he opened No Scrape. Marlo clears your car before you wake up. Three dollars a car.','So he opened *No *Scrape. Marlo clears your car *before you *wake up. *$3|9 a car.'),
 ('I','By December, he was clearing two hundred cars a morning.','By *December, he was clearing *200|11 cars a *morning.'),
 ('J','Then came the biggest freeze in fifty years.','Then came the *biggest *freeze in *50|7 years.'),
 ('J2','Two hundred frozen cars. And his scraper snapped.','*200|11 frozen cars. And his scraper *snapped.'),
 ('K','So Marlo stayed up all night, and threw a blanket over every windshield.','So Marlo stayed up *all *night, and threw a *blanket over *every windshield.'),
 ('K2','By sunrise, not one car had ice.','By *sunrise, *not *one car had *ice.'),
 ('L','Every car was ready. The marble dropped again.','Every car was *ready. The *marble dropped *again.'),
 ('M','Then he added Warm Start. A blanket every night, hot cocoa every morning.','Then he added *Warm *Start. A *blanket every night, hot *cocoa every morning.'),
 ('M2','Five dollars a week. Sold out in a day.','*$5|9 a week. *Sold *out in a *day.'),
 ('N','Then MegaSock launched robot defrost drones. Hot air from the sky.','Then *MegaSock launched *robot defrost *drones. Hot air from the *sky.'),
 ('N2','On day one, the drones froze solid, and dropped onto the cars.','On day one, the drones *froze *solid, and *dropped onto the cars.'),
 ('O',"By morning, MegaSock's own workers were lining up at Marlo's door.","By morning, MegaSock's *own *workers were lining up at *Marlo's door."),
 ('Q','Today, No Scrape has a waiting list around the block.','Today, No Scrape has a *waiting *list around the *block.'),
 ('R','This morning, it was minus ten.','This morning, it was *minus *ten.'),
 ('S','Marlo just smiled.','Marlo just *smiled.'),
 ('S2','One blanket off. Zero scraping. Zero minutes late.','One *blanket off. *Zero scraping. *Zero minutes *late.'),
 ('Z', 'One frozen car. A million dollars. Because Marlo hated scraping.', 'One frozen car. A *million *dollars. Because Marlo *hated *scraping.'),
]
SID = int(sys.argv[1]) if len(sys.argv) > 1 else 9
SPEED = float(sys.argv[2]) if len(sys.argv) > 2 else 1.08
cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
    kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(model=f'{M}/model.onnx', voices=f'{M}/voices.bin',
        tokens=f'{M}/tokens.txt', data_dir=f'{M}/espeak-ng-data'), num_threads=2))
tts = sherpa_onnx.OfflineTts(cfg)
SR = 24000
out, t, tl = [], 0.06, []
out.append(np.zeros(int(.06*SR)))
def squeeze(x, keep=.06, mx=.1):
    # shorten any silence inside a line to keep the delivery tight
    q = np.abs(x) > .008; w = int(.012*SR); q = np.convolve(q, np.ones(w), 'same') > 0
    o, i, n = [], 0, len(x)
    while i < n:
        j = i
        while j < n and q[j] == q[i]: j += 1
        seg = x[i:j]
        if not q[i] and (j - i) > mx*SR: seg = np.concatenate([seg[:int(keep/2*SR)], seg[-int(keep/2*SR):]])
        o.append(seg); i = j
    return np.concatenate(o)
for i,(sc,sp,cap) in enumerate(P):
    a = tts.generate(sp, sid=SID, speed=SPEED)
    x = np.array(a.samples, dtype=np.float32)
    e = np.abs(x) > .01
    idx = np.where(e)[0]
    x = squeeze(x[max(idx[0]-120,0):min(idx[-1]+480,len(x))])
    dur = len(x)/SR
    toks = []
    for raw in cap.split():
        hl = raw.startswith('*'); raw = raw.lstrip('*')
        w = None
        if '|' in raw: raw, w = raw.split('|'); w = float(w)
        if w is None: w = len(re.sub(r'\W','',raw)) + 2
        toks.append((raw, hl, w))
    tot = sum(w for *_,w in toks); c = t; words = []
    for tx, hl, w in toks:
        d = dur*w/tot; words.append({'t':round(c,3),'d':round(d,3),'w':tx,'hl':hl}); c += d
    tl.append({'scene':sc,'start':round(t,3),'end':round(t+dur,3),'words':words,'text':sp})
    out.append(x); t += dur
    p = {'Z':.0}.get(sc,.03)
    out.append(np.zeros(int(p*SR))); t += p
v = np.concatenate(out)
sf.write(os.path.join(ROOT,'vo.wav'), v, SR)
scs = {}
for r in tl:
    s = scs.setdefault(r['scene'],{'id':r['scene'],'start':r['start'],'end':r['end']}); s['end'] = r['end']
order = list(scs.values())
for a,b in zip(order, order[1:]): a['end'] = b['start']
order[-1]['end'] = round(t+.55,3)
order[0]['start'] = 0
json.dump({'phrases':tl,'scenes':order,'dur':order[-1]['end']}, open(os.path.join(ROOT,'timeline.json'),'w'), indent=0)
print('total', order[-1]['end'], 'words', sum(len(r['text'].split()) for r in tl))
for s in order: print(s['id'], round(s['end']-s['start'],2))
