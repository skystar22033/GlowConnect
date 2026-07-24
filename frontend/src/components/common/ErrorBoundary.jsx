import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('GlowConnect UI error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink px-6 text-center">
          <h1 className="font-display text-2xl font-bold">Something broke on our end</h1>
          <p className="max-w-sm text-text-muted">
            This part of GlowConnect hit an unexpected error. Refreshing the page usually fixes it.
          </p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Refresh page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
