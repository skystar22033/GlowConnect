export default function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-radial-glow">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full bg-gradient-brand opacity-20 blur-lg animate-pulse" />
          <svg className="relative h-14 w-14 animate-spin" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="23" stroke="#EDE9FE" strokeWidth="5" />
            <path
              d="M28 5a23 23 0 0 1 23 23"
              stroke="url(#loader-grad)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="loader-grad" x1="5" y1="5" x2="51" y2="51" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7C3AED" />
                <stop offset="1" stopColor="#EC4899" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <p className="font-display text-sm font-medium text-text-muted">Loading GlowConnect…</p>
      </div>
    </div>
  );
}
