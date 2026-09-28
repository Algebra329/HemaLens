import React from 'react';
import { X, ZoomIn, Info, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { CLASS_BY_NAME } from '../inference/labels';

export default function CellInspectorModal({ cell, imageSrc, onClose }) {
  if (!cell) return null;

  const classInfo = CLASS_BY_NAME[cell.class] || {
    name: cell.class,
    color: '#94a3b8',
    isAbnormal: false,
    desc: 'Morphological variant'
  };

  const [bx, by, bw, bh] = cell.bbox || [0, 0, 60, 60];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 10, 20, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1.5rem'
    }} onClick={onClose}>
      <div
        className="glass-panel"
        style={{
          maxWidth: '560px',
          width: '100%',
          padding: '2rem',
          border: `1px solid ${classInfo.color}`,
          boxShadow: `0 10px 40px rgba(0, 0, 0, 0.8), 0 0 25px ${classInfo.color}30`,
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: classInfo.color,
            boxShadow: `0 0 10px ${classInfo.color}`
          }} />
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
              {classInfo.name.replace('_', ' ')}
            </h3>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: classInfo.isAbnormal ? 'var(--accent-rose)' : 'var(--accent-emerald)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              {classInfo.isAbnormal ? '• Atypical Morphology' : '• Normal Morphology'}
            </span>
          </div>
        </div>

        {/* Zoomed Cell Crop & Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Zoomed Canvas Region Preview */}
          <div style={{
            width: '170px',
            height: '170px',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            background: '#fdf4f5',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 0 15px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Cropped Smear Simulation */}
            <div style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <img
                src={imageSrc}
                alt="Cell crop"
                style={{
                  position: 'absolute',
                  width: '800px',
                  height: '600px',
                  left: `-${bx - 40}px`,
                  top: `-${by - 40}px`,
                  transform: 'scale(1.4)',
                  transformOrigin: `${bx}px ${by}px`
                }}
              />
            </div>

            {/* Reticle Overlay on Zoom */}
            <div style={{
              position: 'absolute',
              inset: 0,
              border: `2px dashed ${classInfo.color}`,
              borderRadius: '8px',
              pointerEvents: 'none'
            }} />
          </div>

          {/* Classification Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Classification Confidence
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                  {(cell.confidence * 100).toFixed(1)}%
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>High Certainty</span>
              </div>

              {/* Confidence Bar */}
              <div style={{ width: '100%', height: '6px', background: 'var(--bg-card)', borderRadius: '999px', overflow: 'hidden', marginBottom: '1rem' }}>
                <div style={{
                  width: `${cell.confidence * 100}%`,
                  height: '100%',
                  background: classInfo.color,
                  boxShadow: `0 0 8px ${classInfo.color}`
                }} />
              </div>

              {/* Coordinates */}
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                Slide Box: [x: {Math.round(bx)}, y: {Math.round(by)}, w: {Math.round(bw)}, h: {Math.round(bh)}]
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={14} color="var(--accent-teal)" />
              <span>Inferred via EfficientNet-B0 (WASM)</span>
            </div>
          </div>
        </div>

        {/* Clinical Rationale & Educational Description */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.86rem',
          lineHeight: '1.5',
          color: 'var(--text-main)',
          marginBottom: '1.5rem'
        }}>
          <strong style={{ color: classInfo.color, display: 'block', marginBottom: '0.35rem' }}>
            Clinical Morphological Criteria:
          </strong>
          {classInfo.desc}
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '0.65rem',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            color: 'var(--text-main)',
            fontWeight: 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-sky)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
        >
          Return to Smear Field
        </button>
      </div>
    </div>
  );
}
