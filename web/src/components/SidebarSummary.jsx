import React from 'react';
import { RBC_CLASSES } from '../inference/labels';
import { Layers, AlertCircle, CheckCircle, BarChart3, HelpCircle } from 'lucide-react';

export default function SidebarSummary({ results = null, selectedClass = null, onSelectClass }) {
  // Compute breakdown if results are provided
  const totalCells = results ? results.length : 0;
  const countsByClass = {};
  RBC_CLASSES.forEach(c => { countsByClass[c.name] = 0; });

  if (results) {
    results.forEach(cell => {
      if (countsByClass[cell.class] !== undefined) {
        countsByClass[cell.class]++;
      }
    });
  }

  const normalCount = countsByClass["Normal"] || 0;
  const abnormalCount = totalCells - normalCount - (countsByClass["Uncategorised"] || 0);
  const abnormalPct = totalCells > 0 ? ((abnormalCount / totalCells) * 100).toFixed(1) : 0;

  return (
    <aside style={{
      width: '360px',
      flexShrink: 0,
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(14, 23, 42, 0.6)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={18} color="var(--accent-sky)" />
            Morphology Profile
          </h2>
          <span className="clinical-badge badge-cyan" style={{ fontSize: '0.7rem' }}>
            13 Classes
          </span>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Peripheral blood smear classification summary
        </p>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.5rem',
        padding: '1rem 1.25rem',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-card)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total RBCs</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{totalCells}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Normal</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
            {totalCells > 0 ? `${((normalCount / totalCells) * 100).toFixed(0)}%` : '—'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Atypical</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: abnormalCount > 0 ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
            {totalCells > 0 ? `${abnormalPct}%` : '—'}
          </div>
        </div>
      </div>

      {/* Class List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0.75rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem'
      }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0.25rem 0.5rem' }}>
          Morphological Categories
        </div>

        {RBC_CLASSES.map(cls => {
          const count = countsByClass[cls.name] || 0;
          const pct = totalCells > 0 ? ((count / totalCells) * 100).toFixed(1) : 0;
          const isSelected = selectedClass === cls.name;

          return (
            <div
              key={cls.id}
              onClick={() => onSelectClass && onSelectClass(isSelected ? null : cls.name)}
              title={cls.desc}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.55rem 0.75rem',
                borderRadius: '8px',
                background: isSelected ? 'var(--bg-elevated)' : 'transparent',
                border: isSelected ? `1px solid ${cls.color}` : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.background = 'var(--bg-card-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: cls.color,
                  boxShadow: count > 0 ? `0 0 6px ${cls.color}` : 'none'
                }} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-main)' }}>
                    {cls.name.replace('_', ' ')}
                  </div>
                  {cls.isAbnormal && (
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                      Atypical variant
                    </div>
                  )}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: count > 0 ? 'var(--text-main)' : 'var(--text-dim)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {count}
                </span>
                {totalCells > 0 && count > 0 && (
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    {pct}%
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info Box */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(10, 15, 29, 0.4)',
        fontSize: '0.75rem',
        color: 'var(--text-dim)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <HelpCircle size={14} style={{ flexShrink: 0 }} />
        <span>Hover over any class to view clinical morphology criteria.</span>
      </div>
    </aside>
  );
}
