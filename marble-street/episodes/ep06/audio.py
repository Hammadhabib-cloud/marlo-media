"""Very soft background bed + light effects under the voice. Original synthesis."""
import json, os
import numpy as np, soundfile as sf
R = os.path.dirname(os.path.abspath(__file__)); SR = 44100
T = json.load(open(f'{R}/timeline.json')); D = T['dur']; N = int((D + .1) * SR)
vo, vsr = sf.read(f'{R}/vo.wav'); vo = np.interp(np.arange(0, len(vo) * SR / vsr) * vsr / SR, np.arange(len(vo)), vo)
vo = np.pad(vo, (0, max(0, N - len(vo))))[:N]
rng = np.random.default_rng(7)
def env(n, a, r):
    t = np.arange(n) / SR; return np.minimum(t / a, 1) * np.exp(-t / r)
def add(b, s, t, g=1):
    i = int(t * SR); j = min(len(b), i + len(s))
    if 0 <= i < len(b) and j > i: b[i:j] += s[:j - i] * g
def felt(f, dur=2.2):  # soft felt-piano style note: no bright harmonics
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2*np.pi*f*t) + .16*np.sin(4*np.pi*f*t)) * env(n, .03, .9)
# ---- music: only slow felt notes, no drums and no bass
M = np.zeros(N)
beat = 60 / 76
prog = [[220, 261.63, 329.63], [174.61, 220, 261.63], [196, 246.94, 293.66], [164.81, 220, 261.63]]
sc = {s['id']: s for s in T['scenes']}
t, b = 0, 0
while t < D - 1.2:
    ch = prog[b % 4]
    for k, off in enumerate([0, 1.5, 2, 3.5]):
        add(M, felt(ch[(k + b) % 3]), t + off * beat, .5 if k == 0 else .34)
    t += 4 * beat; b += 1
# low-pass to take off any edge
k = int(.0016 * SR); M = np.convolve(M, np.ones(k) / k, 'same')
# ---- effects, kept light
S = np.zeros(N)
def tok(f=520, g=1):  # marble on head
    n = int(.13 * SR); t = np.arange(n) / SR; return (np.sin(2*np.pi*f*t) + .4*np.sin(2*np.pi*f*2.3*t)) * env(n, .001, .025) * g
def clink(f=2100):
    n = int(.42 * SR); t = np.arange(n) / SR; return (np.sin(2*np.pi*f*t) + .55*np.sin(2*np.pi*f*1.52*t)) * env(n, .001, .1)
def thump():
    n = int(.3 * SR); t = np.arange(n) / SR; return np.sin(2*np.pi*(58*t + 40*(1-np.exp(-t*30))/30*2)) * env(n, .002, .09)
def puff(l=.22):
    n = int(l * SR); x = rng.normal(0, 1, n); x = np.convolve(x, np.ones(30)/30, 'same'); return x * np.sin(np.pi*np.arange(n)/n) * 3
def rumble(l):
    n = int(l * SR); t = np.arange(n) / SR; return np.sin(2*np.pi*52*t) * (1 + .4*np.sin(2*np.pi*11*t)) * np.minimum(t/.1, 1) * np.minimum((l-t)/.15, 1)
def slide(f0, f1, l=.5):
    n = int(l * SR); t = np.arange(n)/SR; ph = np.cumsum(np.interp(t,[0,l],[f0,f1]))/SR*2*np.pi; return (np.sin(ph)+.3*np.sin(2*ph)) * np.minimum(t/.02,1)*np.minimum((l-t)/.08,1)
def whoosh(l=.32):
    n = int(l * SR); x = rng.normal(0, 1, n); t = np.arange(n) / SR
    k = np.convolve(x, np.ones(12) / 12, 'same'); return (x - k) * np.sin(np.pi * t / l) ** 2 * .5
order = T['scenes']
for s in order[1:]: add(S, whoosh(), s['start'] - .12, .07)
for sid, hf in (('F', .5), ('L', .64)):
    s = sc[sid]; d = s['end'] - s['start']; hit = min(d - .9, d * hf)
    add(S, tok(), s['start'] + hit, .5); add(S, clink(), s['start'] + hit + .6, .34)
KEY = {'A2': .15, 'H': .8, 'I': .5, 'L': .5, 'M2': .5, 'O': .5, 'Q': .25}
for k, o in KEY.items():
    for q in range(4): add(S, clink(1900 + q * 180), sc[k]['start'] + o + q * .11, .12)
