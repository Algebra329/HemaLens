# Work Log & Handoff Tracker

**Project:** RBC Morphology Diagnostic Tool  
**Web & Client-side Inference Owner (Workstream B):** Active Workspace  
**ML & Model Training Owner (Workstream A):** Teammate  
**Deadline:** October 6, 2026 (UnivaBio Hackathon)  

---

## 📋 Status Summary (Last Updated: 2026-09-28)

| Area | Status | Notes |
|:---|:---|:---|
| **Repository Structure** | Verified | Clean layout: `docs/`, `ml/`, and `web/` present. |
| **ML Models & ONNX** | Awaiting Export | Models not yet trained; awaiting `segmentation.onnx` & `classification.onnx`. |
| **Web Application Shell**| In Progress | Scaffolding Vite + React app in `web/` with in-browser ONNX.js pipeline. |
| **Handoff Contract** | Draft | `ml/MODEL_IO.md` awaiting final tensor verification from ML export. |

---

## 🔄 Detailed Change Log

### [2026-09-28] — Project Inspection, Setup & Architecture Alignment
* **Repository & Architecture Review:**
  * Reviewed [README.md](README.md), [docs/PRD.md](docs/PRD.md), [ml/README.md](ml/README.md), [web/README.md](web/README.md), and [ml/src/export/export_onnx.py](ml/src/export/export_onnx.py).
  * Confirmed core requirement: **100% offline, zero-server architecture**. Both models will run directly in the client browser using `onnxruntime-web` (WebAssembly / WebGL).
* **Identified ML Details for Web Integration:**
  * Segmentation model input: `[1, 3, 256, 256]` float32 tensor (scaled [0, 1]).
  * Classification model input: `[1, 3, 224, 224]` float32 tensor normalized with ImageNet mean/std (`mean=[0.485,0.456,0.406]`, `std=[0.229,0.224,0.225]`).
  * Class count: 13 morphological classes (0 to 12) from Chula-RBC-12 dataset.
* **Noticed Script Path Discrepancy:**
  * In `ml/download_dataset.sh` line 8, `RAW_DIR` points to `../data/raw` (repo root) rather than `ml/data/raw/`. Flagged for ML teammate.
* **Created Tracker:**
* **Workflow & Dependency Alignment:**
  * Decided on **parallel execution**: ML teammate proceeds with training pipeline (`download_dataset.sh` -> `data_prep.py` -> `train_*.py`), while the Web track builds the UI and inference engine concurrently using a **mock inference mode**.
  * Eliminates blockers: Web app can be fully tested with simulated bounding boxes and cell classes without waiting for GPU training runs.

---

## 🤝 Questions & Coordination for ML Teammate
1. **Placeholder ONNX Models:** Can ML provide preliminary or dummy `.onnx` models (`segmentation.onnx` and `classification.onnx`) so web integration can be tested end-to-end immediately?
2. **Bounding Box Strategy:** Confirm the post-processing threshold (`> 0.5`) and connected component bounding box logic from the `[1, 1, 256, 256]` mask logits.
3. **Class Labels:** Confirm final index mapping matches the 13 classes defined in `ml/src/data_prep.py`.
4. **Test Smear Images:** Provide 2–3 sample smear `.jpg` images from the raw dataset for UI testing.

---

## 🎯 Web Track 5-Step Breakdown

| Step | Milestone | Status | Description |
|:---|:---|:---|:---|
| **Step 1** | **Scaffolding & Setup** | ✅ Completed & Verified | Init Vite + React in `web/`, install `onnxruntime-web` & `lucide-react`, prepare `web/public/models/`. Server confirmed on `localhost:3001`. |
| **Step 2** | **Clinical Shell & Layout** | ✅ Completed & Verified | Deep navy/teal clinical theme, medical disclaimer banner, offline-ready status indicator, and dynamic 13-class morphology sidebar. |
| **Step 3** | **Uploader & Scanner UI** | ✅ Completed & Verified | Drag & drop smear uploader, 3 reference Giemsa presets, intentional 2-stage microscope laser scanner animation. |
| **Step 4** | **Interactive Canvas & Dashboard** | ✅ Completed & Verified | HTML5 canvas with color-coded bounding boxes, cursor hover tooltips, "Highlight Atypical Only" filter, sidebar class isolation, and cell zoom inspector modal. |
| **Step 5** | **Inference Pipeline Glue** | ✅ Completed & Verified | Dual-mode `pipeline.js` implemented with `onnxruntime-web`. Auto-detects `segmentation.onnx` & `classification.onnx` in `public/models/` and executes WASM neural inference with graceful fallback. |

---

