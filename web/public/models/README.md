# ONNX Models Directory

Place exported ONNX models here:
- `segmentation.onnx` (~10-20MB, MONAI U-Net)
- `classification.onnx` (~15-25MB, EfficientNet-B0)

These are served statically and loaded directly into the browser via `onnxruntime-web`.
Run `python ml/src/export/export_onnx.py` from the ML side to auto-populate this directory.
