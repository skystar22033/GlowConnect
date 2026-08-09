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
// Add these imports
import SaveButton from './SaveButton';
import ShareButton from './ShareButton';
import ReactionPicker from './ReactionPicker';
import Poll from './Poll';

export default function PostCard({ post, onDeleted, onUpdated }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likes?.includes(user?._id));
  const [likesCount, setLikesCount] = useState(post.likesCount ?? post.likes?.length ?? 0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount ?? post.comments?.length ?? 0);
  const [busy, setBusy] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [justLiked, setJustLiked] = useState(false);

  const isOwner = user?._id === post.author?._id;

  const handleLike = async () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((c) => c + (nextLiked ? 1 : -1));
    if (nextLiked) {
      setJustLiked(true);
      setTimeout(() => setJustLiked(false), 450);
    }
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
            <p className="font-display font-semibold leading-tight text-text-primary">{post.author?.fullName}</p>
            <p className="text-xs text-text-faint">
              @{post.author?.username} · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </Link>

        {isOwner && (
          <div className="flex gap-1">
            <button
              onClick={() => onUpdated?.(post)}
              className="rounded-full p-2 text-text-faint transition hover:bg-surface-raised hover:text-primary"
              title="Edit post"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={busy}
              className="rounded-full p-2 text-text-faint transition hover:bg-accent/10 hover:text-accent"
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
          className="mt-4 max-h-[480px] w-full cursor-zoom-in rounded-2xl object-cover transition-transform duration-300 hover:scale-[1.01]"
        />
      )}

      {post.video && (
        <div className="relative w-full aspect-square bg-black rounded-xl overflow-hidden mt-2">
          <video 
            src={post.video} 
            className="w-full h-full object-cover"
            controls
            playsInline
          />
        </div>
      )}

      {/* ✅ FIXED: Moved inside return */}
      <div className="flex items-center gap-4 px-3 py-2">
        <ReactionPicker postId={post._id} onReact={() => {}} />
        <SaveButton postId={post._id} />
        <ShareButton postId={post._id} content={post.content} />
      </div>

      {post.poll && (
        <Poll
          pollId={post.poll._id}
          question={post.poll.question}
          options={post.poll.options}
          totalVotes={post.poll.totalVotes}
        />
      )}

      {lightboxOpen && (
        <ImageLightbox src={post.image} alt="Post attachment" onClose={() => setLightboxOpen(false)} />
      )}

      <div className="mt-4 flex items-center gap-2 border-t border-border-light pt-3 text-sm">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition ${
            liked ? 'bg-accent/10 text-accent' : 'text-text-muted hover:bg-accent/10 hover:text-accent'
          }`}
        >
          <Heart className={`h-4 w-4 ${justLiked ? 'animate-heart-beat' : ''}`} fill={liked ? 'currentColor' : 'none'} />
          {likesCount}
        </button>
        <button
          onClick={() => setCommentsOpen((o) => !o)}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-text-muted transition hover:bg-primary/10 hover:text-primary"
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