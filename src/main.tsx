import {StrictMode, Component, ErrorInfo, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column' as const,
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#050505',
          color: '#ffffff',
          fontFamily: 'monospace',
          padding: '2rem',
          textAlign: 'center' as const,
        }}>
          <h1 style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase' as const, opacity: 0.6, marginBottom: '1rem' }}>
            PAPAZIAN ARCHIVE
          </h1>
          <p style={{ fontSize: '0.875rem', opacity: 0.8, maxWidth: '28rem', lineHeight: 1.6 }}>
            Something went wrong while loading the archive. Please refresh the page or try a different browser.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1.5rem',
              padding: '0.5rem 1.5rem',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#ffffff',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return (this as Component<ErrorBoundaryProps, ErrorBoundaryState>).props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
