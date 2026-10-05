import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside style={{
      background: '#fffbeb',
      borderBottom: '1px solid #fde68a',
      padding: '0.65rem 2rem',
      color: '#92400e',
      fontSize: '0.82rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        flex: 1
      }}>
        <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0 }} />
        <span>
          <strong>Decision-Support Notice:</strong> This platform performs algorithmic pre-characterization of peripheral blood smear micrographs for clinical research and triage. It does not replace diagnostic judgment. All findings must be corroborated by a qualified clinical pathologist.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss disclaimer"
        style={{
          background: 'none',
          border: 'none',
          color: '#b45309',
          cursor: 'pointer',
          padding: '0.2rem',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '4px',
          transition: 'color 0.15s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#78350f'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#b45309'}
      >
        <X size={15} />
      </button>
    </aside>
  );
}
