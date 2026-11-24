#!/bin/bash
# usage: new_episode.sh NN   -> makes ~/ms/epNN from the engine + the newest episode as a starting point
set -e
NN=$(printf %02d $((10#$1))); ENG=$(cd "$(dirname "$0")" && pwd); EPS=$ENG/../episodes
SH=${MS_HOME:-$HOME/ms}/shared; D=${MS_HOME:-$HOME/ms}/ep$NN; mkdir -p "$D"; cd "$D"
for f in world.js sets.js recap.js render.js thumb.js sheet.sh marlo.js; do cp "$ENG/$f" .; done
chmod 444 marlo.js   # locked character: never edit
ln -sfn "$SH/node_modules" node_modules; ln -sfn "$SH/voice" voice
LAST=$(ls -d "$EPS"/ep* | sort | tail -1)
for f in scenes.js tts.py index.html audio.py thumb.html; do [ -f "$D/$f" ] || cp "$LAST/$f" . 2>/dev/null || true; done
[ -f thumb.html ] || cp "$EPS/ep05/thumb.html" .
echo "episode folder: $D (started from $(basename "$LAST"))"
