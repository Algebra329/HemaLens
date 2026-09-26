# ML — RBC Morphology Pipeline

## Setup
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Pipeline order
0. `bash download_dataset.sh` — clones the dataset into `data/raw/` (~350MB, ~740 images + label files). Confirmed working: real label format is `x y type` per line, space-separated, 13 classes (0-12). There's also a bonus `RBC_Diseases/` folder (Megaloblastic anemia, Thalassemia, HS, Iron deficiency anemia, HE) — format not yet verified, don't assume it matches.
1. `src/data_prep.py` — parses `data/raw/` annotations into segmentation pseudo-masks + classification crops. Outputs to `data/processed/`. Tested against real data: 623 images with matching labels, 22,106 total labeled cells, 34.4:1 imbalance ratio (majority:minority) — closely matches the published 34.538 figure.
2. `src/segmentation/train_unet.py` — trains the MONAI U-Net on pseudo-masks. Tested end-to-end on synthetic data (loss decreases, IoU increases over epochs). Saves best checkpoint by val IoU to `../models/unet_seg.pt`.
3. `src/classification/train_efficientnet.py` — fine-tunes EfficientNet-B0 with Focal Loss on the 13-class crops. Tested end-to-end: pretrained weights download and load correctly, per-class F1 report generates with correct class names/order. Saves best checkpoint by val macro-F1 to `../models/efficientnet_b0.pt`.
4. `src/export/export_onnx.py` — exports both trained models to ONNX, **verifies each export's output matches the original PyTorch model** (fails loudly if they don't — don't ship an unverified export), regenerates `MODEL_IO.md` with real tensor shapes, and copies the `.onnx` files to `../../web/public/models/`. Tested end-to-end against real checkpoints.

Run order, from `ml/`:
```bash
python src/data_prep.py
python src/segmentation/train_unet.py
python src/classification/train_efficientnet.py
python src/export/export_onnx.py
```
(All four scripts also work run from inside their own subfolders using their default relative paths, as shown in the code — adjust `--data-root`/`--out` flags if you run them from elsewhere.)
2. `src/segmentation/train_unet.py` — trains the MONAI U-Net segmentation model.
3. `src/classification/train_efficientnet.py` — trains EfficientNet-B0 classifier on cropped cells.
4. `src/export/export_onnx.py` — exports both trained models to ONNX, writes `MODEL_IO.md` with final tensor shapes, copies `.onnx` files to `../web/public/models/`.

## Checkpoint (week 2)
If segmentation isn't reliably isolating cells by the end of week 2, stop and fall back to classification-only (skip step 2, feed pre-cropped cells directly from `data_prep.py` into step 3). See `docs/PRD.md` §8 for the full fallback plan.

## Evaluation
- Segmentation: IoU
- Classification: per-class F1 (accuracy is not a meaningful metric here — 34.5:1 class imbalance)

## Data
Raw Chula-RBC-12 files go in `data/raw/` (gitignored — do not commit dataset files). Processed masks/crops go in `data/processed/` (also gitignored).
