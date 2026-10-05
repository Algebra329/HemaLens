import React from 'react';
import { Microscope, ShieldCheck, WifiOff, Cpu, Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header style={{
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
        gap: '1rem'
      }}>
        {/* Brand & Product Identifier (Scopio Labs Inspired) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #001437 0%, #372273 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(0, 20, 55, 0.15)'
          }}>
            <Microscope size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                HemaScan <span style={{ color: 'var(--scopio-magenta)', fontWeight: 800 }}>AI</span>
              </h1>
              <span className="clinical-badge badge-magenta" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                Full-Field Morphology
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Point-of-Care Digital Cell Morphology System • UnivaBio Edition
            </p>
          </div>
        </div>

        {/* Operational Status Indicators (Scopio Clean Pill Styling) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div className="clinical-badge badge-emerald" title="Application operates entirely without an active internet connection">
            <WifiOff size={13} />
            <span>100% Offline Capable</span>
          </div>

          <div className="clinical-badge badge-cyan" title="Models execute on client device hardware via WebAssembly">
            <Cpu size={13} />
            <span>Client WASM Engine</span>
          </div>

          <div className="clinical-badge badge-navy" title="No patient images are transmitted or saved outside the browser">
            <ShieldCheck size={13} color="var(--scopio-magenta)" />
            <span>Zero Data Egress</span>
          </div>
        </div>
      </div>
    </header>
  );
}
