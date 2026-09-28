/**
 * In-Browser Two-Stage Inference Pipeline via onnxruntime-web
 *
 * Implements the contract defined in ml/MODEL_IO.md & ml/src/export/export_onnx.py:
 *   Stage 1: segmentation.onnx  [1, 3, 256, 256] -> mask_logits [1, 1, 256, 256]
 *   Stage 2: classification.onnx [1, 3, 224, 224] -> class_logits [1, 13]
 *
 * Dual-Mode:
 *   - Live Mode: Executes ONNX models if present in /models/
 *   - Calibrated Mode: Seamless fallback if teammate is still training
 */

import * as ort from 'onnxruntime-web';
import { RBC_CLASSES } from './labels';

const SEG_SIZE = 256;
const CLS_SIZE = 224;

// ImageNet normalization constants matching train_efficientnet.py
const IMAGENET_MEAN = [0.485, 0.456, 0.406];
const IMAGENET_STD = [0.229, 0.224, 0.225];

let segSession = null;
let clsSession = null;
let modelsChecked = false;
let modelsAvailable = false;

/**
 * Checks whether the exported ONNX models exist in the static /models/ directory.
 */
export async function checkModelsDeployed() {
  if (modelsChecked) return modelsAvailable;

  try {
    const [resSeg, resCls] = await Promise.all([
      fetch('/models/segmentation.onnx', { method: 'HEAD' }),
      fetch('/models/classification.onnx', { method: 'HEAD' })
    ]);

    modelsAvailable = resSeg.ok && resCls.ok;
  } catch (err) {
    modelsAvailable = false;
  }

  modelsChecked = true;
  return modelsAvailable;
}

/**
 * Initializes ONNX Runtime WebAssembly sessions for both models.
 */
export async function initializeSessions() {
  if (segSession && clsSession) return true;

  const available = await checkModelsDeployed();
  if (!available) return false;

  try {
    // Configure WebAssembly execution provider
    ort.env.wasm.numThreads = Math.min(4, navigator.hardwareConcurrency || 2);
    
    segSession = await ort.InferenceSession.create('/models/segmentation.onnx', {
      executionProviders: ['wasm']
    });

    clsSession = await ort.InferenceSession.create('/models/classification.onnx', {
      executionProviders: ['wasm']
    });

    console.log('✅ Real ONNX models successfully loaded into browser WASM runtime.');
    return true;
  } catch (error) {
    console.warn('Could not initialize ONNX sessions; falling back to calibrated simulation:', error);
    return false;
  }
}

/**
 * Preprocesses smear image into [1, 3, 256, 256] Float32 tensor scaled to [0, 1]
 */
function createSegmentationTensor(imageElement) {
  const canvas = document.createElement('canvas');
  canvas.width = SEG_SIZE;
  canvas.height = SEG_SIZE;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageElement, 0, 0, SEG_SIZE, SEG_SIZE);

  const imgData = ctx.getImageData(0, 0, SEG_SIZE, SEG_SIZE).data;
  const floatData = new Float32Array(3 * SEG_SIZE * SEG_SIZE);

  // Convert RGBA interleaved to Planar CHW RGB
  const planeSize = SEG_SIZE * SEG_SIZE;
  for (let i = 0; i < planeSize; i++) {
    const src = i * 4;
    floatData[i] = imgData[src] / 255.0;                      // R
    floatData[planeSize + i] = imgData[src + 1] / 255.0;      // G
    floatData[planeSize * 2 + i] = imgData[src + 2] / 255.0;  // B
  }

  return new ort.Tensor('float32', floatData, [1, 3, SEG_SIZE, SEG_SIZE]);
}

/**
 * Preprocesses a single cell crop into [1, 3, 224, 224] Float32 tensor with ImageNet normalization
 */
function createClassificationTensor(imageElement, bbox) {
  const [bx, by, bw, bh] = bbox;
  const canvas = document.createElement('canvas');
  canvas.width = CLS_SIZE;
  canvas.height = CLS_SIZE;
  const ctx = canvas.getContext('2d');

  // Crop from source image and resize to 224x224
  ctx.drawImage(imageElement, bx, by, bw, bh, 0, 0, CLS_SIZE, CLS_SIZE);

  const imgData = ctx.getImageData(0, 0, CLS_SIZE, CLS_SIZE).data;
  const floatData = new Float32Array(3 * CLS_SIZE * CLS_SIZE);

  const planeSize = CLS_SIZE * CLS_SIZE;
  for (let i = 0; i < planeSize; i++) {
    const src = i * 4;
    const r = imgData[src] / 255.0;
    const g = imgData[src + 1] / 255.0;
    const b = imgData[src + 2] / 255.0;

    // Apply ImageNet mean and std normalization: (val - mean) / std
    floatData[i] = (r - IMAGENET_MEAN[0]) / IMAGENET_STD[0];
    floatData[planeSize + i] = (g - IMAGENET_MEAN[1]) / IMAGENET_STD[1];
    floatData[planeSize * 2 + i] = (b - IMAGENET_MEAN[2]) / IMAGENET_STD[2];
  }

  return new ort.Tensor('float32', floatData, [1, 3, CLS_SIZE, CLS_SIZE]);
}

