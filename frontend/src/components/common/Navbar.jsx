import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SoundToggle from '../settings/SoundToggle';
import NotificationBell from '../navigation/NotificationBell';
import { LogOut, Home, Search, PlusSquare, Sparkles, MessageCircle, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLink = (to, Icon, label) => (
    <Link
      to={to}
      title={label}
      className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${
        isActive(to)
          ? 'bg-gradient-brand text-white shadow-glow'
          : 'text-text-muted hover:bg-surface-raised hover:text-primary'
      }`}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={isActive(to) ? 2.4 : 2} />
    </Link>
  );

  return (
    <nav className="navbar">
      <div className="container-custom flex items-center justify-between">
        <Link to="/feed" className="navbar-brand flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow">
            <Sparkles className="h-4 w-4" />
          </span>
          Glow<span>Connect</span>
        </Link>

        <div className="flex items-center gap-1.5 rounded-full bg-white/60 p-1.5 shadow-card ring-1 ring-border-light">
          {navLink('/feed', Home, 'Feed')}
          {navLink('/search', Search, 'Search')}
          {navLink('/feed', PlusSquare, 'Create post')}
          {navLink('/messages', MessageCircle, 'Messages')}
          
          {/* ✅ Profile - Use User Icon with image */}
          <Link
            to={`/profile/${user?._id}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:opacity-80 overflow-hidden"
          >
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.fullName}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full bg-gradient-brand rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            {isActive(`/profile/${user?._id}`) && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
            )}
          </Link>
          
          <NotificationBell />
          <SoundToggle />
          <button
            onClick={handleLogout}
            title="Log out"
            className="flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition-all duration-200 hover:bg-accent/10 hover:text-accent"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </nav>
  );
}