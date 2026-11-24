import json, os, re, sys
import numpy as np, sherpa_onnx, soundfile as sf

ROOT = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(ROOT, 'voice/kokoro-en-v0_19')
# scene id, spoken text, caption text ("token|weight" overrides timing weight; *token = yellow)
P = [
 ('A',"Marlo forgot his best friend's birthday.","Marlo *forgot his best friend's *birthday."),
 ('A2','That mistake made him a millionaire.','That *mistake made him a *millionaire.'),
 ('B','Theo stopped talking to him. For a whole week.','Theo *stopped talking to him. For a whole *week.'),
 ('C','Marlo texted sorry. Seen. No reply.','Marlo texted *sorry. *Seen. No *reply.'),
 ('D','So he baked a cake, and wrote sorry on top. In giant letters.','So he baked a *cake, and wrote *sorry on top. In *giant letters.'),
 ('D2','Theo opened the door, and laughed. Friends again.','Theo opened the door, and *laughed. *Friends again.'),
 ('E','Then Marlo looked around Marble Street.','Then Marlo looked around *Marble *Street.'),
 ('E2','Everyone was mad at someone.','Everyone was *mad at *someone.'),
 ('F',"And that's when the marble dropped.","And that's when the *marble *dropped."),
 ('G','Saying sorry is hard. Eating cake is easy.','Saying sorry is *hard. Eating cake is *easy.'),
 ('H','So he opened The Sorry Cake. Any apology, in icing. Ten dollars.','So he opened *The *Sorry *Cake. Any apology, in *icing. *$10|10 dollars.'),
 ('I','By spring, he was baking forty sorries a day.','By spring, he was baking *40|7 sorries a day.'),
 ('J','Then his oven broke.','Then his oven *broke.'),
 ('J2','Fifty orders. Zero cakes.','*50|7 orders. *Zero cakes.'),
 ('K','So Marlo knocked on all fifty doors, and said sorry in person.','So Marlo knocked on all *50|7 doors, and said sorry *in *person.'),
 ('K2','He even apologized for the late sorry.','He even apologized for the *late *sorry.'),
 ('L','People loved it. The marble dropped again.','People *loved it. The *marble dropped *again.'),
 ('M','Now Marlo delivers every cake, and reads the sorry out loud.','Now Marlo *delivers every cake, and reads the sorry *out *loud.'),
 ('M2','Triple the price. Sold out every Friday.','*Triple the price. *Sold *out every Friday.'),
 ('N','Then MegaSock launched a sorry app. Ninety-nine cents a sorry.','Then *MegaSock launched a sorry *app. *99|8 cents a sorry.'),
 ('N2','It sent ten thousand sorries. Nobody forgave anybody.','It sent *10,000|10 sorries. *Nobody forgave anybody.'),
 ('O',"By summer, MegaSock's own boss was buying Marlo's cakes.","By summer, MegaSock's *own *boss was buying Marlo's cakes."),
 ('Q','Today, The Sorry Cake has a line around the block.','Today, The Sorry Cake has a *line around the *block.'),
 ('R',"Last week, it was Theo's birthday again.","Last week, it was Theo's *birthday *again."),
 ('S','Marlo remembered.','Marlo *remembered.'),
 ('S2','Theo still asked for a sorry cake.','Theo *still asked for a *sorry *cake.'),
 ('Z', 'One forgotten birthday. A million dollars. Because Marlo sold the one word everyone finds hard to say.', 'One forgotten birthday. A *million *dollars. Because Marlo sold the *one *word everyone finds *hard to say.'),
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
