import React from 'react';
import { Activity, ShieldCheck, WifiOff, Cpu } from 'lucide-react';

export default function Header() {
  return (
    <header style={{
      background: 'rgba(10, 15, 29, 0.95)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0.85rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      backdropFilter: 'blur(10px)'
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
        {/* Logo & Clinical Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.3))',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-sky)',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.25)'
          }}>
            <Activity size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>
                HemaScan <span style={{ color: 'var(--accent-cyan)', fontWeight: 400 }}>AI</span>
              </h1>
              <span className="clinical-badge badge-cyan" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem' }}>
                v1.0 • UnivaBio
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Point-of-Care Red Blood Cell Morphology Analyzer
            </p>
          </div>
        </div>

        {/* Operational Status Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div className="clinical-badge badge-emerald" title="Application operates entirely without an active internet connection">
            <WifiOff size={13} />
            <span>100% Offline Capable</span>
          </div>

          <div className="clinical-badge badge-cyan" title="Models execute on client device hardware via WebAssembly/WebGL">
            <Cpu size={13} />
            <span>WASM Inference</span>
          </div>

          <div className="clinical-badge" style={{
            background: 'rgba(59, 130, 246, 0.1)',
            color: 'var(--accent-sky)',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }} title="No patient images are transmitted or saved outside the browser">
            <ShieldCheck size={13} />
            <span>Zero Data Egress</span>
          </div>
        </div>
      </div>
    </header>
  );
}
