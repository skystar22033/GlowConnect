import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <aside className="hidden lg:block lg:w-72 shrink-0">
      <div className="card sticky top-24 overflow-hidden p-5">
        <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-brand opacity-10 blur-2xl" />

        <Link to={`/profile/${user._id}`} className="relative flex items-center gap-3">
          <Avatar src={user.profileImage} name={user.fullName} size="lg" />
          <div className="min-w-0">
            <p className="truncate font-display font-semibold text-text-primary">{user.fullName}</p>
            <p className="truncate text-sm text-text-muted">@{user.username}</p>
          </div>
        </Link>

        {user.bio && <p className="relative mt-4 text-sm text-text-muted">{user.bio}</p>}

        <div className="relative mt-4 flex gap-6 border-t border-border-light pt-4 text-sm">
          <div>
            <p className="font-display font-bold text-text-primary">{user.followersCount ?? 0}</p>
            <p className="text-text-faint">Followers</p>
          </div>
          <div>
            <p className="font-display font-bold text-text-primary">{user.followingCount ?? 0}</p>
            <p className="text-text-faint">Following</p>
          </div>
        </div>

        <Link to={`/profile/${user._id}`} className="btn-secondary relative mt-4 w-full text-sm">
          View profile
        </Link>
      </div>
    </aside>
  );
}
