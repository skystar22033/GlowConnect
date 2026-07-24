import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-radial-glow px-6 text-center">
      <Sparkles className="h-10 w-10 text-glow" />
      <h1 className="font-display text-3xl font-extrabold">Page not found</h1>
      <p className="max-w-sm text-text-muted">
        This page doesn't exist, or it moved somewhere we can't see.
      </p>
      <Link to="/feed" className="btn-primary">
        Back to feed
      </Link>
    </div>
  );
}
