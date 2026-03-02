#!/usr/bin/env bash
set -euo pipefail

# Detect binary files in current HEAD using git numstat markers ('-').
if git show --numstat --format='' HEAD | awk '$1=="-" || $2=="-" { found=1 } END { exit found ? 0 : 1 }'; then
  echo "Binary files detected in HEAD commit."
  exit 1
fi

echo "No binary files detected in HEAD commit."