add(S, slide(300, 170, .6), sc['J2']['start'] + .2, .1)
def at(sid, f): s = sc[sid]; return s['start'] + (s['end'] - s['start']) * f
def whir(l, f0=90, f1=160):  # bike wheel spin
    n = int(l * SR); t = np.arange(n)/SR; ph = np.cumsum(np.interp(t,[0,l],[f0,f1]))/SR*2*np.pi; return np.sin(ph) * (.6+.4*np.sin(2*np.pi*7*t)) * np.minimum(t/.1,1)*np.minimum((l-t)/.15,1)
def dur(sid): return sc[sid]['end'] - sc[sid]['start']
add(S, slide(260, 150, .7), at('A', .55), .08); add(S, thump(), at('A', .55), .3)
add(S, thump(), at('A', .6), .3)
for k in range(3): add(S, puff(.12), at('B', .03) + k * dur('B') * .17, .1)
add(S, thump(), at('B', .68), .35)
add(S, thump(), at('C', .68), .35)
add(S, whir(dur('D') * .5, 60, 90), at('D', .02), .05); add(S, clink(2400), at('D', .62), .18)
add(S, whir(dur('D2') * .9, 110, 170), at('D2', .05), .06)
for k in range(5): add(S, tok(700 + k * 80, .6), at('D2', .15) + k * dur('D2') * .14, .08)
for k in range(4): add(S, tok(500 - k * 30, .6), at('E2', .05) + k * dur('E2') * .14, .1)
add(S, thump(), at('G', .02), .2); add(S, whir(dur('G') * .5, 120, 150), at('G', .5), .05)
add(S, thump(), at('H', .1), .3); add(S, clink(2600), at('H', .74), .2)
for k in range(12): add(S, tok(380 + k * 30), at('I', 0) + .05 + k * dur('I') * .7 / 12, .08)
add(S, rumble(.9), at('J', .45), .14); add(S, thump(), at('J', .45), .45)
add(S, thump(), at('J2', .25), .35)
add(S, whir(dur('K') * .95, 160, 220), at('K', .02), .06)
for k in range(5): add(S, clink(2200 + k * 90), at('K2', .05) + k * .08, .08)
add(S, whir(dur('M') * .95, 150, 230), at('M', .02), .06); add(S, thump(), at('M', .02), .25)
add(S, thump(), at('M2', .28), .3); add(S, thump(), at('M2', .5), .45)
add(S, thump(), at('N', .05), .35); add(S, rumble(1.2), sc['N']['start'] + .3, .1); add(S, thump(), at('N', .62), .3)
add(S, slide(500, 90, .8), at('N2', .5), .12); add(S, thump(), at('N2', .6), .4)
add(S, whir(dur('O') * .9, 120, 160), at('O', .05), .05)
add(S, slide(260, 150, .6), at('R', .6), .06); add(S, thump(), at('R', .65), .3)
ps = sc['S2']; add(S, puff(.2), ps['start'] + .05, .12); add(S, whir(max(.3, ps['end'] - ps['start'] - .3), 110, 160), ps['start'] + .35, .05)
z = sc.get('Z')
if z:
    dz = z['end'] - z['start']
    for i in range(3): add(S, clink(1800 + i * 300), z['start'] + dz * (.04 + i * .2), .16)
    add(S, puff(.2), z['start'] + dz * .72, .12)
# ---- mix: music sits far below the voice
vrms = np.sqrt(np.mean(vo[np.abs(vo) > .01] ** 2))
mrms = np.sqrt(np.mean(M[M != 0] ** 2))
target = vrms * 10 ** (-22 / 20)   # after ducking, about 25 dB under the voice
M = M * target / mrms
e = np.convolve(np.abs(vo), np.ones(int(.08 * SR)) / int(.08 * SR), 'same')
duck = 1 - .35 * np.clip(e / .04, 0, 1); duck = np.convolve(duck, np.ones(int(.2 * SR)) / int(.2 * SR), 'same')
Mx = M * duck
fin = np.minimum(1, (D - np.arange(N) / SR) / 1.0).clip(0, 1); Mx *= fin
mix = vo * 1.35 + S * .75 + Mx * 1.35
mix = mix / max(1, np.abs(mix).max() / .95)
sf.write(f'{R}/mix.wav', np.stack([mix, mix], 1), SR, subtype='PCM_16')
d = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
speech = np.abs(vo) > .01
print('voice rms dB', round(d(vo[speech] * 1.35), 1), 'music rms dB', round(d((Mx * 1.35)[Mx != 0]), 1), 'music under speech dB', round(d((Mx * 1.35)[speech]), 1), 'peak', round(float(np.abs(mix).max()), 2), 'dur', round(len(mix) / SR, 2))
