import { useState } from 'react';
import { Heart, MessageCircle, UserPlus } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/navigation/BottomNav';

export default function ActivityPage() {
  const [notifications] = useState([
    { id: 1, type: 'like', message: 'John liked your post', time: '2 min ago', read: false },
    { id: 2, type: 'comment', message: 'Sarah commented on your post', time: '10 min ago', read: false },
    { id: 3, type: 'follow', message: 'Mike started following you', time: '1 hour ago', read: true },
    { id: 4, type: 'like', message: 'Emma liked your post', time: '3 hours ago', read: true },
  ]);

  const getIcon = (type) => {
    switch(type) {
      case 'like': return Heart;
      case 'comment': return MessageCircle;
      case 'follow': return UserPlus;
      default: return Heart;
    }
  };

  const getIconColor = (type) => {
    switch(type) {
      case 'like': return 'text-bloom';
      case 'comment': return 'text-primary';
      case 'follow': return 'text-accent';
      default: return 'text-primary';
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-20">
        <h1 className="text-2xl font-bold font-display mb-4">Activity</h1>

        <div className="card">
          {notifications.length === 0 ? (
            <p className="text-center text-text-muted py-8">No activity yet</p>
          ) : (
            notifications.map((notification) => {
              const Icon = getIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                >
                  <div className={`p-2 rounded-full ${getIconColor(notification.type)} bg-opacity-10`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-text-muted">{notification.time}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <BottomNav />
    </>
  );
}