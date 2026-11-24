#!/bin/bash
# One-time setup of the Marble Street engine in a fresh cloud container.
# Creates ~/ms/shared with node_modules and the Kokoro voice. Safe to re-run.
set -e
SH=${MS_HOME:-$HOME/ms}/shared; mkdir -p "$SH"; cd "$SH"
cp "$(dirname "$0")/package.json" .
[ -d node_modules/three ] || npm install --silent --no-audit --no-fund
python3 -c "import sherpa_onnx, soundfile, numpy" 2>/dev/null || pip install --break-system-packages -q sherpa-onnx==1.12.40 soundfile numpy
if [ ! -f voice/kokoro-en-v0_19/model.onnx ]; then
  mkdir -p voice && cd voice
  curl -sSL -o k.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-en-v0_19.tar.bz2
  tar xjf k.tar.bz2 && rm k.tar.bz2
fi
node -e "require('playwright')" 2>/dev/null || echo "WARN: playwright not found (use NODE_PATH=\$(npm root -g))"
echo "engine ready: $SH"
