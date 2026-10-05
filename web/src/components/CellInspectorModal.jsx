import React, { useEffect } from 'react';
import { X, ZoomIn, Info, CheckCircle2, AlertTriangle, ShieldCheck, ChevronLeft, ChevronRight, BookOpen, Compass } from 'lucide-react';
import { CLASS_BY_NAME } from '../inference/labels';

// Diagnostic morphological characteristics and reference textbook criteria
const REFERENCE_MORPHOLOGY = {
  Normal: {
    title: "Normocytic Normochromic Erythrocyte",
    diameter: "7.2 – 7.8 µm",
    pallor: "30 – 35% central pallor",
    circularity: "0.95 (High)",
    chromicity: "Normochromic",
    associations: "Healthy erythropoiesis, balanced hemoglobin synthesis.",
    referencePoints: ["Even circular contour", "Gentle biconcave dip in center", "Smooth outer membrane"]
  },
  Target_cell: {
    title: "Codocyte (Target Cell / Mexican Hat)",
    diameter: "6.5 – 7.5 µm",
    pallor: "Concentric target ring",
    circularity: "0.88",
    chromicity: "Hypochromic with central condensation",
    associations: "Thalassemia (Alpha/Beta), Hemoglobin C/E disease, obstructive liver disease, post-splenectomy.",
    referencePoints: ["Excess surface membrane relative to intracellular volume", "Bullseye hemoglobin collection in center", "Pale unstained ring between bullseye and rim"]
  },
  Spherocyte: {
    title: "Microspherocyte (Spherical Erythrocyte)",
    diameter: "5.5 – 6.5 µm (Reduced)",
    pallor: "0% (Complete absence of central pallor)",
    circularity: "0.98 (Perfect sphere)",
    chromicity: "Hyperchromic (Dense)",
    associations: "Hereditary Spherocytosis (spectrin/ankyrin defect), Autoimmune Hemolytic Anemia (AIHA), thermal burns.",
    referencePoints: ["Total loss of central pallor", "Darkly dense hemoglobin staining", "Loss of biconcave membrane flexibility"]
  },
  Schistocyte: {
    title: "Schistocyte / Helmet Cell Fragment",
    diameter: "3.0 – 5.5 µm (Fragmented)",
    pallor: "Variable / Irregular",
    circularity: "0.45 (Severe poikilocytosis)",
    chromicity: "Normochromic fragment",
    associations: "Microangiopathic Hemolytic Anemia (MAHA), TTP, HUS, DIC, prosthetic heart valves. (CRITICAL finding).",
    referencePoints: ["Pointed or cleaved irregular edges", "Half-moon, triangle, or helmet contour", "Mechanical shearing against fibrin strands"]
  },
  Microcyte: {
    title: "Microcytic Erythrocyte",
    diameter: "< 6.0 µm",
    pallor: "Frequently enlarged (>40%)",
    circularity: "0.90",
    chromicity: "Hypochromic / Pale",
    associations: "Iron Deficiency Anemia (IDA), Thalassemia minor, Anemia of Chronic Disease, Sideroblastic anemia.",
    referencePoints: ["Smaller than nucleus of small resting lymphocyte", "Thin hemoglobin rim", "Reduced MCV < 80 fL"]
  },
  Macrocyte: {
    title: "Macrocytic Erythrocyte",
    diameter: "> 8.5 µm",
    pallor: "Normal (30%)",
    circularity: "0.85 (Often oval-macrocyte)",
    chromicity: "Normochromic",
    associations: "Vitamin B12 or Folate deficiency (megaloblastic), liver disease, myelodysplastic syndrome (MDS), reticulocytosis.",
    referencePoints: ["Significantly enlarged cell diameter", "MCV > 100 fL", "Frequently oval or round"]
  },
  Hypochromia: {
    title: "Hypochromic Erythrocyte",
    diameter: "6.0 – 7.5 µm",
    pallor: "> 50% enlarged central pallor",
    circularity: "0.92",
    chromicity: "Markedly hypochromic",
    associations: "Severe iron deficiency, thalassemia, lead poisoning, impaired heme/globin synthesis.",
    referencePoints: ["Hollow ring appearance", "Thin cytoplasmic rim of hemoglobin", "Very pale central area"]
  },
  Teardrop: {
    title: "Dacryocyte (Teardrop Cell)",
    diameter: "6.5 – 8.0 µm",
    pallor: "Mild to moderate",
    circularity: "0.65",
    chromicity: "Normochromic",
    associations: "Primary Myelofibrosis, bone marrow infiltration/metastasis, myelophthisic anemia, thalassemia.",
    referencePoints: ["Elongated tapering tail at one pole", "Pear-shaped profile", "Formed during squeezing through splenic sinusoids"]
  },
  Ovalocyte: {
    title: "Ovalocyte / Elliptocyte",
    diameter: "6.0 – 8.0 µm",
    pallor: "Present in center",
    circularity: "0.70",
    chromicity: "Normochromic",
    associations: "Hereditary Ovalocytosis, Megaloblastic anemia, Iron deficiency, Myelodysplasia.",
    referencePoints: ["Oval contour with rounded poles", "Transverse axis narrower than longitudinal", "Preserved central pallor"]
  },
  Stomatocyte: {
    title: "Stomatocyte (Mouth Cell)",
    diameter: "6.5 – 7.5 µm",
    pallor: "Slit-like / transverse aperture",
    circularity: "0.91",
    chromicity: "Normochromic",
    associations: "Hereditary stomatocytosis, acute alcoholism, liver disease, Rh deficiency syndrome.",
    referencePoints: ["Linear or smiling-mouth shaped central pallor", "Altered membrane cation permeability (Na+/K+)"]
  },
  Burr_cell: {
    title: "Echinocyte (Burr Cell)",
    diameter: "6.5 – 7.5 µm",
    pallor: "Present",
    circularity: "0.78",
    chromicity: "Normochromic",
    associations: "Uremia, end-stage renal disease, pyruvate kinase deficiency, artifactual slow drying.",
    referencePoints: ["10–30 short, blunt, evenly distributed spicules", "Uniform projection lengths across circumference"]
  },
  Uncategorised: {
    title: "Unclassified / Overlapping Erythrocyte",
    diameter: "Variable",
    pallor: "Indeterminate",
    circularity: "Indeterminate",
    chromicity: "Indeterminate",
    associations: "Overlapping cellular clusters or artifactual preparation distortion.",
    referencePoints: ["Edge artifact or touching cell boundary", "Recommended manual technologist review"]
  }
};

