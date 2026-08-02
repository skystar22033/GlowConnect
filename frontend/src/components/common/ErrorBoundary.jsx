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
        <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-radial-glow px-6 text-center">
          <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className="animate-float">
            <circle cx="70" cy="70" r="62" fill="url(#eb-grad)" opacity="0.16" />
            <circle cx="70" cy="70" r="42" fill="url(#eb-grad)" opacity="0.22" />
            <path
              d="M70 46v28M70 88h.01"
              stroke="#7C3AED"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="70" cy="70" r="42" stroke="#A855F7" strokeWidth="2.5" strokeDasharray="4 6" opacity="0.5" />
            <defs>
              <linearGradient id="eb-grad" x1="8" y1="8" x2="132" y2="132" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7C3AED" />
                <stop offset="1" stopColor="#EC4899" />
              </linearGradient>
            </defs>
          </svg>
          <h1 className="font-display text-2xl font-bold text-text-primary">Something broke on our end</h1>
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
