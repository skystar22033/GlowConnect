import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Trash2, Pencil } from 'lucide-react';
import { toast } from 'react-toastify';
import Avatar from '../common/Avatar';
import CommentSection from './CommentSection';
import ImageLightbox from './ImageLightbox';
import { postApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

export default function PostCard({ post, onDeleted, onUpdated }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likes?.includes(user?._id));
  const [likesCount, setLikesCount] = useState(post.likesCount ?? post.likes?.length ?? 0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount ?? post.comments?.length ?? 0);
  const [busy, setBusy] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const isOwner = user?._id === post.author?._id;

  const handleLike = async () => {
    // Optimistic update, roll back on failure
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((c) => c + (nextLiked ? 1 : -1));
    try {
      await postApi.toggleLike(post._id);
    } catch (err) {
      setLiked(!nextLiked);
      setLikesCount((c) => c + (nextLiked ? -1 : 1));
      toast.error(err.friendlyMessage || 'Could not update like');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    setBusy(true);
    try {
      await postApi.remove(post._id);
      toast.success('Post deleted');
      onDeleted?.(post._id);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not delete post');
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/profile/${post.author?._id}`} className="flex items-center gap-3">
          <Avatar src={post.author?.profileImage} name={post.author?.fullName} size="md" />
          <div>
            <p className="font-display font-semibold leading-tight">{post.author?.fullName}</p>
            <p className="text-xs text-text-faint">
              @{post.author?.username} · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </Link>

        {isOwner && (
          <div className="flex gap-1">
            <button
              onClick={() => onUpdated?.(post)}
              className="rounded-full p-2 text-text-faint transition hover:bg-surface-raised hover:text-glow"
              title="Edit post"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={busy}
              className="rounded-full p-2 text-text-faint transition hover:bg-surface-raised hover:text-bloom"
              title="Delete post"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <p className="mt-4 whitespace-pre-wrap text-text-primary">{post.content}</p>

      {post.image && (
        <img
          src={post.image}
          alt="Post attachment"
          loading="lazy"
          onClick={() => setLightboxOpen(true)}
          className="mt-4 max-h-[480px] w-full cursor-zoom-in rounded-xl object-cover"
        />
      )}

      {lightboxOpen && (
        <ImageLightbox src={post.image} alt="Post attachment" onClose={() => setLightboxOpen(false)} />
      )}

      <div className="mt-4 flex items-center gap-5 border-t border-border pt-3 text-sm">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 transition ${liked ? 'text-bloom' : 'text-text-muted hover:text-bloom'}`}
        >
          <Heart className="h-4 w-4" fill={liked ? 'currentColor' : 'none'} />
          {likesCount}
        </button>
        <button
          onClick={() => setCommentsOpen((o) => !o)}
          className="flex items-center gap-1.5 text-text-muted transition hover:text-glow"
        >
          <MessageCircle className="h-4 w-4" />
          {commentsCount}
        </button>
      </div>

      {commentsOpen && (
        <CommentSection
          postId={post._id}
          initialComments={post.comments}
          onCommentAdded={() => setCommentsCount((c) => c + 1)}
          onCommentDeleted={() => setCommentsCount((c) => Math.max(0, c - 1))}
        />
      )}
    </article>
  );
}
