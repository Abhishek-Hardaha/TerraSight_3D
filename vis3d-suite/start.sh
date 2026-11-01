#!/usr/bin/env bash

echo "========================================================================="
echo "         VIS-SAM-3D SUITE -- PRODUCTION 3D RECONSTRUCTION"
echo "     Meta SAM 3D Objects + Dual GPU Kaggle Acceleration + Three.js"
echo "========================================================================="
echo ""

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR/frontend"

if [ ! -d "node_modules" ]; then
    echo "[!] node_modules not detected. Installing dependencies via npm..."
    npm install
fi

echo "[+] Starting Vis-Sam-3D Suite Web Studio on http://localhost:3000..."

# Open browser if on macOS or Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    (sleep 2 && open http://localhost:3000) &
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    (sleep 2 && xdg-open http://localhost:3000) &
fi

npm run dev