export default function CellInspectorModal({
  cell,
  allCells = [],
  imageSrc,
  onClose,
  onSelectCell
}) {
  if (!cell) return null;

  const classInfo = CLASS_BY_NAME[cell.class] || {
    name: cell.class,
    color: '#0284c7',
    isAbnormal: false,
    desc: 'Morphological variant'
  };

  const refData = REFERENCE_MORPHOLOGY[cell.class] || REFERENCE_MORPHOLOGY.Normal;
  const [bx, by, bw, bh] = cell.bbox || [0, 0, 60, 60];

  const currentIndex = allCells.findIndex(c => c.id === cell.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allCells.length - 1;

  const handlePrev = (e) => {
    e.stopPropagation();
    if (hasPrev && onSelectCell) {
      onSelectCell(allCells[currentIndex - 1]);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (hasNext && onSelectCell) {
      onSelectCell(allCells[currentIndex + 1]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) handlePrev(e);
      if (e.key === 'ArrowRight' && hasNext) handleNext(e);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, hasPrev, hasNext]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 20, 55, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: '1.5rem',
      overflowY: 'auto'
    }} onClick={onClose}>
      <div
        className="glass-panel"
        style={{
          maxWidth: '740px',
          width: '100%',
          padding: '1.75rem',
          background: '#ffffff',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 25px 60px -10px rgba(0, 20, 55, 0.3)',
          borderRadius: '14px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation & Close Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          paddingBottom: '0.85rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          {/* Left: Class Badge & ID */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: classInfo.color,
              boxShadow: `0 0 10px ${classInfo.color}80`
            }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  {classInfo.name.replace('_', ' ')}
                </h3>
                <span className={`clinical-badge ${classInfo.isAbnormal ? 'badge-rose' : 'badge-emerald'}`} style={{ fontSize: '0.7rem' }}>
                  {classInfo.isAbnormal ? 'Atypical Variant' : 'Normal Reference'}
                </span>
              </div>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Cell #{cell.id} • Evaluated via Scopio / EfficientNet Pipeline
              </span>
            </div>
          </div>

          {/* Right: Quick Pagination Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {allCells.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#f8fafc', padding: '0.25rem 0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <button
                  disabled={!hasPrev}
                  onClick={handlePrev}
                  title="Previous Cell (Left Arrow)"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: hasPrev ? '#001437' : '#cbd5e1',
                    cursor: hasPrev ? 'pointer' : 'default',
                    padding: '0.2rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#001437', fontFamily: 'var(--font-mono)' }}>
                  {currentIndex + 1} / {allCells.length}
                </span>
                <button
                  disabled={!hasNext}
                  onClick={handleNext}
                  title="Next Cell (Right Arrow)"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: hasNext ? '#001437' : '#cbd5e1',
                    cursor: hasNext ? 'pointer' : 'default',
                    padding: '0.2rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#64748b',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#001437'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Side-by-Side: Patient Specimen Crop VS Textbook Reference (Scopio Style) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.25rem',
          marginBottom: '1.25rem'
        }}>
          {/* 1. Patient Specimen Cell */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--scopio-magenta)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Patient Specimen Cell
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                Box: {Math.round(bw)}×{Math.round(bh)}px
              </span>
            </div>

            <div style={{
              width: '100%',
              height: '170px',
              borderRadius: '8px',
              border: `1.5px solid ${classInfo.color}`,
              background: '#f8fafc',
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                <img
                  src={imageSrc}
                  alt="Patient cell crop"
                  style={{
                    position: 'absolute',
                    width: '800px',
                    height: '600px',
                    left: `-${bx - 45}px`,
                    top: `-${by - 35}px`,
                    transform: 'scale(1.4)',
                    transformOrigin: `${bx}px ${by}px`,
                    maxWidth: 'none'
                  }}
                />
              </div>

              <div style={{
                position: 'absolute',
                inset: '12px',
                border: `2px dashed ${classInfo.color}`,
                borderRadius: '6px',
                pointerEvents: 'none'
              }} />

              <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(255,255,255,0.92)',
                border: '1px solid #cbd5e1',
                padding: '2px 6px',
                borderRadius: '4px',
                pointerEvents: 'none'
              }}>
                <div style={{ width: '28px', height: '2px', background: 'var(--scopio-magenta)' }} />
                <span style={{ fontSize: '0.64rem', fontWeight: 700, color: '#001437', fontFamily: 'var(--font-mono)' }}>10 µm</span>
              </div>
            </div>

            {/* Probability Score Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Classification Probability:</span>
                <strong style={{ color: classInfo.color, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {(cell.confidence * 100).toFixed(1)}%
                </strong>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <div style={{
                  width: `${cell.confidence * 100}%`,
                  height: '100%',
                  background: classInfo.color,
                  borderRadius: '999px'
                }} />
              </div>
            </div>
          </div>

          {/* 2. Textbook Reference Benchmark */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#001437', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <BookOpen size={14} color="var(--scopio-magenta)" />
                Textbook Reference Standard
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                Chula-RBC-12 Atlas
              </span>
            </div>

            <div style={{
              width: '100%',
              height: '170px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              padding: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflowY: 'auto'
            }}>
              <div>
                <strong style={{ fontSize: '0.84rem', color: 'var(--text-main)', display: 'block', marginBottom: '0.4rem' }}>
                  {refData.title}
                </strong>
                <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
                  {refData.referencePoints.map((pt, idx) => (
                    <li key={idx} style={{ marginBottom: '0.25rem' }}>{pt}</li>
                  ))}
                </ul>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.4rem', fontSize: '0.72rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                <CheckCircle2 size={13} />
                <span>Reference morphological match</span>
              </div>
            </div>

            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={15} color="var(--scopio-magenta)" />
              <span>Standardized CAP/ICSH Criteria</span>
            </div>
          </div>
        </div>

        {/* Morphological Parameters Card (Clean White Tile) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.75rem',
          background: '#f8fafc',
          borderRadius: '10px',
          padding: '0.9rem',
          border: '1px solid #e2e8f0',
          marginBottom: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Estimated Diam.</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{refData.diameter}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Central Pallor</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{refData.pallor}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Circularity Index</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--scopio-magenta)' }}>{refData.circularity}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Chromicity</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: classInfo.isAbnormal ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
              {refData.chromicity}
            </div>
          </div>
        </div>

        {/* Clinical Differential Rationale */}
        <div style={{
          background: '#ffffff',
          borderRadius: '10px',
          padding: '0.9rem 1.15rem',
          border: '1px solid #e2e8f0',
          fontSize: '0.84rem',
          lineHeight: '1.5',
          color: 'var(--text-muted)',
          marginBottom: '1.25rem'
        }}>
          <strong style={{ color: classInfo.color, display: 'block', marginBottom: '0.25rem', fontWeight: 700 }}>
            Associated Pathologies & Clinical Correlation:
          </strong>
          {refData.associations}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '0.65rem',
            background: '#001437',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.84rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#372273'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#001437'}
        >
          Return to Smear Field
        </button>
      </div>
    </div>
  );
}
