import { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import MainLayout from '../components/layout/MainLayout';
import PostCard from '../components/post/PostCard';
import PostSkeleton from '../components/post/PostSkeleton';
import EmptyState from '../components/common/EmptyState';
import CreatePostModal from '../components/post/CreatePostModal';
import { postApi } from '../api/endpoints';

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  const loadPage = useCallback(async (pageNum) => {
    const res = await postApi.getFeed(pageNum, 10);
    return { posts: res.data.data.posts, meta: res.data.meta };
  }, []);

  useEffect(() => {
    setLoading(true);
    loadPage(1)
      .then(({ posts: firstPage, meta }) => {
        setPosts(firstPage);
        setHasMore(meta.hasMore);
        setPage(1);
      })
      .catch((err) => toast.error(err.friendlyMessage || 'Could not load feed'))
      .finally(() => setLoading(false));
  }, [loadPage]);

  // Infinite scroll: observe a sentinel div at the bottom of the list
  useEffect(() => {
    if (!hasMore || loading) return;
    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          setLoadingMore(true);
          const nextPage = page + 1;
          loadPage(nextPage)
            .then(({ posts: nextPosts, meta }) => {
              setPosts((prev) => [...prev, ...nextPosts]);
              setHasMore(meta.hasMore);
              setPage(nextPage);
            })
            .catch((err) => toast.error(err.friendlyMessage || 'Could not load more posts'))
            .finally(() => setLoadingMore(false));
        }
      },
      { rootMargin: '200px' }
    );

    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loading, loadingMore, page, loadPage]);

  const handlePostCreated = (newPost) => {
    if (editingPost) {
      setPosts((prev) => prev.map((p) => (p._id === newPost._id ? newPost : p)));
      setEditingPost(null);
    } else {
      setPosts((prev) => [newPost, ...prev]);
    }
  };

  return (
    <MainLayout onPostCreated={handlePostCreated}>
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="font-display text-2xl font-bold">Your feed</h1>

        {loading ? (
          <div className="space-y-4">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Your feed is quiet right now"
            description="Follow people or create your first post to get things glowing."
          />
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDeleted={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
                onUpdated={(post) => setEditingPost(post)}
              />
            ))}
            <div ref={sentinelRef} className="h-4" />
            {loadingMore && <PostSkeleton />}
            {!hasMore && posts.length > 0 && (
              <p className="py-4 text-center text-sm text-text-faint">You're all caught up ✨</p>
            )}
          </>
        )}
      </div>

      {editingPost && (
        <CreatePostModal
          editingPost={editingPost}
          onClose={() => setEditingPost(null)}
          onCreated={handlePostCreated}
        />
      )}
    </MainLayout>
  );
}
