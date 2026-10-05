import React, { useState } from 'react';
import { CLASS_BY_NAME } from '../inference/labels';
import { Layers, ChevronRight, Sparkles, Filter, Grid, Check } from 'lucide-react';

export default function CellGalleryTray({
  results = [],
  imageSrc,
  selectedClass,
  onSelectClass,
  hoveredCellId,
  onHoverCell,
  onSelectCell
}) {
  const [activeTab, setActiveTab] = useState('all');

  if (!results || results.length === 0) return null;

  // Group cells by class
  const cellsByClass = {};
  results.forEach(cell => {
    if (!cellsByClass[cell.class]) {
      cellsByClass[cell.class] = [];
    }
    cellsByClass[cell.class].push(cell);
  });

  const atypicalCells = results.filter(c => CLASS_BY_NAME[c.class]?.isAbnormal);

  let displayedCells = results;
  if (activeTab === 'atypical') {
    displayedCells = atypicalCells;
  } else if (activeTab !== 'all') {
    displayedCells = cellsByClass[activeTab] || [];
  }

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    if (tabKey === 'all' || tabKey === 'atypical') {
      onSelectClass(null);
    } else {
      onSelectClass(tabKey);
    }
  };

  return (
    <div style={{
      width: '100%',
      background: '#ffffff',
      border: '1px solid var(--border-subtle)',
      borderRadius: '12px',
      overflow: 'hidden',
      marginTop: '0.85rem',
      boxShadow: 'var(--shadow-md)'
    }}>
      {/* Gallery Header & Navigation Tabs (Scopio Style) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.15rem',
        background: '#f8fafc',
        borderBottom: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Grid size={16} color="var(--scopio-magenta)" />
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '0.01em' }}>
            CELL GALLERY TRAY (Full-Field Review)
          </span>
          <span className="clinical-badge badge-navy" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
            {displayedCells.length} Cells
          </span>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleTabClick('all')}
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.28rem 0.7rem',
              borderRadius: '8px',
              border: activeTab === 'all' ? '1px solid #001437' : '1px solid #cbd5e1',
              background: activeTab === 'all' ? '#001437' : '#ffffff',
              color: activeTab === 'all' ? '#ffffff' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            All Cells ({results.length})
          </button>

          <button
            onClick={() => handleTabClick('atypical')}
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.28rem 0.7rem',
              borderRadius: '8px',
              border: activeTab === 'atypical' ? '1px solid var(--scopio-magenta)' : '1px solid #cbd5e1',
              background: activeTab === 'atypical' ? 'var(--scopio-magenta)' : '#ffffff',
              color: activeTab === 'atypical' ? '#ffffff' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Atypical Only ({atypicalCells.length})
          </button>

          {Object.entries(cellsByClass).map(([className, cells]) => {
            const classInfo = CLASS_BY_NAME[className] || { color: '#0284c7' };
            const isActive = activeTab === className;
            return (
              <button
                key={className}
                onClick={() => handleTabClick(className)}
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  padding: '0.28rem 0.65rem',
                  borderRadius: '8px',
                  border: isActive ? `1.5px solid ${classInfo.color}` : '1px solid #e2e8f0',
                  background: isActive ? '#f8fafc' : '#ffffff',
                  color: isActive ? classInfo.color : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: classInfo.color }} />
                <span>{className.replace('_', ' ')}</span>
                <span style={{ opacity: 0.7 }}>({cells.length})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Horizontal Scrollable Cell Thumbnails */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        padding: '0.85rem 1.15rem',
        overflowX: 'auto',
        overflowY: 'hidden',
        minHeight: '125px',
        alignItems: 'center',
        background: '#ffffff'
      }}>
        {displayedCells.length === 0 ? (
          <div style={{ width: '100%', textAlign: 'center', padding: '1rem', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
            No cells match this filter category.
          </div>
        ) : (
          displayedCells.map((cell) => {
            const classInfo = CLASS_BY_NAME[cell.class] || { color: '#0284c7', isAbnormal: false };
            const isHovered = hoveredCellId === cell.id;
            const [bx, by, bw, bh] = cell.bbox || [0, 0, 50, 50];

            return (
              <div
                key={cell.id}
                onClick={() => onSelectCell(cell)}
                onMouseEnter={() => onHoverCell(cell.id)}
                onMouseLeave={() => onHoverCell(null)}
                style={{
                  flexShrink: 0,
                  width: '96px',
                  background: '#ffffff',
                  border: isHovered ? `2px solid var(--scopio-magenta)` : `1px solid #e2e8f0`,
                  borderRadius: '10px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isHovered ? 'translateY(-3px)' : 'none',
                  boxShadow: isHovered ? '0 8px 20px rgba(239, 26, 169, 0.2)' : 'var(--shadow-sm)'
                }}
              >
                {/* Cropped Preview Window */}
                <div style={{
                  width: '94px',
                  height: '72px',
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#f8fafc'
                }}>
                  <img
                    src={imageSrc}
                    alt={cell.class}
                    style={{
                      position: 'absolute',
                      width: '800px',
                      height: '600px',
                      left: `-${bx - 14}px`,
                      top: `-${by - 12}px`,
                      maxWidth: 'none',
                      pointerEvents: 'none'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: '6px',
                    border: `1.5px dashed ${classInfo.color}`,
                    borderRadius: '4px',
                    pointerEvents: 'none'
                  }} />
                </div>

                {/* Cell Meta Footer */}
                <div style={{
                  padding: '0.4rem 0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.15rem',
                  borderTop: '1px solid #f1f5f9',
                  background: '#ffffff'
                }}>
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: classInfo.color,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {cell.class.replace('_', ' ')}
                  </div>
                  <div style={{
                    fontSize: '0.68rem',
                    color: 'var(--text-dim)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>#{cell.id}</span>
                    <strong style={{ color: '#001437' }}>{(cell.confidence * 100).toFixed(0)}%</strong>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
