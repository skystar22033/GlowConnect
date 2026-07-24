// Signature element: every avatar carries a soft "glow ring" — a subtle halo
// that reinforces the GlowConnect identity across the whole app.

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
};

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

// Deterministic gradient per-user so the same person always gets the same fallback color
function gradientForName(name = '') {
  const gradients = [
    'from-glow to-bloom',
    'from-bloom to-purple-400',
    'from-glow-soft to-glow',
    'from-purple-400 to-glow',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
}

export default function Avatar({ src, name = '?', size = 'md', className = '' }) {
  return (
    <div
      className={`relative rounded-full p-[2px] bg-gradient-to-br ${gradientForName(
        name
      )} shadow-glow ${SIZES[size]} ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full rounded-full object-cover ring-2 ring-ink"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-surface-raised font-display font-semibold text-text-primary ring-2 ring-ink">
          {getInitials(name) || '?'}
        </div>
      )}
    </div>
  );
}
