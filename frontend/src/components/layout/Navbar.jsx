import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Search, PlusSquare, LogOut, Sparkles, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

export default function Navbar({ onCreatePost }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClasses =
    'flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-text-muted transition hover:text-text-primary hover:bg-surface-raised';

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/feed" className="flex items-center gap-2 font-display text-xl font-extrabold">
          <Sparkles className="h-5 w-5 text-glow" />
          <span>
            Glow<span className="text-glow">Connect</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/feed" className={navLinkClasses}>
            <Home className="h-4 w-4" /> Feed
          </Link>
          <Link to="/search" className={navLinkClasses}>
            <Search className="h-4 w-4" /> Search
          </Link>
          <button onClick={onCreatePost} className={navLinkClasses}>
            <PlusSquare className="h-4 w-4" /> Create
          </button>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user && (
            <Link to={`/profile/${user._id}`} className="flex items-center gap-2">
              <Avatar src={user.profileImage} name={user.fullName} size="sm" />
              <span className="text-sm font-medium">{user.username}</span>
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="rounded-full p-2 text-text-muted transition hover:bg-surface-raised hover:text-bloom"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen((o) => !o)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            <Link to="/feed" className={navLinkClasses} onClick={() => setMobileOpen(false)}>
              <Home className="h-4 w-4" /> Feed
            </Link>
            <Link to="/search" className={navLinkClasses} onClick={() => setMobileOpen(false)}>
              <Search className="h-4 w-4" /> Search
            </Link>
            <button
              onClick={() => {
                setMobileOpen(false);
                onCreatePost();
              }}
              className={navLinkClasses}
            >
              <PlusSquare className="h-4 w-4" /> Create post
            </button>
            {user && (
              <Link
                to={`/profile/${user._id}`}
                className={navLinkClasses}
                onClick={() => setMobileOpen(false)}
              >
                <Avatar src={user.profileImage} name={user.fullName} size="sm" /> Profile
              </Link>
            )}
            <button onClick={handleLogout} className={navLinkClasses}>
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
