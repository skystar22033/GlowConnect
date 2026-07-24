export default function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-glow" />
        <p className="font-display text-sm text-text-muted">Loading GlowConnect…</p>
      </div>
    </div>
  );
}
