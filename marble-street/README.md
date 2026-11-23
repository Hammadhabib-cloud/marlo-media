# Marble Street: series kit for the daily scheduled task

Each episode is built in the cloud with the `faceless-shorts` skill, style **Tall Tale 3D**
(`new_video.sh tall-tale marlo-epNN`), then replace `script.json` and `src/shots.js`.
Start from the newest `epNN/` folder here: it has the cast (`LOOK`), the umbrella/rain/wind/card helpers
and the shot pattern.

## Series rules
- Hero: **Marlo** (orange body, teal beanie, yellow scarf, freckles). Same look every episode.
- Villain: **MegaSock** (big company; boss in a top hat, monocle, mustache).
- Setting: Marble Street (mainStreet set). Shops include a BAKERY.
- Story shape (40-50 s, ~120 words, am_michael x1.05, music "bounce"):
  everyday annoyance → Marlo's simple business idea (show price/sign) → it works →
  a disaster → a fix → MegaSock arrives with an expensive/robotic version → Marlo wins with a
  small human touch → a punchline that flips the opening.
- Fictional only. Never repeat an idea already on the channel (check titles first).
- Meta JSON: copy the format of `epNN/EpNN_meta.json` (same description footer, same base tags + 3 topic tags).
- Thumbnail: 1080x1920 JPEG, a strong frame + 2-line text panel (white line + yellow line), Inter Black.

## Cloud notes (no GPU, Whisper blocked)
- Render: `SOFTWARE_GL=1 QS='&res=0.6&aa=0&shadow=1024' FPS=24` (~10 min for 45 s).
- `words.py` falls back to spreading words inside exact voice line times (fine).
- Captions `caps` chunks must start with the spoken word (no digits like "20" for "twenty").
- Share copy: `ffmpeg -c:v libx264 -crf 21 -preset slow -c:a aac -b:a 160k -movflags +faststart`.

## Getting files to Drive
Temp file hosts are blocked from the cloud. Push the three files to `transfer/` in this public repo,
then Google Drive "Upload File" (via Zapier) from
`https://raw.githubusercontent.com/Hammadhabib-cloud/marlo-media/main/transfer/<file>` into "To Upload".
After Drive has them, `git rm` the `transfer/` files and push ("Clear transfer space").
