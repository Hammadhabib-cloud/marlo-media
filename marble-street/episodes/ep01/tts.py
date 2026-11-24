import json, os, re, sys
import numpy as np, sherpa_onnx, soundfile as sf

ROOT = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(ROOT, 'voice/kokoro-en-v0_19')
# scene id, spoken text, caption text ("token|weight" overrides timing weight; *token = yellow)
P = [
 ('A',"Marlo's washing machine ate one sock.","Marlo's washing machine ate *one *sock."),
 ('A2','That sock made him a millionaire.','That sock made him a *millionaire.'),
 ('B','Two socks in. One sock out. Every single week.','*Two socks in. *One sock out. Every single week.'),
 ('C','Marlo opened his drawer. Twelve socks. Zero pairs.','Marlo opened his drawer. *12|8 socks. *Zero pairs.'),
 ('D',"Then he looked up at the neighbors' washing lines. Single socks. Everywhere.","Then he looked up at the neighbors' washing lines. *Single socks. *Everywhere."),
 ('E',"And that's when the marble dropped.","And that's when the *marble *dropped."),
 ('F','If everyone has one sock, somebody out there has the other one.','If everyone has one sock, somebody out there has the *other *one.'),
 ('G','So he put a box on his doorstep. The Sock Exchange. Drop in your lonely sock, pay one dollar, take the one that matches.','So he put a box on his doorstep. The *Sock *Exchange. Drop in your lonely sock, pay *$1|8 take the one that *matches.'),
 ('H','By Friday he had four hundred socks.','By Friday he had *400|10 socks.'),
 ('H2','And not one match.','And not *one *match.'),
 ('I','People wanted their money back.','People wanted their *money *back.'),
 ('I2','Marlo was ready to shut it all down.','Marlo was ready to *shut it all down.'),
 ('J','Then a kid walked past wearing one striped sock and one spotted sock.','Then a kid walked past wearing one *striped sock and one *spotted sock.'),
 ('J2','Everybody stared.','Everybody *stared.'),
 ('J3','By Monday, the whole school wanted them.','By *Monday, the whole school *wanted them.'),
 ('K','The marble dropped again.','The *marble dropped *again.'),
 ('L','Marlo stopped matching socks. He started selling socks that do not match. On purpose.','Marlo *stopped matching socks. He started selling socks that do *not match. On *purpose.'),
 ('M','Same socks. New sign. Twelve dollars a pair.','Same socks. New sign. *$12|10 a pair.'),
 ('N','Then MegaSock copied him. Cheaper. In every store.','Then *MegaSock copied him. *Cheaper. In every store.'),
 ('O','So Marlo did the one thing they could not.','So Marlo did the one thing they *could *not.'),
 ('O2','He mailed people one sock a month.','He mailed people *one *sock a month.'),
 ('O3','Want the other one? Come back next month.','Want the *other one? Come back *next *month.'),
 ('P','People who used to lose one sock by accident were now paying to own one sock on purpose.','People who used to lose one sock by *accident were now paying to own one sock on *purpose.'),
 ('Q','Today, Marlo owns half of Marble Street.','Today, Marlo owns *half of Marble Street.'),
 ('R','And last week, he moved his washing machine.','And last week, he moved his *washing *machine.'),
 ('R2','There it was. The sock.','There it was. *The *sock.'),
 ('S','Marlo looked at it for a long time.','Marlo looked at it for a *long *time.'),
 ('S2','Then he pushed the machine back.','Then he *pushed the machine *back.'),
 ('Z', 'One lost sock. A million dollars. Because Marlo sold the problem everyone else ignored.', 'One lost sock. A *million *dollars. Because Marlo sold the *problem everyone else *ignored.'),
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
