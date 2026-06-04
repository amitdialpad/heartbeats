#!/usr/bin/env bash
# Run this from INSIDE the unzipped heartbeats/ folder.
# Requires the GitHub CLI, logged in:  brew install gh && gh auth login
set -e

OWNER="amitdialpad"
REPO="heartbeats"

echo "→ checking gh…"
command -v gh >/dev/null || { echo "✗ Install the GitHub CLI first: brew install gh && gh auth login"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "✗ Not logged in. Run: gh auth login"; exit 1; }

echo "→ committing files…"
git init -q 2>/dev/null || true
git add .
git commit -q -m "heartbeats: initial" 2>/dev/null || echo "  (nothing to commit)"
git branch -M main

echo "→ creating repo and pushing…"
if gh repo view "$OWNER/$REPO" >/dev/null 2>&1; then
  git remote add origin "https://github.com/$OWNER/$REPO.git" 2>/dev/null || true
  git push -u origin main
else
  gh repo create "$OWNER/$REPO" --public --source=. --remote=origin --push
fi

echo "→ enabling GitHub Pages (Actions build)…"
gh api -X POST "repos/$OWNER/$REPO/pages" -f build_type=workflow >/dev/null 2>&1 \
  || echo "  (Pages may already be on — if not, set Settings → Pages → Source = GitHub Actions)"

echo "→ linking the beat command…"
chmod +x bin/beat.mjs
npm link >/dev/null 2>&1 || sudo npm link

cat <<'NOTE'

✓ Repo is up and Pages is building. Live shortly at:
    https://amitdialpad.github.io/heartbeats/

Last two steps are personal, so add them yourself (e.g. ~/.zshrc):

    export BEAT_AUTHOR=amit
    export EDITOR="code --wait"          # or nano / vim / "cursor --wait"
    alias beat="cd $(pwd) && beat"

Then:  source ~/.zshrc
Add Josh:  gh api -X PUT repos/amitdialpad/heartbeats/collaborators/JOSH_USERNAME

Now just type:  beat
NOTE
