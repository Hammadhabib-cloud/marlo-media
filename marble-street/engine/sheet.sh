#!/bin/bash
# usage: sheet.sh frac out [ids]
cd "$(dirname "$0")"; rm -rf stills; 
ts=$(python3 -c "
import json,sys
T=json.load(open('timeline.json'));f=float(sys.argv[1]);ids=sys.argv[2].split(',') if sys.argv[2] else None
print(','.join(f\"{s['start']+(s['end']-s['start'])*f:.2f}\" for s in T['scenes'] if not ids or s['id'] in ids))" "$1" "$3")
NODE_PATH=$(npm root -g) node render.js still "$ts" 2>&1 | grep -E "PAGEERR|CON |rror" | head
ffmpeg -y -v error -pattern_type glob -i 'stills/*.jpg' -vf "scale=${4:-216}:-1,tile=${5:-8}x${6:-4}:padding=4" -frames:v 1 "$2"
