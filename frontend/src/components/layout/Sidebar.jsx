import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <aside className="hidden lg:block lg:w-64 shrink-0">
      <div className="card sticky top-20 p-5">
        <Link to={`/profile/${user._id}`} className="flex items-center gap-3">
          <Avatar src={user.profileImage} name={user.fullName} size="lg" />
          <div className="min-w-0">
            <p className="truncate font-display font-semibold">{user.fullName}</p>
            <p className="truncate text-sm text-text-muted">@{user.username}</p>
          </div>
        </Link>

        {user.bio && <p className="mt-4 text-sm text-text-muted">{user.bio}</p>}

        <div className="mt-4 flex gap-4 border-t border-border pt-4 text-sm">
          <div>
            <p className="font-display font-semibold">{user.followersCount ?? 0}</p>
            <p className="text-text-faint">Followers</p>
          </div>
          <div>
            <p className="font-display font-semibold">{user.followingCount ?? 0}</p>
            <p className="text-text-faint">Following</p>
          </div>
        </div>

        <Link to={`/profile/${user._id}`} className="btn-secondary mt-4 w-full text-sm">
          View profile
        </Link>
      </div>
    </aside>
  );
}
