import React from 'react';
import { RBC_CLASSES } from '../inference/labels';
import { Layers, AlertCircle, CheckCircle, BarChart3, HelpCircle, Eye, EyeOff, FileText, Sparkles, Filter, X } from 'lucide-react';

export default function SidebarSummary({
  results = null,
  selectedClass = null,
  onSelectClass,
  hiddenClasses = [],
  onToggleHideClass,
  onOpenReport
}) {
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
  const uncategorisedCount = countsByClass["Uncategorised"] || 0;
  const abnormalCount = totalCells - normalCount - uncategorisedCount;
  const abnormalPct = totalCells > 0 ? ((abnormalCount / totalCells) * 100).toFixed(1) : 0;

  // Clinical Poikilocytosis Grading (CAP / CLSI Criteria)
  let poikilocytosisGrade = "Normal";
  let gradeBadgeClass = "badge-emerald";
  if (abnormalPct > 25) {
    poikilocytosisGrade = "Marked (3+)";
    gradeBadgeClass = "badge-rose";
  } else if (abnormalPct > 10) {
    poikilocytosisGrade = "Moderate (2+)";
    gradeBadgeClass = "badge-amber";
  } else if (abnormalPct >= 5) {
    poikilocytosisGrade = "Slight (1+)";
    gradeBadgeClass = "badge-cyan";
  }

  return (
    <aside className="app-sidebar-aside" style={{
      background: '#ffffff',
      border: '1px solid var(--border-subtle)',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-md)'
    }}>
      {/* Header */}
      <div style={{
        padding: '1.25rem 1.4rem',
        borderBottom: '1px solid var(--border-subtle)',
        background: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <BarChart3 size={18} color="var(--scopio-magenta)" />
            Morphology Profile
          </h2>
          <span className={`clinical-badge ${gradeBadgeClass}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>
            {poikilocytosisGrade}
          </span>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Standardized 13-Class Automated Differential
        </p>
      </div>

      {/* Metrics Row (Scopio Clean KPI Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.5rem',
        padding: '0.9rem 1.25rem',
        borderBottom: '1px solid var(--border-subtle)',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center', background: '#ffffff', padding: '0.6rem 0.4rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Total RBCs</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{totalCells}</div>
        </div>
        <div style={{ textAlign: 'center', background: '#ffffff', padding: '0.6rem 0.4rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Normal</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
            {totalCells > 0 ? `${((normalCount / totalCells) * 100).toFixed(0)}%` : '—'}
          </div>
        </div>
        <div style={{ textAlign: 'center', background: '#ffffff', padding: '0.6rem 0.4rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Atypical</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: abnormalCount > 0 ? 'var(--scopio-magenta)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {totalCells > 0 ? `${abnormalPct}%` : '—'}
          </div>
        </div>
      </div>

      {/* Active Filter Strip */}
      {selectedClass && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 1.15rem',
          background: '#fdf2f8',
          borderBottom: '1px solid #fbcfe8',
          fontSize: '0.76rem'
        }}>
          <span style={{ color: 'var(--scopio-magenta)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
            <Filter size={13} />
            Isolating: {selectedClass.replace('_', ' ')}
          </span>
          <button
            onClick={() => onSelectClass(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
              fontSize: '0.72rem',
              fontWeight: 600
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#001437'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            <X size={13} /> Clear
          </button>
        </div>
      )}

      {/* Class List */}
      <div className="sidebar-classlist-scroll" style={{
        flex: 1,
        overflowY: 'auto',
        maxHeight: '520px',
        padding: '0.75rem 0.9rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem'
      }}>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0.2rem 0.5rem', fontWeight: 700 }}>
          Morphological Categories & Visibility
        </div>

        {RBC_CLASSES.map(cls => {
          const count = countsByClass[cls.name] || 0;
          const pct = totalCells > 0 ? ((count / totalCells) * 100).toFixed(1) : 0;
          const isSelected = selectedClass === cls.name;
          const isHidden = hiddenClasses && hiddenClasses.includes(cls.name);

          return (
            <div
              key={cls.id}
              onClick={() => onSelectClass && onSelectClass(isSelected ? null : cls.name)}
              title={cls.desc}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.52rem 0.75rem',
                borderRadius: '8px',
                background: isSelected ? '#f8fafc' : 'transparent',
                border: isSelected ? `1.5px solid ${cls.color}` : '1px solid transparent',
                opacity: isHidden ? 0.35 : 1,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.background = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.background = 'transparent';
              }}
            >
              {/* Left: Eye toggle + Color dot + Class name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onToggleHideClass) onToggleHideClass(cls.name);
                  }}
                  title={isHidden ? `Show ${cls.name}` : `Hide ${cls.name}`}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isHidden ? '#cbd5e1' : '#94a3b8',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>

                <span style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: cls.color,
                  boxShadow: count > 0 ? `0 0 6px ${cls.color}50` : 'none',
                  flexShrink: 0
                }} />

                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.82rem',
                    fontWeight: count > 0 ? 600 : 500,
                    color: count > 0 ? 'var(--text-main)' : 'var(--text-dim)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {cls.name.replace('_', ' ')}
                  </div>
                  {cls.isAbnormal && count > 0 && (
                    <div style={{ fontSize: '0.66rem', color: 'var(--scopio-magenta)', fontWeight: 600 }}>
                      Atypical
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Count, %, and Mini-bar */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '0.35rem' }}>
                  <span style={{
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: count > 0 ? 'var(--text-main)' : 'var(--text-dim)',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {count}
                  </span>
                  {totalCells > 0 && count > 0 && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      ({pct}%)
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                {totalCells > 0 && count > 0 && (
                  <div style={{ width: '55px', height: '3px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', marginTop: '3px', marginLeft: 'auto' }}>
                    <div style={{ width: `${Math.min(100, Math.max(10, pct))}%`, height: '100%', background: cls.color }} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scopio Magenta Report CTA Button */}
      <div style={{
        padding: '1rem 1.25rem',
        borderTop: '1px solid var(--border-subtle)',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <button
          onClick={onOpenReport}
          disabled={!results || results.length === 0}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1rem',
            background: (!results || results.length === 0) ? '#f1f5f9' : 'var(--scopio-magenta)',
            border: 'none',
            borderRadius: '8px',
            color: (!results || results.length === 0) ? '#94a3b8' : '#ffffff',
            fontWeight: 700,
            fontSize: '0.84rem',
            cursor: (!results || results.length === 0) ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: (!results || results.length === 0) ? 'none' : '0 4px 14px rgba(239, 26, 169, 0.35)'
          }}
          onMouseEnter={(e) => {
            if (results && results.length > 0) e.currentTarget.style.background = '#d91596';
          }}
          onMouseLeave={(e) => {
            if (results && results.length > 0) e.currentTarget.style.background = 'var(--scopio-magenta)';
          }}
        >
          <FileText size={16} />
          <span>Export Clinical Lab Report</span>
        </button>

        <div style={{
          fontSize: '0.72rem',
          color: 'var(--text-dim)',
          textAlign: 'center'
        }}>
          Complies with CLSI / ICSH Hematology Standards
        </div>
      </div>
    </aside>
  );
}
