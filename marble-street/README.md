# Marble Street: series kit (read fully before making an episode)

Channel: **Marlo Business** (@marlobusinesss). One animated Short per day about a creative business idea.
Episodes 1, 2, 3 and 5 are the reference. Episode 4 ("He Turned Rain Into Money") was made with a
different tool and a different-looking Marlo: **that was a mistake. Never use the `faceless-shorts`
skill, "Tall Tale 3D", Remotion or any other style for this channel.** Every episode is built with
the engine in `engine/`, exactly like ep01-ep05 in `episodes/`.

## Hard rules
1. **Marlo never changes.** `engine/marlo.js` is the character bible: warm brown skin, big dark curly
   afro, coral hoodie with cream drawstrings, navy trousers, white sneakers with gold soles, gold marble
   pendant, yellow pencil behind the right ear, one striped + one dotted sock (`MS()` in scenes.js).
   Never edit marlo.js, never recolour him, never give him a hat or scarf.
2. **Same world:** Marble Street (`street()` in sets.js) with house 7 (Marlo's, red door, centre),
   the gold marble gutter, the marble jar, MegaSock as the rival (robots, a red MEGA logo, a boss).
   Reuse `world.js`, `sets.js`, `recap.js`, `render.js` unchanged.
3. **Same packaging:** HUD "MARLO'S BANK" counter (index.html `KEY`), one "WHAT WOULD YOU DO?" banner
   at the low point (`PROMPT`), word-by-word yellow-highlight captions, the PROBLEM / IDEA / RESULT
   recap card + "FOLLOW FOR TOMORROW'S BUSINESS" ending (`F.Z = recap(...)`), vertical thumbnail in
   the ep05 `thumb.html` style ("X =" white line + gold "$1,000,000" line, red arrow, EP badge).
4. **Pacing (the owner asked for this):** voice `python3 tts.py 9 1.4` (Kokoro bm_george, speed 1.4,
   internal silences squeezed, 0.03 s between lines, no gaps over ~0.1 s). **A new shot every 2-4 s**
   (one scene id per line, ~25 scenes). Total 50-60 s. Fast but always clear; never above speed 1.45.
5. Story shape (see ep05 tts.py): hook mistake/annoyance -> "that ... made him a millionaire" (coin
   rain) -> what happened -> "And that's when the marble dropped" -> the simple business + price ->
   it grows (counter) -> disaster + WHAT WOULD YOU DO? -> human fix -> "The marble dropped again" ->
   upgrade + SOLD OUT -> MegaSock copies it with robots/an app and fails -> MegaSock's own people buy
   Marlo's -> today: waiting list/line -> punchline that flips the opening -> recap Z line
   ("One X. A million dollars. Because Marlo ...").
6. Fictional only, no real brands or people. A new idea each day; check the channel's titles first.
7. Title: MrBeast style, short, one line, curious, does not reveal the idea
   (e.g. "The Hardest Word Made Him Rich"). Meta JSON exactly like `episodes/ep05/Ep05_meta.json`
   (same description footer, same 12 base tags + 3 topic tags, category Film & Animation,
   made_for_kids false, altered_or_synthetic true).

## Build an episode (cloud container)
```bash
cd ~ && git clone https://github.com/Hammadhabib-cloud/marlo-media.git   # or git pull
bash marlo-media/marble-street/engine/setup.sh          # node deps + Kokoro voice (~320 MB, GitHub)
bash marlo-media/marble-street/engine/new_episode.sh NN # -> ~/ms/epNN, copied from the newest episode
cd ~/ms/epNN
# 1. write the script: edit the P list in tts.py (scene id, spoken text, caption text; *word = yellow)
python3 tts.py 9 1.4             # -> vo.wav + timeline.json; prints each scene length (aim 1.5-3.5 s)
# 2. write scenes.js: one F.<id> per scene id + F.Z = recap([...problem, idea, '$1,000,000'], signs)
#    edit index.html KEY (bank counter per scene) and PROMPT ({<disaster id>: .45})
#    edit the effects block of audio.py (it references scene ids)
python3 audio.py                 # -> mix.wav (music ~25 dB under voice)
# 3. QA stills: every scene at 60 %, then fix framing (nothing cut off, labels readable, no overlap)
NODE_PATH=$(npm root -g) bash sheet.sh .6 qc.jpg "" 216 7 4
# 4. render (about 1-1.5 h on CPU; run in the background and wait)
NODE_PATH=$(npm root -g) node render.js scenes
ls parts/*.mp4 | sort | sed "s/.*/file '&'/" > list.txt
ffmpeg -y -f concat -safe 0 -i list.txt -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest EpNN_video.mp4
# 5. thumbnail: add EP[NN] to thumb.html (copy the 5: entry), then
NODE_PATH=$(npm root -g) node thumb.js NN && ffmpeg -y -i thumbs/EpNN_Thumbnail_Vertical.png -q:v 2 EpNN_thumbnail.jpg
```
QC before upload: ffprobe 1080x1920 30 fps, no black/frozen frames (`blackdetect`, `freezedetect`),
no silence over 0.5 s (`silencedetect=n=-40dB:d=0.5`), look at a contact sheet of the final video.
Then save `scenes.js tts.py index.html audio.py thumb.html EpNN_meta.json` to `episodes/epNN/`.

## Getting files to Drive
Push the three files to `transfer/` in this repo, then Google Drive "Upload File" (Zapier) from
`https://raw.githubusercontent.com/Hammadhabib-cloud/marlo-media/<commit sha>/transfer/<file>` into
"To Upload" (folder 1ZXVyiHgqVmQ5c3DG2ePpC4jfVtGdDLLB). After Drive has them, `git rm -r transfer`
and push ("Clear transfer space").
