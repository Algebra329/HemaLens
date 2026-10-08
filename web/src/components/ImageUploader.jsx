import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

const PRESET_SAMPLES = [
  {
    id: 'normal',
    title: 'Normal Blood Smear',
    subtitle: 'Healthy biconcave erythrocytes (normocytic, normochromic)',
    src: '/samples/smear_normal.svg',
    badge: 'Baseline Control',
    badgeClass: 'badge-emerald',
    features: ['Uniform central pallor', 'Average diameter 7-8µm', 'Intact morphology']
  },
  {
    id: 'thalassemia',
    title: 'Target Cells & Microcytes',
    subtitle: 'Thalassemia / Hemoglobinopathy morphological hallmark',
    src: '/samples/smear_thalassemia.svg',
    badge: 'Hypochromic Microcytic',
    badgeClass: 'badge-amber',
    features: ['Codocytes (Bullseye RBCs)', 'Marked central pallor', 'Microcytic diameter (<6µm)']
  },
  {
    id: 'spherocytosis',
    title: 'Spherocytes & Fragments',
    subtitle: 'Hereditary Spherocytosis & Hemolytic features',
    src: '/samples/smear_spherocytosis.svg',
    badge: 'Hyperchromic / Hemolytic',
    badgeClass: 'badge-rose',
    features: ['Dense round spherocytes', 'Absent central pallor', 'Schistocyte helmet fragments']
  }
];

export default function ImageUploader({ onSelectImage }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (.jpg, .png, .webp).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      onSelectImage({
        src: event.target.result,
        name: file.name,
        isPreset: false,
        presetId: null
      });
    };
    reader.readAsDataURL(file);
  };

  const selectPreset = (preset) => {
    onSelectImage({
      src: preset.src,
      name: preset.title,
      isPreset: true,
      presetId: preset.id
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%' }}>
      {/* Drag & Drop Upload Zone (Scopio Clean Style) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: isDragging ? '2px dashed var(--scopio-magenta)' : '2px dashed #cbd5e1',
          borderRadius: '14px',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          background: isDragging ? '#fdf2f8' : '#f8fafc',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isDragging ? '0 0 20px rgba(239, 26, 169, 0.15)' : 'none'
        }}
        onMouseEnter={(e) => {
          if (!isDragging) e.currentTarget.style.borderColor = 'var(--scopio-magenta)';
        }}
        onMouseLeave={(e) => {
          if (!isDragging) e.currentTarget.style.borderColor = '#cbd5e1';
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileInput}
        />

        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #fdf2f8 0%, #f1f5f9 100%)',
          border: '1px solid #fbcfe8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--scopio-magenta)',
          margin: '0 auto 1rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <UploadCloud size={28} />
        </div>

        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
          Drop peripheral blood smear image here, or <span style={{ color: 'var(--scopio-magenta)', textDecoration: 'underline' }}>browse</span>
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', maxWidth: '460px', margin: '0 auto' }}>
          Supports high-resolution Wright-Giemsa peripheral smear micrographs (1000x oil immersion equivalent).
        </p>
      </div>

      {/* Preset Section Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <Sparkles size={16} color="var(--scopio-magenta)" />
          <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Or Select Reference Clinical Presets (1-Click Test)
          </h4>
        </div>

        {/* 3 Clean Preset Cards (Scopio Card Style) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '1rem'
        }}>
          {PRESET_SAMPLES.map((preset) => (
            <div
              key={preset.id}
              onClick={() => selectPreset(preset)}
              className="glass-panel"
              style={{
                padding: '1.15rem',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: '#ffffff',
                border: '1px solid var(--border-subtle)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--scopio-magenta)';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 28px -4px rgba(0, 20, 55, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <span className={`clinical-badge ${preset.badgeClass}`} style={{ fontSize: '0.7rem' }}>
                    {preset.badge}
                  </span>
                  <ImageIcon size={16} color="var(--text-dim)" />
                </div>

                <div style={{
                  height: '115px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  marginBottom: '0.85rem',
                  border: '1px solid var(--border-subtle)',
                  background: '#f8fafc',
                  position: 'relative'
                }}>
                  <img
                    src={preset.src}
                    alt={preset.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <h5 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                  {preset.title}
                </h5>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '0.85rem' }}>
                  {preset.subtitle}
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.65rem',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.8rem',
                color: 'var(--scopio-magenta)',
                fontWeight: 600
              }}>
                <span>Analyze Slide</span>
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
