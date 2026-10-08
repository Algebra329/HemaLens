import React from 'react';
import { Microscope, ShieldCheck, WifiOff, Cpu, Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="header-wrapper" style={{
      background: '#ffffff',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0.85rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        {/* Brand & Product Identifier (Scopio Labs Inspired) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #001437 0%, #372273 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(0, 20, 55, 0.15)',
            flexShrink: 0
          }}>
            <Microscope size={20} color="#ffffff" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)', margin: 0 }}>
                HemaLens
              </h1>
              <span className="clinical-badge badge-magenta" style={{ fontSize: '0.66rem', padding: '0.12rem 0.45rem' }}>
                Full-Field Morphology
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Point-of-Care Digital Cell Morphology • UnivaBio Edition
            </p>
          </div>
        </div>

        {/* Operational Status Indicators (Scopio Clean Pill Styling) */}
        <div className="header-badges-row" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div className="clinical-badge badge-emerald" title="Application operates entirely without an active internet connection">
            <WifiOff size={12} />
            <span>100% Offline</span>
          </div>

          <div className="clinical-badge badge-cyan" title="Models execute on client device hardware via WebAssembly">
            <Cpu size={12} />
            <span>WASM Engine</span>
          </div>

          <div className="clinical-badge badge-navy" title="No patient images are transmitted or saved outside the browser">
            <ShieldCheck size={12} color="var(--scopio-magenta)" />
            <span>Zero Data Egress</span>
          </div>
        </div>
      </div>
    </header>
  );
}
