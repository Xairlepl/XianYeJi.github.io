import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container section" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <div className="empty-state">
            <span className="empty-icon" style={{ fontSize: '4rem' }}>⚠️</span>
            <h2 style={{ marginTop: '1rem' }}>页面出现错误</h2>
            <p style={{ color: 'var(--color-neutral-600)', marginTop: '0.5rem' }}>
              {this.state.error?.message || '未知错误'}
            </p>
            <button
              className="btn btn-primary"
              style={{ marginTop: '1.5rem' }}
              onClick={() => window.location.href = '/'}
            >
              返回首页
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
