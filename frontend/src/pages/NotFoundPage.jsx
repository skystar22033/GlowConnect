import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-radial-glow px-6 text-center">
      <svg width="220" height="160" viewBox="0 0 220 160" fill="none" className="animate-float">
        <ellipse cx="110" cy="150" rx="70" ry="8" fill="#7C3AED" opacity="0.08" />
        <circle cx="110" cy="72" r="60" fill="url(#nf-grad)" opacity="0.14" />
        <text
          x="110"
          y="92"
          textAnchor="middle"
          fontFamily="Outfit, sans-serif"
          fontWeight="800"
          fontSize="64"
          fill="url(#nf-grad)"
        >
          404
        </text>
        <circle cx="42" cy="40" r="7" fill="#EC4899" opacity="0.6" />
        <circle cx="182" cy="112" r="5" fill="#A855F7" opacity="0.6" />
        <circle cx="188" cy="30" r="4" fill="#7C3AED" opacity="0.6" />
        <defs>
          <linearGradient id="nf-grad" x1="50" y1="12" x2="170" y2="132" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7C3AED" />
            <stop offset="1" stopColor="#EC4899" />
          </linearGradient>
        </defs>
      </svg>

      <h1 className="font-display text-3xl font-extrabold text-text-primary">Page not found</h1>
      <p className="max-w-sm text-text-muted">
        This page doesn't exist, or it moved somewhere we can't see.
      </p>
      <Link to="/feed" className="btn-primary">
        <Home className="h-4 w-4" />
        Back to feed
      </Link>
    </div>
  );
}
