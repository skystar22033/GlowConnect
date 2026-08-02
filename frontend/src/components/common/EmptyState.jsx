export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center animate-fade-in">
      {Icon && (
        <div className="relative mb-1 flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 animate-float rounded-full bg-gradient-brand opacity-15 blur-xl" />
          <span className="absolute inset-0 rounded-full bg-gradient-brand-soft" />
          <div className="relative rounded-full bg-white p-4 shadow-card ring-1 ring-border-light">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-text-primary">{title}</h3>
      {description && <p className="max-w-sm text-sm text-text-muted">{description}</p>}
      {action}
    </div>
  );
}
