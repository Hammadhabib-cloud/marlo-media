import json, os, re, sys
import numpy as np, sherpa_onnx, soundfile as sf

ROOT = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(ROOT, 'voice/kokoro-en-v0_19')
# scene id, spoken text, caption text ("token|weight" overrides timing weight; *token = yellow)
P = [
 ('A','Marlo locked himself out. At midnight.','Marlo *locked himself *out. At *midnight.'),
 ('A2','That locked door made him a millionaire.','That *locked *door made him a *millionaire.'),
 ('B','His keys? Right there, on the kitchen table.','His *keys? Right *there, on the *kitchen *table.'),
 ('C','The locksmith showed up three hours later.','The *locksmith showed up *three *hours later.'),
 ('D','And charged him two hundred dollars.','And charged him *$200|12 dollars.'),
 ('E','The next week, his neighbour got locked out.','The next week, his *neighbour got *locked *out.'),
 ('E2','Then another. And another.','Then *another. And *another.'),
 ('F',"And that's when the marble dropped.","And that's when the *marble *dropped."),
 ('G','Everyone needs a spare key. Nobody has a safe place for it.','Everyone needs a *spare *key. *Nobody has a *safe *place for it.'),
 ('H','So he opened Key Keeper. Leave your spare key with Marlo. Two dollars a month.','So he opened *Key *Keeper. Leave your spare key with *Marlo. *$2|9 a month.'),
 ('I','By summer, he was keeping four hundred keys.','By summer, he was keeping *400|11 keys.'),
 ('J','Then one night, the key board crashed off the wall.','Then one night, the key board *crashed off the *wall.'),
 ('J2','Four hundred keys. All mixed up.','*400|11 keys. All *mixed *up.'),
 ('K','So Marlo tried every key, in every door, all night long.','So Marlo tried *every *key, in *every *door, all night *long.'),
 ('K2','And tied a coloured marble to each one.','And tied a *coloured *marble to *each one.'),
 ('L','Every key found its door. The marble dropped again.','Every key found its *door. The *marble dropped *again.'),
 ('M','Then he added midnight rescue. Locked out? He walks it over.','Then he added *midnight *rescue. Locked out? He *walks it *over.'),
 ('M2','Five dollars a month. Sold out in a day.','*$5|9 a month. *Sold *out in a *day.'),
 ('N','Then MegaSock launched robot smart locks. Open your door with an app.','Then *MegaSock launched *robot smart *locks. Open your door with an *app.'),
 ('N2','On day one, the app crashed. Every door locked tight.','On day one, the app *crashed. *Every *door locked *tight.'),
 ('O',"By morning, MegaSock's own boss was knocking on Marlo's door.","By morning, MegaSock's *own *boss was knocking on *Marlo's door."),
 ('Q','Today, Key Keeper has a waiting list around the block.','Today, Key Keeper has a *waiting *list around the *block.'),
 ('R','Last week, Marlo locked himself out again.','Last week, Marlo *locked himself *out *again.'),
 ('S','He just laughed.','He just *laughed.'),
 ('S2','Spare key number seven. Thirty seconds. Zero dollars.','Spare key number *7|7. *30|7 seconds. *Zero *dollars.'),
 ('Z', 'One locked door. A million dollars. Because Marlo kept the spare.', 'One locked door. A *million *dollars. Because Marlo *kept the *spare.'),
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
