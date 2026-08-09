export default function ActivityStatus({ isOnline, lastActive }) {
  if (isOnline) {
    return <span className="text-xs text-green-500 font-medium">● Online</span>;
  }

  const getTimeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <span className="text-xs text-text-muted">
      Last seen {getTimeAgo(lastActive)}
    </span>
  );
}