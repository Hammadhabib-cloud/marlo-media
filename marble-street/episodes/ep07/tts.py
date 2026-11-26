import json, os, re, sys
import numpy as np, sherpa_onnx, soundfile as sf

ROOT = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(ROOT, 'voice/kokoro-en-v0_19')
# scene id, spoken text, caption text ("token|weight" overrides timing weight; *token = yellow)
P = [
 ('A','Marlo waited all day for one package.','Marlo waited *all *day for *one *package.'),
 ('A2','That package made him a millionaire.','That *package made him a *millionaire.'),
 ('B','He stepped out for two minutes. Just two.','He stepped out for *two *minutes. Just *two.'),
 ('C','He came back to a note. Sorry we missed you.','He came back to a *note. *Sorry *we *missed *you.'),
 ('D','His package? Back at a warehouse, an hour away.','His package? Back at a *warehouse, an *hour *away.'),
 ('E','Then he looked around Marble Street.','Then he looked around *Marble *Street.'),
 ('E2','Every door had the same note.','*Every *door had the *same *note.'),
 ('F',"And that's when the marble dropped.","And that's when the *marble *dropped."),
 ('G',"Everyone's at work. Marlo's always home.","Everyone's at *work. Marlo's *always *home."),
 ('H','So he opened Porch Seven. Send your parcels to his house. One dollar a box.','So he opened *Porch *7|7. Send your parcels to *his *house. *$1|9 a box.'),
 ('I','By spring, he was holding three hundred boxes a week.','By spring, he was holding *300|9 boxes a *week.'),
 ('J','Then came December. The busiest month of the year.','Then came *December. The *busiest month of the *year.'),
 ('J2','A mountain of boxes. Nobody could find theirs.','A *mountain of boxes. *Nobody could *find theirs.'),
 ('K','So Marlo loaded his wagon, and delivered every box himself.','So Marlo loaded his *wagon, and *delivered every box *himself.'),
 ('K2','At dinner time, when everyone was finally home.','At *dinner *time, when everyone was *finally *home.'),
 ('L','They all came back. The marble dropped again.','They all *came *back. The *marble dropped *again.'),
 ('M','Now he gift wraps them too.','Now he *gift *wraps them too.'),
 ('M2','Three dollars a box. Sold out every December.','*$3|9 dollars a box. *Sold *out every December.'),
 ('N','Then MegaSock built robot parcel lockers. Totally free.','Then *MegaSock built *robot parcel *lockers. Totally *free.'),
 ('N2','On day one, every locker jammed shut. With the parcels inside.','On day one, every locker *jammed *shut. With the *parcels *inside.'),
 ('O',"By Christmas, MegaSock's own boss was sending his parcels to Marlo.","By Christmas, MegaSock's *own *boss was sending his parcels to *Marlo."),
 ('Q','Today, Porch Seven has a waiting list around the block.','Today, Porch 7 has a *waiting *list around the *block.'),
 ('R',"Last week, Marlo found that note on his door again.","Last week, Marlo found *that *note on his door *again."),
 ('S','He just laughed.','He just *laughed.'),
 ('S2','It said: your parcel is at house seven.','It said: your parcel is at *house *7|7.'),
 ('Z', 'One missed package. A million dollars. Because Marlo was always home.', 'One missed package. A *million *dollars. Because Marlo was *always *home.'),
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
