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
for sid, hf in (('E', .44), ('K', .64)):
    s = sc[sid]; d = s['end'] - s['start']; hit = min(d - .9, d * hf)
    add(S, tok(), s['start'] + hit, .5); add(S, clink(), s['start'] + hit + .6, .34)
KEY = {'A2': .15, 'H': .35, 'K': .5, 'L': .3, 'M': .9, 'O': .4, 'Q': .25}
for k, o in KEY.items():
    for q in range(4): add(S, clink(1900 + q * 180), sc[k]['start'] + o + q * .11, .12)
for k, o in (('I3', .2), ('N2', .55)): add(S, slide(300, 170, .6), sc[k]['start'] + o, .1)
a_ = sc['A']; add(S, slide(260, 150, .7), a_['start'] + .3, .08)
for sid in ('C',):
    s = sc[sid]; d = s['end'] - s['start']; add(S, thump(), s['start'] + d * .28, .3); add(S, thump(), s['start'] + d * .78, .3)
c2 = sc['C2']; d = c2['end'] - c2['start']
for k in range(12): add(S, tok(700 + k * 25), c2['start'] + k * d * .38 / 12, .08)
g_ = sc['G']; add(S, thump(), g_['start'] + (g_['end'] - g_['start']) * .22, .3); add(S, clink(2600), g_['start'] + (g_['end'] - g_['start']) * .7, .2)
h_ = sc['H']; dh = h_['end'] - h_['start']
for k in range(20): add(S, tok(380 + k * 18), h_['start'] + .1 + k * 3 * dh * .78 / 60, .09)
i_ = sc['I']; add(S, thump(), i_['start'] + (i_['end'] - i_['start']) * .45, .3)
i2 = sc['I2']; add(S, slide(340, 160, 1.0), i2['start'] + .15, .12)
j2 = sc['J2']; dj = j2['end'] - j2['start']; add(S, clink(3200), j2['start'] + dj * .3, .22); add(S, puff(.12), j2['start'] + dj * .3, .3)
for k in range(4): add(S, puff(.1), j2['start'] + dj * .35 + k * .14, .1)
for k, sid in enumerate(('J3',)): add(S, puff(.2), sc[sid]['start'] + .05, .12)
l2 = sc['L2']; dl = l2['end'] - l2['start']
for k in range(3): add(S, puff(.2), l2['start'] + k * dl / 3 + .03, .12)
m_ = sc['M']; dm = m_['end'] - m_['start']; add(S, thump(), m_['start'] + dm * .32, .3); add(S, thump(), m_['start'] + dm * .62, .45)
n_ = sc['N']; add(S, rumble(1.4), n_['start'] + .2, .1); add(S, thump(), n_['start'] + (n_['end'] - n_['start']) * .55, .3)
n2 = sc['N2']; add(S, thump(), n2['start'] + (n2['end'] - n2['start']) * .55, .4)
s2 = sc['S2']; ds = s2['end'] - s2['start']
for k in range(14): add(S, tok(1500, .6), s2['start'] + .45 + k * (ds * .78 - .45) / 14, .12)
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
