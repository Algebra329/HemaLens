import React, { useRef, useEffect, useState } from 'react';
import { CLASS_BY_NAME } from '../inference/labels';
import { Eye, EyeOff, Filter, Download, Info, Check, Maximize2 } from 'lucide-react';

export default function SmearCanvas({
  imageSrc,
  results = [],
  selectedClass = null,
  onSelectCell
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const [hoveredCell, setHoveredCell] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [highlightAtypicalOnly, setHighlightAtypicalOnly] = useState(false);
  const [showLabels, setShowLabels] = useState(true);

  // Redraw canvas overlay whenever results, filters, or hover states change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!results || results.length === 0) return;

    results.forEach((cell) => {
      const [x, y, w, h] = cell.bbox || [0, 0, 50, 50];
      const classInfo = CLASS_BY_NAME[cell.class] || { color: '#38bdf8', isAbnormal: false };

      // Determine opacity and styling based on active filters
      let opacity = 1.0;
      let strokeColor = classInfo.color;
      let lineWidth = 2;

      const isClassMatch = !selectedClass || cell.class === selectedClass;
      const isAtypicalMatch = !highlightAtypicalOnly || classInfo.isAbnormal;

      if (!isClassMatch || !isAtypicalMatch) {
        opacity = 0.18;
        lineWidth = 1;
      }

      if (hoveredCell && hoveredCell.id === cell.id) {
        opacity = 1.0;
        lineWidth = 3;
        strokeColor = '#ffffff';
      }

      // Draw bounding box
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;

      // Glow effect for abnormal cells
      if (classInfo.isAbnormal && opacity > 0.5) {
        ctx.shadowColor = classInfo.color;
        ctx.shadowBlur = 8;
      }

      ctx.strokeRect(x, y, w, h);

      // Draw small label header above box if enabled and cell is visible
      if (showLabels && opacity > 0.5) {
        ctx.font = '600 11px Inter, sans-serif';
        const labelText = cell.class.replace('_', ' ');
        const textWidth = ctx.measureText(labelText).width;
        
        ctx.fillStyle = classInfo.color;
        ctx.fillRect(x, Math.max(0, y - 16), textWidth + 8, 16);
        
        ctx.fillStyle = '#ffffff';
        ctx.fillText(labelText, x + 4, Math.max(12, y - 4));
      }

      ctx.restore();
    });
  }, [results, hoveredCell, selectedClass, highlightAtypicalOnly, showLabels]);

  // Handle Mouse Move for Hover Detection
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    // Scale coordinates between displayed CSS pixels and internal 800x600 canvas coordinate space
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

    // Hit-test cells
    const hit = results.find((c) => {
      const [bx, by, bw, bh] = c.bbox || [0, 0, 50, 50];
      return x >= bx && x <= bx + bw && y >= by && y <= by + bh;
    });

    setHoveredCell(hit || null);
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  const handleClick = () => {
    if (hoveredCell && onSelectCell) {
      onSelectCell(hoveredCell);
    }
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Canvas Toolbar Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.65rem 1rem',
        background: 'var(--bg-card)',
        borderRadius: '8px',
        border: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Left: View Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setHighlightAtypicalOnly(!highlightAtypicalOnly)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              background: highlightAtypicalOnly ? 'rgba(244, 63, 94, 0.2)' : 'var(--bg-surface)',
              border: highlightAtypicalOnly ? '1px solid var(--accent-rose)' : '1px solid var(--border-subtle)',
              borderRadius: '6px',
              color: highlightAtypicalOnly ? 'var(--accent-rose)' : 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Filter size={13} />
            <span>Highlight Atypical Only</span>
          </button>

          <button
            onClick={() => setShowLabels(!showLabels)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              background: showLabels ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-surface)',
              border: showLabels ? '1px solid var(--accent-sky)' : '1px solid var(--border-subtle)',
              borderRadius: '6px',
              color: showLabels ? 'var(--accent-sky)' : 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {showLabels ? <Eye size={13} /> : <EyeOff size={13} />}
            <span>{showLabels ? 'Hide Labels' : 'Show Labels'}</span>
          </button>

          {selectedClass && (
            <span className="clinical-badge badge-cyan" style={{ fontSize: '0.75rem' }}>
              Filtered: {selectedClass.replace('_', ' ')}
            </span>
          )}
        </div>

        {/* Right: Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Detected: <strong>{results.length} RBCs</strong>
          </span>

          <button
            onClick={printReport}
            title="Print or save laboratory summary report"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              color: 'var(--text-main)',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <Download size={13} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          maxWidth: '800px',
          margin: '0 auto',
          position: 'relative',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid var(--border-highlight)',
          background: '#fdf4f5',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          cursor: hoveredCell ? 'pointer' : 'crosshair'
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {/* Background Blood Smear Image */}
        <img
          ref={imageRef}
          src={imageSrc}
          alt="Microscopic smear field"
          style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none' }}
        />

        {/* Overlay Canvas for Bounding Boxes */}
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        />

        {/* Floating Tooltip following cursor when hovering over a cell */}
        {hoveredCell && (
          <div style={{
            position: 'absolute',
            left: `${mousePos.x + 14}px`,
            top: `${mousePos.y + 14}px`,
            background: 'rgba(10, 15, 29, 0.94)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${CLASS_BY_NAME[hoveredCell.class]?.color || '#38bdf8'}`,
            borderRadius: '6px',
            padding: '0.45rem 0.75rem',
            pointerEvents: 'none',
            zIndex: 30,
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.6)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: CLASS_BY_NAME[hoveredCell.class]?.color || '#38bdf8'
              }} />
              <strong style={{ fontSize: '0.85rem', color: '#fff' }}>
                {hoveredCell.class.replace('_', ' ')}
              </strong>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}>
              <span>Confidence: <strong>{(hoveredCell.confidence * 100).toFixed(1)}%</strong></span>
              <span>• Click to inspect</span>
            </div>
          </div>
        )}
      </div>

      {/* Helpful Hint */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontSize: '0.78rem',
        color: 'var(--text-dim)',
        marginTop: '0.25rem'
      }}>
        <Maximize2 size={13} />
        <span>Click on any cell box above to open the zoomed morphological inspector.</span>
      </div>
    </div>
  );
}
