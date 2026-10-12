/**
 * Offline Asset Manager for HemaLens
 * Manages streaming downloads, byte-level progress tracking, and persistent
 * Cache Storage for point-of-care rural clinic readiness.
 */

export const OFFLINE_ASSETS = [
  {
    id: 'wasm-runtime',
    url: '/wasm/ort-wasm-simd-threaded.wasm',
    name: 'WASM Inference Engine',
    desc: 'WebAssembly point-of-care execution runtime',
    sizeBytes: 14239897, // ~14.2 MB
    cacheName: 'ort-wasm-runtime'
  },
  {
    id: 'segmentation-model',
    url: '/models/segmentation.onnx',
    name: 'MONAI U-Net Segmentation',
    desc: 'Neural network isolating individual red blood cells',
    sizeBytes: 6550757, // ~6.5 MB
    cacheName: 'onnx-models'
  },
  {
    id: 'classification-model',
    url: '/models/classification.onnx',
    name: 'EfficientNet-B0 Classification',
    desc: '13-class RBC morphology neural classifier',
    sizeBytes: 16119023, // ~16.1 MB
    cacheName: 'onnx-models'
  }
];

export const TOTAL_OFFLINE_BYTES = OFFLINE_ASSETS.reduce((sum, a) => sum + a.sizeBytes, 0); // ~36.9 MB

/**
 * Checks which assets are currently persisted in the browser's Cache Storage.
 */
export async function getCachedStatus() {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return {
      supported: false,
      isFullyCached: false,
      cachedBytes: 0,
      totalBytes: TOTAL_OFFLINE_BYTES,
      assetStatus: OFFLINE_ASSETS.map(a => ({ ...a, cached: false }))
    };
  }

  let totalCachedBytes = 0;
  const assetStatus = [];

  for (const asset of OFFLINE_ASSETS) {
    try {
      const cache = await caches.open(asset.cacheName);
      const match = await cache.match(asset.url);
      const isCached = !!match;
      if (isCached) {
        totalCachedBytes += asset.sizeBytes;
      }
      assetStatus.push({ ...asset, cached: isCached });
    } catch {
      assetStatus.push({ ...asset, cached: false });
    }
  }

  return {
    supported: true,
    isFullyCached: totalCachedBytes >= TOTAL_OFFLINE_BYTES,
    cachedBytes: totalCachedBytes,
    totalBytes: TOTAL_OFFLINE_BYTES,
    assetStatus
  };
}

/**
 * Streams the download of all required offline assets with byte-level progress reporting.
 * Puts responses directly into Cache Storage for instant offline PWA reuse.
 *
 * @param {Function} onProgress ({ currentAsset, assetBytesDownloaded, totalBytesDownloaded, totalBytes, percent })
 */
export async function downloadAllOfflineAssets(onProgress) {
  if (typeof window === 'undefined' || !('caches' in window)) {
    throw new Error('Cache Storage API is not supported in this browser environment.');
  }

  let totalDownloadedSoFar = 0;

  for (const asset of OFFLINE_ASSETS) {
    const cache = await caches.open(asset.cacheName);
    const existing = await cache.match(asset.url);

    if (existing) {
      totalDownloadedSoFar += asset.sizeBytes;
      if (onProgress) {
        onProgress({
          currentAsset: asset,
          assetBytesDownloaded: asset.sizeBytes,
          totalBytesDownloaded: totalDownloadedSoFar,
          totalBytes: TOTAL_OFFLINE_BYTES,
          percent: Math.min(100, Math.round((totalDownloadedSoFar / TOTAL_OFFLINE_BYTES) * 100))
        });
      }
      continue;
    }

    const response = await fetch(asset.url);
    if (!response.ok) {
      throw new Error(`Failed to download ${asset.name} (${response.status} ${response.statusText})`);
    }

    const contentLength = Number(response.headers.get('content-length')) || asset.sizeBytes;
    const reader = response.body.getReader();
    let assetReceived = 0;
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      assetReceived += value.length;

      if (onProgress) {
        onProgress({
          currentAsset: asset,
          assetBytesDownloaded: assetReceived,
          totalBytesDownloaded: totalDownloadedSoFar + assetReceived,
          totalBytes: TOTAL_OFFLINE_BYTES,
          percent: Math.min(100, Math.round(((totalDownloadedSoFar + assetReceived) / TOTAL_OFFLINE_BYTES) * 100))
        });
      }
    }

    totalDownloadedSoFar += asset.sizeBytes;

    // Combine chunks into binary Blob and persist in Cache Storage
    const blob = new Blob(chunks, {
      type: response.headers.get('content-type') || 'application/octet-stream'
    });

    const cachedResponse = new Response(blob, {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
        'Content-Length': String(blob.size),
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });

    await cache.put(asset.url, cachedResponse);
  }

  return true;
}
