import json, os, re, sys
import numpy as np, sherpa_onnx, soundfile as sf

ROOT = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(ROOT, 'voice/kokoro-en-v0_19')
# scene id, spoken text, caption text ("token|weight" overrides timing weight; *token = yellow)
P = [
 ('A',"Marlo's phone died at one percent.","Marlo's phone *died at *1%|14."),
 ('A2','That dead phone made him a millionaire.','That *dead *phone made him a *millionaire.'),
 ('B','No calls. No map. No music. For six hours.','No *calls. No *map. No *music. For *six *hours.'),
 ('C','Every shop on the street had the same sign. No charging.','Every shop on the street had the same *sign. *No *charging.'),
 ('D','So he dragged his old bike outside, and wired it to a charger.','So he dragged his old *bike outside, and wired it to a *charger.'),
 ('D2','Ten minutes of pedaling. Fifty percent.','*Ten minutes of pedaling. *50%|14.'),
 ('E','Then Marlo looked around Marble Street.','Then Marlo looked around *Marble *Street.'),
 ('E2',"Everyone's phone was dying.","*Everyone's phone was *dying."),
 ('F',"And that's when the marble dropped.","And that's when the *marble *dropped."),
 ('G',"Batteries die. Legs don't.","Batteries *die. Legs *don't."),
 ('H','So he opened Pedal Power. Ten minutes, full charge. Two dollars.','So he opened *Pedal *Power. Ten minutes, *full *charge. *$2|9 dollars.'),
 ('I','By spring, he had twelve bikes on the sidewalk.','By spring, he had *12|7 bikes on the *sidewalk.'),
 ('J','Then, in July, the heatwave hit.','Then, in *July, the *heatwave *hit.'),
 ('J2','Nobody wanted to pedal. Zero riders.','*Nobody wanted to pedal. *Zero riders.'),
 ('K','So Marlo pedaled for them, while they sat in the shade.','So Marlo *pedaled *for *them, while they sat in the *shade.'),
 ('K2','He even handed out free lemonade.','He even handed out *free *lemonade.'),
 ('L','They all came back. The marble dropped again.','They all *came *back. The *marble dropped *again.'),
 ('M','Now riders race each other while they charge.','Now riders *race each other while they *charge.'),
 ('M2','Five dollars a race. Sold out every Friday.','*$5|9 dollars a race. *Sold *out every Friday.'),
 ('N','Then MegaSock built a robot charging tower. Fifty cents a charge.','Then *MegaSock built a *robot charging tower. *50|7 cents a charge.'),
 ('N2',"On day one, the robot's own battery died.","On day one, the robot's *own *battery *died."),
 ('O',"By summer, MegaSock's own boss was pedaling at Marlo's.","By summer, MegaSock's *own *boss was *pedaling at Marlo's."),
 ('Q','Today, Pedal Power has a line around the block.','Today, Pedal Power has a *line around the *block.'),
 ('R',"Last week, Marlo's phone died again.","Last week, Marlo's phone *died *again."),
 ('S','He just smiled.','He just *smiled.'),
 ('S2','And hopped on a bike.','And hopped on a *bike.'),
 ('Z', 'One dead phone. A million dollars. Because Marlo turned tired legs into power.', 'One dead phone. A *million *dollars. Because Marlo turned tired *legs into *power.'),
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
