import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

const PRESET_SAMPLES = [
  {
    id: 'normal',
    title: 'Normal Blood Smear',
    subtitle: 'Healthy biconcave erythrocytes (normocytic, normochromic)',
    src: '/samples/smear_normal.svg',
    badge: 'Baseline Control',
    badgeColor: 'var(--accent-emerald)',
    features: ['Uniform central pallor', 'Average diameter 7-8µm', 'Intact morphology']
  },
  {
    id: 'thalassemia',
    title: 'Target Cells & Microcytes',
    subtitle: 'Thalassemia / Hemoglobinopathy morphological hallmark',
    src: '/samples/smear_thalassemia.svg',
    badge: 'Hypochromic Microcytic',
    badgeColor: 'var(--accent-amber)',
    features: ['Codocytes (Bullseye RBCs)', 'Marked central pallor', 'Microcytic diameter (<6µm)']
  },
  {
    id: 'spherocytosis',
    title: 'Spherocytes & Fragments',
    subtitle: 'Hereditary Spherocytosis & Hemolytic features',
    src: '/samples/smear_spherocytosis.svg',
    badge: 'Hyperchromic / Hemolytic',
    badgeColor: 'var(--accent-rose)',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: isDragging ? '2px dashed var(--accent-cyan)' : '2px dashed var(--border-subtle)',
          borderRadius: '14px',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          background: isDragging ? 'rgba(6, 182, 212, 0.06)' : 'rgba(14, 23, 42, 0.5)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isDragging ? '0 0 25px rgba(6, 182, 212, 0.2)' : 'none'
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
          background: 'rgba(56, 189, 248, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-sky)',
          margin: '0 auto 1rem'
        }}>
          <UploadCloud size={28} />
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
          Drop blood smear image here, or <span style={{ color: 'var(--accent-sky)', textDecoration: 'underline' }}>browse</span>
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', maxWidth: '420px', margin: '0 auto' }}>
          Supports high-resolution Wright-Giemsa peripheral smear micrographs (1000x oil immersion recommended).
        </p>
      </div>

      {/* Preset Section Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <Sparkles size={16} color="var(--accent-cyan)" />
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Or Load Reference Clinical Presets (1-Click Test)
          </h4>
        </div>

        {/* 3 Preset Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem'
        }}>
          {PRESET_SAMPLES.map((preset) => (
            <div
              key={preset.id}
              onClick={() => selectPreset(preset)}
              className="glass-panel"
              style={{
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--border-subtle)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.5)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    color: preset.badgeColor,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${preset.badgeColor}40`
                  }}>
                    {preset.badge}
                  </span>
                  <ImageIcon size={16} color="var(--text-dim)" />
                </div>

                <div style={{
                  height: '110px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  marginBottom: '0.75rem',
                  border: '1px solid var(--border-subtle)',
                  background: '#fdf4f5',
                  position: 'relative'
                }}>
                  <img
                    src={preset.src}
                    alt={preset.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <h5 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                  {preset.title}
                </h5>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '0.75rem' }}>
                  {preset.subtitle}
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.76rem',
                color: 'var(--accent-sky)',
                fontWeight: 500
              }}>
                <span>Analyze Smear</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
