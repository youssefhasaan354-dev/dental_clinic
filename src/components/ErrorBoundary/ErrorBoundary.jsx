import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isRtl = typeof document !== 'undefined' && document.documentElement.getAttribute('dir') === 'rtl';

      return (
        <div
          className="error-boundary-wrapper"
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            padding: '24px',
            fontFamily: 'Cairo, Montserrat, sans-serif',
            direction: isRtl ? 'rtl' : 'ltr',
          }}
        >
          <div
            style={{
              maxWidth: '540px',
              width: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '36px 32px',
              boxShadow: '0 20px 40px -15px rgba(12, 102, 116, 0.12), 0 0 1px 1px rgba(0,0,0,0.04)',
              textAlign: 'center',
            }}
          >
            {/* Medical Shield Icon */}
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'rgba(12, 102, 116, 0.08)',
                color: '#0c6674',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                marginBottom: '20px',
              }}
            >
              🩺
            </div>

            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '10px',
                lineHeight: 1.4,
              }}
            >
              عيادة حياة لطب الأسنان
            </h2>

            <p
              style={{
                fontSize: '1rem',
                color: '#475569',
                marginBottom: '6px',
                fontWeight: '600',
              }}
            >
              حدث خطأ غير متوقع أثناء تحميل الصفحة
            </p>
            <p
              style={{
                fontSize: '0.88rem',
                color: '#64748b',
                marginBottom: '24px',
              }}
            >
              An unexpected error occurred while loading this page.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: '20px',
              }}
            >
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  backgroundColor: '#0c6674',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '10px 24px',
                  fontSize: '0.92rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(12, 102, 116, 0.25)',
                  transition: 'background-color 0.2s',
                }}
              >
                إعادة المحاولة / Reload
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                style={{
                  backgroundColor: 'transparent',
                  color: '#0c6674',
                  border: '1.5px solid #0c6674',
                  borderRadius: '999px',
                  padding: '10px 24px',
                  fontSize: '0.92rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
              >
                الرئيسية / Home
              </button>
            </div>

            {this.state.error && (
              <details
                style={{
                  textAlign: 'left',
                  fontSize: '0.78rem',
                  color: '#94a3b8',
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #e2e8f0',
                }}
              >
                <summary style={{ cursor: 'pointer', color: '#64748b', fontWeight: '500' }}>
                  Technical Details
                </summary>
                <pre
                  style={{
                    backgroundColor: '#0f172a',
                    color: '#f1f5f9',
                    padding: '12px',
                    borderRadius: '8px',
                    marginTop: '8px',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    maxHeight: '160px',
                  }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
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

export default ErrorBoundary;
