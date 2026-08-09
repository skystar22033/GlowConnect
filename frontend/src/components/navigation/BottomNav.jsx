import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, Heart, User, MessageCircle } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { icon: Home, label: 'Feed', path: '/feed' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: PlusSquare, label: 'Create', path: '/create' },
    { icon: MessageCircle, label: 'Chat', path: '/messages' }, // ✅ NEW
    { icon: Heart, label: 'Activity', path: '/activity' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = path === item.path || path.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all duration-300 ${
                isActive ? 'text-primary' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}