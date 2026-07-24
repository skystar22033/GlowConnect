import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import MainLayout from '../components/layout/MainLayout';
import Avatar from '../components/common/Avatar';
import EmptyState from '../components/common/EmptyState';
import useDebounce from '../hooks/useDebounce';
import { userApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';

export default function SearchPage() {
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followBusyId, setFollowBusyId] = useState(null);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    userApi
      .search(debouncedQuery.trim())
      .then((res) => setResults(res.data.data.users))
      .catch((err) => toast.error(err.friendlyMessage || 'Search failed'))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const handleFollow = async (targetId) => {
    setFollowBusyId(targetId);
    try {
      const res = await userApi.toggleFollow(targetId);
      const { following } = res.data.data;
      setResults((prev) =>
        prev.map((u) => (u._id === targetId ? { ...u, __following: following } : u))
      );
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not update follow status');
    } finally {
      setFollowBusyId(null);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="font-display text-2xl font-bold">Find people</h1>

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
          <input
            className="input-field pl-10"
            placeholder="Search by name or username…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {loading && (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-glow" />
          </div>
        )}

        {!loading && debouncedQuery && results.length === 0 && (
          <EmptyState title="No matches" description={`Nobody found for "${debouncedQuery}"`} />
        )}

        <ul className="space-y-2">
          {results.map((u) => (
            <li key={u._id} className="card flex items-center justify-between gap-3 p-4">
              <Link to={`/profile/${u._id}`} className="flex min-w-0 items-center gap-3">
                <Avatar src={u.profileImage} name={u.fullName} size="md" />
                <div className="min-w-0">
                  <p className="truncate font-display font-semibold">{u.fullName}</p>
                  <p className="truncate text-sm text-text-faint">@{u.username}</p>
                </div>
              </Link>
              {u._id !== currentUser?._id && (
                <button
                  onClick={() => handleFollow(u._id)}
                  disabled={followBusyId === u._id}
                  className="btn-secondary shrink-0 px-4 py-1.5 text-sm"
                >
                  {u.__following ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </MainLayout>
  );
}
