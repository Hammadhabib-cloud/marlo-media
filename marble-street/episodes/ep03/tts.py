import json, os, re, sys
import numpy as np, sherpa_onnx, soundfile as sf

ROOT = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(ROOT, 'voice/kokoro-en-v0_19')
# scene id, spoken text, caption text ("token|weight" overrides timing weight; *token = yellow)
P = [
 ('A',"Marlo killed his neighbor's fern.","Marlo *killed his neighbor's *fern."),
 ('A2','That dead fern made him a millionaire.','That dead fern made him a *millionaire.'),
 ('B','Mrs. Lee went away for two weeks. All he had to do was water it.','Mrs. Lee went away for *two *weeks. All he had to do was *water it.'),
 ('C','Day one. He forgot. Day two. He forgot.','Day *one. He *forgot. Day *two. He *forgot.'),
 ('C2','Day fourteen. He remembered.','Day *fourteen. He *remembered.'),
 ('D','Mrs. Lee came home.','Mrs. Lee came *home.'),
 ('D2','Then Marlo noticed suitcases on every doorstep, and plants in every window.','Then Marlo noticed *suitcases on every doorstep, and *plants in every window.'),
 ('E',"And that's when the marble dropped.","And that's when the *marble *dropped."),
 ('F',"People go on holiday. Plants can't.","People go on *holiday. Plants *can't."),
 ('G','So he turned his house into a hotel. For plants. Five dollars a night.','So he turned his house into a *hotel. For *plants. *$5|10 a night.'),
 ('H','By July, he had sixty guests.','By July, he had *60|8 guests.'),
 ('I','Then came the hottest week of the year.','Then came the *hottest week of the year.'),
 ('I2','Every single guest wilted.','Every single guest *wilted.'),
 ('I3','And sixty owners were coming home.','And *60|8 owners were coming *home.'),
 ('J','So Marlo carried every plant to the shade of the park.','So Marlo carried *every plant to the *shade of the park.'),
 ('J2','And sent each owner a photo.','And sent each owner a *photo.'),
 ('J3','Your fern, relaxing in the park.','Your fern, *relaxing in the park.'),
 ('K','The owners loved it. The marble dropped again.','The owners *loved it. The *marble dropped *again.'),
 ('L','Now every guest gets a holiday too.','Now every guest gets a *holiday *too.'),
 ('L2','The beach. The museum. The mountains.','The *beach. The *museum. The *mountains.'),
 ('M','Postcard rooms cost triple. They sold out in a day.','Postcard rooms cost *triple. They *sold *out in a day.'),
 ('N','Then MegaSock opened a robot plant hotel. Ninety-nine cents a night.','Then *MegaSock opened a *robot plant hotel. *99|8 cents a night.'),
 ('N2','The robots never forgot to water. But they never sent a single postcard.','The robots *never forgot to water. But they never sent a single *postcard.'),
 ('O',"By August, MegaSock's own staff were booking Marlo's rooms.","By August, MegaSock's *own *staff were booking Marlo's rooms."),
 ('Q','Today, the Plant Hotel has a waiting list until next summer.','Today, the Plant Hotel has a *waiting *list until next summer.'),
 ('R','Last week, Mrs. Lee went away again.','Last week, Mrs. Lee went away *again.'),
 ('S','She asked Marlo to water her new fern.','She asked Marlo to *water her new fern.'),
 ('S2','He set fourteen alarms.','He set *fourteen *alarms.'),
 ('Z', 'One dead fern. A million dollars. Because Marlo turned his worst mistake into something people pay for.', 'One dead fern. A *million *dollars. Because Marlo turned his *worst *mistake into something people *pay for.'),
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
