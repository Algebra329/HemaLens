import React from 'react';
import { X, Printer, Download, CheckCircle, AlertTriangle, FileText, Microscope, ShieldCheck, Copy, Check } from 'lucide-react';
import { RBC_CLASSES, CLASS_BY_NAME } from '../inference/labels';

export default function ClinicalReportModal({ results = [], imageSrc, onClose }) {
  const [copied, setCopied] = React.useState(false);

  const totalCells = results.length;
  const countsByClass = {};
  RBC_CLASSES.forEach(c => { countsByClass[c.name] = 0; });

  results.forEach(cell => {
    if (countsByClass[cell.class] !== undefined) {
      countsByClass[cell.class]++;
    }
  });

  const normalCount = countsByClass["Normal"] || 0;
  const uncategorisedCount = countsByClass["Uncategorised"] || 0;
  const abnormalCount = totalCells - normalCount - uncategorisedCount;
  const abnormalPct = totalCells > 0 ? (abnormalCount / totalCells) * 100 : 0;

  // Standard Clinical Poikilocytosis Grading (CAP / CLSI Guidelines)
  let poikilocytosisGrade = "None (Within Reference Range)";
  let gradeBadgeColor = "var(--accent-emerald)";
  if (abnormalPct > 25) {
    poikilocytosisGrade = "Marked (3+)";
    gradeBadgeColor = "var(--scopio-magenta)";
  } else if (abnormalPct > 10) {
    poikilocytosisGrade = "Moderate (2+)";
    gradeBadgeColor = "var(--accent-amber)";
  } else if (abnormalPct >= 5) {
    poikilocytosisGrade = "Slight (1+)";
    gradeBadgeColor = "var(--accent-cyan)";
  }

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const summaryLines = [
      "=== PERIPHERAL BLOOD SMEAR MORPHOLOGY REPORT ===",
      `Specimen ID: PBS-${Date.now().toString().slice(-6)}`,
      `Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      `Total RBCs Counted: ${totalCells}`,
      `Normal Erythrocytes: ${normalCount} (${totalCells > 0 ? ((normalCount / totalCells) * 100).toFixed(1) : 0}%)`,
      `Atypical Erythrocytes: ${abnormalCount} (${abnormalPct.toFixed(1)}%)`,
      `Poikilocytosis Grade: ${poikilocytosisGrade}`,
      "",
      "--- MORPHOLOGICAL DIFFERENTIAL BREAKDOWN ---",
      ...RBC_CLASSES
        .filter(c => (countsByClass[c.name] || 0) > 0)
        .map(c => {
          const count = countsByClass[c.name];
          const pct = ((count / totalCells) * 100).toFixed(1);
          return `- ${c.name.replace('_', ' ')}: ${count} cells (${pct}%) — ${c.desc}`;
        }),
      "",
      "NOTICE: For investigational and decision-support use only. Requires laboratory technologist / pathologist verification."
    ];

    navigator.clipboard.writeText(summaryLines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 20, 55, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 120,
      padding: '1.5rem',
      overflowY: 'auto'
    }} onClick={onClose}>
      <div
        className="glass-panel report-sheet"
        style={{
          maxWidth: '860px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 25px 60px -10px rgba(0, 20, 55, 0.35)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Report Top Bar / Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.75rem',
          background: '#ffffff',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={18} color="var(--scopio-magenta)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Clinical Morphology Differential Examination
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              onClick={handleCopySummary}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: copied ? 'var(--accent-emerald)' : 'var(--text-main)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.95rem',
                background: 'var(--scopio-magenta)',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(239, 26, 169, 0.3)'
              }}
            >
              <Printer size={14} />
              <span>Print / PDF Export</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Sheet Body */}
        <div style={{
          padding: '2rem 2.25rem',
          overflowY: 'auto',
          background: '#ffffff',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {/* Clinical Header Banner */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid #001437',
            paddingBottom: '1.25rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Microscope size={22} color="var(--scopio-magenta)" />
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  LABORATORY RBC MORPHOLOGY EXAMINATION
                </h1>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Automated Monolayer High-Resolution Digital Differential Report
              </p>
            </div>

            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div>Specimen ID: <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>PBS-2026-0941</strong></div>
              <div>Optical Magnification: <strong>1000x Oil Immersion</strong></div>
              <div>Report Date: <strong>{new Date().toLocaleDateString()}</strong></div>
            </div>
          </div>

          {/* Quick Metrics Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.85rem'
          }}>
            <div style={{ background: '#f8fafc', padding: '0.9rem 1.1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Total Evaluated</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{totalCells} RBCs</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.9rem 1.1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Normocytic Count</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                {totalCells > 0 ? `${((normalCount / totalCells) * 100).toFixed(1)}%` : '—'}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.9rem 1.1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Atypical Morphologies</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: abnormalCount > 0 ? 'var(--scopio-magenta)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {abnormalPct.toFixed(1)}%
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.9rem 1.1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Poikilocytosis Grade</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: gradeBadgeColor, marginTop: '0.25rem' }}>
                {poikilocytosisGrade}
              </div>
            </div>
          </div>

          {/* Morphological Differential Table */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Morphological Differential Breakdown
              </h4>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                Standardized 13-Class Chula-RBC Reference Schema
              </span>
            </div>

            <div style={{
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              overflow: 'hidden',
              background: '#ffffff'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '0.65rem 0.95rem', color: '#001437', fontWeight: 700 }}>Morphological Class</th>
                    <th style={{ padding: '0.65rem 0.95rem', color: '#001437', fontWeight: 700 }}>Count</th>
                    <th style={{ padding: '0.65rem 0.95rem', color: '#001437', fontWeight: 700 }}>Frequency</th>
                    <th style={{ padding: '0.65rem 0.95rem', color: '#001437', fontWeight: 700 }}>Grade</th>
                    <th style={{ padding: '0.65rem 0.95rem', color: '#001437', fontWeight: 700 }}>Clinical Correlation</th>
                  </tr>
                </thead>
                <tbody>
                  {RBC_CLASSES.map((cls, idx) => {
                    const count = countsByClass[cls.name] || 0;
                    const pct = totalCells > 0 ? (count / totalCells) * 100 : 0;
                    let grade = "—";
                    if (cls.isAbnormal && count > 0) {
                      if (pct >= 25) grade = "3+ Marked";
                      else if (pct >= 10) grade = "2+ Moderate";
                      else grade = "1+ Slight";
                    } else if (cls.name === "Normal" && count > 0) {
                      grade = "Normocytic";
                    }

                    return (
                      <tr
                        key={cls.name}
                        style={{
                          borderBottom: idx < RBC_CLASSES.length - 1 ? '1px solid #e2e8f0' : 'none',
                          background: count > 0 && cls.isAbnormal ? '#fdf2f8' : 'transparent'
                        }}
                      >
                        <td style={{ padding: '0.6rem 0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cls.color }} />
                          <span style={{ color: count > 0 ? 'var(--text-main)' : 'var(--text-dim)' }}>
                            {cls.name.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '0.6rem 0.95rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: count > 0 ? 'var(--text-main)' : 'var(--text-dim)' }}>
                          {count}
                        </td>
                        <td style={{ padding: '0.6rem 0.95rem', fontFamily: 'var(--font-mono)', color: count > 0 ? 'var(--text-main)' : 'var(--text-dim)' }}>
                          {pct > 0 ? `${pct.toFixed(1)}%` : '0%'}
                        </td>
                        <td style={{ padding: '0.6rem 0.95rem' }}>
                          <span style={{
                            fontSize: '0.74rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            background: cls.isAbnormal && count > 0 ? '#fdf2f8' : '#f1f5f9',
                            color: cls.isAbnormal && count > 0 ? 'var(--scopio-magenta)' : 'var(--text-dim)',
                            border: `1px solid ${cls.isAbnormal && count > 0 ? '#fbcfe8' : '#e2e8f0'}`,
                            fontWeight: 600
                          }}>
                            {grade}
                          </span>
                        </td>
                        <td style={{ padding: '0.6rem 0.95rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                          {cls.desc}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Regulatory Disclaimer & Sign-off Box */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '1.5rem',
            padding: '1.15rem',
            background: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            fontSize: '0.78rem',
            color: 'var(--text-dim)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-amber)', marginBottom: '0.35rem', fontWeight: 700 }}>
                <AlertTriangle size={15} />
                <span>DECISION-SUPPORT NOTICE</span>
              </div>
              <p style={{ lineHeight: '1.45' }}>
                This automated differential analysis is computed on-device via neural networks (U-Net & EfficientNet). It does not provide medical diagnoses. All findings must be corroborated by a qualified medical technologist or hematologist.
              </p>
            </div>

            <div style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ display: 'block', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em', fontWeight: 700, color: 'var(--text-main)' }}>
                  Pathologist / Reviewer Verification
                </span>
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Pending clinical review sign-off</span>
              </div>
              <div style={{ borderBottom: '1px dashed #64748b', marginTop: '1.5rem', width: '85%' }} />
              <div style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>Technologist Signature / Date</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
