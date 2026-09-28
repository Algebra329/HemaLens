import React, { useState } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

export default function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside style={{
      background: 'rgba(245, 158, 11, 0.08)',
      borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
      padding: '0.65rem 2rem',
      color: '#fef3c7',
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
        <AlertTriangle size={16} color="var(--accent-amber)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Clinical Decision Support / Research Demo:</strong> This software classifies morphological features in peripheral blood smears for triage and research purposes only. It is not an autonomous diagnostic medical device. Morphological findings must always be correlated with clinical history and reviewed by a qualified laboratory hematologist.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss disclaimer"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '0.2rem',
          display: 'flex',
          alignItems: 'center',
          transition: 'color 0.15s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <X size={15} />
      </button>
    </aside>
  );
}