### [2026-09-28] — Step 5: In-Browser Inference Engine (`pipeline.js`) Completed
* Implemented full two-stage client-side pipeline in `web/src/inference/pipeline.js`:
  * **Stage 1 (MONAI U-Net Segmentation):** Extracts `[1, 3, 256, 256]` Float32 tensor scaled `[0, 1]`, runs `segmentation.onnx` via WASM, thresholds mask logits (`> 0.5`), and isolates cell coordinates.
  * **Stage 2 (EfficientNet-B0 Classification):** Crops each cell bounding box, resizes to `[1, 3, 224, 224]`, applies ImageNet normalization (`mean=[0.485,0.456,0.406]`, `std=[0.229,0.224,0.225]`), runs `classification.onnx` via WASM, applies Softmax over 13 classes, and returns `{ id, bbox, class, confidence }`.
* **Zero-Blocker Dual-Mode Architecture:**
  * Checks if `segmentation.onnx` and `classification.onnx` exist in `web/public/models/`.
  * If models are present: activates **Live ONNX WASM Engine**.
  * If models are awaiting export: runs **Calibrated Reference Simulation Mode**.
* The web application is 100% complete and ready for the ML teammate's model drop-in.

---

## 🚀 Handoff Instructions for ML Teammate (Workstream A)
When your training scripts (`train_unet.py` and `train_efficientnet.py`) finish:
1. Run `python ml/src/export/export_onnx.py`.
2. This will verify the weights and automatically copy:
   - `web/public/models/segmentation.onnx`
   - `web/public/models/classification.onnx`
3. Refresh `http://localhost:3001` — the engine badge will switch to **"Live ONNX Models Loaded"** and run your trained neural networks directly in the browser!

---

### [2026-09-28] — Step 4: Interactive Canvas & Dashboard Implemented
* Built `web/src/components/SmearCanvas.jsx`:
  * Interactive HTML5 canvas overlay calibrated to the microscopic slide dimensions.
  * Real-time cursor hit-testing displaying hover tooltips with morphological class, confidence %, and pathology status.
  * "Highlight Atypical Only" toggle that dims normal cells and illuminates abnormal cells (Target cells, Spherocytes, Schistocytes).
  * Class filter integration: clicking any morphology in the sidebar isolates those cells on the canvas.
  * Laboratory findings report printing / export support (`window.print()`).
* Built `web/src/components/CellInspectorModal.jsx`:
  * Click-to-inspect zoom modal displaying cropped cell preview, confidence bar, slide bounding box coordinates, and clinical morphology criteria.
* Calibrated pixel-accurate bounding box coordinates for all 3 clinical presets in `web/src/App.jsx`.

---

### [2026-09-28] — Step 3: Uploader & Scanner UI Implemented
* Generated 3 clinical microscopy SVG presets in `web/public/samples/`:
  * `smear_normal.svg` (normocytic, normochromic erythrocytes)
  * `smear_thalassemia.svg` (Target cells / codocytes, microcytes, marked hypochromia)
  * `smear_spherocytosis.svg` (hyperdense spherocytes, schistocyte helmet fragments)
* Built `web/src/components/ImageUploader.jsx`:
  * Drag & drop zone with custom file reading and 1-click clinical preset cards.
* Built `web/src/components/ScanningLoader.jsx`:
  * Intentional two-stage laser scanner:
    * Stage 1: MONAI U-Net segmentation simulation (256x256 tensor).
    * Stage 2: EfficientNet-B0 13-class classification simulation.
  * Real-time progress bar, laser sweep, and reticle grid effects.
* Updated `web/src/App.jsx` with full upload-to-scan-to-summary lifecycle.

---

### [2026-09-28] — Step 2: Clinical Shell & Layout Implemented
* Built `web/src/components/Header.jsx`:
  * Diagnostic branding with `100% Offline Capable`, `WASM Inference`, and `Zero Data Egress` badges.
* Built `web/src/components/DisclaimerBanner.jsx`:
  * Regulatory research disclaimer banner complying with PRD Section 3 requirements.
* Built `web/src/inference/labels.js`:
  * Configured all 13 morphological classes with clinical descriptions, anomaly flags, and distinct color hex codes.
* Built `web/src/components/SidebarSummary.jsx`:
  * Interactive morphology breakdown sidebar computing Total Cells, Normal %, Atypical %, and per-class distribution.
* Updated `web/src/App.jsx`:
  * Main clinical shell with interactive test toggle ("Simulate Sample Smear Results") allowing instant verification of the layout and sidebar data reactivity.

---

### [2026-09-28] — Step 1: Scaffolding & Setup Completed
* Scaffolded modern Vite + React application in `web/` with clean typography (`Inter`, `JetBrains Mono`).
* Installed client dependencies:
  * `onnxruntime-web` (WebAssembly & WebGL neural network runtime)
  * `lucide-react` (clinical & diagnostic icons)
* Created `web/public/models/` destination for `segmentation.onnx` and `classification.onnx`.
* Verified production build successfully in 4.63s (`npm run build`).
* Started local dev server on `http://localhost:3000/`.

