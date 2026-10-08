import React, { useEffect, useState } from 'react';
import { Microscope, Cpu, Layers, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export default function ScanningLoader({ imageSrc, expectedCount = 21, onScanComplete }) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(1); // 1 = Segmentation, 2 = Classification, 3 = Complete
  const [detectedCount, setDetectedCount] = useState(0);

  useEffect(() => {
    // Stage 1: Segmentation (0% - 50%) takes ~1000ms
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 48) {
          const nextProg = prev + 6;
          // Dynamically increment detected cell count as the laser sweeps
          const incrementalCount = Math.min(expectedCount, Math.round((nextProg / 48) * expectedCount));
          setDetectedCount(incrementalCount);
          return nextProg;
        } else if (prev < 52) {
          setStage(2);
          setDetectedCount(expectedCount);
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
  }, [expectedCount, onScanComplete]);

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
      background: '#090e1a',
      border: '1px solid var(--border-subtle)'
    }}>
      {/* Background Smear with Scanning Laser */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.35,
        filter: 'blur(1px) contrast(1.1)',
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

      {/* Central Diagnostic Status Card (Scopio Clean Floating White Card) */}
      <div className="glass-panel modal-content-responsive" style={{
        position: 'relative',
        zIndex: 20,
        maxWidth: '520px',
        width: '92%',
        padding: '1.5rem',
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 20px 45px -5px rgba(0, 20, 55, 0.25)',
        borderRadius: '14px'
      }}>
        {/* Reticle / Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.15rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#fdf2f8',
              border: '1px solid #fbcfe8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--scopio-magenta)',
              flexShrink: 0
            }}>
              <Microscope size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Scanning Monolayer Field
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Full-Field Computational Morphology Pipeline
              </p>
            </div>
          </div>

          <span className="clinical-badge badge-magenta" style={{ fontFamily: 'var(--font-mono)' }}>
            {progress}%
          </span>
        </div>

        {/* Progress Bar (Scopio Magenta Gradient) */}
        <div style={{
          width: '100%',
          height: '8px',
          background: '#f1f5f9',
          borderRadius: '999px',
          overflow: 'hidden',
          marginBottom: '1.25rem',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #ef1aa9 0%, #372273 100%)',
            transition: 'width 0.12s ease',
            borderRadius: '999px'
          }} />
        </div>

        {/* Step-by-Step Diagnostic Indicators */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem' }}>
          {/* Step 1: Segmentation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.6rem 0.8rem',
            borderRadius: '8px',
            background: stage >= 1 ? '#f8fafc' : 'transparent',
            border: stage >= 1 ? '1px solid #e2e8f0' : '1px solid transparent',
            flexWrap: 'wrap',
            gap: '0.4rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <Layers size={15} color={stage >= 1 ? 'var(--scopio-magenta)' : 'var(--text-dim)'} />
              <span style={{ color: stage >= 1 ? 'var(--text-main)' : 'var(--text-dim)', fontWeight: stage === 1 ? 600 : 500 }}>
                1. Erythrocyte Segmentation (U-Net)
              </span>
            </div>
            {stage > 1 ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-emerald)', fontSize: '0.74rem', fontWeight: 600 }}>
                <CheckCircle2 size={13} /> {detectedCount} Cells Isolated
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--scopio-magenta)', fontSize: '0.74rem' }}>
                <Loader2 size={13} className="animate-spin" /> Segmenting...
              </span>
            )}
          </div>

          {/* Step 2: Classification */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.6rem 0.8rem',
            borderRadius: '8px',
            background: stage >= 2 ? '#f8fafc' : 'transparent',
            border: stage >= 2 ? '1px solid #e2e8f0' : '1px solid transparent',
            flexWrap: 'wrap',
            gap: '0.4rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <Cpu size={15} color={stage >= 2 ? 'var(--scopio-magenta)' : 'var(--text-dim)'} />
              <span style={{ color: stage >= 2 ? 'var(--text-main)' : 'var(--text-dim)', fontWeight: stage === 2 ? 600 : 500 }}>
                2. 13-Class Morphology (EfficientNet)
              </span>
            </div>
            {stage > 2 ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-emerald)', fontSize: '0.74rem', fontWeight: 600 }}>
                <CheckCircle2 size={13} /> Complete
              </span>
            ) : stage === 2 ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--scopio-magenta)', fontSize: '0.74rem' }}>
                <Loader2 size={13} className="animate-spin" /> Classifying...
              </span>
            ) : (
              <span style={{ color: 'var(--text-dim)', fontSize: '0.74rem' }}>Waiting</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
