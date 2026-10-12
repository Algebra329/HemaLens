import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

/**
 * React Error Boundary — catches runtime errors in child components
 * and renders a recovery UI instead of unmounting the entire tree
 * (which causes the blank white screen).
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[HemaLens ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '2rem',
          textAlign: 'center',
          background: 'var(--bg-primary, #f8fafc)',
          fontFamily: "'Satoshi', 'Inter', sans-serif"
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #fde68a',
            borderRadius: '16px',
            padding: '2.5rem 2rem',
            maxWidth: '480px',
            boxShadow: '0 12px 40px rgba(0, 20, 55, 0.1)'
          }}>
            <AlertTriangle size={40} color="#f59e0b" style={{ marginBottom: '1rem' }} />
            <h2 style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#001437',
              marginBottom: '0.5rem'
            }}>
              Something went wrong
            </h2>
            <p style={{
              fontSize: '0.85rem',
              color: '#64748b',
              marginBottom: '1.5rem',
              lineHeight: 1.5
            }}>
              An error occurred during analysis. This can happen if the ONNX models didn't fully download
              or the browser ran out of memory. Click below to try again.
            </p>
            <button
              onClick={this.handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.5rem',
                background: 'var(--scopio-magenta, #ef1aa9)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(239, 26, 169, 0.35)',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <RotateCcw size={16} />
              Reset & Try Again
            </button>
            {this.state.error && (
              <details style={{ marginTop: '1rem', textAlign: 'left', fontSize: '0.72rem', color: '#94a3b8' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Technical details</summary>
                <pre style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  background: '#f1f5f9',
                  borderRadius: '8px',
                  overflow: 'auto',
                  maxHeight: '120px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
