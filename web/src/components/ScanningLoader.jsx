import React, { useEffect, useState } from 'react';
import { Microscope, Cpu, Layers, CheckCircle2, Loader2 } from 'lucide-react';

export default function ScanningLoader({ imageSrc, onScanComplete }) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(1); // 1 = Segmentation, 2 = Classification, 3 = Complete
  const [detectedCount, setDetectedCount] = useState(0);

  useEffect(() => {
    // Stage 1: Segmentation (0% - 50%) takes ~1000ms
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 48) {
          return prev + 6;
        } else if (prev < 52) {
          setStage(2);
          setDetectedCount(24);
          return 55;
        } else if (prev < 95) {
          return prev + 5;
        } else {
          clearInterval(interval);
          setStage(3);
          setTimeout(() => {
            if (onScanComplete) onScanComplete();
          }, 350);
          return 100;
        }
      });
    }, 110);

    return () => clearInterval(interval);
  }, [onScanComplete]);

  return (
    <div style={{
      width: '100%',
      minHeight: '480px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      borderRadius: '12px',
      overflow: 'hidden',
      background: 'rgba(7, 13, 25, 0.95)',
      border: '1px solid var(--border-highlight)'
    }}>
      {/* Background Smear with Scanning Laser & Grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.35,
        filter: 'blur(1px) contrast(1.2)',
        overflow: 'hidden'
      }}>
        {imageSrc && (
          <img
            src={imageSrc}
            alt="Analyzing smear"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )}
      </div>

      <div className="scanner-grid-overlay" />
      <div className="scanner-laser-line" />

      {/* Central Diagnostic Status Card */}
      <div className="glass-panel" style={{
        position: 'relative',
        zIndex: 20,
        maxWidth: '520px',
        width: '90%',
        padding: '2rem',
        border: '1px solid rgba(56, 189, 248, 0.4)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(6, 182, 212, 0.15)'
      }}>
        {/* Reticle / Pulse Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-sky)'
            }}>
              <Microscope size={20} className="animate-spin" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>
                Analyzing Microscopic Field
              </h3>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Two-stage in-browser ONNX inference active
              </p>
            </div>
          </div>
          <span className="clinical-badge badge-cyan" style={{ fontFamily: 'var(--font-mono)' }}>
            {progress}%
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '6px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '9999px',
          overflow: 'hidden',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #06b6d4, #3b82f6)',
            boxShadow: '0 0 10px #38bdf8',
            transition: 'width 0.12s linear'
          }} />
        </div>

        {/* Pipeline Stages */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Stage 1: MONAI U-Net */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: stage === 1 ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-card)',
            border: stage === 1 ? '1px solid var(--accent-sky)' : '1px solid var(--border-subtle)',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Layers size={18} color={stage >= 1 ? 'var(--accent-cyan)' : 'var(--text-dim)'} />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Stage 1: Cell Segmentation (MONAI U-Net)
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {stage === 1 ? 'Extracting 256x256 tensor & isolating cell contours...' : '24 candidate erythrocyte regions isolated'}
                </div>
              </div>
            </div>
            {stage > 1 ? (
              <CheckCircle2 size={18} color="var(--accent-emerald)" />
            ) : (
              <Loader2 size={16} color="var(--accent-sky)" style={{ animation: 'reticleSpin 1s linear infinite' }} />
            )}
          </div>

          {/* Stage 2: EfficientNet-B0 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: stage === 2 ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-card)',
            border: stage === 2 ? '1px solid var(--accent-sky)' : '1px solid var(--border-subtle)',
            transition: 'all 0.2s ease',
            opacity: stage >= 2 ? 1 : 0.6
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Cpu size={18} color={stage >= 2 ? 'var(--accent-teal)' : 'var(--text-dim)'} />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Stage 2: Morphology Classification (EfficientNet-B0)
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {stage >= 2 ? 'Scoring crops across 13 classes with Focal Loss...' : 'Awaiting segmentation regions...'}
                </div>
              </div>
            </div>
            {stage === 3 ? (
              <CheckCircle2 size={18} color="var(--accent-emerald)" />
            ) : stage === 2 ? (
              <Loader2 size={16} color="var(--accent-sky)" style={{ animation: 'reticleSpin 1s linear infinite' }} />
            ) : (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Queued</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
