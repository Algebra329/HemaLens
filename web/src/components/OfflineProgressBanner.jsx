import React, { useState, useEffect } from 'react';
import {
  Download,
  Check,
  Wifi,
  WifiOff,
  HardDrive,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  getCachedStatus,
  downloadAllOfflineAssets,
  TOTAL_OFFLINE_BYTES,
  OFFLINE_ASSETS
} from '../utils/offlineManager';

function formatMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(1);
}

export default function OfflineProgressBanner({ onReadyChange }) {
  const [status, setStatus] = useState({
    supported: true,
    isFullyCached: false,
    cachedBytes: 0,
    totalBytes: TOTAL_OFFLINE_BYTES,
    assetStatus: OFFLINE_ASSETS.map(a => ({ ...a, cached: false }))
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({
    currentAssetName: '',
    downloadedBytes: 0,
    totalBytes: TOTAL_OFFLINE_BYTES,
    percent: 0
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Monitor network online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check initial cache state on mount
  const checkStatus = async () => {
    try {
      const s = await getCachedStatus();
      setStatus(s);
      if (onReadyChange) {
        onReadyChange(s.isFullyCached);
      }
    } catch (err) {
      console.warn('Could not inspect Cache Storage:', err);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleStartDownload = async () => {
    setIsDownloading(true);
    setErrorMessage(null);

    try {
      await downloadAllOfflineAssets(({ currentAsset, totalBytesDownloaded, percent }) => {
        setDownloadProgress({
          currentAssetName: currentAsset.name,
          downloadedBytes: totalBytesDownloaded,
          totalBytes: TOTAL_OFFLINE_BYTES,
          percent: percent
        });
      });

      // Refresh cache inspection
      await checkStatus();
    } catch (err) {
      console.error('Offline pack download error:', err);
      setErrorMessage(err.message || 'Download paused due to network interruption. Tap Retry when connected.');
    } finally {
      setIsDownloading(false);
    }
  };

  const isComplete = status.isFullyCached;
  const currentPercent = isDownloading
    ? downloadProgress.percent
    : Math.round((status.cachedBytes / TOTAL_OFFLINE_BYTES) * 100);

  return (
    <div
      id="offline-pack-section"
      className="glass-panel"
      style={{
        margin: '0.75rem auto 1rem auto',
        maxWidth: '1440px',
        width: '100%',
        padding: '0.85rem 1.25rem',
        borderRadius: '12px',
        background: isComplete
          ? 'linear-gradient(135deg, rgba(236, 253, 245, 0.95) 0%, rgba(240, 253, 250, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(240, 249, 255, 0.95) 0%, rgba(245, 243, 255, 0.95) 100%)',
        border: isComplete ? '1px solid #a7f3d0' : '1px solid #bae6fd',
        boxShadow: '0 2px 8px rgba(0, 20, 55, 0.04)',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Left: Indicator & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: isComplete ? '#10b981' : isDownloading ? '#0284c7' : '#001437',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            flexShrink: 0
          }}>
            {isComplete ? (
              <Check size={18} color="#ffffff" />
            ) : isDownloading ? (
              <RefreshCw size={18} color="#ffffff" className="spin-animation" style={{ animation: 'spin 1.5s linear infinite' }} />
            ) : (
              <HardDrive size={18} color="#ffffff" />
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{
                margin: 0,
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                Point-of-Care Offline Pack
              </h3>

              {isComplete ? (
                <span className="clinical-badge badge-emerald" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                  <WifiOff size={11} /> 100% Offline Ready ({formatMB(TOTAL_OFFLINE_BYTES)} MB Cached)
                </span>
              ) : isDownloading ? (
                <span className="clinical-badge badge-cyan" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                  <Download size={11} /> Downloading ({currentPercent}%)
                </span>
              ) : (
                <span className="clinical-badge badge-magenta" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                  <HardDrive size={11} /> Ready to Pre-cache ({formatMB(status.cachedBytes)} / {formatMB(TOTAL_OFFLINE_BYTES)} MB)
                </span>
              )}
            </div>

            <p style={{
              margin: '0.15rem 0 0 0',
              fontSize: '0.78rem',
              color: 'var(--text-muted)'
            }}>
              {isComplete
                ? 'All neural models and WebAssembly binaries are saved locally. You can use HemaLens in rural clinics with 0 bytes of internet.'
                : isDownloading
                ? `Caching for remote use: ${downloadProgress.currentAssetName || 'neural models'}...`
                : 'For doctors & outreach workers: download once on Wi-Fi so the tool runs indefinitely in zero-signal clinics.'}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {isComplete && (
            <button
              onClick={async () => {
                if (typeof window !== 'undefined' && 'caches' in window) {
                  await caches.delete('onnx-models');
                  await caches.delete('ort-wasm-runtime');
                  await checkStatus();
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#ffffff',
                color: '#059669',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Clears browser cache to test the live downloading progress bar again"
            >
              <RefreshCw size={13} />
              <span>Re-test Download Bar</span>
            </button>
          )}

          {!isComplete && !isDownloading && (
            <button
              onClick={handleStartDownload}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'linear-gradient(135deg, #001437 0%, #0284c7 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              <Download size={14} />
              <span>Download Offline Pack ({formatMB(TOTAL_OFFLINE_BYTES - status.cachedBytes)} MB)</span>
            </button>
          )}

          {isDownloading && (
            <div style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <span>{formatMB(downloadProgress.downloadedBytes)} / {formatMB(TOTAL_OFFLINE_BYTES)} MB</span>
            </div>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '0.35rem 0.55rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem'
            }}
            title="Toggle component details"
          >
            <span>{isExpanded ? 'Hide Details' : 'View Pack'}</span>
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* Progress Bar (Always visible to show exact storage progress) */}
      <div style={{ marginTop: '0.85rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.76rem',
          color: 'var(--text-muted)',
          marginBottom: '0.35rem'
        }}>
          <span style={{ fontWeight: 600, color: isComplete ? '#059669' : '#0369a1' }}>
            {isDownloading
              ? `Downloading: ${downloadProgress.currentAssetName}`
              : isComplete
              ? `● 100% Cached in Browser: ${formatMB(TOTAL_OFFLINE_BYTES)} MB of ${formatMB(TOTAL_OFFLINE_BYTES)} MB available offline`
              : `Storage Progress: ${formatMB(status.cachedBytes)} of ${formatMB(TOTAL_OFFLINE_BYTES)} MB saved`}
          </span>
          <span style={{ fontWeight: 700, color: isComplete ? '#10b981' : '#0284c7' }}>
            {currentPercent}%
          </span>
        </div>

        <div style={{
          width: '100%',
          height: '10px',
          backgroundColor: '#e2e8f0',
          borderRadius: '999px',
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)'
        }}>
          <div style={{
            width: `${Math.max(4, currentPercent)}%`,
            height: '100%',
            background: isComplete
              ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
              : 'linear-gradient(90deg, #0284c7 0%, #38bdf8 50%, #10b981 100%)',
            borderRadius: '999px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div style={{
          marginTop: '0.65rem',
          padding: '0.5rem 0.75rem',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#991b1b',
          fontSize: '0.78rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={14} color="#ef4444" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={handleStartDownload}
            style={{
              background: '#ef4444',
              color: '#ffffff',
              border: 'none',
              padding: '0.25rem 0.6rem',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Expanded File Checklist */}
      {isExpanded && (
        <div style={{
          marginTop: '0.85rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(0, 20, 55, 0.08)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '0.65rem'
        }}>
          {status.assetStatus.map(asset => (
            <div
              key={asset.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                padding: '0.55rem 0.75rem',
                background: asset.cached ? '#ffffff' : '#f8fafc',
                borderRadius: '8px',
                border: asset.cached ? '1px solid #d1fae5' : '1px solid #e2e8f0'
              }}
            >
              <div style={{
                color: asset.cached ? '#10b981' : '#94a3b8',
                marginTop: '0.1rem'
              }}>
                {asset.cached ? <Check size={16} /> : <HardDrive size={16} />}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {asset.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {formatMB(asset.sizeBytes)} MB
                  </span>
                </div>
                <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {asset.desc}
                </p>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  color: asset.cached ? '#059669' : '#64748b'
                }}>
                  {asset.cached ? '● Stored in Cache Storage' : '○ Not yet cached'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
