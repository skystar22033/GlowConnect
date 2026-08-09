import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="relative">
      <button
        onClick={handleBellClick}
        title="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition-all duration-200 hover:bg-surface-raised hover:text-primary"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-bloom text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl bg-surface shadow-xl border border-border z-50">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-text-primary">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={() => {
                  markAllAsRead();
                  setShowDropdown(false);
                }}
                className="text-xs text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="p-2">
            {notifications.length === 0 ? (
              <p className="text-center text-text-muted py-6 text-sm">
                No notifications yet
              </p>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification._id}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition hover:bg-surface-raised ${
                    !notification.read ? 'bg-primary/5 border-l-2 border-primary' : ''
                  }`}
                  onClick={() => {
                    markAsRead(notification._id);
                    setShowDropdown(false);
                  }}
                >
                  <div className="flex-1">
                    <p className="text-sm text-text-primary">{notification.message}</p>
                    <p className="text-xs text-text-muted">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}