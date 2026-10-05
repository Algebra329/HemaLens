import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CLASS_BY_NAME } from '../inference/labels';
import {
  ZoomIn, ZoomOut, RotateCcw, Move, Crosshair, Eye, EyeOff,
  Filter, Sliders, Maximize2, Download, Sparkles, FileText, Check
} from 'lucide-react';

export default function SmearCanvas({
  imageSrc,
  results = [],
  selectedClass = null,
  hiddenClasses = [],
  onSelectCell,
  onOpenReport,
  hoveredCellId = null,
  onHoverCell
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Microscope Viewport State (Zoom & Pan - Scopio Labs / Proscia Concentriq pattern)
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState('inspect'); // 'inspect' | 'pan'

  // Canvas View Controls
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [highlightAtypicalOnly, setHighlightAtypicalOnly] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.70);
  const [showThresholdSlider, setShowThresholdSlider] = useState(false);

  // Local Hover State
  const [internalHoveredCell, setInternalHoveredCell] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const activeHoveredCell = results.find(c => c.id === hoveredCellId) || internalHoveredCell;

  // Filter cells based on threshold and visibility toggles
  const filteredResults = results.filter(cell => {
    if (cell.confidence < confidenceThreshold) return false;
    if (hiddenClasses.includes(cell.class)) return false;
    return true;
  });

  // Redraw canvas overlay whenever viewport, filters, or results change
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!filteredResults || filteredResults.length === 0 || !showBoundingBoxes) return;

    filteredResults.forEach((cell) => {
      const [x, y, w, h] = cell.bbox || [0, 0, 50, 50];
      const classInfo = CLASS_BY_NAME[cell.class] || { color: '#ef1aa9', isAbnormal: false };

      let opacity = 1.0;
      let strokeColor = classInfo.color;
      let lineWidth = 2;

      const isClassMatch = !selectedClass || cell.class === selectedClass;
      const isAtypicalMatch = !highlightAtypicalOnly || classInfo.isAbnormal;

      if (!isClassMatch || !isAtypicalMatch) {
        opacity = 0.16;
        lineWidth = 1;
      }

      const isTargetHovered = activeHoveredCell && activeHoveredCell.id === cell.id;
      if (isTargetHovered) {
        opacity = 1.0;
        lineWidth = 3.5;
        strokeColor = '#ffffff';
      }

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;

      // Glow effect for abnormal or selected cells
      if ((classInfo.isAbnormal || isTargetHovered) && opacity > 0.5) {
        ctx.shadowColor = classInfo.color;
        ctx.shadowBlur = isTargetHovered ? 14 : 8;
      }

      ctx.strokeRect(x, y, w, h);

      // Draw small label header above box if enabled
      if (showLabels && opacity > 0.5) {
        ctx.font = '600 11px Satoshi, Inter, sans-serif';
        const labelText = cell.class.replace('_', ' ');
        const textWidth = ctx.measureText(labelText).width;

        ctx.fillStyle = classInfo.color;
        ctx.fillRect(x, Math.max(0, y - 16), textWidth + 8, 16);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(labelText, x + 4, Math.max(12, y - 4));
      }

      ctx.restore();
    });
  }, [filteredResults, showBoundingBoxes, showLabels, selectedClass, highlightAtypicalOnly, activeHoveredCell]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Coordinate Conversion between DOM Mouse Event & Smear Canvas Space (800x600)
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: clientX * scaleX,
      y: clientY * scaleY,
      domX: e.clientX - rect.left,
      domY: e.clientY - rect.top
    };
  };

  // Mouse Move: Hover Detection & Pan Dragging
  const handleMouseMove = (e) => {
    if (isPanning && activeTool === 'pan') {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setPanOffset(prev => ({
        x: Math.max(-250 * (zoomLevel - 1), Math.min(250 * (zoomLevel - 1), prev.x + dx)),
        y: Math.max(-200 * (zoomLevel - 1), Math.min(200 * (zoomLevel - 1), prev.y + dy))
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (activeTool === 'inspect') {
      const { x, y, domX, domY } = getCanvasCoords(e);
      setMousePos({ x: domX, y: domY });

      // Hit-test cells
      const hit = filteredResults.find((c) => {
        const [bx, by, bw, bh] = c.bbox || [0, 0, 50, 50];
        return x >= bx && x <= bx + bw && y >= by && y <= by + bh;
      });

      setInternalHoveredCell(hit || null);
      if (onHoverCell) {
        onHoverCell(hit ? hit.id : null);
      }
    }
  };

  const handleMouseDown = (e) => {
    if (activeTool === 'pan' || e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleMouseLeave = () => {
    setIsPanning(false);
    setInternalHoveredCell(null);
    if (onHoverCell) onHoverCell(null);
  };

  const handleClick = (e) => {
    if (activeTool === 'inspect' && activeHoveredCell && onSelectCell) {
      onSelectCell(activeHoveredCell);
    }
  };

  // Zoom Helpers
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(4, +(prev + 0.5).toFixed(1)));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const next = Math.max(1, +(prev - 0.5).toFixed(1));
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Minimap Navigation: Jump to clicked location
  const handleMinimapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;

    if (zoomLevel > 1) {
      const maxPanX = 250 * (zoomLevel - 1);
      const maxPanY = 200 * (zoomLevel - 1);
      setPanOffset({
        x: (0.5 - clickX) * maxPanX * 2,
        y: (0.5 - clickY) * maxPanY * 2
      });
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* 1. Scopio Labs Clean Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.65rem 1rem',
        background: '#ffffff',
        borderRadius: '10px',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        flexWrap: 'wrap',
        gap: '0.65rem'
      }}>
        {/* Left: Viewport Controls & Tool Mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Tool Selector: Inspect vs Pan */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '2px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <button
              onClick={() => setActiveTool('inspect')}
              title="Inspect Cell Tool"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.32rem 0.7rem',
                background: activeTool === 'inspect' ? '#001437' : 'transparent',
                color: activeTool === 'inspect' ? '#ffffff' : '#64748b',
                fontWeight: activeTool === 'inspect' ? 600 : 500,
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Crosshair size={13} />
              <span>Inspect</span>
            </button>

            <button
              onClick={() => setActiveTool('pan')}
              title="Pan Slide Tool"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.32rem 0.7rem',
                background: activeTool === 'pan' ? '#001437' : 'transparent',
                color: activeTool === 'pan' ? '#ffffff' : '#64748b',
                fontWeight: activeTool === 'pan' ? 600 : 500,
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Move size={13} />
              <span>Pan Slide</span>
            </button>
          </div>

          {/* Zoom Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 0.25rem' }}>
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              style={{
                background: 'none',
                border: 'none',
                color: zoomLevel <= 1 ? '#94a3b8' : '#001437',
                cursor: zoomLevel <= 1 ? 'default' : 'pointer',
                padding: '0.35rem 0.45rem',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>

            <span style={{ fontSize: '0.76rem', fontWeight: 600, fontFamily: 'var(--font-mono)', minWidth: '42px', textAlign: 'center', color: '#001437' }}>
              {Math.round(zoomLevel * 100)}%
            </span>

            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 4}
              style={{
                background: 'none',
                border: 'none',
                color: zoomLevel >= 4 ? '#94a3b8' : '#001437',
                cursor: zoomLevel >= 4 ? 'default' : 'pointer',
                padding: '0.35rem 0.45rem',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>

            {zoomLevel > 1 && (
              <button
                onClick={handleResetView}
                title="Reset Zoom to 100%"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--scopio-magenta)',
                  cursor: 'pointer',
                  padding: '0.35rem 0.45rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <RotateCcw size={13} />
              </button>
            )}
          </div>

          {/* Filter Atypical */}
          <button
            onClick={() => setHighlightAtypicalOnly(!highlightAtypicalOnly)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              background: highlightAtypicalOnly ? '#fdf2f8' : '#ffffff',
              border: highlightAtypicalOnly ? '1px solid var(--scopio-magenta)' : '1px solid #cbd5e1',
              borderRadius: '8px',
              color: highlightAtypicalOnly ? 'var(--scopio-magenta)' : '#475569',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Filter size={12} />
            <span>Atypical Only</span>
          </button>

          {/* Confidence Slider Toggle */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowThresholdSlider(!showThresholdSlider)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                background: showThresholdSlider ? '#f0fdfa' : '#ffffff',
                border: showThresholdSlider ? '1px solid var(--scopio-teal)' : '1px solid #cbd5e1',
                borderRadius: '8px',
                color: showThresholdSlider ? 'var(--scopio-teal)' : '#475569',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Sliders size={12} />
              <span>Threshold ≥ {Math.round(confidenceThreshold * 100)}%</span>
            </button>

            {/* Slider Dropdown Popover */}
            {showThresholdSlider && (
              <div style={{
                position: 'absolute',
                top: '120%',
                left: 0,
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '0.85rem 1.1rem',
                zIndex: 40,
                boxShadow: 'var(--shadow-xl)',
                width: '220px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
                  <span>Confidence Cutoff</span>
                  <strong style={{ color: 'var(--scopio-magenta)', fontFamily: 'var(--font-mono)' }}>
                    {Math.round(confidenceThreshold * 100)}%
                  </strong>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="0.95"
                  step="0.05"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--scopio-magenta)', cursor: 'pointer' }}
                />
              </div>
            )}
          </div>

          {/* Toggle Labels */}
          <button
            onClick={() => setShowLabels(!showLabels)}
            title="Toggle Cell Class Tag Overlays"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              background: showLabels ? '#f1f5f9' : '#ffffff',
              border: showLabels ? '1px solid #94a3b8' : '1px solid #cbd5e1',
              borderRadius: '8px',
              color: showLabels ? '#001437' : '#64748b',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            {showLabels ? <Eye size={13} /> : <EyeOff size={13} />}
            <span>Labels</span>
          </button>
        </div>

        {/* Right: Detected Count & Print Report Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Visible: <strong style={{ color: 'var(--text-main)' }}>{filteredResults.length} / {results.length} RBCs</strong>
          </span>

          <button
            onClick={onOpenReport}
            title="Generate Clinical Report (Scopio Labs / CellaVision format)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.42rem 0.85rem',
              background: 'var(--scopio-magenta)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 8px rgba(239, 26, 169, 0.3)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#d91596'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--scopio-magenta)'}
          >
            <FileText size={14} />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Digital Microscope Viewport */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          maxWidth: '800px',
          height: '540px',
          margin: '0 auto',
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
          background: '#090e1a',
          boxShadow: 'var(--shadow-lg)',
          cursor: activeTool === 'pan' ? (isPanning ? 'grabbing' : 'grab') : (activeHoveredCell ? 'pointer' : 'crosshair')
        }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {/* Transform Container for Smooth Zoom & Pan */}
        <div style={{
          width: '800px',
          height: '600px',
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: 'center center',
          transition: isPanning ? 'none' : 'transform 0.15s ease-out'
        }}>
          {/* Background Micrograph */}
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Microscopic smear field"
            style={{
              width: '800px',
              height: '600px',
              display: 'block',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
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
        </div>

        {/* 3. Calibrated Micron Scale Bar (Scopio Style Crisp Frosted Pill) */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '0.35rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          pointerEvents: 'none',
          zIndex: 20,
          boxShadow: '0 4px 12px rgba(0, 20, 55, 0.15)'
        }}>
          <div style={{
            width: `${Math.round(36 * zoomLevel)}px`,
            height: '3px',
            background: 'var(--scopio-magenta)',
            borderRadius: '2px'
          }} />
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#001437', fontFamily: 'var(--font-mono)' }}>
            10 µm (1000x)
          </span>
        </div>

        {/* 4. Interactive Minimap HUD (Scopio Style) */}
        {zoomLevel > 1 && (
          <div
            onClick={handleMinimapClick}
            title="Click minimap to reposition viewport"
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              width: '120px',
              height: '90px',
              borderRadius: '8px',
              border: '2px solid var(--scopio-magenta)',
              overflow: 'hidden',
              background: '#000',
              cursor: 'pointer',
              zIndex: 25,
              boxShadow: '0 4px 20px rgba(0, 20, 55, 0.3)'
            }}
          >
            {/* Overview Thumbnail */}
            <img
              src={imageSrc}
              alt="Slide minimap"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65 }}
            />

            {/* Viewport Frustum Box */}
            <div style={{
              position: 'absolute',
              width: `${100 / zoomLevel}%`,
              height: `${100 / zoomLevel}%`,
              left: `${50 - (panOffset.x / (250 * (zoomLevel - 1 || 1))) * 25 - (50 / zoomLevel)}%`,
              top: `${50 - (panOffset.y / (200 * (zoomLevel - 1 || 1))) * 25 - (50 / zoomLevel)}%`,
              border: '2px solid var(--scopio-magenta)',
              background: 'rgba(239, 26, 169, 0.25)',
              pointerEvents: 'none'
            }} />
          </div>
        )}

        {/* 5. Floating Hover Tooltip (Scopio Clean White Tooltip) */}
        {activeHoveredCell && activeTool === 'inspect' && (
          <div style={{
            position: 'absolute',
            left: `${Math.min(620, mousePos.x + 14)}px`,
            top: `${Math.min(460, mousePos.y + 14)}px`,
            background: '#ffffff',
            border: `1.5px solid ${CLASS_BY_NAME[activeHoveredCell.class]?.color || 'var(--scopio-magenta)'}`,
            borderRadius: '8px',
            padding: '0.5rem 0.85rem',
            pointerEvents: 'none',
            zIndex: 30,
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.15rem' }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: CLASS_BY_NAME[activeHoveredCell.class]?.color || 'var(--scopio-magenta)'
              }} />
              <strong style={{ fontSize: '0.85rem', color: '#001437' }}>
                {activeHoveredCell.class.replace('_', ' ')}
              </strong>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#475569', display: 'flex', gap: '0.5rem' }}>
              <span>Confidence: <strong style={{ color: '#001437' }}>{(activeHoveredCell.confidence * 100).toFixed(1)}%</strong></span>
              <span>• Click to inspect</span>
            </div>
          </div>
        )}
      </div>

      {/* Helpful Status Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        color: 'var(--text-dim)',
        padding: '0 0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={13} color="var(--scopio-magenta)" />
          <span>Click any cell to compare with Reference Atlas • Pan tool or Minimap enables 400% navigation</span>
        </div>
        {selectedClass && (
          <span style={{ color: 'var(--scopio-magenta)', fontWeight: 600 }}>
            Filtered: {selectedClass.replace('_', ' ')}
          </span>
        )}
      </div>
    </div>
  );
}
