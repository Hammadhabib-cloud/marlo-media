import json, os, re, sys
import numpy as np, sherpa_onnx, soundfile as sf

ROOT = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(ROOT, 'voice/kokoro-en-v0_19')
# scene id, spoken text, caption text ("token|weight" overrides timing weight; *token = yellow)
P = [
 ('A',"Marlo stood in line for three hours.","Marlo stood in line for *three *hours."),
 ('A2','That line made him a millionaire.','That line made him a *millionaire.'),
 ('B','Forty people. One open window.','*40|8 people. *One open window.'),
 ('C','After two hours, he had moved four feet.','After *two hours, he had moved *four feet.'),
 ('D','Then a woman in a hurry offered him twenty dollars for his spot.','Then a woman in a *hurry offered him *$20|10 for his spot.'),
 ('D2','Twenty dollars. For standing.','*$20|9 For *standing.'),
 ('D3','He looked down the street. Lines. Everywhere.','He looked down the street. *Lines. *Everywhere.'),
 ('E',"And that's when the marble dropped.","And that's when the *marble *dropped."),
 ('F','Everybody hates waiting. So somebody should get paid to do it.','Everybody *hates waiting. So somebody should get *paid to do it.'),
 ('G',"So he hung a sign on his door. Standing Room. We wait, so you don't.","So he hung a sign on his door. *Standing *Room. We wait, so you *don't."),
 ('H','By Friday he had ten standers in ten lines.','By Friday he had *10|8 standers in ten lines.'),
 ('H2','Then he sent two of them to the same spot.','Then he sent two of them to the *same *spot.'),
 ('I','One push. The whole line went down.','One *push. The whole line went *down.'),
 ('I3','Marlo hung up the closed sign and sat down.','Marlo hung up the *closed sign and sat down.'),
 ('J','When he looked up, there was a line.','When he looked up, there was a *line.'),
 ('J2','A line of people, waiting to hire someone to wait.','A line of people, waiting to *hire someone to *wait.'),
 ('K','The marble dropped again.','The *marble dropped *again.'),
 ('L','Marlo hired every single person in it.','Marlo *hired every single person in it.'),
 ('M','Same people. New vests. Double the price.','Same people. New vests. *Double the *price.'),
 ('N','Then MegaSock came back with an app. Skip any line for one dollar.','Then *MegaSock came back with an *app. Skip any line for *$1|8'),
 ('O','So Marlo did the hardest thing of all.','So Marlo did the *hardest thing of all.'),
 ('O2','He waited.','He *waited.'),
 ('O3','On Monday morning, the app crashed.','On Monday morning, the app *crashed.'),
 ('P','The help desk line went around the block.','The help desk line went *around the *block.'),
 ('P2','Guess who everybody paid to stand in it.','Guess who everybody *paid to stand in it.'),
 ('Q','Today, Marlo owns the other half of Marble Street.','Today, Marlo owns the *other *half of Marble Street.'),
 ('R','Last week, he went back to that office.','Last week, he went back to *that *office.'),
 ('R2','Forty people. One open window.','*40|8 people. *One open window.'),
 ('S','Marlo looked at it for a long time.','Marlo looked at it for a *long *time.'),
 ('S2','Then he paid a kid twenty dollars and went home.','Then he paid a kid *$20|10 and went *home.'),
 ('Z', 'Three hours in line. A million dollars. Because Marlo sold the one thing nobody wants to do. Wait.', 'Three hours in line. A *million *dollars. Because Marlo sold the one thing nobody wants to do. *Wait.'),
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
