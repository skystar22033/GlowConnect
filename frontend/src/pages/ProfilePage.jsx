import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import MainLayout from '../components/layout/MainLayout';
import Avatar from '../components/common/Avatar';
import PostCard from '../components/post/PostCard';
import EmptyState from '../components/common/EmptyState';
import EditProfileModal from '../components/post/EditProfileModal';
import AvatarSelector from '../components/Avatar/AvatarSelector';
import { userApi, postApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { getUserAvatar } from '../utils/avatar';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser, updateLocalUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followBusy, setFollowBusy] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const isOwnProfile = currentUser?._id === id;

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, postsRes] = await Promise.all([
        userApi.getProfile(id),
        postApi.getUserPosts(id, 1, 12),
      ]);
      setProfile(profileRes.data.data.user);
      setPosts(postsRes.data.data.posts);
      setHasMore(postsRes.data.meta.hasMore);
      setPage(1);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not load profile');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const isFollowing = profile?.followers?.some((f) => f._id === currentUser?._id);

  const handleFollowToggle = async () => {
    setFollowBusy(true);
    try {
      await userApi.toggleFollow(id);
      await loadProfile();
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not update follow status');
    } finally {
      setFollowBusy(false);
    }
  };

  const loadMorePosts = async () => {
    const nextPage = page + 1;
    const res = await postApi.getUserPosts(id, nextPage, 12);
    setPosts((prev) => [...prev, ...res.data.data.posts]);
    setHasMore(res.data.meta.hasMore);
    setPage(nextPage);
  };

  // Handle saving avatar preferences
  const handleSaveAvatar = async (preferences) => {
    setAvatarLoading(true);
    try {
      const token = localStorage.getItem('glowconnect_token');
      const response = await fetch('http://localhost:5001/api/users/me/avatar-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatarPreferences: preferences }),
      });

      if (!response.ok) {
        throw new Error('Failed to save avatar');
      }

      const data = await response.json();
      
      // Update local profile
      setProfile((prev) => ({
        ...prev,
        avatarPreferences: preferences,
        profileImage: data.data.user?.profileImage || prev.profileImage,
      }));

      // Update current user context
      if (isOwnProfile && updateLocalUser) {
        updateLocalUser({
          avatarPreferences: preferences,
        });
      }

      toast.success('Avatar updated successfully! 🎨');
      setShowAvatarSelector(false);
    } catch (error) {
      console.error('Error saving avatar:', error);
      toast.error('Failed to save avatar. Please try again.');
    } finally {
      setAvatarLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!profile) return null;

  return (
    <MainLayout onPostCreated={(post) => setPosts((prev) => [post, ...prev])}>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="card relative overflow-hidden p-0">
          <div className="h-24 w-full bg-gradient-brand" />
          <div className="relative flex flex-col items-center gap-4 px-6 pb-6 -mt-12 sm:flex-row sm:items-end sm:px-8">
            {/* Avatar with edit button */}
            <div className="relative">
              <div className="rounded-full bg-white p-1 shadow-glow">
                <Avatar 
                  src={profile.profileImage} 
                  name={profile.fullName} 
                  size="xl"
                  avatarPreferences={profile.avatarPreferences}
                  username={profile.username}
                />
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => setShowAvatarSelector(true)}
                  className="absolute -bottom-1 -right-1 p-1.5 bg-primary rounded-full shadow-glow hover:scale-110 transition-transform"
                  title="Customize Avatar"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </button>
              )}
            </div>

            <div className="flex-1 pt-2 text-center sm:pt-0 sm:text-left">
              <h1 className="font-display text-xl font-bold text-text-primary">{profile.fullName}</h1>
              <p className="text-text-muted">@{profile.username}</p>
              {profile.bio && <p className="mt-2 text-sm text-text-secondary">{profile.bio}</p>}

              <div className="mt-3 flex justify-center gap-5 text-sm sm:justify-start">
                <span>
                  <strong className="font-display text-text-primary">{profile.followersCount}</strong>{' '}
                  <span className="text-text-faint">Followers</span>
                </span>
                <span>
                  <strong className="font-display text-text-primary">{profile.followingCount}</strong>{' '}
                  <span className="text-text-faint">Following</span>
                </span>
              </div>
            </div>

            {isOwnProfile ? (
              <button className="btn-secondary" onClick={() => setEditOpen(true)}>
                Edit profile
              </button>
            ) : (
              <button
                className={isFollowing ? 'btn-secondary' : 'btn-primary'}
                onClick={handleFollowToggle}
                disabled={followBusy}
              >
                {followBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        <h2 className="font-display text-lg font-semibold text-text-primary">Posts</h2>

        {posts.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title={isOwnProfile ? "You haven't posted yet" : 'No posts yet'}
            description={isOwnProfile ? 'Share your first post from the navbar above.' : ''}
          />
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDeleted={(pid) => setPosts((prev) => prev.filter((p) => p._id !== pid))}
              />
            ))}
            {hasMore && (
              <button onClick={loadMorePosts} className="btn-secondary w-full">
                Load more
              </button>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => {
            setProfile((prev) => ({ ...prev, ...updated }));
            updateLocalUser(updated);
            setEditOpen(false);
          }}
        />
      )}

      {/* Avatar Selector Modal */}
      {showAvatarSelector && (
        <AvatarSelector
          user={profile}
          onSave={handleSaveAvatar}
          onClose={() => setShowAvatarSelector(false)}
          loading={avatarLoading}
        />
      )}
    </MainLayout>
  );
}