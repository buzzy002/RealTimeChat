#!/usr/bin/env bash
set -euo pipefail

python -m venv .venv
.venv/bin/pip install --upgrade pip

if [ -f RealTimeChat/requirements.txt ]; then
  .venv/bin/pip install -r RealTimeChat/requirements.txt
else
  # Premier lancement, avant que requirements.txt existe (étape 6)
  .venv/bin/pip install django channels channels-redis "uvicorn[standard]" \
    whitenoise "psycopg[binary]" dj-database-url pillow
fi

(cd app-client && npm ci)