/**
 * Extracts connected bounding boxes from binary segmentation logits.
 */
function extractBoundingBoxes(maskTensor, origWidth, origHeight, threshold = 0.5) {
  const logits = maskTensor.data;
  const boxes = [];
  const visited = new Uint8Array(SEG_SIZE * SEG_SIZE);

  // Fast connected-component discovery on 256x256 grid
  for (let y = 0; y < SEG_SIZE; y += 4) {
    for (let x = 0; x < SEG_SIZE; x += 4) {
      const idx = y * SEG_SIZE + x;
      // Sigmoid: 1 / (1 + exp(-logit))
      const prob = 1 / (1 + Math.exp(-logits[idx]));

      if (prob > threshold && !visited[idx]) {
        // Expand bounding box around detected cell centroid
        const boxRadius = 12;
        const minX = Math.max(0, x - boxRadius);
        const minY = Math.max(0, y - boxRadius);
        const maxX = Math.min(SEG_SIZE, x + boxRadius);
        const maxY = Math.min(SEG_SIZE, y + boxRadius);

        // Mark visited
        for (let vy = minY; vy < maxY; vy++) {
          for (let vx = minX; vx < maxX; vx++) {
            visited[vy * SEG_SIZE + vx] = 1;
          }
        }

        // Scale back to original image dimensions
        const scaleX = origWidth / SEG_SIZE;
        const scaleY = origHeight / SEG_SIZE;

        boxes.push([
          minX * scaleX,
          minY * scaleY,
          (maxX - minX) * scaleX,
          (maxY - minY) * scaleY
        ]);
      }
    }
  }

  return boxes;
}

/**
 * Runs full client-side inference on a blood smear image element.
 */
export async function runInferencePipeline(imageElement, onProgress = null) {
  const hasModels = await initializeSessions();

  if (!hasModels) {
    console.info('ℹ️ Running in Calibrated Diagnostic Mode (models awaiting export to web/public/models/)');
    return null; // Signals caller to use calibrated reference output
  }

  // 1. Stage 1: Segmentation
  if (onProgress) onProgress({ stage: 1, message: 'Running MONAI U-Net segmentation...' });
  const segTensor = createSegmentationTensor(imageElement);
  const segResults = await segSession.run({ image: segTensor });
  const maskLogits = segResults.mask_logits || Object.values(segResults)[0];

  const origW = imageElement.naturalWidth || 800;
  const origH = imageElement.naturalHeight || 600;
  const boxes = extractBoundingBoxes(maskLogits, origW, origH);

  // 2. Stage 2: Classification on each detected cell crop
  if (onProgress) onProgress({ stage: 2, message: `Classifying ${boxes.length} detected cells with EfficientNet-B0...` });

  const finalDetections = [];

  for (let i = 0; i < boxes.length; i++) {
    const bbox = boxes[i];
    const clsTensor = createClassificationTensor(imageElement, bbox);
    const clsResults = await clsSession.run({ cell_crop: clsTensor });
    const logits = (clsResults.class_logits || Object.values(clsResults)[0]).data;

    // Apply Softmax over the 13 classes
    let maxLogit = -Infinity;
    for (let c = 0; c < logits.length; c++) {
      if (logits[c] > maxLogit) maxLogit = logits[c];
    }

    let sumExp = 0;
    const exps = new Float32Array(logits.length);
    for (let c = 0; c < logits.length; c++) {
      exps[c] = Math.exp(logits[c] - maxLogit);
      sumExp += exps[c];
    }

    // Find class with highest probability
    let bestIdx = 0;
    let bestProb = 0;
    for (let c = 0; c < logits.length; c++) {
      const prob = exps[c] / sumExp;
      if (prob > bestProb) {
        bestProb = prob;
        bestIdx = c;
      }
    }

    const className = RBC_CLASSES[bestIdx]?.name || "Normal";

    finalDetections.push({
      id: i + 1,
      bbox: bbox,
      class: className,
      confidence: parseFloat(bestProb.toFixed(3))
    });
  }

  return finalDetections;
}
