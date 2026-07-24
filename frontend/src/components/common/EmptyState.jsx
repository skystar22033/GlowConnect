export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
      {Icon && (
        <div className="rounded-full bg-surface-raised p-4 text-glow">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description && <p className="max-w-sm text-sm text-text-muted">{description}</p>}
      {action}
    </div>
  );
}
