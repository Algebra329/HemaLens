#!/usr/bin/env bash
# Downloads the Chula-RBC-12 dataset into ml/data/raw/
# Usage: bash download_dataset.sh   (run from ml/ directory, or anywhere -- it cds itself)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RAW_DIR="$SCRIPT_DIR/../data/raw"

mkdir -p "$RAW_DIR"

if [ -d "$RAW_DIR/Dataset" ] && [ -d "$RAW_DIR/Label" ]; then
    echo "Dataset already present at $RAW_DIR -- skipping clone."
    exit 0
fi

echo "Cloning Chula-RBC-12-Dataset (~350MB) into $RAW_DIR ..."
git clone --depth 1 https://github.com/Chula-PIC-Lab/Chula-RBC-12-Dataset.git "$RAW_DIR/_clone"

# Move contents up out of the _clone wrapper, drop the .git history (not needed, saves space)
mv "$RAW_DIR/_clone/Dataset" "$RAW_DIR/Dataset"
mv "$RAW_DIR/_clone/Label" "$RAW_DIR/Label"
mv "$RAW_DIR/_clone/RBC Diseases" "$RAW_DIR/RBC_Diseases" 2>/dev/null || true
rm -rf "$RAW_DIR/_clone"

echo "Done."
echo "  Images: $(find "$RAW_DIR/Dataset" -type f | wc -l)"
echo "  Labels: $(find "$RAW_DIR/Label" -type f | wc -l)"
echo ""
echo "Note: there's also a 'RBC_Diseases/' folder (Megaloblastic anemia,"
echo "Thalassemia, HS, Iron deficiency anemia, HE) with extra images --"
echo "check its label format separately before assuming it matches the"
echo "main Dataset/Label format; it hasn't been verified yet."
