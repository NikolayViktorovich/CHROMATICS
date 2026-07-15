#!/usr/bin/env bash
# Upscale hero video for sharper display on desktop.
# Requires: brew install ffmpeg
#
# Usage (from repo root):
#   bash client/scripts/upscale-chrom-video.sh
#
# Output overwrites client/public/chrom.MP4 (backup kept as chrom.MP4.bak).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
INPUT="$ROOT/client/public/chrom.MP4"
BACKUP="$ROOT/client/public/chrom.MP4.bak"
OUTPUT="$ROOT/client/public/chrom_hd.mp4"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found. Install: brew install ffmpeg"
  exit 1
fi

if [[ ! -f "$INPUT" ]]; then
  echo "Missing $INPUT"
  exit 1
fi

cp "$INPUT" "$BACKUP"

# 720x1280 -> 1080x1920 (Lanczos). Good balance of size vs sharpness.
# For AI upscale use Topaz Video AI / Real-ESRGAN and replace chrom.MP4 manually.
ffmpeg -y -i "$INPUT" \
  -vf "scale=1080:1920:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset slow -crf 18 -movflags +faststart \
  -an \
  "$OUTPUT"

mv "$OUTPUT" "$INPUT"
echo "Done. Backup: $BACKUP"
echo "New file: $INPUT ($(du -h "$INPUT" | cut -f1))"
